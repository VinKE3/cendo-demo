"use client";

import React from "react";
import {
  Search,
  Menu,
  MapPin,
  Calendar,
  Sparkles,
  Command,
  Shield,
  Stethoscope,
} from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";

interface DashboardHeaderProps {
  onOpenSearch: () => void;
  onOpenMobileMenu: () => void;
}

export function DashboardHeader({
  onOpenSearch,
  onOpenMobileMenu,
}: DashboardHeaderProps) {
  const doctorProfile = useMedicalStore((state) => state.doctorProfile);

  const doctorInitials = doctorProfile.fullName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="h-16 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs backdrop-blur-md">
      {/* Botón Menú Móvil + Buscador Rápido Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-muted hover:text-heading hover:bg-slate-100 transition-colors"
          title="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Barra de Disparo del Buscador Global (Ctrl + K) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/60 border border-slate-200/80 hover:border-primary/30 text-xs text-muted transition-all duration-150 group shadow-2xs"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-4 h-4 text-muted group-hover:text-primary transition-colors shrink-0" />
            <span className="truncate">
              Buscar precios, vademécum o pacientes...
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white text-[10px] font-mono font-bold text-slate-600 border border-border shadow-2xs">
              Ctrl + K
            </kbd>
          </div>
        </button>
      </div>

      {/* Datos del Doctor & Consultorio Miraflores */}
      <div className="flex items-center gap-4 ml-4">
        {/* Indicador de Consultorio / Sede */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent-soft/70 border border-primary/15 text-xs text-primary font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-normal opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-status-normal" />
          </span>
          <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
          <span className="truncate">Miraflores &bull; Of. 405</span>
        </div>

        {/* Tarjeta de Sesión Activa del Doctor */}
        <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-border">
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-xs font-heading font-bold text-heading">
              {doctorProfile.fullName}
            </p>
            <p className="text-[10px] text-muted font-mono">
              CMP {doctorProfile.cmp} &bull; RNE {doctorProfile.rne}
            </p>
          </div>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-[#0E6386] text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {doctorInitials}
          </div>
        </div>
      </div>
    </header>
  );
}

