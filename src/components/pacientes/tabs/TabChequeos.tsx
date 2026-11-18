"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  FileCheck2,
  Plus,
  Printer,
  Trash2,
  Edit2,
  Search,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  Patient,
  UltrasoundReport,
  ColposcopyReport,
  DoctorProfile,
} from "@/types/medical";

interface TabChequeosProps {
  patient: Patient;
  colpos: ColposcopyReport[];
  ultrasoundReports: UltrasoundReport[];
  doctorProfile?: DoctorProfile | null;
  onOpenNewUltrasound: () => void;
  onEditUltrasound: (echo: UltrasoundReport) => void;
  onPrintUltrasound: (echo: UltrasoundReport) => void;
  onDeleteUltrasound: (id: string) => void;
  onOpenNewColpo: () => void;
  onEditColpo: (colpo: ColposcopyReport) => void;
  onPrintColpo: (colpo: ColposcopyReport) => void;
  onDeleteColpo: (id: string) => void;
}

type ChequeoFilter = "all" | "ecografias" | "colposcopia";

interface UnifiedChequeoItem {
  id: string;
  type: "ECOGRAFIA" | "COLPOSCOPIA";
  date: string;
  title: string;
  badge: string;
  badgeColor: string;
  summary: string;
  details: string[];
  rawItem: UltrasoundReport | ColposcopyReport;
}

export function TabChequeos({
  patient,
  colpos,
  ultrasoundReports,
  doctorProfile,
  onOpenNewUltrasound,
  onEditUltrasound,
  onPrintUltrasound,
  onDeleteUltrasound,
  onOpenNewColpo,
  onEditColpo,
  onPrintColpo,
  onDeleteColpo,
}: TabChequeosProps) {
  const [activeFilter, setActiveFilter] = useState<ChequeoFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Compilar los estudios diagnósticos de la paciente (Ecografías y Colposcopías)
  const unifiedItems: UnifiedChequeoItem[] = useMemo(() => {
    const list: UnifiedChequeoItem[] = [];

    // 1. Ecografías
    ultrasoundReports.forEach((u) => {
      const details: string[] = [];
      if (u.findings.uterusDimensions) details.push(`Útero: ${u.findings.uterusDimensions}`);
      if (u.findings.endometriumThicknessMm) details.push(`Endometrio: ${u.findings.endometriumThicknessMm} mm`);
      if (u.findings.biradsCategory) details.push(`BI-RADS: ${u.findings.biradsCategory}`);
      if (u.findings.rightOvaryDimensions || u.findings.leftOvaryDimensions) details.push("Ovarios evaluados");

      let typeLabel = "Ecografía Especializada";
      if (u.ultrasoundType === "TRANSVAGINAL") typeLabel = "Ecografía Transvaginal Doppler";
      else if (u.ultrasoundType === "MAMA_BILATERAL") typeLabel = "Ecografía Mamaria Bilateral";
      else if (u.ultrasoundType === "PELVICA") typeLabel = "Ecografía Pélvica Ginecológica";
      else if (u.ultrasoundType === "OBSTETRICA_1T") typeLabel = "Ecografía Obstétrica 1er Trimestre";
      else if (u.ultrasoundType === "OBSTETRICA_2T_3T") typeLabel = "Ecografía Obstétrica Morfológica (2-3T)";
      else if (u.ultrasoundType === "DOPPLER") typeLabel = "Ecografía Doppler Color Ginecológico";

      list.push({
        id: u.id,
        type: "ECOGRAFIA",
        date: u.reportDate,
        title: typeLabel,
        badge: u.ultrasoundType.replace("_", " "),
        badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
        summary: u.conclusion || "Estudio ecográfico especializado sin hallazgos patológicos.",
        details,
        rawItem: u,
      });
    });

    // 2. Colposcopías
    colpos.forEach((c) => {
      const details: string[] = [];
      if (c.adequateColposcopy) details.push("Adecuada y satisfactoria");
      if (c.transformationZoneType) details.push(`ZT: ${c.transformationZoneType}`);
      if (c.schillerTest) details.push(`Schiller: ${c.schillerTest}`);

      list.push({
        id: c.id,
        type: "COLPOSCOPIA",
        date: c.reportDate,
        title: "Colposcopía Digital Oficial (IFCPC)",
        badge: "COLPOSCOPÍA",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        summary: c.diagnosis || "Colposcopía dentro de límites normales, sin lesiones sospechosas.",
        details,
        rawItem: c,
      });
    });

    // Ordenar de más reciente a más antiguo
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [ultrasoundReports, colpos]);

  // Filtrado reactivo
  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      if (activeFilter === "ecografias" && item.type !== "ECOGRAFIA") return false;
      if (activeFilter === "colposcopia" && item.type !== "COLPOSCOPIA") return false;

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSummary = item.summary.toLowerCase().includes(q);
        const matchDate = item.date.includes(q);
        const matchBadge = item.badge.toLowerCase().includes(q);
        return matchTitle || matchSummary || matchDate || matchBadge;
      }
      return true;
    });
  }, [unifiedItems, activeFilter, searchQuery]);

  const totalCount = unifiedItems.length;
  const ecoCount = ultrasoundReports.length;
  const colpoCount = colpos.length;

  const handleDeleteItem = (item: UnifiedChequeoItem) => {
    Swal.fire({
      title: `¿Eliminar estudio?`,
      html: `<p class="text-xs">Se eliminará el informe de <b>${item.title}</b> del <b>${item.date}</b> para la paciente <b>${patient.lastName}, ${patient.firstName}</b>. Esta acción no se puede deshacer.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        if (item.type === "ECOGRAFIA") onDeleteUltrasound(item.id);
        else onDeleteColpo(item.id);

        Swal.fire({
          icon: "success",
          title: "Estudio Eliminado",
          text: "El registro ha sido eliminado exitosamente.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header con Acciones Rápidas */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-heading font-extrabold text-heading">
                Chequeos & Evaluaciones Diagnósticas
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-100 text-teal-800 border border-teal-200">
                Total: {totalCount} {totalCount === 1 ? "estudio" : "estudios"}
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Historial de estudios diagnósticos de la paciente: Ecografías especializadas y Colposcopía digital IFCPC.
            </p>
          </div>
        </div>

        {/* Botones de Acción Inmediata: Ecografía y Colposcopía */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onOpenNewUltrasound}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Registrar ecografía transvaginal, mamaria, pélvica u obstétrica"
          >
            <Activity className="w-4 h-4 text-teal-100" />
            <span>+ Nueva Ecografía</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewColpo}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Registrar colposcopía digital IFCPC con reloj cervical"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-100" />
            <span>+ Nueva Colposcopía</span>
          </button>
        </div>
      </div>

      {/* 2. Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Pestañas de Filtro */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-white text-heading shadow-xs"
                : "text-muted hover:text-heading"
            }`}
          >
            Todos ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("ecografias")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeFilter === "ecografias"
                ? "bg-white text-teal-800 shadow-xs"
                : "text-muted hover:text-teal-700"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>Ecografías ({ecoCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("colposcopia")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeFilter === "colposcopia"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-muted hover:text-emerald-700"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Colposcopía ({colpoCount})</span>
          </button>
        </div>

        {/* Input Buscador Rápido */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar hallazgo, fecha..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-white text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* 3. Lista Unificada de Estudios */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-border space-y-3 hover:border-slate-300 hover:shadow-2xs transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <h3 className="font-heading font-extrabold text-sm text-heading">
                    {item.title}
                  </h3>
                  <span className="text-xs font-mono text-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {item.date}
                  </span>
                </div>

                {/* Acciones para el estudio */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (item.type === "ECOGRAFIA") onPrintUltrasound(item.rawItem as UltrasoundReport);
                      else onPrintColpo(item.rawItem as ColposcopyReport);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Ver informe oficial A4 e imprimir"
                  >
                    <Printer className="w-3.5 h-3.5 text-secondary" />
                    <span>Informe A4</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (item.type === "ECOGRAFIA") onEditUltrasound(item.rawItem as UltrasoundReport);
                      else onEditColpo(item.rawItem as ColposcopyReport);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Editar datos de este estudio"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Eliminar este estudio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Conclusión y Resumen */}
              <div className="space-y-1.5">
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {item.summary}
                </p>

                {item.details.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.details.map((detail, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-mono font-medium"
                      >
                        {detail}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white border border-border space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-heading font-bold text-heading">
                {searchQuery ? "No se encontraron estudios con ese criterio" : "Esta paciente no tiene estudios ecográficos ni colposcópicos registrados"}
              </h4>
              <p className="text-xs text-muted mt-1 max-w-md mx-auto">
                Registre una nueva ecografía de rutina (transvaginal, mamaria) o una colposcopía digital IFCPC.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={onOpenNewUltrasound}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nueva Ecografía</span>
              </button>
              <button
                type="button"
                onClick={onOpenNewColpo}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nueva Colposcopía</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
