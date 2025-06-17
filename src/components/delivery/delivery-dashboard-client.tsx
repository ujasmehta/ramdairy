
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import type { Order } from '@/types/admin';
import { getDeliveriesForDateAction } from '@/app/delivery/actions';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, PackageSearch, ArrowLeft, ArrowRight } from 'lucide-react';
import { format, addDays, subDays, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { DeliveryOrderCard } from './delivery-order-card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface DeliveryDashboardClientProps {
  initialDeliveries: Order[];
  initialDate: string; // yyyy-MM-dd
}

export function DeliveryDashboardClient({ initialDeliveries, initialDate }: DeliveryDashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date(initialDate + 'T00:00:00'))); // Ensure time is neutral
  const [deliveries, setDeliveries] = useState<Order[]>(initialDeliveries);
  const [isLoading, startLoadingTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs if the initialDate prop changes (e.g. server passes a new date)
    // or when the component mounts with the initialDate.
    // It also ensures deliveries are updated if initialDeliveries change for the same initialDate.
    setSelectedDate(startOfDay(new Date(initialDate + 'T00:00:00')));
    setDeliveries(initialDeliveries);
  }, [initialDeliveries, initialDate]);

  const fetchDeliveries = (date: Date) => {
    setError(null);
    startLoadingTransition(async () => {
      try {
        const dateString = format(date, 'yyyy-MM-dd');
        const fetchedDeliveries = await getDeliveriesForDateAction(dateString);
        setDeliveries(fetchedDeliveries);
      } catch (err) {
        console.error('Error fetching deliveries:', err);
        setError('Failed to load deliveries. Please try again.');
        setDeliveries([]);
      }
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const newSelectedDate = startOfDay(date);
      setSelectedDate(newSelectedDate);
      fetchDeliveries(newSelectedDate);
    }
  };
  
  const handlePreviousDay = () => {
    const prevDay = subDays(selectedDate, 1);
    setSelectedDate(prevDay);
    fetchDeliveries(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    setSelectedDate(nextDay);
    fetchDeliveries(nextDay);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border rounded-lg bg-card shadow-md">
        <h1 className="text-2xl font-headline font-bold text-foreground">
          Daily Deliveries for: {format(selectedDate, 'PPP')}
        </h1>
        <div className="flex items-center gap-2">
           <Button variant="outline" onClick={handlePreviousDay} disabled={isLoading}>
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Prev Day</span>
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn('w-[200px] sm:w-[280px] justify-start text-left font-normal', !selectedDate && 'text-muted-foreground')}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={handleNextDay} disabled={isLoading}>
             <span className="hidden sm:inline">Next Day</span>
            <ArrowRight className="h-4 w-4 ml-1 sm:ml-2" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading deliveries...</p>
        </div>
      ) : deliveries.length === 0 ? (
        <Alert>
          <PackageSearch className="h-5 w-5 mr-2" />
          <AlertTitle>No Deliveries Found</AlertTitle>
          <AlertDescription>
            There are no deliveries scheduled or matching current criteria for {format(selectedDate, 'PPP')}.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveries.map(order => (
            <DeliveryOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
