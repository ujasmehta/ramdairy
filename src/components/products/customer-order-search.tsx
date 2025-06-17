
'use client';

import React, { useState, useActionState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Search, ShoppingBag, UserCircle, Edit2, Save, Link2, MapPin, MapIcon } from 'lucide-react';
import { getOrdersByPhoneNumberAction, updateCustomerProfileAction, type CustomerProfileUpdateFormState } from '@/app/products/actions';
import type { Order, Customer } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isEqual, differenceInCalendarDays } from 'date-fns';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const initialProfileFormState: CustomerProfileUpdateFormState = { message: '', success: false };

export default function CustomerOrderSearch() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const { toast } = useToast();

  // Use a dynamic key for profileFormRef to ensure it re-initializes if the customer changes
  // This helps if a user searches for one customer, then another, and then tries to edit the second.
  const profileFormRef = useRef<HTMLFormElement>(null); 


  const [profileUpdateState, profileUpdateFormAction, isProfileUpdatePending] = useActionState(
    // Bind customer.id only when customer exists, otherwise use a dummy action
    customer ? updateCustomerProfileAction.bind(null, customer.id) : async () => initialProfileFormState,
    initialProfileFormState
  );
  

  useEffect(() => {
    if (profileUpdateState.message) {
        toast({
            title: profileUpdateState.success ? 'Success!' : 'Update Error',
            description: profileUpdateState.message,
            variant: profileUpdateState.success ? 'default' : 'destructive',
        });
        if (profileUpdateState.success && profileUpdateState.updatedCustomer) {
            setCustomer(profileUpdateState.updatedCustomer);
            setIsEditingProfile(false);
        }
    }
  }, [profileUpdateState, toast]);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSearchMessage(null);
    setOrders(null);
    setCustomer(null);
    setIsEditingProfile(false);

    const result = await getOrdersByPhoneNumberAction(phoneNumber.trim());
    if (result.success) {
      setOrders(result.orders || []);
      setCustomer(result.customer || null); 
      if (result.message) {
        setSearchMessage(result.message);
      } else if (result.orders && result.orders.length === 0 && result.customer) {
        setSearchMessage(`No orders found for ${result.customer.name}.`);
      } else if (result.orders && result.orders.length === 0 && !result.customer) {
         setSearchMessage(`No customer or orders found for this phone number.`);
      }
    } else {
      setError(result.message || 'Failed to search for orders.');
    }
    setIsLoading(false);
  };

  const getStatusBadgeVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Out for Delivery': return 'secondary';
      case 'Confirmed':
      case 'Processing': return 'outline';
      case 'Cancelled':
      case 'Delivery Attempted': return 'destructive';
      case 'Pending': return 'outline';
      default: return 'outline';
    }
  };

  const formatDeliveryDateRange = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (isEqual(start, end)) {
      return format(start, 'MMM d, yy');
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yy')}`;
  };

  const handleSearchOnMapProfile = () => {
    if (!profileFormRef.current) return;
    const address1Input = profileFormRef.current.elements.namedItem('addressLine1') as HTMLInputElement;
    const address2Input = profileFormRef.current.elements.namedItem('addressLine2') as HTMLInputElement;
    const cityInput = profileFormRef.current.elements.namedItem('city') as HTMLInputElement;
    const stateInput = profileFormRef.current.elements.namedItem('stateOrProvince') as HTMLInputElement;
    const postalCodeInput = profileFormRef.current.elements.namedItem('postalCode') as HTMLInputElement;

    const addressParts = [
      address1Input?.value,
      address2Input?.value,
      cityInput?.value,
      stateInput?.value,
      postalCodeInput?.value,
    ].filter(Boolean).join(', ');

    if (addressParts) {
      const query = encodeURIComponent(addressParts);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    } else {
      toast({
        title: "Address Missing",
        description: "Please enter some address details first to search on map.",
        variant: "default"
      });
    }
  };


  return (
    <section id="search-orders" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader className="text-center">
            <ShoppingBag className="w-12 h-12 text-primary mx-auto mb-3" />
            <CardTitle className="font-headline text-3xl">Your Orders and Account</CardTitle>
            <CardDescription>Enter your phone number to view your orders and profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-grow"
                  disabled={isLoading}
                  required
                  minLength={10}
                />
                <Button type="submit" disabled={isLoading || !phoneNumber.trim()} className="shrink-0">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Search
                </Button>
              </div>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Search Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="text-center mt-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Searching...</p>
          </div>
        )}

        {searchMessage && !isLoading && !customer && (
          <Alert className="mt-8 max-w-2xl mx-auto">
            <AlertTitle>Search Result</AlertTitle>
            <AlertDescription>{searchMessage}</AlertDescription>
          </Alert>
        )}

        {customer && !isLoading && (
          <Card className="mt-8 max-w-2xl mx-auto shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-2xl flex items-center">
                  <UserCircle className="mr-2 h-7 w-7 text-primary" /> Welcome, {customer.name}
                </CardTitle>
                {!isEditingProfile && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                    <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingProfile ? (
                <form action={profileUpdateFormAction} ref={profileFormRef} className="space-y-4" key={customer.id}> {/* Key ensures form re-renders if customer changes */}
                  <h3 className="text-lg font-semibold">Edit Your Profile</h3>
                  <div>
                    <Label htmlFor={`profileName-${customer.id}`}>Name</Label>
                    <Input id={`profileName-${customer.id}`} value={customer.name} readOnly disabled className="bg-muted/50"/>
                  </div>
                  <div>
                    <Label htmlFor={`profilePhone-${customer.id}`}>Phone</Label>
                    <Input id={`profilePhone-${customer.id}`} value={customer.phone} readOnly disabled className="bg-muted/50"/>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={customer.email || ''} />
                    {profileUpdateState.errors?.email && <p className="text-sm text-destructive mt-1">{profileUpdateState.errors.email[0]}</p>}
                  </div>
                  <div>
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input id="addressLine1" name="addressLine1" defaultValue={customer.addressLine1} />
                    {profileUpdateState.errors?.addressLine1 && <p className="text-sm text-destructive mt-1">{profileUpdateState.errors.addressLine1[0]}</p>}
                  </div>
                  <div>
                    <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                    <Input id="addressLine2" name="addressLine2" defaultValue={customer.addressLine2 || ''} />
                     {profileUpdateState.errors?.addressLine2 && <p className="text-sm text-destructive mt-1">{profileUpdateState.errors.addressLine2[0]}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" defaultValue={customer.city} />
                      {profileUpdateState.errors?.city && <p className="text-sm text-destructive mt-1">{profileUpdateState.errors.city[0]}</p>}
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" name="postalCode" defaultValue={customer.postalCode} />
                      {profileUpdateState.errors?.postalCode && <p className="text-sm text-destructive mt-1">{profileUpdateState.errors.postalCode[0]}</p>}
                    </div>
                  </div>
                   <div>
                      <Label htmlFor="stateOrProvince">State/Province (Optional)</Label>
                      <Input id="stateOrProvince" name="stateOrProvince" defaultValue={customer.stateOrProvince || ''} />
                      {profileUpdateState.errors?.stateOrProvince && <p className="text-sm text-destructive mt-1">{profileUpdateState.errors.stateOrProvince[0]}</p>}
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <Label htmlFor="googleMapsPinLink" className="flex items-center">
                                <Link2 className="mr-2 h-4 w-4 text-muted-foreground" /> Google Maps Pin Link (Optional)
                            </Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleSearchOnMapProfile}>
                                <MapIcon className="mr-2 h-3 w-3" /> Search on Map
                            </Button>
                        </div>
                      <Input id="googleMapsPinLink" name="googleMapsPinLink" type="url" defaultValue={customer.googleMapsPinLink || ''} placeholder="https://maps.app.goo.gl/..." />
                      {profileUpdateState.errors?.googleMapsPinLink && <p className="text-sm text-destructive mt-1">{profileUpdateState.errors.googleMapsPinLink[0]}</p>}
                    </div>
                  {profileUpdateState.errors?._form && <p className="text-sm text-destructive mt-1">{profileUpdateState.errors._form[0]}</p>}
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={isProfileUpdatePending}>
                      {isProfileUpdatePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)} disabled={isProfileUpdatePending}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {customer.name}</p>
                  <p><strong>Phone:</strong> {customer.phone}</p>
                  <p><strong>Email:</strong> {customer.email || 'Not provided'}</p>
                  <p><strong>Address:</strong> {customer.addressLine1}, {customer.addressLine2 ? `${customer.addressLine2}, ` : ''}{customer.city}, {customer.stateOrProvince ? `${customer.stateOrProvince}, ` : ''}{customer.postalCode}</p>
                  {customer.googleMapsPinLink && (
                    <p className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <strong>Location Pin:</strong>&nbsp;
                        <Link href={customer.googleMapsPinLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                           View on Map
                        </Link>
                    </p>
                  )}
                  <p><strong>Joined:</strong> {format(parseISO(customer.joinDate), 'PPP')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {searchMessage && !isLoading && customer && (
           <Alert className="mt-8 max-w-2xl mx-auto">
             <AlertDescription>{searchMessage}</AlertDescription>
           </Alert>
        )}

        {orders && orders.length > 0 && !isLoading && (
          <div className="mt-12 space-y-6">
            <h3 className="text-2xl font-headline font-semibold text-center text-foreground">
              Your Orders:
            </h3>
            {orders.map(order => (
              <Card key={order.id} className="shadow-md hover:shadow-lg transition-shadow max-w-2xl mx-auto">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-xl font-headline">Order #{order.orderNumber}</CardTitle>
                      <CardDescription>
                        Placed on: {format(parseISO(order.orderDate), 'PPP')}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p><strong>Scheduled Delivery:</strong> {formatDeliveryDateRange(order.deliveryDateScheduledStart, order.deliveryDateScheduledEnd)}</p>
                  {order.deliveryDateActual && <p><strong>Actual Delivery:</strong> {format(parseISO(order.deliveryDateActual), 'PPP')}</p>}
                  
                  <Separator className="my-2"/>
                  <p className="font-semibold">Items:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
                    {order.items.map(item => (
                      <li key={item.productId + (item.productName || '')}>
                        {item.productName} (Qty: {item.quantity} per day for {
                          differenceInCalendarDays(parseISO(order.deliveryDateScheduledEnd), parseISO(order.deliveryDateScheduledStart)) + 1
                        } day(s))
                      </li>
                    ))}
                  </ul>
                   {order.notes && (
                    <>
                        <Separator className="my-2"/>
                        <p><strong>Notes:</strong> {order.notes}</p>
                    </>
                   )}
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 mt-2">
                  <p className="text-lg font-semibold text-foreground">Total: ${order.grandTotal.toFixed(2)}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
