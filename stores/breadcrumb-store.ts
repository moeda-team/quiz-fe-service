// stores/breadcrumb-store.ts
"use client";

import { create } from "zustand";

export type BreadcrumbItem = {
  label: string;
  href?: string;      // kalau undefined => dianggap current page
};

type BreadcrumbState = {
  items: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  resetBreadcrumbs: () => void;
};

export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  items: [],
  setBreadcrumbs: (items) => set({ items }),
  resetBreadcrumbs: () => set({ items: [] }),
}));
