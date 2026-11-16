"use client";

import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import {
  X,
  Baby,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Heart,
  Scale,
  Activity,
  FileText,
  Printer,
  Sparkles,
  Stethoscope,
  Info,
  Clock,
  Shield,
  Layers,
  FlaskConical,
  User,
  HeartPulse,
} from "lucide-react";
import {
  PrenatalCard,
  PrenatalVisitItem,
  PrenatalBaselineData,
  Patient,
  DoctorProfile,
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

const STANDARD_FAMILY_HISTORY = [
  "Ninguno",
  "Hipertensión Arterial",
  "Diabetes",
  "Enf. Hipertens. Emb.",
  "Preeclampsia Familiar",
  "Emb. Múltiple",
  "Alergias",
  "Epilepsia",
  "Enferm. Congénitas",
  "Malaria",
  "Hipotiroidismo",
  "Neoplasia",
  "TBC Pulmonar",
];

const STANDARD_PERSONAL_HISTORY: { label: string; risk: "red" | "yellow" }[] = [
  { label: "Preeclampsia previa", risk: "red" },
  { label: "Cardiopatía", risk: "red" },
  { label: "Cirugía Pélv. uterina", risk: "red" },
  { label: "Diabetes Mellitus", risk: "red" },
  { label: "Hipertensión Arterial", risk: "red" },
  { label: "Hemorragia Postparto previa", risk: "red" },
  { label: "Aborto habitual / recurrente", risk: "red" },
  { label: "Eclampsia", risk: "red" },
  { label: "Violencia previa", risk: "red" },
  { label: "VIH / SIDA", risk: "red" },
  { label: "Asma Bronquial", risk: "yellow" },
  { label: "Alergias medicamentos", risk: "yellow" },
  { label: "Alcoholismo", risk: "yellow" },
  { label: "Tabaco", risk: "yellow" },
  { label: "Drogas / Sustancias", risk: "yellow" },
  { label: "Prematuridad previa", risk: "yellow" },
  { label: "Retención de Placenta", risk: "yellow" },
  { label: "Parto Prolongado", risk: "yellow" },
  { label: "Infertilidad", risk: "yellow" },
  { label: "Neoplasia", risk: "yellow" },
  { label: "TBC Pulmonar", risk: "yellow" },
  { label: "Trastornos mentales", risk: "yellow" },
  { label: "Epilepsia", risk: "yellow" },
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
  } = useMedicalStore();

  const [activeTab, setActiveTab] = useState<"baseline" | "visits" | "risks">("baseline");
  const [baselineSubTab, setBaselineSubTab] = useState<"sec1" | "sec2" | "sec3" | "sec4">("sec1");

  const existingCard = getPrenatalCardByPatientId(patient.id);
  const todayStr = new Date().toISOString().split("T")[0];

  // Estado local para edición de Ficha Basal
  const [baselineData, setBaselineData] = useState<PrenatalBaselineData>({
    insuranceType: "PRIVADO",
    insuranceCode: `CENDO-${patient.dni}`,
    educationLevel: "Superior Univ",
    civilStatus: "Soltera",
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

  // Función de sincronización inteligente de datos
  const autoFillFromPatientAndBackground = (showToast = false) => {
    const bg = getBackground(patient.id);
    const formula = parseObstetricFormula(bg?.obstetricFormula);
    const fum = bg?.lastMenstrualPeriod || baselineData.fum || "2026-09-26";
    const fpp = calculateNaegeleFPP(fum);

    const validCivilStatus: "Soltera" | "Casada" | "Conviviente" | "Otro" =
      patient.civilStatus === "Casada" || patient.civilStatus === "Conviviente" || patient.civilStatus === "Soltera"
        ? patient.civilStatus
        : "Soltera";

    const personalHist: string[] = [];
    if (bg?.hasDiabetes === "Sí") personalHist.push("Diabetes Mellitus");
    if (bg?.hasHypertension === "Sí") personalHist.push("Hipertensión Arterial");
    if (bg?.hasAsthma === "Sí") personalHist.push("Asma Bronquial");
    if (bg?.medicalAllergies && bg.medicalAllergies !== "Niega" && bg.medicalAllergies !== "Niega alergias") {
      personalHist.push("Alergias medicamentos");
    }
    if (bg?.surgeriesHistory && bg.surgeriesHistory !== "Niega" && bg.surgeriesHistory !== "Niega intervenciones") {
      personalHist.push("Cirugía Pélv. uterina");
    }
    if (personalHist.length === 0) personalHist.push("Ninguno");

    const familyHist: string[] = [];
    if (bg?.familyHistory && bg.familyHistory !== "Sin antecedentes directos") {
      familyHist.push(bg.familyHistory);
    } else {
      familyHist.push("Ninguno");
    }

    setBaselineData((prev) => ({
      ...prev,
      insuranceType: patient.insuranceInfo?.toUpperCase().includes("EPS") ? "PRIVADO" : "SIS",
      insuranceCode: `CENDO-${patient.dni}`,
      educationLevel: prev.educationLevel || "Superior Univ",
      civilStatus: validCivilStatus,
      gestas: formula.gestas,
      abortos: formula.abortos,
      partosVaginales: formula.partosVaginales,
      cesareas: formula.cesareas,
      nacidosVivos: formula.nacidosVivos,
      viven: formula.viven,
      fum,
      fumDoubt: false,
      fpp,
      familyHistory: familyHist,
      personalHistory: personalHist,
    }));

    if (showToast) {
      Swal.fire({
        icon: "success",
        title: "¡Datos Sincronizados!",
        text: "Se cargaron filiación, fórmula obstétrica, FUM y antecedentes desde la Historia Clínica de la paciente.",
        timer: 1800,
        showConfirmButton: false,
      });
    }
  };

  // Sincronizar datos al abrir modal
  useEffect(() => {
    if (!isOpen) return;

    if (existingCard) {
      setBaselineData(existingCard.baseline);
      setVisitsList(existingCard.visits || []);
    } else {
      autoFillFromPatientAndBackground(false);
      setVisitsList([]);
    }
  }, [existingCard, patient, isOpen]);

  // Recalcular Naegele reactivamente si cambia la FUM
  const handleFumChange = (newFum: string) => {
    const newFpp = calculateNaegeleFPP(newFum);
    setBaselineData((prev) => ({
      ...prev,
      fum: newFum,
      fpp: newFpp,
    }));
  };

  if (!isOpen) return null;

  const risksReport = evaluatePrenatalRisks(baselineData, patient.age, visitsList);
  const currentGestAge = calculateGestationalAge(baselineData.fum);

  const toggleFamilyHistory = (item: string) => {
    let current = [...(baselineData.familyHistory || [])];
    if (item === "Ninguno") {
      setBaselineData({ ...baselineData, familyHistory: ["Ninguno"] });
      return;
    }
    current = current.filter((h) => h !== "Ninguno");
    if (current.includes(item)) {
      current = current.filter((h) => h !== item);
      if (current.length === 0) current = ["Ninguno"];
    } else {
      current.push(item);
    }
    setBaselineData({ ...baselineData, familyHistory: current });
  };

  const togglePersonalHistory = (item: string) => {
    let current = [...(baselineData.personalHistory || [])];
    if (item === "Ninguno") {
      setBaselineData({ ...baselineData, personalHistory: ["Ninguno"] });
      return;
    }
    current = current.filter((h) => h !== "Ninguno");
    if (current.includes(item)) {
      current = current.filter((h) => h !== item);
      if (current.length === 0) current = ["Ninguno"];
    } else {
      current.push(item);
    }
    setBaselineData({ ...baselineData, personalHistory: current });
  };

  const handleSaveCard = () => {
    const payload = {
      patientId: patient.id,
      clinicEstablishment: "CENDO - Consultorio Ginecológico & Obstétrico Miraflores",
      attendingDoctorId: doctorProfile.id,
      attendingDoctorName: `${doctorProfile.doctorTitle || "Dr."} ${doctorProfile.fullName}`,
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

  const handleAddQuickVisit = () => {
    if (visitsList.length >= 9) {
      Swal.fire({
        icon: "info",
        title: "Límite de Atenciones Alcanzado",
        text: "El carnet oficial MINSA contempla 9 atenciones prenatales.",
      });
      return;
    }

    const nextVisitNum = visitsList.length + 1;
    const gestAgeAtVisit = calculateGestationalAge(baselineData.fum, todayStr);

    const nextAppt = new Date();
    nextAppt.setDate(nextAppt.getDate() + 28);
    const nextApptStr = nextAppt.toISOString().split("T")[0];

    const newVisit: PrenatalVisitItem = {
      visitNumber: nextVisitNum,
      visitDate: todayStr,
      visitTime: "11:00",
      gestationalAgeWeeks: gestAgeAtVisit.weeks,
      gestationalAgeDays: gestAgeAtVisit.days,
      maternalWeightKg: baselineData.usualWeightKg,
      temperature: 36.5,
      bloodPressure: "110/70",
      maternalPulse: 76,
      uterineHeightCm: gestAgeAtVisit.weeks >= 13 ? gestAgeAtVisit.weeks - 2 : 0,
      fetusSituation: gestAgeAtVisit.weeks >= 28 ? "L" : "NA",
      fetusPresentation: gestAgeAtVisit.weeks >= 28 ? "C" : "NA",
      fetusPosition: gestAgeAtVisit.weeks >= 28 ? "D" : "NA",
      fetalHeartRate: gestAgeAtVisit.weeks >= 12 ? 140 : 0,
      fetalMovements: gestAgeAtVisit.weeks >= 20 ? "++" : "NA",
      proteinuria: "-",
      edema: "SE",
      tendonReflex: "+",
      ironFolicAcidGiven: gestAgeAtVisit.weeks >= 14,
      calciumGiven: gestAgeAtVisit.weeks >= 20,
      counselingGiven: "NUT / ITS",
      nextAppointmentDate: nextApptStr,
      attendingDoctorName: `${doctorProfile.doctorTitle || "Dr."} ${doctorProfile.fullName}`,
      notes: `Atención prenatal N° ${nextVisitNum}. Evolución materna y fetal adecuada.`,
    };

    setVisitsList([...visitsList, newVisit]);
  };

  const handleDeleteVisit = (index: number) => {
    Swal.fire({
      title: `¿Eliminar Atención N° ${index + 1}?`,
      text: "Esta acción quitará el registro de la matriz prenatal.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        setVisitsList(visitsList.filter((_, idx) => idx !== index));
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* 1. Header Oficial Dual CENDO & MINSA */}
        <div className="bg-primary px-5 py-3.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-heading font-extrabold tracking-tight">
                  Carnet de Atención Materno Perinatal (MINSA / CLAP)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-900 border border-amber-300">
                  NTS N° 105-MINSA
                </span>
              </div>
              <p className="text-xs text-white/80">
                Gestante: <strong>{patient.lastName}, {patient.firstName}</strong> &bull; DNI {patient.dni} &bull; HC-{patient.dni}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => autoFillFromPatientAndBackground(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
              title="Cargar datos de filiación, fórmula obstétrica y FUM desde la HC"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Auto-completar desde HC</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Barra de Navegación por Módulos del Carnet */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-border flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("baseline")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "baseline"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-border"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>📋 Ficha Basal Oficial (4 Secciones)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("visits")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "visits"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-border"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>📅 Matriz 9 Atenciones ({visitsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("risks")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "risks"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>⚠️ Criterios ARO ({risksReport.warningFlags.length})</span>
            </button>
          </div>

          {/* Widget de Cálculo Naegele en Tiempo Real */}
          <div className="flex items-center gap-3 text-xs bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs font-mono">
            <div>
              <span className="text-[9px] text-slate-400 font-sans block">FUM:</span>
              <strong className="text-slate-800">{baselineData.fum}</strong>
            </div>
            <div className="border-l border-slate-200 pl-2">
              <span className="text-[9px] text-slate-400 font-sans block">EG Actual:</span>
              <strong className="text-primary font-bold">{currentGestAge.formatted}</strong>
            </div>
            <div className="border-l border-slate-200 pl-2">
              <span className="text-[9px] text-secondary font-sans font-bold block">FPP Naegele:</span>
              <strong className="text-slate-900">{baselineData.fpp}</strong>
            </div>
          </div>
        </div>

        {/* 3. Contenido Principal */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* =========================================================================
              PESTAÑA 1: FICHA BASAL OFICIAL MINSA (4 SECCIONES DE LAS FOTOS)
              ========================================================================= */}
          {activeTab === "baseline" && (
            <div className="space-y-4">
              {/* Selector de sub-sección con estilo de pestañas oficiales */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBaselineSubTab("sec1")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    baselineSubTab === "sec1"
                      ? "bg-white text-primary shadow-xs"
                      : "text-slate-600 hover:text-heading"
                  }`}
                >
                  I. Filiación & Obstétricos (G_ P____)
                </button>
                <button
                  type="button"
                  onClick={() => setBaselineSubTab("sec2")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    baselineSubTab === "sec2"
                      ? "bg-white text-primary shadow-xs"
                      : "text-slate-600 hover:text-heading"
                  }`}
                >
                  II. Antecedentes, Vacunas & Somatometría
                </button>
                <button
                  type="button"
                  onClick={() => setBaselineSubTab("sec3")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    baselineSubTab === "sec3"
                      ? "bg-white text-primary shadow-xs"
                      : "text-slate-600 hover:text-heading"
                  }`}
                >
                  III. FUM, Naegele & Complicaciones
                </button>
                <button
                  type="button"
                  onClick={() => setBaselineSubTab("sec4")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    baselineSubTab === "sec4"
                      ? "bg-white text-primary shadow-xs"
                      : "text-slate-600 hover:text-heading"
                  }`}
                >
                  IV. Examen Físico & Matriz Laboratorio
                </button>
              </div>

              {/* SECCIÓN 1: FILIACIÓN & ANTECEDENTES OBSTÉTRICOS */}
              {baselineSubTab === "sec1" && (
                <div className="space-y-4">
                  {/* Bloque Filiación */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                      <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-primary">
                        1. Filiación de la Gestante & Datos Sociodemográficos
                      </span>
                      <span className="text-[10px] text-slate-400">Campos oficiales CLAP/MINSA</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Apellidos y Nombres</label>
                        <input
                          type="text"
                          disabled
                          value={`${patient.lastName}, ${patient.firstName}`}
                          className="w-full px-2.5 py-1.5 rounded-lg border bg-slate-50 text-slate-700 font-semibold text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">DNI N°</label>
                        <input
                          type="text"
                          disabled
                          value={patient.dni}
                          className="w-full px-2.5 py-1.5 rounded-lg border bg-slate-50 text-slate-700 font-mono font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block flex items-center justify-between">
                          <span>Edad</span>
                          {(patient.age < 15 || patient.age > 35) && (
                            <span className="px-1 bg-amber-400 text-black font-extrabold text-[8px] rounded">ALERTA</span>
                          )}
                        </label>
                        <input
                          type="text"
                          disabled
                          value={`${patient.age} años`}
                          className={`w-full px-2.5 py-1.5 rounded-lg border font-bold text-xs ${
                            patient.age < 15 || patient.age > 35 ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-slate-50 text-slate-700"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block flex items-center justify-between">
                          <span>Estado Civil</span>
                          {baselineData.civilStatus === "Soltera" && (
                            <span className="px-1 bg-amber-400 text-black font-extrabold text-[8px] rounded">ALERTA</span>
                          )}
                        </label>
                        <select
                          value={baselineData.civilStatus}
                          onChange={(e) => setBaselineData({ ...baselineData, civilStatus: e.target.value as any })}
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                            baselineData.civilStatus === "Soltera" ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-white"
                          }`}
                        >
                          <option value="Casada">Casada</option>
                          <option value="Conviviente">Conviviente</option>
                          <option value="Soltera">Soltera (Alerta)</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block flex items-center justify-between">
                          <span>Nivel de Estudios</span>
                          {(baselineData.educationLevel === "Analfabeta" || baselineData.educationLevel === "Primaria") && (
                            <span className="px-1 bg-amber-400 text-black font-extrabold text-[8px] rounded">ALERTA</span>
                          )}
                        </label>
                        <select
                          value={baselineData.educationLevel}
                          onChange={(e) => setBaselineData({ ...baselineData, educationLevel: e.target.value as any })}
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                            baselineData.educationLevel === "Analfabeta" || baselineData.educationLevel === "Primaria"
                              ? "bg-amber-100 border-amber-300 text-amber-900 font-bold"
                              : "bg-white"
                          }`}
                        >
                          <option value="Superior Univ">Superior Universitario</option>
                          <option value="Superior No Univ">Superior No Universitario</option>
                          <option value="Secundaria">Secundaria Completa</option>
                          <option value="Primaria">Primaria (Alerta)</option>
                          <option value="Analfabeta">Analfabeta (Alerta)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Tipo de Seguro</label>
                        <select
                          value={baselineData.insuranceType}
                          onChange={(e) => setBaselineData({ ...baselineData, insuranceType: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 rounded-lg border bg-white text-xs font-semibold"
                        >
                          <option value="PRIVADO">Privado / EPS / Particular</option>
                          <option value="ESSALUD">EsSalud</option>
                          <option value="SIS">SIS</option>
                          <option value="No Aplica">No Aplica</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Padre del RN (Nombre)</label>
                        <input
                          type="text"
                          value={baselineData.fatherName || ""}
                          onChange={(e) => setBaselineData({ ...baselineData, fatherName: e.target.value })}
                          placeholder="Nombres y Apellidos"
                          className="w-full px-2.5 py-1.5 rounded-lg border text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">DNI del Padre</label>
                        <input
                          type="text"
                          value={baselineData.fatherDni || ""}
                          onChange={(e) => setBaselineData({ ...baselineData, fatherDni: e.target.value })}
                          placeholder="8 dígitos"
                          className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bloque Diagrama de Antecedentes Obstétricos */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                      <div>
                        <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-primary">
                          2. Diagrama de Antecedentes Obstétricos (G_ P____)
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Matriz oficial de paridad y criterios de alerta (casillas amarillas y rojas)
                        </p>
                      </div>
                      <span className="font-mono font-extrabold text-slate-800 text-xs px-2 py-0.5 rounded bg-white border border-slate-300">
                        G{baselineData.gestas} P{baselineData.partosVaginales + baselineData.cesareas}{baselineData.abortos}{baselineData.nacidosVivos}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-center">
                      <div className={`p-2 rounded-xl border ${baselineData.gestas === 0 || baselineData.gestas >= 4 ? "bg-amber-100 border-amber-300 text-amber-950" : "bg-white border-slate-200"}`}>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Gestas</span>
                        <input
                          type="number"
                          value={baselineData.gestas}
                          onChange={(e) => setBaselineData({ ...baselineData, gestas: parseInt(e.target.value, 10) || 0 })}
                          className="w-full text-center text-sm font-extrabold border-0 bg-transparent py-1"
                        />
                        {baselineData.gestas >= 4 && <span className="text-[8px] font-bold text-amber-800 block">MULTÍPARA</span>}
                      </div>

                      <div className={`p-2 rounded-xl border ${baselineData.abortos > 0 ? (baselineData.abortos >= 3 ? "bg-red-100 border-red-300 text-red-950" : "bg-amber-100 border-amber-300 text-amber-950") : "bg-white border-slate-200"}`}>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Abortos</span>
                        <input
                          type="number"
                          value={baselineData.abortos}
                          onChange={(e) => setBaselineData({ ...baselineData, abortos: parseInt(e.target.value, 10) || 0 })}
                          className="w-full text-center text-sm font-extrabold border-0 bg-transparent py-1 text-red-600"
                        />
                        {baselineData.abortos > 0 && <span className="text-[8px] font-bold block">{baselineData.abortos >= 3 ? "ROJO (≥3)" : "ALERTA"}</span>}
                      </div>

                      <div className="p-2 rounded-xl border bg-white border-slate-200">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Vaginales</span>
                        <input
                          type="number"
                          value={baselineData.partosVaginales}
                          onChange={(e) => setBaselineData({ ...baselineData, partosVaginales: parseInt(e.target.value, 10) || 0 })}
                          className="w-full text-center text-sm font-extrabold border-0 bg-transparent py-1 text-slate-900"
                        />
                      </div>

                      <div className={`p-2 rounded-xl border ${baselineData.cesareas > 0 ? "bg-amber-100 border-amber-300 text-amber-950" : "bg-white border-slate-200"}`}>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Cesáreas</span>
                        <input
                          type="number"
                          value={baselineData.cesareas}
                          onChange={(e) => setBaselineData({ ...baselineData, cesareas: parseInt(e.target.value, 10) || 0 })}
                          className="w-full text-center text-sm font-extrabold border-0 bg-transparent py-1 text-amber-800"
                        />
                        {baselineData.cesareas > 0 && <span className="text-[8px] font-bold text-amber-800 block">ALERTA</span>}
                      </div>

                      <div className="p-2 rounded-xl border bg-white border-slate-200">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Nac. Vivos</span>
                        <input
                          type="number"
                          value={baselineData.nacidosVivos}
                          onChange={(e) => setBaselineData({ ...baselineData, nacidosVivos: parseInt(e.target.value, 10) || 0 })}
                          className="w-full text-center text-sm font-extrabold border-0 bg-transparent py-1 text-slate-900"
                        />
                      </div>

                      <div className={`p-2 rounded-xl border ${baselineData.nacidosMuertos > 0 ? "bg-amber-100 border-amber-300 text-amber-950" : "bg-white border-slate-200"}`}>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Nac. Muertos</span>
                        <input
                          type="number"
                          value={baselineData.nacidosMuertos}
                          onChange={(e) => setBaselineData({ ...baselineData, nacidosMuertos: parseInt(e.target.value, 10) || 0 })}
                          className="w-full text-center text-sm font-extrabold border-0 bg-transparent py-1"
                        />
                        {baselineData.nacidosMuertos > 0 && <span className="text-[8px] font-bold text-amber-800 block">ALERTA</span>}
                      </div>

                      <div className="p-2 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-950">
                        <span className="text-[9px] font-bold text-emerald-800 uppercase block">Viven</span>
                        <input
                          type="number"
                          value={baselineData.viven}
                          onChange={(e) => setBaselineData({ ...baselineData, viven: parseInt(e.target.value, 10) || 0 })}
                          className="w-full text-center text-sm font-extrabold border-0 bg-transparent py-1 text-emerald-700"
                        />
                      </div>
                    </div>

                    {/* Gestación Anterior Detalle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-200">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Terminación Anterior</label>
                        <select
                          value={baselineData.previousDeliveryType || "No Aplica"}
                          onChange={(e) => setBaselineData({ ...baselineData, previousDeliveryType: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 rounded-lg border bg-white text-xs"
                        >
                          <option value="No Aplica">No Aplica / Primigesta</option>
                          <option value="Parto Vaginal">Parto Vaginal</option>
                          <option value="Cesárea">Cesárea (Alerta)</option>
                          <option value="Aborto">Aborto (Alerta)</option>
                          <option value="Ectópico">Ectópico (Alerta)</option>
                          <option value="Molar">Molar (Alerta)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Tipo de Aborto</label>
                        <select
                          value={baselineData.previousAbortionType || "No Aplica"}
                          onChange={(e) => setBaselineData({ ...baselineData, previousAbortionType: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 rounded-lg border bg-white text-xs"
                        >
                          <option value="No Aplica">No Aplica</option>
                          <option value="Completo">Completo</option>
                          <option value="Incompleto">Incompleto</option>
                          <option value="Frustro/Retenido">Frustro / Retenido (Alerta)</option>
                          <option value="Séptico">Séptico (Alerta)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Lactancia Materna Previa</label>
                        <select
                          value={baselineData.breastfeedingMonths || "No hubo"}
                          onChange={(e) => setBaselineData({ ...baselineData, breastfeedingMonths: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 rounded-lg border bg-white text-xs"
                        >
                          <option value="6 meses o más">6 meses o más</option>
                          <option value="< 6 meses">&lt; 6 meses (Alerta)</option>
                          <option value="no hubo">No hubo (Seguimiento)</option>
                          <option value="No aplica">No aplica</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">RN Mayor Peso (g)</label>
                        <input
                          type="number"
                          value={baselineData.rnMayorPesoGramos || ""}
                          onChange={(e) => setBaselineData({ ...baselineData, rnMayorPesoGramos: parseInt(e.target.value, 10) || 0 })}
                          placeholder="ej. 3400"
                          className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 2: ANTECEDENTES FAMILIARES, PERSONALES, VACUNAS & SOMATOMETRÍA */}
              {baselineSubTab === "sec2" && (
                <div className="space-y-4">
                  {/* Antecedentes Familiares */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-primary block">
                      Antecedentes Familiares (Marcar condiciones presentes en familiares directos):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {STANDARD_FAMILY_HISTORY.map((item) => {
                        const isSelected = baselineData.familyHistory?.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleFamilyHistory(item)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {isSelected ? "✓ " : ""}{item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Antecedentes Personales Patológicos */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-primary block">
                      Antecedentes Personales (Criterios de Alerta Amarilla y Seguimiento Rojo):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {STANDARD_PERSONAL_HISTORY.map((item) => {
                        const isSelected = baselineData.personalHistory?.includes(item.label);
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => togglePersonalHistory(item.label)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? item.risk === "red"
                                  ? "bg-red-100 text-red-900 border border-red-300 font-bold shadow-2xs"
                                  : "bg-amber-100 text-amber-900 border border-amber-300 font-bold shadow-2xs"
                                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {isSelected ? "✓ " : ""}{item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vacunas Previas & Antitetánica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-slate-800 block">
                        Vacunas Previas
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={baselineData.previousVaccines?.rubella}
                            onChange={(e) =>
                              setBaselineData({
                                ...baselineData,
                                previousVaccines: { ...baselineData.previousVaccines, rubella: e.target.checked },
                              })
                            }
                            className="rounded text-primary"
                          />
                          <span>Rubeola</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={baselineData.previousVaccines?.hepatitisB}
                            onChange={(e) =>
                              setBaselineData({
                                ...baselineData,
                                previousVaccines: { ...baselineData.previousVaccines, hepatitisB: e.target.checked },
                              })
                            }
                            className="rounded text-primary"
                          />
                          <span>Hepatitis B</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={baselineData.previousVaccines?.hpv}
                            onChange={(e) =>
                              setBaselineData({
                                ...baselineData,
                                previousVaccines: { ...baselineData.previousVaccines, hpv: e.target.checked },
                              })
                            }
                            className="rounded text-primary"
                          />
                          <span>Papiloma Virus (VPH)</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={baselineData.previousVaccines?.yellowFever}
                            onChange={(e) =>
                              setBaselineData({
                                ...baselineData,
                                previousVaccines: { ...baselineData.previousVaccines, yellowFever: e.target.checked },
                              })
                            }
                            className="rounded text-primary"
                          />
                          <span>Fiebre Amarilla</span>
                        </label>
                      </div>
                    </div>

                    {/* Somatometría & Grupo Rh */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                      <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-slate-800 block">
                        Somatometría & Tipo de Sangre
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">
                            Peso Habitual (kg) {baselineData.usualWeightKg < 45 && <span className="text-amber-800">(Alerta)</span>}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={baselineData.usualWeightKg}
                            onChange={(e) => setBaselineData({ ...baselineData, usualWeightKg: parseFloat(e.target.value) || 0 })}
                            className={`w-full px-2.5 py-1.5 rounded-lg border font-mono text-xs ${
                              baselineData.usualWeightKg < 45 ? "bg-amber-100 border-amber-300 text-amber-900 font-bold" : ""
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">
                            Talla (cm) {baselineData.heightCm < 150 && <span className="text-amber-800">(Alerta)</span>}
                          </label>
                          <input
                            type="number"
                            value={baselineData.heightCm}
                            onChange={(e) => setBaselineData({ ...baselineData, heightCm: parseInt(e.target.value, 10) || 0 })}
                            className={`w-full px-2.5 py-1.5 rounded-lg border font-mono text-xs ${
                              baselineData.heightCm < 150 ? "bg-amber-100 border-amber-300 text-amber-900 font-bold" : ""
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">Grupo Sanguíneo</label>
                          <select
                            value={baselineData.bloodGroup}
                            onChange={(e) => setBaselineData({ ...baselineData, bloodGroup: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold bg-white"
                          >
                            <option value="O">Grupo O</option>
                            <option value="A">Grupo A</option>
                            <option value="B">Grupo B</option>
                            <option value="AB">Grupo AB</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">Factor Rh</label>
                          <select
                            value={baselineData.rhFactor}
                            onChange={(e) => setBaselineData({ ...baselineData, rhFactor: e.target.value })}
                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                              baselineData.rhFactor.includes("Sensibilizada") && !baselineData.rhFactor.includes("No")
                                ? "bg-red-100 border-red-300 text-red-900"
                                : baselineData.rhFactor.includes("Rh (-)")
                                ? "bg-amber-100 border-amber-300 text-amber-900"
                                : "bg-white"
                            }`}
                          >
                            <option value="Rh (+)">Rh (+)</option>
                            <option value="Rh (-) No Sensibilizada">Rh (-) No Sensibilizada (Alerta)</option>
                            <option value="Rh (-) Sensibilizada">Rh (-) Sensibilizada (Seguimiento)</option>
                            <option value="Rh (-) Desconocida">Rh (-) Desconocida</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 3: EMBARAZO ACTUAL, FUM, NAEGELE & COMPLICACIONES */}
              {baselineSubTab === "sec3" && (
                <div className="space-y-4">
                  {/* FUM y Regla de Naegele */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b pb-2 border-amber-200">
                      <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-700" />
                        Cálculo de Edad Gestacional & Regla de Naegele (FUM + 7 días + 9 meses)
                      </span>
                      <span className="text-xs text-amber-900 font-mono font-bold">
                        Duración: 280 días (40 semanas)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block">
                          FUM (Última Regla) *
                        </label>
                        <input
                          type="date"
                          value={baselineData.fum}
                          onChange={(e) => handleFumChange(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs"
                        />
                      </div>

                      <div className="flex items-center pt-4">
                        <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer ${
                          baselineData.fumDoubt ? "bg-amber-100 border-amber-300 text-amber-950 font-bold" : "bg-white border-slate-200"
                        }`}>
                          <input
                            type="checkbox"
                            checked={baselineData.fumDoubt}
                            onChange={(e) => setBaselineData({ ...baselineData, fumDoubt: e.target.checked })}
                            className="rounded text-amber-600"
                          />
                          <span>¿FUM Dudosa? (Alerta)</span>
                        </label>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block">
                          Edad Gestacional Actual
                        </label>
                        <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-mono font-bold text-primary text-xs">
                          {currentGestAge.formatted} ({currentGestAge.totalDays} d amenorrea)
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block">
                          FPP (Regla de Naegele)
                        </label>
                        <div className="px-3 py-1.5 rounded-lg bg-primary text-white font-mono font-extrabold text-xs">
                          {baselineData.fpp || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Ecografía Precoz */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-amber-200/60">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block">
                          EG por Ecografía Precoz de I Trimestre (Semanas)
                        </label>
                        <input
                          type="number"
                          value={baselineData.ultrasoundGestationalAgeWeeks || ""}
                          onChange={(e) => setBaselineData({ ...baselineData, ultrasoundGestationalAgeWeeks: parseInt(e.target.value, 10) || undefined })}
                          placeholder="ej. 8 semanas"
                          className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block">
                          Fecha de la Ecografía Precoz
                        </label>
                        <input
                          type="date"
                          value={baselineData.ultrasoundDate || ""}
                          onChange={(e) => setBaselineData({ ...baselineData, ultrasoundDate: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hospitalización y Emergencia */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                      <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-slate-800 block">
                        Hospitalización durante la Gestación
                      </span>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer font-bold">
                          <input
                            type="checkbox"
                            checked={Boolean(baselineData.hospitalizationHistory?.diagnosis)}
                            onChange={(e) => {
                              if (!e.target.checked) {
                                setBaselineData({ ...baselineData, hospitalizationHistory: undefined });
                              } else {
                                setBaselineData({
                                  ...baselineData,
                                  hospitalizationHistory: { date: todayStr, diagnosis: "Hiperémesis gravídica", cie10: "O21.0" },
                                });
                              }
                            }}
                            className="rounded text-amber-600"
                          />
                          <span>¿Requirió Hospitalización? (Alerta)</span>
                        </label>
                        {baselineData.hospitalizationHistory && (
                          <div className="space-y-1.5 pl-5 pt-1 border-l-2 border-amber-300">
                            <input
                              type="text"
                              value={baselineData.hospitalizationHistory.diagnosis || ""}
                              onChange={(e) =>
                                setBaselineData({
                                  ...baselineData,
                                  hospitalizationHistory: { ...baselineData.hospitalizationHistory, diagnosis: e.target.value },
                                })
                              }
                              placeholder="Diagnóstico de hospitalización"
                              className="w-full px-2.5 py-1 rounded border text-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                      <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-slate-800 block">
                        Atención de Emergencia
                      </span>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer font-bold">
                          <input
                            type="checkbox"
                            checked={Boolean(baselineData.emergencyHistory?.diagnosis)}
                            onChange={(e) => {
                              if (!e.target.checked) {
                                setBaselineData({ ...baselineData, emergencyHistory: undefined });
                              } else {
                                setBaselineData({
                                  ...baselineData,
                                  emergencyHistory: { date: todayStr, diagnosis: "Amenaza de aborto / Sangrado", cie10: "O20.0" },
                                });
                              }
                            }}
                            className="rounded text-amber-600"
                          />
                          <span>¿Acudió por Emergencia?</span>
                        </label>
                        {baselineData.emergencyHistory && (
                          <div className="space-y-1.5 pl-5 pt-1 border-l-2 border-amber-300">
                            <input
                              type="text"
                              value={baselineData.emergencyHistory.diagnosis || ""}
                              onChange={(e) =>
                                setBaselineData({
                                  ...baselineData,
                                  emergencyHistory: { ...baselineData.emergencyHistory, diagnosis: e.target.value },
                                })
                              }
                              placeholder="Motivo de consulta en emergencia"
                              className="w-full px-2.5 py-1 rounded border text-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 4: EXAMEN FÍSICO BASAL & MATRIZ DE LABORATORIOS */}
              {baselineSubTab === "sec4" && (
                <div className="space-y-4">
                  {/* Examen Físico Basal */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-primary block">
                      Examen Físico Basal (MINSA)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                      {[
                        { key: "clinicalExam", label: "Clínico General" },
                        { key: "breastsExam", label: "Mamas" },
                        { key: "cervixExam", label: "Cuello Uterino" },
                        { key: "pelvisExam", label: "Pelvis" },
                        { key: "dentalExam", label: "Odontológico" },
                      ].map((item) => (
                        <div key={item.key} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 block">{item.label}</label>
                          <select
                            value={(baselineData as any)[item.key] || "Normal"}
                            onChange={(e) => setBaselineData({ ...baselineData, [item.key]: e.target.value })}
                            className={`w-full px-2 py-1 rounded border text-xs font-bold ${
                              (baselineData as any)[item.key] === "Patológico" || (baselineData as any)[item.key] === "Anormal"
                                ? "bg-amber-100 border-amber-300 text-amber-900"
                                : "bg-white"
                            }`}
                          >
                            <option value="Normal">Normal</option>
                            <option value="Patológico">Patológico (Alerta)</option>
                            <option value="Sin Examen">Sin Examen</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matriz de Exámenes de Laboratorio */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-primary block">
                      Matriz de Tamizaje Laboratorio (1º Trimestre - Norma Técnica MINSA)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      {/* Hemoglobina */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-700 uppercase block flex items-center justify-between">
                          <span>Hemoglobina 1 (g/dL)</span>
                          {baselineData.hemoglobin1 && baselineData.hemoglobin1 < 11 && (
                            <span className="text-[8px] px-1 bg-amber-400 text-black font-extrabold rounded">ANEMIA</span>
                          )}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            value={baselineData.hemoglobin1 || ""}
                            onChange={(e) => setBaselineData({ ...baselineData, hemoglobin1: parseFloat(e.target.value) || undefined })}
                            placeholder="12.0"
                            className="w-20 px-2 py-1 rounded border font-mono font-bold text-xs bg-white"
                          />
                          <input
                            type="date"
                            value={baselineData.hemoglobin1Date || ""}
                            onChange={(e) => setBaselineData({ ...baselineData, hemoglobin1Date: e.target.value })}
                            className="flex-1 px-2 py-1 rounded border text-[11px] font-mono bg-white"
                          />
                        </div>
                      </div>

                      {/* Glicemia */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-700 uppercase block flex items-center justify-between">
                          <span>Glucosa Basal (mg/dL)</span>
                          {baselineData.bloodGlucose1 && baselineData.bloodGlucose1 >= 92 && (
                            <span className="text-[8px] px-1 bg-amber-400 text-black font-extrabold rounded">DG (≥92)</span>
                          )}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={baselineData.bloodGlucose1 || ""}
                            onChange={(e) => setBaselineData({ ...baselineData, bloodGlucose1: parseInt(e.target.value, 10) || undefined })}
                            placeholder="85"
                            className="w-20 px-2 py-1 rounded border font-mono font-bold text-xs bg-white"
                          />
                          <input
                            type="date"
                            value={baselineData.bloodGlucose1Date || ""}
                            onChange={(e) => setBaselineData({ ...baselineData, bloodGlucose1Date: e.target.value })}
                            className="flex-1 px-2 py-1 rounded border text-[11px] font-mono bg-white"
                          />
                        </div>
                      </div>

                      {/* VDRL / Sífilis */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-700 uppercase block flex items-center justify-between">
                          <span>Tamizaje Sífilis (VDRL / RPR)</span>
                          {baselineData.vdrlRpr1 === "Reactivo" && (
                            <span className="text-[8px] px-1 bg-red-500 text-white font-extrabold rounded">ROJO</span>
                          )}
                        </label>
                        <select
                          value={baselineData.vdrlRpr1 || "No reactivo"}
                          onChange={(e) => setBaselineData({ ...baselineData, vdrlRpr1: e.target.value })}
                          className={`w-full px-2 py-1 rounded border text-xs font-bold ${
                            baselineData.vdrlRpr1 === "Reactivo" ? "bg-red-100 border-red-300 text-red-900" : "bg-white"
                          }`}
                        >
                          <option value="No reactivo">No reactivo</option>
                          <option value="Reactivo">Reactivo (Seguimiento Rojo)</option>
                          <option value="No se hizo">No se hizo</option>
                        </select>
                      </div>

                      {/* VIH */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-700 uppercase block flex items-center justify-between">
                          <span>Tamizaje VIH (Prueba Rápida / ELISA)</span>
                          {baselineData.hivScreening1 === "Positivo" && (
                            <span className="text-[8px] px-1 bg-red-500 text-white font-extrabold rounded">ROJO</span>
                          )}
                        </label>
                        <select
                          value={baselineData.hivScreening1 || "Negativo"}
                          onChange={(e) => setBaselineData({ ...baselineData, hivScreening1: e.target.value })}
                          className={`w-full px-2 py-1 rounded border text-xs font-bold ${
                            baselineData.hivScreening1 === "Positivo" ? "bg-red-100 border-red-300 text-red-900" : "bg-white"
                          }`}
                        >
                          <option value="Negativo">Negativo</option>
                          <option value="Positivo">Positivo (Seguimiento Rojo)</option>
                          <option value="No se hizo">No se hizo</option>
                        </select>
                      </div>

                      {/* Hepatitis B */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-700 uppercase block flex items-center justify-between">
                          <span>Hepatitis B (HBsAg)</span>
                          {baselineData.hepatitisBScreening === "Positivo" && (
                            <span className="text-[8px] px-1 bg-red-500 text-white font-extrabold rounded">ROJO</span>
                          )}
                        </label>
                        <select
                          value={baselineData.hepatitisBScreening || "Negativo"}
                          onChange={(e) => setBaselineData({ ...baselineData, hepatitisBScreening: e.target.value })}
                          className={`w-full px-2 py-1 rounded border text-xs font-bold ${
                            baselineData.hepatitisBScreening === "Positivo" ? "bg-red-100 border-red-300 text-red-900" : "bg-white"
                          }`}
                        >
                          <option value="Negativo">Negativo</option>
                          <option value="Positivo">Positivo (Seguimiento Rojo)</option>
                          <option value="No se hizo">No se hizo</option>
                        </select>
                      </div>

                      {/* Examen de Orina / Urocultivo */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-700 uppercase block flex items-center justify-between">
                          <span>Ex. Orina / Urocultivo</span>
                          {baselineData.completeUrineExam === "Patológico" && (
                            <span className="text-[8px] px-1 bg-amber-400 text-black font-extrabold rounded">ALERTA</span>
                          )}
                        </label>
                        <select
                          value={baselineData.completeUrineExam || "Normal"}
                          onChange={(e) => setBaselineData({ ...baselineData, completeUrineExam: e.target.value })}
                          className={`w-full px-2 py-1 rounded border text-xs font-bold ${
                            baselineData.completeUrineExam === "Patológico" ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white"
                          }`}
                        >
                          <option value="Normal">Normal</option>
                          <option value="Patológico">Patológico (Alerta)</option>
                          <option value="No se hizo">No se hizo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              PESTAÑA 2: MATRIZ DE 9 ATENCIONES PRENATALES
              ========================================================================= */}
          {activeTab === "visits" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-slate-900">
                    Control Longitudinal de Atenciones Prenatales (Norma Técnica MINSA)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registre las medidas antropométricas, fetales y de laboratorio en cada visita periódica.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuickVisit}
                  disabled={visitsList.length >= 9}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Registrar Atención N° {visitsList.length + 1}</span>
                </button>
              </div>

              {/* Tabla de Matriz */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                        <th className="p-3 w-44">Parámetro Clínico</th>
                        {Array.from({ length: 9 }).map((_, idx) => (
                          <th
                            key={idx}
                            className={`p-3 text-center min-w-[110px] border-l border-slate-200 ${
                              idx < visitsList.length ? "bg-primary/10 text-primary font-extrabold" : "text-slate-400"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>Atención {idx + 1}</span>
                              {idx < visitsList.length && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVisit(idx)}
                                  className="text-slate-400 hover:text-red-600 transition-colors"
                                  title="Eliminar atención"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
                      {/* Fecha */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Fecha de Atención</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-l border-slate-100 font-mono">
                              {v ? (
                                <input
                                  type="date"
                                  value={v.visitDate}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].visitDate = e.target.value;
                                    setVisitsList(updated);
                                  }}
                                  className="text-xs text-center border rounded px-1 py-0.5 w-24 font-mono"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Edad Gestacional */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Edad Gestacional</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-l border-slate-100 font-mono">
                              {v ? (
                                <span className="font-bold text-primary">
                                  {v.gestationalAgeWeeks}s {v.gestationalAgeDays}d
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Peso Materno */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Peso Materno (kg)</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-l border-slate-100 font-mono">
                              {v ? (
                                <input
                                  type="number"
                                  step="0.1"
                                  value={v.maternalWeightKg}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].maternalWeightKg = parseFloat(e.target.value) || 0;
                                    setVisitsList(updated);
                                  }}
                                  className="w-14 text-center border rounded py-0.5 text-xs font-mono"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Presión Arterial */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Presión Arterial</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-l border-slate-100 font-mono">
                              {v ? (
                                <input
                                  type="text"
                                  value={v.bloodPressure}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].bloodPressure = e.target.value;
                                    setVisitsList(updated);
                                  }}
                                  className="w-16 text-center border rounded py-0.5 text-xs font-bold font-mono"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Altura Uterina */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Altura Uterina (cm)</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-l border-slate-100 font-mono">
                              {v ? (
                                <input
                                  type="number"
                                  value={v.uterineHeightCm}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].uterineHeightCm = parseInt(e.target.value, 10) || 0;
                                    setVisitsList(updated);
                                  }}
                                  className="w-12 text-center border rounded py-0.5 text-xs font-mono"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* FCF (Latidos/min) */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">F.C.F. Fetal (lpm)</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          const isFcfAbnormal = v && v.fetalHeartRate > 0 && (v.fetalHeartRate < 120 || v.fetalHeartRate > 160);
                          return (
                            <td key={idx} className="p-2 text-center border-l border-slate-100 font-mono">
                              {v ? (
                                <input
                                  type="number"
                                  value={v.fetalHeartRate || ""}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].fetalHeartRate = parseInt(e.target.value, 10) || 0;
                                    setVisitsList(updated);
                                  }}
                                  className={`w-14 text-center border rounded py-0.5 text-xs font-mono font-bold ${
                                    isFcfAbnormal ? "bg-red-100 text-red-900 border-red-300" : "text-emerald-700"
                                  }`}
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Movimientos Fetales */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Movimientos Fetales</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-l border-slate-100">
                              {v ? (
                                <select
                                  value={v.fetalMovements || "NA"}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].fetalMovements = e.target.value as any;
                                    setVisitsList(updated);
                                  }}
                                  className="px-1 py-0.5 border rounded text-xs bg-white font-bold"
                                >
                                  <option value="NA">NA</option>
                                  <option value="+">+</option>
                                  <option value="++">++</option>
                                  <option value="+++">+++</option>
                                  <option value="SM">SM</option>
                                </select>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Próxima Cita */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Próxima Cita</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-l border-slate-100 font-mono">
                              {v ? (
                                <input
                                  type="date"
                                  value={v.nextAppointmentDate}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].nextAppointmentDate = e.target.value;
                                    setVisitsList(updated);
                                  }}
                                  className="text-[11px] text-center border rounded px-1 py-0.5 w-24 font-mono font-bold text-primary"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              PESTAÑA 3: ALERTAS DE RIESGO OBSTÉTRICO (ARO)
              ========================================================================= */}
          {activeTab === "risks" && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  risksReport.isHighRisk
                    ? "bg-red-50 border-red-300 text-red-950"
                    : "bg-emerald-50 border-emerald-300 text-emerald-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-6 h-6 ${risksReport.isHighRisk ? "text-red-600" : "text-emerald-600"}`} />
                  <div>
                    <h3 className="font-heading font-extrabold text-sm">
                      {risksReport.riskCategory}
                    </h3>
                    <p className="text-xs">
                      {risksReport.isHighRisk
                        ? "Se detectaron factores clínicos que requieren vigilancia obstétrica estrecha y plan de parto especializado."
                        : "Embarazo de bajo riesgo sin factores clínicos de alarma detectados."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de Criterios de Alerta */}
              <div className="space-y-2">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-700">
                  Criterios de Vigilancia Evaluados en esta Gestante:
                </h4>
                {risksReport.warningFlags.length > 0 ? (
                  risksReport.warningFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-2 text-xs text-amber-950"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <strong>{flag}</strong>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No hay factores de riesgo activos.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Pie de Acciones */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600 font-mono">
            Médico: <strong>{doctorProfile.doctorTitle} {doctorProfile.fullName}</strong> &bull; CMP {doctorProfile.cmp} &bull; RNE {doctorProfile.rne}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSaveCard}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Guardar Carnet Prenatal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
