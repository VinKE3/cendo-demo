"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  X,
  Baby,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Printer,
  Sparkles,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Users,
  Building2,
  ShieldAlert,
  Clock,
  Layers,
  Activity,
  Heart,
  Scale,
  FlaskConical,
} from "lucide-react";
import {
  PrenatalCard,
  PrenatalVisitItem,
  PrenatalBaselineData,
  Patient,
} from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import {
  calculateNaegeleFPP,
  calculateGestationalAge,
  evaluatePrenatalRisks,
} from "@/lib/prenatalCalculators";

interface PrenatalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onPrintRequested?: (card: PrenatalCard) => void;
}

const CLINIC_DOCTORS = [
  "PATRICK JOSE JACINTO GOMERO",
  "GABRIELA MENDOZA RIOS",
  "CARLOS ALBERTO MEDINA",
];

function parseObstetricFormula(formula?: string) {
  if (!formula) return { gestas: 1, abortos: 0, partosVaginales: 0, cesareas: 0, nacidosVivos: 0, viven: 0 };
  const gMatch = formula.match(/G\s*(\d+)/i);
  const pMatch = formula.match(/P\s*(\d)(\d)(\d)(\d)/i);
  const gestas = gMatch ? parseInt(gMatch[1], 10) : 1;
  let partosVaginales = 0;
  let cesareas = 0;
  let abortos = 0;
  let nacidosVivos = 0;
  let viven = 0;

  if (pMatch) {
    const termino = parseInt(pMatch[1], 10);
    const prematuro = parseInt(pMatch[2], 10);
    abortos = parseInt(pMatch[3], 10);
    nacidosVivos = parseInt(pMatch[4], 10);
    viven = nacidosVivos;
    partosVaginales = termino + prematuro;
  }
  return { gestas, abortos, partosVaginales, cesareas, nacidosVivos, viven };
}

/**
 * Componente visual que reproduce las casillas cuadradas individuales
 * del formato oficial MINSA (No. HC, DNI, Código Afiliación, etc.)
 */
function DigitGrid({
  value,
  length,
  className = "",
}: {
  value: string;
  length: number;
  className?: string;
}) {
  const cleanVal = (value || "").replace(/\s/g, "").slice(0, length);
  const chars = cleanVal.split("");
  const cells = Array.from({ length }, (_, i) => chars[i] || "");

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {cells.map((char, idx) => (
        <span
          key={idx}
          className="w-5 h-6 sm:w-6 sm:h-7 border border-slate-400 bg-white flex items-center justify-center font-mono font-bold text-xs text-slate-800 shadow-2xs rounded-xs"
        >
          {char}
        </span>
      ))}
    </div>
  );
}

export function PrenatalCardModal({
  isOpen,
  onClose,
  patient,
  onPrintRequested,
}: PrenatalCardModalProps) {
  const {
    doctorProfile,
    getPrenatalCardByPatientId,
    addPrenatalCard,
    updatePrenatalCard,
    getBackground,
    clinicalCheckups,
  } = useMedicalStore();

  const existingCard = getPrenatalCardByPatientId(patient.id);
  const todayStr = new Date().toISOString().split("T")[0];

  // Drawer de antecedentes (idéntico al de Colposcopía)
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Médico y fecha de procedimiento
  const [procedureDate, setProcedureDate] = useState(todayStr);
  const [attendingDoctor, setAttendingDoctor] = useState("PATRICK JOSE JACINTO GOMERO");
  const [clinicEstablishment, setClinicEstablishment] = useState("CENDO - Especialidades Gineco-Obstétricas Miraflores");

  // Estado de los acordeones desplegables
  const [openSections, setOpenSections] = useState({
    filiacion: true, // Sección 1 desplegada por defecto
    obstetricos: false,
    antecedentes: false,
    embarazo: false,
    laboratorio: false,
    atenciones: false,
    riesgos: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Edad editable de la gestante
  const [patientAge, setPatientAge] = useState(patient.age || 28);

  // Estado local para edición de Ficha Basal MINSA
  const [baselineData, setBaselineData] = useState<PrenatalBaselineData>({
    establishmentOrigin: "CENDO - Miraflores",
    originNoApplies: true,
    originReferral: false,
    insuranceType: patient.insuranceInfo?.toUpperCase().includes("EPS") ? "PRIVADO" : "SIS",
    insuranceCode: `CENDO-${patient.dni}`,
    insuranceAffiliationCode: `CENDO-${patient.dni}`,
    educationLevel: "Superior Univ",
    approvedEducationYears: 5,
    civilStatus: (patient.civilStatus === "Casada" || patient.civilStatus === "Conviviente" || patient.civilStatus === "Soltera" ? patient.civilStatus : "Soltera") as any,
    fatherName: "",
    fatherDni: "",
    locality: "Miraflores",
    healthSectorCode: "SEC-01",
    department: "Lima",
    province: "Lima",
    district: "Miraflores",
    patientAddress: patient.address || "Av. José Pardo 450, Miraflores",
    patientPhone: patient.phone || "987654321",
    patientEmail: patient.email || "",
    patientOccupation: patient.occupation || "Profesional / Independiente",
    gestas: 1,
    abortos: 0,
    partosVaginales: 0,
    cesareas: 0,
    nacidosVivos: 0,
    nacidosMuertos: 0,
    viven: 0,
    rnMayorPesoGramos: 0,
    familyHistory: ["Ninguno"],
    personalHistory: ["Ninguno"],
    previousVaccines: { rubella: true, hepatitisB: true, hpv: true, yellowFever: true },
    antitetanicaDosis: "2da",
    usualWeightKg: 56.5,
    heightCm: 162,
    bloodGroup: "O",
    rhFactor: "Rh (+)",
    smokerCigarettesDay: 0,
    drugsUse: false,
    alcoholUse: false,
    fum: "2026-09-26",
    fumDoubt: false,
    fpp: calculateNaegeleFPP("2026-09-26"),
    clinicalExam: "Normal",
    breastsExam: "Normal",
    cervixExam: "Normal",
    pelvisExam: "Normal",
    dentalExam: "Normal",
    hemoglobin1: 12.4,
    hemoglobin1Date: "2026-10-15",
    bloodGlucose1: 84,
    bloodGlucose1Date: "2026-10-15",
    vdrlRpr1: "No reactivo",
    vdrlRpr1Date: "2026-10-15",
    hivScreening1: "Negativo",
    hivScreening1Date: "2026-10-15",
    hepatitisBScreening: "Negativo",
    hepatitisBScreeningDate: "2026-10-15",
    completeUrineExam: "Normal",
    completeUrineExamDate: "2026-10-15",
    urineCulture: "Negativo",
    papTestResult: "Normal",
    colposcopyResult: "Normal",
  });

  const [visitsList, setVisitsList] = useState<PrenatalVisitItem[]>([]);

  // Función de sincronización inteligente de datos desde la HC
  const autoFillFromPatientAndBackground = (showToast = false) => {
    const bg = getBackground(patient.id);
    const formula = parseObstetricFormula(bg?.obstetricFormula);
    const fum = bg?.lastMenstrualPeriod || baselineData.fum || "2026-09-26";
    const fpp = calculateNaegeleFPP(fum);

    const validCivilStatus: "Soltera" | "Casada" | "Conviviente" | "Otro" =
      patient.civilStatus === "Casada" || patient.civilStatus === "Conviviente" || patient.civilStatus === "Soltera"
        ? patient.civilStatus
        : "Soltera";

    setBaselineData((prev) => ({
      ...prev,
      establishmentOrigin: prev.establishmentOrigin || "CENDO - Miraflores",
      originNoApplies: prev.originNoApplies ?? true,
      originReferral: prev.originReferral ?? false,
      insuranceType: patient.insuranceInfo?.toUpperCase().includes("EPS") ? "PRIVADO" : "SIS",
      insuranceCode: `CENDO-${patient.dni}`,
      insuranceAffiliationCode: prev.insuranceAffiliationCode || `CENDO-${patient.dni}`,
      educationLevel: prev.educationLevel || "Superior Univ",
      approvedEducationYears: prev.approvedEducationYears || 5,
      civilStatus: validCivilStatus,
      patientAddress: patient.address || prev.patientAddress || "Av. José Pardo 450, Miraflores",
      patientPhone: patient.phone || prev.patientPhone || "",
      patientEmail: patient.email || prev.patientEmail || "",
      patientOccupation: patient.occupation || prev.patientOccupation || "Profesional / Independiente",
      locality: prev.locality || "Miraflores",
      healthSectorCode: prev.healthSectorCode || "SEC-01",
      department: prev.department || "Lima",
      province: prev.province || "Lima",
      district: prev.district || "Miraflores",
      gestas: formula.gestas,
      abortos: formula.abortos,
      partosVaginales: formula.partosVaginales,
      cesareas: formula.cesareas,
      nacidosVivos: formula.nacidosVivos,
      viven: formula.viven,
      fum,
      fumDoubt: false,
      fpp,
    }));

    if (patient.age) {
      setPatientAge(patient.age);
    }

    if (showToast) {
      Swal.fire({
        icon: "success",
        title: "¡Datos Sincronizados con la HC!",
        text: "Se cargaron filiación, dirección, contacto, fórmula obstétrica y FUM desde la Historia Clínica.",
        timer: 1800,
        showConfirmButton: false,
      });
    }
  };

  // Carga inicial al abrir modal
  useEffect(() => {
    if (!isOpen) return;

    if (existingCard) {
      setBaselineData(existingCard.baseline);
      setVisitsList(existingCard.visits || []);
      if (existingCard.clinicEstablishment) setClinicEstablishment(existingCard.clinicEstablishment);
      if (existingCard.attendingDoctorName) {
        const found = CLINIC_DOCTORS.find((d) => existingCard.attendingDoctorName?.includes(d));
        if (found) setAttendingDoctor(found);
      }
    } else {
      autoFillFromPatientAndBackground(false);
      setVisitsList([]);
    }
  }, [existingCard, patient, isOpen]);

  if (!isOpen) return null;

  // Cálculos reactivos de EG y Naegele
  const currentGestAge = calculateGestationalAge(baselineData.fum);
  const risksReport = evaluatePrenatalRisks(baselineData, patientAge, visitsList);

  // Alerta de edad MINSA: < 15 o > 35 años requiere seguimiento continuo
  const isAgeRisk = patientAge < 15 || patientAge > 35;

  // Antecedentes de la paciente para el drawer
  const patientBg = getBackground(patient.id);
  const patientCheckups = clinicalCheckups.filter((c) => c.patientId === patient.id);

  // Guardar Carnet Prenatal
  const handleSaveCard = () => {
    const payload = {
      patientId: patient.id,
      clinicEstablishment,
      attendingDoctorId: doctorProfile.id,
      attendingDoctorName: `DR. ${attendingDoctor}`,
      baseline: baselineData,
      visits: visitsList,
      maternalPathologies: existingCard?.maternalPathologies || [],
    };

    let savedCard: PrenatalCard;
    if (existingCard) {
      updatePrenatalCard(existingCard.id, payload);
      savedCard = { ...existingCard, ...payload, updatedAt: new Date().toISOString() };
    } else {
      savedCard = addPrenatalCard(payload);
    }

    Swal.fire({
      icon: "success",
      title: "Carnet Prenatal Guardado",
      text: "La ficha de control materno perinatal se actualizó exitosamente.",
      timer: 1600,
      showConfirmButton: false,
    });

    if (onPrintRequested) {
      onPrintRequested(savedCard);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* =========================================================================
            1. HEADER OFICIAL (ESTILO COLPOSCOPÍA MODAL)
            ========================================================================= */}
        <div className="p-4 sm:p-6 border-b border-border bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading font-extrabold text-heading text-base">
                  {existingCard ? "Editar Carnet de Control Prenatal (CPN)" : "+ Nuevo Carnet de Control Prenatal (CPN)"}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                  MINSA &bull; CLAP / OPS &bull; NTS N° 105
                </span>
              </div>
              <p className="text-xs text-muted">
                Paciente: <strong>{patient.lastName}, {patient.firstName}</strong> (DNI {patient.dni} &bull; HC-{patient.dni})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {/* Botón Ver Antecedentes / Historial */}
            <button
              type="button"
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="px-3 py-1.5 rounded-xl border border-border bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Consultar antecedentes gineco-obstétricos y chequeos previos de la paciente"
            >
              <BookOpen className="w-4 h-4 text-primary" />
              <span>{showHistoryDrawer ? "Ocultar Antecedentes" : "Ver Antecedentes"}</span>
            </button>

            {/* Botón Auto-completar desde HC */}
            <button
              type="button"
              onClick={() => autoFillFromPatientAndBackground(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Importar automáticamente filiación, fórmula obstétrica y FUM desde la HC"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Auto-completar desde HC</span>
            </button>

            {/* Botón Cerrar */}
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Lateral / Panel Plegable de Antecedentes (igual a Colposcopía) */}
        {showHistoryDrawer && (
          <div className="p-4 bg-teal-50/60 border-b border-teal-200/80 animate-in slide-in-from-top-2 duration-150 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-700" />
                Resumen de Historia Clínica &bull; {patient.lastName}, {patient.firstName}
              </span>
              <span className="text-[10px] font-mono text-teal-700">
                DNI: {patient.dni} &bull; {patientAge} años
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-white p-3 rounded-xl border border-teal-200/60 shadow-2xs">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">FUM / Ciclo</span>
                <strong className="text-slate-900 block mt-0.5">
                  {patientBg?.lastMenstrualPeriod || baselineData.fum || "Sin registro"}
                </strong>
                <span className="text-[10px] text-teal-700 block font-semibold">
                  FPP: {baselineData.fpp}
                </span>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Paridad (G P)</span>
                <strong className="text-slate-900 block mt-0.5">
                  {patientBg?.obstetricFormula || `G${baselineData.gestas} P${baselineData.partosVaginales + baselineData.cesareas}${baselineData.abortos}${baselineData.nacidosVivos}`}
                </strong>
                <span className="text-[10px] text-slate-500 block">
                  MAC: {patientBg?.contraceptiveMethod || "Ninguno"}
                </span>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Patologías Previas</span>
                <strong className="text-amber-800 block mt-0.5 font-bold">
                  {patientBg?.hasDiabetes === "Sí" ? "Diabetes. " : ""}
                  {patientBg?.hasHypertension === "Sí" ? "HTA. " : ""}
                  {patientBg?.hasAsthma === "Sí" ? "Asma. " : ""}
                  {!patientBg?.hasDiabetes && !patientBg?.hasHypertension && !patientBg?.hasAsthma ? "Sin patologías crónicas" : ""}
                </strong>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Alergias</span>
                <strong className="text-indigo-800 block mt-0.5 font-bold">
                  {patientBg?.medicalAllergies || "Niega alergias"}
                </strong>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Último Chequeo</span>
                <strong className="text-slate-900 block mt-0.5">
                  {patientCheckups[0]?.checkupDate || "Sin chequeos previos"}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            2. FORMULARIO ACORDEÓN CON SCROLL
            ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Fila Inicial: Datos de la Paciente, Procedimiento & Médico */}
          <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Paciente */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                  Paciente Evaluada <span className="text-status-alert">*</span>
                </label>
                <div className="px-3 py-2 rounded-xl border border-border bg-white text-xs font-bold text-heading flex items-center justify-between">
                  <span>{patient.lastName}, {patient.firstName}</span>
                  <span className="text-muted font-mono">DNI: {patient.dni} &bull; {patientAge} años</span>
                </div>
              </div>

              {/* Fecha de Procedimiento / Apertura */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                  Fecha de Apertura / Cita <span className="text-status-alert">*</span>
                </label>
                <input
                  type="date"
                  value={procedureDate}
                  onChange={(e) => setProcedureDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-mono font-bold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Médico Evaluador */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                  Médico Evaluador
                </label>
                <select
                  value={attendingDoctor}
                  onChange={(e) => setAttendingDoctor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {CLINIC_DOCTORS.map((doc) => (
                    <option key={doc} value={doc}>
                      DR. {doc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Widget de Cálculo Naegele & EG en tiempo real */}
            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase font-sans">FUM:</span>
                  <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{baselineData.fum}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-primary uppercase font-sans">EG Actual:</span>
                  <strong className="text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{currentGestAge.formatted}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-amber-700 uppercase font-sans">FPP Naegele:</span>
                  <strong className="text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{baselineData.fpp}</strong>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-sans font-bold">
                <span className={`px-2 py-0.5 rounded-full ${risksReport.isHighRisk ? "bg-red-100 text-red-800 border border-red-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"}`}>
                  {risksReport.riskCategory}
                </span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              ACORDEÓN 1: FILIACIÓN DE LA GESTANTE & UBIGEO (DATOS MINSA)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("filiacion")}
              className="w-full p-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  FILIACIÓN DE LA GESTANTE & UBIGEO (DATOS MINSA)
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Formato Oficial MINSA / CLAP
                </span>
              </div>
              {openSections.filiacion ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {openSections.filiacion && (
              <div className="p-4 sm:p-5 space-y-4 text-xs border-t border-border bg-white">
                
                {/* 1.1 Cabecera Oficial MINSA: Logos + No. HC (8 casillas) + Leyenda de Alerta */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-3">
                  {/* Left: Escudo y MINSA */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      <div className="w-4 h-5 flex flex-col rounded-xs overflow-hidden border border-slate-300">
                        <span className="flex-1 bg-red-600" />
                        <span className="flex-1 bg-white" />
                        <span className="flex-1 bg-red-600" />
                      </div>
                      <div className="leading-tight">
                        <span className="text-[11px] font-black text-red-700 tracking-tight block">PERÚ</span>
                        <span className="text-[9px] font-bold text-slate-700 block">Ministerio de Salud</span>
                      </div>
                    </div>

                    <div className="text-left border-l border-slate-200 pl-3">
                      <span className="text-[10px] font-black text-amber-600 tracking-wider uppercase block">
                        Red de Salud Arequipa Caylloma
                      </span>
                      <span className="text-[9px] text-slate-500 font-medium block">
                        CENDO &bull; Consultorio Gineco-Obstétrico Especializado
                      </span>
                    </div>
                  </div>

                  {/* Right: No. HC (8 Casillas) + Leyenda Oficial */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-heading">No. HC:</span>
                      <DigitGrid value={patient.dni} length={8} />
                    </div>

                    <div className="flex items-center gap-2 text-[10px] bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex items-center gap-1">
                        <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-500 inline-block" />
                        <span className="font-semibold text-slate-700">= ALERTA</span>
                      </div>
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                        <span className="w-3.5 h-3.5 rounded-xs bg-red-600 border border-red-700 inline-block" />
                        <span className="font-semibold text-slate-700">= Seguimiento continuo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1.2 Caja Principal de Filiación (Borde exterior con títulos de Nombres y Establecimiento) */}
                <div className="rounded-2xl border-2 border-slate-300 p-4 sm:p-5 space-y-4 bg-white relative">
                  
                  {/* Cabecera integrada sobre la caja */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 uppercase">Nombres y Apellidos:</span>
                      <span className="text-sm font-extrabold text-heading">
                        {patient.lastName}, {patient.firstName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 uppercase">Establecimiento:</span>
                      <input
                        type="text"
                        value={clinicEstablishment}
                        onChange={(e) => setClinicEstablishment(e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary w-64"
                      />
                    </div>
                  </div>

                  {/* Fila 1: Establ. Origen + No Aplica / Referencia + Tipo Seguro + Código Afiliación (12 casillas) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                    {/* Establ. Origen */}
                    <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Establ. Origen:</span>
                      <input
                        type="text"
                        value={baselineData.establishmentOrigin || ""}
                        onChange={(e) => setBaselineData({ ...baselineData, establishmentOrigin: e.target.value })}
                        placeholder="Centro de salud de origen..."
                        className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={baselineData.originNoApplies ?? true}
                            onChange={(e) =>
                              setBaselineData({
                                ...baselineData,
                                originNoApplies: e.target.checked,
                                originReferral: e.target.checked ? false : baselineData.originReferral,
                              })
                            }
                            className="rounded text-primary focus:ring-0"
                          />
                          <span className="text-[11px] font-semibold text-slate-700">No Aplica</span>
                        </label>

                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={baselineData.originReferral ?? false}
                            onChange={(e) =>
                              setBaselineData({
                                ...baselineData,
                                originReferral: e.target.checked,
                                originNoApplies: e.target.checked ? false : baselineData.originNoApplies,
                              })
                            }
                            className="rounded text-primary focus:ring-0"
                          />
                          <span className="text-[11px] font-semibold text-slate-700">Referencia</span>
                        </label>
                      </div>
                    </div>

                    {/* Tipo Seguro */}
                    <div className="lg:col-span-3 flex items-center gap-2 border-l-0 lg:border-l border-slate-200 lg:pl-3">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Tipo Seguro:</span>
                      <div className="flex items-center gap-2">
                        {(["SIS", "ESSALUD", "PRIVADO"] as const).map((seg) => (
                          <label key={seg} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name="insuranceTypeRadio"
                              checked={baselineData.insuranceType === seg}
                              onChange={() => setBaselineData({ ...baselineData, insuranceType: seg })}
                              className="text-primary focus:ring-0"
                            />
                            <span className="text-[11px] font-semibold text-slate-700">{seg}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Código Afiliación Seguro (12 casillas) */}
                    <div className="lg:col-span-4 flex flex-col sm:flex-row sm:items-center gap-2 border-l-0 lg:border-l border-slate-200 lg:pl-3">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Código Afiliación:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <DigitGrid value={baselineData.insuranceAffiliationCode || ""} length={12} />
                        <input
                          type="text"
                          maxLength={12}
                          value={baselineData.insuranceAffiliationCode || ""}
                          onChange={(e) =>
                            setBaselineData({ ...baselineData, insuranceAffiliationCode: e.target.value.toUpperCase() })
                          }
                          placeholder="12 car."
                          className="w-20 px-1.5 py-1 text-[11px] font-mono font-bold uppercase rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fila 2: DNI N° (8 casillas) + Ocupación + Edad + Indicador Rojo < 15 / > 35 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2 border-t border-slate-200">
                    {/* DNI N° */}
                    <div className="md:col-span-4 flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">DNI N°:</span>
                      <DigitGrid value={patient.dni} length={8} />
                    </div>

                    {/* Ocupación */}
                    <div className="md:col-span-4 flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Ocupación:</span>
                      <input
                        type="text"
                        value={baselineData.patientOccupation || ""}
                        onChange={(e) => setBaselineData({ ...baselineData, patientOccupation: e.target.value })}
                        placeholder="Ocupación de la gestante..."
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Edad + Indicador Rojo < 15 / > 35 */}
                    <div className="md:col-span-4 flex items-center justify-between sm:justify-start gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-700">Edad:</span>
                        <input
                          type="number"
                          value={patientAge}
                          onChange={(e) => setPatientAge(parseInt(e.target.value, 10) || 0)}
                          className="w-14 px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-center bg-white"
                        />
                        <span className="text-[11px] text-slate-500">años</span>
                      </div>

                      {/* Casilla Roja de Seguimiento Continuo (< 15 / > 35) */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                          isAgeRisk
                            ? "bg-red-500 text-white font-extrabold border-red-600 shadow-sm ring-2 ring-red-400/50"
                            : "bg-slate-50 text-slate-600 border-slate-300"
                        }`}
                        title={isAgeRisk ? "¡Alerta Roja MINSA! Edad de riesgo obstétrico (< 15 o > 35 años)" : "Edad dentro del rango estándar"}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-xs flex items-center justify-center font-bold text-[10px] ${
                            isAgeRisk ? "bg-white text-red-600" : "border border-red-400 bg-red-100 text-red-600"
                          }`}
                        >
                          {isAgeRisk ? "✓" : ""}
                        </span>
                        <span className="text-[11px] font-bold">&lt; 15 / &gt; 35</span>
                      </div>
                    </div>
                  </div>

                  {/* Fila 3: Dirección + Estudios (con Analfabeta en Amarillo) + Años Aprobados */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center pt-2 border-t border-slate-200">
                    {/* Dirección */}
                    <div className="lg:col-span-5 flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Dirección:</span>
                      <input
                        type="text"
                        value={baselineData.patientAddress || ""}
                        onChange={(e) => setBaselineData({ ...baselineData, patientAddress: e.target.value })}
                        placeholder="Dirección domiciliaria completa..."
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Estudios */}
                    <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Estudios:</span>
                      
                      {/* Analfabeta (Alerta Amarilla) */}
                      <label
                        className={`flex items-center gap-1 px-2 py-0.5 rounded border cursor-pointer transition-colors ${
                          baselineData.educationLevel === "Analfabeta"
                            ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                            : "bg-amber-50/70 border-amber-200 text-amber-900"
                        }`}
                        title="Casilla de ALERTA MINSA"
                      >
                        <input
                          type="radio"
                          name="educationRadio"
                          checked={baselineData.educationLevel === "Analfabeta"}
                          onChange={() => setBaselineData({ ...baselineData, educationLevel: "Analfabeta" })}
                          className="text-amber-600 focus:ring-0"
                        />
                        <span className="text-[11px]">Analfabeta [ALERTA]</span>
                      </label>

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="educationRadio"
                          checked={baselineData.educationLevel === "Primaria"}
                          onChange={() => setBaselineData({ ...baselineData, educationLevel: "Primaria" })}
                          className="text-primary focus:ring-0"
                        />
                        <span className="text-[11px] text-slate-700">Primaria</span>
                      </label>

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="educationRadio"
                          checked={baselineData.educationLevel === "Secundaria"}
                          onChange={() => setBaselineData({ ...baselineData, educationLevel: "Secundaria" })}
                          className="text-primary focus:ring-0"
                        />
                        <span className="text-[11px] text-slate-700">Secundaria</span>
                      </label>

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="educationRadio"
                          checked={baselineData.educationLevel === "Superior Univ"}
                          onChange={() => setBaselineData({ ...baselineData, educationLevel: "Superior Univ" })}
                          className="text-primary focus:ring-0"
                        />
                        <span className="text-[11px] text-slate-700">Superior</span>
                      </label>

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="educationRadio"
                          checked={baselineData.educationLevel === "Superior No Univ"}
                          onChange={() => setBaselineData({ ...baselineData, educationLevel: "Superior No Univ" })}
                          className="text-primary focus:ring-0"
                        />
                        <span className="text-[11px] text-slate-700">Superior no Univ.</span>
                      </label>

                      {/* Años aprobados */}
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-[11px] font-bold text-slate-700">Años aprobados:</span>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={baselineData.approvedEducationYears ?? 5}
                          onChange={(e) =>
                            setBaselineData({
                              ...baselineData,
                              approvedEducationYears: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className="w-12 px-1.5 py-1 text-center font-bold text-xs rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fila 4: Localidad + Cod. Sector + Estado Civil (Soltera en Amarillo) + Padre RN */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center pt-2 border-t border-slate-200">
                    {/* Localidad & Cod. Sector */}
                    <div className="lg:col-span-4 flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Localidad:</span>
                      <input
                        type="text"
                        value={baselineData.locality || ""}
                        onChange={(e) => setBaselineData({ ...baselineData, locality: e.target.value })}
                        placeholder="Localidad..."
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                      <span className="text-xs font-bold text-slate-700 shrink-0 ml-1">Cod. Sector:</span>
                      <input
                        type="text"
                        value={baselineData.healthSectorCode || ""}
                        onChange={(e) => setBaselineData({ ...baselineData, healthSectorCode: e.target.value })}
                        placeholder="SEC-01"
                        className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                      />
                    </div>

                    {/* Estado Civil (con Soltera en Amarillo) */}
                    <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Estado Civil:</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="civilStatusRadio"
                          checked={baselineData.civilStatus === "Casada"}
                          onChange={() => setBaselineData({ ...baselineData, civilStatus: "Casada" })}
                          className="text-primary focus:ring-0"
                        />
                        <span className="text-[11px] text-slate-700">Casada</span>
                      </label>

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="civilStatusRadio"
                          checked={baselineData.civilStatus === "Conviviente"}
                          onChange={() => setBaselineData({ ...baselineData, civilStatus: "Conviviente" })}
                          className="text-primary focus:ring-0"
                        />
                        <span className="text-[11px] text-slate-700">Conviviente</span>
                      </label>

                      {/* Soltera con Alerta Amarilla */}
                      <label
                        className={`flex items-center gap-1 px-2 py-0.5 rounded border cursor-pointer transition-colors ${
                          baselineData.civilStatus === "Soltera"
                            ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                            : "bg-amber-50/70 border-amber-200 text-amber-900"
                        }`}
                        title="Casilla de ALERTA MINSA"
                      >
                        <input
                          type="radio"
                          name="civilStatusRadio"
                          checked={baselineData.civilStatus === "Soltera"}
                          onChange={() => setBaselineData({ ...baselineData, civilStatus: "Soltera" })}
                          className="text-amber-600 focus:ring-0"
                        />
                        <span className="text-[11px]">Soltera [ALERTA]</span>
                      </label>

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="civilStatusRadio"
                          checked={baselineData.civilStatus === "Otro"}
                          onChange={() => setBaselineData({ ...baselineData, civilStatus: "Otro" })}
                          className="text-primary focus:ring-0"
                        />
                        <span className="text-[11px] text-slate-700">Otro</span>
                      </label>
                    </div>

                    {/* Padre RN */}
                    <div className="lg:col-span-3 flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Padre RN:</span>
                      <input
                        type="text"
                        value={baselineData.fatherName || ""}
                        onChange={(e) => setBaselineData({ ...baselineData, fatherName: e.target.value })}
                        placeholder="Nombres y Apellidos"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Fila 5: Ubigeo (Departamento, Provincia, Distrito) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Departamento:</span>
                      <input
                        type="text"
                        value={baselineData.department || ""}
                        onChange={(e) => setBaselineData({ ...baselineData, department: e.target.value })}
                        placeholder="ej. Lima"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Provincia:</span>
                      <input
                        type="text"
                        value={baselineData.province || ""}
                        onChange={(e) => setBaselineData({ ...baselineData, province: e.target.value })}
                        placeholder="ej. Lima"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Distrito:</span>
                      <input
                        type="text"
                        value={baselineData.district || ""}
                        onChange={(e) => setBaselineData({ ...baselineData, district: e.target.value })}
                        placeholder="ej. Miraflores"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Fila 6: Teléfono & Correo electrónico */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Teléfono:</span>
                      <input
                        type="text"
                        value={baselineData.patientPhone || ""}
                        onChange={(e) => setBaselineData({ ...baselineData, patientPhone: e.target.value })}
                        placeholder="ej. 987654321"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Correo electrónico:</span>
                      <input
                        type="email"
                        value={baselineData.patientEmail || ""}
                        onChange={(e) => setBaselineData({ ...baselineData, patientEmail: e.target.value })}
                        placeholder="ej. paciente@gmail.com"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 2: ANTECEDENTES OBSTÉTRICOS & GESTACIÓN ANTERIOR (EN COLA)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("obstetricos")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  ANTECEDENTES OBSTÉTRICOS & GESTACIÓN ANTERIOR
                </span>
              </div>
              {openSections.obstetricos ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {openSections.obstetricos && (
              <div className="p-5 text-center space-y-2 border-t border-border bg-slate-50/50">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <span>Próximo Desplegable a Implementar</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Diagrama Oficial Gestas, Abortos, Vaginales, Cesáreas, Nacidos Vivos/Muertos y Terminación Anterior
                </p>
                <p className="text-[11px] text-muted max-w-lg mx-auto">
                  En cuanto verifiquemos la Sección [ 1 ] de Filiación, procederemos a desplegar este bloque tal como figura en la ficha del Dr. Patrick.
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 3: ANTECEDENTES FAMILIARES, PERSONALES & VACUNAS (EN COLA)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("antecedentes")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  ANTECEDENTES FAMILIARES, PERSONALES & VACUNAS
                </span>
              </div>
              {openSections.antecedentes ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {openSections.antecedentes && (
              <div className="p-5 text-center space-y-2 border-t border-border bg-slate-50/50">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                  <span>Paso 3 en Cola</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Matriz de Antecedentes Familiares, Personales, Vacunas Previas, Antitetánica y Somatometría
                </p>
                <p className="text-[11px] text-muted max-w-lg mx-auto">
                  Incluye casillas amarillas de alerta y rojas de seguimiento continuo (Diabetes, HTA, Cirugías, etc.).
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 4: DATOS BASALES DEL EMBARAZO ACTUAL (FUM, ECOGRAFÍA, FPP)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("embarazo")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  DATOS BASALES DEL EMBARAZO ACTUAL (FUM, ECOGRAFÍA, FPP)
                </span>
              </div>
              {openSections.embarazo ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {openSections.embarazo && (
              <div className="p-5 text-center space-y-2 border-t border-border bg-slate-50/50">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                  <span>Paso 4 en Cola</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Cálculo de Regla de Naegele, Duda de FUM, Ecografía Precoz, Hospitalización y Emergencias
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 5: EXAMEN FÍSICO BASAL & EXÁMENES DE LABORATORIO
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("laboratorio")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center shrink-0">
                  5
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  EXAMEN FÍSICO BASAL & EXÁMENES DE LABORATORIO
                </span>
              </div>
              {openSections.laboratorio ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {openSections.laboratorio && (
              <div className="p-5 text-center space-y-2 border-t border-border bg-slate-50/50">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
                  <span>Paso 5 en Cola</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Examen Físico Basal (Mamas, Cuello Uterino, Pelvis) y Batería de Laboratorio (Hemoglobina, Glucosa, VDRL, VIH, PAP, etc.)
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 6: REGISTRO DE ATENCIONES PRENATALES LONGITUDINALES (9 CONSULTAS)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("atenciones")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0">
                  6
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  REGISTRO DE ATENCIONES PRENATALES LONGITUDINALES (CONSULTAS)
                </span>
              </div>
              {openSections.atenciones ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {openSections.atenciones && (
              <div className="p-5 text-center space-y-2 border-t border-border bg-slate-50/50">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200">
                  <span>Paso 6 en Cola</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Matriz Longitudinal de 9 Atenciones Prenatales MINSA (EG, Peso, PA, AU, FCF, Mov. Fetales, etc.)
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 7: EVALUACIÓN DE RIESGO OBSTÉTRICO & CONDUCTA MÉDICA
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("riesgos")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                  7
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  EVALUACIÓN DE RIESGO OBSTÉTRICO (ARO) & CONDUCTA
                </span>
              </div>
              {openSections.riesgos ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {openSections.riesgos && (
              <div className="p-5 text-center space-y-2 border-t border-border bg-slate-50/50">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                  <span>Paso 7 en Cola</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Semáforo de Riesgo Obstétrico (Bajo Riesgo / Alto Riesgo / Muy Alto Riesgo) y Criterios Activos
                </p>
              </div>
            )}
          </div>

        </div>

        {/* =========================================================================
            3. PIE DE ACCIONES (ESTILO COLPOSCOPÍA MODAL)
            ========================================================================= */}
        <div className="p-4 sm:p-5 border-t border-border bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-muted font-mono">
            Médico: <strong>DR. {attendingDoctor}</strong> &bull; CMP {doctorProfile.cmp || "61693"} &bull; RNE {doctorProfile.rne || "38657"}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveCard}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Guardar Carnet Prenatal</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
