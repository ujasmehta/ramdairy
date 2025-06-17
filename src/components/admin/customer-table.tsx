
'use client';

import React, { useState, useEffect } from 'react';
import type { Customer } from '@/types/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit3, Trash2, Users, DownloadCloud } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { CustomerForm } from './customer-form'; 
import { deleteCustomerAction } from '@/app/admin/customers/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import { exportToExcel, type ExportColumn } from '@/lib/excel-export';

interface CustomerTableProps {
  initialCustomers: Customer[];
}

export function CustomerTable({ initialCustomers }: CustomerTableProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);
  
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await deleteCustomerAction(id);
    if (result.success) {
      toast({ title: 'Customer Deleted', description: result.message });
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };
  
  const onFormSuccess = () => {
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  const handleDownloadExcel = () => {
    const columns: ExportColumn<Customer>[] = [
      { header: 'ID', accessor: 'id' },
      { header: 'Name', accessor: 'name' },
      { header: 'Email', accessor: 'email' },
      { header: 'Phone', accessor: 'phone' },
      { header: 'Address Line 1', accessor: 'addressLine1' },
      { header: 'Address Line 2', accessor: 'addressLine2' },
      { header: 'City', accessor: 'city' },
      { header: 'State/Province', accessor: 'stateOrProvince' },
      { header: 'Postal Code', accessor: 'postalCode' },
      { header: 'Google Maps Pin', accessor: 'googleMapsPinLink' },
      { header: 'Join Date', accessor: (item) => item.joinDate ? format(parseISO(item.joinDate), 'yyyy-MM-dd') : '' },
      { header: 'Date Added', accessor: (item) => item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : '' },
      { header: 'Last Updated', accessor: (item) => item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : '' },
    ];
    exportToExcel(customers, 'customers_export', 'Customers', columns);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleDownloadExcel} variant="outline">
          <DownloadCloud className="mr-2 h-4 w-4" />
          Download Excel
        </Button>
      </div>
      {customers.length === 0 ? (
        <Alert>
          <Users className="h-5 w-5 mr-2" />
          <AlertTitle>No Customers Found</AlertTitle>
          <AlertDescription>
            There are no customers in the database yet. Click "Add New Customer" to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="hidden md:table-cell">City</TableHead>
              <TableHead className="hidden lg:table-cell">Join Date</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email || '-'}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell className="hidden md:table-cell">{customer.city}</TableCell>
                <TableCell className="hidden lg:table-cell">{format(parseISO(customer.joinDate), 'MMM d, yyyy')}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(customer)}>
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
                          This action cannot be undone. This will permanently delete the customer "{customer.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(customer.id, customer.name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingCustomer(null); }}>
        <DialogContent className="sm:max-w-lg md:max-w-xl">
           { (isFormOpen && (editingCustomer !== undefined)) && 
             <CustomerForm 
                customer={editingCustomer} 
                onFormSubmitSuccess={onFormSuccess} 
            />}
        </DialogContent>
      </Dialog>
    </>
  );
}
