// src/lib/excel-export.ts
import * as XLSX from 'xlsx';

export interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number | undefined | null);
}

// Overload for basic data array (exports all keys as headers)
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  fileName: string,
  sheetName?: string
): void;

// Overload for data array with custom column definitions
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  fileName: string,
  sheetName: string | undefined,
  columns: ExportColumn<T>[]
): void;

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  fileName: string,
  sheetName: string = 'Sheet1',
  columns?: ExportColumn<T>[]
): void {
  let dataToExport: any[];

  if (columns && columns.length > 0) {
    dataToExport = data.map(item => {
      const row: Record<string, any> = {};
      columns.forEach(col => {
        if (typeof col.accessor === 'function') {
          row[col.header] = col.accessor(item);
        } else {
          // Handle cases where item[col.accessor] might be an object (like for nested data if not flattened)
          // For this implementation, we assume simple values or function accessors handle complexity.
          const value = item[col.accessor as keyof T];
          row[col.header] = typeof value === 'object' ? JSON.stringify(value) : value;
        }
      });
      return row;
    });
  } else {
    // If no columns are provided, export data as is (keys become headers)
    dataToExport = data.map(item => {
      const newRow: Record<string, any> = {};
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          const value = item[key];
          // Basic handling for date objects if no specific column formatting is given
          if (value instanceof Date) {
            newRow[key] = value.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          } else if (typeof value === 'object' && value !== null) {
            newRow[key] = JSON.stringify(value); // Simple stringify for other objects
          } else {
            newRow[key] = value;
          }
        }
      }
      return newRow;
    });
  }

  if (dataToExport.length === 0) {
    // Create a sheet with a message if there's no data
    const emptySheetData = [{ Message: "No data available for export." }];
    const worksheet = XLSX.utils.json_to_sheet(emptySheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    return;
  }
  
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
