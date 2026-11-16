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

/**
 * Componente visual de 2 casillas gemelas cuadradas [ ][ ]
 * para el diagrama de antecedentes obstétricos (Gestas, Partos, Cesáreas, etc.)
 */
function PairDigitBox({
  label,
  value,
  onChange,
  variant = "default",
  badge,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  variant?: "default" | "yellow" | "red";
  badge?: string;
}) {
  const formatted = String(Math.max(0, value || 0)).padStart(2, "0").slice(-2);
  const d1 = formatted[0];
  const d2 = formatted[1];

  const colorStyles = {
    default: "bg-white border-slate-400 text-slate-800",
    yellow: "bg-amber-300 border-amber-500 text-amber-950 font-black shadow-2xs",
    red: "bg-red-500 border-red-600 text-white font-black shadow-2xs ring-2 ring-red-400/50",
  }[variant];

  return (
    <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all min-w-[105px] w-full max-w-[140px]">
      <div className="flex items-center gap-0.5">
        <span className={`w-7 h-8 sm:w-8 sm:h-9 border-2 rounded-xs flex items-center justify-center font-mono font-bold text-sm ${colorStyles}`}>
          {d1}
        </span>
        <span className={`w-7 h-8 sm:w-8 sm:h-9 border-2 rounded-xs flex items-center justify-center font-mono font-bold text-sm ${colorStyles}`}>
          {d2}
        </span>
      </div>

      <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight text-center leading-tight">
        {label}
      </span>

      {badge && (
        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
            variant === "red"
              ? "bg-red-100 text-red-800"
              : variant === "yellow"
              ? "bg-amber-100 text-amber-900"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {badge}
        </span>
      )}

      {/* Controles de ajuste rápido (+ / - / input) */}
      <div className="flex items-center gap-1 pt-0.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
          title="Restar 1"
        >
          -
        </button>
        <input
          type="number"
          min={0}
          max={99}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
          className="w-9 text-center font-mono font-bold text-xs border border-slate-300 rounded bg-slate-50 py-0.5"
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
          title="Sumar 1"
        >
          +
        </button>
      </div>
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
    filiacion: false,
    obstetricos: false,
    gestacionAnterior: true, // Sección 3 desplegada por defecto para revisión inmediata
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
    rnMayorPesoGramos: 3400,
    lowWeightHistory: false,
    multipleHistory: false,
    pretermHistory: false,
    deadFirstWeek: 0,
    deadAfterFirstWeek: 0,
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
      previousDeliveryType: prev.previousDeliveryType || (formula.gestas <= 1 ? "No Aplica" : (formula.cesareas > 0 ? "Cesárea" : "Parto Vaginal")),
      previousAbortionType: prev.previousAbortionType || (formula.abortos > 0 ? "Incompleto" : "No Aplica"),
      breastfeedingMonths: prev.breastfeedingMonths || (formula.gestas <= 1 ? "No aplica" : "6 meses o más"),
      deliveryPlace: prev.deliveryPlace || (formula.gestas <= 1 ? "No aplica" : "EESS"),
      pregnancyCaptured: prev.pregnancyCaptured ?? true,
      communityAgentReferred: prev.communityAgentReferred ?? false,
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

  // Cálculos reactivos de antecedentes obstétricos
  const totalPartos = (baselineData.partosVaginales || 0) + (baselineData.cesareas || 0);
  const isParityRisk = totalPartos === 0 || totalPartos >= 4;

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
      <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
        
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
                  CENDO &bull; Control Prenatal Ambulatorio
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
              ACORDEÓN 1: FILIACIÓN DE LA GESTANTE & UBIGEO
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
                  FILIACIÓN DE LA GESTANTE & UBIGEO
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                  Filiación & Datos Sociodemográficos
                </span>
              </div>
              {openSections.filiacion ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {openSections.filiacion && (
              <div className="p-4 sm:p-6 space-y-4 text-xs border-t border-border bg-white">
                
                {/* 1.1 Cabecera CENDO: Título de Ficha + No. HC + Leyenda de Alertas */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
                  {/* Left: Clínica CENDO */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm shrink-0">
                      <FileText className="w-5 h-5 text-purple-700" />
                    </div>
                    <div>
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                        CENDO &bull; Ficha de Control Materno Perinatal (CPN)
                      </span>
                      <span className="text-[11px] text-muted block">
                        Seguimiento longitudinal ambulatorio &amp; criterios de vigilancia obstétrica
                      </span>
                    </div>
                  </div>

                  {/* Right: No. HC (8 Casillas) + Leyenda */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-heading">No. HC:</span>
                      <DigitGrid value={patient.dni} length={8} />
                    </div>

                    <div className="flex items-center gap-2 text-[10px] bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex items-center gap-1">
                        <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-500 inline-block" />
                        <span className="font-bold text-slate-700">= ALERTA</span>
                      </div>
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                        <span className="w-3.5 h-3.5 rounded-xs bg-red-600 border border-red-700 inline-block" />
                        <span className="font-bold text-slate-700">= Seguimiento continuo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1.2 Caja Principal de Filiación */}
                <div className="rounded-2xl border-2 border-slate-300 p-5 space-y-5 bg-white relative shadow-2xs">
                  
                  {/* Cabecera integrada sobre la caja */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">Nombres y Apellidos:</span>
                      <span className="text-sm font-extrabold text-heading">
                        {patient.lastName}, {patient.firstName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase shrink-0">Establecimiento:</span>
                      <input
                        type="text"
                        value={clinicEstablishment}
                        onChange={(e) => setClinicEstablishment(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary w-72"
                      />
                    </div>
                  </div>

                  {/* BLOQUE 1: Establecimiento de Origen */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 shrink-0">Establ. Origen:</span>
                    <input
                      type="text"
                      value={baselineData.establishmentOrigin || ""}
                      onChange={(e) => setBaselineData({ ...baselineData, establishmentOrigin: e.target.value })}
                      placeholder="Centro de salud de origen..."
                      className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex items-center gap-4 shrink-0 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      <label className="flex items-center gap-1.5 cursor-pointer">
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
                        <span className="text-xs font-semibold text-slate-700">No Aplica</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
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
                        <span className="text-xs font-semibold text-slate-700">Referencia</span>
                      </label>
                    </div>
                  </div>

                  {/* BLOQUE 2: Tipo de Seguro & Código de Afiliación (En 2 columnas separadas para evitar colisión) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                    {/* Columna Izquierda: Tipo de Seguro */}
                    <div className="flex flex-col gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Tipo de Seguro:</span>
                      <div className="flex flex-wrap items-center gap-3">
                        {(["SIS", "ESSALUD", "PRIVADO", "No Aplica"] as const).map((seg) => (
                          <label key={seg} className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                            <input
                              type="radio"
                              name="insuranceTypeRadio"
                              checked={baselineData.insuranceType === seg}
                              onChange={() => setBaselineData({ ...baselineData, insuranceType: seg })}
                              className="text-primary focus:ring-0"
                            />
                            <span className="text-xs font-semibold text-slate-800">{seg}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Columna Derecha: Código Afiliación Seguro (Con espacio amplio para las 12 casillas) */}
                    <div className="flex flex-col gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-700">Código Afiliación Seguro:</span>
                        <input
                          type="text"
                          maxLength={12}
                          value={baselineData.insuranceAffiliationCode || ""}
                          onChange={(e) =>
                            setBaselineData({ ...baselineData, insuranceAffiliationCode: e.target.value.toUpperCase() })
                          }
                          placeholder="Ingresar código (hasta 12 car.)"
                          className="w-48 px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="overflow-x-auto py-0.5">
                        <DigitGrid value={baselineData.insuranceAffiliationCode || ""} length={12} />
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 3: DNI N° + Ocupación + Edad + Casilla Roja de Seguimiento */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-3 border-t border-slate-200">
                    {/* DNI N° (4 cols) */}
                    <div className="md:col-span-4 flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-700 shrink-0">DNI N°:</span>
                      <DigitGrid value={patient.dni} length={8} />
                    </div>

                    {/* Ocupación (4 cols) */}
                    <div className="md:col-span-4 flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Ocupación:</span>
                      <input
                        type="text"
                        value={baselineData.patientOccupation || ""}
                        onChange={(e) => setBaselineData({ ...baselineData, patientOccupation: e.target.value })}
                        placeholder="Ocupación de la gestante..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Edad + Indicador Rojo < 15 / > 35 (4 cols) */}
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
                        title={isAgeRisk ? "¡Alerta de Riesgo Obstétrico! (< 15 o > 35 años)" : "Edad dentro del rango estándar"}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-xs flex items-center justify-center font-bold text-[10px] ${
                            isAgeRisk ? "bg-white text-red-600" : "border border-red-400 bg-red-100 text-red-600"
                          }`}
                        >
                          {isAgeRisk ? "✓" : ""}
                        </span>
                        <span className="text-[11px] font-bold">&lt; 15 / &gt; 35 (Seguimiento)</span>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 4: Nivel de Instrucción (Estudios) & Años Aprobados */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-bold text-slate-700 shrink-0">Estudios:</span>
                        
                        {/* Analfabeta (Alerta Amarilla) */}
                        <label
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                            baselineData.educationLevel === "Analfabeta"
                              ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                              : "bg-amber-50 border-amber-200 text-amber-900"
                          }`}
                          title="Casilla de ALERTA"
                        >
                          <input
                            type="radio"
                            name="educationRadio"
                            checked={baselineData.educationLevel === "Analfabeta"}
                            onChange={() => setBaselineData({ ...baselineData, educationLevel: "Analfabeta" })}
                            className="text-amber-600 focus:ring-0"
                          />
                          <span className="text-xs font-bold">Analfabeta [ALERTA]</span>
                        </label>

                        <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer">
                          <input
                            type="radio"
                            name="educationRadio"
                            checked={baselineData.educationLevel === "Primaria"}
                            onChange={() => setBaselineData({ ...baselineData, educationLevel: "Primaria" })}
                            className="text-primary focus:ring-0"
                          />
                          <span className="text-xs text-slate-700">Primaria</span>
                        </label>

                        <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer">
                          <input
                            type="radio"
                            name="educationRadio"
                            checked={baselineData.educationLevel === "Secundaria"}
                            onChange={() => setBaselineData({ ...baselineData, educationLevel: "Secundaria" })}
                            className="text-primary focus:ring-0"
                          />
                          <span className="text-xs text-slate-700">Secundaria</span>
                        </label>

                        <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer">
                          <input
                            type="radio"
                            name="educationRadio"
                            checked={baselineData.educationLevel === "Superior Univ"}
                            onChange={() => setBaselineData({ ...baselineData, educationLevel: "Superior Univ" })}
                            className="text-primary focus:ring-0"
                          />
                          <span className="text-xs text-slate-700">Superior</span>
                        </label>

                        <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer">
                          <input
                            type="radio"
                            name="educationRadio"
                            checked={baselineData.educationLevel === "Superior No Univ"}
                            onChange={() => setBaselineData({ ...baselineData, educationLevel: "Superior No Univ" })}
                            className="text-primary focus:ring-0"
                          />
                          <span className="text-xs text-slate-700">Superior no Univ.</span>
                        </label>
                      </div>

                      {/* Años aprobados */}
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                        <span className="text-xs font-bold text-slate-700">Años aprobados:</span>
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
                          className="w-14 px-2 py-1 text-center font-bold text-xs rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 5: Estado Civil & Padre del RN (En su propia fila dedicada, SIN Ubigeo mezclado) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-3 border-t border-slate-200">
                    {/* Estado Civil (7 cols) */}
                    <div className="lg:col-span-7 flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Estado Civil:</span>
                      
                      <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer">
                        <input
                          type="radio"
                          name="civilStatusRadio"
                          checked={baselineData.civilStatus === "Casada"}
                          onChange={() => setBaselineData({ ...baselineData, civilStatus: "Casada" })}
                          className="text-primary focus:ring-0"
                        />
                        <span className="text-xs text-slate-700">Casada</span>
                      </label>

                      <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer">
                        <input
                          type="radio"
                          name="civilStatusRadio"
                          checked={baselineData.civilStatus === "Conviviente"}
                          onChange={() => setBaselineData({ ...baselineData, civilStatus: "Conviviente" })}
                          className="text-primary focus:ring-0"
                        />
                        <span className="text-xs text-slate-700">Conviviente</span>
                      </label>

                      {/* Soltera con Alerta Amarilla */}
                      <label
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                          baselineData.civilStatus === "Soltera"
                            ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                            : "bg-amber-50 border-amber-200 text-amber-900"
                        }`}
                        title="Casilla de ALERTA"
                      >
                        <input
                          type="radio"
                          name="civilStatusRadio"
                          checked={baselineData.civilStatus === "Soltera"}
                          onChange={() => setBaselineData({ ...baselineData, civilStatus: "Soltera" })}
                          className="text-amber-600 focus:ring-0"
                        />
                        <span className="text-xs font-bold">Soltera [ALERTA]</span>
                      </label>

                      <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer">
                        <input
                          type="radio"
                          name="civilStatusRadio"
                          checked={baselineData.civilStatus === "Otro"}
                          onChange={() => setBaselineData({ ...baselineData, civilStatus: "Otro" })}
                          className="text-primary focus:ring-0"
                        />
                        <span className="text-xs text-slate-700">Otro</span>
                      </label>
                    </div>

                    {/* Padre RN (5 cols) */}
                    <div className="lg:col-span-5 flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">Padre RN:</span>
                      <input
                        type="text"
                        value={baselineData.fatherName || ""}
                        onChange={(e) => setBaselineData({ ...baselineData, fatherName: e.target.value })}
                        placeholder="Nombres y Apellidos del padre..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* BLOQUE 6: Dirección, Localidad & Ubigeo (Organizado en 2 filas limpias) */}
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    {/* Fila 6.1: Dirección + Localidad + Cod. Sector */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-6 flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 shrink-0">Dirección:</span>
                        <input
                          type="text"
                          value={baselineData.patientAddress || ""}
                          onChange={(e) => setBaselineData({ ...baselineData, patientAddress: e.target.value })}
                          placeholder="Dirección domiciliaria completa..."
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="sm:col-span-4 flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 shrink-0">Localidad:</span>
                        <input
                          type="text"
                          value={baselineData.locality || ""}
                          onChange={(e) => setBaselineData({ ...baselineData, locality: e.target.value })}
                          placeholder="Localidad..."
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-700 shrink-0">Sector:</span>
                        <input
                          type="text"
                          value={baselineData.healthSectorCode || ""}
                          onChange={(e) => setBaselineData({ ...baselineData, healthSectorCode: e.target.value })}
                          placeholder="SEC-01"
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white text-center"
                        />
                      </div>
                    </div>

                    {/* Fila 6.2: Departamento, Provincia, Distrito */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  </div>

                  {/* BLOQUE 7: Contacto (Teléfono & Correo) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
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
              ACORDEÓN 2: ANTECEDENTES OBSTÉTRICOS (ÁRBOL DE PARIDAD G P)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("obstetricos")}
              className="w-full p-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  ANTECEDENTES OBSTÉTRICOS (ÁRBOL DE PARIDAD)
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  G{baselineData.gestas} P{totalPartos}{baselineData.abortos}{baselineData.nacidosVivos} &bull; Viven {baselineData.viven}
                </span>
              </div>
              {openSections.obstetricos ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {openSections.obstetricos && (
              <div className="p-4 sm:p-6 space-y-5 text-xs border-t border-border bg-white">
                {/* 2.1 Barra Superior de Resumen de Fórmula */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      GP
                    </div>
                    <div>
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                        Fórmula Obstétrica Calculada
                      </span>
                      <span className="text-[11px] font-mono font-bold text-primary block">
                        G{baselineData.gestas} P{totalPartos}{baselineData.abortos}{baselineData.nacidosVivos} &bull; {baselineData.viven} Viven &bull; {baselineData.cesareas} Cesáreas
                      </span>
                    </div>
                  </div>

                  {/* Leyenda de colores del diagrama */}
                  <div className="flex items-center gap-2.5 text-[10px] bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded-xs bg-white border border-slate-400 inline-block" />
                      <span className="text-slate-600 font-semibold">Paridad estándar</span>
                    </div>
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                      <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-500 inline-block" />
                      <span className="text-amber-950 font-bold">= ALERTA</span>
                    </div>
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                      <span className="w-3.5 h-3.5 rounded-xs bg-red-600 border border-red-700 inline-block" />
                      <span className="text-red-950 font-bold">= Seguimiento continuo</span>
                    </div>
                  </div>
                </div>

                {/* 2.2 DIAGRAMA DE ANTECEDENTES OBSTÉTRICOS */}
                <div className="rounded-2xl border-2 border-slate-300 p-5 space-y-6 bg-slate-50/40 relative shadow-2xs overflow-x-auto">
                  
                  {/* Cabecera integrada sobre el diagrama */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Diagrama de Flujo de Antecedentes Obstétricos
                    </span>
                    <span className="text-[11px] text-muted font-sans hidden sm:inline">
                      Cada variable muestra 2 casillas gemelas editables con botones (+ / -)
                    </span>
                  </div>

                  {/* Estructura del Árbol (5 Columnas Horizontales) */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-5 items-stretch min-w-[780px]">
                    
                    {/* COLUMNA 1: GESTAS (Raíz) */}
                    <div className="flex flex-col items-center justify-center space-y-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                      <div className="text-center space-y-0.5">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Paso 1</span>
                        <strong className="text-xs text-slate-900 block">Total Gestas</strong>
                      </div>
                      
                      <PairDigitBox
                        label="Gestas"
                        value={baselineData.gestas}
                        onChange={(val) => setBaselineData({ ...baselineData, gestas: val })}
                        badge={baselineData.gestas >= 4 ? "Multípara" : baselineData.gestas === 1 ? "Primigesta" : undefined}
                      />

                      <div className="text-[10px] text-center text-slate-500 max-w-[120px] pt-1 border-t border-slate-100">
                        Total de embarazos previos y actual
                      </div>
                    </div>

                    {/* COLUMNA 2: ABORTOS & CRITERIOS DE ALERTA DE PARTOS */}
                    <div className="flex flex-col justify-between space-y-3">
                      {/* Rama Abortos (Alerta Amarilla) */}
                      <div className="flex flex-col items-center p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs">
                        <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                          Pérdidas (&lt; 22 sem.)
                        </span>
                        <PairDigitBox
                          label="Abortos"
                          value={baselineData.abortos}
                          onChange={(val) => setBaselineData({ ...baselineData, abortos: val })}
                          variant={baselineData.abortos > 0 ? "yellow" : "default"}
                          badge={baselineData.abortos >= 3 ? "Recurrente" : baselineData.abortos > 0 ? "Alerta" : undefined}
                        />
                      </div>

                      {/* Caja de 4 Criterios de Alerta que alimentan a Partos */}
                      <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2 shadow-2xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block text-center border-b border-amber-200 pb-1">
                          Criterios de Alerta (Partos)
                        </span>
                        <div className="space-y-1.5 text-xs">
                          {/* 0 ó + 3 */}
                          <div
                            className={`flex items-center justify-between p-1.5 rounded-lg border transition-colors ${
                              isParityRisk ? "bg-amber-300 border-amber-500 text-amber-950 font-bold" : "bg-white border-slate-200 text-slate-600"
                            }`}
                            title={isParityRisk ? "Alerta: 0 partos (Nulípara) o 4 a más partos (Multípara)" : "Paridad intermedia"}
                          >
                            <span className="text-[11px]">0 ó + 3</span>
                            <span className={`w-4 h-4 rounded-xs border flex items-center justify-center font-bold text-[10px] ${
                              isParityRisk ? "bg-amber-400 border-amber-600 text-amber-950" : "border-slate-300 bg-slate-50"
                            }`}>
                              {isParityRisk ? "✓" : ""}
                            </span>
                          </div>

                          {/* < 2500 g */}
                          <label className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-300 cursor-pointer transition-colors">
                            <span className="text-[11px] font-semibold text-slate-700">&lt; 2500 g</span>
                            <input
                              type="checkbox"
                              checked={baselineData.lowWeightHistory ?? false}
                              onChange={(e) => setBaselineData({ ...baselineData, lowWeightHistory: e.target.checked })}
                              className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                            />
                          </label>

                          {/* Múltiple */}
                          <label className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-300 cursor-pointer transition-colors">
                            <span className="text-[11px] font-semibold text-slate-700">Múltiple</span>
                            <input
                              type="checkbox"
                              checked={baselineData.multipleHistory ?? false}
                              onChange={(e) => setBaselineData({ ...baselineData, multipleHistory: e.target.checked })}
                              className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                            />
                          </label>

                          {/* < 37 sem. */}
                          <label className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-300 cursor-pointer transition-colors">
                            <span className="text-[11px] font-semibold text-slate-700">&lt; 37 sem.</span>
                            <input
                              type="checkbox"
                              checked={baselineData.pretermHistory ?? false}
                              onChange={(e) => setBaselineData({ ...baselineData, pretermHistory: e.target.checked })}
                              className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* COLUMNA 3: PARTOS (Vaginales & Cesáreas) */}
                    <div className="flex flex-col justify-between space-y-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                      <div>
                        <div className="text-center mb-1">
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Paso 2</span>
                          <strong className="text-xs text-slate-900 block">Total Partos</strong>
                        </div>
                        {/* Casilla de Partos Total */}
                        <PairDigitBox
                          label="Partos"
                          value={totalPartos}
                          onChange={(val) => {
                            setBaselineData({ ...baselineData, partosVaginales: Math.max(0, val - (baselineData.cesareas || 0)) });
                          }}
                          badge={isParityRisk ? "Alerta 0 / +3" : "Paridad Normal"}
                          variant={isParityRisk ? "yellow" : "default"}
                        />
                      </div>

                      <div className="w-full border-t border-slate-200 pt-2 space-y-2.5">
                        {/* Vaginales */}
                        <PairDigitBox
                          label="Vaginales"
                          value={baselineData.partosVaginales}
                          onChange={(val) => setBaselineData({ ...baselineData, partosVaginales: val })}
                        />

                        {/* Cesáreas (Alerta Roja de Seguimiento) */}
                        <PairDigitBox
                          label="Cesáreas"
                          value={baselineData.cesareas}
                          onChange={(val) => setBaselineData({ ...baselineData, cesareas: val })}
                          variant={baselineData.cesareas > 0 ? "red" : "default"}
                          badge={baselineData.cesareas > 0 ? "Seguimiento Rojo" : undefined}
                        />
                      </div>
                    </div>

                    {/* COLUMNA 4: NACIDOS VIVOS & NACIDOS MUERTOS */}
                    <div className="flex flex-col justify-between space-y-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                      <div>
                        <div className="text-center mb-1">
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Paso 3</span>
                          <strong className="text-xs text-slate-900 block">Condición Natal</strong>
                        </div>
                        {/* Nacidos Vivos */}
                        <PairDigitBox
                          label="Nacidos vivos"
                          value={baselineData.nacidosVivos}
                          onChange={(val) => setBaselineData({ ...baselineData, nacidosVivos: val, viven: Math.min(baselineData.viven, val) })}
                        />
                      </div>

                      <div className="w-full border-t border-slate-200 pt-2">
                        {/* Nacidos Muertos (Alerta Amarilla) */}
                        <PairDigitBox
                          label="Nacidos muertos"
                          value={baselineData.nacidosMuertos}
                          onChange={(val) => setBaselineData({ ...baselineData, nacidosMuertos: val })}
                          variant={baselineData.nacidosMuertos > 0 ? "yellow" : "default"}
                          badge={baselineData.nacidosMuertos > 0 ? "Óbito Alerta" : undefined}
                        />
                      </div>
                    </div>

                    {/* COLUMNA 5: DESENLACES DE NACIDOS VIVOS (Viven / Muertes Neonatales) */}
                    <div className="flex flex-col justify-between space-y-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                      <div>
                        <div className="text-center mb-1">
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Paso 4</span>
                          <strong className="text-xs text-slate-900 block">Supervivencia</strong>
                        </div>
                        {/* Viven */}
                        <PairDigitBox
                          label="Viven"
                          value={baselineData.viven}
                          onChange={(val) => setBaselineData({ ...baselineData, viven: val })}
                          variant={baselineData.viven < baselineData.nacidosVivos ? "yellow" : "default"}
                          badge={baselineData.viven < baselineData.nacidosVivos ? "Pérdida infantil" : undefined}
                        />
                      </div>

                      <div className="w-full border-t border-slate-200 pt-2 space-y-2.5">
                        {/* Muerto - 1ra semana */}
                        <PairDigitBox
                          label="Muerto - 1ra sem."
                          value={baselineData.deadFirstWeek ?? 0}
                          onChange={(val) => setBaselineData({ ...baselineData, deadFirstWeek: val })}
                          variant={(baselineData.deadFirstWeek ?? 0) > 0 ? "yellow" : "default"}
                          badge={(baselineData.deadFirstWeek ?? 0) > 0 ? "Precoz ≤7d" : undefined}
                        />

                        {/* Después - 1ra semana */}
                        <PairDigitBox
                          label="Después - 1ra sem."
                          value={baselineData.deadAfterFirstWeek ?? 0}
                          onChange={(val) => setBaselineData({ ...baselineData, deadAfterFirstWeek: val })}
                          variant={(baselineData.deadAfterFirstWeek ?? 0) > 0 ? "yellow" : "default"}
                          badge={(baselineData.deadAfterFirstWeek ?? 0) > 0 ? "Tardía >7d" : undefined}
                        />
                      </div>
                    </div>

                  </div>

                  {/* 2.3 CAMPO INFERIOR: RN DE MAYOR PESO (4 CASILLAS) */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        RN de mayor peso:
                      </span>
                      <DigitGrid
                        value={String(baselineData.rnMayorPesoGramos || 0).padStart(4, "0")}
                        length={4}
                      />
                      <span className="text-xs font-bold text-slate-600">gramos</span>
                      <input
                        type="number"
                        min={500}
                        max={6500}
                        step={50}
                        value={baselineData.rnMayorPesoGramos || ""}
                        onChange={(e) =>
                          setBaselineData({
                            ...baselineData,
                            rnMayorPesoGramos: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        placeholder="ej. 3400"
                        className="w-24 px-2.5 py-1 text-xs font-mono font-bold text-center rounded-lg border border-slate-300 bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {baselineData.rnMayorPesoGramos && baselineData.rnMayorPesoGramos >= 4000 ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          ⚠️ Alerta: Macrosomía Fetal (≥ 4000g)
                        </span>
                      ) : baselineData.rnMayorPesoGramos && baselineData.rnMayorPesoGramos > 0 && baselineData.rnMayorPesoGramos < 2500 ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          ⚠️ Alerta: Bajo Peso al Nacer (&lt; 2500g)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Rango estándar esperado: 2500g - 3999g
                        </span>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 3: GESTACIÓN ANTERIOR & CAPTACIÓN
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("gestacionAnterior" as any)}
              className="w-full p-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  GESTACIÓN ANTERIOR & CAPTACIÓN
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {baselineData.previousDeliveryType || "No Aplica"} &bull; Lactancia: {baselineData.breastfeedingMonths || "No aplica"}
                </span>
              </div>
              {(openSections as any).gestacionAnterior ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {(openSections as any).gestacionAnterior && (
              <div className="p-4 sm:p-6 space-y-5 text-xs border-t border-border bg-white">
                
                {/* 3.1 Barra Superior Informativa */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      GA
                    </div>
                    <div>
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                        Historial del Embarazo Inmediatamente Anterior
                      </span>
                      <span className="text-[11px] text-muted block">
                        Periodo intergenésico, vía de culminación, tipo de aborto, lactancia y captación
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-500 inline-block" />
                      <span className="font-bold text-slate-700">= ALERTA</span>
                    </div>
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                      <span className="w-3.5 h-3.5 rounded-xs bg-red-600 border border-red-700 inline-block" />
                      <span className="font-bold text-slate-700">= Seguimiento continuo</span>
                    </div>
                  </div>
                </div>

                {/* 3.2 Caja Principal de Gestación Anterior */}
                <div className="rounded-2xl border-2 border-slate-300 p-5 space-y-5 bg-white relative shadow-2xs">
                  
                  {/* Fila 1: Fecha de término y Período Intergenésico */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    {/* Fecha de terminación */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-700 uppercase">Fecha:</span>
                      <input
                        type="date"
                        value={baselineData.previousDeliveryDate || ""}
                        onChange={(e) => setBaselineData({ ...baselineData, previousDeliveryDate: e.target.value })}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">(Día / Mes / Año)</span>
                    </div>

                    {/* Per. Intergenésico Adecuado */}
                    <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Per. Intergenésico Adecuado:</span>
                      
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="adequateIntergenesicRadio"
                          checked={baselineData.adequateIntergenesicPeriod === true}
                          onChange={() => setBaselineData({ ...baselineData, adequateIntergenesicPeriod: true })}
                          className="text-primary focus:ring-0"
                        />
                        <span className="text-xs font-semibold text-slate-700">Si</span>
                      </label>

                      {/* No con Alerta Amarilla */}
                      <label
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded border cursor-pointer transition-colors ${
                          baselineData.adequateIntergenesicPeriod === false
                            ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                            : "bg-amber-50/70 border-amber-200 text-amber-900"
                        }`}
                        title="Alerta: Periodo intergenésico corto (< 18 meses) o largo (> 5 años)"
                      >
                        <input
                          type="radio"
                          name="adequateIntergenesicRadio"
                          checked={baselineData.adequateIntergenesicPeriod === false}
                          onChange={() => setBaselineData({ ...baselineData, adequateIntergenesicPeriod: false })}
                          className="text-amber-600 focus:ring-0"
                        />
                        <span className="text-xs">No [ALERTA]</span>
                      </label>
                    </div>
                  </div>

                  {/* Fila 2: Tres Columnas Principales (Terminación, Tipo de Aborto, Lactancia & Lugar) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* COLUMNA 1: Terminación */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2.5">
                      <div className="border-b border-slate-200 pb-1.5">
                        <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                          Terminación
                        </span>
                        <span className="text-[10px] text-slate-500">¿Cómo culminó el embarazo previo?</span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                          <span className="text-xs font-semibold text-slate-800">Parto Vaginal</span>
                          <input
                            type="radio"
                            name="deliveryTypeRadio"
                            checked={baselineData.previousDeliveryType === "Parto Vaginal"}
                            onChange={() => setBaselineData({ ...baselineData, previousDeliveryType: "Parto Vaginal" })}
                            className="text-primary focus:ring-0"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                          <span className="text-xs font-semibold text-slate-800">Cesárea</span>
                          <input
                            type="radio"
                            name="deliveryTypeRadio"
                            checked={baselineData.previousDeliveryType === "Cesárea"}
                            onChange={() => setBaselineData({ ...baselineData, previousDeliveryType: "Cesárea" })}
                            className="text-primary focus:ring-0"
                          />
                        </label>

                        {/* Aborto [ALERTA] */}
                        <label
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                            baselineData.previousDeliveryType === "Aborto"
                              ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                              : "bg-amber-50/60 border-amber-200 text-amber-900"
                          }`}
                        >
                          <span className="text-xs">Aborto [ALERTA]</span>
                          <input
                            type="radio"
                            name="deliveryTypeRadio"
                            checked={baselineData.previousDeliveryType === "Aborto"}
                            onChange={() => setBaselineData({ ...baselineData, previousDeliveryType: "Aborto" })}
                            className="text-amber-600 focus:ring-0"
                          />
                        </label>

                        {/* Ectópico [ALERTA] */}
                        <label
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                            baselineData.previousDeliveryType === "Ectópico"
                              ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                              : "bg-amber-50/60 border-amber-200 text-amber-900"
                          }`}
                        >
                          <span className="text-xs">Ectópico [ALERTA]</span>
                          <input
                            type="radio"
                            name="deliveryTypeRadio"
                            checked={baselineData.previousDeliveryType === "Ectópico"}
                            onChange={() => setBaselineData({ ...baselineData, previousDeliveryType: "Ectópico" })}
                            className="text-amber-600 focus:ring-0"
                          />
                        </label>

                        {/* Aborto Molar [ALERTA] */}
                        <label
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                            baselineData.previousDeliveryType === "Aborto molar"
                              ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                              : "bg-amber-50/60 border-amber-200 text-amber-900"
                          }`}
                        >
                          <span className="text-xs">Aborto molar [ALERTA]</span>
                          <input
                            type="radio"
                            name="deliveryTypeRadio"
                            checked={baselineData.previousDeliveryType === "Aborto molar"}
                            onChange={() => setBaselineData({ ...baselineData, previousDeliveryType: "Aborto molar" })}
                            className="text-amber-600 focus:ring-0"
                          />
                        </label>

                        {/* No Aplica */}
                        <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-700">No Aplica</span>
                            <span className="text-[10px] text-slate-400 italic">(cuando es primigesta)</span>
                          </div>
                          <input
                            type="radio"
                            name="deliveryTypeRadio"
                            checked={baselineData.previousDeliveryType === "No Aplica" || !baselineData.previousDeliveryType}
                            onChange={() => setBaselineData({ ...baselineData, previousDeliveryType: "No Aplica" })}
                            className="text-primary focus:ring-0"
                          />
                        </label>
                      </div>
                    </div>

                    {/* COLUMNA 2: Si fue aborto: Tipo de Aborto */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2.5">
                      <div className="border-b border-slate-200 pb-1.5">
                        <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                          Si fue aborto: Tipo de Aborto
                        </span>
                        <span className="text-[10px] text-slate-500">Clasificación clínica del evento</span>
                      </div>

                      <div className="space-y-1.5">
                        {/* Incompleto [ALERTA] */}
                        <label
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                            baselineData.previousAbortionType === "Incompleto"
                              ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                              : "bg-amber-50/60 border-amber-200 text-amber-900"
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold block">Incompleto [ALERTA]</span>
                            <span className="text-[10px] text-amber-900/80 italic font-normal">cuando quedó restos</span>
                          </div>
                          <input
                            type="radio"
                            name="abortionTypeRadio"
                            checked={baselineData.previousAbortionType === "Incompleto"}
                            onChange={() => setBaselineData({ ...baselineData, previousAbortionType: "Incompleto" })}
                            className="text-amber-600 focus:ring-0"
                          />
                        </label>

                        {/* Completo [ALERTA] */}
                        <label
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                            baselineData.previousAbortionType === "Completo"
                              ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                              : "bg-amber-50/60 border-amber-200 text-amber-900"
                          }`}
                        >
                          <span className="text-xs">Completo [ALERTA]</span>
                          <input
                            type="radio"
                            name="abortionTypeRadio"
                            checked={baselineData.previousAbortionType === "Completo"}
                            onChange={() => setBaselineData({ ...baselineData, previousAbortionType: "Completo" })}
                            className="text-amber-600 focus:ring-0"
                          />
                        </label>

                        {/* Frustro / Retenido [ALERTA] */}
                        <label
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                            baselineData.previousAbortionType === "Frustro/Retenido"
                              ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                              : "bg-amber-50/60 border-amber-200 text-amber-900"
                          }`}
                        >
                          <span className="text-xs">Frustro / Retenido [ALERTA]</span>
                          <input
                            type="radio"
                            name="abortionTypeRadio"
                            checked={baselineData.previousAbortionType === "Frustro/Retenido"}
                            onChange={() => setBaselineData({ ...baselineData, previousAbortionType: "Frustro/Retenido" })}
                            className="text-amber-600 focus:ring-0"
                          />
                        </label>

                        {/* Séptico [ALERTA] */}
                        <label
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                            baselineData.previousAbortionType === "Séptico"
                              ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                              : "bg-amber-50/60 border-amber-200 text-amber-900"
                          }`}
                        >
                          <span className="text-xs">Séptico [ALERTA]</span>
                          <input
                            type="radio"
                            name="abortionTypeRadio"
                            checked={baselineData.previousAbortionType === "Séptico"}
                            onChange={() => setBaselineData({ ...baselineData, previousAbortionType: "Séptico" })}
                            className="text-amber-600 focus:ring-0"
                          />
                        </label>

                        {/* No Aplica */}
                        <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                          <span className="text-xs font-semibold text-slate-700">No Aplica</span>
                          <input
                            type="radio"
                            name="abortionTypeRadio"
                            checked={baselineData.previousAbortionType === "No Aplica" || !baselineData.previousAbortionType}
                            onChange={() => setBaselineData({ ...baselineData, previousAbortionType: "No Aplica" })}
                            className="text-primary focus:ring-0"
                          />
                        </label>
                      </div>
                    </div>

                    {/* COLUMNA 3: Lactancia Materna & Lugar del Parto */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-4">
                      {/* Lactancia Materna */}
                      <div className="space-y-2">
                        <div className="border-b border-slate-200 pb-1.5">
                          <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                            Lactancia Materna
                          </span>
                          <span className="text-[10px] text-slate-500">Duración en gestación previa</span>
                        </div>

                        <div className="space-y-1.5">
                          {/* no hubo [ROJO] */}
                          <label
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                              baselineData.breastfeedingMonths === "no hubo" || baselineData.breastfeedingMonths === "No hubo"
                                ? "bg-red-500 border-red-600 text-white font-black shadow-xs ring-2 ring-red-400/50"
                                : "bg-red-50 border-red-200 text-red-900 font-bold"
                            }`}
                            title="Seguimiento continuo: falta total de lactancia"
                          >
                            <span className="text-xs">no hubo [SEGUIMIENTO ROJO]</span>
                            <input
                              type="radio"
                              name="breastfeedingRadio"
                              checked={baselineData.breastfeedingMonths === "no hubo" || baselineData.breastfeedingMonths === "No hubo"}
                              onChange={() => setBaselineData({ ...baselineData, breastfeedingMonths: "no hubo" })}
                              className="text-red-600 focus:ring-0"
                            />
                          </label>

                          {/* < 6 meses [ALERTA] */}
                          <label
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                              baselineData.breastfeedingMonths === "< 6 meses"
                                ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                                : "bg-amber-50/60 border-amber-200 text-amber-900"
                            }`}
                          >
                            <span className="text-xs">&lt; 6 meses [ALERTA]</span>
                            <input
                              type="radio"
                              name="breastfeedingRadio"
                              checked={baselineData.breastfeedingMonths === "< 6 meses"}
                              onChange={() => setBaselineData({ ...baselineData, breastfeedingMonths: "< 6 meses" })}
                              className="text-amber-600 focus:ring-0"
                            />
                          </label>

                          {/* 6 meses o más */}
                          <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                            <span className="text-xs font-semibold text-slate-800">6 meses o más</span>
                            <input
                              type="radio"
                              name="breastfeedingRadio"
                              checked={baselineData.breastfeedingMonths === "6 meses o más"}
                              onChange={() => setBaselineData({ ...baselineData, breastfeedingMonths: "6 meses o más" })}
                              className="text-primary focus:ring-0"
                            />
                          </label>

                          {/* No aplica */}
                          <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                            <span className="text-xs font-semibold text-slate-700">No aplica</span>
                            <input
                              type="radio"
                              name="breastfeedingRadio"
                              checked={baselineData.breastfeedingMonths === "No aplica" || !baselineData.breastfeedingMonths}
                              onChange={() => setBaselineData({ ...baselineData, breastfeedingMonths: "No aplica" })}
                              className="text-primary focus:ring-0"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Lugar del parto */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                          Lugar del parto
                        </span>

                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                            <span className="text-xs font-semibold text-slate-800">EESS (Clínica)</span>
                            <input
                              type="radio"
                              name="deliveryPlaceRadio"
                              checked={baselineData.deliveryPlace === "EESS" || !baselineData.deliveryPlace}
                              onChange={() => setBaselineData({ ...baselineData, deliveryPlace: "EESS" })}
                              className="text-primary focus:ring-0"
                            />
                          </label>

                          <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                            <span className="text-xs font-semibold text-slate-800">Domic. (Casa)</span>
                            <input
                              type="radio"
                              name="deliveryPlaceRadio"
                              checked={baselineData.deliveryPlace === "Domic."}
                              onChange={() => setBaselineData({ ...baselineData, deliveryPlace: "Domic." })}
                              className="text-primary focus:ring-0"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Fila 3: Captada y Referida por Agente Comunitario (2 Sub-cajas inferiores) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                    {/* Caja 1: Captada */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 uppercase block">Captada:</span>
                        <span className="text-[10px] text-slate-500">Identificación precoz (&lt; 14 semanas)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          <input
                            type="radio"
                            name="pregnancyCapturedRadio"
                            checked={baselineData.pregnancyCaptured !== false}
                            onChange={() => setBaselineData({ ...baselineData, pregnancyCaptured: true })}
                            className="text-primary focus:ring-0"
                          />
                          <span className="text-xs font-bold text-slate-800">Si</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          <input
                            type="radio"
                            name="pregnancyCapturedRadio"
                            checked={baselineData.pregnancyCaptured === false}
                            onChange={() => setBaselineData({ ...baselineData, pregnancyCaptured: false })}
                            className="text-primary focus:ring-0"
                          />
                          <span className="text-xs font-bold text-slate-800">No</span>
                        </label>
                      </div>
                    </div>

                    {/* Caja 2: Referida X Ag. Comuni */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 uppercase block">Referida X Ag. Comuni:</span>
                        <span className="text-[10px] text-slate-500 italic">una persona comunitaria / promotora</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          <input
                            type="radio"
                            name="communityAgentRadio"
                            checked={baselineData.communityAgentReferred === true}
                            onChange={() => setBaselineData({ ...baselineData, communityAgentReferred: true })}
                            className="text-primary focus:ring-0"
                          />
                          <span className="text-xs font-bold text-slate-800">Si</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          <input
                            type="radio"
                            name="communityAgentRadio"
                            checked={baselineData.communityAgentReferred !== true}
                            onChange={() => setBaselineData({ ...baselineData, communityAgentReferred: false })}
                            className="text-primary focus:ring-0"
                          />
                          <span className="text-xs font-bold text-slate-800">No</span>
                        </label>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 4: ANTECEDENTES FAMILIARES, PERSONALES & VACUNAS (EN COLA)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("antecedentes")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center shrink-0">
                  4
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                  <span>Paso 4 en Cola</span>
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
              ACORDEÓN 5: DATOS BASALES DEL EMBARAZO ACTUAL (FUM, ECOGRAFÍA, FPP)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("embarazo")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center shrink-0">
                  5
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
                  <span>Paso 5 en Cola</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Cálculo de Regla de Naegele, Duda de FUM, Ecografía Precoz, Hospitalización y Emergencias
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 6: EXAMEN FÍSICO BASAL & EXÁMENES DE LABORATORIO
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("laboratorio")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0">
                  6
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200">
                  <span>Paso 6 en Cola</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Examen Físico Basal (Mamas, Cuello Uterino, Pelvis) y Batería de Laboratorio (Hemoglobina, Glucosa, VDRL, VIH, PAP, etc.)
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 7: REGISTRO DE ATENCIONES PRENATALES LONGITUDINALES (9 CONSULTAS)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("atenciones")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                  7
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                  <span>Paso 7 en Cola</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Matriz Longitudinal de 9 Atenciones Prenatales MINSA (EG, Peso, PA, AU, FCF, Mov. Fetales, etc.)
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 8: EVALUACIÓN DE RIESGO OBSTÉTRICO (ARO) & CONDUCTA
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("riesgos")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  8
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300">
                  <span>Paso 8 en Cola</span>
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
