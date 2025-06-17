
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
    getOrdersForDeliveryByDate as dbGetOrdersForDeliveryByDate,
    updateOrder as dbUpdateOrder 
} from '@/lib/admin-db';
import type { Order, OrderStatus } from '@/types/admin';
import { ALL_ORDER_STATUSES } from '@/types/admin';
import { format } from 'date-fns';

export async function getDeliveriesForDateAction(date: string): Promise<Order[]> {
    if (!date) {
        console.warn('getDeliveriesForDateAction called without a date.');
        return [];
    }
    try {
        const deliveries = await dbGetOrdersForDeliveryByDate(date);
        return deliveries;
    } catch (error) {
        console.error(`Failed to fetch deliveries for date ${date}:`, error);
        return [];
    }
}

const updateStatusSchema = z.object({
    orderId: z.string().min(1, { message: "Order ID is required." }),
    status: z.enum(ALL_ORDER_STATUSES as [OrderStatus, ...OrderStatus[]]),
});

export type DeliveryStatusUpdateFormState = {
  message: string;
  success: boolean;
  errors?: {
    orderId?: string[];
    status?: string[];
    _form?: string[];
  };
  order?: Order;
};

export async function updateDeliveryStatusAction(
    prevState: DeliveryStatusUpdateFormState, 
    formData: FormData
): Promise<DeliveryStatusUpdateFormState> {
    const validatedFields = updateStatusSchema.safeParse({
        orderId: formData.get('orderId'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            message: "Validation failed. Please check your inputs.",
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
        };
    }

    const { orderId, status } = validatedFields.data;
    const updateData: Partial<Omit<Order, 'id' | 'orderNumber' | 'subTotal' | 'grandTotal' | 'dateAdded' | 'lastUpdated' | 'customerName' | 'items' >> = { status };

    if (status === 'Delivered') {
        updateData.deliveryDateActual = format(new Date(), 'yyyy-MM-dd');
    } else {
        // If status is changed from 'Delivered' to something else, clear actual delivery date
        // This logic might need refinement based on exact business rules
        const currentOrder = await dbGetOrdersForDeliveryByDate(format(new Date(), 'yyyy-MM-dd')).then(orders => orders.find(o => o.id === orderId)); // A bit inefficient
        if (currentOrder && currentOrder.status === 'Delivered') {
            updateData.deliveryDateActual = undefined; 
        }
    }
    
    try {
        const updatedOrder = await dbUpdateOrder(orderId, updateData);
        if (!updatedOrder) {
            return { message: `Order with ID ${orderId} not found.`, success: false, errors: { _form: ['Order not found.'] } };
        }
        revalidatePath('/delivery/dashboard');
        revalidatePath('/admin/orders'); // Also revalidate admin orders view
        return { message: `Order #${updatedOrder.orderNumber} status updated to ${status}.`, success: true, order: updatedOrder };
    } catch (error) {
        console.error('Failed to update order status:', error);
        return { message: 'Database error: Failed to update order status.', success: false, errors: { _form: ['An unexpected error occurred.'] } };
    }
}
