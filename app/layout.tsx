// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Online Learning Platform",
  description:
    "Platform pembelajaran online dengan fitur CRUD kelas, materi, dan quiz.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
