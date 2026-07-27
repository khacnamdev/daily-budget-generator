"use client";

import React from "react";
import { BudgetConfig, BudgetItem } from "@/types/budget";
import { formatCurrency, formatDateTime } from "@/utils/formatting";

interface PrintLayoutProps {
  config: BudgetConfig;
  items: BudgetItem[];
}

export function PrintLayout({ config, items }: PrintLayoutProps) {
  const totalSum = items.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="hidden print:block print:p-6 print:text-black print:bg-white text-xs leading-normal">
      {/* Document Header */}
      <div className="border-b-2 border-blue-900 pb-4 mb-4 text-center">
        <h1 className="text-2xl font-bold text-blue-900 mb-1">
          Daily Amount Report
        </h1>
        <p className="text-gray-500">
          Generated on: {formatDateTime(new Date())}
        </p>
      </div>

      {/* Config Summary Table */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-blue-900 border-b border-gray-300 pb-1 mb-2">
          Configuration Constraints
        </h2>
        <div className="grid grid-cols-4 gap-4 bg-gray-50 p-3 rounded border border-gray-200">
          <div>
            <span className="block font-semibold text-gray-600">Days:</span>
            <span>{config.days}</span>
          </div>
          <div>
            <span className="block font-semibold text-gray-600">Min Amount:</span>
            <span>{formatCurrency(config.minAmount)}</span>
          </div>
          <div>
            <span className="block font-semibold text-gray-600">Max Amount:</span>
            <span>{formatCurrency(config.maxAmount)}</span>
          </div>
          <div>
            <span className="block font-semibold text-gray-600">Max Total:</span>
            <span>{formatCurrency(config.maxTotal)}</span>
          </div>
        </div>
      </div>

      {/* Main Budget Breakdown Table */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-blue-900 border-b border-gray-300 pb-1 mb-2">
          Daily Amount Breakdown
        </h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-900 text-white font-bold text-center">
              <th className="border border-gray-300 p-2 w-16">No.</th>
              <th className="border border-gray-300 p-2">Day</th>
              <th className="border border-gray-300 p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.no} className="border-b border-gray-200">
                <td className="border border-gray-300 p-2 text-center">{item.no}</td>
                <td className="border border-gray-300 p-2 text-center">{item.dayLabel}</td>
                <td className="border border-gray-300 p-2 text-right font-mono">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold border-t-2 border-blue-900">
              <td colSpan={2} className="border border-gray-300 p-2 text-center">
                TOTAL
              </td>
              <td className="border border-gray-300 p-2 text-right font-mono text-blue-900">
                {formatCurrency(totalSum)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 pt-3 text-center text-gray-500 text-[10px]">
        Daily Budget Generator &bull; Confidential Official Report
      </div>
    </div>
  );
}
