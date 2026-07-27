import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { BudgetConfig, BudgetItem } from "@/types/budget";
import { formatDateTime, getExportFilename } from "./formatting";

export async function exportToExcel(
  config: BudgetConfig,
  items: BudgetItem[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Daily Budget Generator";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Daily Budget Report", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 9 }], // Freeze rows 1-9 so table header stays fixed
  });

  // 1. Title Row
  worksheet.mergeCells("A1:C1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "Daily Amount Report";
  titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF1E3A8A" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 30;

  // Blank row
  worksheet.addRow([]);

  // 2. Config Header Section
  worksheet.mergeCells("A3:C3");
  const configHeader = worksheet.getCell("A3");
  configHeader.value = "Configuration Parameters";
  configHeader.font = { name: "Arial", size: 11, bold: true, color: { argb: "FF1E40AF" } };

  worksheet.addRow(["Days", config.days]);
  worksheet.addRow(["Minimum Amount", config.minAmount]);
  worksheet.addRow(["Maximum Amount", config.maxAmount]);
  worksheet.addRow(["Maximum Total", config.maxTotal]);

  // Format config values
  [4, 5, 6, 7].forEach((rowNum) => {
    const labelCell = worksheet.getCell(`A${rowNum}`);
    const valCell = worksheet.getCell(`B${rowNum}`);
    labelCell.font = { name: "Arial", size: 10, bold: true };
    valCell.font = { name: "Arial", size: 10 };
    if (rowNum >= 5) {
      valCell.numFmt = "$#,##0.00";
    }
  });

  worksheet.addRow([]); // Row 8 blank

  // 3. Main Data Table Header (Row 9)
  const headerRow = worksheet.addRow(["No.", "Day", "Amount"]);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E40AF" }, // Blue header
    };
    cell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin", color: { argb: "FF94A3B8" } },
      left: { style: "thin", color: { argb: "FF94A3B8" } },
      bottom: { style: "medium", color: { argb: "FF1E3A8A" } },
      right: { style: "thin", color: { argb: "FF94A3B8" } },
    };
  });

  // 4. Data Rows
  let totalSum = 0;
  items.forEach((item) => {
    totalSum += item.amount;
    const row = worksheet.addRow([item.no, item.dayLabel, item.amount]);
    row.height = 20;

    // No.
    const cellNo = row.getCell(1);
    cellNo.alignment = { horizontal: "center", vertical: "middle" };

    // Day
    const cellDay = row.getCell(2);
    cellDay.alignment = { horizontal: "center", vertical: "middle" };

    // Amount
    const cellAmount = row.getCell(3);
    cellAmount.alignment = { horizontal: "right", vertical: "middle" };
    cellAmount.numFmt = "$#,##0.00";

    // Add thin borders
    [cellNo, cellDay, cellAmount].forEach((c) => {
      c.font = { name: "Arial", size: 10 };
      c.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });
  });

  // 5. Total Row
  const totalRow = worksheet.addRow(["TOTAL", "", totalSum]);
  totalRow.height = 24;
  worksheet.mergeCells(`A${totalRow.number}:B${totalRow.number}`);

  const totalLabel = totalRow.getCell(1);
  totalLabel.font = { name: "Arial", size: 11, bold: true };
  totalLabel.alignment = { horizontal: "center", vertical: "middle" };

  const totalVal = totalRow.getCell(3);
  totalVal.font = { name: "Arial", size: 11, bold: true };
  totalVal.alignment = { horizontal: "right", vertical: "middle" };
  totalVal.numFmt = "$#,##0.00";

  [totalLabel, totalVal].forEach((c) => {
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF1F5F9" },
    };
    c.border = {
      top: { style: "medium", color: { argb: "FF1E40AF" } },
      left: { style: "thin", color: { argb: "FF94A3B8" } },
      bottom: { style: "double", color: { argb: "FF1E40AF" } },
      right: { style: "thin", color: { argb: "FF94A3B8" } },
    };
  });

  // 6. Footer Timestamp
  worksheet.addRow([]);
  const footerRow = worksheet.addRow([`Generated on: ${formatDateTime(new Date())}`]);
  footerRow.getCell(1).font = { name: "Arial", size: 9, italic: true, color: { argb: "FF64748B" } };

  // 7. Auto Column Widths
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : "";
      if (val.length > maxLength && val.length < 50) {
        maxLength = val.length;
      }
    });
    column.width = maxLength + 4;
  });

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const filename = getExportFilename("xlsx");
  saveAs(blob, filename);
}

export async function importFromExcel(file: File): Promise<{
  config?: Partial<BudgetConfig>;
  items: BudgetItem[];
}> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("The uploaded Excel file has no worksheets.");
  }

  const items: BudgetItem[] = [];
  let extractedDays: number | undefined;
  let extractedMin: number | undefined;
  let extractedMax: number | undefined;
  let extractedMaxTotal: number | undefined;

  let tableHeaderRowIndex = -1;

  worksheet.eachRow((row, rowNumber) => {
    const col1 = row.getCell(1).text?.trim();
    const col2 = row.getCell(2).text?.trim();

    // Check config key values
    if (col1 === "Days" && !isNaN(Number(col2))) {
      extractedDays = Number(col2);
    } else if (col1 === "Minimum Amount" && !isNaN(Number(col2.replace(/[^0-9.-]+/g, "")))) {
      extractedMin = Number(col2.replace(/[^0-9.-]+/g, ""));
    } else if (col1 === "Maximum Amount" && !isNaN(Number(col2.replace(/[^0-9.-]+/g, "")))) {
      extractedMax = Number(col2.replace(/[^0-9.-]+/g, ""));
    } else if (col1 === "Maximum Total" && !isNaN(Number(col2.replace(/[^0-9.-]+/g, "")))) {
      extractedMaxTotal = Number(col2.replace(/[^0-9.-]+/g, ""));
    }

    // Detect header row
    const c1Upper = col1.toUpperCase();
    const c2Upper = col2.toUpperCase();
    if (c1Upper.includes("NO") || c2Upper.includes("DAY")) {
      tableHeaderRowIndex = rowNumber;
    }
  });

  // Extract table rows after header row (or from start if simple table)
  const startRow = tableHeaderRowIndex > 0 ? tableHeaderRowIndex + 1 : 1;

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < startRow) return;

    const col1 = row.getCell(1).text?.trim();
    const col2 = row.getCell(2).text?.trim();
    const col3 = row.getCell(3).text?.trim();

    if (col1 === "TOTAL" || col1.includes("Generated on")) return;

    // Parse amount from col3 or col2
    const dayLabel = col2 || `Day ${items.length + 1}`;
    const rawAmt = col3 || col2;
    const amountVal = Number(rawAmt.replace(/[^0-9.-]+/g, ""));

    if (!isNaN(amountVal) && amountVal >= 0) {
      items.push({
        no: items.length + 1,
        day: items.length + 1,
        dayLabel: dayLabel.startsWith("Day") ? dayLabel : `Day ${items.length + 1}`,
        amount: Math.round(amountVal * 100) / 100,
      });
    }
  });

  if (items.length === 0) {
    throw new Error("No valid daily budget rows found in the Excel file.");
  }

  return {
    config: {
      days: extractedDays || items.length,
      minAmount: extractedMin,
      maxAmount: extractedMax,
      maxTotal: extractedMaxTotal,
    },
    items,
  };
}
