"use client";

import React, { useState } from "react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { Navbar } from "@/components/navbar";
import { ConfigForm } from "@/features/config/config-form";
import { StatsDashboard } from "@/features/stats/stats-dashboard";
import { BudgetTable } from "@/features/table/budget-table";
import { ExportActions } from "@/features/import-export/export-actions";
import { HistoryDrawer } from "@/features/history/history-drawer";
import { PrintLayout } from "@/components/print-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BudgetConfig } from "@/types/budget";
import { getDaysInMonth } from "@/utils/formatting";

export default function DashboardPage() {
  const {
    config,
    items,
    history,
    isInitialized,
    stats,
    validation,
    generateData,
    updateItemAmount,
    resetData,
    restoreHistoryRecord,
    deleteHistoryRecord,
    importData,
  } = useBudgetStore();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleGenerate = (newConfig: BudgetConfig) => {
    try {
      generateData(newConfig);
      const totalDays = getDaysInMonth(newConfig.year, newConfig.month);
      toast.success(`Generated random amounts for ${totalDays} days!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate random data.";
      toast.error(msg);
    }
  };

  const handleReset = () => {
    resetData();
    toast.info("Configuration and table data reset.");
  };

  if (!isInitialized) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-background text-foreground transition-colors duration-200">
      {/* Navbar Header */}
      <Navbar
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 space-y-8 print:hidden">
        {/* Top Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard Overview
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure parameters, generate realistic daily allocations, and export financial reports.
            </p>
          </div>

          {/* Toolbar Actions */}
          <ExportActions
            config={config}
            items={items}
            validation={validation}
            onImportSuccess={importData}
          />
        </div>

        {/* Configuration Form */}
        <ConfigForm
          config={config}
          onGenerate={handleGenerate}
          onReset={handleReset}
        />

        {/* Statistics Dashboard */}
        <StatsDashboard
          stats={stats}
          maxTotal={config.maxTotal}
          validation={validation}
        />

        {/* Editable Data Table */}
        <BudgetTable
          items={items}
          config={config}
          onUpdateAmount={updateItemAmount}
          onGenerateClick={() => handleGenerate(config)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground bg-background/50 backdrop-blur-sm print:hidden">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Daily Budget Generator. All rights reserved.</span>
          <span className="font-medium text-foreground">Next.js 16 &bull; React 19 &bull; Tailwind CSS v4</span>
        </div>
      </footer>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onReload={restoreHistoryRecord}
        onDelete={deleteHistoryRecord}
      />

      {/* Hidden Print Layout */}
      <PrintLayout config={config} items={items} />
    </div>
  );
}
