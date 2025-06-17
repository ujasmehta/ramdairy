
'use client';

import type { Order } from '@/types/admin';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, User, MapPin, PhoneCall, ListOrdered, CalendarCheck2, Info, ShoppingCart, LinkIcon } from 'lucide-react';
import { DeliveryStatusUpdater } from './delivery-status-updater';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

interface DeliveryOrderCardProps {
  order: Order;
}

export function DeliveryOrderCard({ order }: DeliveryOrderCardProps) {
  const getStatusBadgeVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Out for Delivery': return 'secondary';
      case 'Confirmed': case 'Processing': return 'outline';
      case 'Cancelled': case 'Delivery Attempted': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getPaymentBadgeVariant = (status: Order['paymentStatus']): "default" | "secondary" | "destructive" | "outline" => {
     switch (status) {
      case 'Paid': return 'default';
      case 'Pending': return 'outline';
      case 'Failed': return 'destructive';
      default: return 'outline';
    }
  };

  const customerAddress = [
    order.customerAddressLine1,
    order.customerAddressLine2,
    order.customerCity,
    order.customerPostalCode,
  ].filter(Boolean).join(', ');

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
            <div>
                <CardTitle className="font-headline text-xl flex items-center">
                    <Package className="mr-2 h-5 w-5 text-primary" />
                    Order #{order.orderNumber}
                </CardTitle>
                <CardDescription>For: {order.customerName}</CardDescription>
            </div>
             <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs whitespace-nowrap">
                {order.status}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm flex-grow">
        <div className="flex items-start">
          <MapPin className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
          <span>{customerAddress || 'Address not available'}</span>
        </div>
        {order.customerGoogleMapsPinLink && (
            <div className="flex items-center">
                <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <Link href={order.customerGoogleMapsPinLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                    View Google Maps Pin
                </Link>
            </div>
        )}
        <div className="flex items-center">
          <PhoneCall className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{order.customerPhone || 'Phone not available'}</span>
        </div>
        <div className="flex items-center">
            <ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Payment: </span>
            <Badge variant={getPaymentBadgeVariant(order.paymentStatus)} className="ml-1.5 text-xs">{order.paymentStatus}</Badge>
        </div>

        <Separator className="my-3" />
        
        <div className="space-y-1">
            <h4 className="font-semibold flex items-center"><ListOrdered className="mr-2 h-4 w-4 text-muted-foreground" />Items for Today:</h4>
            <ul className="list-disc list-inside pl-2 space-y-0.5">
            {order.items.map(item => (
                <li key={item.productId + (item.productName || 'item')}>
                {item.productName} - Qty: {item.quantity} 
                </li>
            ))}
            </ul>
        </div>

        {order.notes && (
          <div className="pt-1">
            <h4 className="font-semibold flex items-center"><Info className="mr-2 h-4 w-4 text-muted-foreground" />Order Notes:</h4>
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <DeliveryStatusUpdater orderId={order.id} currentStatus={order.status} />
      </CardFooter>
    </Card>
  );
}
