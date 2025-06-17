
import { ListChecks } from 'lucide-react';
import { FeedLogTable } from '@/components/admin/feed-log-table';
import { getFeedLogs, getCows } from '@/lib/admin-db';
import { AddFeedLogDialog } from '@/components/admin/add-feed-log-dialog';
import type { FeedLog, Cow } from '@/types/admin';

export default async function AdminFeedLogsPage() {
  const initialFeedLogs: FeedLog[] = await getFeedLogs();
  const cows: Cow[] = await getCows();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
        <div>
            <h1 className="text-4xl font-headline font-bold text-foreground flex items-center">
                <ListChecks className="mr-3 h-10 w-10 text-primary" /> Feed Log Management
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Log daily feed intake for each cow using a categorized table. View historical logs below.
            </p>
        </div>
        <AddFeedLogDialog cows={cows} triggerButtonText="Log/Edit Daily Feed" />
      </div>
      
      <FeedLogTable key={initialFeedLogs.length} initialFeedLogs={initialFeedLogs} cows={cows} />
    </div>
  );
}

