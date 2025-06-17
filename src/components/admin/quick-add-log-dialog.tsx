
'use client';

import React from 'react';
import type { Cow } from '@/types/admin';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedLogForm } from './feed-log-form';
import { MilkLogForm } from './milk-log-form';
import { format } from 'date-fns';

interface QuickAddLogDialogProps {
  cow: Cow | null;
  allCows: Cow[]; 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogAdded?: () => void; 
}

export function QuickAddLogDialog({ cow, allCows, open, onOpenChange, onLogAdded }: QuickAddLogDialogProps) {
  if (!cow) return null;

  const handleFormSuccess = () => {
    if (onLogAdded) {
      onLogAdded();
    }
    onOpenChange(false);
  };
  
  const selectedCowArray = [cow];
  const todayDateString = format(new Date(), 'yyyy-MM-dd');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Add Log for {cow.name}</DialogTitle>
          <DialogDescription>
            Quickly add a new feed or milk log for {cow.name}. The cow will be pre-selected. Default date is today.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="feed" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed">Feed Log</TabsTrigger>
            <TabsTrigger value="milk">Milk Log</TabsTrigger>
          </TabsList>
          <TabsContent value="feed" className="pt-4">
            <FeedLogForm
              cow={cow} 
              date={todayDateString} 
              onFormSubmitSuccess={handleFormSuccess}
              // initialLogs can be omitted, FeedLogForm will fetch if needed
            />
          </TabsContent>
          <TabsContent value="milk" className="pt-4">
            <MilkLogForm
              cows={selectedCowArray} 
              milkLog={null} // Explicitly for a new log, form will default date and preselect cow
              onFormSubmitSuccess={handleFormSuccess}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
