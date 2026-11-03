"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMedicalStore } from "@/store/useMedicalStore";

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useMedicalStore((state) => state.isAuthenticated);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (useMedicalStore.persist.hasHydrated()) {
      setIsHydrated(true);
    } else {
      const unsub = useMedicalStore.persist.onFinishHydration(() => {
        setIsHydrated(true);
      });
      return () => unsub();
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-main">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-muted">Cargando sistema CENDO...</p>
      </div>
    </div>
  );
}

