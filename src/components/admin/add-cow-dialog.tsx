
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CowForm } from '@/components/admin/cow-form';

export function AddCowDialog() {
  const [open, setOpen] = useState(false);

  const handleFormSuccess = () => {
    setOpen(false); // Close the dialog on successful form submission
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Cow
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <CowForm onFormSubmitSuccess={handleFormSuccess} />
      </DialogContent>
    </Dialog>
  );
}
