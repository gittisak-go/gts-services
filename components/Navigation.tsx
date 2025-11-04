"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1.5 mb-3 pb-2.5 border-b border-gray-200">
      <Link
        href="/"
        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
          pathname === "/"
            ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        }`}
      >
        หน้าแรก
      </Link>
      <Link
        href="/calendar"
        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
          pathname === "/calendar"
            ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        }`}
      >
        ปฏิทินวันลา
      </Link>
      <Link
        href="/history"
        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
          pathname === "/history"
            ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        }`}
      >
        ประวัติ
      </Link>
      <Link
        href="/reports"
        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
          pathname === "/reports"
            ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        }`}
      >
        รายงาน
      </Link>
    </nav>
  );
}
