"use client";

import { useEffect, useState } from "react";
import { useLiff } from "@/hooks/useLiff";
import {
  getProfile,
  login,
  logout,
  closeWindow,
} from "@/lib/liff";
import Navigation from "@/components/Navigation";
import Loading from "@/components/Loading";
import UserRegistrationForm from "@/components/UserRegistrationForm";
import { UserFormData } from "@/types/user";
import type { User } from "@/types/user";
import Image from "next/image";

// API helper functions
const getUserByLineId = async (lineUserId: string): Promise<User | null> => {
  try {
    const response = await fetch(
      `/api/users?lineUserId=${encodeURIComponent(lineUserId)}`
    );
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to get user:", error);
    return null;
  }
};

const createUser = async (
  lineUserId: string,
  formData: UserFormData,
  lineProfile?: { displayName?: string; pictureUrl?: string }
): Promise<User | null> => {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lineUserId,
        formData,
        lineProfile,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to create user");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to create user:", error);
    return null;
  }
};

const updateUser = async (
  lineUserId: string,
  formData: Partial<UserFormData>
): Promise<User | null> => {
  try {
    const response = await fetch("/api/users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lineUserId,
        formData,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to update user");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to update user:", error);
    return null;
  }
};

interface Profile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export default function Home() {
  const { liff, loading, error, isLoggedIn, isInClient } = useLiff();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfileAndCheckUser = async () => {
      if (liff && isLoggedIn) {
        const userProfile = await getProfile();
        if (userProfile) {
          setProfile(userProfile);

          // ตรวจสอบว่าผู้ใช้มีการลงทะเบียนแล้วหรือยัง
          setCheckingUser(true);
          const existingUser = await getUserByLineId(userProfile.userId);
          setCheckingUser(false);

          if (existingUser) {
            setUser(existingUser);
          } else {
            // ยังไม่มีการลงทะเบียน
            setIsRegistering(true);
          }
        }
      }
    };

    fetchProfileAndCheckUser();
  }, [liff, isLoggedIn]);

  const handleLogin = () => {
    login();
  };

  const handleLogout = async () => {
    logout();
    setProfile(null);
    setUser(null);
    setIsRegistering(false);
    // รอให้ logout เสร็จแล้วค่อย refresh
    await new Promise((resolve) => setTimeout(resolve, 200));
    window.location.reload();
  };

  const handleRegistrationSubmit = async (formData: UserFormData) => {
    if (!profile) return;

    try {
      if (isEditing) {
        // โหมดแก้ไข: อัปเดตข้อมูลผู้ใช้
        const updatedUser = await updateUser(profile.userId, formData);
        if (updatedUser) {
          setUser(updatedUser);
          setIsEditing(false);
          alert("แก้ไขข้อมูลสำเร็จ!");
        } else {
          alert("เกิดข้อผิดพลาดในการแก้ไขข้อมูล กรุณาลองใหม่อีกครั้ง");
        }
      } else {
        // โหมดลงทะเบียน: สร้างผู้ใช้ใหม่
        const newUser = await createUser(profile.userId, formData, {
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
        });

        if (newUser) {
          setUser(newUser);
          setIsRegistering(false);
          alert("ลงทะเบียนสำเร็จ!");
        } else {
          alert("เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง");
        }
      }
    } catch (error) {
      console.error("Failed to save user:", error);
      alert(
        isEditing
          ? "เกิดข้อผิดพลาดในการแก้ไขข้อมูล กรุณาลองใหม่อีกครั้ง"
          : "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง"
      );
    }
  };

  if (loading || checkingUser) {
    return <Loading message="กำลังโหลด..." showSpinner={false} variant="top" />;
  }

  if (error) {
    return (
      <div className="min-h-screen p-2 flex justify-center items-start bg-gray-50">
        <div className="bg-white rounded-lg p-4 shadow-sm max-w-full w-full">
          <h1 className="text-base font-semibold mb-2 text-red-600">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-sm text-gray-700 mb-2">{error.message}</p>
          <p className="text-xs text-gray-500">
            กรุณาตรวจสอบ NEXT_PUBLIC_LIFF_ID ในไฟล์ .env.local
          </p>
        </div>
      </div>
    );
  }

  // แสดง tabs ทั้งหมดเมื่อ login แล้วและลงทะเบียนแล้ว
  const showAllTabs = isLoggedIn && !!user;

  return (
    <div className="min-h-screen p-2 flex justify-center items-start bg-gray-50">
      <div className="bg-white rounded-lg p-3 shadow-sm max-w-full w-full">
        <Navigation showAllTabs={showAllTabs} />

        {/* Status Info - Miller's Rule: จัดกลุ่มข้อมูล */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-xs text-gray-700 mb-1.5">
            <strong>สถานะ:</strong>{" "}
            {isLoggedIn ? (
              <span className="text-green-600">✅ เข้าสู่ระบบแล้ว</span>
            ) : (
              <span className="text-red-600">❌ ยังไม่ได้เข้าสู่ระบบ</span>
            )}
          </p>
          <p className="text-xs text-gray-700">
            <strong>เปิดใน LINE:</strong>{" "}
            {isInClient ? (
              <span className="text-green-600">✅ ใช่</span>
            ) : (
              <span className="text-red-600">❌ ไม่ใช่</span>
            )}
          </p>
        </div>

        {!isLoggedIn ? (
          /* Fitts's Law: ปุ่มใหญ่ กดง่าย */
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors shadow-md active:scale-95"
            onClick={handleLogin}
          >
            เข้าสู่ระบบด้วย LINE
          </button>
        ) : isRegistering || isEditing ? (
          /* Registration/Edit Form */
          <div>
            <UserRegistrationForm
              onSubmit={handleRegistrationSubmit}
              onCancel={() => {
                setIsEditing(false);
                setIsRegistering(false);
              }}
              isLoading={checkingUser}
              initialData={
                isEditing && user
                  ? {
                      fullName: user.fullName,
                      phone: user.phone,
                      email: user.email,
                    }
                  : undefined
              }
              isEditMode={isEditing}
            />
          </div>
        ) : (
          <>
            {/* Profile - Aesthetic-Usability Effect */}
            {profile && user && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {profile.pictureUrl && (
                    <Image
                      width={60}
                      height={60}
                      src={profile.pictureUrl}
                      alt={profile.displayName}
                      className="rounded-full"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-gray-800 truncate">
                      {user.fullName}
                    </h2>
                    <p className="text-xs text-gray-500 truncate">
                      {profile.displayName}
                    </p>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">เบอร์โทร:</span>
                    <span className="text-gray-800">{user.phone}</span>
                  </div>
                  {user.email && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">อีเมล:</span>
                      <span className="text-gray-800">{user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">LINE ID:</span>
                    <span className="text-gray-500 text-xs truncate max-w-[150px]">
                      {profile.userId}
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors shadow-sm active:scale-95"
                >
                  แก้ไขข้อมูลส่วนตัว
                </button>
              </div>
            )}

            {/* Actions - Fitts's Law */}
            <div className="flex gap-2 pt-3 border-t border-gray-200 mt-4">
              {!isInClient && (
                <button
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors shadow-sm active:scale-95"
                  onClick={handleLogout}
                >
                  ออกจากระบบ
                </button>
              )}
              {isInClient && (
                <button
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors shadow-sm active:scale-95"
                  onClick={closeWindow}
                >
                  ปิดหน้าต่าง
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
