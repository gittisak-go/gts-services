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
import styles from "./page.module.css";
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
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>กำลังโหลด LIFF...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>เกิดข้อผิดพลาด</h1>
          <p>{error.message}</p>
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
            กรุณาตรวจสอบ NEXT_PUBLIC_LIFF_ID ในไฟล์ .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>LINE LIFF App</h1>
        <p>ยินดีต้อนรับสู่แอปพลิเคชัน LINE LIFF</p>

        <Navigation />

        <div className={styles.info}>
          <p>
            <strong>สถานะ:</strong>{" "}
            {isLoggedIn ? "✅ เข้าสู่ระบบแล้ว" : "❌ ยังไม่ได้เข้าสู่ระบบ"}
          </p>
          <p>
            <strong>เปิดใน LINE:</strong> {isInClient ? "✅ ใช่" : "❌ ไม่ใช่"}
          </p>
        </div>

        {!isLoggedIn ? (
          <button className={styles.button} onClick={handleLogin}>
            เข้าสู่ระบบด้วย LINE
          </button>
        ) : (
          <>
            {profile && (
              <div className={styles.profile}>
                {profile.pictureUrl && (
                  <Image
                    width={100}
                    height={100}
                    src={profile.pictureUrl}
                    alt={profile.displayName}
                    className={styles.avatar}
                  />
                )}
                <div className={styles.profileInfo}>
                  <h2>{profile.displayName}</h2>
                  <p>User ID: {profile.userId}</p>
                  {profile.statusMessage && (
                    <p>Status: {profile.statusMessage}</p>
                  )}
                </div>
              </div>
            )}

            <div className={styles.section}>
              <h3>ส่งข้อความ</h3>
              <div className={styles.messageInput}>
                <input
                  type="text"
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setMessage(e.target.value)
                  }
                  placeholder="พิมพ์ข้อความ..."
                  className={styles.input}
                  disabled={!isInClient}
                />
                <button
                  className={styles.button}
                  onClick={handleSendMessage}
                  disabled={!isInClient || !message.trim()}
                >
                  ส่งข้อความ
                </button>
              </div>
              {!isInClient && (
                <p className={styles.warning}>
                  ⚠️ การส่งข้อความทำงานได้เฉพาะในแอป LINE เท่านั้น
                </p>
              )}
            </div>

            <div className={styles.section}>
              <button
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={handleLogout}
              >
                ออกจากระบบ
              </button>
              {isInClient && (
                <button
                  className={`${styles.button} ${styles.buttonSecondary}`}
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
