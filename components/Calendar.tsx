"use client";

import { useState, useEffect } from "react";
import { getBookingsByMonth, getBookingsByDate } from "@/lib/booking";
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
  userId?: string;
}

export default function Calendar({
  currentDate,
  onDateSelect,
  selectedDate,
  userId,
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

  useEffect(() => {
    const monthBookings = getBookingsByMonth(year, month);
    setBookings(monthBookings);
  }, [year, month]);

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
    const date = new Date(year, month, day);
    const dateStr = formatDateString(date);
    return getBookingsByDate(dateStr);
  };

  const isDateSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    );
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
                ? "bg-line-green text-white border-2 border-line-green cursor-pointer"
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
              dateSelected
                ? "font-bold text-white"
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
            <div className="absolute bottom-1">
              <span
                className={`w-1 h-1 rounded-full block ${
                  dateSelected ? "bg-white" : "bg-orange-500"
                }`}
              />
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
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={prevMonth}
          disabled={
            viewDate <= new Date(today.getFullYear(), today.getMonth(), 1)
          }
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg transition-colors active:scale-95"
          aria-label="เดือนก่อนหน้า"
        >
          ‹
        </button>
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            {monthNames[month]} {year + 543}
          </h2>
        </div>
        <button
          onClick={nextMonth}
          disabled={
            viewDate >= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
          }
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg transition-colors active:scale-95"
          aria-label="เดือนถัดไป"
        >
          ›
        </button>
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

      {/* Legend - Aesthetic-Usability Effect */}
      <div className="flex gap-3 justify-center mt-3 pt-2.5 border-t border-gray-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>วันนี้</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>มีการจอง</span>
        </div>
      </div>
    </div>
  );
}
