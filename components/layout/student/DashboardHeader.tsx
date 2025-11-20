// components/layout/DashboardHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  ChevronDown,
  Grid3x3,
  Settings,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  const pathname = usePathname();
  const [openMobileNav, setOpenMobileNav] = useState(false);

  const isOverview = pathname === "/dashboard/student";
  const isClassrooms = pathname.startsWith("/dashboard/student/classrooms");

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="bg-white border-b sticky top-0 z-50 border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-3">
              {/* MOBILE MENU BUTTON */}
              <button
                className="lg:hidden p-2 rounded-md border border-gray-200"
                onClick={() => setOpenMobileNav(true)}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
                <span className="font-semibold text-gray-900">Cogie</span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-8 text-sm ml-10">
                <Link
                  href="/dashboard/student"
                  className={`relative pb-1 ${
                    isOverview
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <span>Overview</span>
                  {isOverview && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </Link>

                <Link
                  href="/dashboard/student/classrooms"
                  className={`relative pb-1 ${
                    isClassrooms
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <span>Kelas</span>
                  {isClassrooms && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </Link>

                <button className="text-gray-500 hover:text-gray-900">
                  File Storage
                </button>

                <button className="text-gray-500 hover:text-gray-900">
                  Message
                </button>
              </nav>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Courses (Desktop Only) */}
              <Link href="/dashboard/student/courses" className="hidden md:block">
                <Button variant="ghost" size="sm">
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Courses
                </Button>
              </Link>

              {/* Icons */}
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Settings className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              {/* Avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" />
                      <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-52 bg-white text-gray-900 border border-gray-200 shadow-lg"
                >
                  <DropdownMenuLabel className="flex flex-col gap-1 text-gray-900">
                    <span className="text-[11px] text-gray-500">
                      Signed in as
                    </span>
                    <span className="text-sm font-medium">admin@example.com</span>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-gray-200" />

                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50">
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-700" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50">
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-gray-700" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-200" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE SIDEBAR NAV ================= */}
      {openMobileNav && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Overlay */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setOpenMobileNav(false)}
          />

          {/* Drawer */}
          <div className="w-72 bg-white h-full shadow-xl p-6 flex flex-col gap-6 animate-slide-in-right">
            {/* Close Button */}
            <button
              className="self-end mb-4"
              onClick={() => setOpenMobileNav(false)}
            >
              <X className="w-6 h-6" />
            </button>

            {/* NAV ITEMS */}
            <nav className="flex flex-col gap-4 text-gray-700">
              <Link
                href="/dashboard/student"
                className={`text-sm ${
                  isOverview ? "text-blue-600 font-semibold" : ""
                }`}
                onClick={() => setOpenMobileNav(false)}
              >
                Overview
              </Link>

              <Link
                href="/dashboard/student/classrooms"
                className={`text-sm ${
                  isClassrooms ? "text-blue-600 font-semibold" : ""
                }`}
                onClick={() => setOpenMobileNav(false)}
              >
                Kelas
              </Link>

              <button className="text-sm text-left">File Storage</button>
              <button className="text-sm text-left">Message</button>

              <Link
                href="/dashboard/student/courses"
                className="text-sm"
                onClick={() => setOpenMobileNav(false)}
              >
                Courses
              </Link>

              {/* Logout */}
              <button
                onClick={() => {
                  setOpenMobileNav(false);
                  handleLogout();
                }}
                className="text-sm text-red-600 text-left mt-4"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* MOBILE SIDEBAR ANIMATION */}
      <style jsx>{`
        @keyframes slide-in-right {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
