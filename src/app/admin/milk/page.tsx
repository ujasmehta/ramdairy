
import { Button } from '@/components/ui/button';
import { MilkIcon, PlusCircle } from 'lucide-react';
import { MilkLogTable } from '@/components/admin/milk-log-table';
import { getMilkLogs, getCows } from '@/lib/admin-db';
import { AddMilkLogDialog } from '@/components/admin/add-milk-log-dialog';
import type { MilkLog, Cow } from '@/types/admin';

export default async function AdminMilkLogsPage() {
  const initialMilkLogs: MilkLog[] = await getMilkLogs();
  const cows: Cow[] = await getCows();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
        <div>
            <h1 className="text-4xl font-headline font-bold text-foreground flex items-center">
                <MilkIcon className="mr-3 h-10 w-10 text-primary" /> Milk Log Management
            </h1>
            <p className="text-lg text-muted-foreground mt-2">Track daily milk production for each cow.</p>
        </div>
        <AddMilkLogDialog cows={cows} />
      </div>
      
      <MilkLogTable key={initialMilkLogs.length} initialMilkLogs={initialMilkLogs} cows={cows} />
    </div>
  );
}

