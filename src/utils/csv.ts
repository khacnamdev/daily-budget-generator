import { saveAs } from "file-saver";
import { BudgetConfig, BudgetItem } from "@/types/budget";
import { getExportFilename } from "./formatting";

export function exportToCSV(config: BudgetConfig, items: BudgetItem[]): void {
  const lines: string[] = [];

  // Metadata Header
  lines.push(`"Daily Amount Report"`);
  lines.push(`"Days","${config.days}"`);
  lines.push(`"Minimum Amount","${config.minAmount}"`);
  lines.push(`"Maximum Amount","${config.maxAmount}"`);
  lines.push(`"Maximum Total","${config.maxTotal}"`);
  lines.push(``);

  // Table Header
  lines.push(`"No.","Day","Amount"`);

  // Data Rows
  let totalSum = 0;
  items.forEach((item) => {
    totalSum += item.amount;
    lines.push(`"${item.no}","${item.dayLabel}","${item.amount.toFixed(2)}"`);
  });

  // Footer Total
  lines.push(`"TOTAL","","${totalSum.toFixed(2)}"`);

  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const filename = getExportFilename("csv");
  saveAs(blob, filename);
}

export function generateTableText(items: BudgetItem[]): string {
  const header = "No.\tDay\tAmount\n";
  const rows = items.map((i) => `${i.no}\t${i.dayLabel}\t$${i.amount.toFixed(2)}`).join("\n");
  const totalSum = items.reduce((acc, curr) => acc + curr.amount, 0);
  const footer = `\nTOTAL\t\t$${totalSum.toFixed(2)}`;
  return header + rows + footer;
}
