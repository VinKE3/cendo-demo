"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  FileCheck2,
  Plus,
  Search,
  Calendar,
  User,
  Clock,
  Edit3,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Camera,
  ZoomIn,
  X,
  Printer,
} from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";
import { ColposcopyReport } from "@/types/medical";
import { CervicalClock } from "@/components/colposcopia/CervicalClock";
import { ColposcopyModal } from "@/components/colposcopia/ColposcopyModal";

export default function ColposcopiaPage() {
  const { colposcopyReports, patients, deleteColposcopyReport } = useMedicalStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ColposcopyReport | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; caption: string } | null>(null);

  // Filtrado de reportes
  const filteredReports = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return colposcopyReports;
    return colposcopyReports.filter((rep) => {
      const patient = patients.find((p) => p.id === rep.patientId);
      const fullName = `${patient?.firstName || ""} ${patient?.lastName || ""}`.toLowerCase();
      const dni = patient?.dni || "";
      const diagnosis = (rep.diagnosis || "").toLowerCase();
      const cie10 = (rep.cie10Code || "").toLowerCase();
      return fullName.includes(q) || dni.includes(q) || diagnosis.includes(q) || cie10.includes(q);
    });
  }, [colposcopyReports, patients, searchTerm]);

  // Reporte activo para vista detallada
  const activeReport = useMemo(() => {
    if (!colposcopyReports.length) return null;
    if (selectedReportId) {
      const found = colposcopyReports.find((r) => r.id === selectedReportId);
      if (found) return found;
    }
    return filteredReports[0] || colposcopyReports[0] || null;
  }, [colposcopyReports, filteredReports, selectedReportId]);

  const activePatient = useMemo(() => {
    if (!activeReport) return null;
    return patients.find((p) => p.id === activeReport.patientId) || null;
  }, [activeReport, patients]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingReport(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (report: ColposcopyReport) => {
    setEditingReport(report);
    setIsModalOpen(true);
  };

  const handleDelete = (report: ColposcopyReport) => {
    const patient = patients.find((p) => p.id === report.patientId);
    const patientName = patient ? `${patient.lastName}, ${patient.firstName}` : "la paciente";

    Swal.fire({
      title: "¿Eliminar informe colposcópico?",
      html: `<p class="text-sm">Se eliminará el informe del <b>${report.reportDate}</b> para <b>${patientName}</b>. Esta acción no se puede deshacer.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteColposcopyReport(report.id);
        if (selectedReportId === report.id) {
          setSelectedReportId(null);
        }
        Swal.fire({
          icon: "success",
          title: "Informe Eliminado",
          text: "El informe colposcópico ha sido eliminado correctamente.",
          timer: 1600,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileCheck2 className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-heading font-extrabold text-heading">
              Informes de Colposcopía Especializada
            </h1>
          </div>
          <p className="text-xs text-muted mt-1">
            Nomenclatura IFCPC Río de Janeiro &bull; Registro Fotográfico y Mapeo Biópsico por Horas
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-xs shadow-xs hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Colposcopía</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por paciente, DNI o diagnóstico..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-heading placeholder:text-muted/60"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface border border-border text-muted">
            Total: <strong className="text-heading">{colposcopyReports.length}</strong> {colposcopyReports.length === 1 ? "informe" : "informes"}
          </span>
        </div>
      </div>

      {/* Estado Vacío Si no hay reportes */}
      {colposcopyReports.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <FileCheck2 className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-heading font-bold text-heading">
              No hay informes colposcópicos registrados
            </h3>
            <p className="text-xs text-muted">
              Inicie una nueva evaluación colposcópica para mapear hallazgos de Río 2011, capturar fotografías y registrar biopsias dirigidas.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Primera Colposcopía</span>
          </button>
        </div>
      )}

      {/* Contenido con Lista y Vista Detallada */}
      {colposcopyReports.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Selector / Lista de Informes (4 columnas en LG) */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted px-1">
              Historial de Evaluaciones ({filteredReports.length})
            </h2>

            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {filteredReports.map((rep) => {
                const patient = patients.find((p) => p.id === rep.patientId);
                const isSelected = activeReport?.id === rep.id;

                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReportId(rep.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                      isSelected
                        ? "bg-accent-soft/40 border-primary ring-2 ring-primary/20 shadow-xs"
                        : "bg-surface border-border hover:border-slate-300 hover:shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded-md bg-white border border-primary/20">
                        {rep.id}
                      </span>
                      <span className="text-[11px] text-muted flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {rep.reportDate}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-heading font-bold text-heading truncate">
                        {patient ? `${patient.lastName}, ${patient.firstName}` : "Paciente no asignada"}
                      </p>
                      <p className="text-[11px] text-muted font-mono">
                        DNI: {patient?.dni || "---"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          rep.adequateColposcopy
                            ? "bg-emerald-50 text-status-normal border border-emerald-200"
                            : "bg-amber-50 text-status-alert border border-amber-200"
                        }`}
                      >
                        {rep.adequateColposcopy ? "Adecuada" : "Inadecuada"}
                      </span>

                      {rep.cervicalBiopsyTaken ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          Biopsia ({(rep.biopsyClockHours || []).length}h)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Sin biopsia
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredReports.length === 0 && (
                <div className="p-6 text-center rounded-xl bg-surface border border-border text-xs text-muted">
                  No se encontraron informes coincidentes con el filtro.
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Vista Detallada del Informe Activo (8 columnas en LG) */}
          {activeReport && (
            <div className="lg:col-span-8 space-y-5">
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-6">
                {/* Cabecera del Informe Activo */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary bg-accent-soft px-2.5 py-0.5 rounded-full border border-primary/20">
                        {activeReport.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          activeReport.adequateColposcopy
                            ? "bg-emerald-50 text-status-normal border border-emerald-200"
                            : "bg-amber-50 text-status-alert border border-amber-200"
                        }`}
                      >
                        {activeReport.adequateColposcopy ? "Colposcopía Adecuada" : "Colposcopía Inadecuada"}
                      </span>
                    </div>

                    <h2 className="text-lg font-heading font-extrabold text-heading mt-2">
                      {activePatient ? `${activePatient.lastName}, ${activePatient.firstName}` : "Paciente no asignada"}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted mt-1">
                      <span className="font-mono">DNI: <strong className="text-heading">{activePatient?.dni || "---"}</strong></span>
                      <span>&bull;</span>
                      <span>Edad: <strong className="text-heading">{activePatient?.age ?? "--"} años</strong></span>
                      <span>&bull;</span>
                      <span>Fecha: <strong className="text-heading">{activeReport.reportDate}</strong></span>
                    </div>

                    <p className="text-[11px] text-muted mt-1">
                      Médico Evaluador: <strong className="text-slate-700">{activeReport.doctorName}</strong>
                    </p>
                  </div>

                  {/* Acciones del Informe */}
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <Link
                      href="/reportes"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors shadow-2xs"
                      title="Emitir Informe en PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-primary" />
                      <span>Emitir PDF</span>
                    </Link>

                    {activePatient && (
                      <Link
                        href={`/pacientes/${activePatient.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        title="Ver Historia Clínica"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-primary" />
                        <span>Ficha Paciente</span>
                      </Link>
                    )}

                    <button
                      onClick={() => handleOpenEdit(activeReport)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      title="Editar Informe"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleDelete(activeReport)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                      title="Eliminar Informe"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>

                {/* Sección 1: Parámetros IFCPC Río de Janeiro 2011 */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    Criterios Colposcópicos IFCPC Río 2011
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">
                        Unión Escamocolumnar
                      </span>
                      <strong className="text-heading text-sm block mt-0.5">
                        {activeReport.squamocolumnarJunctionVisible}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">
                        Zona de Transformación
                      </span>
                      <strong className="text-heading text-sm block mt-0.5">
                        {activeReport.transformationZoneType}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">
                        Test de Schiller (Lugol)
                      </span>
                      <strong
                        className={`text-sm block mt-0.5 ${
                          activeReport.schillerTest?.toLowerCase().includes("positivo")
                            ? "text-status-alert font-bold"
                            : "text-emerald-700 font-bold"
                        }`}
                      >
                        {activeReport.schillerTest}
                      </strong>
                    </div>
                  </div>

                  {/* Hallazgos específicos observados */}
                  <div className="p-3.5 rounded-xl bg-white border border-border space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      Hallazgos Epiteliales y Vasculares Detallados:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeReport.matureSquamousEpithelium && (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ Epitelio escamoso maduro
                        </span>
                      )}
                      {activeReport.ectopy && (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-800 border border-indigo-200">
                          ✓ Ectopia cervical presente
                        </span>
                      )}
                      {activeReport.thinAcetowhiteEpithelium && (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200">
                          ⚠ Epitelio acetoblanco tenue (Grado 1)
                        </span>
                      )}
                      {activeReport.denseAcetowhiteEpithelium && (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200">
                          ⚠ Epitelio acetoblanco denso (Grado 2)
                        </span>
                      )}
                      {activeReport.irregularBorder && (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200">
                          ⚠ Borde irregular / geográfico
                        </span>
                      )}
                      {activeReport.fineMosaic && (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200">
                          ⚠ Mosaico fino
                        </span>
                      )}
                      {activeReport.coarseMosaic && (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200">
                          ⚠ Mosaico grueso
                        </span>
                      )}
                      {activeReport.finePunctation && (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200">
                          ⚠ Punteado fino
                        </span>
                      )}
                      {activeReport.coarsePunctation && (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200">
                          ⚠ Punteado grueso
                        </span>
                      )}
                      {activeReport.atypicalVessels && (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-100 text-rose-900 border border-rose-300 font-bold">
                          ⚠ Vasos atípicos de sospecha
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sección 2: Mapeo de Biopsia con Reloj Cervical */}
                <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      Mapeo Anatómico del Cérvix y Biopsias
                    </h3>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        activeReport.cervicalBiopsyTaken
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {activeReport.cervicalBiopsyTaken
                        ? `Biopsia Realizada (${(activeReport.biopsyClockHours || []).length} zonas)`
                        : "Sin Biopsia Cervical"}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-around gap-6">
                    {/* SVG Read-Only del Reloj Cervical */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                      <CervicalClock
                        selectedHours={activeReport.biopsyClockHours || []}
                        interactive={false}
                        size="md"
                      />
                    </div>

                    {/* Explicación de las Zonas */}
                    <div className="flex-1 space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-muted tracking-wider">
                          Ubicación Biópsica según Horario del Reloj
                        </span>
                        {activeReport.cervicalBiopsyTaken && (activeReport.biopsyClockHours || []).length > 0 ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-rose-900">
                              Pines marcados a las:{" "}
                              <span className="font-mono text-sm bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                                {activeReport.biopsyClockHours.map((h) => `${h}:00 hrs`).join(", ")}
                              </span>
                            </p>
                            <p className="text-[11px] text-muted">
                              Muestras remitidas a estudio anatomopatológico para correlación histológica con citología.
                            </p>
                          </div>
                        ) : (
                          <p className="text-slate-600 italic">
                            No se realizaron tomas de biopsia dirigida en este procedimiento colposcópico.
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-muted">
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <strong className="text-slate-700 block">Q1 / Q2:</strong>
                          Labio Anterior (9 a 3 hrs)
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <strong className="text-slate-700 block">Q3 / Q4:</strong>
                          Labio Posterior (3 a 9 hrs)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección 3: Grilla Fotográfica Colposcópica */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-primary" />
                      Registro Fotográfico Colposcópico (4 Tomas Clínicas)
                    </h3>
                    <span className="text-[11px] text-muted">
                      Haga clic en una toma para ampliar
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {activeReport.images && activeReport.images.length > 0 ? (
                      activeReport.images.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setPreviewImage(img)}
                          className="group relative rounded-xl border border-border overflow-hidden bg-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="aspect-4/3 relative bg-slate-200 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={img.caption}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <ZoomIn className="w-5 h-5 drop-shadow" />
                            </div>
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                              Toma #{idx + 1}
                            </span>
                          </div>
                          <div className="p-2 bg-white space-y-0.5">
                            <p className="text-[10px] text-heading font-medium line-clamp-2 leading-tight">
                              {img.caption}
                            </p>
                            {img.timestamp && (
                              <p className="text-[9px] text-muted font-mono">
                                Hora: {img.timestamp}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-4 p-6 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-muted">
                        No se registraron imágenes fotográficas en este informe.
                      </div>
                    )}
                  </div>
                </div>

                {/* Sección 4: Diagnóstico y Conducta */}
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 uppercase text-[10px] tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                        Diagnóstico Colposcópico Principal
                      </span>
                      {activeReport.cie10Code && (
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-amber-900 bg-amber-100/80 border border-amber-300 text-[11px]">
                          CIE-10: {activeReport.cie10Code}
                        </span>
                      )}
                    </div>
                    <p className="text-heading font-medium text-sm leading-relaxed">
                      {activeReport.diagnosis}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 text-xs">
                    <span className="font-bold text-primary uppercase text-[10px] tracking-wider block">
                      Plan Terapéutico y Conducta Recomendada
                    </span>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {activeReport.planRecommendations}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Zoom Fotográfico */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-surface rounded-2xl overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-16/10 bg-black flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage.url}
                alt={previewImage.caption}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 bg-surface border-t border-border">
              <p className="text-xs font-semibold text-heading">
                {previewImage.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crear / Editar Colposcopía */}
      <ColposcopyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingReport}
        defaultPatientId={activePatient?.id}
      />
    </div>
  );
}
