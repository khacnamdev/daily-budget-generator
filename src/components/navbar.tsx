"use client";

import React from "react";
import { Dice5, History, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  historyCount: number;
  onOpenHistory: () => void;
}

export function Navbar({ historyCount, onOpenHistory }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Dice5 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Daily Budget Generator
              </h1>
              <Badge variant="outline" className="hidden sm:inline-flex gap-1 text-[10px]">
                <Sparkles className="h-3 w-3 text-amber-500" />
                v1.0
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Random daily allocation engine & report builder
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenHistory}
            className="gap-2 border-border/80 relative"
          >
            <History className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <Badge variant="default" className="h-5 px-1.5 text-[10px] rounded-full">
                {historyCount}
              </Badge>
            )}
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
