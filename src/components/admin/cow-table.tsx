
'use client';

import React, { useState, useEffect } from 'react';
import type { Cow } from '@/types/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit3, Trash2, ImageIcon, FilePlus2, DownloadCloud, VenetianMask, Activity, CalendarDays } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { CowForm } from './cow-form';
import { QuickAddLogDialog } from './quick-add-log-dialog';
import { deleteCow } from '@/app/admin/cows/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { exportToExcel, type ExportColumn } from '@/lib/excel-export';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';


interface CowTableProps {
  initialCows: Cow[];
}

export function CowTable({ initialCows }: CowTableProps) {
  const [cows, setCows] = useState<Cow[]>(initialCows);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingCow, setEditingCow] = useState<Cow | null>(null);
  const [isQuickAddLogOpen, setIsQuickAddLogOpen] = useState(false);
  const [selectedCowForQuickAdd, setSelectedCowForQuickAdd] = useState<Cow | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCows(initialCows);
  }, [initialCows]);
  
  const handleEdit = (cow: Cow) => {
    setEditingCow(cow);
    setIsEditFormOpen(true);
  };

  const handleOpenQuickAddLog = (cow: Cow) => {
    setSelectedCowForQuickAdd(cow);
    setIsQuickAddLogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteCow(id);
    if (result.success) {
      toast({ title: 'Cow Deleted', description: result.message });
      // Update client-side state for immediate feedback
      setCows(prevCows => prevCows.filter(cow => cow.id !== id));
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };
  
  const onEditFormSuccess = () => {
    setIsEditFormOpen(false);
    setEditingCow(null);
    // Data will be re-fetched by page due to revalidatePath in action
  };

  const onQuickAddLogSuccess = () => {
    setIsQuickAddLogOpen(false); 
    setSelectedCowForQuickAdd(null);
  }

  const handleDownloadExcel = () => {
    const columns: ExportColumn<Cow>[] = [
      { header: 'ID', accessor: 'id' },
      { header: 'Name', accessor: 'name' },
      { header: 'Age (Years)', accessor: 'age' },
      { header: 'Date of Birth', accessor: (item) => item.dateOfBirth ? format(parseISO(item.dateOfBirth), 'yyyy-MM-dd') : '' },
      { header: 'Breed', accessor: 'breed' },
      { header: 'Gender', accessor: 'gender'},
      { header: 'Lactation Status', accessor: 'lactation'},
      { header: 'Mother', accessor: 'mother'},
      { header: 'Father', accessor: 'father'},
      { header: 'Description', accessor: 'description' },
      { header: 'Image URL', accessor: 'imageUrl' },
      { header: 'Date Added', accessor: (item) => item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : ''},
      { header: 'Last Updated', accessor: (item) => item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : ''},
    ];
    exportToExcel(cows, 'cows_export', 'Cows', columns);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleDownloadExcel} variant="outline">
          <DownloadCloud className="mr-2 h-4 w-4" />
          Download Excel
        </Button>
      </div>
      {cows.length === 0 ? (
        <Alert>
          <AlertTitle>No Cows Found</AlertTitle>
          <AlertDescription>
            There are no cows in the database yet. Click "Add New Cow" to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-[50px] hidden sm:table-cell">Age</TableHead>
              <TableHead className="hidden md:table-cell">DOB</TableHead>
              <TableHead className="hidden sm:table-cell">Breed</TableHead>
              <TableHead className="w-[80px] hidden md:table-cell">Gender</TableHead>
              <TableHead className="hidden lg:table-cell">Lactation</TableHead>
              <TableHead className="text-right w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cows.map((cow) => (
              <TableRow key={cow.id}>
                <TableCell>
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                  {cow.imageUrl ? (
                      <Image src={cow.imageUrl} alt={cow.name} width={40} height={40} className="object-cover w-full h-full" data-ai-hint="cow portrait" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <Button variant="link" className="p-0 h-auto" onClick={() => handleOpenQuickAddLog(cow)}>
                    {cow.name}
                  </Button>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{cow.age} yrs</TableCell>
                <TableCell className="hidden md:table-cell">
                  {cow.dateOfBirth ? format(parseISO(cow.dateOfBirth), 'MMM d, yyyy') : '-'}
                </TableCell>
                <TableCell className="hidden sm:table-cell">{cow.breed}</TableCell>
                <TableCell className="hidden md:table-cell">
                    {cow.gender === 'Female' ? 
                        <Badge variant="secondary" className="bg-pink-100 text-pink-700">Female</Badge> : 
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">Male</Badge>
                    }
                </TableCell>
                <TableCell className="hidden lg:table-cell">{cow.lactation || '-'}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenQuickAddLog(cow)}>
                          <FilePlus2 className="mr-2 h-4 w-4" />
                          Add Log
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(cow)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit Cow
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Cow
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the cow named "{cow.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(cow.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}
      
      <Dialog open={isEditFormOpen} onOpenChange={(open) => { setIsEditFormOpen(open); if (!open) setEditingCow(null); }}>
        <DialogContent className="sm:max-w-lg">
           {editingCow && <CowForm cow={editingCow} onFormSubmitSuccess={onEditFormSuccess} />}
        </DialogContent>
      </Dialog>

      {selectedCowForQuickAdd && (
        <QuickAddLogDialog
          cow={selectedCowForQuickAdd}
          allCows={cows} 
          open={isQuickAddLogOpen}
          onOpenChange={setIsQuickAddLogOpen}
          onLogAdded={onQuickAddLogSuccess}
        />
      )}
    </>
  );
}
