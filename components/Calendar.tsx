"use client";

import { useState, useEffect } from "react";
import { getBookingsByMonth, getBookingsByDate } from "@/lib/booking";
import type { Booking } from "@/types/booking";
import styles from "./Calendar.module.css";

interface CalendarProps {
  currentDate?: Date;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
  userId?: string;
}

export default function Calendar({
  currentDate = new Date(),
  onDateSelect,
  selectedDate,
  userId,
}: CalendarProps) {
  const [viewDate, setViewDate] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  );
  const [bookings, setBookings] = useState<Booking[]>([]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

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
    const today = new Date();
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    onDateSelect?.(date);
  };

  const getBookingsForDay = (day: number): Booking[] => {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];
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
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
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
      days.push(<div key={`empty-${i}`} className={styles.dayEmpty}></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayBookings = getBookingsForDay(day);
      const hasBookings = dayBookings.length > 0;
      const dateSelected = isDateSelected(day);
      const isTodayDate = isToday(day);

      days.push(
        <div
          key={day}
          className={`${styles.day} ${dateSelected ? styles.daySelected : ""} ${
            isTodayDate ? styles.dayToday : ""
          } ${hasBookings ? styles.dayWithBookings : ""}`}
          onClick={() => handleDateClick(day)}
        >
          <span className={styles.dayNumber}>{day}</span>
          {hasBookings && (
            <div className={styles.bookingIndicator}>
              <span className={styles.bookingDot}></span>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button onClick={prevMonth} className={styles.navButton}>
          ‹
        </button>
        <div className={styles.monthYear}>
          <h2>
            {monthNames[month]} {year + 543}
          </h2>
        </div>
        <button onClick={nextMonth} className={styles.navButton}>
          ›
        </button>
      </div>

      <button onClick={goToToday} className={styles.todayButton}>
        วันนี้
      </button>

      <div className={styles.dayNames}>
        {dayNames.map((day) => (
          <div key={day} className={styles.dayName}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.daysGrid}>{renderCalendarDays()}</div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendToday}`}></span>
          <span>วันนี้</span>
        </div>
        <div className={styles.legendItem}>
          <span
            className={`${styles.legendDot} ${styles.legendBooking}`}
          ></span>
          <span>มีการจอง</span>
        </div>
      </div>
    </div>
  );
}
