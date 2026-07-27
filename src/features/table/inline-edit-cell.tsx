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
  const [localVal, setLocalVal] = useState<string>(Math.round(value).toString());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLocalVal(Math.round(value).toString());
  }, [value]);

  const numVal = parseInt(localVal, 10);
  const isOutOfBounds = !isNaN(numVal) && (numVal < minAmount || numVal > maxAmount);

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseInt(localVal, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(rowIndex, Math.round(parsed));
      setLocalVal(Math.round(parsed).toString());
    } else {
      setLocalVal(Math.round(value).toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setLocalVal(Math.round(value).toString());
      setIsEditing(false);
    }
  };

  return (
    <div className="relative flex items-center justify-end">
      <Input
        type="number"
        step="1"
        value={localVal}
        onFocus={() => setIsEditing(true)}
        onChange={(e) => {
          setLocalVal(e.target.value);
          const parsed = parseInt(e.target.value, 10);
          if (!isNaN(parsed) && parsed >= 0) {
            onSave(rowIndex, Math.round(parsed));
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
