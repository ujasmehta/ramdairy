
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
    addCustomer as dbAddCustomer, 
    updateCustomer as dbUpdateCustomer, 
    deleteCustomer as dbDeleteCustomer,
    getCustomerById as dbGetCustomerById
} from '@/lib/admin-db';
import type { Customer } from '@/types/admin';
import { format } from 'date-fns';

const customerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }).optional().or(z.literal('')),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  addressLine1: z.string().min(5, { message: 'Address Line 1 must be at least 5 characters.' }),
  addressLine2: z.string().optional().or(z.literal('')),
  city: z.string().min(2, { message: 'City must be at least 2 characters.' }),
  stateOrProvince: z.string().min(2, {message: 'State/Province must be at least 2 characters.'}).optional().or(z.literal('')),
  postalCode: z.string().min(5, { message: 'Postal code must be at least 5 characters.' }),
  googleMapsPinLink: z.string().url({ message: "Please enter a valid URL for the Google Maps pin."}).optional().or(z.literal('')),
  joinDate: z.date({ required_error: 'Join date is required.' }).transform(date => format(date, 'yyyy-MM-dd')),
});

export type CustomerFormState = {
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    addressLine1?: string[];
    addressLine2?: string[];
    city?: string[];
    stateOrProvince?: string[];
    postalCode?: string[];
    googleMapsPinLink?: string[];
    joinDate?: string[];
    _form?: string[];
  };
  success: boolean;
  customer?: Customer;
};

export async function addCustomerAction(prevState: CustomerFormState, formData: FormData): Promise<CustomerFormState> {
  const validatedFields = customerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email') || undefined,
    phone: formData.get('phone'),
    addressLine1: formData.get('addressLine1'),
    addressLine2: formData.get('addressLine2') || undefined,
    city: formData.get('city'),
    stateOrProvince: formData.get('stateOrProvince') || undefined,
    postalCode: formData.get('postalCode'),
    googleMapsPinLink: formData.get('googleMapsPinLink') || undefined,
    joinDate: formData.get('joinDate') ? new Date(formData.get('joinDate') as string) : undefined,
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const newCustomer = await dbAddCustomer(validatedFields.data);
    revalidatePath('/admin/customers');
    return { message: `Customer "${newCustomer.name}" added successfully.`, success: true, customer: newCustomer };
  } catch (error) {
    console.error('Failed to add customer:', error);
    return { message: 'Database error: Failed to add customer.', success: false, errors: { _form: ['An unexpected error occurred.'] } };
  }
}

export async function updateCustomerAction(id: string, prevState: CustomerFormState, formData: FormData): Promise<CustomerFormState> {
  if (!id) {
    return { message: 'Customer ID is missing.', success: false, errors: { _form: ['Customer ID is required for an update.'] } };
  }
  
  const validatedFields = customerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email') || undefined,
    phone: formData.get('phone'),
    addressLine1: formData.get('addressLine1'),
    addressLine2: formData.get('addressLine2') || undefined,
    city: formData.get('city'),
    stateOrProvince: formData.get('stateOrProvince') || undefined,
    postalCode: formData.get('postalCode'),
    googleMapsPinLink: formData.get('googleMapsPinLink') || undefined,
    joinDate: formData.get('joinDate') ? new Date(formData.get('joinDate') as string) : undefined,
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const updatedCustomer = await dbUpdateCustomer(id, validatedFields.data);
    if (!updatedCustomer) {
      return { message: `Customer with ID ${id} not found.`, success: false, errors: { _form: ['Customer not found.'] } };
    }
    revalidatePath('/admin/customers');
    return { message: `Customer "${updatedCustomer.name}" updated successfully.`, success: true, customer: updatedCustomer };
  } catch (error) {
    console.error('Failed to update customer:', error);
    return { message: 'Database error: Failed to update customer.', success: false, errors: { _form: ['An unexpected error occurred.'] } };
  }
}

export async function deleteCustomerAction(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) {
    return { success: false, message: 'Customer ID is missing.' };
  }
  try {
    const success = await dbDeleteCustomer(id);
    if (success) {
      revalidatePath('/admin/customers');
      return { success: true, message: 'Customer deleted successfully.' };
    }
    return { success: false, message: 'Failed to delete customer. Customer not found.' };
  } catch (error) {
    console.error('Failed to delete customer:', error);
    return { success: false, message: 'Database error: Failed to delete customer.' };
  }
}

export async function getCustomerByIdAction(id: string): Promise<Customer | null> {
    try {
        const customer = await dbGetCustomerById(id);
        return customer || null;
    } catch (error) {
        console.error('Failed to fetch customer:', error);
        return null;
    }
}

    
