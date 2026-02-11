import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  // TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  SearchIcon,
  DownloadIcon,
  FilterIcon,
} from 'lucide-react';
import { Button } from '../ui/button';
import { exportToExcel } from '@/utils/converXLS';
import { useQuery } from '@tanstack/react-query';
import { createTODsearchOptions } from '@/queryOptions/createTODQueryOptions';

export type TableData = {
  punchId: string;
  system: string;
  description: string;
  closedAt: string;
  status: boolean;
};

type TableComponentProps = {
  data: TableData[];
  description: string;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isPending: boolean;
} & { todCount: number; openTod: number };

export default function TableComponent({
  data,
  description,
  currentPage,
  setCurrentPage,
  isPending,
  todCount,
  openTod,
}: TableComponentProps) {
  // state mangment
  const eachPageCapacity = 10; //change table row capacity
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelection] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<boolean | null>(null);

  //search useQuery
  const { data: searchResponce } = useQuery(
    createTODsearchOptions({ searchQuery })
  );

  // Convert current page to number for calculations
  const currentPageNum = parseInt(currentPage, 10) || 1;

  //only use this while have the search locally
  const filteredData = (
    query: string,
    filterStatus: boolean | null
  ): TableData[] => {
    const result = !query.trim() ? data : (searchResponce ?? []);

    // Apply status filter: null = all, true = closed only, false = open only
    if (filterStatus === null) {
      return result;
    }
    return result.filter((item) => (filterStatus ? item.status : !item.status));

    // return (
    //   data.filter(
    //     (item) =>
    //       item.punchId.toLowerCase().includes(q) ||
    //       item.system.toLowerCase().includes(q) ||
    //       item.description.toLowerCase().includes(q) ||
    //       item.closedAt.toLowerCase().includes(q)
    //   ) || []
    // );
  };

  const displayData = filteredData(searchQuery, filterStatus);

  return (
    <div className="w-full mx-auto p-3">
      <div className="relative rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Header */}
        <div className="px-8 border-b border-slate-200 bg-linear-to-r from-slate-50 to-blue-50">
          <h2 className="text-xl font-semibold tracking-tight text-slate-800">
            {description}
          </h2>
          <br />{' '}
          <span className="text-gray-500 text-lg font-semibold">
            Total amount of TODS is{' '}
            <span className="text-blue-500 font-bold">{todCount}</span> point
          </span>
          <p className="text-gray-500 text-lg my-2 font-semibold">
            Closed item = {openTod}
          </p>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-green-300/30">
              <TableHead className="text-center font-semibold text-slate-600 tracking-wide uppercase text-xs py-4">
                ID
              </TableHead>
              <TableHead className="text-center flex items-center justify-center cursor-pointer gap-2 font-semibold text-slate-600 tracking-wide uppercase text-xs">
                <FilterIcon
                  onClick={() => {
                    // Cycle through: null (all) -> true (closed) -> false (open) -> null
                    setFilterStatus((prev) =>
                      prev === null ? true : prev === true ? false : null
                    );
                  }}
                />
                status
                {filterStatus === null
                  ? ' (All)'
                  : filterStatus
                    ? ' (Closed)'
                    : ' (Open)'}
              </TableHead>
              <TableHead className="text-center font-semibold text-slate-600 tracking-wide uppercase text-xs">
                system
              </TableHead>
              <TableHead className="text-left font-semibold text-slate-600 tracking-wide uppercase text-xs pr-6">
                Description
              </TableHead>
              <TableHead className="text-left font-semibold text-slate-600 tracking-wide uppercase text-xs pr-6">
                Closed At
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-slate-500"
                >
                  Loading data...
                </TableCell>
              </TableRow>
            ) : !displayData || displayData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-slate-500"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((cdn) => (
                <TableRow
                  key={cdn.punchId}
                  onClick={() => {
                    setSelection((prev) =>
                      prev.includes(cdn.punchId)
                        ? prev.filter((punchId) => punchId !== cdn.punchId)
                        : [...prev, cdn.punchId]
                    );
                  }}
                  className={`group transition-all duration-200 ${
                    selected.includes(cdn.punchId)
                      ? 'bg-yellow-200 hover:bg-yellow-300'
                      : 'hover:bg-blue-50/40'
                  }`}
                >
                  <TableCell className="text-center font-mono text-sm text-slate-800 py-4">
                    {cdn.punchId}
                  </TableCell>

                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center justify-center min-w-22 capitalize rounded-sm px-3 py-1 text-xs font-medium
                       ${cdn.status ? 'bg-emerald-500' : 'bg-red-400'} border text-white border-emerald-800`}
                    >
                      {cdn.status ? 'closed' : 'open'}
                    </span>
                  </TableCell>

                  <TableCell className="text-center text-slate-700 text-sm">
                    {cdn.system}
                  </TableCell>

                  <TableCell className="text-left font-semibold text-slate-800 pr-6">
                    {cdn.description}
                  </TableCell>

                  <TableCell className="text-left font-semibold text-slate-800 pr-6">
                    {reformatDate(parseISOString(cdn.closedAt).toDateString())}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

          {/* <TableFooter>
            <TableRow className="bg-slate-50 border-t border-slate-200">
              <TableCell
                colSpan={3}
                className="font-semibold text-slate-700 py-5"
              >
                Total
              </TableCell>
              <TableCell className="text-right font-bold text-lg text-slate-900 pr-6">
                $2,500.00
              </TableCell>
            </TableRow>
          </TableFooter> */}
        </Table>

        {/* Search and Export */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-200 bg-white/80">
          <SearchIcon size={18} className="text-slate-400" />
          <Input
            type="search"
            placeholder="Search by CDN or punch contents or by TOD number ...."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              bg-transparent border-none shadow-none
              focus-visible:ring-0 focus-visible:ring-offset-0
              text-slate-700 placeholder:text-slate-400
            "
          />

          {/* create the RCDC sheet button */}
          <Button
            onClick={() => {
              const today = new Date();
              const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
              exportToExcel(selected, data, `RCDC-${dateStr}.xlsx`);
            }}
            disabled={selected.length < 0}
            variant="outline"
            size="sm"
            className="ml-auto flex items-center gap-2"
          >
            <DownloadIcon size={16} />
            Create RCDC ({selected.length})
          </Button>
        </div>
      </div>

      {/* pagination control buttons */}
      <div className="pt-3 w-full flex flex-row justify-center items-center">
        <Button
          disabled={currentPageNum <= 1 || isPending}
          className="cursor-pointer"
          variant="outline"
          size="icon"
          aria-label="Previous Page"
          onClick={() => {
            setCurrentPage(String(currentPageNum - 1));
          }}
        >
          <ArrowLeftIcon />
        </Button>

        <p className="flex gap-5 px-5 capitalize text-lg">
          {isPending ? 'Loading...' : `page # ${currentPage}`}
        </p>

        <Button
          disabled={data.length < eachPageCapacity || isPending}
          className="cursor-pointer"
          variant="outline"
          size="icon"
          aria-label="Next Page"
          onClick={() => {
            setCurrentPage(String(currentPageNum + 1));
          }}
        >
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  );
}

//conver the iso date to normal human reading format
const parseISOString = (s: any) => {
  var b = s.split(/\D+/);
  return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
};
const reformatDate = (rawdate: string) => {
  const [day, date, month, year] = rawdate.split(' ');
  console.log(month, date, year, day);
  return `[${day}] ` + month + ' ' + date + ' ' + year;
};
