'use client';

import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Users, MapPin, Mail, Phone, Leaf } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const visitFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }).optional(),
  preferredDate: z.date({ required_error: 'A preferred date is required.' }),
  numberOfVisitors: z.coerce.number().min(1, { message: 'At least one visitor is required.' }).max(10, {message: 'Maximum 10 visitors per group.'}),
  message: z.string().optional(),
});

type VisitFormValues = z.infer<typeof visitFormSchema>;

export default function VisitPage() {
  const { toast } = useToast();
  const form = useForm<VisitFormValues>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      numberOfVisitors: 1,
      message: '',
    },
  });

  function onSubmit(data: VisitFormValues) {
    console.log(data);
    toast({
      title: "Visit Request Submitted!",
      description: "Thank you for your interest. We will contact you shortly to confirm your farm visit.",
      variant: "default",
    });
    form.reset();
  }

  return (
    <div className="bg-background min-h-screen">
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <Users className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            Visit Our <span className="text-primary">Serene Farm</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with nature, learn about our organic practices, and spend time with our beloved GIR cows. We welcome you to experience the tranquility of RamDairyFarm.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div>
                <h2 className="font-headline text-3xl font-semibold text-foreground mb-4">What to Expect</h2>
                <ul className="space-y-3 text-muted-foreground text-lg list-none">
                  <li className="flex items-start"><Leaf className="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />Guided tour of our organic farm and cow shelters (Goshala).</li>
                  <li className="flex items-start"><Leaf className="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />Opportunity to interact with and feed our gentle GIR cows.</li>
                  <li className="flex items-start"><Leaf className="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />Learn about Vedic farming practices and A2 milk benefits.</li>
                  <li className="flex items-start"><Leaf className="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />Peaceful ambiance perfect for reflection and connecting with nature.</li>
                  <li className="flex items-start"><Leaf className="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />Option to purchase fresh farm products (subject to availability).</li>
                </ul>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-md">
                 <h3 className="font-headline text-2xl font-semibold text-foreground mb-4">Contact Information</h3>
                 <div className="space-y-3 text-muted-foreground">
                    <p className="flex items-center"><MapPin className="w-5 h-5 text-primary mr-3" />123 Organic Way, Natureville, CA 90210</p>
                    <p className="flex items-center"><Phone className="w-5 h-5 text-primary mr-3" />(123) 456-7890</p>
                    <p className="flex items-center"><Mail className="w-5 h-5 text-primary mr-3" />visits@ramdairyfarm.com</p>
                 </div>
              </div>

              <div className="relative aspect-video w-full">
                <Image 
                  src="https://placehold.co/800x600.png" 
                  alt="Happy visitors at RamDairyFarm farm" 
                  layout="fill" 
                  objectFit="cover" 
                  className="rounded-lg shadow-xl"
                  data-ai-hint="farm visitors happy"
                />
              </div>

            </div>

            <div className="bg-card p-8 rounded-lg shadow-xl">
              <h2 className="font-headline text-3xl font-semibold text-foreground mb-6 text-center">Schedule Your Visit</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Preferred Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numberOfVisitors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Visitors</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="10" placeholder="e.g., 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any specific requests or questions?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full shadow-md hover:shadow-lg transition-shadow" size="lg" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Submitting..." : "Request Visit"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
