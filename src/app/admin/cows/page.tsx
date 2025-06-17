
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { CowTable } from '@/components/admin/cow-table';
import { getCows } from '@/lib/admin-db';
import { AddCowDialog } from '@/components/admin/add-cow-dialog';
import type { Cow } from '@/types/admin'; 

export default async function AdminCowsPage() {
  const initialCows: Cow[] = await getCows(); 

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
        <div>
            <h1 className="text-4xl font-headline font-bold text-foreground">Cow Management</h1>
            <p className="text-lg text-muted-foreground mt-2">View, add, edit, or delete cow profiles in your dairy farm.</p>
        </div>
        <AddCowDialog />
      </div>
      
      <CowTable key={initialCows.length} initialCows={initialCows} />
    </div>
  );
}

