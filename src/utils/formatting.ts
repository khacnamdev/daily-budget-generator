import { format } from "date-fns";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDateTime(dateStrOrObj: string | Date): string {
  const d = typeof dateStrOrObj === "string" ? new Date(dateStrOrObj) : dateStrOrObj;
  if (isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd HH:mm:ss");
}

export function getExportFilename(extension: "xlsx" | "csv"): string {
  const timestamp = format(new Date(), "yyyyMMdd_HHmm");
  return `Daily_Report_${timestamp}.${extension}`;
}
