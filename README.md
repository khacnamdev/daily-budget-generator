# Daily Budget Generator 🎲💰

A modern, production-ready web application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**. It generates natural random daily amount distributions based on user constraints and provides an interactive editable data table, statistics dashboard, Excel/CSV export and import, local storage state persistence, and generation history.

---

## 🌟 Key Features

- **Dynamic Configuration Form**:
  - Days (1–31)
  - Minimum Amount ($)
  - Maximum Amount ($)
  - Maximum Total ($)
  - Live validation rules powered by **Zod** and **React Hook Form**.

- **Optimized Random Generation Algorithm**:
  - Dynamic bounded sampling mathematically guarantees values stay within $[Min, Max]$.
  - Total sum **NEVER** exceeds Maximum Total.
  - Centered sampling around remaining average prevents "the final day penalty" (where the last item gets squeezed).
  - Handles impossible constraint configurations gracefully with clear error messages.

- **Editable Data Table**:
  - Built with **TanStack Table v8**.
  - Direct inline cell editing for amounts with instant recalculation of total and remaining budget.
  - Real-time constraint validation highlights and export locking on invalid state.
  - Search filter by day label or number.
  - Column sorting by Day and Amount.
  - Customizable pagination (10, 20, 50, 100 rows per page).

- **Statistics Dashboard**:
  - 6 Animated Stat Widgets: Number of Days, Generated Total, Remaining Amount, Average Amount, Min Amount, Max Amount.
  - Animated Budget Utilization Progress Bar.

- **Full Export & Import Options**:
  - **Excel Export (.xlsx)**: Professional report styled with blue headers (`#1E40AF`), cell borders, currency formatting (`$#,##0.00`), frozen header pane, auto column width, and timestamp footer.
  - **CSV Export (.csv)**: Clean structured CSV.
  - **Excel Import (.xlsx)**: Drag & drop Excel file parser that populates table rows, extracts config, and recalculates budget metrics automatically.
  - **Copy Table**: Copies tab-separated data formatted for spreadsheets.
  - **Print**: Dedicated print media layout activated via `window.print()`.

- **History Management & Local Storage Persistence**:
  - Tracks generation history snapshots with reload, delete, and individual record export options.
  - Auto-saves configuration, table state, history logs, and theme preferences to LocalStorage.

- **Theme & UI Excellence**:
  - Modern Glassmorphism aesthetic with Framer Motion animations.
  - Support for **Light**, **Dark**, and **System** themes via `next-themes`.

---

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Forms & Validation**: React Hook Form + Zod
- **Data Table**: TanStack Table v8
- **Excel & CSV Engine**: ExcelJS & FileSaver
- **Animations**: Framer Motion
- **Icons & Components**: Lucide React + Radix UI
- **Notifications**: Sonner
- **Theme**: next-themes
- **Testing**: Vitest

---

## 📁 Project Structure

```
.
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── providers.tsx
├── src/
│   ├── types/
│   │   └── budget.ts
│   ├── constants/
│   │   └── default-config.ts
│   ├── utils/
│   │   ├── algorithm.ts         # Math-bounded random generation algorithm
│   │   ├── excel.ts             # ExcelJS import/export service
│   │   ├── csv.ts               # CSV export & copy text generator
│   │   ├── formatting.ts        # Currency and date formatters
│   │   └── storage.ts           # LocalStorage wrapper
│   ├── hooks/
│   │   ├── use-budget-store.ts  # Central budget store hook
│   │   └── use-local-storage.ts
│   ├── features/
│   │   ├── config/
│   │   │   └── config-form.tsx  # Parameter configuration form
│   │   ├── table/
│   │   │   ├── budget-table.tsx # TanStack table component
│   │   │   └── inline-edit-cell.tsx
│   │   ├── stats/
│   │   │   ├── stats-dashboard.tsx # Animated stat cards
│   │   │   └── stat-card.tsx
│   │   ├── history/
│   │   │   ├── history-drawer.tsx # Generation history modal
│   │   │   └── history-item.tsx
│   │   └── import-export/
│   │       ├── export-actions.tsx # Export/Import toolbar buttons
│   │       └── import-modal.tsx  # Drag & drop Excel upload dialog
│   └── components/
│       ├── ui/                  # Button, Input, Card, Dialog, Badge, Select, etc.
│       ├── navbar.tsx           # Navigation header bar
│       ├── theme-toggle.tsx     # Theme switcher
│       └── print-layout.tsx     # Hidden printable layout
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### Installation

```bash
pnpm install
```

### Run Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Tests

```bash
pnpm run test
```

### Type Check & Build

```bash
pnpm run typecheck
pnpm run build
```

---

## 📐 Random Generation Algorithm Explanation

For $N$ days with bounds $[Min, Max]$ and budget cap $MaxTotal$:

1. **Feasibility Pre-check**: Verifies that $N \times Min \le MaxTotal$.
2. **Dynamic Feasible Sampling**: For day $i \in [1..N]$ with remaining days $K$ and remaining target sum $R$:
   - $lower\_bound = \max(Min, R - (K - 1) \times Max)$
   - $upper\_bound = \min(Max, R - (K - 1) \times Min)$
3. **Centered Jittering**: Random samples are centered around the expected remaining average $mean = R / K$. This eliminates structural bias towards early entries and prevents the final entries from being artificially squished.
