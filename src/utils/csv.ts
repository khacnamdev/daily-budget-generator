import { saveAs } from "file-saver";
import { BudgetConfig, BudgetItem, CurrencyCode } from "@/types/budget";
import { getExportFilename, getMonthName, formatCurrency } from "./formatting";

export function exportToCSV(config: BudgetConfig, items: BudgetItem[]): void {
  const lines: string[] = [];

  const monthName = getMonthName(config.month);

  // Metadata Header
  lines.push(`"Daily Amount Report"`);
  lines.push(`"Year","${config.year}"`);
  lines.push(`"Month","${monthName}"`);
  lines.push(`"Currency","${config.currency}"`);
  lines.push(`"Minimum Amount","${config.minAmount}"`);
  lines.push(`"Maximum Amount","${config.maxAmount}"`);
  lines.push(`"Maximum Total","${config.maxTotal}"`);
  lines.push(``);

  // Table Header
  lines.push(`"No.","Date","Amount"`);

  // Data Rows
  let totalSum = 0;
  items.forEach((item) => {
    totalSum += item.amount;
    lines.push(`"${item.no}","${item.dateStr || item.dayLabel}","${item.amount.toFixed(2)}"`);
  });

  // Footer Total
  lines.push(`"TOTAL","","${totalSum.toFixed(2)}"`);

  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const filename = getExportFilename("csv");
  saveAs(blob, filename);
}

export function generateTableText(items: BudgetItem[], currency: CurrencyCode = "USD"): string {
  const header = "No.\tDate\tAmount\n";
  const rows = items
    .map(
      (i) => `${i.no}\t${i.dateStr || i.dayLabel}\t${formatCurrency(i.amount, currency)}`
    )
    .join("\n");
  const totalSum = items.reduce((acc, curr) => acc + curr.amount, 0);
  const footer = `\nTOTAL\t\t${formatCurrency(totalSum, currency)}`;
  return header + rows + footer;
}
