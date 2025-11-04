"use client";

import { useEffect, useState } from "react";
import { initLiff, type Liff } from "@/lib/liff";

interface UseLiffReturn {
  liff: Liff | null;
  loading: boolean;
  error: Error | null;
  isLoggedIn: boolean;
  isInClient: boolean;
}

export const useLiff = (): UseLiffReturn => {
  const [liff, setLiff] = useState<Liff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInClient, setIsInClient] = useState(false);

  const refreshLoginStatus = () => {
    if (liff) {
      setIsLoggedIn(liff.isLoggedIn());
      setIsInClient(liff.isInClient());
    }
  };

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

    if (!liffId) {
      setError(new Error("LIFF ID is not defined"));
      setLoading(false);
      return;
    }

    const initializeLiff = async () => {
      try {
        const liffInstance = await initLiff(liffId);

        if (liffInstance) {
          setLiff(liffInstance);
          setIsLoggedIn(liffInstance.isLoggedIn());
          setIsInClient(liffInstance.isInClient());
        } else {
          setError(new Error("Failed to initialize LIFF"));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    initializeLiff();
  }, []);

  // Listen for storage events (when logout happens in another tab/window)
  useEffect(() => {
    const handleStorageChange = () => {
      refreshLoginStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [liff]);

  return {
    liff,
    loading,
    error,
    isLoggedIn,
    isInClient,
  };
};
