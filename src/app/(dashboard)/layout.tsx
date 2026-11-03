"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { CommandSearchModal } from "@/components/common/CommandSearchModal";
import { useMedicalStore } from "@/store/useMedicalStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAuthenticated = useMedicalStore((state) => state.isAuthenticated);

  // Escucha global de atajo de teclado: Ctrl + K o Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Control de autenticación y montado en cliente
  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted">Accediendo a CENDO...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main flex">
      {/* Sidebar de Navegación Lateral */}
      <DashboardSidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Contenedor Principal (con compensación de margen para el sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-68 transition-all duration-300">
        {/* Barra Superior con Buscador Global y Estado */}
        <DashboardHeader
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

        {/* Área de Contenido Dinámico de las Páginas */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </div>

      {/* Modal Global de Búsqueda Rápida (Ctrl + K) */}
      <CommandSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}

