
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, CalendarIcon, UsersIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FeedLogForm } from '@/components/admin/feed-log-form';
import type { Cow, FeedLog } from '@/types/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { getFeedLogsForDayAction } from '@/app/admin/feed/actions';
import { Loader2 } from 'lucide-react';

interface AddFeedLogDialogProps {
  cows: Cow[];
  // If editing, these will be passed to pre-select cow/date
  initialCowId?: string;
  initialDate?: string; // yyyy-MM-dd
  initialLogs?: FeedLog[]; // Pass logs if already fetched
  triggerButtonText?: string;
  triggerButtonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" | null | undefined;
}

export function AddFeedLogDialog({ 
    cows, 
    initialCowId, 
    initialDate, 
    initialLogs: propInitialLogs,
    triggerButtonText = "Add/Edit Daily Feed Log",
    triggerButtonVariant = "default"
}: AddFeedLogDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCowId, setSelectedCowId] = useState<string | undefined>(initialCowId);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate ? parse(initialDate, 'yyyy-MM-dd', new Date()) : new Date()
  );
  const [step, setStep] = useState(initialCowId && initialDate ? 2 : 1); // 1 for selection, 2 for form
  
  const [fetchedInitialLogs, setFetchedInitialLogs] = useState<FeedLog[] | undefined>(propInitialLogs);
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);


  useEffect(() => {
    // If dialog is opened with initialCowId and initialDate, move to step 2
    if (initialCowId && initialDate) {
      setSelectedCowId(initialCowId);
      setSelectedDate(parse(initialDate, 'yyyy-MM-dd', new Date()));
      setStep(2);
      if (propInitialLogs) {
        setFetchedInitialLogs(propInitialLogs);
      }
    } else {
      // Reset if opened without initial props (e.g. "Add New" button)
      setSelectedCowId(undefined);
      setSelectedDate(new Date());
      setStep(1);
      setFetchedInitialLogs(undefined);
    }
  }, [open, initialCowId, initialDate, propInitialLogs]);


  const handleNextStep = async () => {
    if (selectedCowId && selectedDate) {
        if(!propInitialLogs) { // Only fetch if not already provided
            setIsFetchingLogs(true);
            try {
                const logs = await getFeedLogsForDayAction(selectedCowId, format(selectedDate, 'yyyy-MM-dd'));
                setFetchedInitialLogs(logs);
            } catch (error) {
                console.error("Failed to fetch initial logs", error);
                setFetchedInitialLogs([]); // Set to empty array on error to allow form to load
            }
            setIsFetchingLogs(false);
        } else {
           setFetchedInitialLogs(propInitialLogs); // Use provided logs
        }
        setStep(2);
    }
  };

  const handleFormSuccess = () => {
    setOpen(false); // Close dialog on successful submission
    // Reset state for next time dialog is opened for "Add New"
    if (!initialCowId && !initialDate) {
        setSelectedCowId(undefined);
        setSelectedDate(new Date());
        setStep(1);
        setFetchedInitialLogs(undefined);
    }
  };
  
  const selectedCow = cows.find(c => c.id === selectedCowId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) { // Reset on close if it was for "Add New"
            if (!initialCowId && !initialDate) {
                setSelectedCowId(undefined);
                setSelectedDate(new Date());
                setStep(1);
                setFetchedInitialLogs(undefined);
            }
        }
    }}>
      <DialogTrigger asChild>
        <Button variant={triggerButtonVariant || "default"}>
          <PlusCircle className="mr-2 h-4 w-4" /> {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="font-headline">Select Cow and Date</DialogTitle>
              <DialogDescription>
                Choose a cow and the date for which you want to log feed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="cow-selector">Cow</Label>
                <Select value={selectedCowId} onValueChange={setSelectedCowId}>
                  <SelectTrigger id="cow-selector">
                    <SelectValue placeholder="Select a cow" />
                  </SelectTrigger>
                  <SelectContent>
                    {cows.map(cow => (
                      <SelectItem key={cow.id} value={cow.id}>{cow.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date-selector">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-selector"
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
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleNextStep} disabled={!selectedCowId || !selectedDate || isFetchingLogs}>
                {isFetchingLogs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Next
              </Button>
            </DialogFooter>
          </>
        )}
        {step === 2 && selectedCow && selectedDate && (
          <>
            {/* Header is part of FeedLogForm now */}
            <FeedLogForm 
              cow={selectedCow} 
              date={format(selectedDate, 'yyyy-MM-dd')} 
              onFormSubmitSuccess={handleFormSuccess}
              initialLogs={fetchedInitialLogs}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
