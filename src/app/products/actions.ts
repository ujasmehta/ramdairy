
'use server';

import { getCustomers, getOrdersByCustomerId as dbGetOrdersByCustomerId, updateCustomer as dbUpdateCustomer } from '@/lib/admin-db';
import type { Order, Customer } from '@/types/admin';
import { z } from 'zod';

interface SearchOrdersResult {
  success: boolean;
  orders?: Order[];
  customer?: Customer | null;
  message?: string;
}

export async function getOrdersByPhoneNumberAction(phoneNumber: string): Promise<SearchOrdersResult> {
  const numericInputPhone = phoneNumber.replace(/\D/g, ''); // Strip non-digits from input

  if (!numericInputPhone || numericInputPhone.length < 10) { // Validate length of numeric part
    return { success: false, message: 'Please enter a valid phone number (at least 10 digits).' };
  }

  try {
    const allCustomers: Customer[] = await getCustomers();
    // Normalize stored phone numbers for comparison
    const foundCustomer = allCustomers.find(customer => {
      const numericDbPhone = customer.phone.replace(/\D/g, '');
      return numericDbPhone === numericInputPhone;
    });

    if (!foundCustomer) {
      return { success: false, customer: null, message: 'No customer found with this phone number.' };
    }

    const customerOrders: Order[] = await dbGetOrdersByCustomerId(foundCustomer.id);

    if (customerOrders.length === 0) {
      return { 
        success: true, 
        orders: [], 
        customer: foundCustomer,
        message: `No orders found for ${foundCustomer.name}.` 
      };
    }

    return { success: true, orders: customerOrders, customer: foundCustomer };

  } catch (error) {
    console.error('Error fetching orders by phone number:', error);
    return { success: false, customer: null, message: 'An unexpected error occurred while searching for orders.' };
  }
}


// Schema for customer self-service profile update
const customerProfileUpdateSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).optional().or(z.literal('')),
  addressLine1: z.string().min(5, { message: 'Address Line 1 must be at least 5 characters.' }),
  addressLine2: z.string().optional().or(z.literal('')),
  city: z.string().min(2, { message: 'City must be at least 2 characters.' }),
  stateOrProvince: z.string().min(2, {message: 'State/Province must be at least 2 characters.'}).optional().or(z.literal('')),
  postalCode: z.string().min(5, { message: 'Postal code must be at least 5 characters.' }),
  googleMapsPinLink: z.string().url({message: "Please enter a valid URL for the Google Maps pin."}).optional().or(z.literal('')),
});

export type CustomerProfileUpdateFormState = {
  message: string;
  errors?: {
    email?: string[];
    addressLine1?: string[];
    addressLine2?: string[];
    city?: string[];
    stateOrProvince?: string[];
    postalCode?: string[];
    googleMapsPinLink?: string[];
    _form?: string[];
  };
  success: boolean;
  updatedCustomer?: Customer;
};

export async function updateCustomerProfileAction(
  customerId: string, 
  prevState: CustomerProfileUpdateFormState, 
  formData: FormData
): Promise<CustomerProfileUpdateFormState> {
  if (!customerId) {
    return { message: 'Customer ID is missing.', success: false, errors: { _form: ['Customer ID is required.'] } };
  }

  const validatedFields = customerProfileUpdateSchema.safeParse({
    email: formData.get('email') || undefined,
    addressLine1: formData.get('addressLine1'),
    addressLine2: formData.get('addressLine2') || undefined,
    city: formData.get('city'),
    stateOrProvince: formData.get('stateOrProvince') || undefined,
    postalCode: formData.get('postalCode'),
    googleMapsPinLink: formData.get('googleMapsPinLink') || undefined,
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    // Only pass validated (and thus allowed) fields to the db update function
    const dataToUpdate: Partial<Omit<Customer, 'id' | 'dateAdded' | 'lastUpdated' | 'name' | 'phone' | 'joinDate'>> = {
        ...validatedFields.data
    };

    const updatedCustomer = await dbUpdateCustomer(customerId, dataToUpdate);
    if (!updatedCustomer) {
      return { message: `Customer with ID ${customerId} not found.`, success: false, errors: { _form: ['Customer not found.'] } };
    }
    // No revalidatePath needed here as this is a client-driven update, 
    // the calling component should refresh its state.
    return { message: `Profile updated successfully.`, success: true, updatedCustomer };
  } catch (error) {
    console.error('Failed to update customer profile:', error);
    return { message: 'Database error: Failed to update profile.', success: false, errors: { _form: ['An unexpected error occurred.'] } };
  }
}

