"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1.5 mb-3 pb-2.5 border-b border-gray-200">
      <Link
        href="/"
        className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
          pathname === "/"
            ? "bg-line-green text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-line-green"
        }`}
      >
        หน้าแรก
      </Link>
      <Link
        href="/calendar"
        className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
          pathname === "/calendar"
            ? "bg-line-green text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-line-green"
        }`}
      >
        ปฏิทินวันลา
      </Link>
    </nav>
  );
}
