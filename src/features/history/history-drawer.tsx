"use client";

import React from "react";
import { History, Inbox } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BudgetHistoryRecord } from "@/types/budget";
import { HistoryItem } from "./history-item";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: BudgetHistoryRecord[];
  onReload: (record: BudgetHistoryRecord) => void;
  onDelete: (id: string) => void;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onReload,
  onDelete,
}: HistoryDrawerProps) {
  const handleReloadAndClose = (record: BudgetHistoryRecord) => {
    onReload(record);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <History className="h-5 w-5 text-primary" />
            Generation History
          </DialogTitle>
          <DialogDescription>
            View past generated budgets, restore previous configurations, or export historical records.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Inbox className="h-12 w-12 stroke-[1.5] mb-3 text-muted-foreground/50" />
              <p className="text-sm font-medium">No history recorded yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Generated budgets will automatically appear here.
              </p>
            </div>
          ) : (
            history.map((record) => (
              <HistoryItem
                key={record.id}
                record={record}
                onReload={handleReloadAndClose}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
