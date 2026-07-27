"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InlineEditCellProps {
  value: number;
  rowIndex: number;
  minAmount: number;
  maxAmount: number;
  onSave: (rowIndex: number, newAmount: number) => void;
}

export function InlineEditCell({
  value,
  rowIndex,
  minAmount,
  maxAmount,
  onSave,
}: InlineEditCellProps) {
  const [localVal, setLocalVal] = useState<string>(value.toString());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLocalVal(value.toString());
  }, [value]);

  const numVal = parseFloat(localVal);
  const isOutOfBounds = !isNaN(numVal) && (numVal < minAmount || numVal > maxAmount);

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseFloat(localVal);
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(rowIndex, Math.round(parsed * 100) / 100);
    } else {
      setLocalVal(value.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setLocalVal(value.toString());
      setIsEditing(false);
    }
  };

  return (
    <div className="relative flex items-center justify-end">
      <Input
        type="number"
        step="0.01"
        value={localVal}
        onFocus={() => setIsEditing(true)}
        onChange={(e) => {
          setLocalVal(e.target.value);
          const parsed = parseFloat(e.target.value);
          if (!isNaN(parsed) && parsed >= 0) {
            onSave(rowIndex, Math.round(parsed * 100) / 100);
          }
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-8 w-32 text-right text-sm font-semibold transition-all duration-150",
          isOutOfBounds
            ? "border-amber-500 bg-amber-500/10 text-amber-900 focus-visible:ring-amber-500 dark:text-amber-300"
            : isEditing
            ? "border-primary focus-visible:ring-primary"
            : "border-transparent bg-transparent hover:border-input hover:bg-background/80"
        )}
      />
    </div>
  );
}
