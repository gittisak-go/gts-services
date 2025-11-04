"use client";

import { useState, useEffect } from "react";
import { useLiff } from "@/hooks/useLiff";
import Navigation from "@/components/Navigation";
import Loading from "@/components/Loading";
import {
  getTimePeriodReport,
  getUserReport,
  getDayStatsReport,
  getCategoryReport,
  getSummaryReport,
  type TimePeriodReport,
  type UserReport,
  type DayStatsReport,
  type CategoryReport,
  type SummaryReport,
} from "@/lib/reports";
import { getLeaveCategoryLabel } from "@/lib/booking";

type ReportType = "summary" | "time" | "category" | "user" | "day";

export default function ReportsPage() {
  const { liff, loading, isLoggedIn } = useLiff();
  const [activeReport, setActiveReport] = useState<ReportType>("summary");
  const [periodType, setPeriodType] = useState<"month" | "year">("month");
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [timeReports, setTimeReports] = useState<TimePeriodReport[]>([]);
  const [categoryReports, setCategoryReports] = useState<CategoryReport[]>([]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [dayStats, setDayStats] = useState<DayStatsReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      if (!isLoggedIn) return;

      setLoadingReports(true);
      try {
        // โหลดรายงานตามประเภทที่เลือก
        switch (activeReport) {
          case "summary":
            const summaryData = await getSummaryReport();
            setSummary(summaryData);
            break;
          case "time":
            const timeData = await getTimePeriodReport(periodType);
            setTimeReports(timeData);
            break;
          case "category":
            const categoryData = await getCategoryReport();
            setCategoryReports(categoryData);
            break;
          case "user":
            const userData = await getUserReport();
            setUserReports(userData);
            break;
          case "day":
            const dayData = await getDayStatsReport(20);
            setDayStats(dayData);
            break;
        }
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        setLoadingReports(false);
      }
    };

    loadReports();
  }, [activeReport, periodType, isLoggedIn]);

  // ฟังก์ชันแสดงรายงานสรุปภาพรวม
  const renderSummaryReport = () => {
    if (!summary) return null;

    return (
      <div className="space-y-4">
        {/* Summary Cards - Miller's Rule: จัดกลุ่มเป็น cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg">
            <div className="text-xs text-blue-600 font-medium mb-1">
              จำนวนการจองทั้งหมด
            </div>
            <div className="text-xl font-bold text-blue-800">
              {summary.totalBookings}
            </div>
          </div>
          <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg">
            <div className="text-xs text-green-600 font-medium mb-1">
              จำนวนวันลาทั้งหมด
            </div>
            <div className="text-xl font-bold text-green-800">
              {summary.totalDays}
            </div>
          </div>
          <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-lg">
            <div className="text-xs text-purple-600 font-medium mb-1">
              จำนวนผู้ใช้
            </div>
            <div className="text-xl font-bold text-purple-800">
              {summary.totalUsers}
            </div>
          </div>
          <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-lg">
            <div className="text-xs text-orange-600 font-medium mb-1">
              เฉลี่ยวัน/ครั้ง
            </div>
            <div className="text-xl font-bold text-orange-800">
              {summary.averageDaysPerBooking}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            สรุปตามประเภทการลา
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-white rounded">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-sm text-gray-700">ในประเทศ</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">
                  {summary.domesticBookings} ครั้ง
                </div>
                <div className="text-xs text-gray-600">
                  {summary.domesticDays} วัน
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="text-sm text-gray-700">นอกประเทศ</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">
                  {summary.internationalBookings} ครั้ง
                </div>
                <div className="text-xs text-gray-600">
                  {summary.internationalDays} วัน
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        {(summary.mostPopularDay || summary.mostActiveUser) && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border-l-4 border-green-500">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              ไฮไลท์
            </h3>
            <div className="space-y-2 text-xs">
              {summary.mostPopularDay && (
                <div className="text-gray-700">
                  <span className="font-medium">วันยอดนิยม:</span>{" "}
                  {summary.mostPopularDay.dateDisplay} (
                  {summary.mostPopularDay.bookingCount} การจอง)
                </div>
              )}
              {summary.mostActiveUser && (
                <div className="text-gray-700">
                  <span className="font-medium">ผู้ใช้ที่ลาบ่อยที่สุด:</span>{" "}
                  {summary.mostActiveUser.userName} (
                  {summary.mostActiveUser.totalDays} วัน)
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ฟังก์ชันแสดงรายงานตามช่วงเวลา
  const renderTimeReport = () => {
    return (
      <div className="space-y-3">
        {/* Period Type Toggle */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setPeriodType("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              periodType === "month"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            รายเดือน
          </button>
          <button
            onClick={() => setPeriodType("year")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              periodType === "year"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            รายปี
          </button>
        </div>

        {timeReports.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">ยังไม่มีข้อมูล</p>
          </div>
        ) : (
          <div className="space-y-2">
            {timeReports.map((report) => (
              <div
                key={report.period}
                className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {periodType === "month"
                      ? report.period.replace(
                          /(\d{4})-(\d{2})/,
                          (_, year, month) => {
                            const months = [
                              "มกราคม",
                              "กุมภาพันธ์",
                              "มีนาคม",
                              "เมษายน",
                              "พฤษภาคม",
                              "มิถุนายน",
                              "กรกฎาคม",
                              "สิงหาคม",
                              "กันยายน",
                              "ตุลาคม",
                              "พฤศจิกายน",
                              "ธันวาคม",
                            ];
                            return `${months[parseInt(month) - 1]} ${parseInt(year) + 543}`;
                          }
                        )
                      : `ปี ${parseInt(report.period) + 543}`}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">การจอง:</span>{" "}
                    <span className="font-semibold text-gray-800">
                      {report.totalBookings} ครั้ง
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">วันลา:</span>{" "}
                    <span className="font-semibold text-gray-800">
                      {report.totalDays} วัน
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">ในประเทศ:</span>{" "}
                    <span className="font-semibold text-blue-700">
                      {report.domesticBookings} ครั้ง ({report.domesticDays} วัน)
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">นอกประเทศ:</span>{" "}
                    <span className="font-semibold text-purple-700">
                      {report.internationalBookings} ครั้ง (
                      {report.internationalDays} วัน)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ฟังก์ชันแสดงรายงานตามประเภท
  const renderCategoryReport = () => {
    return (
      <div className="space-y-3">
        {categoryReports.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">ยังไม่มีข้อมูล</p>
          </div>
        ) : (
          categoryReports.map((report) => (
            <div
              key={report.category}
              className={`bg-gray-50 rounded-lg p-3 border-l-4 ${
                report.category === "domestic"
                  ? "border-blue-500"
                  : "border-purple-500"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">
                  {report.categoryLabel}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    report.category === "domestic"
                      ? "bg-blue-500 text-white"
                      : "bg-purple-500 text-white"
                  }`}
                >
                  {report.totalBookings} ครั้ง
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">วันลาทั้งหมด:</span>{" "}
                  <span className="font-semibold text-gray-800">
                    {report.totalDays} วัน
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">เฉลี่ย/ครั้ง:</span>{" "}
                  <span className="font-semibold text-gray-800">
                    {report.averageDays} วัน
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">จำนวนผู้ใช้:</span>{" "}
                  <span className="font-semibold text-gray-800">
                    {report.uniqueUsers} คน
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // ฟังก์ชันแสดงรายงานตามผู้ใช้
  const renderUserReport = () => {
    return (
      <div className="space-y-2">
        {userReports.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">ยังไม่มีข้อมูล</p>
          </div>
        ) : (
          userReports.map((report, index) => (
            <div
              key={report.userId}
              className="bg-gray-50 rounded-lg p-3 border-l-4 border-green-500"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded font-semibold">
                      🏆
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-gray-800">
                    {report.userName}
                  </h3>
                </div>
                <span className="text-xs text-gray-600">
                  {report.totalDays} วัน
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">การจอง:</span>{" "}
                  <span className="font-semibold text-gray-800">
                    {report.totalBookings} ครั้ง
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">วันลา:</span>{" "}
                  <span className="font-semibold text-gray-800">
                    {report.totalDays} วัน
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">ในประเทศ:</span>{" "}
                  <span className="font-semibold text-blue-700">
                    {report.domesticBookings} ครั้ง ({report.domesticDays} วัน)
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">นอกประเทศ:</span>{" "}
                  <span className="font-semibold text-purple-700">
                    {report.internationalBookings} ครั้ง (
                    {report.internationalDays} วัน)
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // ฟังก์ชันแสดงรายงานสถิติวัน
  const renderDayStatsReport = () => {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-600 mb-3">
          วันที่มีการลามากที่สุด (แสดง 20 อันดับแรก)
        </p>
        {dayStats.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">ยังไม่มีข้อมูล</p>
          </div>
        ) : (
          dayStats.map((stat, index) => (
            <div
              key={stat.date}
              className="bg-gray-50 rounded-lg p-3 border-l-4 border-orange-500"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {index < 3 && (
                    <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded font-semibold">
                      #{index + 1}
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-gray-800">
                    {stat.dateDisplay}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-orange-700">
                  {stat.bookingCount} การจอง
                </span>
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-medium">ผู้ใช้:</span>{" "}
                {stat.users.join(", ")}
              </div>
            </div>
          ))
        )}
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
            คุณต้องเข้าสู่ระบบด้วย LINE ก่อนดูรายงาน
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
            รายงานข้อมูลการลา
          </h1>
          <p className="text-xs text-gray-600">
            ดูสถิติและรายงานสรุปข้อมูลการลา
          </p>
        </div>

        {/* Report Type Tabs - Fitts's Law: ปุ่มใหญ่พอ */}
        <div className="mb-4 flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveReport("summary")}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              activeReport === "summary"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            สรุปภาพรวม
          </button>
          <button
            onClick={() => setActiveReport("time")}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              activeReport === "time"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ตามช่วงเวลา
          </button>
          <button
            onClick={() => setActiveReport("category")}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              activeReport === "category"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ตามประเภท
          </button>
          <button
            onClick={() => setActiveReport("user")}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              activeReport === "user"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ตามผู้ใช้
          </button>
          <button
            onClick={() => setActiveReport("day")}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              activeReport === "day"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            สถิติวัน
          </button>
        </div>

        {/* Report Content */}
        {loadingReports ? (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <div className="text-sm text-gray-600">กำลังโหลดข้อมูล...</div>
          </div>
        ) : (
          <div>
            {activeReport === "summary" && renderSummaryReport()}
            {activeReport === "time" && renderTimeReport()}
            {activeReport === "category" && renderCategoryReport()}
            {activeReport === "user" && renderUserReport()}
            {activeReport === "day" && renderDayStatsReport()}
          </div>
        )}
      </div>
    </div>
  );
}

