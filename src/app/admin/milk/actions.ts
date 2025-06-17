
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
    addMilkLog as dbAddMilkLog, 
    updateMilkLog as dbUpdateMilkLog, 
    deleteMilkLog as dbDeleteMilkLog,
    getMilkLogById as dbGetMilkLogById
} from '@/lib/admin-db';
import type { MilkLog } from '@/types/admin';
import { format } from 'date-fns';

const milkLogSchema = z.object({
  cowId: z.string().min(1, { message: 'Cow selection is required.' }),
  date: z.date({ required_error: 'Date is required.' }).transform(date => format(date, 'yyyy-MM-dd')),
  timeOfDay: z.enum(['Morning', 'Evening'], { required_error: 'Time of day is required.' }),
  quantityLiters: z.coerce.number().min(0.1, { message: 'Quantity must be a positive number.' }).max(50, {message: 'Quantity seems too high for a single milking.'}),
  fatPercentage: z.coerce.number().min(0).max(15).optional().or(z.literal('')), // Optional, allow empty string
  proteinPercentage: z.coerce.number().min(0).max(10).optional().or(z.literal('')), // Optional, allow empty string
  notes: z.string().max(500, { message: 'Notes too long.' }).optional().or(z.literal('')),
});

export type MilkLogFormState = {
  message: string;
  errors?: {
    cowId?: string[];
    date?: string[];
    timeOfDay?: string[];
    quantityLiters?: string[];
    fatPercentage?: string[];
    proteinPercentage?: string[];
    notes?: string[];
    _form?: string[];
  };
  success: boolean;
  milkLog?: MilkLog;
};

// Helper to convert empty strings to undefined for optional number fields
const preprocessOptionalNumber = (val: FormDataEntryValue | null | undefined): number | undefined => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
};


export async function addMilkLogAction(prevState: MilkLogFormState, formData: FormData): Promise<MilkLogFormState> {
  const validatedFields = milkLogSchema.safeParse({
    cowId: formData.get('cowId'),
    date: formData.get('date') ? new Date(formData.get('date') as string) : undefined,
    timeOfDay: formData.get('timeOfDay'),
    quantityLiters: formData.get('quantityLiters'),
    fatPercentage: preprocessOptionalNumber(formData.get('fatPercentage')),
    proteinPercentage: preprocessOptionalNumber(formData.get('proteinPercentage')),
    notes: formData.get('notes') || undefined,
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    // Construct data, ensuring optional fields are correctly handled
    const dataToSave = {
        ...validatedFields.data,
        fatPercentage: validatedFields.data.fatPercentage === '' ? undefined : validatedFields.data.fatPercentage,
        proteinPercentage: validatedFields.data.proteinPercentage === '' ? undefined : validatedFields.data.proteinPercentage,
    };

    const newMilkLog = await dbAddMilkLog(dataToSave);
    revalidatePath('/admin/milk');
    return { message: `Milk log for ${newMilkLog.date} (${newMilkLog.timeOfDay}) added successfully.`, success: true, milkLog: newMilkLog };
  } catch (error) {
    console.error('Failed to add milk log:', error);
    return { message: 'Database error: Failed to add milk log.', success: false, errors: { _form: ['An unexpected error occurred.'] } };
  }
}

export async function updateMilkLogAction(id: string, prevState: MilkLogFormState, formData: FormData): Promise<MilkLogFormState> {
  if (!id) {
    return { message: 'Milk log ID is missing.', success: false, errors: { _form: ['Milk log ID is required for an update.'] } };
  }
  
  const validatedFields = milkLogSchema.safeParse({
    cowId: formData.get('cowId'),
    date: formData.get('date') ? new Date(formData.get('date') as string) : undefined,
    timeOfDay: formData.get('timeOfDay'),
    quantityLiters: formData.get('quantityLiters'),
    fatPercentage: preprocessOptionalNumber(formData.get('fatPercentage')),
    proteinPercentage: preprocessOptionalNumber(formData.get('proteinPercentage')),
    notes: formData.get('notes') || undefined,
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const dataToSave = {
        ...validatedFields.data,
        fatPercentage: validatedFields.data.fatPercentage === '' ? undefined : validatedFields.data.fatPercentage,
        proteinPercentage: validatedFields.data.proteinPercentage === '' ? undefined : validatedFields.data.proteinPercentage,
    };
    const updatedMilkLog = await dbUpdateMilkLog(id, dataToSave);
    if (!updatedMilkLog) {
      return { message: `Milk log with ID ${id} not found.`, success: false, errors: { _form: ['Milk log not found.'] } };
    }
    revalidatePath('/admin/milk');
    return { message: `Milk log for ${updatedMilkLog.date} (${updatedMilkLog.timeOfDay}) updated successfully.`, success: true, milkLog: updatedMilkLog };
  } catch (error) {
    console.error('Failed to update milk log:', error);
    return { message: 'Database error: Failed to update milk log.', success: false, errors: { _form: ['An unexpected error occurred.'] } };
  }
}

export async function deleteMilkLogAction(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) {
    return { success: false, message: 'Milk log ID is missing.' };
  }
  try {
    const success = await dbDeleteMilkLog(id);
    if (success) {
      revalidatePath('/admin/milk');
      return { success: true, message: 'Milk log deleted successfully.' };
    }
    return { success: false, message: 'Failed to delete milk log. Log not found.' };
  } catch (error) {
    console.error('Failed to delete milk log:', error);
    return { success: false, message: 'Database error: Failed to delete milk log.' };
  }
}

export async function getMilkLogByIdAction(id: string): Promise<MilkLog | null> {
    try {
        const milkLog = await dbGetMilkLogById(id);
        return milkLog || null;
    } catch (error) {
        console.error('Failed to fetch milk log:', error);
        return null;
    }
}
