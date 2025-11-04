"use client";

import { useState, useEffect } from "react";
import { useLiff } from "@/hooks/useLiff";
import Calendar from "@/components/Calendar";
import Navigation from "@/components/Navigation";
import BookingFooter from "@/components/BookingFooter";
import {
  saveBooking,
  updateBooking,
  deleteBooking,
  getBookingsByDate,
  getLeaveCategoryLabel,
  getMaxDays,
  validateBooking,
  validateCanEdit,
} from "@/lib/booking";
import {
  getTodayBangkok,
  getMaxBookingDate,
  formatDateString,
  formatDateThai,
  formatDateShort,
  getDaysCount,
  isDateInBookingRange,
  toBangkokDate,
} from "@/lib/dateUtils";
import type { Booking, LeaveCategory } from "@/types/booking";

export default function CalendarPage() {
  const { liff, loading, isLoggedIn, isInClient } = useLiff();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [formData, setFormData] = useState({
    category: "domestic" as LeaveCategory,
    reason: "",
  });
  const [validationError, setValidationError] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [step, setStep] = useState<
    "category" | "endDate" | "reason" | "summary"
  >("category");

  useEffect(() => {
    if (liff && isLoggedIn) {
      liff.getProfile().then((profile) => {
        setUserProfile(profile);
      });
    }
  }, [liff, isLoggedIn]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = formatDateString(selectedDate);
      const dayBookings = getBookingsByDate(dateStr);
      setBookings(dayBookings);
    } else {
      setBookings([]);
    }
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setEndDate(date);
    setShowBookingForm(true);
    setEditingBooking(null);
    setValidationError("");
    setStep("category");
    setFormData({
      category: "domestic",
      reason: "",
    });
  };

  const handleCategorySelect = (category: LeaveCategory) => {
    setFormData({ ...formData, category });
    setStep("endDate");
  };

  const handleEndDateSelect = (date: Date) => {
    setValidationError("");
    if (!isDateInBookingRange(date)) {
      setValidationError(
        "ไม่สามารถจองวันที่นี้ได้ (สามารถจองได้ล่วงหน้า 1 ปีเท่านั้น)"
      );
      return;
    }
    if (date < selectedDate!) {
      setValidationError("วันที่สิ้นสุดต้องไม่เร็วกว่าวันที่เริ่มต้น");
      return;
    }
    const daysCount = getDaysCount(selectedDate!, date);
    const maxDays = getMaxDays(formData.category);
    if (daysCount > maxDays) {
      setValidationError(
        `ลาประเภท${getLeaveCategoryLabel(
          formData.category
        )}สามารถลาสูงสุด ${maxDays} วัน (คุณลาทั้งหมด ${daysCount} วัน)`
      );
      return;
    }
    setEndDate(date);
    setStep("reason");
  };

  const handleReasonInput = (reason: string) => {
    setFormData({ ...formData, reason });
    setStep("summary");
  };

  const handleConfirmBooking = () => {
    setValidationError("");

    if (!selectedDate || !userProfile || !endDate) {
      setValidationError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const startDateStr = formatDateString(selectedDate);
    const endDateStr = formatDateString(endDate);

    // Validate
    const validation = validateBooking(
      userProfile.userId,
      startDateStr,
      endDateStr,
      formData.category,
      editingBooking?.id
    );

    if (!validation.valid) {
      setValidationError(validation.error || "ข้อมูลไม่ถูกต้อง");
      return;
    }

    try {
      if (editingBooking) {
        // Edit existing booking
        const canEdit = validateCanEdit(editingBooking.date);
        if (!canEdit.valid) {
          setValidationError(canEdit.error || "ไม่สามารถแก้ไขได้");
          return;
        }

        updateBooking(editingBooking.id, {
          date: startDateStr,
          endDate: endDateStr !== startDateStr ? endDateStr : undefined,
          category: formData.category,
          reason: formData.reason || undefined,
        });
      } else {
        // Create new booking
        saveBooking({
          date: startDateStr,
          endDate: endDateStr !== startDateStr ? endDateStr : undefined,
          userId: userProfile.userId,
          userName: userProfile.displayName,
          category: formData.category,
          reason: formData.reason || undefined,
        });
      }

      // Refresh bookings
      const dayBookings = getBookingsByDate(startDateStr);
      setBookings(dayBookings);

      // Reset form
      setFormData({ category: "domestic", reason: "" });
      setShowBookingForm(false);
      setEditingBooking(null);
      setSelectedDate(null);
      setEndDate(null);
      setValidationError("");
      setStep("category");

      alert(editingBooking ? "แก้ไขการจองสำเร็จ!" : "จองวันลาสำเร็จ!");
    } catch (error) {
      console.error("Failed to save booking:", error);
      setValidationError("เกิดข้อผิดพลาดในการจองวันลา");
    }
  };

  const handleBack = () => {
    if (step === "endDate") {
      setStep("category");
    } else if (step === "reason") {
      setStep("endDate");
    } else if (step === "summary") {
      setStep("reason");
    }
    setValidationError("");
  };

  const handleEdit = (booking: Booking) => {
    const canEdit = validateCanEdit(booking.date);
    if (!canEdit.valid) {
      alert(canEdit.error || "ไม่สามารถแก้ไขได้");
      return;
    }

    setEditingBooking(booking);
    setSelectedDate(new Date(booking.date));
    setEndDate(
      booking.endDate ? new Date(booking.endDate) : new Date(booking.date)
    );
    setFormData({
      category: booking.category,
      reason: booking.reason || "",
    });
    setShowBookingForm(true);
    setValidationError("");
  };

  const handleDelete = (booking: Booking) => {
    const canEdit = validateCanEdit(booking.date);
    if (!canEdit.valid) {
      alert(canEdit.error || "ไม่สามารถลบได้");
      return;
    }

    if (
      !confirm(
        `ต้องการลบการจองวันที่ ${formatDateShort(
          new Date(booking.date)
        )} ใช่หรือไม่?`
      )
    ) {
      return;
    }

    if (deleteBooking(booking.id)) {
      if (selectedDate) {
        const dateStr = formatDateString(selectedDate);
        const dayBookings = getBookingsByDate(dateStr);
        setBookings(dayBookings);
      }
      alert("ลบการจองสำเร็จ!");
    } else {
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-2 flex justify-center items-start">
        <div className="bg-white rounded-lg p-4 shadow-sm max-w-full w-full">
          <h1 className="text-base text-center">กำลังโหลด...</h1>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen p-2 flex justify-center items-start">
        <div className="bg-white rounded-lg p-4 shadow-sm max-w-full w-full">
          <h1 className="text-base font-semibold mb-2">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-sm text-gray-600">
            คุณต้องเข้าสู่ระบบด้วย LINE ก่อนใช้งานระบบจองวันลา
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 flex justify-center items-start bg-gray-50 pb-80">
      <div className="bg-white rounded-lg p-3 shadow-sm max-w-full w-full">
        {/* Header - Jakob's Law: ใช้รูปแบบที่คุ้นเคย */}
        <Navigation />

        {/* Calendar - Miller's Rule: จัดกลุ่มข้อมูล */}
        <Calendar
          currentDate={getTodayBangkok()}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          userId={userProfile?.userId}
        />

        {/* Selected Date Info - Progressive Disclosure */}
        {selectedDate && !showBookingForm && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              วันที่เลือก: <strong>{formatDateThai(selectedDate)}</strong>
            </p>
          </div>
        )}

        {/* Bookings List - Miller's Rule: แสดง 5-9 items */}
        {bookings.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2.5 text-gray-800">
              การจองในวันนี้:
            </h3>
            <div className="space-y-2">
              {bookings.map((booking) => {
                const isOwnBooking =
                  userProfile && booking.userId === userProfile.userId;
                const canEdit =
                  isOwnBooking && validateCanEdit(booking.date).valid;

                return (
                  <div
                    key={booking.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      isOwnBooking
                        ? "bg-green-50 border-l-green-500"
                        : "bg-gray-50 border-l-line-green"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-800">
                          {booking.userName}
                        </span>
                        {isOwnBooking && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                            คุณ
                          </span>
                        )}
                      </div>
                      <span className="bg-line-green text-white px-2 py-0.5 rounded text-xs font-medium">
                        {getLeaveCategoryLabel(booking.category)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 mb-2">
                      {booking.endDate && booking.endDate !== booking.date ? (
                        <div>
                          {formatDateShort(new Date(booking.date))} -{" "}
                          {formatDateShort(new Date(booking.endDate))}
                        </div>
                      ) : (
                        <div>{formatDateShort(new Date(booking.date))}</div>
                      )}
                    </div>

                    {booking.reason && (
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                        {booking.reason}
                      </div>
                    )}

                    {/* Fitts's Law: ปุ่มขนาดเหมาะสม */}
                    {isOwnBooking && canEdit && (
                      <div className="flex gap-2 mt-3 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => handleEdit(booking)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(booking)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          ลบ
                        </button>
                      </div>
                    )}

                    {isOwnBooking && !canEdit && (
                      <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-800">
                        ⚠️ ไม่สามารถแก้ไขการจองที่ผ่านวันไปแล้ว
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State - Aesthetic-Usability Effect */}
        {!selectedDate && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
            กรุณาเลือกวันที่ในปฏิทินเพื่อจองวันลา
          </div>
        )}
      </div>

      {/* Booking Footer - Progressive Disclosure */}
      {selectedDate && showBookingForm && endDate && (
        <BookingFooter
          selectedDate={selectedDate}
          endDate={endDate}
          category={formData.category}
          reason={formData.reason}
          step={step}
          onCategorySelect={handleCategorySelect}
          onEndDateSelect={handleEndDateSelect}
          onReasonChange={handleReasonInput}
          onConfirm={handleConfirmBooking}
          onBack={handleBack}
          onCancel={() => {
            setShowBookingForm(false);
            setEditingBooking(null);
            setSelectedDate(null);
            setEndDate(null);
            setFormData({ category: "domestic", reason: "" });
            setValidationError("");
            setStep("category");
          }}
          validationError={validationError}
        />
      )}
    </div>
  );
}
