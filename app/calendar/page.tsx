"use client";

import { useState, useEffect } from "react";
import { useLiff } from "@/hooks/useLiff";
import Calendar from "@/components/Calendar";
import Navigation from "@/components/Navigation";
import {
  saveBooking,
  getBookingsByDate,
  getLeaveTypeLabel,
  getStatusLabel,
  getStatusColor,
} from "@/lib/booking";
import type { Booking, LeaveType } from "@/types/booking";
import styles from "./page.module.css";

export default function CalendarPage() {
  const { liff, loading, isLoggedIn, isInClient } = useLiff();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [formData, setFormData] = useState({
    type: "vacation" as LeaveType,
    reason: "",
  });
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (liff && isLoggedIn) {
      liff.getProfile().then((profile) => {
        setUserProfile(profile);
      });
    }
  }, [liff, isLoggedIn]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const dayBookings = getBookingsByDate(dateStr);
      setBookings(dayBookings);
    } else {
      setBookings([]);
    }
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowBookingForm(false);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !userProfile) {
      alert("กรุณาเลือกวันที่และตรวจสอบการเข้าสู่ระบบ");
      return;
    }

    if (!formData.type) {
      alert("กรุณาเลือกประเภทการลา");
      return;
    }

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const booking = saveBooking({
        date: dateStr,
        userId: userProfile.userId,
        userName: userProfile.displayName,
        type: formData.type,
        reason: formData.reason || undefined,
        status: "pending",
      });

      // Refresh bookings
      const dayBookings = getBookingsByDate(dateStr);
      setBookings(dayBookings);

      // Reset form
      setFormData({ type: "vacation", reason: "" });
      setShowBookingForm(false);

      alert("จองวันลาสำเร็จ!");
    } catch (error) {
      console.error("Failed to save booking:", error);
      alert("เกิดข้อผิดพลาดในการจองวันลา");
    }
  };

  const formatDate = (date: Date): string => {
    const days = [
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
    ];
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

    return `${days[date.getDay()]}ที่ ${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear() + 543}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>กำลังโหลด...</h1>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>กรุณาเข้าสู่ระบบ</h1>
          <p>คุณต้องเข้าสู่ระบบด้วย LINE ก่อนใช้งานระบบจองวันลา</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>ปฏิทินการจองวันลา</h1>

        <Navigation />

        <Calendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          userId={userProfile?.userId}
        />

        {selectedDate && (
          <div className={styles.selectedDateInfo}>
            <h2>วันที่เลือก: {formatDate(selectedDate)}</h2>

            {!showBookingForm ? (
              <button
                className={styles.bookButton}
                onClick={() => setShowBookingForm(true)}
              >
                จองวันลา
              </button>
            ) : (
              <form
                onSubmit={handleBookingSubmit}
                className={styles.bookingForm}
              >
                <div className={styles.formGroup}>
                  <label>ประเภทการลา</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as LeaveType,
                      })
                    }
                    className={styles.select}
                    required
                  >
                    <option value="vacation">ลาพักผ่อน</option>
                    <option value="sick">ลาป่วย</option>
                    <option value="personal">ลากิจ</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>เหตุผล (ไม่บังคับ)</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    className={styles.textarea}
                    placeholder="ระบุเหตุผล..."
                    rows={3}
                  />
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitButton}>
                    ยืนยันการจอง
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => {
                      setShowBookingForm(false);
                      setFormData({ type: "vacation", reason: "" });
                    }}
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            )}

            {bookings.length > 0 && (
              <div className={styles.bookingsList}>
                <h3>การจองในวันนี้:</h3>
                {bookings.map((booking) => (
                  <div key={booking.id} className={styles.bookingItem}>
                    <div className={styles.bookingHeader}>
                      <span className={styles.bookingUserName}>
                        {booking.userName}
                      </span>
                      <span
                        className={styles.bookingStatus}
                        style={{ color: getStatusColor(booking.status) }}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                    <div className={styles.bookingType}>
                      {getLeaveTypeLabel(booking.type)}
                    </div>
                    {booking.reason && (
                      <div className={styles.bookingReason}>
                        {booking.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!selectedDate && (
          <div className={styles.instructions}>
            <p>กรุณาเลือกวันที่ในปฏิทินเพื่อจองวันลา</p>
          </div>
        )}
      </div>
    </div>
  );
}
