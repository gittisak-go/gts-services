"use client";

import { useEffect } from "react";
import { getLeaveCategoryLabel, getMaxDays } from "@/lib/booking";
import {
  formatDateThai,
  formatDateShort,
  getDaysCount,
  getTodayBangkok,
  getMaxBookingDate,
  formatDateString,
  isDateInBookingRange,
  toBangkokDate,
} from "@/lib/dateUtils";
import type { LeaveCategory } from "@/types/booking";

interface BookingFooterProps {
  selectedDate: Date;
  endDate: Date;
  category: LeaveCategory;
  reason: string;
  step: "category" | "endDate" | "reason" | "summary";
  onCategorySelect: (category: LeaveCategory) => void;
  onEndDateSelect: (date: Date) => void;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  onCancel: () => void;
  validationError: string;
}

export default function BookingFooter({
  selectedDate,
  endDate,
  category,
  reason,
  step,
  onCategorySelect,
  onEndDateSelect,
  onReasonChange,
  onConfirm,
  onBack,
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

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div
            className={`h-2 w-2 rounded-full ${
              step === "category" ? "bg-line-green" : "bg-gray-300"
            }`}
          />
          <div
            className={`h-2 w-2 rounded-full ${
              step === "endDate" ? "bg-line-green" : "bg-gray-300"
            }`}
          />
          <div
            className={`h-2 w-2 rounded-full ${
              step === "reason" ? "bg-line-green" : "bg-gray-300"
            }`}
          />
          <div
            className={`h-2 w-2 rounded-full ${
              step === "summary" ? "bg-line-green" : "bg-gray-300"
            }`}
          />
        </div>

        {/* Step 1: Category Selection */}
        {step === "category" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              เลือกประเภทการลา
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onCategorySelect("domestic")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  category === "domestic"
                    ? "border-line-green bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-base font-semibold text-gray-800">
                  ในประเทศ
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  สูงสุด {maxDays} วัน
                </div>
              </button>
              <button
                onClick={() => onCategorySelect("international")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  category === "international"
                    ? "border-line-green bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-base font-semibold text-gray-800">
                  นอกประเทศ
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  สูงสุด {getMaxDays("international")} วัน
                </div>
              </button>
            </div>
            <button
              onClick={onCancel}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors mt-3"
            >
              ยกเลิก
            </button>
          </div>
        )}

        {/* Step 2: End Date Selection */}
        {step === "endDate" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              เลือกวันที่สิ้นสุด
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              วันที่เริ่มต้น: {formatDateThai(selectedDate)}
            </p>
            <input
              type="date"
              value={formatDateString(endDate)}
              onChange={(e) => {
                if (!e.target.value) return;
                const date = toBangkokDate(new Date(e.target.value));
                onEndDateSelect(date);
              }}
              min={formatDateString(selectedDate)}
              max={formatDateString(getMaxBookingDate())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-line-green focus:border-transparent"
            />
            {isMultipleDays && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-700">
                  จำนวนวัน: <strong>{daysCount} วัน</strong>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  สูงสุดที่อนุญาต: {maxDays} วัน
                </p>
                {daysCount > maxDays && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ เกินจำนวนวันที่อนุญาต
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={onBack}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={() => {
                  if (daysCount <= maxDays) {
                    onEndDateSelect(endDate);
                  }
                }}
                disabled={daysCount > maxDays || endDate < selectedDate}
                className="flex-1 bg-line-green hover:bg-line-green-dark text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Reason Input */}
        {step === "reason" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              เหตุผล (ไม่บังคับ)
            </h3>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="ระบุเหตุผลการลา..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-line-green focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                onClick={onBack}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={() => {
                  onReasonChange(reason);
                  // Move to summary - we'll handle this in parent
                }}
                className="flex-1 bg-line-green hover:bg-line-green-dark text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors"
              >
                ดูสรุป
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {step === "summary" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              รายละเอียดการลา
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ประเภท:</span>
                <span className="font-medium text-gray-800">
                  {getLeaveCategoryLabel(category)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">วันที่เริ่มต้น:</span>
                <span className="font-medium text-gray-800">
                  {formatDateThai(selectedDate)}
                </span>
              </div>
              {isMultipleDays && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">วันที่สิ้นสุด:</span>
                  <span className="font-medium text-gray-800">
                    {formatDateThai(endDate)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">จำนวนวัน:</span>
                <span className="font-medium text-line-green">
                  {daysCount} วัน
                </span>
              </div>
              {reason && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">เหตุผล:</div>
                  <div className="text-sm text-gray-800">{reason}</div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onBack}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-line-green hover:bg-line-green-dark text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                ยืนยันการจอง
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
