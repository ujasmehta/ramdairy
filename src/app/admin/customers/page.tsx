
import { Button } from '@/components/ui/button';
import { Users, PlusCircle } from 'lucide-react';
import { CustomerTable } from '@/components/admin/customer-table';
import { getCustomers } from '@/lib/admin-db';
import { AddCustomerDialog } from '@/components/admin/add-customer-dialog';
import type { Customer } from '@/types/admin';

export default async function AdminCustomersPage() {
  const initialCustomers: Customer[] = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
        <div>
            <h1 className="text-4xl font-headline font-bold text-foreground flex items-center">
                <Users className="mr-3 h-10 w-10 text-primary" /> Customer Management
            </h1>
            <p className="text-lg text-muted-foreground mt-2">Manage customer profiles, contact information, and addresses.</p>
        </div>
        <AddCustomerDialog />
      </div>
      
      <CustomerTable key={initialCustomers.length} initialCustomers={initialCustomers} />
    </div>
  );
}

