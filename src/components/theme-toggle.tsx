"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Select value={theme || "system"} onValueChange={(val) => setTheme(val)}>
        <SelectTrigger className="h-9 w-32 bg-background/80 border-border/60 backdrop-blur-sm">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <span className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              Light
            </span>
          </SelectItem>
          <SelectItem value="dark">
            <span className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-400" />
              Dark
            </span>
          </SelectItem>
          <SelectItem value="system">
            <span className="flex items-center gap-2">
              <Laptop className="h-4 w-4 text-muted-foreground" />
              System
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
