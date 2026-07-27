"use client";

import React, { useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BudgetConfig, BudgetItem } from "@/types/budget";
import { importFromExcel } from "@/utils/excel";
import { toast } from "sonner";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (config: Partial<BudgetConfig>, items: BudgetItem[]) => void;
}

export function ImportModal({ isOpen, onClose, onImportSuccess }: ImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        setSelectedFile(file);
        setErrorMsg(null);
      } else {
        setErrorMsg("Please upload a valid Excel file (.xlsx or .xls).");
      }
    }
  };

  const handleProcessImport = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { config, items } = await importFromExcel(selectedFile);
      onImportSuccess(config || {}, items);
      toast.success(`Successfully imported ${items.length} rows from Excel file.`);
      setSelectedFile(null);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to import Excel file.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
            Import Excel File
          </DialogTitle>
          <DialogDescription>
            Upload an existing Excel report (.xlsx) to populate your daily budget table.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* File Upload Zone */}
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/80 rounded-xl p-8 cursor-pointer hover:border-primary/50 hover:bg-accent/40 transition-colors">
            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            <span className="text-sm font-medium text-foreground">
              Click to select or drag & drop Excel file
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Supports .xlsx, .xls
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Selected File Feedback */}
          {selectedFile && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-700 dark:text-emerald-400 text-xs">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span className="truncate font-medium">{selectedFile.name}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="emerald"
            onClick={handleProcessImport}
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? "Processing..." : "Import File"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
