
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { OrderForm } from '@/components/admin/order-form';
import type { Customer, Product } from '@/types/admin';

interface AddOrderDialogProps {
  customers: Customer[];
  products: Product[];
  initialCustomerId?: string; // To pre-select customer
  open?: boolean; // To control dialog from parent
  onOpenChange?: (open: boolean) => void; // To control dialog from parent
}

export function AddOrderDialog({ customers, products, initialCustomerId, open: parentOpen, onOpenChange: parentOnOpenChange }: AddOrderDialogProps) {
  // If `open` and `onOpenChange` are provided, use them (controlled mode).
  // Otherwise, use internal state (uncontrolled mode).
  const [internalOpen, setInternalOpen] = useState(false);
  const open = parentOpen !== undefined ? parentOpen : internalOpen;
  const setOpen = parentOnOpenChange !== undefined ? parentOnOpenChange : setInternalOpen;


  const handleFormSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!parentOpen && ( // Only show trigger if not in controlled mode
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Order
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <OrderForm 
          customers={customers} 
          products={products} 
          initialCustomerId={initialCustomerId} // Pass it down
          onFormSubmitSuccess={handleFormSuccess} 
        />
      </DialogContent>
    </Dialog>
  );
}
