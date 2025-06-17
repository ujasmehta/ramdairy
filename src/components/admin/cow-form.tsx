
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
import { addCow, updateCow, type CowFormState } from '@/app/admin/cows/actions';
import type { Cow } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'; 

interface CowFormProps {
  cow?: Cow | null; 
  onFormSubmitSuccess: () => void; 
}

const initialFormState: CowFormState = { message: '', success: false };

export function CowForm({ cow, onFormSubmitSuccess }: CowFormProps) {
  const formAction = cow ? updateCow.bind(null, cow.id) : addCow;
  const [state, dispatch] = useActionState(formAction, initialFormState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedDOB, setSelectedDOB] = React.useState<Date | undefined>(
    cow?.dateOfBirth ? parseISO(cow.dateOfBirth) : undefined
  );

  useEffect(() => {
    if (cow?.dateOfBirth) {
      setSelectedDOB(parseISO(cow.dateOfBirth));
    } else {
      setSelectedDOB(undefined); 
    }
  }, [cow]);

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
        setSelectedDOB(undefined);
      }
    }
  }, [state, toast, onFormSubmitSuccess]);
  
  function SubmitButton() {
    return (
      <Button type="submit" disabled={false}> {/* Consider isPending if you add React Hook Form useFormStatus */}
        {false && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {cow ? 'Update Cow' : 'Add Cow'}
      </Button>
    );
  }


  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline">{cow ? 'Edit Cow Details' : 'Add New Cow'}</DialogTitle>
        <DialogDescription>
          {cow ? `Update the information for ${cow.name}.` : 'Enter the details for the new cow.'}
        </DialogDescription>
      </DialogHeader>
      <form action={dispatch} ref={formRef} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={cow?.name} required />
          {state.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name[0]}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="age">Age (Years)</Label>
                <Input id="age" name="age" type="number" defaultValue={cow?.age} required />
                {state.errors?.age && <p className="text-sm text-destructive mt-1">{state.errors.age[0]}</p>}
            </div>
            <div>
                <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDOB && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDOB ? format(selectedDOB, 'PPP') : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDOB}
                        onSelect={setSelectedDOB}
                        captionLayout="dropdown-buttons"
                        fromYear={1990}
                        toYear={new Date().getFullYear()}
                        initialFocus
                        disabled={(date) => date > new Date()}
                    />
                    </PopoverContent>
                </Popover>
                {selectedDOB && <input type="hidden" name="dateOfBirth" value={format(selectedDOB, 'yyyy-MM-dd')} />}
                {state.errors?.dateOfBirth && <p className="text-sm text-destructive mt-1">{state.errors.dateOfBirth[0]}</p>}
            </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender" defaultValue={cow?.gender} required>
                    <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                    </SelectContent>
                </Select>
                {state.errors?.gender && <p className="text-sm text-destructive mt-1">{state.errors.gender[0]}</p>}
            </div>
            <div>
                <Label htmlFor="breed">Breed</Label>
                <Input id="breed" name="breed" defaultValue={cow?.breed} required />
                {state.errors?.breed && <p className="text-sm text-destructive mt-1">{state.errors.breed[0]}</p>}
            </div>
        </div>


        <div>
          <Label htmlFor="lactation">Lactation Status (Optional)</Label>
          <Input id="lactation" name="lactation" defaultValue={cow?.lactation} placeholder="e.g., Lactating - 2nd, Dry, Heifer" />
          {state.errors?.lactation && <p className="text-sm text-destructive mt-1">{state.errors.lactation[0]}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="mother">Mother Name (Optional)</Label>
                <Input id="mother" name="mother" defaultValue={cow?.mother} placeholder="Mother's name or ID" />
                {state.errors?.mother && <p className="text-sm text-destructive mt-1">{state.errors.mother[0]}</p>}
            </div>
            <div>
                <Label htmlFor="father">Father Name (Optional)</Label>
                <Input id="father" name="father" defaultValue={cow?.father} placeholder="Father's name or ID" />
                {state.errors?.father && <p className="text-sm text-destructive mt-1">{state.errors.father[0]}</p>}
            </div>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={cow?.description} rows={3} required />
          {state.errors?.description && <p className="text-sm text-destructive mt-1">{state.errors.description[0]}</p>}
        </div>
        <div>
          <Label htmlFor="imageUrl">Image URL (Optional)</Label>
          <Input id="imageUrl" name="imageUrl" type="url" defaultValue={cow?.imageUrl} placeholder="https://placehold.co/600x400.png" />
          {state.errors?.imageUrl && <p className="text-sm text-destructive mt-1">{state.errors.imageUrl[0]}</p>}
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
