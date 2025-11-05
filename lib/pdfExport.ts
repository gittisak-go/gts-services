import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  TimePeriodReport,
  UserReport,
  DayStatsReport,
  CategoryReport,
  SummaryReport,
  MonthlyLeaveReport,
} from "@/lib/reports";
import { loadSarabunFont, addSarabunFonts } from "@/lib/pdfFonts";

// สร้าง PDF สำหรับรายงานสรุปภาพรวม
export const generateSummaryPDF = async (
  summary: SummaryReport
): Promise<void> => {
  const doc = new jsPDF();

  // โหลดและเพิ่มฟอนต์ Sarabun
  const fonts = await loadSarabunFont();
  addSarabunFonts(doc, fonts);

  // Header - ใช้ฟอนต์ Bold
  doc.setFont("Sarabun", "bold");
  doc.setFontSize(20);
  doc.text("รายงานสรุปภาพรวมการลา", 14, 20);

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(12);
  doc.text(
    `วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}`,
    14,
    30
  );

  let yPos = 45;

  // Summary Cards
  doc.setFont("Sarabun", "bold");
  doc.setFontSize(14);
  doc.text("สรุปข้อมูล", 14, yPos);
  yPos += 10;

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(10);
  const summaryData = [
    ["จำนวนการจองทั้งหมด", `${summary.totalBookings} ครั้ง`],
    ["จำนวนวันลาทั้งหมด", `${summary.totalDays} วัน`],
    ["จำนวนผู้ใช้", `${summary.totalUsers} คน`],
    ["เฉลี่ยวัน/ครั้ง", `${summary.averageDaysPerBooking} วัน`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["รายการ", "จำนวน"]],
    body: summaryData,
    theme: "striped",
    headStyles: {
      fillColor: [34, 197, 94],
      font: "Sarabun",
      fontStyle: "bold",
    },
    styles: { font: "Sarabun", fontSize: 10 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Category Breakdown
  doc.setFont("Sarabun", "bold");
  doc.setFontSize(14);
  doc.text("สรุปตามประเภทการลา", 14, yPos);
  yPos += 10;

  const categoryData = [
    [
      "ในประเทศ",
      `${summary.domesticBookings} ครั้ง`,
      `${summary.domesticDays} วัน`,
    ],
    [
      "นอกประเทศ",
      `${summary.internationalBookings} ครั้ง`,
      `${summary.internationalDays} วัน`,
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["ประเภท", "จำนวนครั้ง", "จำนวนวัน"]],
    body: categoryData,
    theme: "striped",
    headStyles: {
      fillColor: [99, 102, 241],
      font: "Sarabun",
      fontStyle: "bold",
    },
    styles: { font: "Sarabun", fontSize: 10 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Highlights
  if (summary.mostPopularDay || summary.mostActiveUser) {
    doc.setFont("Sarabun", "bold");
    doc.setFontSize(14);
    doc.text("ไฮไลท์", 14, yPos);
    yPos += 10;

    const highlights: string[][] = [];
    if (summary.mostPopularDay) {
      highlights.push([
        "วันยอดนิยม",
        summary.mostPopularDay.dateDisplay,
        `${summary.mostPopularDay.bookingCount} การจอง`,
      ]);
    }
    if (summary.mostActiveUser) {
      highlights.push([
        "ผู้ใช้ที่ลาบ่อยที่สุด",
        summary.mostActiveUser.userName,
        `${summary.mostActiveUser.totalDays} วัน`,
      ]);
    }

    autoTable(doc, {
      startY: yPos,
      head: [["ประเภท", "รายละเอียด", "จำนวน"]],
      body: highlights,
      theme: "striped",
      headStyles: {
        fillColor: [251, 191, 36],
        font: "Sarabun",
        fontStyle: "bold",
      },
      styles: { font: "Sarabun", fontSize: 10 },
    });
  }

  doc.save(`รายงานสรุปภาพรวม_${new Date().toISOString().split("T")[0]}.pdf`);
};

// สร้าง PDF สำหรับรายงานตามช่วงเวลา
export const generateTimePeriodPDF = async (
  reports: TimePeriodReport[],
  periodType: "month" | "year"
): Promise<void> => {
  const doc = new jsPDF();

  // โหลดและเพิ่มฟอนต์ Sarabun
  const fonts = await loadSarabunFont();
  addSarabunFonts(doc, fonts);

  doc.setFont("Sarabun", "bold");
  doc.setFontSize(20);
  doc.text(
    `รายงานตามช่วงเวลา (${periodType === "month" ? "รายเดือน" : "รายปี"})`,
    14,
    20
  );

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(12);
  doc.text(
    `วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}`,
    14,
    30
  );

  const tableData = reports.map((report) => {
    const periodLabel =
      periodType === "month"
        ? report.period.replace(/(\d{4})-(\d{2})/, (_, year, month) => {
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
          })
        : `ปี ${parseInt(report.period) + 543}`;

    return [
      periodLabel,
      `${report.totalBookings}`,
      `${report.totalDays}`,
      `${report.domesticBookings} (${report.domesticDays} วัน)`,
      `${report.internationalBookings} (${report.internationalDays} วัน)`,
    ];
  });

  autoTable(doc, {
    startY: 45,
    head: [["ช่วงเวลา", "การจอง", "วันลา", "ในประเทศ", "นอกประเทศ"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [34, 197, 94],
      font: "Sarabun",
      fontStyle: "bold",
    },
    styles: { font: "Sarabun", fontSize: 9 },
  });

  doc.save(
    `รายงานตามช่วงเวลา_${periodType}_${
      new Date().toISOString().split("T")[0]
    }.pdf`
  );
};

// สร้าง PDF สำหรับรายงานตามประเภท
export const generateCategoryPDF = async (
  reports: CategoryReport[]
): Promise<void> => {
  const doc = new jsPDF();

  // โหลดและเพิ่มฟอนต์ Sarabun
  const fonts = await loadSarabunFont();
  addSarabunFonts(doc, fonts);

  doc.setFont("Sarabun", "bold");
  doc.setFontSize(20);
  doc.text("รายงานตามประเภทการลา", 14, 20);

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(12);
  doc.text(
    `วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}`,
    14,
    30
  );

  const tableData = reports.map((report) => [
    report.categoryLabel,
    `${report.totalBookings}`,
    `${report.totalDays}`,
    `${report.averageDays}`,
    `${report.uniqueUsers}`,
  ]);

  autoTable(doc, {
    startY: 45,
    head: [
      [
        "ประเภท",
        "จำนวนครั้ง",
        "วันลาทั้งหมด",
        "เฉลี่ยวัน/ครั้ง",
        "จำนวนผู้ใช้",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [99, 102, 241],
      font: "Sarabun",
      fontStyle: "bold",
    },
    styles: { font: "Sarabun", fontSize: 10 },
  });

  doc.save(`รายงานตามประเภท_${new Date().toISOString().split("T")[0]}.pdf`);
};

// สร้าง PDF สำหรับรายงานตามผู้ใช้
export const generateUserPDF = async (reports: UserReport[]): Promise<void> => {
  const doc = new jsPDF();

  // โหลดและเพิ่มฟอนต์ Sarabun
  const fonts = await loadSarabunFont();
  addSarabunFonts(doc, fonts);

  doc.setFont("Sarabun", "bold");
  doc.setFontSize(20);
  doc.text("รายงานตามผู้ใช้", 14, 20);

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(12);
  doc.text(
    `วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}`,
    14,
    30
  );

  const tableData = reports.map((report, index) => [
    index + 1,
    report.userName,
    `${report.totalBookings}`,
    `${report.totalDays}`,
    `${report.domesticBookings} (${report.domesticDays} วัน)`,
    `${report.internationalBookings} (${report.internationalDays} วัน)`,
  ]);

  autoTable(doc, {
    startY: 45,
    head: [
      [
        "ลำดับ",
        "ชื่อผู้ใช้",
        "จำนวนครั้ง",
        "วันลาทั้งหมด",
        "ในประเทศ",
        "นอกประเทศ",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [34, 197, 94],
      font: "Sarabun",
      fontStyle: "bold",
    },
    styles: { font: "Sarabun", fontSize: 9 },
  });

  doc.save(`รายงานตามผู้ใช้_${new Date().toISOString().split("T")[0]}.pdf`);
};

// สร้าง PDF สำหรับรายงานสถิติวัน
export const generateDayStatsPDF = async (
  reports: DayStatsReport[]
): Promise<void> => {
  const doc = new jsPDF();

  // โหลดและเพิ่มฟอนต์ Sarabun
  const fonts = await loadSarabunFont();
  addSarabunFonts(doc, fonts);

  doc.setFont("Sarabun", "bold");
  doc.setFontSize(20);
  doc.text("รายงานสถิติวัน (วันที่มีการลามากที่สุด)", 14, 20);

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(12);
  doc.text(
    `วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}`,
    14,
    30
  );
  doc.text(`แสดง ${reports.length} อันดับแรก`, 14, 37);

  const tableData = reports.map((report, index) => [
    index + 1,
    report.dateDisplay,
    `${report.bookingCount}`,
    report.users.join(", "),
  ]);

  autoTable(doc, {
    startY: 45,
    head: [["อันดับ", "วันที่", "จำนวนการจอง", "ผู้ใช้"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [251, 191, 36],
      font: "Sarabun",
      fontStyle: "bold",
    },
    styles: { font: "Sarabun", fontSize: 9 },
    columnStyles: {
      3: { cellWidth: 80 }, // กำหนดความกว้างคอลัมน์ผู้ใช้
    },
  });

  doc.save(`รายงานสถิติวัน_${new Date().toISOString().split("T")[0]}.pdf`);
};

// สร้าง PDF สำหรับรายงานการลาแบบรายเดือน
export const generateMonthlyLeavePDF = async (
  reports: MonthlyLeaveReport[],
  year: number,
  month: number
): Promise<void> => {
  const doc = new jsPDF();

  // โหลดและเพิ่มฟอนต์ Sarabun
  const fonts = await loadSarabunFont();
  addSarabunFonts(doc, fonts);

  const monthNames = [
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

  doc.setFont("Sarabun", "bold");
  doc.setFontSize(20);
  doc.text(`รายงานการลาเดือน${monthNames[month]} ${year + 543}`, 14, 20);

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(12);
  doc.text(
    `วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}`,
    14,
    30
  );

  if (reports.length === 0) {
    doc.setFont("Sarabun", "normal");
    doc.setFontSize(12);
    doc.text("ไม่มีข้อมูลการลาในเดือนนี้", 14, 45);
    doc.save(
      `รายงานการลา_${monthNames[month]}_${year + 543}_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
    return;
  }

  // สร้างข้อมูลตาราง
  const tableData = reports.map((report) => [
    report.userName,
    report.categoryLabel,
    report.startDateDisplay,
    report.endDateDisplay || "-",
    report.daysCount.toString(),
    report.reason || "-",
    report.createdAtDisplay,
  ]);

  autoTable(doc, {
    startY: 45,
    head: [
      [
        "ชื่อ",
        "ประเภทการลา",
        "วันที่เริ่ม",
        "วันที่สิ้นสุด",
        "จำนวนวัน",
        "เหตุผล",
        "วันที่สร้าง",
      ],
    ],
    body: tableData,
    theme: "striped",
    tableWidth: "wrap",
    styles: {
      font: "Sarabun",
      fontSize: 6,
      cellPadding: { top: 1, right: 2, bottom: 1, left: 2 },
    },
    columnStyles: {
      0: { cellWidth: 30, fontSize: 6 }, // ชื่อ
      1: { cellWidth: 28, fontSize: 6 }, // ประเภทการลา
      2: { cellWidth: 20, fontSize: 6 }, // วันที่เริ่ม
      3: { cellWidth: 20, fontSize: 6 }, // วันที่สิ้นสุด
      4: { cellWidth: 10, halign: "center", fontSize: 6 }, // จำนวนวัน
      5: { cellWidth: 60, fontSize: 6 }, // เหตุผล
      6: { cellWidth: 20, fontSize: 6 }, // วันที่สร้าง
    },
    headStyles: {
      fillColor: [37, 99, 235], // Blue color
      font: "Sarabun",
      fontStyle: "bold",
      textColor: [255, 255, 255],
      fontSize: 7, // Header ใหญ่กว่าข้อมูลเล็กน้อย
      cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
    },
    margin: { top: 45, left: 10, right: 10 },
    didParseCell: function (data: any) {
      // Wrap text สำหรับ cell ที่มีเนื้อหายาว
      if (data.cell.text && data.cell.text.length > 15) {
        data.cell.styles.cellPadding = {
          top: 1,
          right: 1,
          bottom: 1,
          left: 1,
        };
      }
    },
  });

  // เพิ่มหมายเลขหน้า
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("Sarabun", "normal");
    doc.setFontSize(10);
    doc.text(
      `หน้า ${i}/${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(
    `รายงานการลา_${monthNames[month]}_${year + 543}_${
      new Date().toISOString().split("T")[0]
    }.pdf`
  );
};
