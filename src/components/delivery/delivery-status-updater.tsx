
'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateDeliveryStatusAction, type DeliveryStatusUpdateFormState } from '@/app/delivery/actions';
import type { OrderStatus } from '@/types/admin';
import { ALL_ORDER_STATUSES } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface DeliveryStatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const initialFormState: DeliveryStatusUpdateFormState = { message: '', success: false };

// Define which statuses the delivery person can typically set
const deliverySettableStatuses: OrderStatus[] = [
    'Out for Delivery',
    'Delivered',
    'Delivery Attempted',
    'Cancelled' // Assuming customer can cancel at door or delivery boy marks as undeliverable
];

export function DeliveryStatusUpdater({ orderId, currentStatus }: DeliveryStatusUpdaterProps) {
  const [state, formAction, isPending] = useActionState(updateDeliveryStatusAction, initialFormState);
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);

  useEffect(() => {
    setSelectedStatus(currentStatus); // Sync with prop if it changes externally
  }, [currentStatus]);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Status Updated' : 'Update Failed',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
        duration: state.success ? 3000 : 5000,
      });
      if (state.success && state.order) {
         setSelectedStatus(state.order.status); // Update local state with confirmed status
      }
    }
  }, [state, toast]);

  const handleSubmit = () => {
    if (selectedStatus === currentStatus) {
        toast({ title: "No Change", description: "Status is already " + currentStatus, variant: "default", duration: 2000});
        return;
    }
    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('status', selectedStatus);
    formAction(formData);
  };

  const availableStatuses = ALL_ORDER_STATUSES.filter(status => 
    deliverySettableStatuses.includes(status) || status === currentStatus
  );


  // If status is 'Delivered' or 'Cancelled', it's generally a final state for delivery person
  const isFinalStatus = currentStatus === 'Delivered' || currentStatus === 'Cancelled';

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 w-full">
        <Select 
            value={selectedStatus} 
            onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
            disabled={isPending || isFinalStatus}
        >
          <SelectTrigger className="flex-grow">
            <SelectValue placeholder="Update status..." />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map(status => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
            onClick={handleSubmit} 
            disabled={isPending || selectedStatus === currentStatus || isFinalStatus}
            className="shrink-0"
            size="sm"
        >
          {isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-1.5 h-4 w-4" />
          )}
          Update
        </Button>
      </div>
      {state.errors?._form && (
        <p className="text-xs text-destructive flex items-center mt-1">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {state.errors._form[0]}
        </p>
      )}
    </div>
  );
}
