
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MilkLogForm } from '@/components/admin/milk-log-form';
import type { Cow } from '@/types/admin';

interface AddMilkLogDialogProps {
  cows: Cow[];
}

export function AddMilkLogDialog({ cows }: AddMilkLogDialogProps) {
  const [open, setOpen] = useState(false);

  const handleFormSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Milk Log
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <MilkLogForm cows={cows} onFormSubmitSuccess={handleFormSuccess} />
      </DialogContent>
    </Dialog>
  );
}
