"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Reports download error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg p-6 shadow-sm max-w-md w-full border-l-4 border-red-500">
        <h1 className="text-lg font-semibold mb-2 text-red-700">
          เกิดข้อผิดพลาด
        </h1>
        <p className="text-sm text-gray-700 mb-4">
          {error.message || "เกิดข้อผิดพลาดในการดาวน์โหลด PDF"}
        </p>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
          >
            ลองอีกครั้ง
          </button>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-all"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}

