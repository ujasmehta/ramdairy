
import { Button } from '@/components/ui/button';
import { Package, PlusCircle } from 'lucide-react';
import { OrderTable } from '@/components/admin/order-table';
import { getOrders, getCustomers, getProducts } from '@/lib/admin-db';
import { AddOrderDialog } from '@/components/admin/add-order-dialog';
import type { Order, Customer, Product } from '@/types/admin';

export default async function AdminOrdersPage() {
  const initialOrders: Order[] = await getOrders();
  const customers: Customer[] = await getCustomers();
  const products: Product[] = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
        <div>
            <h1 className="text-4xl font-headline font-bold text-foreground flex items-center">
                <Package className="mr-3 h-10 w-10 text-primary" /> Order Management
            </h1>
            <p className="text-lg text-muted-foreground mt-2">Manage customer orders, track statuses, and update details.</p>
        </div>
        <AddOrderDialog customers={customers} products={products} />
      </div>
      
      <OrderTable key={initialOrders.length} initialOrders={initialOrders} customers={customers} products={products} />
       <p className="text-sm text-muted-foreground mt-4">
        Future enhancements could include advanced filtering for a weekly view, and direct links to customer/product management.
      </p>
    </div>
  );
}

