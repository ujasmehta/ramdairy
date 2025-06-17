
import { db } from './firebase';
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    writeBatch,
    Timestamp
} from 'firebase/firestore';
import type { Cow, FeedLog, FoodName, MilkLog, Customer, Product, Order, OrderItem, OrderStatus } from '@/types/admin';
// import { ALL_FOOD_ITEMS } from '@/types/admin'; // ALL_FOOD_ITEMS is used for client-side form generation, not stored in DB
import { format, parseISO, differenceInCalendarDays, isWithinInterval, startOfDay, subYears } from 'date-fns';

// Collection references
const cowsCollectionRef = collection(db, 'cows');
const feedLogsCollectionRef = collection(db, 'feedLogs');
const milkLogsCollectionRef = collection(db, 'milkLogs');
const customersCollectionRef = collection(db, 'customers');
const productsCollectionRef = collection(db, 'products');
const ordersCollectionRef = collection(db, 'orders');

/*
// Mock Data (Commented out - Seed this data into your Firestore collections)

let cows_mock: Cow[] = [
  { id: '1', name: 'Lakshmi', age: 7, dateOfBirth: format(subYears(new Date(), 7), 'yyyy-MM-dd'), breed: 'GIR', gender: 'Female', lactation: 'Lactating - 3rd', mother: 'Kamadhenu', father: 'Nandi', description: 'A gentle and nurturing matriarch, known for her calm demeanor and high-quality milk.', dateAdded: new Date().toISOString(), lastUpdated: new Date().toISOString(), imageUrl: 'https://placehold.co/100x100.png' },
  { id: '2', name: 'Ganga', age: 5, dateOfBirth: format(subYears(new Date(), 5), 'yyyy-MM-dd'), breed: 'GIR', gender: 'Female', lactation: 'Dry', mother: 'Yamuna', father: 'Nandi Jr.', description: 'Named after the holy river, Ganga is a spirited cow with a playful personality.', dateAdded: new Date().toISOString(), lastUpdated: new Date().toISOString(), imageUrl: 'https://placehold.co/100x100.png'  },
  { id: '3', name: 'Saraswati', age: 6, dateOfBirth: format(subYears(new Date(), 6), 'yyyy-MM-dd'), breed: 'GIR', gender: 'Female', lactation: 'Heifer', mother: 'Gayatri', father: 'Brahma Bull', description: 'Wise and serene, Saraswati is a picture of health and vitality.', dateAdded: new Date().toISOString(), lastUpdated: new Date().toISOString(), imageUrl: 'https://placehold.co/100x100.png'  },
  { id: '4', name: 'Krishna', age: 4, dateOfBirth: format(subYears(new Date(), 4), 'yyyy-MM-dd'), breed: 'GIR', gender: 'Male', lactation: 'Bull - Breeding', description: 'A strong and healthy bull.', dateAdded: new Date().toISOString(), lastUpdated: new Date().toISOString(), imageUrl: 'https://placehold.co/100x100.png'  },
];

let feedLogs_mock: FeedLog[] = [
    { 
        id: 'fl1', 
        cowId: '1', 
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], 
        foodName: 'READYMADE FEED',
        quantityKg: 5,
        notes: 'Good appetite', 
        dateAdded: new Date().toISOString(), 
        lastUpdated: new Date().toISOString() 
    },
    { 
        id: 'fl2', 
        cowId: '1', 
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], 
        foodName: 'NEPIER MAKAI',
        quantityKg: 15,
        notes: 'Good appetite', // Notes are duplicated for the day
        dateAdded: new Date().toISOString(), 
        lastUpdated: new Date().toISOString() 
    },
];

let milkLogs_mock: MilkLog[] = [
    {
        id: 'ml1',
        cowId: '1',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], 
        timeOfDay: 'Morning',
        quantityLiters: 8,
        fatPercentage: 4.2,
        notes: 'Normal yield',
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
    },
];

let customers_mock: Customer[] = [
    { id: 'cust1', name: 'Arjun Patel', email: 'arjun.patel@example.com', phone: '123-456-7890', addressLine1: '12 Vedic Lane', addressLine2: 'Apt 3B', city: 'Ayodhya', stateOrProvince: 'Uttar Pradesh', postalCode: '12345', googleMapsPinLink: 'https://maps.app.goo.gl/examplePinArjun', joinDate: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0], dateAdded: new Date().toISOString(), lastUpdated: new Date().toISOString()},
    { id: 'cust2', name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '987-654-3210', addressLine1: '45 Dharma Rd', city: 'Vrindavan', stateOrProvince: 'Uttar Pradesh', postalCode: '67890',googleMapsPinLink: 'https://maps.app.goo.gl/examplePinPriya', joinDate: new Date(Date.now() - 86400000 * 60).toISOString().split('T')[0], dateAdded: new Date().toISOString(), lastUpdated: new Date().toISOString()},
];

let products_mock: Product[] = [
    { id: 'prod1', name: 'Pure GIR Cow A2 Milk', description: 'Fresh, raw A2 milk.', pricePerUnit: 8, unit: 'liter', dateAdded: new Date().toISOString(), lastUpdated: new Date().toISOString(), imageUrl: 'https://placehold.co/100x100.png' },
    { id: 'prod2', name: 'Artisanal GIR Cow Ghee', description: 'Traditional Vedic Ghee.', pricePerUnit: 25, unit: 'kg', dateAdded: new Date().toISOString(), lastUpdated: new Date().toISOString(), imageUrl: 'https://placehold.co/100x100.png' },
    { id: 'prod3', name: 'Organic GIR Cow Curd', description: 'Creamy probiotic curd.', pricePerUnit: 6, unit: 'kg', dateAdded: new Date().toISOString(), lastUpdated: new Date().toISOString(), imageUrl: 'https://placehold.co/100x100.png' },
];

// Initial Order Mock requires getCustomerDetailsForOrder_mock
const getCustomerDetailsForOrder_mock = (customerId: string): Partial<Order> => {
    const customer = customers_mock.find(c => c.id === customerId);
    if (!customer) return { customerName: 'Unknown Customer' };
    return {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddressLine1: customer.addressLine1,
        customerAddressLine2: customer.addressLine2,
        customerCity: customer.city,
        customerPostalCode: customer.postalCode,
        customerGoogleMapsPinLink: customer.googleMapsPinLink,
    };
};

let orders_mock: Order[] = [
    { 
        id: 'ord1', 
        orderNumber: `ORD-${Date.now() - 86400000 * 3}`, 
        customerId: 'cust1',
        ...getCustomerDetailsForOrder_mock('cust1'),
        orderDate: format(new Date(Date.now() - 86400000 * 3), 'yyyy-MM-dd'), 
        deliveryDateScheduledStart: format(new Date(Date.now() - 86400000 * 2), 'yyyy-MM-dd'), 
        deliveryDateScheduledEnd: format(new Date(Date.now() - 86400000 * 2), 'yyyy-MM-dd'),
        deliveryDateActual: format(new Date(Date.now() - 86400000 * 2), 'yyyy-MM-dd'),
        items: [ 
            { productId: 'prod1', productName: 'Pure GIR Cow A2 Milk', quantity: 2, unitPrice: 8, itemTotal: 16 }, 
            { productId: 'prod2', productName: 'Artisanal GIR Cow Ghee', quantity: 1, unitPrice: 25, itemTotal: 25 }
        ],
        subTotal: 41, 
        deliveryCharge: 5,
        discount: 0,
        grandTotal: 46, 
        status: 'Delivered',
        paymentStatus: 'Paid',
        notes: 'Delivered yesterday morning.',
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
    },
     { 
        id: 'ord2', 
        orderNumber: `ORD-${Date.now() - 86400000}`, 
        customerId: 'cust2',
        ...getCustomerDetailsForOrder_mock('cust2'),
        orderDate: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'), 
        deliveryDateScheduledStart: format(new Date(), 'yyyy-MM-dd'), 
        deliveryDateScheduledEnd: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), 
        items: [
            { productId: 'prod3', productName: 'Organic GIR Cow Curd', quantity: 3, unitPrice: 6, itemTotal: 36 } 
        ],
        subTotal: 36, 
        deliveryCharge: 0,
        discount: 2,
        grandTotal: 34,
        status: 'Confirmed',
        paymentStatus: 'Pending',
        notes: 'Scheduled for delivery today and tomorrow.',
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
    },
    { 
        id: 'ord3', 
        orderNumber: `ORD-${Date.now()}`, 
        customerId: 'cust1',
        ...getCustomerDetailsForOrder_mock('cust1'),
        orderDate: format(new Date(), 'yyyy-MM-dd'), 
        deliveryDateScheduledStart: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), 
        deliveryDateScheduledEnd: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), 
        items: [
            { productId: 'prod1', productName: 'Pure GIR Cow A2 Milk', quantity: 4, unitPrice: 8, itemTotal: 32 }
        ],
        subTotal: 32, 
        deliveryCharge: 3,
        discount: 0,
        grandTotal: 35,
        status: 'Processing',
        paymentStatus: 'Paid',
        notes: 'Urgent order for tomorrow.',
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
    }
];
*/

// Cow Functions
export const getCows = async (): Promise<Cow[]> => {
  const q = query(cowsCollectionRef, orderBy('name'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cow));
};

export const getCowById = async (id: string): Promise<Cow | undefined> => {
  const docRef = doc(db, 'cows', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Cow) : undefined;
};

export const addCow = async (cowData: Omit<Cow, 'id' | 'dateAdded' | 'lastUpdated'>): Promise<Cow> => {
  const now = new Date().toISOString();
  const dataToSave = { 
    ...cowData, 
    dateAdded: now,
    lastUpdated: now,
    lactation: cowData.lactation || undefined,
    mother: cowData.mother || undefined,
    father: cowData.father || undefined,
    dateOfBirth: cowData.dateOfBirth || undefined,
  };
  const docRef = await addDoc(cowsCollectionRef, dataToSave);
  return { id: docRef.id, ...dataToSave };
};

export const updateCow = async (id: string, cowData: Partial<Omit<Cow, 'id' | 'dateAdded' | 'lastUpdated'>>): Promise<Cow | null> => {
  const docRef = doc(db, 'cows', id);
  await updateDoc(docRef, { ...cowData, lastUpdated: new Date().toISOString() });
  const updatedDocSnap = await getDoc(docRef);
  return updatedDocSnap.exists() ? ({ id: updatedDocSnap.id, ...updatedDocSnap.data() } as Cow) : null;
};

export const deleteCow = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'cows', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting cow:", error);
    return false;
  }
};

// FeedLog Functions
export const getFeedLogs = async (): Promise<FeedLog[]> => {
  const q = query(feedLogsCollectionRef, orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedLog));
};

export const getFeedLogsByCowAndDate = async (cowId: string, date: string): Promise<FeedLog[]> => {
  const q = query(feedLogsCollectionRef, where('cowId', '==', cowId), where('date', '==', date));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedLog));
};

export const saveDailyFeedLogs = async (cowId: string, date: string, items: { foodName: FoodName, quantityKg: number }[], notes?: string): Promise<FeedLog[]> => {
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  // 1. Delete existing logs for this cow and date
  const q = query(feedLogsCollectionRef, where('cowId', '==', cowId), where('date', '==', date));
  const existingLogsSnapshot = await getDocs(q);
  existingLogsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  // 2. Add new logs
  const newLogs: FeedLog[] = [];
  for (const item of items) {
    if (item.quantityKg > 0) {
      // Create a new doc reference for each log entry to get an ID for return
      const newLogRef = doc(collection(db, 'feedLogs')); 
      const newLogData = {
        cowId,
        date,
        foodName: item.foodName,
        quantityKg: item.quantityKg,
        notes: notes || undefined,
        dateAdded: now,
        lastUpdated: now,
      };
      batch.set(newLogRef, newLogData);
      newLogs.push({ id: newLogRef.id, ...newLogData });
    }
  }

  await batch.commit();
  return newLogs;
};

export const deleteFeedLogsForDay = async (cowId: string, date: string): Promise<boolean> => {
  const batch = writeBatch(db);
  const q = query(feedLogsCollectionRef, where('cowId', '==', cowId), where('date', '==', date));
  const logsSnapshot = await getDocs(q);
  
  if (logsSnapshot.empty) return false; // No logs to delete

  logsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  return true;
};


// MilkLog Functions
export const getMilkLogs = async (): Promise<MilkLog[]> => {
    const q = query(milkLogsCollectionRef, orderBy('date', 'desc'), orderBy('timeOfDay', 'asc')); // Morning first
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MilkLog));
};

export const getMilkLogById = async (id: string): Promise<MilkLog | undefined> => {
    const docRef = doc(db, 'milkLogs', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as MilkLog) : undefined;
};

export const addMilkLog = async (milkLogData: Omit<MilkLog, 'id' | 'dateAdded' | 'lastUpdated'>): Promise<MilkLog> => {
    const now = new Date().toISOString();
    const dataToSave = { 
        ...milkLogData, 
        dateAdded: now, 
        lastUpdated: now 
    };
    const docRef = await addDoc(milkLogsCollectionRef, dataToSave);
    return { id: docRef.id, ...dataToSave };
};

export const updateMilkLog = async (id: string, milkLogData: Partial<Omit<MilkLog, 'id' | 'dateAdded' | 'lastUpdated'>>): Promise<MilkLog | null> => {
    const docRef = doc(db, 'milkLogs', id);
    await updateDoc(docRef, { ...milkLogData, lastUpdated: new Date().toISOString() });
    const updatedDocSnap = await getDoc(docRef);
    return updatedDocSnap.exists() ? ({ id: updatedDocSnap.id, ...updatedDocSnap.data() } as MilkLog) : null;
};

export const deleteMilkLog = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'milkLogs', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting milk log:", error);
    return false;
  }
};

// Customer Functions
export const getCustomers = async (): Promise<Customer[]> => {
  const q = query(customersCollectionRef, orderBy('name'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
  if (!id) return undefined;
  const docRef = doc(db, 'customers', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Customer) : undefined;
};

export const addCustomer = async (customerData: Omit<Customer, 'id' | 'dateAdded' | 'lastUpdated'>): Promise<Customer> => {
  const now = new Date().toISOString();
  const dataToSave = { 
    ...customerData, 
    dateAdded: now, 
    lastUpdated: now 
  };
  const docRef = await addDoc(customersCollectionRef, dataToSave);
  return { id: docRef.id, ...dataToSave };
};

export const updateCustomer = async (id: string, customerData: Partial<Omit<Customer, 'id' | 'dateAdded' | 'lastUpdated'>>): Promise<Customer | null> => {
  const docRef = doc(db, 'customers', id);
  await updateDoc(docRef, { ...customerData, lastUpdated: new Date().toISOString() });
  const updatedDocSnap = await getDoc(docRef);
  return updatedDocSnap.exists() ? ({ id: updatedDocSnap.id, ...updatedDocSnap.data() } as Customer) : null;
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  try {
    // Note: Deleting associated orders is a complex operation and typically handled with care.
    // For simplicity here, we're just deleting the customer.
    // In a real app, consider how to handle/archive orders or use Firestore functions for cascading deletes.
    const docRef = doc(db, 'customers', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting customer:", error);
    return false;
  }
};

// Product Functions
export const getProducts = async (): Promise<Product[]> => {
  const q = query(productsCollectionRef, orderBy('name'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  if (!id) return undefined;
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Product) : undefined;
};

// Helper for denormalizing customer data into orders
const getCustomerDetailsForOrder = async (customerId: string): Promise<Partial<Order>> => {
    const customer = await getCustomerById(customerId);
    if (!customer) return { customerName: 'Unknown Customer' };
    return {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddressLine1: customer.addressLine1,
        customerAddressLine2: customer.addressLine2,
        customerCity: customer.city,
        customerPostalCode: customer.postalCode,
        customerGoogleMapsPinLink: customer.googleMapsPinLink,
    };
};

// Helper for calculating order totals based on product prices from Firestore
const calculateOrderTotals = async (
    inputItems: Omit<OrderItem, 'itemTotal' | 'productName' | 'unitPrice'>[], 
    deliveryCharge: number = 0, 
    discount: number = 0,
    numberOfDays: number = 1 
): Promise<Pick<Order, 'subTotal' | 'grandTotal' | 'items'>> => {
  
  const processedItems: OrderItem[] = [];
  for (const item of inputItems) {
    const product = await getProductById(item.productId);
    const unitPrice = product?.pricePerUnit || 0;
    processedItems.push({
      productId: item.productId,
      quantity: item.quantity, 
      productName: product?.name || 'Unknown Product',
      unitPrice: unitPrice,
      itemTotal: item.quantity * unitPrice * numberOfDays, 
    });
  }

  const subTotal = processedItems.reduce((sum, item) => sum + (item.itemTotal || 0), 0);
  const grandTotal = subTotal + deliveryCharge - discount; 
  return { subTotal, grandTotal, items: processedItems };
};


// Order Functions
export const getOrders = async (): Promise<Order[]> => {
  const q = query(ordersCollectionRef, orderBy('orderDate', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  const docRef = doc(db, 'orders', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Order) : undefined;
};

export const getOrdersByCustomerId = async (customerId: string): Promise<Order[]> => {
  const q = query(ordersCollectionRef, where('customerId', '==', customerId), orderBy('orderDate', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const getOrdersForDeliveryByDate = async (deliveryDate: string): Promise<Order[]> => {
    const targetDateStr = format(parseISO(deliveryDate), 'yyyy-MM-dd'); // Ensure consistent format
    const relevantStatuses: OrderStatus[] = ['Confirmed', 'Processing', 'Out for Delivery'];
    
    // Query for orders where deliveryDateScheduledStart is on or before the target date
    // and status is one of the relevant ones.
    // Client-side filtering for deliveryDateScheduledEnd >= targetDate will be needed
    // because Firestore doesn't support range queries on different fields simultaneously.
    const q = query(ordersCollectionRef, 
        where('deliveryDateScheduledStart', '<=', targetDateStr),
        where('status', 'in', relevantStatuses)
        // orderBy('deliveryDateScheduledStart') // Optional: May require an index
    );
    const querySnapshot = await getDocs(q);
    
    const ordersForDate = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Order))
        .filter(order => {
            // Client-side filter for end date
            return order.deliveryDateScheduledEnd >= targetDateStr;
        })
        .sort((a, b) => (a.customerName || '').localeCompare(b.customerName || '')); // Sort by customer name

    return ordersForDate;
};


type AddOrderData = Omit<Order, 'id' | 'orderNumber' | 'subTotal' | 'grandTotal' | 'dateAdded' | 'lastUpdated' | 'customerName' | 'customerPhone' | 'customerAddressLine1' | 'customerAddressLine2' | 'customerCity' | 'customerPostalCode' | 'customerGoogleMapsPinLink' | 'items' | 'deliveryDateActual'> & { 
  items: Omit<OrderItem, 'itemTotal' | 'productName' | 'unitPrice'>[] 
};

export const addOrder = async (orderData: AddOrderData): Promise<Order> => {
  let numberOfDays = 1;
  if (orderData.deliveryDateScheduledStart && orderData.deliveryDateScheduledEnd) {
      const start = parseISO(orderData.deliveryDateScheduledStart);
      const end = parseISO(orderData.deliveryDateScheduledEnd);
      numberOfDays = differenceInCalendarDays(end, start) + 1;
      if (numberOfDays < 1) numberOfDays = 1;
  }

  const totals = await calculateOrderTotals(orderData.items, orderData.deliveryCharge, orderData.discount, numberOfDays);
  const customerInfo = await getCustomerDetailsForOrder(orderData.customerId);
  const now = new Date().toISOString();
  
  const newOrderData = {
    ...orderData,
    ...customerInfo,
    orderNumber: `ORD-${Date.now()}`, // Firestore generates IDs, so this is for display
    items: totals.items,
    subTotal: totals.subTotal,
    grandTotal: totals.grandTotal,
    dateAdded: now,
    lastUpdated: now,
  };
  const docRef = await addDoc(ordersCollectionRef, newOrderData);
  return { id: docRef.id, ...newOrderData };
};

type UpdateOrderData = Partial<Omit<Order, 'id' | 'orderNumber' | 'subTotal' | 'grandTotal' | 'dateAdded' | 'lastUpdated' | 'customerName' | 'customerPhone' | 'customerAddressLine1' | 'customerAddressLine2' | 'customerCity' | 'customerPostalCode' | 'customerGoogleMapsPinLink' | 'items' >> & { 
  items?: Omit<OrderItem, 'itemTotal' | 'productName' | 'unitPrice'>[] 
};

export const updateOrder = async (id: string, orderData: UpdateOrderData): Promise<Order | null> => {
  const docRef = doc(db, 'orders', id);
  const existingOrderSnap = await getDoc(docRef);
  if (!existingOrderSnap.exists()) return null;
  const existingOrder = existingOrderSnap.data() as Order;

  let customerInfo = {
      customerName: existingOrder.customerName,
      customerPhone: existingOrder.customerPhone,
      customerAddressLine1: existingOrder.customerAddressLine1,
      customerAddressLine2: existingOrder.customerAddressLine2,
      customerCity: existingOrder.customerCity,
      customerPostalCode: existingOrder.customerPostalCode,
      customerGoogleMapsPinLink: existingOrder.customerGoogleMapsPinLink,
  };

  if (orderData.customerId && orderData.customerId !== existingOrder.customerId) {
      customerInfo = await getCustomerDetailsForOrder(orderData.customerId);
  } else if (!existingOrder.customerName && existingOrder.customerId) {
      // If existing order somehow missed customer details but had ID
      customerInfo = await getCustomerDetailsForOrder(existingOrder.customerId);
  }
  
  const deliveryDateScheduledStart = orderData.deliveryDateScheduledStart || existingOrder.deliveryDateScheduledStart;
  const deliveryDateScheduledEnd = orderData.deliveryDateScheduledEnd || existingOrder.deliveryDateScheduledEnd;
  let numberOfDays = 1;
  if (deliveryDateScheduledStart && deliveryDateScheduledEnd) {
      const start = parseISO(deliveryDateScheduledStart);
      const end = parseISO(deliveryDateScheduledEnd);
      numberOfDays = differenceInCalendarDays(end, start) + 1;
      if (numberOfDays < 1) numberOfDays = 1;
  }
  
  const itemsToProcess = orderData.items || existingOrder.items.map(i => ({productId: i.productId, quantity: i.quantity})); 
  const deliveryCharge = orderData.deliveryCharge !== undefined ? orderData.deliveryCharge : existingOrder.deliveryCharge;
  const discount = orderData.discount !== undefined ? orderData.discount : existingOrder.discount;
  
  const totals = await calculateOrderTotals(itemsToProcess, deliveryCharge, discount, numberOfDays);

  const dataToUpdate = {
    ...orderData,
    ...customerInfo, // Apply potentially updated customer details
    items: totals.items, 
    subTotal: totals.subTotal,
    grandTotal: totals.grandTotal,
    deliveryDateScheduledStart, 
    deliveryDateScheduledEnd,   
    lastUpdated: new Date().toISOString(),
  }; 

  // Remove undefined fields from dataToUpdate before sending to Firestore
  Object.keys(dataToUpdate).forEach(key => {
    if ((dataToUpdate as any)[key] === undefined) {
      delete (dataToUpdate as any)[key];
    }
  });

  await updateDoc(docRef, dataToUpdate);
  const updatedDocSnap = await getDoc(docRef);
  return updatedDocSnap.exists() ? ({ id: updatedDocSnap.id, ...updatedDocSnap.data() } as Order) : null;
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'orders', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting order:", error);
    return false;
  }
};
