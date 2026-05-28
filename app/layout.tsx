// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Empat Rima",
  description:
    "Platform pembelajaran online dengan fitur CRUD kelas, materi, dan quiz.",
};

import { Toaster } from "@/components/ui/sonner";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <SessionProvider session={session}>
          <SocketProvider userId={session?.user?.id}>
            <MusicPlayerProvider>
              {children}
              <Toaster />
            </MusicPlayerProvider>
          </SocketProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
