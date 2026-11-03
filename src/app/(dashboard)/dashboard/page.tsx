"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  FileCheck2,
  Activity,
  Receipt,
  PlusCircle,
  FileText,
  Search,
  Pill,
  ArrowRight,
  ExternalLink,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  Printer,
  ChevronRight,
  Eye,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";
import { formatCurrency } from "@/lib/utils";
import { CommandSearchModal } from "@/components/common/CommandSearchModal";

export default function DashboardPage() {
  const router = useRouter();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchInitialTab, setSearchInitialTab] = useState<"all" | "tariff" | "vademecum" | "patients">("all");

  const {
    doctorProfile,
    patients,
    colposcopyReports,
    clinicalCheckups,
    tariffItems,
    vademecumItems,
  } = useMedicalStore();

  const openSearchWithTab = (tab: "all" | "tariff" | "vademecum" | "patients") => {
    setSearchInitialTab(tab);
    setSearchModalOpen(true);
  };

  const patientSeed = patients[0];
  const colpoSeed = colposcopyReports[0];
  const checkupSeed = clinicalCheckups[0];

  return (
    <div className="space-y-6">
      {/* 1. Banner de Bienvenida Institucional */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-primary via-[#0B5877] to-[#0E6386] text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs text-secondary font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              Consulta Ginecológica Especializada &bull; Miraflores
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
              Bienvenido, {doctorProfile.doctorTitle} {doctorProfile.fullName}
            </h1>
            <p className="text-sm text-slate-200 max-w-2xl leading-relaxed">
              Sistema de gestión clínica CENDO. Revise pacientes, emita informes de colposcopía IFCPC,
              consulte precios del tarifario o busque marcas en el vademécum con{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-xs">
                Ctrl + K
              </kbd>
              .
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
            <div className="bg-black/20 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">
                Consultorio Activo
              </p>
              <p className="text-xs font-mono font-bold text-white flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-status-normal animate-pulse" />
                Of. 405 &bull; Miraflores
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas de KPIs Clínicos Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pacientes */}
        <Link
          href="/pacientes"
          className="p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Pacientes Registradas
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-heading font-extrabold text-heading">
              {patients.length}
            </p>
            <p className="text-xs text-status-normal font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-status-normal" />
              100% historias al día
            </p>
          </div>
        </Link>

        {/* KPI 2: Colposcopías */}
        <Link
          href="/colposcopia"
          className="p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Colposcopías Realizadas
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-heading font-extrabold text-heading">
              {colposcopyReports.length}
            </p>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              Protocolo IFCPC con imágenes
            </p>
          </div>
        </Link>

        {/* KPI 3: Chequeos & Ecografías */}
        <Link
          href="/chequeos"
          className="p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Chequeos Ginecológicos
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-heading font-extrabold text-heading">
              {clinicalCheckups.length}
            </p>
            <p className="text-xs text-indigo-700 font-medium mt-1">
              Mama BI-RADS & Eco Transvaginal
            </p>
          </div>
        </Link>

        {/* KPI 4: Tarifario de Exámenes */}
        <div
          onClick={() => openSearchWithTab("tariff")}
          className="p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-amber-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Tarifario Activo
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-heading font-extrabold text-heading">
              {tariffItems.length} <span className="text-sm font-normal text-muted">servicios</span>
            </p>
            <p className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
              <span>Clic para consultar precios</span>
              <ArrowRight className="w-3 h-3" />
            </p>
          </div>
        </div>
      </div>

      {/* 3. Barra de Botones de Acción Rápida */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            Acciones Rápidas del Consultorio
          </p>
          <span className="text-[11px] text-muted hidden sm:inline">
            Atajos para acelerar la consulta diaria
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/colposcopia"
            className="p-3 rounded-xl bg-primary text-white hover:bg-primary-hover font-semibold text-xs flex flex-col items-center justify-center gap-2 text-center transition-all shadow-xs hover:shadow-sm"
          >
            <FileText className="w-5 h-5 text-secondary" />
            <span>Nueva Colposcopía</span>
          </Link>

          <Link
            href="/chequeos"
            className="p-3 rounded-xl bg-accent-soft hover:bg-sky-100/80 text-primary border border-primary/20 font-semibold text-xs flex flex-col items-center justify-center gap-2 text-center transition-all shadow-xs"
          >
            <Activity className="w-5 h-5 text-primary" />
            <span>Nuevo Chequeo / Eco</span>
          </Link>

          <Link
            href="/pacientes"
            className="p-3 rounded-xl bg-surface hover:bg-slate-100 text-heading border border-border font-semibold text-xs flex flex-col items-center justify-center gap-2 text-center transition-all shadow-xs"
          >
            <Users className="w-5 h-5 text-sky-600" />
            <span>Directorio Pacientes</span>
          </Link>

          <button
            type="button"
            onClick={() => openSearchWithTab("tariff")}
            className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 font-semibold text-xs flex flex-col items-center justify-center gap-2 text-center transition-all shadow-xs"
          >
            <Receipt className="w-5 h-5 text-amber-700" />
            <span>Consultar Precio (Ctrl+K)</span>
          </button>

          <button
            type="button"
            onClick={() => openSearchWithTab("vademecum")}
            className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-900 border border-indigo-200 font-semibold text-xs flex flex-col items-center justify-center gap-2 text-center transition-all shadow-xs"
          >
            <Pill className="w-5 h-5 text-indigo-700" />
            <span>Vademécum & Marcas</span>
          </button>
        </div>
      </div>

      {/* 4. Sección Principal: Últimas Atenciones Clínicas + Panel Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2/3): Historial Reciente de Atenciones */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <h3 className="text-base font-heading font-extrabold text-heading">
                  Últimas Atenciones Clínicas
                </h3>
                <p className="text-xs text-muted">
                  Pacientes evaluadas y estado de sus informes diagnósticos
                </p>
              </div>

              <Link
                href="/pacientes"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Ver todas las pacientes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Listado de Últimas Pacientes Evaluadas */}
            {patients.length > 0 ? (
              <div className="space-y-3">
                {patients.slice(0, 3).map((p) => {
                  const pColpo = colposcopyReports.find((c) => c.patientId === p.id);
                  const pCheckup = clinicalCheckups.find((c) => c.patientId === p.id);
                  const pInitials = `${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`;

                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl border border-border bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary text-white font-heading font-extrabold text-base flex items-center justify-center shadow-xs">
                            {pInitials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-heading font-bold text-heading text-sm sm:text-base">
                                {p.lastName}, {p.firstName}
                              </h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-200 text-slate-800">
                                DNI {p.dni}
                              </span>
                            </div>
                            <p className="text-xs text-muted">
                              {p.age} años • {p.phone} • Sede Miraflores
                            </p>
                          </div>
                        </div>

                        <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-status-normal flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-status-normal" />
                          {pColpo && pCheckup
                            ? "Chequeo Completo"
                            : pColpo
                            ? "Colposcopía Lista"
                            : pCheckup
                            ? "Ecografía Lista"
                            : "Historia Abierta"}
                        </span>
                      </div>

                      {/* Diagnósticos Resumidos de la Atención */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-border/80">
                        <div className="p-2.5 rounded-lg bg-white border border-border space-y-1">
                          <span className="text-[10px] font-bold uppercase text-primary tracking-wide">
                            Informe de Colposcopía IFCPC
                          </span>
                          {pColpo ? (
                            <>
                              <p className="text-heading font-medium leading-snug">
                                {pColpo.diagnosis}
                              </p>
                              <p className="text-[11px] text-muted">
                                Test Schiller: {pColpo.schillerTest} • CIE-10: {pColpo.cie10Code}
                              </p>
                            </>
                          ) : (
                            <p className="text-muted italic text-[11px]">
                              Sin colposcopía registrada para esta paciente.
                            </p>
                          )}
                        </div>

                        <div className="p-2.5 rounded-lg bg-white border border-border space-y-1">
                          <span className="text-[10px] font-bold uppercase text-indigo-700 tracking-wide">
                            Chequeo Ginecológico & Ecografías
                          </span>
                          {pCheckup ? (
                            <>
                              <p className="text-heading font-medium leading-snug">
                                {pCheckup.breastLesionMeasurements || pCheckup.breastUltrasoundFindings}
                              </p>
                              <p className="text-[11px] text-muted">
                                Mama: {pCheckup.breastUltrasoundBirads} • Útero: {pCheckup.uterusMeasurements}
                              </p>
                            </>
                          ) : (
                            <p className="text-muted italic text-[11px]">
                              Sin ecografías ni chequeo registrado.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Botones de Acción Rápida para esta Paciente */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        <Link
                          href={`/pacientes/${p.id}`}
                          className="px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-semibold text-heading hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-muted" />
                          <span>Ver Ficha Completa</span>
                        </Link>

                        <Link
                          href="/colposcopia"
                          className="px-3 py-1.5 rounded-lg bg-accent-soft text-primary hover:bg-sky-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Ver Colposcopía</span>
                        </Link>

                        <Link
                          href="/reportes"
                          className="px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-hover text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-secondary" />
                          <span>Exportar / Ver PDF</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <Users className="w-10 h-10 text-muted mx-auto" />
                <p className="text-sm font-semibold text-heading">No hay pacientes registradas</p>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Comience ingresando una paciente al directorio para abrir historias clínicas.
                </p>
                <Link
                  href="/pacientes"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-secondary" />
                  <span>Registrar Paciente</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha (1/3): Consulta Rápida de Tarifas & Vademécum */}
        <div className="space-y-4">
          {/* Widget de Tarifario Frecuente */}
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-heading font-extrabold text-heading uppercase tracking-wide">
                  Tarifas Frecuentes (S/)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => openSearchWithTab("tariff")}
                className="text-[11px] text-amber-700 font-semibold hover:underline"
              >
                Ver todos
              </button>
            </div>

            <div className="divide-y divide-border text-xs">
              {tariffItems.slice(0, 5).map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <p className="font-semibold text-heading truncate">{t.name}</p>
                    <span className="text-[10px] text-muted font-mono">{t.code}</span>
                  </div>
                  <span className="font-mono font-bold text-heading tabular-nums shrink-0 text-primary">
                    {formatCurrency(t.price)}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => openSearchWithTab("tariff")}
              className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar Procedimiento en Tarifario</span>
            </button>
          </div>

          {/* Widget de Vademécum Frecuente */}
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-heading font-extrabold text-heading uppercase tracking-wide">
                  Fármacos Ginecológicos
                </h4>
              </div>
              <button
                type="button"
                onClick={() => openSearchWithTab("vademecum")}
                className="text-[11px] text-indigo-700 font-semibold hover:underline"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {vademecumItems.slice(0, 3).map((v) => (
                <div key={v.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-heading">{v.genericName}</p>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {v.commercialBrands.length} marcas
                    </span>
                  </div>
                  <p className="text-[11px] text-muted line-clamp-1">
                    Marcas: {v.commercialBrands.map((b) => b.brandName).join(", ")}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => openSearchWithTab("vademecum")}
              className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar Marcas y Costos (Ctrl + K)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Global de Búsqueda Rápida activado por botón */}
      <CommandSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        initialTab={searchInitialTab}
      />
    </div>
  );
}

