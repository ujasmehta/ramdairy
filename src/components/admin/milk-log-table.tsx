
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { MilkLog, Cow } from '@/types/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit3, Trash2, MilkIcon, ArrowUpDown, FilterX, CalendarIcon, DownloadCloud } from 'lucide-react';
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
import { MilkLogForm } from './milk-log-form';
import { deleteMilkLogAction } from '@/app/admin/milk/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO, isEqual, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';
import { exportToExcel, type ExportColumn } from '@/lib/excel-export';

interface MilkLogTableProps {
  initialMilkLogs: MilkLog[];
  cows: Cow[]; 
}

type SortKey = 'date' | 'cowName';

export function MilkLogTable({ initialMilkLogs, cows }: MilkLogTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMilkLog, setEditingMilkLog] = useState<MilkLog | null>(null);
  const { toast } = useToast();

  const [filterCowId, setFilterCowId] = useState<string | undefined>();
  const [filterDate, setFilterDate] = useState<Date | undefined>();
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending'});

  const cowNameMap = useMemo(() => {
    return new Map(cows.map(cow => [cow.id, cow.name]));
  }, [cows]);
  
  const displayedLogs = useMemo(() => {
    let logs = [...initialMilkLogs];

    if (filterCowId && filterCowId !== 'all') {
      logs = logs.filter(log => log.cowId === filterCowId);
    }

    if (filterDate) {
      const targetDate = startOfDay(filterDate);
      logs = logs.filter(log => isEqual(startOfDay(parseISO(log.date)), targetDate));
    }
    
    if (sortConfig !== null) {
      logs.sort((a, b) => {
        let valA, valB;
        if (sortConfig.key === 'date') {
          valA = parseISO(a.date).getTime();
          valB = parseISO(b.date).getTime();
        } else { 
          valA = cowNameMap.get(a.cowId) || '';
          valB = cowNameMap.get(b.cowId) || '';
        }

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        if (sortConfig.key === 'cowName') {
            const dateComp = parseISO(b.date).getTime() - parseISO(a.date).getTime();
            if (dateComp !== 0) return dateComp;
        } else if (sortConfig.key === 'date') {
            const cowComp = (cowNameMap.get(a.cowId) || '').localeCompare(cowNameMap.get(b.cowId) || '');
            if (cowComp !== 0) return cowComp;
        }
        if (a.timeOfDay === 'Morning' && b.timeOfDay === 'Evening') return -1;
        if (a.timeOfDay === 'Evening' && b.timeOfDay === 'Morning') return 1;
        return 0;
      });
    } else {
        logs.sort((a, b) => {
            const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateComparison !== 0) return dateComparison;
            if (a.timeOfDay === 'Morning' && b.timeOfDay === 'Evening') return -1;
            if (a.timeOfDay === 'Evening' && b.timeOfDay === 'Morning') return 1;
            const cowA = cowNameMap.get(a.cowId) || '';
            const cowB = cowNameMap.get(b.cowId) || '';
            return cowA.localeCompare(cowB);
        });
    }
    return logs;
  }, [initialMilkLogs, filterCowId, filterDate, sortConfig, cowNameMap]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUpDown className="ml-2 h-3 w-3 text-primary transform rotate-180" /> : <ArrowUpDown className="ml-2 h-3 w-3 text-primary" />;
  };

  const handleEdit = (milkLog: MilkLog) => {
    setEditingMilkLog(milkLog);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteMilkLogAction(id);
    if (result.success) {
      toast({ title: 'Milk Log Deleted', description: result.message });
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };
  
  const onFormSuccess = () => {
    setIsFormOpen(false);
    setEditingMilkLog(null);
  };

  const clearFilters = () => {
    setFilterCowId(undefined);
    setFilterDate(undefined);
    setSortConfig({ key: 'date', direction: 'descending' }); 
  };

  const handleDownloadExcel = () => {
    const dataToExport = displayedLogs.map(log => {
      const cowName = cowNameMap.get(log.cowId) || 'Unknown Cow';
      return {
        Date: format(parseISO(log.date), 'yyyy-MM-dd'),
        'Cow Name': cowName,
        'Time of Day': log.timeOfDay,
        'Quantity (Liters)': log.quantityLiters.toFixed(1),
        'Fat %': log.fatPercentage?.toFixed(1) || '-',
        'Protein %': log.proteinPercentage?.toFixed(1) || '-',
        Notes: log.notes || '',
      };
    });
    exportToExcel(dataToExport, 'milk_logs_export', 'Milk Logs');
  };

  return (
    <>
      <div className="mb-4 p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div>
            <Label htmlFor="cow-filter-milk">Filter by Cow</Label>
            <Select value={filterCowId || 'all'} onValueChange={(value) => setFilterCowId(value === 'all' ? undefined : value)}>
              <SelectTrigger id="cow-filter-milk">
                <SelectValue placeholder="All Cows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cows</SelectItem>
                {cows.map(cow => (
                  <SelectItem key={cow.id} value={cow.id}>{cow.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date-filter-milk">Filter by Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-filter-milk"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !filterDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filterDate ? format(filterDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filterDate}
                  onSelect={setFilterDate}
                  initialFocus
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={clearFilters} variant="outline" className="sm:col-span-1 md:col-span-1">
            <FilterX className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
          <Button onClick={handleDownloadExcel} variant="outline" className="sm:col-span-1 md:col-span-1">
            <DownloadCloud className="mr-2 h-4 w-4" /> Download Excel
          </Button>
        </div>
      </div>

      {displayedLogs.length === 0 ? (
        <Alert>
            <MilkIcon className="h-5 w-5 mr-2" />
            <AlertTitle>No Milk Logs Found</AlertTitle>
            <AlertDescription>
            No logs match your current filters, or there are no logs in the database. Try adjusting filters or click "Add New Milk Log".
            </AlertDescription>
        </Alert>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('date')} className="px-1 py-0 h-auto font-medium">
                  Date {getSortIcon('date')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('cowName')} className="px-1 py-0 h-auto font-medium">
                  Cow {getSortIcon('cowName')}
                </Button>
              </TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Qty (L)</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Fat %</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Protein %</TableHead>
              <TableHead className="hidden md:table-cell">Notes</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{format(parseISO(log.date), 'MMM d, yyyy')}</TableCell>
                <TableCell className="font-medium">{cowNameMap.get(log.cowId) || 'Unknown Cow'}</TableCell>
                <TableCell>{log.timeOfDay}</TableCell>
                <TableCell className="text-right">{log.quantityLiters.toFixed(1)}</TableCell>
                <TableCell className="hidden sm:table-cell text-right">{log.fatPercentage?.toFixed(1) || '-'}</TableCell>
                <TableCell className="hidden sm:table-cell text-right">{log.proteinPercentage?.toFixed(1) || '-'}</TableCell>
                <TableCell className="hidden md:table-cell truncate max-w-xs" title={log.notes || undefined}>{log.notes || '-'}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(log)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the milk log for {cowNameMap.get(log.cowId)} on {format(parseISO(log.date), 'PPP')} ({log.timeOfDay}).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(log.id)}
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
      )}
      
      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingMilkLog(null); }}>
        <DialogContent className="sm:max-w-lg">
           { (isFormOpen && (editingMilkLog || !editingMilkLog)) && 
             <MilkLogForm 
                milkLog={editingMilkLog} 
                cows={cows} 
                onFormSubmitSuccess={onFormSuccess} 
            />}
        </DialogContent>
      </Dialog>
    </>
  );
}
