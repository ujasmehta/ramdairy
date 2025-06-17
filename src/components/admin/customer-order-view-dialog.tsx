
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Customer, Order, Product } from '@/types/admin';
import { getOrdersByCustomerIdAction } from '@/app/admin/orders/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, ArrowRight, PackagePlus } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval, addWeeks, subWeeks, isEqual } from 'date-fns';

interface CustomerOrderViewDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[]; // Needed if AddOrderDialog is invoked from here
  customers: Customer[]; // Needed if AddOrderDialog is invoked from here
  onInitiateNewOrder: (customerId: string) => void; // Callback to parent
}

export function CustomerOrderViewDialog({
  customer,
  open,
  onOpenChange,
  products,
  customers,
  onInitiateNewOrder,
}: CustomerOrderViewDialogProps) {
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    if (customer && open) {
      const fetchOrders = async () => {
        setIsLoading(true);
        const orders = await getOrdersByCustomerIdAction(customer.id);
        setCustomerOrders(orders);
        setIsLoading(false);
      };
      fetchOrders();
      // Reset week to current week when dialog opens for a new customer
      setCurrentWeekStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
    } else if (!open) {
      setCustomerOrders([]); // Clear orders when dialog closes
    }
  }, [customer, open]);

  const ordersForCurrentWeek = useMemo(() => {
    if (!customerOrders.length) return [];
    const weekStart = currentWeekStartDate;
    const weekEnd = endOfWeek(currentWeekStartDate, { weekStartsOn: 1 });
    return customerOrders
      .filter(order => {
        const orderDate = parseISO(order.orderDate);
        return isWithinInterval(orderDate, { start: weekStart, end: weekEnd });
      })
      .sort((a, b) => parseISO(a.orderDate).getTime() - parseISO(b.orderDate).getTime());
  }, [customerOrders, currentWeekStartDate]);

  const handlePreviousWeek = () => setCurrentWeekStartDate(prev => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeekStartDate(prev => addWeeks(prev, 1));

  const formatDeliveryDateRange = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (isEqual(start, end)) {
      return format(start, 'MMM d, yy');
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yy')}`;
  };
  
  const getStatusBadgeVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Confirmed': case 'Processing': case 'Out for Delivery': return 'secondary';
      case 'Pending': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };


  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Orders for {customer.name}</DialogTitle>
          <DialogDescription>
            Viewing orders for the week of {format(currentWeekStartDate, 'MMMM d, yyyy')}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center my-4">
          <Button variant="outline" onClick={handlePreviousWeek} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous Week
          </Button>
          <p className="font-semibold text-center">
            {format(currentWeekStartDate, 'MMM d')} - {format(endOfWeek(currentWeekStartDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
          </p>
          <Button variant="outline" onClick={handleNextWeek} size="sm">
            Next Week <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading orders...</p>
            </div>
          ) : ordersForCurrentWeek.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Scheduled Delivery</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersForCurrentWeek.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{format(parseISO(order.orderDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{formatDeliveryDateRange(order.deliveryDateScheduledStart, order.deliveryDateScheduledEnd)}</TableCell>
                    <TableCell className="text-right">${order.grandTotal.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-10">No orders found for this customer in this week.</p>
          )}
        </div>

        <DialogFooter className="mt-6 pt-4 border-t flex flex-col sm:flex-row justify-between items-center">
          <Button 
            variant="default" 
            onClick={() => onInitiateNewOrder(customer.id)}
            className="w-full sm:w-auto"
          >
            <PackagePlus className="mr-2 h-4 w-4" /> Add New Order for {customer.name}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
