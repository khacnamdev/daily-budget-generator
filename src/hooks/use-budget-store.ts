"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  BudgetConfig,
  BudgetItem,
  BudgetHistoryRecord,
  BudgetValidationResult,
  BudgetStats,
} from "@/types/budget";
import { DEFAULT_BUDGET_CONFIG, STORAGE_KEYS } from "@/constants/default-config";
import { generateRandomBudgetData } from "@/utils/algorithm";
import { formatCurrency } from "@/utils/formatting";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "@/utils/storage";

export function useBudgetStore() {
  const [config, setConfigState] = useState<BudgetConfig>(DEFAULT_BUDGET_CONFIG);
  const [items, setItemsState] = useState<BudgetItem[]>([]);
  const [history, setHistoryState] = useState<BudgetHistoryRecord[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Restore state from LocalStorage on mount
  useEffect(() => {
    const savedConfig = getLocalStorageItem<BudgetConfig>(
      STORAGE_KEYS.CONFIG,
      DEFAULT_BUDGET_CONFIG
    );
    const savedData = getLocalStorageItem<BudgetItem[]>(STORAGE_KEYS.DATA, []);
    const savedHistory = getLocalStorageItem<BudgetHistoryRecord[]>(
      STORAGE_KEYS.HISTORY,
      []
    );

    setConfigState(savedConfig);
    setItemsState(savedData);
    setHistoryState(savedHistory);
    setIsInitialized(true);
  }, []);

  // Save config changes to localStorage
  const setConfig = useCallback((newConfig: BudgetConfig) => {
    setConfigState(newConfig);
    setLocalStorageItem(STORAGE_KEYS.CONFIG, newConfig);
  }, []);

  // Save items changes to localStorage
  const setItems = useCallback((newItems: BudgetItem[]) => {
    setItemsState(newItems);
    setLocalStorageItem(STORAGE_KEYS.DATA, newItems);
  }, []);

  // Save history changes to localStorage
  const setHistory = useCallback((newHistory: BudgetHistoryRecord[]) => {
    setHistoryState(newHistory);
    setLocalStorageItem(STORAGE_KEYS.HISTORY, newHistory);
  }, []);

  // Action: Generate Random Data
  const generateData = useCallback(
    (customConfig?: BudgetConfig) => {
      const activeConfig = customConfig || config;
      const newItems = generateRandomBudgetData(activeConfig);
      
      const totalSum = newItems.reduce((acc, curr) => acc + curr.amount, 0);

      // Create new history record
      const historyRecord: BudgetHistoryRecord = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
        config: { ...activeConfig },
        totalAmount: Math.round(totalSum),
        items: newItems,
      };

      setConfig(activeConfig);
      setItems(newItems);
      setHistory([historyRecord, ...history]);
      return newItems;
    },
    [config, history, setConfig, setItems, setHistory]
  );

  // Action: Edit Item Amount inline
  const updateItemAmount = useCallback(
    (index: number, newAmount: number) => {
      const updated = [...items];
      if (index >= 0 && index < updated.length) {
        updated[index] = {
          ...updated[index],
          amount: Math.max(0, Math.round(newAmount)),
        };
        setItems(updated);
      }
    },
    [items, setItems]
  );

  // Action: Reset Data
  const resetData = useCallback(() => {
    setConfig(DEFAULT_BUDGET_CONFIG);
    setItems([]);
  }, [setConfig, setItems]);

  // Action: Restore past history record
  const restoreHistoryRecord = useCallback(
    (record: BudgetHistoryRecord) => {
      setConfig(record.config);
      setItems(record.items);
    },
    [setConfig, setItems]
  );

  // Action: Delete history entry
  const deleteHistoryRecord = useCallback(
    (id: string) => {
      const updated = history.filter((h) => h.id !== id);
      setHistory(updated);
    },
    [history, setHistory]
  );

  // Action: Import external data
  const importData = useCallback(
    (importedConfig: Partial<BudgetConfig>, importedItems: BudgetItem[]) => {
      const mergedConfig: BudgetConfig = {
        days: importedConfig.days || importedItems.length || config.days,
        minAmount: importedConfig.minAmount ?? config.minAmount,
        maxAmount: importedConfig.maxAmount ?? config.maxAmount,
        maxTotal: importedConfig.maxTotal ?? config.maxTotal,
      };

      setConfig(mergedConfig);
      setItems(importedItems);

      const totalSum = importedItems.reduce((acc, curr) => acc + curr.amount, 0);
      const historyRecord: BudgetHistoryRecord = {
        id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
        config: mergedConfig,
        totalAmount: Math.round(totalSum),
        items: importedItems,
      };

      setHistory([historyRecord, ...history]);
    },
    [config, history, setConfig, setItems, setHistory]
  );

  // Computed Derived Statistics & Validation
  const stats: BudgetStats = useMemo(() => {
    if (items.length === 0) {
      return {
        days: config.days,
        totalAmount: 0,
        remainingAmount: config.maxTotal,
        averageAmount: 0,
        minGenerated: 0,
        maxGenerated: 0,
        budgetUtilizationPct: 0,
      };
    }

    const totalAmount = Math.round(items.reduce((sum, item) => sum + item.amount, 0));
    const remainingAmount = Math.round(config.maxTotal - totalAmount);
    const averageAmount = Math.round(totalAmount / items.length);
    const amounts = items.map((i) => i.amount);
    const minGenerated = Math.min(...amounts);
    const maxGenerated = Math.max(...amounts);
    const budgetUtilizationPct = Math.min(100, Math.max(0, (totalAmount / config.maxTotal) * 100));

    return {
      days: items.length,
      totalAmount,
      remainingAmount,
      averageAmount,
      minGenerated,
      maxGenerated,
      budgetUtilizationPct: Math.round(budgetUtilizationPct * 10) / 10,
    };
  }, [config.days, config.maxTotal, items]);

  const validation: BudgetValidationResult = useMemo(() => {
    const errors: string[] = [];

    if (items.length > 0) {
      if (stats.totalAmount > config.maxTotal) {
        errors.push(
          `Total generated amount (${formatCurrency(stats.totalAmount)}) exceeds Maximum Total budget (${formatCurrency(config.maxTotal)}) by ${formatCurrency(stats.totalAmount - config.maxTotal)}.`
        );
      }

      const outOfBoundsCount = items.filter(
        (i) => i.amount < config.minAmount || i.amount > config.maxAmount
      ).length;

      if (outOfBoundsCount > 0) {
        errors.push(
          `${outOfBoundsCount} day(s) have amounts outside configured Min (${formatCurrency(config.minAmount)}) - Max (${formatCurrency(config.maxAmount)}) bounds.`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [config.maxAmount, config.maxTotal, config.minAmount, items, stats.totalAmount]);

  return {
    config,
    items,
    history,
    isInitialized,
    stats,
    validation,
    setConfig,
    generateData,
    updateItemAmount,
    resetData,
    restoreHistoryRecord,
    deleteHistoryRecord,
    importData,
  };
}
