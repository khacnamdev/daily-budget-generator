"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Dice5,
} from "lucide-react";
import { BudgetItem, BudgetConfig } from "@/types/budget";
import { formatCurrency } from "@/utils/formatting";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { InlineEditCell } from "./inline-edit-cell";

interface BudgetTableProps {
  items: BudgetItem[];
  config: BudgetConfig;
  onUpdateAmount: (index: number, newAmount: number) => void;
  onGenerateClick: () => void;
}

export function BudgetTable({
  items,
  config,
  onUpdateAmount,
  onGenerateClick,
}: BudgetTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<BudgetItem>[]>(
    () => [
      {
        accessorKey: "no",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-xs tracking-wider"
          >
            No.
            <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        cell: (info) => (
          <span className="text-center block text-sm font-medium text-muted-foreground">
            {info.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "dayLabel",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-xs tracking-wider"
          >
            Day
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
        ),
        cell: (info) => (
          <span className="font-semibold text-sm text-foreground">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <div className="flex justify-end w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="font-semibold text-xs tracking-wider"
            >
              Amount ($)
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />
              ) : (
                <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const originalIndex = items.findIndex((i) => i.no === item.no);
          return (
            <InlineEditCell
              value={item.amount}
              rowIndex={originalIndex >= 0 ? originalIndex : row.index}
              minAmount={config.minAmount}
              maxAmount={config.maxAmount}
              onSave={onUpdateAmount}
            />
          );
        },
      },
    ],
    [config.maxAmount, config.minAmount, items, onUpdateAmount]
  );

  const table = useReactTable({
    data: items,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const totalSum = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.amount, 0);
  }, [items]);

  return (
    <Card className="border-border/60 bg-card/80 shadow-lg backdrop-blur-md">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl">Daily Budget Breakdown</CardTitle>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search day..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 animate-bounce">
              <Dice5 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No Data Generated Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Configure your parameters above and click &quot;Generate Data&quot; to create a new daily budget breakdown.
            </p>
            <Button variant="gradient" onClick={onGenerateClick} className="gap-2">
              <Dice5 className="h-4 w-4" />
              Generate Data Now
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="p-3">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-border/40">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-3 align-middle">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>

                {/* Table Footer with TOTAL */}
                <tfoot className="bg-muted/80 font-bold border-t-2 border-border/80 text-foreground">
                  <tr>
                    <td colSpan={2} className="p-3.5 text-center text-sm">
                      TOTAL
                    </td>
                    <td className="p-3.5 text-right text-base text-primary">
                      {formatCurrency(totalSum)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Rows per page</span>
                <Select
                  value={table.getState().pagination.pageSize.toString()}
                  onValueChange={(val) => table.setPageSize(Number(val))}
                >
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map((pageSize) => (
                      <SelectItem key={pageSize} value={pageSize.toString()}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>
                  Showing {table.getRowModel().rows.length} of {items.length} rows
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium px-2">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount() || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
