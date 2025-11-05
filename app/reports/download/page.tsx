"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getTimePeriodReport,
  getUserReport,
  getDayStatsReport,
  getCategoryReport,
  getSummaryReport,
  getMonthlyLeaveReport,
  type TimePeriodReport,
  type UserReport,
  type DayStatsReport,
  type CategoryReport,
  type SummaryReport,
} from "@/lib/reports";
import {
  generateSummaryPDF,
  generateTimePeriodPDF,
  generateCategoryPDF,
  generateUserPDF,
  generateDayStatsPDF,
  generateMonthlyLeavePDF,
} from "@/lib/pdfExport";
import Loading from "@/components/Loading";

type ReportType = "summary" | "time" | "category" | "user" | "day" | "monthly";

function ReportsDownloadContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const downloadPDF = async () => {
      try {
        const reportType = searchParams.get("type") as ReportType;
        const periodType = searchParams.get("period") as
          | "month"
          | "year"
          | null;
        const yearParam = searchParams.get("year");
        const monthParam = searchParams.get("month");

        if (!reportType) {
          setStatus("error");
          setErrorMessage("ไม่พบประเภทรายงานที่ระบุ");
          return;
        }

        // โหลดข้อมูลรายงานตามประเภท
        switch (reportType) {
          case "summary":
            const summaryData = await getSummaryReport();
            if (!summaryData || summaryData.totalBookings === 0) {
              setStatus("error");
              setErrorMessage("ยังไม่มีข้อมูลรายงานสรุปภาพรวม");
              return;
            }
            await generateSummaryPDF(summaryData);
            break;
          case "time":
            const timeData = await getTimePeriodReport(periodType || "month");
            if (!timeData || timeData.length === 0) {
              setStatus("error");
              setErrorMessage("ยังไม่มีข้อมูลรายงานตามช่วงเวลา");
              return;
            }
            await generateTimePeriodPDF(timeData, periodType || "month");
            break;
          case "category":
            const categoryData = await getCategoryReport();
            if (!categoryData || categoryData.length === 0) {
              setStatus("error");
              setErrorMessage("ยังไม่มีข้อมูลรายงานตามประเภท");
              return;
            }
            await generateCategoryPDF(categoryData);
            break;
          case "user":
            const userData = await getUserReport();
            if (!userData || userData.length === 0) {
              setStatus("error");
              setErrorMessage("ยังไม่มีข้อมูลรายงานตามผู้ใช้");
              return;
            }
            await generateUserPDF(userData);
            break;
          case "day":
            const dayData = await getDayStatsReport(20);
            if (!dayData || dayData.length === 0) {
              setStatus("error");
              setErrorMessage("ยังไม่มีข้อมูลรายงานสถิติวัน");
              return;
            }
            await generateDayStatsPDF(dayData);
            break;
          case "monthly":
            if (!yearParam || !monthParam) {
              setStatus("error");
              setErrorMessage("กรุณาระบุปีและเดือนสำหรับรายงานการลา");
              return;
            }
            const year = parseInt(yearParam);
            const month = parseInt(monthParam);
            if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
              setStatus("error");
              setErrorMessage("ปีหรือเดือนไม่ถูกต้อง");
              return;
            }
            const monthlyData = await getMonthlyLeaveReport(year, month);
            if (!monthlyData || monthlyData.length === 0) {
              setStatus("error");
              setErrorMessage("ยังไม่มีข้อมูลรายงานการลาแบบรายเดือน");
              return;
            }
            await generateMonthlyLeavePDF(monthlyData, year, month);
            break;
          default:
            setStatus("error");
            setErrorMessage("ประเภทรายงานไม่ถูกต้อง");
            return;
        }

        setStatus("success");

        // ปิดหน้าหลังจากดาวน์โหลดเสร็จ (ถ้าเปิดในหน้าต่างใหม่)
        setTimeout(() => {
          window.close();
        }, 1000);
      } catch (error) {
        console.error("Failed to download PDF:", error);
        setStatus("error");
        setErrorMessage("เกิดข้อผิดพลาดในการดาวน์โหลด PDF");
      }
    };

    downloadPDF();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-sm text-gray-600">กำลังสร้าง PDF...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg p-6 shadow-sm max-w-md w-full border-l-4 border-red-500">
          <h1 className="text-lg font-semibold mb-2 text-red-700">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-sm text-gray-700 mb-4">{errorMessage}</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-all"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg p-6 shadow-sm max-w-md w-full border-l-4 border-green-500">
        <h1 className="text-lg font-semibold mb-2 text-green-700">
          ดาวน์โหลดสำเร็จ
        </h1>
        <p className="text-sm text-gray-700 mb-4">
          PDF ถูกดาวน์โหลดแล้ว หน้าต่างนี้จะปิดอัตโนมัติ
        </p>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  );
}

export default function ReportsDownloadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loading />
            <p className="mt-4 text-sm text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      }
    >
      <ReportsDownloadContent />
    </Suspense>
  );
}
