"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Receipt,
  Pill,
  Download,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Stethoscope,
  ShieldCheck,
  Building,
  Sparkles,
} from "lucide-react";
import Swal from "sweetalert2";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useMedicalStore } from "@/store/useMedicalStore";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function DashboardSidebar({
  isMobileOpen,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { doctorProfile, logout } = useMedicalStore();

  const navigationItems = [
    {
      name: "Resumen / Inicio",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: "Pacientes e Historias",
      href: "/pacientes",
      icon: Users,
      badge: null,
    },
    {
      name: "Informes de Colposcopía",
      href: "/colposcopia",
      icon: FileText,
      badge: "IFCPC",
    },
    {
      name: "Chequeo Ginecológico / Eco",
      href: "/chequeos",
      icon: Activity,
      badge: null,
    },
    {
      name: "Tarifario de Exámenes",
      href: "/tarifario",
      icon: Receipt,
      badge: "S/",
    },
    {
      name: "Vademécum y Precios",
      href: "/vademecum",
      icon: Pill,
      badge: null,
    },
    {
      name: "Exportar / Base de Datos",
      href: "/reportes",
      icon: Download,
      badge: "XLSX",
    },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar Sesión?",
      text: "¿Desea salir del sistema clínico de CENDO?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0A4D68",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        logout();
        router.push("/login");
      }
    });
  };

  return (
    <>
      {/* Overlay para Móviles */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Contenedor del Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 bg-surface border-r border-border transition-all duration-300 flex flex-col justify-between shadow-xs",
          isCollapsed ? "w-20" : "w-68",
          // Control móvil
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Cabecera del Sidebar */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="overflow-hidden">
            <Link href="/dashboard" className="block focus:outline-none">
              <BrandLogo size={isCollapsed ? "sm" : "md"} showText={!isCollapsed} />
            </Link>
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-lg text-muted hover:text-heading hover:bg-slate-100 items-center justify-center transition-colors"
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Enlaces de Navegación */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
              Gestión Clínica y Administrativa
            </p>
          )}

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative",
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "text-body hover:bg-accent-soft hover:text-primary"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110",
                    isActive ? "text-white" : "text-muted group-hover:text-primary"
                  )}
                />

                {!isCollapsed && (
                  <span className="flex-1 truncate tracking-tight">{item.name}</span>
                )}

                {!isCollapsed && item.badge && (
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-muted group-hover:bg-primary/10 group-hover:text-primary"
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip flotante si está colapsado */}
                {isCollapsed && (
                  <div className="hidden group-hover:block absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-md whitespace-nowrap shadow-lg z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Tarjeta del Médico y Cierre de Sesión */}
        <div className="p-3 border-t border-border bg-slate-50/60 space-y-2">
          {!isCollapsed ? (
            <div className="p-2.5 rounded-xl bg-surface border border-border/80 shadow-2xs space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                  PJ
                </div>
                <div className="overflow-hidden leading-tight">
                  <p className="text-xs font-heading font-bold text-heading truncate">
                    {doctorProfile.fullName}
                  </p>
                  <p className="text-[10px] text-muted font-mono truncate">
                    CMP {doctorProfile.cmp} &bull; RNE {doctorProfile.rne}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 text-status-normal font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-normal animate-pulse" />
                  Sede Miraflores
                </span>
                <button
                  onClick={handleLogout}
                  className="text-muted hover:text-status-alert font-medium flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Salir
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                title={`${doctorProfile.fullName} (CMP ${doctorProfile.cmp})`}
                className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center cursor-pointer"
              >
                PJ
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-2 rounded-lg text-muted hover:text-status-alert hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

