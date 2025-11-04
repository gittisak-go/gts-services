"use client";

import { getLeaveCategoryLabel, getMaxDays } from "@/lib/booking";
import { formatDateThai, getDaysCount } from "@/lib/dateUtils";
import type { LeaveCategory } from "@/types/booking";

interface BookingFooterProps {
  selectedDate: Date;
  endDate: Date;
  category: LeaveCategory;
  reason: string;
  onCategoryChange: (category: LeaveCategory) => void;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  validationError: string;
}

export default function BookingFooter({
  selectedDate,
  endDate,
  category,
  reason,
  onCategoryChange,
  onReasonChange,
  onConfirm,
  onCancel,
  validationError,
}: BookingFooterProps) {
  const maxDays = getMaxDays(category);
  const daysCount = getDaysCount(selectedDate, endDate);
  const isMultipleDays = endDate.getTime() !== selectedDate.getTime();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 animate-slide-up">
      <div className="max-w-md mx-auto p-4">
        {validationError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-2 rounded mb-3 text-xs">
            {validationError}
          </div>
        )}

        {/* Date Summary - Improved Layout with Visual Hierarchy */}
        <div className="mb-3 pb-2.5 border-b border-gray-200">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Date Range */}
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">เริ่ม:</span>
                <span className="font-semibold text-gray-900">
                  {formatDateThai(selectedDate)}
                </span>
              </div>
              {isMultipleDays && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 font-medium">สิ้นสุด:</span>
                  <span className="font-semibold text-gray-900">
                    {formatDateThai(endDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Days Count - Visual Hierarchy */}
            <div className="flex flex-col items-end justify-center">
              <div
                className={`text-lg font-bold ${
                  daysCount > maxDays ? "text-red-600" : "text-green-700"
                }`}
              >
                {daysCount}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">
                วัน
              </div>
            </div>
          </div>
          {isMultipleDays && daysCount > maxDays && (
            <div className="text-xs text-red-600 mt-2 bg-red-50 px-2 py-1 rounded">
              ⚠️ เกินจำนวนวันที่อนุญาต
            </div>
          )}
        </div>

        {/* Category Selection - Compact */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            ประเภทการลา
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onCategoryChange("domestic")}
              className={`p-2 rounded-lg border-2 transition-all ${
                category === "domestic"
                  ? "border-line-green bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-xs font-semibold text-gray-800">
                ในประเทศ
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                สูงสุด {getMaxDays("domestic")} วัน
              </div>
            </button>
            <button
              onClick={() => onCategoryChange("international")}
              className={`p-2 rounded-lg border-2 transition-all ${
                category === "international"
                  ? "border-line-green bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-xs font-semibold text-gray-800">
                นอกประเทศ
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                สูงสุด {getMaxDays("international")} วัน
              </div>
            </button>
          </div>
        </div>

        {/* Reason Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            รายละเอียดการลา{" "}
            <span className="text-gray-500 font-normal">(ไม่บังคับ)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="ระบุเหตุผลการลา..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-line-green focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
            style={{ color: "#111827" }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={daysCount > maxDays}
            className={`flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              daysCount > maxDays
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white shadow-md"
            }`}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
