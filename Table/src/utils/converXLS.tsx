import * as XLSX from 'xlsx';
import type { TableData } from '@/components/Table/Table';

/**
 * Exports selected table data to an Excel file
 * @param selected - Array of selected item IDs
 * @param data - Full array of table data
 * @param filename - Optional filename (default: 'table-export.xlsx')
 */
export function exportToExcel(
  selected: string[],
  data: TableData[],
  filename: string = 'table-export.xlsx'
): void {
  // Filter data to only include selected items
  const selectedData = data.filter((item) => selected.includes(item.punchId));

  if (selectedData.length === 0) {
    alert('No items selected. Please select at least one item to export.');
    return;
  }

  // Transform data to Excel format
  const excelData = selectedData.map((item) => ({
    ID: item.punchId,
    Status: item.status ? 'Closed' : 'Open',
    System: item.system,
    Description: item.description,
    'Closed At': item.closedAt,
  }));

  // Create a new workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Set column widths for better readability
  const columnWidths = [
    { wch: 15 }, // ID
    { wch: 10 }, // Status
    { wch: 20 }, // System
    { wch: 40 }, // Description
    { wch: 20 }, // Closed At
  ];
  worksheet['!cols'] = columnWidths;

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, filename);
}
