
import { getDeliveriesForDateAction } from '@/app/delivery/actions';
import { DeliveryDashboardClient } from '@/components/delivery/delivery-dashboard-client';
import { format } from 'date-fns';

export default async function DeliveryDashboardPage() {
  // Fetch initial orders for today to pass to the client component
  // The client component will handle fetching for other dates
  const today = format(new Date(), 'yyyy-MM-dd');
  const initialDeliveries = await getDeliveriesForDateAction(today);

  return (
    <div>
      <DeliveryDashboardClient initialDeliveries={initialDeliveries} initialDate={today} />
    </div>
  );
}
