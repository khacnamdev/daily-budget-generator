"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sparkles, RotateCcw, AlertCircle, Calculator, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BudgetConfig, CurrencyCode } from "@/types/budget";
import { MONTH_NAMES, SUPPORTED_CURRENCIES } from "@/constants/default-config";
import { getDaysInMonth, formatCurrency } from "@/utils/formatting";

const configSchema = z
  .object({
    year: z
      .number({ invalid_type_error: "Year must be a number" })
      .int()
      .min(2000, "Year must be 2000 or later")
      .max(2100, "Year cannot exceed 2100"),
    month: z
      .number({ invalid_type_error: "Month must be selected" })
      .int()
      .min(1)
      .max(12),
    currency: z.enum(["USD", "VND", "JPY"] as const),
    minAmount: z
      .number({ invalid_type_error: "Minimum amount must be a number" })
      .min(0, "Minimum amount cannot be negative"),
    maxAmount: z
      .number({ invalid_type_error: "Maximum amount must be a number" })
      .min(0.01, "Maximum amount must be greater than 0"),
    maxTotal: z
      .number({ invalid_type_error: "Maximum total must be a number" })
      .min(0.01, "Maximum total must be greater than 0"),
  })
  .refine((data) => data.minAmount < data.maxAmount, {
    message: "Minimum amount must be smaller than Maximum amount.",
    path: ["minAmount"],
  })
  .refine(
    (data) => {
      const days = getDaysInMonth(data.year, data.month);
      return data.maxTotal >= days * data.minAmount;
    },
    {
      message: "Maximum Total must be greater than or equal to (Days × Minimum).",
      path: ["maxTotal"],
    }
  );

type ConfigFormValues = z.infer<typeof configSchema>;

interface ConfigFormProps {
  config: BudgetConfig;
  onGenerate: (newConfig: BudgetConfig) => void;
  onReset: () => void;
}

export function ConfigForm({ config, onGenerate, onReset }: ConfigFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    mode: "onChange",
    defaultValues: config,
  });

  useEffect(() => {
    setValue("year", config.year);
    setValue("month", config.month);
    setValue("currency", config.currency);
    setValue("minAmount", config.minAmount);
    setValue("maxAmount", config.maxAmount);
    setValue("maxTotal", config.maxTotal);
  }, [config, setValue]);

  const watchYear = watch("year") || 2026;
  const watchMonth = watch("month") || 7;
  const watchMin = watch("minAmount") || 0;
  const watchCurrency = watch("currency") || "USD";

  const computedDays = getDaysInMonth(watchYear, watchMonth);
  const requiredMinTotal = computedDays * watchMin;
  const currentMonthName = MONTH_NAMES[watchMonth - 1];

  const onSubmit = (data: ConfigFormValues) => {
    onGenerate(data);
  };

  const currentSymbol =
    SUPPORTED_CURRENCIES.find((c) => c.code === watchCurrency)?.symbol || "$";

  return (
    <Card className="border-border/60 bg-card/80 shadow-lg backdrop-blur-md">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Configuration</CardTitle>
              <CardDescription>
                Select Month &amp; Year, Currency, and financial constraints
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="self-start sm:self-auto gap-1.5 py-1 px-3 text-xs bg-primary/5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>
              {currentMonthName} {watchYear} &bull; <strong>{computedDays} days</strong>
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* Year Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Year
              </label>
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 16 }, (_, i) => 2020 + i).map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.year && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.year.message}
                </p>
              )}
            </div>

            {/* Month Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Month
              </label>
              <Controller
                name="month"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTH_NAMES.map((mName, idx) => (
                        <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                          {mName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.month && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.month.message}
                </p>
              )}
            </div>

            {/* Currency Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Currency
              </label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val as CurrencyCode)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Minimum Amount */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Min Amount ({currentSymbol})
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="e.g. 10"
                {...register("minAmount", { valueAsNumber: true })}
                className={
                  errors.minAmount ? "border-destructive focus-visible:ring-destructive" : ""
                }
              />
              {errors.minAmount && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.minAmount.message}
                </p>
              )}
            </div>

            {/* Maximum Amount */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Max Amount ({currentSymbol})
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="e.g. 100"
                {...register("maxAmount", { valueAsNumber: true })}
                className={
                  errors.maxAmount ? "border-destructive focus-visible:ring-destructive" : ""
                }
              />
              {errors.maxAmount && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.maxAmount.message}
                </p>
              )}
            </div>

            {/* Maximum Total */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Max Total ({currentSymbol})
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="e.g. 1500"
                {...register("maxTotal", { valueAsNumber: true })}
                className={
                  errors.maxTotal ? "border-destructive focus-visible:ring-destructive" : ""
                }
              />
              {errors.maxTotal ? (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.maxTotal.message}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Min required: {formatCurrency(requiredMinTotal, watchCurrency)}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="gap-2 border-border/80"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={!isValid}
              className="gap-2 px-6"
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              🎲 Generate Data
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
