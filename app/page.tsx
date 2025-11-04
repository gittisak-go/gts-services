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
  const [message, setMessage] = useState("");

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

  const handleLogout = () => {
    logout();
    setProfile(null);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (liff && isInClient) {
      await sendMessages([
        {
          type: "text",
          text: message,
        },
      ]);
      setMessage("");
      alert("Message sent!");
    } else {
      alert("This feature only works in LINE app");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-2 flex justify-center items-start bg-gray-50">
        <div className="bg-white rounded-lg p-4 shadow-sm max-w-full w-full">
          <h1 className="text-base text-center">กำลังโหลด LIFF...</h1>
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
        {/* Header - Aesthetic-Usability Effect */}
        <h1 className="text-line-green text-lg font-bold mb-2 text-center">
          LINE LIFF App
        </h1>
        <p className="text-sm text-gray-600 text-center mb-3">
          ยินดีต้อนรับสู่แอปพลิเคชัน LINE LIFF
        </p>

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
            className="w-full bg-line-green hover:bg-line-green-dark text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors shadow-sm active:scale-95"
            onClick={handleLogin}
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

            {/* Send Message - Hick's Law: ลดความซับซ้อน */}
            <div className="mb-4 pt-3 border-t border-gray-200">
              <h3 className="text-sm font-semibold mb-2 text-gray-800">
                ส่งข้อความ
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setMessage(e.target.value)
                  }
                  placeholder="พิมพ์ข้อความ..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-line-green focus:border-transparent"
                  disabled={!isInClient}
                />
                <button
                  className="bg-line-green hover:bg-line-green-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95"
                  onClick={handleSendMessage}
                  disabled={!isInClient || !message.trim()}
                >
                  ส่ง
                </button>
              </div>
              {!isInClient && (
                <p className="text-xs text-orange-600 mt-2">
                  ⚠️ การส่งข้อความทำงานได้เฉพาะในแอป LINE เท่านั้น
                </p>
              )}
            </div>

            {/* Actions - Fitts's Law */}
            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors shadow-sm active:scale-95"
                onClick={handleLogout}
              >
                ออกจากระบบ
              </button>
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
