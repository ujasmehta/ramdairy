
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CustomerForm } from '@/components/admin/customer-form';

export function AddCustomerDialog() {
  const [open, setOpen] = useState(false);

  const handleFormSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <CustomerForm onFormSubmitSuccess={handleFormSuccess} />
      </DialogContent>
    </Dialog>
  );
}
