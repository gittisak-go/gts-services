"use client";

import { useState, useEffect } from "react";
import { useLiff } from "@/hooks/useLiff";
import Navigation from "@/components/Navigation";
import Loading from "@/components/Loading";
import { getAllHistory } from "@/lib/history";
import { getLeaveCategoryLabel } from "@/lib/booking";
import { formatDateThai, formatDateShort } from "@/lib/dateUtils";
import type { HistoryEntry } from "@/types/booking";

export default function HistoryPage() {
  const { liff, loading, isLoggedIn } = useLiff();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "create" | "update" | "delete">(
    "all"
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const allHistory = getAllHistory();
      setHistory(allHistory);
    }
  }, []);

  // กรองประวัติตาม action
  const filteredHistory = history.filter((entry) => {
    if (filter === "all") return true;
    return entry.action === filter;
  });

  // แปลง timestamp เป็นวันที่และเวลา
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const bangkokDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Bangkok" })
    );

    const days = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
    const months = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];

    const day = days[bangkokDate.getDay()];
    const dateNum = bangkokDate.getDate();
    const month = months[bangkokDate.getMonth()];
    const year = bangkokDate.getFullYear() + 543;
    const hours = String(bangkokDate.getHours()).padStart(2, "0");
    const minutes = String(bangkokDate.getMinutes()).padStart(2, "0");

    return `${day} ${dateNum} ${month} ${year} ${hours}:${minutes}`;
  };

  // ฟังก์ชันแสดงชื่อการกระทำ
  const getActionLabel = (action: HistoryEntry["action"]): string => {
    const labels = {
      create: "สร้าง",
      update: "แก้ไข",
      delete: "ลบ",
    };
    return labels[action];
  };

  // ฟังก์ชันแสดงสีตาม action
  const getActionColor = (action: HistoryEntry["action"]): string => {
    const colors = {
      create: "bg-green-100 text-green-800 border-green-300",
      update: "bg-blue-100 text-blue-800 border-blue-300",
      delete: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[action];
  };

  // ฟังก์ชันแสดงข้อมูลการจอง
  const renderBookingInfo = (entry: HistoryEntry) => {
    const data = entry.bookingData || entry.newData || entry.oldData;
    if (!data) return null;

    return (
      <div className="mt-2 p-2 bg-gray-50 rounded text-xs space-y-1">
        {data.date && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">วันที่:</span>
            <span className="text-gray-800">
              {formatDateShort(new Date(data.date))}
              {data.endDate && data.endDate !== data.date && (
                <> - {formatDateShort(new Date(data.endDate))}</>
              )}
            </span>
          </div>
        )}
        {data.category && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">ประเภท:</span>
            <span className="text-gray-800">
              {getLeaveCategoryLabel(data.category)}
            </span>
          </div>
        )}
        {data.reason && (
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-600">เหตุผล:</span>
            <span className="text-gray-800 flex-1">{data.reason}</span>
          </div>
        )}
      </div>
    );
  };

  // ฟังก์ชันแสดงการเปลี่ยนแปลง (สำหรับ update)
  const renderChanges = (entry: HistoryEntry) => {
    if (entry.action !== "update" || !entry.oldData || !entry.newData)
      return null;

    const changes: string[] = [];

    if (entry.oldData.date !== entry.newData.date) {
      changes.push(
        `วันที่: ${
          entry.oldData.date
            ? formatDateShort(new Date(entry.oldData.date))
            : "-"
        } → ${
          entry.newData.date
            ? formatDateShort(new Date(entry.newData.date))
            : "-"
        }`
      );
    }
    if (entry.oldData.endDate !== entry.newData.endDate) {
      const oldEnd = entry.oldData.endDate
        ? formatDateShort(new Date(entry.oldData.endDate))
        : "-";
      const newEnd = entry.newData.endDate
        ? formatDateShort(new Date(entry.newData.endDate))
        : "-";
      changes.push(`วันสิ้นสุด: ${oldEnd} → ${newEnd}`);
    }
    if (entry.oldData.category !== entry.newData.category) {
      const oldCat = entry.oldData.category
        ? getLeaveCategoryLabel(entry.oldData.category)
        : "-";
      const newCat = entry.newData.category
        ? getLeaveCategoryLabel(entry.newData.category)
        : "-";
      changes.push(`ประเภท: ${oldCat} → ${newCat}`);
    }
    if (entry.oldData.reason !== entry.newData.reason) {
      changes.push(
        `เหตุผล: ${entry.oldData.reason || "-"} → ${
          entry.newData.reason || "-"
        }`
      );
    }

    if (changes.length === 0) return null;

    return (
      <div className="mt-2 p-2 bg-yellow-50 rounded border-l-2 border-yellow-400 text-xs">
        <div className="font-medium text-yellow-800 mb-1">การเปลี่ยนแปลง:</div>
        <ul className="space-y-1 text-yellow-700">
          {changes.map((change, index) => (
            <li key={index}>• {change}</li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen p-2 flex justify-center items-start">
        <div className="bg-white rounded-lg p-4 shadow-sm max-w-full w-full border-l-4 border-orange-500">
          <h1 className="text-base font-semibold mb-2 text-orange-700">
            กรุณาเข้าสู่ระบบ
          </h1>
          <p className="text-sm text-gray-700">
            คุณต้องเข้าสู่ระบบด้วย LINE ก่อนดูประวัติการจอง
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 flex justify-center items-start bg-gray-50 pb-20">
      <div className="bg-white rounded-lg p-3 shadow-sm max-w-full w-full">
        <Navigation />

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-lg font-bold text-gray-800 mb-2">
            ประวัติการจองวันลา
          </h1>
          <p className="text-xs text-gray-600">
            ดูประวัติการสร้าง แก้ไข และลบการจองทั้งหมด
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-4 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              filter === "all"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilter("create")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              filter === "create"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            สร้าง
          </button>
          <button
            onClick={() => setFilter("update")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              filter === "update"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            แก้ไข
          </button>
          <button
            onClick={() => setFilter("delete")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              filter === "delete"
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ลบ
          </button>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              {filter === "all"
                ? "ยังไม่มีประวัติการจอง"
                : `ยังไม่มีประวัติการ${getActionLabel(filter)}`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg border-l-4 ${getActionColor(
                  entry.action
                )}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">
                        {getActionLabel(entry.action)}
                      </span>
                      <span className="text-xs opacity-75">
                        โดย {entry.userName}
                      </span>
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      {formatTimestamp(entry.timestamp)}
                    </div>
                  </div>
                </div>

                {renderBookingInfo(entry)}
                {renderChanges(entry)}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredHistory.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 text-center">
            แสดง {filteredHistory.length} รายการ
            {filter !== "all" && ` (จากทั้งหมด ${history.length} รายการ)`}
          </div>
        )}
      </div>
    </div>
  );
}
