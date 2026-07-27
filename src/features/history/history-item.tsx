"use client";

import React from "react";
import { History, RotateCcw, Trash2, Download } from "lucide-react";
import { BudgetHistoryRecord } from "@/types/budget";
import { formatCurrency, formatDateTime, getMonthName } from "@/utils/formatting";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/utils/excel";
import { toast } from "sonner";

interface HistoryItemProps {
  record: BudgetHistoryRecord;
  onReload: (record: BudgetHistoryRecord) => void;
  onDelete: (id: string) => void;
}

export function HistoryItem({ record, onReload, onDelete }: HistoryItemProps) {
  const handleExportThisRecord = async () => {
    try {
      await exportToExcel(record.config, record.items);
      toast.success("Past generation record exported!");
    } catch (err) {
      console.error("Export record error:", err);
      toast.error("Failed to export history record.");
    }
  };

  const monthName = getMonthName(record.config.month);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 transition-all hover:bg-muted/50 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <History className="h-3.5 w-3.5 text-primary" />
          <span>{formatDateTime(record.timestamp)}</span>
        </div>

        <span className="text-sm font-bold text-primary">
          {formatCurrency(record.totalAmount, record.config.currency)}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground bg-background/60 rounded-lg p-2.5">
        <div>
          <span className="block text-[10px] uppercase">Period</span>
          <span className="font-semibold text-foreground">
            {monthName} {record.config.year}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase">Currency</span>
          <span className="font-semibold text-foreground">{record.config.currency}</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase">Min / Max</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(record.config.minAmount, record.config.currency)} - {formatCurrency(record.config.maxAmount, record.config.currency)}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase">Max Total</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(record.config.maxTotal, record.config.currency)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReload(record)}
          className="h-8 gap-1.5 text-xs text-blue-600 hover:bg-blue-500/10 hover:text-blue-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reload
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportThisRecord}
          className="h-8 gap-1.5 text-xs text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(record.id)}
          className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
