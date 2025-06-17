
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { FeedLog, Cow, FoodCategory } from '@/types/admin';
import { ALL_FOOD_ITEMS } from '@/types/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, ListChecks, CalendarDays, ArrowUpDown, FilterX, CalendarIcon, DownloadCloud } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { AddFeedLogDialog } from './add-feed-log-dialog'; 
import { deleteFeedLogsForDayAction } from '@/app/admin/feed/actions';
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

interface FeedLogTableProps {
  initialFeedLogs: FeedLog[];
  cows: Cow[]; 
}

type SortKey = 'date' | 'cowName';

export function FeedLogTable({ initialFeedLogs, cows }: FeedLogTableProps) {
  const { toast } = useToast();

  const [filterCowId, setFilterCowId] = useState<string | undefined>();
  const [filterDate, setFilterDate] = useState<Date | undefined>();
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending'});

  const cowNameMap = useMemo(() => {
    return new Map(cows.map(cow => [cow.id, cow.name]));
  }, [cows]);

  const foodItemDetailsMap = useMemo(() => {
    return new Map(ALL_FOOD_ITEMS.map(item => [item.name, { category: item.category as FoodCategory }]));
  }, []);

  const displayedLogs = useMemo(() => {
    let logs = [...initialFeedLogs];

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
            return parseISO(b.date).getTime() - parseISO(a.date).getTime(); 
        } else if (sortConfig.key === 'date') {
            return (cowNameMap.get(a.cowId) || '').localeCompare(cowNameMap.get(b.cowId) || '');
        }
        return 0;
      });
    } else {
        logs.sort((a, b) => {
            const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateComparison !== 0) return dateComparison;
            const cowA = cows.find(c => c.id === a.cowId)?.name || '';
            const cowB = cows.find(c => c.id === b.cowId)?.name || '';
            return cowA.localeCompare(cowB);
        });
    }
    return logs;
  }, [initialFeedLogs, filterCowId, filterDate, sortConfig, cowNameMap, cows]);


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
  
  const handleDeleteDay = async (cowId: string, date: string) => {
    const result = await deleteFeedLogsForDayAction(cowId, date);
    if (result.success) {
      toast({ title: 'Daily Feed Logs Deleted', description: result.message });
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };

  const clearFilters = () => {
    setFilterCowId(undefined);
    setFilterDate(undefined);
    setSortConfig({ key: 'date', direction: 'descending' });
  };

  const handleDownloadExcel = () => {
    const dataToExport = displayedLogs.map(log => {
        const cowName = cowNameMap.get(log.cowId) || 'Unknown Cow';
        const foodDetails = foodItemDetailsMap.get(log.foodName);
        return {
            Date: format(parseISO(log.date), 'yyyy-MM-dd'),
            'Cow Name': cowName,
            'Food Name': log.foodName,
            'Food Category': foodDetails?.category || 'N/A',
            'Quantity (Kg)': log.quantityKg.toFixed(1),
            Notes: log.notes || '',
        };
    });
    // No need to define columns explicitly if the mapped object keys are desired as headers
    exportToExcel(dataToExport, 'feed_logs_export', 'Feed Logs');
  };
  
  return (
    <>
      <div className="mb-4 p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div>
            <Label htmlFor="cow-filter">Filter by Cow</Label>
            <Select value={filterCowId || 'all'} onValueChange={(value) => setFilterCowId(value === 'all' ? undefined : value)}>
              <SelectTrigger id="cow-filter">
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
            <Label htmlFor="date-filter">Filter by Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-filter"
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
            <ListChecks className="h-5 w-5 mr-2" />
            <AlertTitle>No Feed Logs Found</AlertTitle>
            <AlertDescription>
            No logs match your current filters, or there are no logs in the database. Try adjusting filters or click "Log/Edit Daily Feed".
            </AlertDescription>
        </Alert>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">
                <Button variant="ghost" onClick={() => requestSort('date')} className="px-1 py-0 h-auto font-medium">
                  Date {getSortIcon('date')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('cowName')} className="px-1 py-0 h-auto font-medium">
                  Cow {getSortIcon('cowName')}
                </Button>
              </TableHead>
              <TableHead>Food Name</TableHead>
              <TableHead>Food Type</TableHead>
              <TableHead className="text-right w-[100px]">Qty (Kg)</TableHead>
              <TableHead className="hidden md:table-cell">Notes</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedLogs.map((log) => {
              const foodDetails = foodItemDetailsMap.get(log.foodName);
              const cowName = cowNameMap.get(log.cowId) || 'Unknown Cow';
              
              return (
                <TableRow key={log.id}>
                  <TableCell>{format(parseISO(log.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-medium">{cowName}</TableCell>
                  <TableCell>{log.foodName}</TableCell>
                  <TableCell>{foodDetails?.category || 'N/A'}</TableCell>
                  <TableCell className="text-right">{log.quantityKg.toFixed(1)}</TableCell>
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
                           <DropdownMenuItem asChild>
                             <AddFeedLogDialog 
                                cows={cows} 
                                initialCowId={log.cowId} 
                                initialDate={log.date}
                                propInitialLogs={initialFeedLogs.filter(l => l.cowId === log.cowId && l.date === log.date)}
                                triggerButtonText="Edit Daily Log"
                                triggerButtonVariant="ghost"
                             >
                                <div className="flex items-center w-full px-2 py-1.5 text-sm cursor-default hover:bg-accent rounded-sm">
                                    <CalendarDays className="mr-2 h-4 w-4" /> Edit Daily Log
                                </div>
                             </AddFeedLogDialog>
                           </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Day's Logs
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all feed logs for {cowName} on {format(parseISO(log.date), 'PPP')}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteDay(log.cowId, log.date)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete All For Day
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </>
  );
}
