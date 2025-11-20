// components/layout/DashboardFooter.tsx
import Link from "next/link";

export function DashboardFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-white mt-8 border-gray-200">
      <div
        className="
          max-w-[1400px] mx-auto 
          px-4 md:px-6 py-4 
          flex flex-col md:flex-row 
          items-center md:items-center 
          justify-between 
          gap-3 md:gap-4 
          text-[11px] md:text-xs 
          text-gray-500
        "
      >
        <span className="text-center md:text-left">
          © {year} Cogie. All rights reserved.
        </span>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4">
          <Link href="#" className="hover:text-gray-700">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-gray-700">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-gray-700">
            Help
          </Link>
        </div>
      </div>
    </footer>
  );
}
