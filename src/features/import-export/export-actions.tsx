"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Copy,
  Printer,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BudgetConfig, BudgetItem, BudgetValidationResult } from "@/types/budget";
import { exportToExcel } from "@/utils/excel";
import { exportToCSV, generateTableText } from "@/utils/csv";
import { ImportModal } from "./import-modal";
import { toast } from "sonner";

interface ExportActionsProps {
  config: BudgetConfig;
  items: BudgetItem[];
  validation: BudgetValidationResult;
  onImportSuccess: (config: Partial<BudgetConfig>, items: BudgetItem[]) => void;
}

export function ExportActions({
  config,
  items,
  validation,
  onImportSuccess,
}: ExportActionsProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const hasData = items.length > 0;
  const isExportDisabled = !hasData || !validation.isValid;

  const handleExportExcel = async () => {
    if (isExportDisabled) return;
    setIsExportingExcel(true);
    try {
      await exportToExcel(config, items);
      toast.success("Excel report exported successfully!");
    } catch (err) {
      console.error("Excel Export Error:", err);
      toast.error("Failed to export Excel report.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportCSV = () => {
    if (isExportDisabled) return;
    try {
      exportToCSV(config, items);
      toast.success("CSV file exported successfully!");
    } catch (err) {
      console.error("CSV Export Error:", err);
      toast.error("Failed to export CSV file.");
    }
  };

  const handleCopyTable = () => {
    if (!hasData) return;
    try {
      const text = generateTableText(items, config.currency);
      navigator.clipboard.writeText(text);
      toast.success("Table data copied to clipboard!");
    } catch (err) {
      console.error("Copy Error:", err);
      toast.error("Failed to copy table data.");
    }
  };

  const handlePrint = () => {
    if (!hasData) return;
    window.print();
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Import Excel */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsImportOpen(true)}
          className="gap-2 border-border/80"
        >
          <Upload className="h-4 w-4 text-emerald-500" />
          Import Excel
        </Button>

        {/* Export Excel */}
        <Button
          variant="emerald"
          size="sm"
          onClick={handleExportExcel}
          disabled={isExportDisabled || isExportingExcel}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {isExportingExcel ? "Exporting..." : "Export Excel"}
        </Button>

        {/* Export CSV */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={isExportDisabled}
          className="gap-2 border-border/80"
        >
          <FileText className="h-4 w-4 text-blue-500" />
          Export CSV
        </Button>

        {/* Copy Table */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyTable}
          disabled={!hasData}
          className="gap-2 border-border/80"
        >
          <Copy className="h-4 w-4 text-indigo-500" />
          Copy Table
        </Button>

        {/* Print */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          disabled={!hasData}
          className="gap-2 border-border/80"
        >
          <Printer className="h-4 w-4 text-purple-500" />
          Print
        </Button>
      </div>

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={onImportSuccess}
      />
    </>
  );
}
