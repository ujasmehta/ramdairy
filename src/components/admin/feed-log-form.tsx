
'use client';

import { useActionState } from 'react';
import React, { useEffect, useRef, useState, startTransition } from 'react'; // Added startTransition
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { saveDailyFeedLogsAction, type DailyFeedLogFormState, getFeedLogsForDayAction } from '@/app/admin/feed/actions';
import type { Cow, FoodName, FeedLog, FoodItem, FoodCategory } from '@/types/admin';
import { ALL_FOOD_ITEMS, PREDEFINED_FOOD_NAMES } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const feedLogItemClientSchema = z.object({
  foodName: z.enum(PREDEFINED_FOOD_NAMES),
  quantityKg: z.coerce.number().min(0, "Min 0").max(100, "Max 100"),
});

const dailyFeedLogClientSchema = z.object({
  items: z.array(feedLogItemClientSchema),
  notes: z.string().max(500, "Notes too long").optional().or(z.literal('')),
});

type DailyFeedLogFormValues = z.infer<typeof dailyFeedLogClientSchema>;

interface DailyFeedLogFormProps {
  cow: Cow;
  date: string; // ISO yyyy-MM-dd
  onFormSubmitSuccess?: () => void; 
  initialLogs?: FeedLog[]; 
}

const initialServerFormState: DailyFeedLogFormState = { message: '', success: false };

export function FeedLogForm({ cow, date, onFormSubmitSuccess, initialLogs: propInitialLogs }: DailyFeedLogFormProps) {
  const [serverState, formAction] = useActionState(saveDailyFeedLogsAction, initialServerFormState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLoadingLogs, setIsLoadingLogs] = useState(!propInitialLogs);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const defaultValues: DailyFeedLogFormValues = {
    items: ALL_FOOD_ITEMS.map(item => ({
      foodName: item.name as FoodName,
      quantityKg: 0,
    })),
    notes: '',
  };
  
  const form = useForm<DailyFeedLogFormValues>({
    resolver: zodResolver(dailyFeedLogClientSchema),
    defaultValues,
  });

  const { fields } = useFieldArray({ // Removed 'update' as it's not directly used for quantity inputs
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    async function loadLogs() {
      if (propInitialLogs) {
        const notesSet = new Set<string>();
        const updatedItems = ALL_FOOD_ITEMS.map(foodItem => {
          const log = propInitialLogs.find(l => l.foodName === foodItem.name);
          if (log?.notes) notesSet.add(log.notes);
          return {
            foodName: foodItem.name as FoodName,
            quantityKg: log?.quantityKg || 0,
          };
        });
        form.reset({ items: updatedItems, notes: notesSet.values().next().value || '' });
        setIsLoadingLogs(false);
        return;
      }

      setIsLoadingLogs(true);
      setFetchError(null);
      try {
        const logs = await getFeedLogsForDayAction(cow.id, date);
        const notesSet = new Set<string>();
        const updatedItems = ALL_FOOD_ITEMS.map(foodItem => {
          const log = logs.find(l => l.foodName === foodItem.name);
          if (log?.notes) notesSet.add(log.notes);
          return {
            foodName: foodItem.name as FoodName,
            quantityKg: log?.quantityKg || 0,
          };
        });
        form.reset({ items: updatedItems, notes: notesSet.values().next().value || '' });
      } catch (e) {
        console.error("Error fetching logs for form:", e);
        setFetchError("Failed to load existing feed data for this day.");
      } finally {
        setIsLoadingLogs(false);
      }
    }
    if (cow?.id && date) {
      loadLogs();
    }
  }, [cow, date, form, propInitialLogs]);

  useEffect(() => {
    if (serverState.message || serverState.errors) { // Action completed
      setIsSubmitting(false); // Re-enable button
      toast({
        title: serverState.success ? 'Success!' : 'Error',
        description: serverState.message,
        variant: serverState.success ? 'default' : 'destructive',
      });
      if (serverState.success && onFormSubmitSuccess) {
        onFormSubmitSuccess();
        // Optionally reset form or trigger data reload if dialog doesn't close
      }
    }
  }, [serverState, toast, onFormSubmitSuccess]);

  const onSubmit = (data: DailyFeedLogFormValues) => {
    setIsSubmitting(true); // Disable button immediately
    const formData = new FormData();
    formData.append('cowId', cow.id);
    formData.append('date', date);
    data.items.forEach((item, index) => {
      formData.append(`items[${index}].foodName`, item.foodName);
      formData.append(`items[${index}].quantityKg`, item.quantityKg.toString());
    });
    formData.append('notes', data.notes || '');
    
    startTransition(() => {
      // @ts-ignore
      formAction(formData); // This will eventually trigger the useEffect to set isSubmitting false
    });
  };

  if (isLoadingLogs) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading feed data...</div>;
  }

  if (fetchError) {
    return <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-start"><AlertTriangle className="h-5 w-5 mr-2 shrink-0 mt-0.5" /> {fetchError}</div>;
  }

  const foodItemsByCategory = ALL_FOOD_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<FoodCategory, FoodItem[]>);

  return (
    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Daily Feed Log for {cow.name}</CardTitle>
          <CardDescription>Date: {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Enter quantities in Kg.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {(Object.keys(foodItemsByCategory) as FoodCategory[]).map(category => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold text-primary mb-2 sticky top-0 bg-background/90 py-1">{category}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Food Item</TableHead>
                    <TableHead className="w-[120px] text-right">Quantity (Kg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foodItemsByCategory[category].map(foodItem => {
                    const fieldIndex = fields.findIndex(f => f.foodName === foodItem.name);
                    if (fieldIndex === -1) return null; 
                    return (
                      <TableRow key={foodItem.name}>
                        <TableCell>
                          <Label htmlFor={`items.${fieldIndex}.quantityKg`}>{foodItem.name}</Label>
                        </TableCell>
                        <TableCell className="text-right">
                          <Controller
                            name={`items.${fieldIndex}.quantityKg`}
                            control={form.control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id={`items.${fieldIndex}.quantityKg`}
                                type="number"
                                step="0.1"
                                className="w-24 text-right"
                                placeholder="0.0"
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                          {form.formState.errors.items?.[fieldIndex]?.quantityKg && (
                            <p className="text-xs text-destructive mt-1 text-left">{form.formState.errors.items?.[fieldIndex]?.quantityKg?.message}</p>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div>
        <Label htmlFor="notes">Daily Notes (Optional)</Label>
        <Textarea
          id="notes"
          {...form.register('notes')}
          rows={3}
          placeholder="General notes for this day's feeding..."
        />
        {form.formState.errors.notes && <p className="text-sm text-destructive mt-1">{form.formState.errors.notes.message}</p>}
      </div>

      {serverState.errors?._form && <p className="text-sm text-destructive mt-1">{serverState.errors._form[0]}</p>}
      
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting || isLoadingLogs}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Daily Feed
        </Button>
      </div>
    </form>
  );
}
