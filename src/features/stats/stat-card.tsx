"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
  trend?: "positive" | "negative" | "neutral" | "warning";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
  trend,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-md transition-all duration-200 hover:shadow-md",
          trend === "negative" && "border-destructive/40 bg-destructive/5",
          trend === "warning" && "border-amber-500/40 bg-amber-500/5",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <h4 className="text-2xl font-bold tracking-tight">{value}</h4>
            {subtitle && (
              <p
                className={cn(
                  "text-xs text-muted-foreground",
                  trend === "negative" && "font-medium text-destructive",
                  trend === "warning" && "font-medium text-amber-600 dark:text-amber-400"
                )}
              >
                {subtitle}
              </p>
            )}
          </div>

          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-200 hover:scale-105",
              iconColor
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
