
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
    addOrder as dbAddOrder, 
    updateOrder as dbUpdateOrder, 
    deleteOrder as dbDeleteOrder,
    getOrderById as dbGetOrderById,
    getOrdersByCustomerId as dbGetOrdersByCustomerId, 
    getProducts as dbGetProducts,
} from '@/lib/admin-db';
import type { Order, OrderItem, Product, OrderStatus } from '@/types/admin';
import { ALL_ORDER_STATUSES } from '@/types/admin';
import { format, parseISO } from 'date-fns';

const orderItemSchema = z.object({
  productId: z.string().min(1, { message: 'Product selection is required.' }),
  quantity: z.coerce.number().min(1, { message: 'Quantity must be at least 1.' }), // This is per-day quantity
});

const orderSchemaBase = z.object({
  customerId: z.string().min(1, { message: 'Customer selection is required.' }),
  orderDate: z.date({ required_error: 'Order date is required.' })
    .transform(date => format(date, 'yyyy-MM-dd')),
  deliveryDateScheduledStart: z.date({ required_error: 'Scheduled delivery start date is required.' })
    .transform(date => format(date, 'yyyy-MM-dd')),
  deliveryDateScheduledEnd: z.date({ required_error: 'Scheduled delivery end date is required.' })
    .transform(date => format(date, 'yyyy-MM-dd')),
  items: z.array(orderItemSchema).min(1, { message: 'Order must contain at least one item.' }),
  deliveryCharge: z.coerce.number().min(0).optional().default(0),
  discount: z.coerce.number().min(0).optional().default(0),
  status: z.enum(ALL_ORDER_STATUSES as [OrderStatus, ...OrderStatus[]]),
  paymentStatus: z.enum(['Pending', 'Paid', 'Failed']),
  notes: z.string().max(500, { message: 'Notes too long.' }).optional().or(z.literal('')),
});


export type OrderFormState = {
  message: string;
  errors?: {
    customerId?: string[];
    orderDate?: string[];
    deliveryDateScheduledStart?: string[];
    deliveryDateScheduledEnd?: string[];
    items?: string[]; 
    'items.index.productId'?: string[];
    'items.index.quantity'?: string[];
    deliveryCharge?: string[];
    discount?: string[];
    status?: string[];
    paymentStatus?: string[];
    notes?: string[];
    _form?: string[];
  };
  success: boolean;
  order?: Order;
};


export async function addOrderAction(prevState: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const items: Omit<OrderItem, 'itemTotal' | 'productName' | 'unitPrice'>[] = [];
  let i = 0;
  while (formData.has(`items[${i}].productId`)) {
    items.push({
      productId: formData.get(`items[${i}].productId`) as string,
      quantity: parseInt(formData.get(`items[${i}].quantity`) as string, 10), // per-day quantity
    });
    i++;
  }

  const validatedFields = orderSchemaBase.safeParse({
    customerId: formData.get('customerId'),
    orderDate: formData.get('orderDate') ? new Date(formData.get('orderDate') as string) : undefined,
    deliveryDateScheduledStart: formData.get('deliveryDateScheduledStart') ? new Date(formData.get('deliveryDateScheduledStart') as string) : undefined,
    deliveryDateScheduledEnd: formData.get('deliveryDateScheduledEnd') ? new Date(formData.get('deliveryDateScheduledEnd') as string) : undefined,
    items: items,
    deliveryCharge: formData.get('deliveryCharge') ? Number(formData.get('deliveryCharge')) : 0,
    discount: formData.get('discount') ? Number(formData.get('discount')) : 0,
    status: formData.get('status'),
    paymentStatus: formData.get('paymentStatus'),
    notes: formData.get('notes') || undefined,
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors as OrderFormState['errors'],
      success: false,
    };
  }

  const { customerId, orderDate: newOrderDateString, items: newItemsArray } = validatedFields.data;

  // Refined Validation: Check for duplicate items within an existing order on the same date
  const existingOrdersForCustomer = await dbGetOrdersByCustomerId(customerId);
  const existingOrderOnDate = existingOrdersForCustomer.find(
    (order) => order.orderDate === newOrderDateString
  );

  if (existingOrderOnDate) {
    const allProducts: Product[] = await dbGetProducts(); // Fetch all products to get names
    for (const newItem of newItemsArray) {
        const isDuplicateItem = existingOrderOnDate.items.some(
            (existingItem) => existingItem.productId === newItem.productId
        );
        if (isDuplicateItem) {
            const product = allProducts.find(p => p.id === newItem.productId);
            const productName = product ? product.name : `Product ID ${newItem.productId}`;
            // The newOrderDateString is already 'yyyy-MM-dd'
            const formattedDate = format(parseISO(newOrderDateString + 'T00:00:00'), 'PPP'); // Add time to parse correctly
            return {
                message: 'Validation failed: Duplicate Item.',
                errors: {
                    _form: [`Item "${productName}" is already included in an order for this customer on ${formattedDate}. Please edit the existing order or remove this item.`],
                },
                success: false,
            };
        }
    }
  }
  
  try {
    const orderDataForDb = {
        ...validatedFields.data, // Contains per-day item quantities
    };
    // dbAddOrder will handle calculating totals based on date range and per-day quantities
    const newOrder = await dbAddOrder(orderDataForDb);
    revalidatePath('/admin/orders');
    revalidatePath('/delivery/dashboard');
    return { message: `Order #${newOrder.orderNumber} added successfully.`, success: true, order: newOrder };
  } catch (error) {
    console.error('Failed to add order:', error);
    return { message: 'Database error: Failed to add order.', success: false, errors: { _form: ['An unexpected error occurred.'] } };
  }
}

export async function updateOrderAction(id: string, prevState: OrderFormState, formData: FormData): Promise<OrderFormState> {
  if (!id) {
    return { message: 'Order ID is missing.', success: false, errors: { _form: ['Order ID is required for an update.'] } };
  }

  const items: Omit<OrderItem, 'itemTotal' | 'productName' | 'unitPrice'>[] = [];
  let i = 0;
  while (formData.has(`items[${i}].productId`)) {
    items.push({
      productId: formData.get(`items[${i}].productId`) as string,
      quantity: parseInt(formData.get(`items[${i}].quantity`) as string, 10), // per-day quantity
    });
    i++;
  }
  
  const validatedFields = orderSchemaBase.safeParse({
    customerId: formData.get('customerId'),
    orderDate: formData.get('orderDate') ? new Date(formData.get('orderDate') as string) : undefined,
    deliveryDateScheduledStart: formData.get('deliveryDateScheduledStart') ? new Date(formData.get('deliveryDateScheduledStart') as string) : undefined,
    deliveryDateScheduledEnd: formData.get('deliveryDateScheduledEnd') ? new Date(formData.get('deliveryDateScheduledEnd') as string) : undefined,
    items: items,
    deliveryCharge: formData.get('deliveryCharge') ? Number(formData.get('deliveryCharge')) : undefined,
    discount: formData.get('discount') ? Number(formData.get('discount')) : undefined,
    status: formData.get('status'),
    paymentStatus: formData.get('paymentStatus'),
    notes: formData.get('notes') || undefined,
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors as OrderFormState['errors'],
      success: false,
    };
  }

  try {
    const orderDataForDb = {
        ...validatedFields.data, // Contains per-day item quantities
    };
    // dbUpdateOrder will handle recalculating totals based on date range and per-day quantities
    const updatedOrder = await dbUpdateOrder(id, orderDataForDb);
    if (!updatedOrder) {
      return { message: `Order with ID ${id} not found.`, success: false, errors: { _form: ['Order not found.'] } };
    }
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${id}`); 
    revalidatePath('/delivery/dashboard');
    return { message: `Order #${updatedOrder.orderNumber} updated successfully.`, success: true, order: updatedOrder };
  } catch (error) {
    console.error('Failed to update order:', error);
    return { message: 'Database error: Failed to update order.', success: false, errors: { _form: ['An unexpected error occurred.'] } };
  }
}

export async function deleteOrderAction(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) {
    return { success: false, message: 'Order ID is missing.' };
  }
  try {
    const success = await dbDeleteOrder(id);
    if (success) {
      revalidatePath('/admin/orders');
      revalidatePath('/delivery/dashboard');
      return { success: true, message: 'Order deleted successfully.' };
    }
    return { success: false, message: 'Failed to delete order. Order not found.' };
  } catch (error) {
    console.error('Failed to delete order:', error);
    return { success: false, message: 'Database error: Failed to delete order.' };
  }
}

export async function getOrderByIdAction(id: string): Promise<Order | null> {
    try {
        const order = await dbGetOrderById(id);
        return order || null;
    } catch (error) {
        console.error('Failed to fetch order:', error);
        return null;
    }
}

export async function getOrdersByCustomerIdAction(customerId: string): Promise<Order[]> {
    try {
        const orders = await dbGetOrdersByCustomerId(customerId);
        return orders;
    } catch (error) {
        console.error(`Failed to fetch orders for customer ${customerId}:`, error);
        return [];
    }
}
    
