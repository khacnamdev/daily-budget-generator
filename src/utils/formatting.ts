import { format } from "date-fns";
import { CurrencyCode } from "@/types/budget";
import { MONTH_NAMES } from "@/constants/default-config";

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] || "";
}

export function formatDateIso(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function formatCurrency(amount: number, currency: CurrencyCode = "USD"): string {
  if (currency === "VND") {
    // 0 fraction digits for VND (e.g. ₫2,500,000)
    const formatted = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
    return `₫${formatted}`;
  }

  if (currency === "JPY") {
    // 0 fraction digits for JPY (e.g. ¥250,000)
    const formatted = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
    return `¥${formatted}`;
  }

  // Default USD (e.g. $2,500.00)
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
