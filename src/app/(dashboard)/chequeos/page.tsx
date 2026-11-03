"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  Activity,
  Plus,
  Search,
  Calendar,
  User,
  Edit3,
  Trash2,
  ExternalLink,
  Stethoscope,
  FileText,
  Layers,
  Pill,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";
import { ClinicalCheckup } from "@/types/medical";
import { CheckupModal } from "@/components/chequeos/CheckupModal";

export default function ChequeosPage() {
  const { clinicalCheckups, patients, deleteClinicalCheckup } = useMedicalStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCheckupId, setSelectedCheckupId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCheckup, setEditingCheckup] = useState<ClinicalCheckup | null>(null);

  // Filtrado de chequeos
  const filteredCheckups = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return clinicalCheckups;
    return clinicalCheckups.filter((chk) => {
      const patient = patients.find((p) => p.id === chk.patientId);
      const fullName = `${patient?.firstName || ""} ${patient?.lastName || ""}`.toLowerCase();
      const dni = patient?.dni || "";
      const reason = (chk.reasonForConsultation || "").toLowerCase();
      const conclusions = (chk.conclusions || "").toLowerCase();
      return fullName.includes(q) || dni.includes(q) || reason.includes(q) || conclusions.includes(q);
    });
  }, [clinicalCheckups, patients, searchTerm]);

  // Chequeo activo para vista detallada
  const activeCheckup = useMemo(() => {
    if (!clinicalCheckups.length) return null;
    if (selectedCheckupId) {
      const found = clinicalCheckups.find((c) => c.id === selectedCheckupId);
      if (found) return found;
    }
    return filteredCheckups[0] || clinicalCheckups[0] || null;
  }, [clinicalCheckups, filteredCheckups, selectedCheckupId]);

  const activePatient = useMemo(() => {
    if (!activeCheckup) return null;
    return patients.find((p) => p.id === activeCheckup.patientId) || null;
  }, [activeCheckup, patients]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingCheckup(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (checkup: ClinicalCheckup) => {
    setEditingCheckup(checkup);
    setIsModalOpen(true);
  };

  const handleDelete = (checkup: ClinicalCheckup) => {
    const patient = patients.find((p) => p.id === checkup.patientId);
    const patientName = patient ? `${patient.lastName}, ${patient.firstName}` : "la paciente";

    Swal.fire({
      title: "¿Eliminar registro de chequeo?",
      html: `<p class="text-sm">Se eliminará el informe de chequeo/ecografía del <b>${checkup.checkupDate}</b> para <b>${patientName}</b>. Esta acción no se puede deshacer.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteClinicalCheckup(checkup.id);
        if (selectedCheckupId === checkup.id) {
          setSelectedCheckupId(null);
        }
        Swal.fire({
          icon: "success",
          title: "Chequeo Eliminado",
          text: "El registro ha sido eliminado exitosamente.",
          timer: 1600,
          showConfirmButton: false,
        });
      }
    });
  };

  const getBiradsBadgeClass = (birads: string) => {
    if (birads.includes("1")) return "bg-emerald-50 text-status-normal border-emerald-200";
    if (birads.includes("2")) return "bg-teal-50 text-teal-800 border-teal-200";
    if (birads.includes("3")) return "bg-amber-50 text-status-alert border-amber-200";
    return "bg-rose-50 text-rose-800 border-rose-200";
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Activity className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-heading font-extrabold text-heading">
              Chequeo Integral Ginecológico y Ecografías
            </h1>
          </div>
          <p className="text-xs text-muted mt-1">
            Evaluación pélvica, ecografía transvaginal doppler y ecografía mamaria bilateral
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-xs shadow-xs hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Chequeo / Ecografía</span>
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
            placeholder="Buscar por paciente, DNI o motivo de consulta..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-heading placeholder:text-muted/60"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface border border-border text-muted">
            Total: <strong className="text-heading">{clinicalCheckups.length}</strong> {clinicalCheckups.length === 1 ? "evaluación" : "evaluaciones"}
          </span>
        </div>
      </div>

      {/* Estado Vacío */}
      {clinicalCheckups.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Activity className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-heading font-bold text-heading">
              No hay chequeos ni ecografías registradas
            </h3>
            <p className="text-xs text-muted">
              Inicie una nueva evaluación ginecológica para registrar ecografías mamarias, doppler transvaginal y recetas médicas con plantillas inteligentes.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Primer Chequeo</span>
          </button>
        </div>
      )}

      {/* Contenido con Lista y Vista Detallada */}
      {clinicalCheckups.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Selector / Lista de Chequeos */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted px-1">
              Historial de Chequeos ({filteredCheckups.length})
            </h2>

            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {filteredCheckups.map((chk) => {
                const patient = patients.find((p) => p.id === chk.patientId);
                const isSelected = activeCheckup?.id === chk.id;

                return (
                  <div
                    key={chk.id}
                    onClick={() => setSelectedCheckupId(chk.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                      isSelected
                        ? "bg-accent-soft/40 border-primary ring-2 ring-primary/20 shadow-xs"
                        : "bg-surface border-border hover:border-slate-300 hover:shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded-md bg-white border border-primary/20">
                        {chk.id}
                      </span>
                      <span className="text-[11px] text-muted flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {chk.checkupDate}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-heading font-bold text-heading truncate">
                        {patient ? `${patient.lastName}, ${patient.firstName}` : "Paciente no asignada"}
                      </p>
                      <p className="text-[11px] text-muted truncate">
                        Motivo: {chk.reasonForConsultation}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBiradsBadgeClass(
                          chk.breastUltrasoundBirads
                        )}`}
                      >
                        {chk.breastUltrasoundBirads.split(" ")[0]} {chk.breastUltrasoundBirads.split(" ")[1]}
                      </span>

                      <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        Endo: <strong>{chk.endometriumThicknessMm} mm</strong>
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredCheckups.length === 0 && (
                <div className="p-6 text-center rounded-xl bg-surface border border-border text-xs text-muted">
                  No se encontraron chequeos coincidentes con el filtro.
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Vista Detallada del Chequeo Activo */}
          {activeCheckup && (
            <div className="lg:col-span-8 space-y-5">
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-6">
                {/* Cabecera del Chequeo Activo */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary bg-accent-soft px-2.5 py-0.5 rounded-full border border-primary/20">
                        {activeCheckup.id}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Evaluación Ginecológica Integral
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
                      <span>Fecha: <strong className="text-heading">{activeCheckup.checkupDate}</strong></span>
                    </div>

                    <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <strong>Motivo de Consulta:</strong> {activeCheckup.reasonForConsultation}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
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
                      onClick={() => handleOpenEdit(activeCheckup)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      title="Editar Chequeo"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleDelete(activeCheckup)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                      title="Eliminar Chequeo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>

                {/* Sección 1: Ecografías */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ecografía Mamaria */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h3 className="font-bold text-heading text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-primary" />
                        Ecografía Mamaria Bilateral
                      </h3>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getBiradsBadgeClass(
                          activeCheckup.breastUltrasoundBirads
                        )}`}
                      >
                        {activeCheckup.breastUltrasoundBirads}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold uppercase text-muted tracking-wider block">
                        Hallazgos del Parénquima:
                      </span>
                      <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                        {activeCheckup.breastUltrasoundFindings}
                      </p>
                    </div>

                    <div className="pt-1 text-xs">
                      <span className="text-[10px] font-bold uppercase text-muted tracking-wider block">
                        Medición de Lesiones Focales:
                      </span>
                      <p className="text-heading font-medium mt-0.5">
                        {activeCheckup.breastLesionMeasurements}
                      </p>
                    </div>
                  </div>

                  {/* Ecografía Transvaginal Doppler */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h3 className="font-bold text-heading text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-primary" />
                        Ecografía Transvaginal Doppler
                      </h3>
                      <span className="text-xs font-mono font-bold text-primary bg-white px-2 py-0.5 rounded-md border border-primary/20">
                        Endo: {activeCheckup.endometriumThicknessMm} mm
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold uppercase text-muted tracking-wider block">
                        Hallazgos Uterinos y Doppler:
                      </span>
                      <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                        {activeCheckup.transvaginalUltrasoundFindings}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-muted block uppercase font-bold">Medidas Útero</span>
                        <strong className="text-heading text-[11px]">{activeCheckup.uterusMeasurements}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-muted block uppercase font-bold">Grosor Endometrio</span>
                        <strong className="text-heading text-[11px]">{activeCheckup.endometriumThicknessMm} mm</strong>
                      </div>
                    </div>

                    <div className="pt-1 text-xs">
                      <span className="text-[10px] font-bold uppercase text-muted tracking-wider block">
                        Evaluación de Ovarios y Anexos:
                      </span>
                      <p className="text-slate-700 mt-0.5">
                        {activeCheckup.ovariesFindings}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sección 2: Tamizaje Cervical (PAP & VPH) */}
                <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    Tamizaje Cervical Complementario
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-muted">Resultado Papanicolaou (PAP)</span>
                      <p className="text-heading font-medium">{activeCheckup.papResult}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-muted">Resultado Tipificación VPH PCR</span>
                      <p className="text-heading font-medium">{activeCheckup.vphResult}</p>
                    </div>
                  </div>
                </div>

                {/* Sección 3: Conclusiones y Prescripción Médica */}
                <div className="space-y-3 pt-1">
                  {/* Conclusiones */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 text-xs">
                    <span className="font-bold text-primary uppercase text-[10px] tracking-wider block">
                      Conclusiones Diagnósticas
                    </span>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {activeCheckup.conclusions}
                    </p>
                  </div>

                  {/* Prescripción Médica */}
                  {activeCheckup.medicalPrescription && (
                    <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-950 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-indigo-700" />
                          Plan Terapéutico y Prescripción Médica
                        </span>
                        <span className="text-[10px] font-mono text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200">
                          Dr. Patrick Jacinto Gomero
                        </span>
                      </div>
                      <p className="text-indigo-950 whitespace-pre-line leading-relaxed font-medium bg-white/70 p-3 rounded-lg border border-indigo-100">
                        {activeCheckup.medicalPrescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Crear / Editar Chequeo */}
      <CheckupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingCheckup}
        defaultPatientId={activePatient?.id}
      />
    </div>
  );
}
