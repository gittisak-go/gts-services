"use client";

import { useEffect, useState } from "react";
import { useLiff } from "@/hooks/useLiff";
import {
  getProfile,
  login,
  logout,
  sendMessages,
  closeWindow,
} from "@/lib/liff";
import Navigation from "@/components/Navigation";
import Image from "next/image";

interface Profile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export default function Home() {
  const { liff, loading, error, isLoggedIn, isInClient } = useLiff();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (liff && isLoggedIn) {
        const userProfile = await getProfile();
        if (userProfile) {
          setProfile(userProfile);
        }
      }
    };

    fetchProfile();
  }, [liff, isLoggedIn]);

  const handleLogin = () => {
    login();
  };

  const handleLogout = async () => {
    logout();
    setProfile(null);
    // รอให้ logout เสร็จแล้วค่อย refresh
    await new Promise((resolve) => setTimeout(resolve, 200));
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen p-2 flex justify-center items-start bg-gray-50">
        <div className="bg-white rounded-lg p-4 shadow-sm max-w-full w-full">
          <h1 className="text-base font-semibold text-orange-700 text-center">
            กำลังโหลด LIFF...
          </h1>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen p-2 flex justify-center items-start bg-gray-50">
      <div className="bg-white rounded-lg p-3 shadow-sm max-w-full w-full">
        <Navigation />

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
            className="w-full bg-green-700 hover:bg-green-800 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-lg ring-2 ring-green-800 active:scale-95"
            onClick={handleLogin}
            style={{
              color: "#ffffff",
              textShadow: "0 1px 3px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.8)",
              WebkitTextStroke: "0.3px rgba(0,0,0,0.2)",
            }}
          >
            เข้าสู่ระบบด้วย LINE
          </button>
        ) : (
          <>
            {/* Profile - Aesthetic-Usability Effect */}
            {profile && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
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
                    {profile.displayName}
                  </h2>
                  <p className="text-xs text-gray-500 truncate">
                    ID: {profile.userId}
                  </p>
                  {profile.statusMessage && (
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {profile.statusMessage}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions - Fitts's Law */}
            <div className="flex gap-2 pt-3 border-t border-gray-200">
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
