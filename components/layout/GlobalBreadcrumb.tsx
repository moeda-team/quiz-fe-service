// components/layout/GlobalBreadcrumb.tsx
"use client";

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbStore } from "@/stores/breadcrumb-store";

export function GlobalBreadcrumb() {
  const items = useBreadcrumbStore((s) => s.items);

  // Kalau mau: kalau kosong, jangan render apa-apa
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b">
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            {/* Kalau mau Home selalu ada */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <span key={index} className="inline-flex items-center">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast || !item.href ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
