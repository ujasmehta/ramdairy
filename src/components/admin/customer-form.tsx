
'use client';

import { useActionState } from 'react';
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addCustomerAction, updateCustomerAction, type CustomerFormState } from '@/app/admin/customers/actions';
import type { Customer } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Link2, MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

interface CustomerFormProps {
  customer?: Customer | null;
  onFormSubmitSuccess: () => void;
}

const initialFormState: CustomerFormState = { message: '', success: false };

export function CustomerForm({ customer, onFormSubmitSuccess }: CustomerFormProps) {
  const formAction = customer ? updateCustomerAction.bind(null, customer.id) : addCustomerAction;
  const [state, dispatch] = useActionState(formAction, initialFormState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedJoinDate, setSelectedJoinDate] = React.useState<Date | undefined>(
    customer?.joinDate ? parseISO(customer.joinDate) : new Date()
  );

  useEffect(() => {
    if (customer?.joinDate) {
      setSelectedJoinDate(parseISO(customer.joinDate));
    } else {
      setSelectedJoinDate(new Date()); 
    }
  }, [customer]);
  
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
        setSelectedJoinDate(new Date()); 
      }
    }
  }, [state, toast, onFormSubmitSuccess]);

  const handleSearchOnMap = () => {
    if (!formRef.current) return;
    const address1Input = formRef.current.elements.namedItem('addressLine1') as HTMLInputElement;
    const address2Input = formRef.current.elements.namedItem('addressLine2') as HTMLInputElement;
    const cityInput = formRef.current.elements.namedItem('city') as HTMLInputElement;
    const stateInput = formRef.current.elements.namedItem('stateOrProvince') as HTMLInputElement;
    const postalCodeInput = formRef.current.elements.namedItem('postalCode') as HTMLInputElement;

    const addressParts = [
      address1Input?.value,
      address2Input?.value,
      cityInput?.value,
      stateInput?.value,
      postalCodeInput?.value,
    ].filter(Boolean).join(', ');

    if (addressParts) {
      const query = encodeURIComponent(addressParts);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    } else {
      toast({
        title: "Address Missing",
        description: "Please enter some address details first to search on map.",
        variant: "default"
      });
    }
  };

  function SubmitButton() {
    return (
      <Button type="submit">
        {customer ? 'Update Customer' : 'Add Customer'}
      </Button>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline">{customer ? 'Edit Customer Details' : 'Add New Customer'}</DialogTitle>
        <DialogDescription>
          {customer ? `Update information for ${customer.name}.` : 'Enter the details for the new customer.'}
        </DialogDescription>
      </DialogHeader>
      <form
        ref={formRef}
        action={dispatch}
        className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2"
      >
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" defaultValue={customer?.name} required />
          {state.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name[0]}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" name="email" type="email" defaultValue={customer?.email} />
                {state.errors?.email && <p className="text-sm text-destructive mt-1">{state.errors.email[0]}</p>}
            </div>
            <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={customer?.phone} required />
                {state.errors?.phone && <p className="text-sm text-destructive mt-1">{state.errors.phone[0]}</p>}
            </div>
        </div>

        <div>
          <Label htmlFor="addressLine1">Address Line 1</Label>
          <Input id="addressLine1" name="addressLine1" defaultValue={customer?.addressLine1} required />
          {state.errors?.addressLine1 && <p className="text-sm text-destructive mt-1">{state.errors.addressLine1[0]}</p>}
        </div>
        <div>
          <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
          <Input id="addressLine2" name="addressLine2" defaultValue={customer?.addressLine2} />
          {state.errors?.addressLine2 && <p className="text-sm text-destructive mt-1">{state.errors.addressLine2[0]}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={customer?.city} required />
                {state.errors?.city && <p className="text-sm text-destructive mt-1">{state.errors.city[0]}</p>}
            </div>
            <div>
                <Label htmlFor="stateOrProvince">State/Province (Optional)</Label>
                <Input id="stateOrProvince" name="stateOrProvince" defaultValue={customer?.stateOrProvince} />
                {state.errors?.stateOrProvince && <p className="text-sm text-destructive mt-1">{state.errors.stateOrProvince[0]}</p>}
            </div>
            <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" name="postalCode" defaultValue={customer?.postalCode} required />
                {state.errors?.postalCode && <p className="text-sm text-destructive mt-1">{state.errors.postalCode[0]}</p>}
            </div>
        </div>
        
        <div>
            <div className="flex justify-between items-center mb-1">
                <Label htmlFor="googleMapsPinLink" className="flex items-center">
                <Link2 className="mr-2 h-4 w-4 text-muted-foreground" /> Google Maps Pin Link (Optional)
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={handleSearchOnMap}>
                    <MapIcon className="mr-2 h-3 w-3" /> Search on Map
                </Button>
            </div>
            <Input id="googleMapsPinLink" name="googleMapsPinLink" type="url" defaultValue={customer?.googleMapsPinLink} placeholder="https://maps.app.goo.gl/..." />
            {state.errors?.googleMapsPinLink && <p className="text-sm text-destructive mt-1">{state.errors.googleMapsPinLink[0]}</p>}
        </div>

        <div>
          <Label htmlFor="joinDate">Join Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !selectedJoinDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedJoinDate ? format(selectedJoinDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedJoinDate}
                onSelect={setSelectedJoinDate}
                initialFocus
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              />
            </PopoverContent>
          </Popover>
          {selectedJoinDate && <input type="hidden" name="joinDate" value={format(selectedJoinDate, 'yyyy-MM-dd')} />}
          {state.errors?.joinDate && <p className="text-sm text-destructive mt-1">{state.errors.joinDate[0]}</p>}
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
