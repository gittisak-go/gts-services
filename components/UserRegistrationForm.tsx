"use client";

import { useState } from "react";
import { UserFormData } from "@/types/user";

interface UserRegistrationFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function UserRegistrationForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: UserRegistrationFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "กรุณากรอกชื่อ-นามสกุล";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
    } else if (!/^[0-9]{9,10}$/.test(formData.phone.replace(/[-\s]/g, ""))) {
      newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9-10 หลัก)";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "กรุณากรอกอีเมลให้ถูกต้อง";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Failed to submit form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    // อนุญาตให้ใส่เฉพาะตัวเลขและเครื่องหมาย - และ space
    const cleaned = value.replace(/[^0-9-\s]/g, "");
    setFormData({ ...formData, phone: cleaned });
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          กรุณากรอกข้อมูลเพื่อลงทะเบียน
        </h2>
        <p className="text-xs text-gray-600">
          ข้อมูลนี้จะถูกใช้ในการจองวันลา กรุณากรอกให้ครบถ้วน
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ชื่อ-นามสกุล */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            ชื่อ-นามสกุล <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-line-green focus:border-transparent ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="เช่น สมชาย ใจดี"
            disabled={isSubmitting || isLoading}
          />
          {errors.fullName && (
            <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* เบอร์โทรศัพท์ */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            เบอร์โทรศัพท์ <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-line-green focus:border-transparent ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="เช่น 0812345678"
            disabled={isSubmitting || isLoading}
          />
          {errors.phone && (
            <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* อีเมล (ไม่บังคับ) */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            อีเมล <span className="text-gray-500 text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-line-green focus:border-transparent ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="เช่น example@email.com"
            disabled={isSubmitting || isLoading}
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        {/* ปุ่ม */}
        <div className="flex gap-2 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isSubmitting || isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>
      </form>
    </div>
  );
}
