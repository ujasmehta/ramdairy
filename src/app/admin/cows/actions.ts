
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addCow as dbAddCow, updateCow as dbUpdateCow, deleteCow as dbDeleteCow, getCowById as dbGetCowById } from '@/lib/admin-db';
import type { Cow } from '@/types/admin';
import { format } from 'date-fns';

const cowSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.coerce.number().min(0, { message: 'Age must be a positive number.' }).max(30, {message: 'Age seems too high.'}),
  dateOfBirth: z.date({ required_error: 'Date of birth is required.'}).optional().transform(date => date ? format(date, 'yyyy-MM-dd') : undefined),
  breed: z.string().min(2, { message: 'Breed must be at least 2 characters.' }),
  gender: z.enum(['Male', 'Female'], { required_error: 'Gender is required.'}),
  lactation: z.string().max(50, {message: 'Lactation info too long.'}).optional().or(z.literal('')),
  mother: z.string().max(50, {message: 'Mother name too long.'}).optional().or(z.literal('')),
  father: z.string().max(50, {message: 'Father name too long.'}).optional().or(z.literal('')),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(500, {message: 'Description too long.'}),
  imageUrl: z.string().url({ message: 'Please enter a valid URL for the image.' }).optional().or(z.literal('')),
});

export type CowFormState = {
  message: string;
  errors?: {
    name?: string[];
    age?: string[];
    dateOfBirth?: string[];
    breed?: string[];
    gender?: string[];
    lactation?: string[];
    mother?: string[];
    father?: string[];
    description?: string[];
    imageUrl?: string[];
    _form?: string[];
  };
  success: boolean;
  cow?: Cow;
};

export async function addCow(prevState: CowFormState, formData: FormData): Promise<CowFormState> {
  const dateOfBirthValue = formData.get('dateOfBirth');
  const validatedFields = cowSchema.safeParse({
    name: formData.get('name'),
    age: formData.get('age'),
    dateOfBirth: dateOfBirthValue ? new Date(dateOfBirthValue as string) : undefined,
    breed: formData.get('breed'),
    gender: formData.get('gender'),
    lactation: formData.get('lactation') || undefined,
    mother: formData.get('mother') || undefined,
    father: formData.get('father') || undefined,
    description: formData.get('description'),
    imageUrl: formData.get('imageUrl') || undefined,
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    // Explicitly cast to ensure gender is 'Male' | 'Female'
    const dataToSave = {
        ...validatedFields.data,
        gender: validatedFields.data.gender as 'Male' | 'Female',
    };
    const newCow = await dbAddCow(dataToSave);
    revalidatePath('/admin/cows');
    return { message: `Cow "${newCow.name}" added successfully.`, success: true, cow: newCow };
  } catch (error) {
    console.error('Failed to add cow:', error);
    return { message: 'Database error: Failed to add cow.', success: false, errors: { _form: ['An unexpected error occurred.'] } };
  }
}

export async function updateCow(id: string, prevState: CowFormState, formData: FormData): Promise<CowFormState> {
  if (!id) {
    return { message: 'Cow ID is missing.', success: false, errors: { _form: ['Cow ID is required for an update.'] } };
  }
  
  const dateOfBirthValue = formData.get('dateOfBirth');
  const validatedFields = cowSchema.safeParse({
    name: formData.get('name'),
    age: formData.get('age'),
    dateOfBirth: dateOfBirthValue ? new Date(dateOfBirthValue as string) : undefined,
    breed: formData.get('breed'),
    gender: formData.get('gender'),
    lactation: formData.get('lactation') || undefined,
    mother: formData.get('mother') || undefined,
    father: formData.get('father') || undefined,
    description: formData.get('description'),
    imageUrl: formData.get('imageUrl') || undefined,
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const dataToSave = {
        ...validatedFields.data,
        gender: validatedFields.data.gender as 'Male' | 'Female',
    };
    const updatedCow = await dbUpdateCow(id, dataToSave);
    if (!updatedCow) {
      return { message: `Cow with ID ${id} not found.`, success: false, errors: { _form: ['Cow not found.'] } };
    }
    revalidatePath('/admin/cows');
    return { message: `Cow "${updatedCow.name}" updated successfully.`, success: true, cow: updatedCow };
  } catch (error) {
    console.error('Failed to update cow:', error);
    return { message: 'Database error: Failed to update cow.', success: false, errors: { _form: ['An unexpected error occurred.'] } };
  }
}

export async function deleteCow(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) {
    return { success: false, message: 'Cow ID is missing.' };
  }
  try {
    const success = await dbDeleteCow(id);
    if (success) {
      revalidatePath('/admin/cows');
      return { success: true, message: 'Cow deleted successfully.' };
    }
    return { success: false, message: 'Failed to delete cow. Cow not found.' };
  } catch (error) {
    console.error('Failed to delete cow:', error);
    return { success: false, message: 'Database error: Failed to delete cow.' };
  }
}

export async function getCowById(id: string): Promise<Cow | null> {
    try {
        const cow = await dbGetCowById(id);
        return cow || null;
    } catch (error) {
        console.error('Failed to fetch cow:', error);
        return null;
    }
}

