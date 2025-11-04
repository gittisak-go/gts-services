"use client";

import { useState, useEffect } from "react";
import { getBookingsByMonth } from "@/lib/booking";
import {
  getBangkokDate,
  getTodayBangkok,
  getMaxBookingDate,
  isDateInBookingRange,
  formatDateString,
  toBangkokDate,
} from "@/lib/dateUtils";
import type { Booking } from "@/types/booking";

interface CalendarProps {
  currentDate?: Date;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
  endDate?: Date | null;
  userId?: string;
  refreshTrigger?: number | string; // เพิ่ม prop สำหรับ trigger reload
}

export default function Calendar({
  currentDate,
  onDateSelect,
  selectedDate,
  endDate,
  userId,
  refreshTrigger,
}: CalendarProps) {
  const today = getTodayBangkok();
  const initialDate = currentDate ? toBangkokDate(currentDate) : today;

  const [viewDate, setViewDate] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );
  const [bookings, setBookings] = useState<Booking[]>([]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const maxDate = getMaxBookingDate();

  // ตรวจสอบว่าตอนนี้อยู่ในเดือนปัจจุบันหรือไม่
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  useEffect(() => {
    const loadBookings = async () => {
      const monthBookings = await getBookingsByMonth(year, month);
      setBookings(monthBookings);
    };
    loadBookings();
  }, [year, month, refreshTrigger]); // เพิ่ม refreshTrigger ใน dependency

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const todayBangkok = getTodayBangkok();
    setViewDate(
      new Date(todayBangkok.getFullYear(), todayBangkok.getMonth(), 1)
    );
  };

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    if (isDateInBookingRange(date)) {
      onDateSelect?.(date);
    }
  };

  const getBookingsForDay = (day: number): Booking[] => {
    // Note: This function is called synchronously in renderCalendarDays
    // We'll use the bookings state that's already loaded for the month
    const date = new Date(year, month, day);
    const dateStr = formatDateString(date);

    // Filter from already loaded bookings
    return bookings.filter((b) => {
      if (b.date === dateStr) return true;
      if (b.endDate) {
        const start = new Date(b.date);
        const end = new Date(b.endDate);
        const checkDate = new Date(dateStr);
        return checkDate >= start && checkDate <= end;
      }
      return false;
    });
  };

  const isDateSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    );
  };

  const isEndDate = (day: number): boolean => {
    if (!endDate || !selectedDate) return false;
    if (endDate.getTime() === selectedDate.getTime()) return false;
    return (
      endDate.getFullYear() === year &&
      endDate.getMonth() === month &&
      endDate.getDate() === day
    );
  };

  const isDateInRange = (day: number): boolean => {
    if (!selectedDate || !endDate) return false;
    const date = new Date(year, month, day);
    return date >= selectedDate && date <= endDate;
  };

  const isToday = (day: number): boolean => {
    const todayBangkok = getTodayBangkok();
    return (
      todayBangkok.getFullYear() === year &&
      todayBangkok.getMonth() === month &&
      todayBangkok.getDate() === day
    );
  };

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(year, month, day);
    return !isDateInBookingRange(date);
  };

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

  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayBookings = getBookingsForDay(day);
      const hasBookings = dayBookings.length > 0;
      const dateSelected = isDateSelected(day);
      const dateEnd = isEndDate(day);
      const dateInRange = isDateInRange(day);
      const isTodayDate = isToday(day);
      const isDisabled = isDateDisabled(day);

      days.push(
        <div
          key={day}
          className={`aspect-square flex flex-col items-center justify-center rounded relative transition-all
            ${
              isDisabled
                ? "bg-gray-100 border border-gray-200 cursor-not-allowed opacity-40"
                : dateSelected
                ? "bg-indigo-600 text-white border-2 border-indigo-700 shadow-lg cursor-pointer font-semibold ring-2 ring-indigo-200"
                : dateEnd
                ? "bg-purple-600 text-white border-2 border-purple-700 shadow-lg cursor-pointer font-semibold ring-2 ring-purple-200"
                : dateInRange
                ? "bg-indigo-100 border border-indigo-300 cursor-pointer"
                : isTodayDate
                ? "bg-blue-100 border-2 border-blue-400 cursor-pointer"
                : hasBookings
                ? "bg-orange-50 border border-orange-200 cursor-pointer hover:bg-orange-100 hover:border-line-green"
                : "bg-gray-50 border border-transparent cursor-pointer hover:bg-gray-100 hover:border-line-green"
            }`}
          onClick={() => !isDisabled && handleDateClick(day)}
        >
          <span
            className={`text-xs ${
              dateSelected || dateEnd
                ? "font-bold text-white drop-shadow-sm"
                : dateInRange
                ? "font-medium text-indigo-700"
                : isTodayDate && !isDisabled
                ? "font-semibold text-blue-700"
                : isDisabled
                ? "text-gray-400"
                : "text-gray-700"
            }`}
          >
            {day}
          </span>
          {hasBookings && !isDisabled && (
            <div className="absolute bottom-1 flex items-center justify-center gap-0.5">
              {/* แสดงจุดตามจำนวนคนที่ลา (สูงสุด 2 คน) */}
              {dayBookings.length === 1 && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    dateSelected ? "bg-white" : "bg-orange-400"
                  }`}
                />
              )}
              {dayBookings.length >= 2 && (
                <>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      dateSelected ? "bg-white" : "bg-orange-500"
                    }`}
                  />
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      dateSelected ? "bg-white" : "bg-red-500"
                    }`}
                  />
                </>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm mb-3">
      {/* Header - Fitts's Law: ปุ่มใหญ่พอ */}
      <div className="grid grid-cols-3 items-center mb-3">
        <div className="flex justify-start">
          <button
            onClick={prevMonth}
            disabled={
              viewDate <= new Date(today.getFullYear(), today.getMonth(), 1)
            }
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold text-gray-900 hover:text-black transition-colors active:scale-95 shadow-sm"
            aria-label="เดือนก่อนหน้า"
          >
            ←
          </button>
        </div>
        <h2 className="text-base font-semibold text-gray-800 text-center">
          {monthNames[month]} {year + 543}
        </h2>
        <div className="flex items-center gap-1.5 justify-end">
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-lg font-bold transition-colors active:scale-95 shadow-md"
              aria-label="กลับเดือนปัจจุบัน"
              title="กลับเดือนปัจจุบัน"
            >
              ⟲
            </button>
          )}
          <button
            onClick={nextMonth}
            disabled={
              viewDate >= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
            }
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold text-gray-900 hover:text-black transition-colors active:scale-95 shadow-sm"
            aria-label="เดือนถัดไป"
          >
            →
          </button>
        </div>
      </div>

      {/* Today Button - Fitts's Law */}
      <button
        onClick={goToToday}
        className="w-full bg-line-green hover:bg-line-green-dark text-white py-1.5 px-3 rounded text-xs font-medium mb-2.5 transition-colors active:scale-95"
      >
        วันนี้
      </button>

      {/* Day Names - Miller's Rule: 7 items */}
      <div className="grid grid-cols-7 gap-0.5 mb-1.5">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-xs text-gray-600 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - Fitts's Law: ปุ่มใหญ่พอสำหรับมือถือ */}
      <div className="grid grid-cols-7 gap-0.5">{renderCalendarDays()}</div>

      {/* Legend - Aesthetic-Usability Effect & Gestalt Principle */}
      <div className="flex gap-3 justify-center mt-3 pt-2.5 border-t border-gray-200 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>วันนี้</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          </div>
          <span>ลา 1 คน</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </div>
          <span>ลา 2 คน</span>
        </div>
      </div>
    </div>
  );
}
