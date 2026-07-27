"use client";

import React from "react";
import {
  CalendarDays,
  DollarSign,
  Wallet,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import { BudgetStats, BudgetValidationResult } from "@/types/budget";
import { formatCurrency } from "@/utils/formatting";
import { StatCard } from "./stat-card";
import { Badge } from "@/components/ui/badge";

interface StatsDashboardProps {
  stats: BudgetStats;
  maxTotal: number;
  validation: BudgetValidationResult;
}

export function StatsDashboard({ stats, maxTotal, validation }: StatsDashboardProps) {
  const isOverBudget = stats.remainingAmount < 0;
  const isHighUtilization = stats.budgetUtilizationPct > 90 && !isOverBudget;

  return (
    <div className="space-y-4">
      {/* Validation alert banner if invalid */}
      {!validation.isValid && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive backdrop-blur-md">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-1">
            <h5 className="font-semibold text-sm">Budget Validation Warning</h5>
            <ul className="list-disc pl-4 text-xs space-y-0.5">
              {validation.errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Number of Days */}
        <StatCard
          title="Days"
          value={stats.days}
          subtitle={`Configured span`}
          icon={CalendarDays}
          iconColor="text-blue-500 bg-blue-500/10 dark:bg-blue-500/20"
        />

        {/* Generated Total */}
        <StatCard
          title="Generated Total"
          value={formatCurrency(stats.totalAmount)}
          subtitle={`Max cap: ${formatCurrency(maxTotal)}`}
          icon={DollarSign}
          iconColor="text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20"
          trend={isOverBudget ? "negative" : "neutral"}
        />

        {/* Remaining Amount */}
        <StatCard
          title="Remaining Budget"
          value={formatCurrency(stats.remainingAmount)}
          subtitle={
            isOverBudget
              ? `Exceeded limit!`
              : `${stats.budgetUtilizationPct.toFixed(1)}% used`
          }
          icon={Wallet}
          iconColor={
            isOverBudget
              ? "text-red-500 bg-red-500/10 dark:bg-red-500/20"
              : isHighUtilization
              ? "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20"
              : "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20"
          }
          trend={isOverBudget ? "negative" : isHighUtilization ? "warning" : "positive"}
        />

        {/* Average Amount */}
        <StatCard
          title="Daily Average"
          value={formatCurrency(stats.averageAmount)}
          subtitle={`Per day target`}
          icon={TrendingUp}
          iconColor="text-purple-500 bg-purple-500/10 dark:bg-purple-500/20"
        />

        {/* Min Generated */}
        <StatCard
          title="Min Generated"
          value={formatCurrency(stats.minGenerated)}
          subtitle={`Lowest daily amount`}
          icon={ArrowDownRight}
          iconColor="text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20"
        />

        {/* Max Generated */}
        <StatCard
          title="Max Generated"
          value={formatCurrency(stats.maxGenerated)}
          subtitle={`Highest daily amount`}
          icon={ArrowUpRight}
          iconColor="text-teal-500 bg-teal-500/10 dark:bg-teal-500/20"
        />
      </div>

      {/* Progress Indicator */}
      <div className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-medium mb-2">
          <span className="flex items-center gap-2">
            Budget Utilization Progress
            {isOverBudget ? (
              <Badge variant="destructive">Over Budget</Badge>
            ) : isHighUtilization ? (
              <Badge variant="warning">High Usage</Badge>
            ) : (
              <Badge variant="success">Healthy</Badge>
            )}
          </span>
          <span>
            {formatCurrency(stats.totalAmount)} / {formatCurrency(maxTotal)} ({stats.budgetUtilizationPct}%)
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isOverBudget
                ? "bg-destructive"
                : isHighUtilization
                ? "bg-amber-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-600"
            }`}
            style={{ width: `${Math.min(100, stats.budgetUtilizationPct)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
