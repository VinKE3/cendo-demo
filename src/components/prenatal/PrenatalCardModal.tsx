"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  X,
  Baby,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  FileText,
  Activity,
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
import { CLINIC_DOCTORS, parseObstetricFormula } from "./prenatalHelpers";

import { Section1Filiacion } from "./sections/Section1Filiacion";
import { Section2Obstetricos } from "./sections/Section2Obstetricos";
import { Section3GestacionAnt } from "./sections/Section3GestacionAnt";
import { Section4Familiares } from "./sections/Section4Familiares";
import { Section5Personales } from "./sections/Section5Personales";
import { Section6Inmunizaciones } from "./sections/Section6Inmunizaciones";
import { Section7EmbarazoActual } from "./sections/Section7EmbarazoActual";
import { Section8ExamenFisico } from "./sections/Section8ExamenFisico";
import { Section9Laboratorio } from "./sections/Section9Laboratorio";
import { TabConsultasMatriz } from "./sections/TabConsultasMatriz";
import { TabRiesgoAro } from "./sections/TabRiesgoAro";

interface PrenatalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onPrintRequested?: (card: PrenatalCard) => void;
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

  // Médico y fecha de procedimiento
  const [procedureDate, setProcedureDate] = useState(todayStr);
  const [attendingDoctor, setAttendingDoctor] = useState("PATRICK JOSE JACINTO GOMERO");
  const [clinicEstablishment, setClinicEstablishment] = useState("CENDO - Especialidades Gineco-Obstétricas Miraflores");

  // Estado de los acordeones desplegables
  const [openSections, setOpenSections] = useState({
    filiacion: false,
    obstetricos: false,
    gestacionAnterior: false,
    antecedentesFamiliares: false,
    antecedentesPersonales: false,
    vacunas: false,
    embarazo: false,
    examenFisico: false,
    laboratorio: true, // Sección 9 desplegada por defecto
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
    viven: 0,
    nacidosMuertos: 0,
    deadAfterFirstWeek: 0,
    familyHistory: ["Ninguno"],
    familyHistoryDetails: {},
    familyHistoryOther: "",
    personalHistory: ["Ninguno"],
    personalHistoryDetails: {},
    personalHistoryOther: "",
    previousVaccines: { rubella: true, hepatitisB: true, hpv: true, yellowFever: true },
    antitetanicaDosis: "2da",
    antitetanicaPrevDoses: 1,
    antitetanica1stDoseMonth: "4to mes",
    antitetanica2ndDoseMonth: "6to mes",
    antitetanicaStatus: "Vacunada",
    usualWeightKg: 58,
    heightCm: 162,
    bloodGroup: "O",
    rhFactor: "Rh (+)",
    smokerCigarettesDay: 0,
    drugsUse: false,
    alcoholUse: false,
    fum: "2026-09-26",
    fumDoubt: false,
    ultrasoundGestationalAgeWeeks: 7,
    ultrasoundDate: "2026-10-15",
    ultrasoundNoApplies: false,
    fpp: calculateNaegeleFPP("2026-09-26"),
    hospitalized: false,
    hospitalizationHistory: { date: "", diagnosis: "", cie10: "" },
    hadEmergency: false,
    emergencyHistory: { date: "", diagnosis: "", cie10: "" },
    violenceScreening: { screeningDone: true, violenceDetected: false, date: "2026-10-15" },
    clinicalExam: "Normal",
    clinicalExamDetail: "",
    breastsExam: "Normal",
    breastsExamDetail: "",
    cervixExam: "Normal",
    cervixExamDetail: "",
    pelvisExam: "Normal",
    pelvisExamDetail: "",
    dentalExam: "Normal",
    dentalExamDetail: "",

    // EXÁMENES DE LABORATORIO
    hemoglobin1: 12.4,
    hemoglobin1Date: "2026-10-15",
    hemoglobin1NotDone: false,
    hemoglobin2: 12.2,
    hemoglobin2Date: "2027-01-15",
    hemoglobin2NotDone: false,
    hemoglobinDischarge: 12.0,
    hemoglobinDischargeDate: "",
    hemoglobinDischargeNotDone: true,

    bloodGlucose1: 84,
    bloodGlucose1Date: "2026-10-15",
    glucose1Result: "Normal",
    glucose1Date: "2026-10-15",
    glucose1Value: 84,
    glucose2Result: "Normal",
    glucose2Date: "2027-01-15",
    glucose2Value: 86,
    glucoseToleranceResult: "No se Aplica",
    glucoseToleranceDate: "",
    glucoseToleranceValue: undefined,

    vdrlRpr1: "No reactivo",
    vdrlRpr1Date: "2026-10-15",
    vdrlRpr1Result: "No reactivo",
    vdrlRpr2Result: "No se Aplica",
    vdrlRpr2Date: "",
    ftaAbsResult: "No se Aplica",
    ftaAbsDate: "",
    tphaResult: "No se Aplica",
    tphaDate: "",
    rapidSyphilisResult: "No reactivo",
    rapidSyphilisDate: "2026-10-15",
    hivScreening1: "Negativo",
    hivScreening1Date: "2026-10-15",
    hivRapid1Result: "No reactivo",
    hivRapid1Date: "2026-10-15",
    hivRapid2Result: "No se Aplica",
    hivRapid2Date: "",
    hivElisaResult: "No se Aplica",
    hivElisaDate: "",

    westernBlotResult: "No se Aplica",
    westernBlotDate: "",
    htlv1Result: "Negativo",
    htlv1Date: "2026-10-15",
    torchResult: "No se Aplica",
    torchDate: "",
    thickBloodSmearResult: "No se Aplica",
    thickBloodSmearDate: "",
    malariaRapidResult: "No se Aplica",
    malariaRapidDate: "",
    malariaFluorescenceResult: "No se Aplica",
    malariaFluorescenceDate: "",

    completeUrineExam: "Normal",
    completeUrineExamDate: "2026-10-15",
    completeUrineExamResult: "Negativo",
    leukocyturiaResult: "Negativo",
    nitritesResult: "Negativo",
    nitritesDate: "2026-10-15",
    urineCulture: "Negativo",
    urineCultureResult: "Negativo",
    urineCultureDate: "2026-10-15",
    bkSputumResult: "No se Aplica",
    bkSputumDate: "",
    listeriaResult: "No se Aplica",
    listeriaDate: "",
    hepatitisBScreening: "Negativo",
    hepatitisBScreeningDate: "2026-10-15",
    hepatitisBResult: "Negativo",
    hepatitisBDate: "2026-10-15",

    papTestResult: "Normal",
    papTestDate: "2026-10-15",
    ivaaResult: "No se Aplica",
    ivaaDate: "",
    colposcopyResult: "No se Aplica",
    colposcopyDate: "",
  });

  const [visitsList, setVisitsList] = useState<PrenatalVisitItem[]>([]);

  // Sincronización inteligente de datos desde la HC
  const autoFillFromPatientAndBackground = (showToast = false) => {
    const bg = getBackground(patient.id);
    const formula = parseObstetricFormula(bg?.obstetricFormula);
    const fum = bg?.lastMenstrualPeriod || baselineData.fum || "2026-09-26";
    const fpp = calculateNaegeleFPP(fum);

    const validCivilStatus: "Soltera" | "Casada" | "Conviviente" | "Otro" =
      patient.civilStatus === "Casada" || patient.civilStatus === "Conviviente" || patient.civilStatus === "Soltera"
        ? patient.civilStatus
        : "Soltera";

    const initialFamilyHistory: string[] = [];
    const initialFamilyDetails: Record<string, string> = {};
    if (bg?.hasDiabetes === "Sí") {
      initialFamilyHistory.push("Diabetes");
      initialFamilyDetails["Diabetes"] = "Madre";
    }
    if (bg?.hasHypertension === "Sí") {
      initialFamilyHistory.push("Hipertención Arterial");
      initialFamilyDetails["Hipertención Arterial"] = "Padre";
    }

    const initialPersonalHistory: string[] = [];
    const initialPersonalDetails: Record<string, string> = {};
    if (bg?.hasAsthma === "Sí") {
      initialPersonalHistory.push("Asma Bronquial");
      initialPersonalDetails["Asma Bronquial"] = "Asma controlada";
    }
    if (bg?.medicalAllergies && bg.medicalAllergies.trim().length > 0 && !bg.medicalAllergies.toLowerCase().includes("niega")) {
      initialPersonalHistory.push("Alergia medicamentos");
      initialPersonalDetails["Alergia medicamentos"] = bg.medicalAllergies;
    }

    setBaselineData((prev) => ({
      ...prev,
      patientAddress: patient.address || prev.patientAddress,
      patientPhone: patient.phone || prev.patientPhone,
      patientEmail: patient.email || prev.patientEmail,
      patientOccupation: patient.occupation || prev.patientOccupation,
      civilStatus: validCivilStatus,
      gestas: formula.gestas,
      abortos: formula.abortos,
      partosVaginales: formula.partosVaginales,
      cesareas: formula.cesareas,
      nacidosVivos: formula.nacidosVivos,
      viven: formula.viven,
      familyHistory:
        prev.familyHistory && prev.familyHistory.length > 0 && prev.familyHistory[0] !== "Ninguno"
          ? prev.familyHistory
          : initialFamilyHistory.length > 0
          ? initialFamilyHistory
          : ["Ninguno"],
      familyHistoryDetails:
        prev.familyHistoryDetails && Object.keys(prev.familyHistoryDetails).length > 0
          ? prev.familyHistoryDetails
          : initialFamilyDetails,
      personalHistory:
        prev.personalHistory && prev.personalHistory.length > 0 && prev.personalHistory[0] !== "Ninguno"
          ? prev.personalHistory
          : initialPersonalHistory.length > 0
          ? initialPersonalHistory
          : ["Ninguno"],
      personalHistoryDetails:
        prev.personalHistoryDetails && Object.keys(prev.personalHistoryDetails).length > 0
          ? prev.personalHistoryDetails
          : initialPersonalDetails,
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

  // Tab principal activa: "basal" | "consultas" | "aro"
  const [activeMainTab, setActiveMainTab] = useState<"basal" | "consultas" | "aro">("basal");

  // Drawer / Resumen de Antecedentes de HC
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Cálculos reactivos generales
  const currentGestAge = calculateGestationalAge(baselineData.fum, procedureDate || todayStr);
  const risksReport = evaluatePrenatalRisks(
    baselineData,
    patientAge,
    visitsList
  );

  const isAgeRisk = patientAge < 15 || patientAge > 35;
  const totalPartos = (baselineData.partosVaginales || 0) + (baselineData.cesareas || 0);
  const isParityRisk = totalPartos === 0 || totalPartos >= 4;

  // Somatometría & IMC Basal (Sección 6)
  const heightInMeters = (baselineData.heightCm || 160) / 100;
  const basalImc =
    baselineData.usualWeightKg && heightInMeters > 0
      ? (baselineData.usualWeightKg / (heightInMeters * heightInMeters)).toFixed(1)
      : null;
  const basalImcNum = basalImc ? parseFloat(basalImc) : 0;
  const isBasalUnderweight = basalImcNum > 0 && basalImcNum < 18.5;
  const isBasalOverweight = basalImcNum >= 25.0 && basalImcNum < 30.0;
  const isBasalObesity = basalImcNum >= 30.0;
  const isImcAlert = isBasalUnderweight || isBasalOverweight || isBasalObesity;

  // Alertas de Inmunizaciones, Grupo/Rh y Hábitos (Sección 6)
  const isRhContinuousRisk = baselineData.rhFactor === "Rh (-) Sensibilizada";
  const isRhAlertRisk =
    baselineData.rhFactor === "Rh (-) No Sensibilizada" ||
    baselineData.rhFactor === "Rh (-) Desconocida";
  const isDrugsContinuousRisk = baselineData.drugsUse === true;
  const isSmokerAlertRisk = (baselineData.smokerCigarettesDay || 0) > 0;
  const isAntitetanicaAlertRisk = baselineData.antitetanicaStatus === "Sin dosis";

  const section6ContinuousCount = (isRhContinuousRisk ? 1 : 0) + (isDrugsContinuousRisk ? 1 : 0);
  const section6AlertsCount =
    (isRhAlertRisk ? 1 : 0) +
    (isSmokerAlertRisk ? 1 : 0) +
    (isAntitetanicaAlertRisk ? 1 : 0) +
    (isImcAlert ? 1 : 0);

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

  // Agregar nueva atención prenatal a la matriz longitudinal
  const handleAddQuickVisit = () => {
    if (visitsList.length >= 9) {
      Swal.fire({
        icon: "info",
        title: "Límite de Atenciones Alcanzado",
        text: "El carnet oficial MINSA contempla un máximo de 9 atenciones prenatales.",
      });
      return;
    }

    const nextVisitNum = visitsList.length + 1;
    const gestAgeAtVisit = calculateGestationalAge(baselineData.fum, procedureDate || todayStr);

    const nextAppt = new Date();
    nextAppt.setDate(nextAppt.getDate() + 28);
    const nextApptStr = nextAppt.toISOString().split("T")[0];

    const newVisit: PrenatalVisitItem = {
      visitNumber: nextVisitNum,
      visitDate: procedureDate || todayStr,
      visitTime: "11:00",
      gestationalAgeWeeks: gestAgeAtVisit.weeks,
      gestationalAgeDays: gestAgeAtVisit.days,
      maternalWeightKg: baselineData.usualWeightKg || 0,
      temperature: 36.5,
      bloodPressure: "110/70",
      maternalPulse: 76,
      uterineHeightCm: gestAgeAtVisit.weeks >= 13 ? Math.max(gestAgeAtVisit.weeks - 2, 0) : 0,
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
      attendingDoctorName: `DR. ${attendingDoctor}`,
      notes: `Atención prenatal N° ${nextVisitNum}. Evolución materna y fetal adecuada.`,
    };

    setVisitsList([...visitsList, newVisit]);
  };

  // Eliminar atención prenatal de la matriz y renumerar
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
        const updated = visitsList.filter((_, idx) => idx !== index);
        const renumbered = updated.map((v, i) => ({ ...v, visitNumber: i + 1 }));
        setVisitsList(renumbered);
      }
    });
  };

  if (!isOpen) return null;

  const patientBg = getBackground(patient.id);
  const patientCheckups = clinicalCheckups.filter((c) => c.patientId === patient.id);

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

        {/* Drawer Lateral / Panel Plegable de Antecedentes */}
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
            2. CONTENIDO PRINCIPAL CON SCROLL
            ========================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/30">
          
          {/* Panel de Paciente Evaluada & Fechas Clave */}
          <div className="p-4 rounded-2xl bg-white border border-border shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Paciente Evaluada *
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{patient.lastName}, {patient.firstName}</span>
                  <span className="text-[11px] font-mono text-slate-500">DNI: {patient.dni} &bull; {patientAge} años</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Fecha de Apertura / Cita *
                </label>
                <input
                  type="date"
                  value={procedureDate}
                  onChange={(e) => setProcedureDate(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Médico Evaluador
                </label>
                <select
                  value={attendingDoctor}
                  onChange={(e) => setAttendingDoctor(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                >
                  {CLINIC_DOCTORS.map((doc) => (
                    <option key={doc} value={doc}>
                      DR. {doc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resumen FUM y EG */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">FUM:</span>
                  <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{baselineData.fum || "Sin registro"}</strong>
                </div>

                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-teal-700 uppercase text-[10px] font-bold">EG Actual:</span>
                  <strong className="text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{currentGestAge.formatted}</strong>
                </div>

                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-amber-700 uppercase text-[10px] font-bold">FPP Naegele:</span>
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
              BARRA DE PESTAÑAS SUPERIORES (SOLICITADAS POR KEVIN)
              Pestaña 1: Ficha Basal (Acordeones 1 al 9)
              Pestaña 2: Matriz de 9 Consultas
              Pestaña 3: Riesgo ARO
              ========================================================================= */}
          <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 flex flex-wrap items-center gap-2 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveMainTab("basal")}
              className={`px-4 py-2.5 rounded-xl text-xs font-heading font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeMainTab === "basal"
                  ? "bg-white text-purple-900 shadow-xs border border-purple-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <FileText className={`w-4 h-4 ${activeMainTab === "basal" ? "text-purple-600" : "text-slate-500"}`} />
              <span>Pestaña 1: Ficha Basal (Acordeones 1 al 9)</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeMainTab === "basal" ? "bg-purple-100 text-purple-800" : "bg-slate-200/70 text-slate-700"
              }`}>
                9 Acordeones
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab("consultas")}
              className={`px-4 py-2.5 rounded-xl text-xs font-heading font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeMainTab === "consultas"
                  ? "bg-white text-teal-900 shadow-xs border border-teal-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Activity className={`w-4 h-4 ${activeMainTab === "consultas" ? "text-teal-600" : "text-slate-500"}`} />
              <span>Pestaña 2: Matriz de 9 Consultas</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeMainTab === "consultas" ? "bg-teal-100 text-teal-800" : "bg-slate-200/70 text-slate-700"
              }`}>
                {visitsList.length}/9
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab("aro")}
              className={`px-4 py-2.5 rounded-xl text-xs font-heading font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeMainTab === "aro"
                  ? risksReport.isHighRisk
                    ? "bg-white text-red-900 shadow-xs border border-red-300"
                    : "bg-white text-emerald-900 shadow-xs border border-emerald-300"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${
                activeMainTab === "aro"
                  ? risksReport.isHighRisk ? "text-red-600" : "text-emerald-600"
                  : "text-amber-500"
              }`} />
              <span>Pestaña 3: Riesgo ARO</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                risksReport.isHighRisk ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
              }`}>
                {risksReport.isHighRisk ? "ALTO RIESGO" : "BAJO RIESGO"}
              </span>
            </button>
          </div>

          {/* =========================================================================
              PESTAÑA 1: FICHA BASAL (ACORDEONES 1 AL 9)
              ========================================================================= */}
          {activeMainTab === "basal" && (
            <div className="space-y-5">
              <Section1Filiacion
                isOpen={openSections.filiacion}
                onToggle={() => toggleSection("filiacion")}
                baselineData={baselineData}
                setBaselineData={setBaselineData}
                patient={patient}
                clinicEstablishment={clinicEstablishment}
                setClinicEstablishment={setClinicEstablishment}
                patientAge={patientAge}
                setPatientAge={setPatientAge}
                isAgeRisk={isAgeRisk}
              />

              <Section2Obstetricos
                isOpen={openSections.obstetricos}
                onToggle={() => toggleSection("obstetricos")}
                baselineData={baselineData}
                setBaselineData={setBaselineData}
                isParityRisk={isParityRisk}
              />

              <Section3GestacionAnt
                isOpen={(openSections as any).gestacionAnterior}
                onToggle={() => toggleSection("gestacionAnterior" as any)}
                baselineData={baselineData}
                setBaselineData={setBaselineData}
              />

              <Section4Familiares
                isOpen={openSections.antecedentesFamiliares}
                onToggle={() => toggleSection("antecedentesFamiliares")}
                baselineData={baselineData}
                setBaselineData={setBaselineData}
              />

              <Section5Personales
                isOpen={openSections.antecedentesPersonales}
                onToggle={() => toggleSection("antecedentesPersonales")}
                baselineData={baselineData}
                setBaselineData={setBaselineData}
              />

              <Section6Inmunizaciones
                isOpen={openSections.vacunas}
                onToggle={() => toggleSection("vacunas")}
                baselineData={baselineData}
                setBaselineData={setBaselineData}
                basalImc={basalImc}
                isBasalUnderweight={isBasalUnderweight}
                isBasalOverweight={isBasalOverweight}
                isBasalObesity={isBasalObesity}
                section6ContinuousCount={section6ContinuousCount}
                section6AlertsCount={section6AlertsCount}
              />

              <Section7EmbarazoActual
                isOpen={openSections.embarazo}
                onToggle={() => toggleSection("embarazo")}
                baselineData={baselineData}
                setBaselineData={setBaselineData}
                currentGestAge={currentGestAge}
              />

              <Section8ExamenFisico
                isOpen={openSections.examenFisico}
                onToggle={() => toggleSection("examenFisico")}
                baselineData={baselineData}
                setBaselineData={setBaselineData}
              />

              <Section9Laboratorio
                isOpen={openSections.laboratorio}
                onToggle={() => toggleSection("laboratorio")}
                baselineData={baselineData}
                setBaselineData={setBaselineData}
              />
            </div>
          )}

          {/* =========================================================================
              PESTAÑA 2: MATRIZ DE 9 CONSULTAS PRENATALES (MINSA / CLAP)
              ========================================================================= */}
          {activeMainTab === "consultas" && (
            <TabConsultasMatriz
              visitsList={visitsList}
              setVisitsList={setVisitsList}
              handleAddQuickVisit={handleAddQuickVisit}
              handleDeleteVisit={handleDeleteVisit}
            />
          )}

          {/* =========================================================================
              PESTAÑA 3: EVALUACIÓN DE RIESGO OBSTÉTRICO (ARO) & PLAN INSTITUCIONAL
              ========================================================================= */}
          {activeMainTab === "aro" && (
            <TabRiesgoAro
              risksReport={risksReport}
              attendingDoctor={attendingDoctor}
            />
          )}

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
