
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
    saveDailyFeedLogs as dbSaveDailyFeedLogs,
    deleteFeedLogsForDay as dbDeleteFeedLogsForDay,
    getFeedLogsByCowAndDate as dbGetFeedLogsByCowAndDate 
} from '@/lib/admin-db';
import type { FeedLog, FoodName } from '@/types/admin';
import { PREDEFINED_FOOD_NAMES } from '@/types/admin';
import { format } from 'date-fns';

const feedLogItemSchema = z.object({
  foodName: z.enum(PREDEFINED_FOOD_NAMES),
  quantityKg: z.coerce.number().min(0, { message: 'Quantity must be a non-negative number.' }).max(100, {message: 'Quantity seems too high.'}),
});

const dailyFeedLogSchema = z.object({
  cowId: z.string().min(1, { message: 'Cow selection is required.' }),
  date: z.date({ required_error: 'Date is required.' }).transform(date => format(date, 'yyyy-MM-dd')),
  items: z.array(feedLogItemSchema),
  notes: z.string().max(500, { message: 'Notes too long.' }).optional().or(z.literal('')),
});

export type DailyFeedLogFormState = {
  message: string;
  errors?: {
    cowId?: string[];
    date?: string[];
    items?: string; // For general item array errors
    'items.index.foodName'?: string[];
    'items.index.quantityKg'?: string[];
    notes?: string[];
    _form?: string[];
  };
  success: boolean;
  // feedLogs?: FeedLog[]; // Perhaps return the saved logs
};

export async function saveDailyFeedLogsAction(prevState: DailyFeedLogFormState, formData: FormData): Promise<DailyFeedLogFormState> {
  const items: { foodName: FoodName; quantityKg: number }[] = [];
  let i = 0;
  while (formData.has(`items[${i}].foodName`)) {
    items.push({
      foodName: formData.get(`items[${i}].foodName`) as FoodName,
      quantityKg: parseFloat(formData.get(`items[${i}].quantityKg`) as string),
    });
    i++;
  }
  
  const validatedFields = dailyFeedLogSchema.safeParse({
    cowId: formData.get('cowId'),
    date: formData.get('date') ? new Date(formData.get('date') as string) : undefined,
    items: items,
    notes: formData.get('notes') || undefined,
  });

  if (!validatedFields.success) {
    // console.log("Validation errors:", validatedFields.error.flatten().fieldErrors);
    return {
      message: 'Validation failed. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors as DailyFeedLogFormState['errors'],
      success: false,
    };
  }

  const { cowId, date, items: validatedItems, notes } = validatedFields.data;

  try {
    await dbSaveDailyFeedLogs(cowId, date, validatedItems.filter(item => item.quantityKg > 0), notes);
    revalidatePath('/admin/feed');
    revalidatePath(`/admin/feed?cowId=${cowId}&date=${date}`); // Revalidate specific query
    return { message: `Feed logs for ${date} saved successfully.`, success: true };
  } catch (error) {
    console.error('Failed to save daily feed logs:', error);
    return { message: 'Database error: Failed to save daily feed logs.', success: false, errors: { _form: ['An unexpected error occurred.'] } };
  }
}

export async function deleteFeedLogsForDayAction(cowId: string, date: string): Promise<{ success: boolean; message: string }> {
  if (!cowId || !date) {
    return { success: false, message: 'Cow ID and Date are required.' };
  }
  try {
    const success = await dbDeleteFeedLogsForDay(cowId, date);
    if (success) {
      revalidatePath('/admin/feed');
      revalidatePath(`/admin/feed?cowId=${cowId}&date=${date}`);
      return { success: true, message: 'Feed logs for the day deleted successfully.' };
    }
    return { success: false, message: 'No feed logs found for the specified cow and date to delete.' };
  } catch (error) {
    console.error('Failed to delete feed logs for day:', error);
    return { success: false, message: 'Database error: Failed to delete feed logs.' };
  }
}

// Action to get logs for the form pre-fill
export async function getFeedLogsForDayAction(cowId: string, date: string): Promise<FeedLog[]> {
    if (!cowId || !date) return [];
    try {
        return await dbGetFeedLogsByCowAndDate(cowId, date);
    } catch (error) {
        console.error('Failed to fetch feed logs for day:', error);
        return [];
    }
}
