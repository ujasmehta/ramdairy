
'use client';

import { useActionState } from 'react';
import React, { useEffect, useRef, useState, startTransition, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addOrderAction, updateOrderAction, type OrderFormState } from '@/app/admin/orders/actions.ts';
import type { Order, OrderItem, Customer, Product, OrderStatus } from '@/types/admin';
import { ALL_ORDER_STATUSES } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const orderItemSchemaClient = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Min 1"), // This is per-day quantity
  unitPrice: z.number().optional(),
  productName: z.string().optional(),
});

const orderFormSchemaClient = z.object({
  customerId: z.string().min(1, "Customer is required"),
  orderDate: z.date({ required_error: "Order date is required." }),
  deliveryDateScheduledRange: z.object({
    from: z.date({required_error: "Delivery start date is required."}),
    to: z.date({required_error: "Delivery end date is required."}),
  }).refine(data => data.to >= data.from, {
    message: "End date cannot be before start date.",
    path: ["to"],
  }),
  items: z.array(orderItemSchemaClient).min(1, "At least one item is required."),
  deliveryCharge: z.coerce.number().min(0).optional().default(0),
  discount: z.coerce.number().min(0).optional().default(0),
  status: z.enum(ALL_ORDER_STATUSES as [OrderStatus, ...OrderStatus[]]),
  paymentStatus: z.enum(['Pending', 'Paid', 'Failed']),
  notes: z.string().max(500).optional().or(z.literal('')),
});

type OrderFormValues = z.infer<typeof orderFormSchemaClient>;

interface OrderFormProps {
  order?: Order | null;
  initialCustomerId?: string;
  customers: Customer[];
  products: Product[];
  onFormSubmitSuccess: () => void;
}

const initialServerFormState: OrderFormState = { message: '', success: false };

const createInitialNewOrderValues = (customerId?: string): Omit<OrderFormValues, 'customerId'> & { customerId: string | undefined } => ({
    customerId: customerId,
    orderDate: new Date(),
    deliveryDateScheduledRange: {
        from: new Date(new Date().setDate(new Date().getDate() + 1)), // Default to tomorrow
        to: new Date(new Date().setDate(new Date().getDate() + 2))    // Default to day after tomorrow
    },
    items: [{ productId: '', quantity: 1, unitPrice:0, productName:'' }],
    deliveryCharge: 0,
    discount: 0,
    status: 'Pending' as const,
    paymentStatus: 'Pending' as const,
    notes: '',
});


export function OrderForm({ order, initialCustomerId, customers, products, onFormSubmitSuccess }: OrderFormProps) {
  const serverAction = order ? updateOrderAction.bind(null, order.id) : addOrderAction;
  const [state, dispatch] = useActionState(serverAction, initialServerFormState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const memoizedDefaultValues = useMemo(() => {
    if (order) {
      return {
        customerId: order.customerId,
        orderDate: parseISO(order.orderDate),
        deliveryDateScheduledRange: {
            from: parseISO(order.deliveryDateScheduledStart),
            to: parseISO(order.deliveryDateScheduledEnd)
        },
        items: order.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity, // This is per-day quantity from DB
          unitPrice: item.unitPrice,
          productName: item.productName,
        })),
        deliveryCharge: order.deliveryCharge,
        discount: order.discount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        notes: order.notes || '',
      };
    }
    return createInitialNewOrderValues(initialCustomerId);
  }, [order, initialCustomerId]);


  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchemaClient),
    defaultValues: memoizedDefaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch('items');
  const watchedDeliveryCharge = form.watch('deliveryCharge');
  const watchedDiscount = form.watch('discount');
  const watchedDeliveryRange = form.watch('deliveryDateScheduledRange');

  const [subTotal, setSubTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(1);

  useEffect(() => {
    let days = 1;
    if (watchedDeliveryRange?.from && watchedDeliveryRange?.to) {
      days = differenceInCalendarDays(watchedDeliveryRange.to, watchedDeliveryRange.from) + 1;
    }
    setNumberOfDays(days < 1 ? 1 : days); 

    let currentSubTotal = 0;
    watchedItems.forEach((item) => {
      const product = products.find(p => p.id === item.productId);
      const unitPrice = product?.pricePerUnit || 0;
      currentSubTotal += (item.quantity || 0) * unitPrice;
    });
    
    const periodSubTotal = currentSubTotal * (days < 1 ? 1 : days);
    setSubTotal(periodSubTotal);

    const deliveryChargeValue = typeof watchedDeliveryCharge === 'number' ? watchedDeliveryCharge : 0;
    const discountValue = typeof watchedDiscount === 'number' ? watchedDiscount : 0;
    
    setGrandTotal(periodSubTotal + deliveryChargeValue - discountValue);

  }, [watchedItems, products, watchedDeliveryCharge, watchedDiscount, watchedDeliveryRange]);


  useEffect(() => {
    if (state.message || state.errors) {
      setIsSubmitting(false);
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        onFormSubmitSuccess();
        form.reset(createInitialNewOrderValues(initialCustomerId)); 
      }
    }
  }, [state, toast, onFormSubmitSuccess, form, initialCustomerId]);
  
  useEffect(() => {
     form.reset(memoizedDefaultValues);
  }, [initialCustomerId, order, form, memoizedDefaultValues]);


  const onSubmit = (data: OrderFormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('customerId', data.customerId);
    formData.append('orderDate', format(data.orderDate, 'yyyy-MM-dd'));
    if (data.deliveryDateScheduledRange.from) {
        formData.append('deliveryDateScheduledStart', format(data.deliveryDateScheduledRange.from, 'yyyy-MM-dd'));
    }
    if (data.deliveryDateScheduledRange.to) {
        formData.append('deliveryDateScheduledEnd', format(data.deliveryDateScheduledRange.to, 'yyyy-MM-dd'));
    }
    data.items.forEach((item, index) => {
      formData.append(`items[${index}].productId`, item.productId);
      formData.append(`items[${index}].quantity`, item.quantity.toString()); // per-day quantity
    });
    formData.append('deliveryCharge', (data.deliveryCharge ?? 0).toString());
    formData.append('discount', (data.discount ?? 0).toString());
    formData.append('status', data.status);
    formData.append('paymentStatus', data.paymentStatus);
    formData.append('notes', data.notes || '');

    startTransition(() => {
      // @ts-ignore
      dispatch(formData);
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline">{order ? `Edit Order #${order.orderNumber}` : 'Add New Order'}</DialogTitle>
        <DialogDescription>
          {order ? 'Update the details for this order.' : 'Enter the details for the new order.'}
        </DialogDescription>
      </DialogHeader>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[80vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="customerId"
            control={form.control}
            render={({ field }) => (
              <FormItem error={form.formState.errors.customerId}>
                <Label>Customer</Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {form.formState.errors.customerId && <p className="text-sm text-destructive mt-1">{form.formState.errors.customerId.message}</p>}
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="orderDate"
            control={form.control}
            render={({ field }) => (
              <FormItem error={form.formState.errors.orderDate}>
                <Label>Order Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                </Popover>
                {form.formState.errors.orderDate && <p className="text-sm text-destructive mt-1">{form.formState.errors.orderDate.message}</p>}
              </FormItem>
            )}
          />
          <Controller
            name="deliveryDateScheduledRange"
            control={form.control}
            render={({ field }) => (
              <FormItem error={form.formState.errors.deliveryDateScheduledRange?.from || form.formState.errors.deliveryDateScheduledRange?.to || form.formState.errors.deliveryDateScheduledRange?.message as any }>
                <Label>Scheduled Delivery ({numberOfDays} day{numberOfDays > 1 ? 's' : ''})</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value?.from && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value?.from ? (
                        field.value.to ? (
                          `${format(field.value.from, 'LLL dd, y')} - ${format(field.value.to, 'LLL dd, y')}`
                        ) : (
                          format(field.value.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={field.value}
                      onSelect={field.onChange as (range: DateRange | undefined) => void}
                      initialFocus
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                 {form.formState.errors.deliveryDateScheduledRange?.from && <p className="text-sm text-destructive mt-1">{form.formState.errors.deliveryDateScheduledRange.from.message}</p>}
                 {form.formState.errors.deliveryDateScheduledRange?.to && !form.formState.errors.deliveryDateScheduledRange?.from && <p className="text-sm text-destructive mt-1">{form.formState.errors.deliveryDateScheduledRange.to.message}</p>}
                 {form.formState.errors.deliveryDateScheduledRange && typeof form.formState.errors.deliveryDateScheduledRange === 'object' && 'message' in form.formState.errors.deliveryDateScheduledRange && <p className="text-sm text-destructive mt-1">{form.formState.errors.deliveryDateScheduledRange.message}</p>}
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-xl font-headline">Order Items</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => {
              const selectedProduct = products.find(p => p.id === watchedItems[index]?.productId);
              const itemPerDayQuantity = watchedItems[index]?.quantity || 0;
              const itemUnitPrice = selectedProduct?.pricePerUnit || 0;
              const itemTotalForPeriod = itemPerDayQuantity * itemUnitPrice * numberOfDays;
              return (
                <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] items-end gap-2 p-3 border rounded-md">
                  <Controller
                    name={`items.${index}.productId`}
                    control={form.control}
                    render={({ field: controllerField }) => (
                      <FormItem error={form.formState.errors.items?.[index]?.productId} className="sm:col-span-1">
                        <Label className="text-xs">Product</Label>
                         <Select
                            onValueChange={(value) => {
                                controllerField.onChange(value);
                                const product = products.find(p => p.id === value);
                                form.setValue(`items.${index}.unitPrice`, product?.pricePerUnit || 0);
                                form.setValue(`items.${index}.productName`, product?.name || '');
                            }}
                            value={controllerField.value}
                        >
                          <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                          <SelectContent>
                            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (${p.pricePerUnit}/{p.unit})</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.items?.[index]?.productId && <p className="text-sm text-destructive mt-1">{form.formState.errors.items?.[index]?.productId?.message}</p>}
                      </FormItem>
                    )}
                  />
                   <Controller
                    name={`items.${index}.quantity`}
                    control={form.control}
                    render={({ field: controllerField }) => (
                      <FormItem error={form.formState.errors.items?.[index]?.quantity} className="sm:col-span-1">
                        <Label className="text-xs">Qty (per day)</Label>
                        <Input type="number" {...controllerField} className="w-full sm:w-20" placeholder="Qty" min="1"/>
                        {form.formState.errors.items?.[index]?.quantity && <p className="text-sm text-destructive mt-1">{form.formState.errors.items?.[index]?.quantity?.message}</p>}
                      </FormItem>
                    )}
                  />
                  <div className="text-sm sm:col-span-1">
                    <Label className="text-xs">Total Price ({numberOfDays} day{numberOfDays > 1 ? 's' : ''})</Label>
                    <p className="font-medium">${itemTotalForPeriod.toFixed(2)}</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => fields.length > 1 && remove(index)} className="text-destructive hover:text-destructive/80 sm:col-span-1" disabled={fields.length <= 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, unitPrice:0, productName:'' })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
            {form.formState.errors.items && typeof form.formState.errors.items === 'object' && !Array.isArray(form.formState.errors.items) && 'message' in form.formState.errors.items && <p className="text-sm text-destructive mt-1">{(form.formState.errors.items as any).message}</p>}
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="text-xl font-headline">Summary & Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormItem>
                        <Label>Subtotal (for {numberOfDays} day{numberOfDays > 1 ? 's' : ''})</Label>
                        <Input value={`$${subTotal.toFixed(2)}`} readOnly className="font-semibold" />
                    </FormItem>
                    <Controller name="deliveryCharge" control={form.control} render={({ field }) => (
                        <FormItem error={form.formState.errors.deliveryCharge}><Label>Delivery Charge (Per Order)</Label><Input type="number" step="0.01" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        {form.formState.errors.deliveryCharge && <p className="text-sm text-destructive mt-1">{form.formState.errors.deliveryCharge.message}</p>}
                        </FormItem>
                    )} />
                    <Controller name="discount" control={form.control} render={({ field }) => (
                        <FormItem error={form.formState.errors.discount}><Label>Discount (Per Order)</Label><Input type="number" step="0.01" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)}/>
                        {form.formState.errors.discount && <p className="text-sm text-destructive mt-1">{form.formState.errors.discount.message}</p>}
                        </FormItem>
                    )} />
                </div>
                 <FormItem>
                    <Label>Grand Total (for {numberOfDays} day{numberOfDays > 1 ? 's' : ''})</Label>
                    <Input value={`$${grandTotal.toFixed(2)}`} readOnly className="font-bold text-lg" />
                </FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller name="status" control={form.control} render={({ field }) => (
                        <FormItem error={form.formState.errors.status}><Label>Order Status</Label>
                        <Select onValueChange={field.onChange} value={field.value} >
                            <SelectTrigger><SelectValue placeholder="Set status" /></SelectTrigger>
                            <SelectContent>
                                {ALL_ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.status && <p className="text-sm text-destructive mt-1">{form.formState.errors.status.message}</p>}
                        </FormItem>
                    )} />
                    <Controller name="paymentStatus" control={form.control} render={({ field }) => (
                        <FormItem error={form.formState.errors.paymentStatus}><Label>Payment Status</Label>
                        <Select onValueChange={field.onChange} value={field.value} >
                            <SelectTrigger><SelectValue placeholder="Set payment status" /></SelectTrigger>
                            <SelectContent>
                                {['Pending', 'Paid', 'Failed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.paymentStatus && <p className="text-sm text-destructive mt-1">{form.formState.errors.paymentStatus.message}</p>}
                        </FormItem>
                    )} />
                </div>
            </CardContent>
        </Card>

        <Controller name="notes" control={form.control} render={({ field }) => (
            <FormItem error={form.formState.errors.notes}><Label>Notes (Optional)</Label><Textarea {...field} />
            {form.formState.errors.notes && <p className="text-sm text-destructive mt-1">{form.formState.errors.notes.message}</p>}
            </FormItem>
        )} />

        {state.errors?._form && <p className="text-sm text-destructive mt-1">{state.errors._form[0]}</p>}

        <DialogFooter className="pt-4">
          <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {order ? 'Update Order' : 'Add Order'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

interface FormItemProps {
  children: React.ReactNode;
  error?: { message?: string } | { from?: {message?: string}, to?: {message?: string}, message?: string} ;
  className?: string;
}
const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(({ children, error, className }, ref) => (
  <div ref={ref} className={cn("space-y-1", className)}>
    {children}
    {error && 'message' in error && typeof error.message === 'string' && <p className="text-sm font-medium text-destructive">{error.message}</p>}
  </div>
));
FormItem.displayName = 'FormItem';

