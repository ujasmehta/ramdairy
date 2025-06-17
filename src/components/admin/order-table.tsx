
'use client';

import React, { useState, useEffect } from 'react';
import type { Order, Customer, Product, OrderStatus, OrderItem as OrderItemType } from '@/types/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit3, Trash2, Package, Eye, DownloadCloud } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter
} from '@/components/ui/dialog';
import { OrderForm } from './order-form';
import { AddOrderDialog } from './add-order-dialog'; 
import { CustomerOrderViewDialog } from './customer-order-view-dialog'; 
import { deleteOrderAction } from '@/app/admin/orders/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as AlertDialogFooterAlert, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, parseISO, isEqual, differenceInCalendarDays } from 'date-fns';
import { exportToExcel, type ExportColumn } from '@/lib/excel-export';

interface OrderTableProps {
  initialOrders: Order[];
  customers: Customer[];
  products: Product[];
}

export function OrderTable({ initialOrders, customers, products }: OrderTableProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  
  const [isAddEditFormOpen, setIsAddEditFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [customerToPreselectForNewOrder, setCustomerToPreselectForNewOrder] = useState<string | undefined>(undefined);

  const [viewingOrderDetails, setViewingOrderDetails] = useState<Order | null>(null);

  const [customerViewOpen, setCustomerViewOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    setOrders(initialOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
  }, [initialOrders]);
  
  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setCustomerToPreselectForNewOrder(undefined); 
    setIsAddEditFormOpen(true);
  };

  const handleViewDetails = (order: Order) => {
    setViewingOrderDetails(order);
  }

  const handleDelete = async (id: string) => {
    const result = await deleteOrderAction(id);
    if (result.success) {
      toast({ title: 'Order Deleted', description: result.message });
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };
  
  const onAddEditFormSuccess = () => {
    setIsAddEditFormOpen(false);
    setEditingOrder(null);
    setCustomerToPreselectForNewOrder(undefined);
  };

  const handleCustomerNameClick = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setViewingCustomer(customer);
      setCustomerViewOpen(true);
    }
  };

  const handleInitiateNewOrderFromView = (customerId: string) => {
    setCustomerViewOpen(false); 
    setViewingCustomer(null);
    
    setEditingOrder(null); 
    setCustomerToPreselectForNewOrder(customerId); 
    setIsAddEditFormOpen(true); 
  };

  const getStatusBadgeVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Delivered': return 'default'; 
      case 'Out for Delivery': return 'secondary';
      case 'Confirmed':
      case 'Processing': return 'outline';
      case 'Cancelled': 
      case 'Delivery Attempted': return 'destructive';
      case 'Pending': return 'outline';
      default: 
        const exhaustiveCheck: never = status; 
        return 'outline';
    }
  };
   const getPaymentStatusBadgeVariant = (status: Order['paymentStatus']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Pending': return 'outline';
      case 'Failed': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDeliveryDate = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (isEqual(start, end)) {
      return format(start, 'MMM d, yyyy');
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };

  const handleDownloadExcel = () => {
    const columns: ExportColumn<Order>[] = [
      { header: 'Order ID', accessor: 'id' },
      { header: 'Order Number', accessor: 'orderNumber' },
      { header: 'Customer ID', accessor: 'customerId' },
      { header: 'Customer Name', accessor: 'customerName' },
      { header: 'Customer Phone', accessor: 'customerPhone' },
      { header: 'Order Date', accessor: (item) => format(parseISO(item.orderDate), 'yyyy-MM-dd') },
      { header: 'Delivery Scheduled Start', accessor: (item) => format(parseISO(item.deliveryDateScheduledStart), 'yyyy-MM-dd') },
      { header: 'Delivery Scheduled End', accessor: (item) => format(parseISO(item.deliveryDateScheduledEnd), 'yyyy-MM-dd') },
      { header: 'Delivery Actual Date', accessor: (item) => item.deliveryDateActual ? format(parseISO(item.deliveryDateActual), 'yyyy-MM-dd') : '' },
      { 
        header: 'Items', 
        accessor: (item) => item.items.map(i => `${i.productName} (Qty: ${i.quantity}, Unit Price: $${i.unitPrice.toFixed(2)}, Item Total: $${(i.itemTotal ?? 0).toFixed(2)})`).join('; ')
      },
      { header: 'Subtotal', accessor: (item) => item.subTotal.toFixed(2) },
      { header: 'Delivery Charge', accessor: (item) => item.deliveryCharge.toFixed(2) },
      { header: 'Discount', accessor: (item) => item.discount.toFixed(2) },
      { header: 'Grand Total', accessor: (item) => item.grandTotal.toFixed(2) },
      { header: 'Order Status', accessor: 'status' },
      { header: 'Payment Status', accessor: 'paymentStatus' },
      { header: 'Notes', accessor: 'notes' },
      { header: 'Date Added', accessor: (item) => item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : '' },
      { header: 'Last Updated', accessor: (item) => item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : '' },
    ];
    exportToExcel(orders, 'orders_export', 'Orders', columns);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleDownloadExcel} variant="outline">
          <DownloadCloud className="mr-2 h-4 w-4" />
          Download Excel
        </Button>
      </div>
      {orders.length === 0 ? (
        <Alert>
          <Package className="h-5 w-5 mr-2" />
          <AlertTitle>No Orders Found</AlertTitle>
          <AlertDescription>
            There are no orders in the database yet. Click "Add New Order" to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden sm:table-cell">Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Order Date</TableHead>
              <TableHead>Delivery Scheduled</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center hidden lg:table-cell">Payment</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium hidden sm:table-cell">{order.orderNumber}</TableCell>
                <TableCell>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-base" 
                    onClick={() => handleCustomerNameClick(order.customerId)}
                  >
                    {order.customerName || 'N/A'}
                  </Button>
                </TableCell>
                <TableCell className="hidden md:table-cell">{format(parseISO(order.orderDate), 'MMM d, yyyy')}</TableCell>
                <TableCell>{formatDeliveryDate(order.deliveryDateScheduledStart, order.deliveryDateScheduledEnd)}</TableCell>
                <TableCell className="text-right">${order.grandTotal.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-center hidden lg:table-cell">
                   <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>{order.paymentStatus}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(order)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete order #{order.orderNumber}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooterAlert>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(order.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooterAlert>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      <AddOrderDialog
        customers={customers}
        products={products}
        initialCustomerId={customerToPreselectForNewOrder}
        open={isAddEditFormOpen && !editingOrder} 
        onOpenChange={(open) => {
          setIsAddEditFormOpen(open);
          if (!open) {
            setEditingOrder(null);
            setCustomerToPreselectForNewOrder(undefined);
          }
        }}
      />
      
       <Dialog open={isAddEditFormOpen && !!editingOrder} onOpenChange={(open) => { 
            if(!open) {
                setIsAddEditFormOpen(false); 
                setEditingOrder(null);
            } else {
                setIsAddEditFormOpen(true); 
            }
        }}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
           {editingOrder && 
             <OrderForm 
                order={editingOrder} 
                customers={customers}
                products={products}
                onFormSubmitSuccess={onAddEditFormSuccess} 
            />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingOrderDetails} onOpenChange={(open) => { if (!open) setViewingOrderDetails(null); }}>
        <DialogContent className="sm:max-w-xl">
            {viewingOrderDetails && (
                <>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Order Details: #{viewingOrderDetails.orderNumber}</DialogTitle>
                        <div className="text-sm text-muted-foreground pt-1">
                            Customer: {viewingOrderDetails.customerName || 'N/A'} <br /> Order Date: {format(parseISO(viewingOrderDetails.orderDate), 'PPP')}
                        </div>
                    </DialogHeader>
                    <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
                        <div><strong>Scheduled Delivery:</strong> {formatDeliveryDate(viewingOrderDetails.deliveryDateScheduledStart, viewingOrderDetails.deliveryDateScheduledEnd)}</div>
                        {viewingOrderDetails.deliveryDateActual && <div><strong>Actual Delivery:</strong> {format(parseISO(viewingOrderDetails.deliveryDateActual), 'PPP')}</div>}
                        
                        <div className="flex items-center gap-2"><strong>Status:</strong> <Badge variant={getStatusBadgeVariant(viewingOrderDetails.status)}>{viewingOrderDetails.status}</Badge></div>
                        <div className="flex items-center gap-2"><strong>Payment Status:</strong> <Badge variant={getPaymentStatusBadgeVariant(viewingOrderDetails.paymentStatus)}>{viewingOrderDetails.paymentStatus}</Badge></div>
                        
                        <h4 className="font-semibold mt-4 pt-2 border-t">Items:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            {viewingOrderDetails.items.map(item => (
                                <li key={item.productId + (item.productName || '')}>
                                    {item.productName} - {item.quantity} x ${item.unitPrice.toFixed(2)} = ${item.itemTotal?.toFixed(2)}
                                </li>
                            ))}
                        </ul>
                        <div className="space-y-1 mt-3 pt-3 border-t text-sm">
                            <div><strong>Subtotal:</strong> ${viewingOrderDetails.subTotal.toFixed(2)}</div>
                            <div><strong>Delivery Charge:</strong> ${viewingOrderDetails.deliveryCharge.toFixed(2)}</div>
                            <div><strong>Discount:</strong> ${viewingOrderDetails.discount.toFixed(2)}</div>
                            <div className="font-bold text-base"><strong>Grand Total:</strong> ${viewingOrderDetails.grandTotal.toFixed(2)}</div>
                        </div>
                        {viewingOrderDetails.notes && <div className="mt-3 pt-3 border-t"><strong>Notes:</strong> {viewingOrderDetails.notes}</div>}
                    </div>
                     <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </>
            )}
        </DialogContent>
      </Dialog>

      {viewingCustomer && (
        <CustomerOrderViewDialog
          customer={viewingCustomer}
          open={customerViewOpen}
          onOpenChange={setCustomerViewOpen}
          products={products}
          customers={customers} 
          onInitiateNewOrder={handleInitiateNewOrderFromView}
        />
      )}
    </>
  );
}
