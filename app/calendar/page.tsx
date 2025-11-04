"use client";

import { useState, useEffect } from "react";
import { useLiff } from "@/hooks/useLiff";
import Calendar from "@/components/Calendar";
import Navigation from "@/components/Navigation";
import BookingFooter from "@/components/BookingFooter";
import Loading from "@/components/Loading";
import {
  saveBooking,
  updateBooking,
  deleteBooking,
  getBookingsByDate,
  getLeaveCategoryLabel,
  validateBooking,
  validateCanEdit,
} from "@/lib/booking";
import {
  getTodayBangkok,
  formatDateString,
  formatDateShort,
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
  const [showDateError, setShowDateError] = useState<string>("");
  const [isRegistrationMode, setIsRegistrationMode] = useState(false);

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
    // ถ้ากำลังแก้ไข: เปลี่ยนวันที่ในการแก้ไข
    if (editingBooking) {
      // ถ้ายังไม่มีวันเริ่มต้น หรือเลือกวันที่เร็วกว่า/เท่ากับวันเริ่มต้น: ตั้งเป็นวันเริ่มต้นใหม่
      if (!selectedDate || date <= selectedDate) {
        setSelectedDate(date);
        setEndDate(date);
        setShowDateError("");
      } else {
        // เลือกวันที่หลังจากวันเริ่มต้น: ตั้งเป็นวันสิ้นสุด
        setEndDate(date);
        setShowDateError("");
      }
      return;
    }

    // ถ้าไม่ได้เปิดโหมดลงทะเบียน ให้แสดงรายละเอียดการจองเท่านั้น
    if (!isRegistrationMode) {
      setSelectedDate(date);
      setEndDate(date);
      setShowBookingForm(false);
      setEditingBooking(null);
      setValidationError("");
      setShowDateError("");
      return;
    }

    // โหมดลงทะเบียน (สร้างใหม่)
    // ถ้าเลือกวันเริ่มต้นและวันสิ้นสุดไปแล้ว (showBookingForm = true) ให้รีเซ็ตและเลือกวันใหม่เป็นวันเริ่มต้น
    if (showBookingForm && selectedDate && endDate && !editingBooking) {
      setSelectedDate(date);
      setEndDate(date);
      setShowBookingForm(false);
      setValidationError("");
      setShowDateError("");
      setFormData({
        category: "domestic",
        reason: "",
      });
      return;
    }

    // ถ้ายังไม่มีวันเริ่มต้น: เลือกวันเริ่มต้น
    if (!selectedDate) {
      setSelectedDate(date);
      setEndDate(date);
      setShowBookingForm(false);
      setValidationError("");
      setShowDateError("");
    } else {
      // มีวันเริ่มต้นแล้ว: เลือกวันสิ้นสุด
      if (date < selectedDate) {
        setShowDateError("วันที่สิ้นสุดต้องไม่เร็วกว่าวันที่เริ่มต้น");
        setTimeout(() => setShowDateError(""), 3000);
        return;
      }
      setEndDate(date);
      setShowBookingForm(true);
      setValidationError("");
      setShowDateError("");
      setFormData({
        category: "domestic",
        reason: "",
      });
    }
  };

  const handleCategoryChange = (category: LeaveCategory) => {
    setFormData({ ...formData, category });
    setValidationError("");
  };

  const handleReasonChange = (reason: string) => {
    setFormData({ ...formData, reason });
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
      setIsRegistrationMode(false); // ปิดโหมดลงทะเบียนหลังจองสำเร็จ

      alert(editingBooking ? "แก้ไขการจองสำเร็จ!" : "จองวันลาสำเร็จ!");
    } catch (error) {
      console.error("Failed to save booking:", error);
      setValidationError("เกิดข้อผิดพลาดในการจองวันลา");
    }
  };

  const handleEdit = (booking: Booking) => {
    const canEdit = validateCanEdit(booking.date);
    if (!canEdit.valid) {
      alert(canEdit.error || "ไม่สามารถแก้ไขได้");
      return;
    }

    // ไม่เปิดโหมดลงทะเบียนเมื่อแก้ไข - แยกโหมดให้ชัดเจน
    setIsRegistrationMode(false);
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
    setShowDateError("");
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

        {/* Status Banner & Registration Mode Toggle */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex-1">
            {editingBooking && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-2 rounded text-xs">
                ✏️ โหมดแก้ไข - คลิกวันที่ในปฏิทินเพื่อเปลี่ยนช่วงเวลา
              </div>
            )}
            {!editingBooking && isRegistrationMode && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-2 rounded text-xs">
                ✓ คลิกวันที่เพื่อเลือกช่วงเวลาลา
              </div>
            )}
            {!editingBooking && !isRegistrationMode && (
              <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-2 rounded text-xs">
                คลิกวันที่เพื่อดูรายละเอียดการจอง
              </div>
            )}
          </div>
          {!editingBooking && (
            <button
              onClick={() => {
                if (!isRegistrationMode) {
                  // เปิดโหมดลงทะเบียน: ให้ผู้ใช้เลือกวันเริ่มเอง
                  setIsRegistrationMode(true);
                  setSelectedDate(null);
                  setEndDate(null);
                  setShowBookingForm(false);
                  setValidationError("");
                  setShowDateError("");
                  setFormData({
                    category: "domestic",
                    reason: "",
                  });
                } else {
                  // ปิดโหมดลงทะเบียน: รีเซ็ตการเลือกวันที่
                  setIsRegistrationMode(false);
                  setSelectedDate(null);
                  setEndDate(null);
                  setShowBookingForm(false);
                  setValidationError("");
                  setShowDateError("");
                }
              }}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                isRegistrationMode
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {isRegistrationMode ? "✓ ลงทะเบียน" : "ลงทะเบียน"}
            </button>
          )}
        </div>

        {/* Calendar - Miller's Rule: จัดกลุ่มข้อมูล */}
        <Calendar
          currentDate={getTodayBangkok()}
          selectedDate={selectedDate}
          endDate={endDate}
          onDateSelect={handleDateSelect}
          userId={userProfile?.userId}
        />

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
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          booking.category === "domestic"
                            ? "bg-blue-500 text-white"
                            : "bg-purple-500 text-white"
                        }`}
                      >
                        {getLeaveCategoryLabel(booking.category)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>
                          {booking.endDate &&
                          booking.endDate !== booking.date ? (
                            <>
                              {formatDateShort(new Date(booking.date))} -{" "}
                              {formatDateShort(new Date(booking.endDate))}
                            </>
                          ) : (
                            <>{formatDateShort(new Date(booking.date))}</>
                          )}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="font-medium text-gray-700">
                          ประเภท: {getLeaveCategoryLabel(booking.category)}
                        </span>
                      </div>
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
            {isRegistrationMode
              ? "คลิกวันที่เริ่มต้นในปฏิทินเพื่อเริ่มจองวันลา"
              : "คลิกวันที่ในปฏิทินเพื่อดูรายละเอียดการจอง"}
          </div>
        )}
      </div>

      {/* Booking Footer */}
      {selectedDate && showBookingForm && endDate && (
        <BookingFooter
          selectedDate={selectedDate}
          endDate={endDate}
          category={formData.category}
          reason={formData.reason}
          onCategoryChange={handleCategoryChange}
          onReasonChange={handleReasonChange}
          onConfirm={handleConfirmBooking}
          onCancel={() => {
            // ล้างค่าทั้งหมดที่ผู้ใช้เลือกไว้
            setSelectedDate(null);
            setEndDate(null);
            setShowBookingForm(false);
            setEditingBooking(null);
            setIsRegistrationMode(false);
            setFormData({ category: "domestic", reason: "" });
            setValidationError("");
            setShowDateError("");
          }}
          validationError={validationError}
          isEditing={!!editingBooking}
        />
      )}
    </div>
  );
}
