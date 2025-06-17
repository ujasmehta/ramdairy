
'use client';

import { useActionState } from 'react';
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addMilkLogAction, updateMilkLogAction, type MilkLogFormState } from '@/app/admin/milk/actions';
import type { Cow, MilkLog } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

interface MilkLogFormProps {
  milkLog?: MilkLog | null;
  cows: Cow[];
  onFormSubmitSuccess: () => void;
}

const initialFormState: MilkLogFormState = { message: '', success: false };

export function MilkLogForm({ milkLog, cows, onFormSubmitSuccess }: MilkLogFormProps) {
  const formAction = milkLog ? updateMilkLogAction.bind(null, milkLog.id) : addMilkLogAction;
  const [state, dispatch] = useActionState(formAction, initialFormState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    milkLog?.date ? parseISO(milkLog.date) : new Date()
  );

  useEffect(() => {
    if (milkLog?.date) {
      setSelectedDate(parseISO(milkLog.date));
    } else {
      setSelectedDate(new Date()); 
    }
  }, [milkLog]);
  
  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        onFormSubmitSuccess();
        formRef.current?.reset();
        setSelectedDate(new Date()); 
      }
    }
  }, [state, toast, onFormSubmitSuccess]);

  function SubmitButton() {
    return (
      <Button type="submit">
        {milkLog ? 'Update Milk Log' : 'Add Milk Log'}
      </Button>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline">{milkLog ? 'Edit Milk Log' : 'Add New Milk Log'}</DialogTitle>
        <DialogDescription>
          {milkLog ? `Update milk log details for ${format(selectedDate || new Date(), 'PPP')}.` : 'Enter the details for the new milk log.'}
        </DialogDescription>
      </DialogHeader>
      <form
        ref={formRef}
        action={dispatch}
        className="space-y-4 py-4"
      >
        <div>
          <Label htmlFor="cowId">Cow</Label>
          <Select name="cowId" defaultValue={milkLog?.cowId || (cows.length === 1 ? cows[0].id : undefined)} required>
            <SelectTrigger id="cowId">
              <SelectValue placeholder="Select a cow" />
            </SelectTrigger>
            <SelectContent>
              {cows.map(cow => (
                <SelectItem key={cow.id} value={cow.id}>{cow.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.cowId && <p className="text-sm text-destructive mt-1">{state.errors.cowId[0]}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="date">Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                {selectedDate && <input type="hidden" name="date" value={format(selectedDate, 'yyyy-MM-dd')} />}
                {state.errors?.date && <p className="text-sm text-destructive mt-1">{state.errors.date[0]}</p>}
            </div>
            <div>
                <Label htmlFor="timeOfDay">Time of Day</Label>
                <Select name="timeOfDay" defaultValue={milkLog?.timeOfDay} required>
                    <SelectTrigger id="timeOfDay">
                    <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                    </SelectContent>
                </Select>
                {state.errors?.timeOfDay && <p className="text-sm text-destructive mt-1">{state.errors.timeOfDay[0]}</p>}
            </div>
        </div>
        
        <div>
            <Label htmlFor="quantityLiters">Quantity (Liters)</Label>
            <Input id="quantityLiters" name="quantityLiters" type="number" step="0.1" defaultValue={milkLog?.quantityLiters} required />
            {state.errors?.quantityLiters && <p className="text-sm text-destructive mt-1">{state.errors.quantityLiters[0]}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="fatPercentage">Fat % (Optional)</Label>
                <Input id="fatPercentage" name="fatPercentage" type="number" step="0.1" defaultValue={milkLog?.fatPercentage} placeholder="e.g. 4.2"/>
                {state.errors?.fatPercentage && <p className="text-sm text-destructive mt-1">{state.errors.fatPercentage[0]}</p>}
            </div>
            <div>
                <Label htmlFor="proteinPercentage">Protein % (Optional)</Label>
                <Input id="proteinPercentage" name="proteinPercentage" type="number" step="0.1" defaultValue={milkLog?.proteinPercentage} placeholder="e.g. 3.5"/>
                {state.errors?.proteinPercentage && <p className="text-sm text-destructive mt-1">{state.errors.proteinPercentage[0]}</p>}
            </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea id="notes" name="notes" defaultValue={milkLog?.notes} rows={3} />
          {state.errors?.notes && <p className="text-sm text-destructive mt-1">{state.errors.notes[0]}</p>}
        </div>
        
        {state.errors?._form && <p className="text-sm text-destructive mt-1">{state.errors._form[0]}</p>}
        
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <SubmitButton />
        </DialogFooter>
      </form>
    </>
  );
}
