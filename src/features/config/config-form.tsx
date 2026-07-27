"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sparkles, RotateCcw, AlertCircle, Calculator } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BudgetConfig } from "@/types/budget";
import { MIN_DAYS, MAX_DAYS } from "@/constants/default-config";

const configSchema = z
  .object({
    days: z
      .number({ invalid_type_error: "Days must be a number" })
      .int("Days must be an integer")
      .min(MIN_DAYS, `Days must be at least ${MIN_DAYS}`)
      .max(MAX_DAYS, `Days cannot exceed ${MAX_DAYS}`),
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
  .refine((data) => data.maxTotal >= data.days * data.minAmount, {
    message: "Maximum Total must be greater than or equal to (Days × Minimum).",
    path: ["maxTotal"],
  });

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
    formState: { errors, isValid },
  } = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    mode: "onChange",
    defaultValues: config,
  });

  // Sync form values when store config changes externally
  useEffect(() => {
    setValue("days", config.days);
    setValue("minAmount", config.minAmount);
    setValue("maxAmount", config.maxAmount);
    setValue("maxTotal", config.maxTotal);
  }, [config, setValue]);

  const watchDays = watch("days");
  const watchMin = watch("minAmount");
  const requiredMinTotal = (watchDays || 0) * (watchMin || 0);

  const onSubmit = (data: ConfigFormValues) => {
    onGenerate(data);
  };

  return (
    <Card className="border-border/60 bg-card/80 shadow-lg backdrop-blur-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Configuration</CardTitle>
              <CardDescription>
                Define your daily generation parameters & constraints
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Number of Days */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Number of Days (1–31)
              </label>
              <Input
                type="number"
                min={MIN_DAYS}
                max={MAX_DAYS}
                step={1}
                placeholder="e.g. 30"
                {...register("days", { valueAsNumber: true })}
                className={errors.days ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.days && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.days.message}
                </p>
              )}
            </div>

            {/* Minimum Amount */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Minimum Amount ($)
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="e.g. 10.00"
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
                Maximum Amount ($)
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="e.g. 100.00"
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
                Maximum Total ($)
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="e.g. 1500.00"
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
                  Min required: ${requiredMinTotal.toFixed(2)}
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
