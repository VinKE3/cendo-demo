"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  X,
  Baby,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Check,
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

interface FamilyHistoryItemDef {
  id: string;
  label: string;
  isAlert: boolean;
  hint?: string;
  handwrittenNote?: string;
}

const FAMILY_HISTORY_ITEMS_COL1: FamilyHistoryItemDef[] = [
  {
    id: "Ninguno",
    label: "Ninguno",
    isAlert: false,
    hint: "Sin patologías familiares relevantes",
  },
  {
    id: "Alergias",
    label: "Alergias",
    isAlert: true,
    hint: "Medicamentosas, alimentarias o anafilaxia",
  },
  {
    id: "Enf. Hipertens. Emb.",
    label: "Enf. Hipertens. Emb.",
    isAlert: true,
    hint: "Preeclampsia / Eclampsia en madre o hermanas",
  },
  {
    id: "Epilepsia",
    label: "Epilepsia",
    isAlert: true,
    hint: "Trastornos convulsivos o epilepsia heredofamiliar",
  },
  {
    id: "Diabetes",
    label: "Diabetes",
    isAlert: true,
    hint: "Diabetes Mellitus Tipo 1, Tipo 2 o Gestacional",
  },
  {
    id: "Enferm.Congénitas",
    label: "Enferm. Congénitas",
    isAlert: true,
    hint: "Malformaciones, defectos del tubo neural o cromosomopatías",
  },
  {
    id: "Emb. Multiple",
    label: "Emb. Múltiple",
    isAlert: true,
    hint: "Embarazos gemelares o múltiples en consanguíneos",
  },
];

const FAMILY_HISTORY_ITEMS_COL2: FamilyHistoryItemDef[] = [
  {
    id: "Malaria",
    label: "Malaria",
    isAlert: false,
    hint: "Paludismo o procedencia de zona endémica",
  },
  {
    id: "Hipertención Arterial",
    label: "Hipertensión Arterial",
    isAlert: true,
    hint: "Hipertensión esencial crónica en padres o abuelos",
  },
  {
    id: "Hipotiroidismo",
    label: "Hipotiroidismo",
    isAlert: true,
    hint: "Disfunción tiroidea o tiroiditis autoinmune",
  },
  {
    id: "Neoplasia",
    label: "Neoplasia",
    isAlert: true,
    handwrittenNote: "cáncer -",
    hint: "Cáncer de mama, cérvix, colon u otras neoplasias",
  },
  {
    id: "TBC Pulmonar",
    label: "TBC Pulmonar",
    isAlert: true,
    hint: "Tuberculosis activa o contacto directo",
  },
  {
    id: "Otros",
    label: "Otros",
    isAlert: true,
    hint: "Otras patologías sistémicas familiares relevantes",
  },
];

interface PersonalHistoryItemDef {
  id: string;
  label: string;
  severity: "none" | "alert" | "continuous"; // none = blanco [ ], alert = amarillo [🟨], continuous = rojo [🟥]
  hint?: string;
  handwrittenNote?: string;
  doctorEyeWarning?: boolean;
}

const PERSONAL_HISTORY_ITEMS_COL1: PersonalHistoryItemDef[] = [
  {
    id: "Ninguno",
    label: "Ninguno",
    severity: "none",
    hint: "Sin antecedentes patológicos personales",
  },
  {
    id: "Aborto habitual/recurrente",
    label: "Aborto habitual/recurrente",
    severity: "continuous",
    hint: "≥ 2 o 3 abortos espontáneos consecutivos",
  },
  {
    id: "Alcoholismo",
    label: "- Alcoholismo",
    severity: "alert",
    hint: "Consumo de riesgo o dependencia alcohólica",
  },
  {
    id: "Alergia medicamentos",
    label: "Alergia medicamentos",
    severity: "alert",
    hint: "Reacciones adversas medicamentosas (RAM)",
  },
  {
    id: "Violencia",
    label: "Violencia",
    severity: "alert",
    hint: "Física, psicológica o sexual (Ficha MINSA)",
  },
  {
    id: "Asma Bronquial",
    label: "Asma Bronquial",
    severity: "alert",
    hint: "Hiperreactividad bronquial o broncoespasmo",
  },
  {
    id: "Cardiopatia",
    label: "Cardiopatia",
    severity: "continuous",
    hint: "Valvulopatía, cardiopatía congénita o arritmia",
  },
  {
    id: "Cirugía Pélv. uterina",
    label: "Cirugía Pélv. uterina",
    severity: "continuous",
    handwrittenNote: "cesárea",
    doctorEyeWarning: true,
    hint: "Cicatriz uterina previa (cesárea, miomectomía)",
  },
  {
    id: "Diabetes",
    label: "Diabetes",
    severity: "alert",
    hint: "Diabetes pregestacional Tipo 1 o Tipo 2",
  },
];

const PERSONAL_HISTORY_ITEMS_COL2: PersonalHistoryItemDef[] = [
  {
    id: "Eclampsia",
    label: "Eclampsia",
    severity: "continuous",
    hint: "Convulsiones tónico-clónicas en gestación previa",
  },
  {
    id: "Enferm. Congénitas",
    label: "Enferm. Congénitas",
    severity: "alert",
    hint: "Anomalías estructurales o cromosómicas maternas",
  },
  {
    id: "Enferm. Infecciosas",
    label: "Enferm. Infecciosas",
    severity: "alert",
    hint: "TORCH, hepatitis víricas, Chagas, ITS u otras",
  },
  {
    id: "Epilepsia",
    label: "Epilepsia",
    severity: "alert",
    hint: "Trastorno neurológico convulsivo / anticonvulsivantes",
  },
  {
    id: "Hemorra. Postparto",
    label: "Hemorra. Postparto",
    severity: "continuous",
    hint: "Atonía uterina o hemorragia masiva en parto previo",
  },
  {
    id: "Hipertensión Arterial",
    label: "Hipertensión Arterial",
    severity: "alert",
    hint: "Hipertensión arterial esencial crónica",
  },
  {
    id: "Coca",
    label: "Coca",
    severity: "alert",
    hint: "Consumo de cocaína, PBC o coqueo habitual",
  },
  {
    id: "Infertilidad",
    label: "Infertilidad",
    severity: "alert",
    hint: "Tratamiento de reproducción asistida o infertilidad",
  },
  {
    id: "Neoplasia",
    label: "Neoplasia",
    severity: "alert",
    hint: "Neoplasia maligna previa o activa",
  },
];

const PERSONAL_HISTORY_ITEMS_COL3: PersonalHistoryItemDef[] = [
  {
    id: "Otras Drogas",
    label: "Otras Drogas",
    severity: "alert",
    hint: "Sustancias psicoactivas, marihuana, opioides, etc.",
  },
  {
    id: "Parto Prolong.",
    label: "Parto Prolong.",
    severity: "alert",
    hint: "Fase activa prolongada o detención de dilatación",
  },
  {
    id: "Preeclampsia",
    label: "Preeclampsia",
    severity: "alert",
    hint: "Preeclampsia en gestaciones anteriores",
  },
  {
    id: "Prematuridad",
    label: "Prematuridad",
    severity: "alert",
    hint: "Parto pretérmino previo (< 37 semanas)",
  },
  {
    id: "Reten. Placenta",
    label: "Reten. Placenta",
    severity: "alert",
    hint: "Alumbramiento manual o retención placentaria previa",
  },
  {
    id: "Tabaco",
    label: "Tabaco",
    severity: "alert",
    hint: "Tabaquismo activo o pasivo",
  },
  {
    id: "TBC Pulmonar",
    label: "TBC Pulmonar",
    severity: "continuous",
    hint: "Tuberculosis activa o antecedente con tratamiento",
  },
  {
    id: "Transtorn. mentales",
    label: "Transtorn. mentales",
    severity: "alert",
    hint: "Depresión mayor, ansiedad, psicosis o bipolaridad",
  },
  {
    id: "VIH/SIDA",
    label: "VIH/SIDA",
    severity: "continuous",
    hint: "Infección por retrovirus (Protocolo TARV materno)",
  },
  {
    id: "Otros",
    label: "Otros",
    severity: "alert",
    hint: "Otras patologías médicas o quirúrgicas relevantes",
  },
];

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
    gestacionAnterior: false,
    antecedentesFamiliares: false,
    antecedentesPersonales: true, // Sección 5 desplegada por defecto para revisión inmediata
    vacunas: false,
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
    familyHistoryDetails: {},
    familyHistoryOther: "",
    personalHistory: ["Ninguno"],
    personalHistoryDetails: {},
    personalHistoryOther: "",
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

    // Detección inteligente de antecedentes familiares desde la HC
    let initialFam = baselineData.familyHistory || ["Ninguno"];
    let initialDetails = baselineData.familyHistoryDetails || {};
    if (bg?.familyHistory && bg.familyHistory.trim() !== "" && bg.familyHistory.toLowerCase() !== "no refiere") {
      const famLower = bg.familyHistory.toLowerCase();
      const detectedFam: string[] = [];
      const detectedDetails: Record<string, string> = {};

      if (famLower.includes("diabet")) {
        detectedFam.push("Diabetes");
        detectedDetails["Diabetes"] = famLower.includes("madre") ? "Madre" : (famLower.includes("padre") ? "Padre" : "Familiar directo");
      }
      if (famLower.includes("hipertens") || famLower.includes("hta")) {
        detectedFam.push("Hipertención Arterial");
        detectedDetails["Hipertención Arterial"] = famLower.includes("madre") ? "Madre" : (famLower.includes("padre") ? "Padre" : "Familiar directo");
      }
      if (famLower.includes("tiroid") || famLower.includes("hipotiroid")) {
        detectedFam.push("Hipotiroidismo");
        detectedDetails["Hipotiroidismo"] = "Familiar directo";
      }
      if (famLower.includes("cancer") || famLower.includes("cáncer") || famLower.includes("neoplas")) {
        detectedFam.push("Neoplasia");
        detectedDetails["Neoplasia"] = "Familiar directo";
      }
      if (famLower.includes("alerg")) {
        detectedFam.push("Alergias");
        detectedDetails["Alergias"] = "Familiar directo";
      }
      if (famLower.includes("tbc") || famLower.includes("tuberculosis")) {
        detectedFam.push("TBC Pulmonar");
        detectedDetails["TBC Pulmonar"] = "Familiar directo";
      }

      if (detectedFam.length > 0) {
        initialFam = detectedFam;
        initialDetails = detectedDetails;
      }
    }

    // Detección inteligente de antecedentes personales patológicos desde la HC
    let initialPersonal = baselineData.personalHistory || ["Ninguno"];
    let initialPersonalDetails = baselineData.personalHistoryDetails || {};
    const detectedPersonal: string[] = [];
    const detectedPersonalDetails: Record<string, string> = {};

    if (bg?.hasDiabetes === "Sí") {
      detectedPersonal.push("Diabetes");
    }
    if (bg?.hasHypertension === "Sí") {
      detectedPersonal.push("Hipertensión Arterial");
    }
    if (bg?.hasAsthma === "Sí") {
      detectedPersonal.push("Asma Bronquial");
    }
    if (bg?.medicalAllergies && bg.medicalAllergies.trim() !== "" && bg.medicalAllergies.toLowerCase() !== "niega" && bg.medicalAllergies.toLowerCase() !== "no refiere") {
      detectedPersonal.push("Alergia medicamentos");
      detectedPersonalDetails["Alergia medicamentos"] = bg.medicalAllergies;
    }
    if (formula.cesareas > 0 || (bg?.surgeriesHistory && bg.surgeriesHistory.toLowerCase().includes("cesárea"))) {
      detectedPersonal.push("Cirugía Pélv. uterina");
      detectedPersonalDetails["Cirugía Pélv. uterina"] = "Cesárea previa";
    }
    if (formula.abortos >= 2) {
      detectedPersonal.push("Aborto habitual/recurrente");
      detectedPersonalDetails["Aborto habitual/recurrente"] = `${formula.abortos} abortos previos`;
    }

    if (detectedPersonal.length > 0) {
      initialPersonal = detectedPersonal;
      initialPersonalDetails = detectedPersonalDetails;
    }

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
      familyHistory: prev.familyHistory?.length && prev.familyHistory[0] !== "Ninguno" ? prev.familyHistory : initialFam,
      familyHistoryDetails: prev.familyHistoryDetails && Object.keys(prev.familyHistoryDetails).length > 0 ? prev.familyHistoryDetails : initialDetails,
      personalHistory: prev.personalHistory?.length && prev.personalHistory[0] !== "Ninguno" ? prev.personalHistory : initialPersonal,
      personalHistoryDetails: prev.personalHistoryDetails && Object.keys(prev.personalHistoryDetails).length > 0 ? prev.personalHistoryDetails : initialPersonalDetails,
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

  // Manejo reactivo de antecedentes familiares (Sección 4)
  const handleToggleFamilyHistory = (itemId: string) => {
    setBaselineData((prev) => {
      const current = prev.familyHistory || [];
      const currentDetails = { ...(prev.familyHistoryDetails || {}) };

      if (itemId === "Ninguno") {
        return {
          ...prev,
          familyHistory: ["Ninguno"],
          familyHistoryDetails: {},
          familyHistoryOther: "",
        };
      }

      const withoutNinguno = current.filter((x) => x !== "Ninguno");
      const exists = withoutNinguno.includes(itemId);

      let updatedList: string[];
      if (exists) {
        updatedList = withoutNinguno.filter((x) => x !== itemId);
        delete currentDetails[itemId];
      } else {
        updatedList = [...withoutNinguno, itemId];
        if (!currentDetails[itemId]) {
          currentDetails[itemId] = "Madre";
        }
      }

      if (updatedList.length === 0) {
        return {
          ...prev,
          familyHistory: ["Ninguno"],
          familyHistoryDetails: {},
          familyHistoryOther: "",
        };
      }

      return {
        ...prev,
        familyHistory: updatedList,
        familyHistoryDetails: currentDetails,
      };
    });
  };

  const handleSetFamilyRelative = (itemId: string, relative: string) => {
    setBaselineData((prev) => ({
      ...prev,
      familyHistoryDetails: {
        ...(prev.familyHistoryDetails || {}),
        [itemId]: relative,
      },
    }));
  };

  const familyAlertsCount = (baselineData.familyHistory || []).filter(
    (item) => item !== "Ninguno" && item !== "Malaria"
  ).length;

  const renderFamilyHistoryCard = (item: FamilyHistoryItemDef) => {
    const isChecked = baselineData.familyHistory?.includes(item.id);
    const detail = baselineData.familyHistoryDetails?.[item.id] || "";

    return (
      <div
        key={item.id}
        className={`rounded-xl border transition-all duration-200 ${
          isChecked
            ? item.isAlert
              ? "bg-amber-50/90 border-amber-400 shadow-xs ring-1 ring-amber-300/60"
              : "bg-emerald-50/80 border-emerald-400 shadow-xs ring-1 ring-emerald-300/60"
            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
        }`}
      >
        {/* Fila principal clickable */}
        <div
          onClick={() => handleToggleFamilyHistory(item.id)}
          className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
        >
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-bold ${
                  isChecked
                    ? item.isAlert
                      ? "text-amber-950 font-black"
                      : "text-emerald-950 font-black"
                    : "text-slate-800"
                }`}
              >
                {item.label}
              </span>

              {/* Anotación manuscrita del Dr. Patrick en Neoplasia */}
              {item.handwrittenNote && (
                <span className="text-[10px] bg-white px-1.5 py-0.2 rounded border border-slate-300 text-slate-700 italic font-mono font-medium shadow-2xs">
                  {item.handwrittenNote}
                </span>
              )}

              {/* Distintivo de alerta */}
              {item.isAlert && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    isChecked
                      ? "bg-amber-300 text-amber-950 border border-amber-400"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  ALERTA
                </span>
              )}
            </div>

            {item.hint && (
              <span
                className={`text-[10px] mt-0.5 ${
                  isChecked
                    ? item.isAlert
                      ? "text-amber-800"
                      : "text-emerald-800"
                    : "text-slate-500"
                }`}
              >
                {item.hint}
              </span>
            )}
          </div>

          {/* Casilla oficial (Amarilla o Blanca) */}
          <div className="shrink-0 flex items-center gap-2">
            {item.isAlert ? (
              <div
                className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                  isChecked
                    ? "bg-amber-400 border-amber-600 text-amber-950 shadow-xs ring-2 ring-amber-300"
                    : "bg-amber-200/90 border-amber-400 text-amber-800 hover:bg-amber-300"
                }`}
                title={isChecked ? "Marcado como alerta" : "Casilla amarilla = Factor de alerta"}
              >
                {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            ) : (
              <div
                className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                  isChecked
                    ? "bg-emerald-500 border-emerald-600 text-white shadow-xs"
                    : "bg-white border-slate-300 text-slate-400 hover:border-slate-400"
                }`}
                title={isChecked ? "Marcado" : "Casilla blanca"}
              >
                {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            )}
          </div>
        </div>

        {/* Subpanel expandible al marcar (excepto 'Ninguno') */}
        {isChecked && item.id !== "Ninguno" && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="px-3 pb-3 pt-2.5 border-t border-amber-200/80 space-y-2.5 bg-amber-100/40 rounded-b-xl"
          >
            {/* Si es 'Otros', ingresar patología específica */}
            {item.id === "Otros" && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-950 block">
                  Especificar Patología / Enfermedad:
                </label>
                <input
                  type="text"
                  value={baselineData.familyHistoryOther || ""}
                  onChange={(e) =>
                    setBaselineData({
                      ...baselineData,
                      familyHistoryOther: e.target.value,
                    })
                  }
                  placeholder="ej. Lupus eritematoso, Cardiopatía congénita, etc."
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Selector de familiar directo (Anotación manuscrita: 'al costado ponemos qué familiar') */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-700" />
                  ¿Qué familiar directo sufre esta condición?
                </span>
                {detail && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 border border-amber-300">
                    {detail}
                  </span>
                )}
              </div>

              {/* Chips rápidos de parentesco */}
              <div className="flex flex-wrap gap-1">
                {[
                  "Madre",
                  "Padre",
                  "Hermana",
                  "Hermano",
                  "Abuela Materna",
                  "Abuelo Materno",
                  "Abuela Paterna",
                  "Abuelo Paterno",
                ].map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => handleSetFamilyRelative(item.id, rel)}
                    className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                      detail === rel
                        ? "bg-amber-600 text-white shadow-2xs font-bold ring-1 ring-amber-700"
                        : "bg-white hover:bg-amber-100 text-amber-950 border border-amber-200"
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>

              {/* Input libre para detalle específico */}
              <input
                type="text"
                value={detail}
                onChange={(e) => handleSetFamilyRelative(item.id, e.target.value)}
                placeholder="O especifique parentesco y detalle (ej. Madre diagnosticada a los 45a)..."
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Manejo reactivo de antecedentes personales patológicos (Sección 5)
  const handleTogglePersonalHistory = (itemId: string) => {
    setBaselineData((prev) => {
      const current = prev.personalHistory || [];
      const currentDetails = { ...(prev.personalHistoryDetails || {}) };

      if (itemId === "Ninguno") {
        return {
          ...prev,
          personalHistory: ["Ninguno"],
          personalHistoryDetails: {},
          personalHistoryOther: "",
        };
      }

      const withoutNinguno = current.filter((x) => x !== "Ninguno");
      const exists = withoutNinguno.includes(itemId);

      let updatedList: string[];
      if (exists) {
        updatedList = withoutNinguno.filter((x) => x !== itemId);
        delete currentDetails[itemId];
      } else {
        updatedList = [...withoutNinguno, itemId];
        if (itemId === "Cirugía Pélv. uterina" && !currentDetails[itemId]) {
          currentDetails[itemId] = "Cesárea previa";
        }
      }

      if (updatedList.length === 0) {
        return {
          ...prev,
          personalHistory: ["Ninguno"],
          personalHistoryDetails: {},
          personalHistoryOther: "",
        };
      }

      return {
        ...prev,
        personalHistory: updatedList,
        personalHistoryDetails: currentDetails,
      };
    });
  };

  const handleSetPersonalDetail = (itemId: string, detail: string) => {
    setBaselineData((prev) => ({
      ...prev,
      personalHistoryDetails: {
        ...(prev.personalHistoryDetails || {}),
        [itemId]: detail,
      },
    }));
  };

  const allPersonalItems = [
    ...PERSONAL_HISTORY_ITEMS_COL1,
    ...PERSONAL_HISTORY_ITEMS_COL2,
    ...PERSONAL_HISTORY_ITEMS_COL3,
  ];

  const personalContinuousCount = (baselineData.personalHistory || []).filter((id) => {
    const item = allPersonalItems.find((i) => i.id === id);
    return item?.severity === "continuous";
  }).length;

  const personalAlertsCount = (baselineData.personalHistory || []).filter((id) => {
    const item = allPersonalItems.find((i) => i.id === id);
    return item?.severity === "alert";
  }).length;

  const renderPersonalHistoryCard = (item: PersonalHistoryItemDef) => {
    const isChecked = baselineData.personalHistory?.includes(item.id);
    const detail = baselineData.personalHistoryDetails?.[item.id] || "";

    const cardStyles = isChecked
      ? item.severity === "continuous"
        ? "bg-red-50/90 border-red-400 shadow-xs ring-1 ring-red-300/70"
        : item.severity === "alert"
        ? "bg-amber-50/90 border-amber-400 shadow-xs ring-1 ring-amber-300/70"
        : "bg-emerald-50/80 border-emerald-400 shadow-xs ring-1 ring-emerald-300/60"
      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50";

    return (
      <div
        key={item.id}
        className={`rounded-xl border transition-all duration-200 ${cardStyles}`}
      >
        {/* Fila principal clickable */}
        <div
          onClick={() => handleTogglePersonalHistory(item.id)}
          className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5 cursor-pointer select-none"
        >
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-xs font-bold leading-tight ${
                  isChecked
                    ? item.severity === "continuous"
                      ? "text-red-950 font-black"
                      : item.severity === "alert"
                      ? "text-amber-950 font-black"
                      : "text-emerald-950 font-black"
                    : "text-slate-800"
                }`}
              >
                {item.label}
              </span>

              {/* Anotación manuscrita: 'cesárea' */}
              {item.handwrittenNote && (
                <span className="text-[10px] bg-red-100 border border-red-300 text-red-900 font-bold px-1.5 py-0.2 rounded italic shadow-2xs">
                  {item.handwrittenNote}
                </span>
              )}

              {/* Dibujo de ojos del Dr. Patrick 👁️👁️ */}
              {item.doctorEyeWarning && (
                <span className="text-xs" title="Ojo Clínico: Cicatriz uterina requiere vigilancia estrecha">
                  👁️👁️
                </span>
              )}

              {/* Distintivo de severidad */}
              {item.severity === "continuous" && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    isChecked
                      ? "bg-red-600 text-white border border-red-700"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  SEGUIMIENTO ROJO
                </span>
              )}
              {item.severity === "alert" && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    isChecked
                      ? "bg-amber-300 text-amber-950 border border-amber-400"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  ALERTA
                </span>
              )}
            </div>

            {item.hint && (
              <span
                className={`text-[10px] mt-0.5 line-clamp-1 ${
                  isChecked
                    ? item.severity === "continuous"
                      ? "text-red-800"
                      : item.severity === "alert"
                      ? "text-amber-800"
                      : "text-emerald-800"
                    : "text-slate-500"
                }`}
              >
                {item.hint}
              </span>
            )}
          </div>

          {/* Casilla oficial (Roja [🟥], Amarilla [🟨] o Blanca [ ]) */}
          <div className="shrink-0 flex items-center">
            {item.severity === "continuous" ? (
              <div
                className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                  isChecked
                    ? "bg-red-600 border-red-800 text-white shadow-xs ring-2 ring-red-400"
                    : "bg-red-500 border-red-600 text-white hover:bg-red-600"
                }`}
                title="Casilla roja = Requiere seguimiento continuo"
              >
                {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            ) : item.severity === "alert" ? (
              <div
                className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                  isChecked
                    ? "bg-amber-400 border-amber-600 text-amber-950 shadow-xs ring-2 ring-amber-300"
                    : "bg-amber-300 border-amber-500 text-amber-900 hover:bg-amber-400"
                }`}
                title="Casilla amarilla = Factor de alerta"
              >
                {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            ) : (
              <div
                className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                  isChecked
                    ? "bg-emerald-500 border-emerald-600 text-white shadow-xs"
                    : "bg-white border-slate-300 text-slate-400 hover:border-slate-400"
                }`}
                title="Casilla blanca"
              >
                {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            )}
          </div>
        </div>

        {/* Subpanel expandible al marcar (para detalles clínicos clave) */}
        {isChecked && item.id !== "Ninguno" && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`px-3 pb-3 pt-2 border-t space-y-2 rounded-b-xl ${
              item.severity === "continuous"
                ? "border-red-200/80 bg-red-100/40"
                : "border-amber-200/80 bg-amber-100/40"
            }`}
          >
            {/* Si es Cirugía Pélvica / Uterina (Nota: cesárea 👁️👁️) */}
            {item.id === "Cirugía Pélv. uterina" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-red-950 flex items-center gap-1">
                    <span>👁️👁️ Tipo de cirugía uterina / cicatriz:</span>
                  </span>
                  {detail && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-200 text-red-900 border border-red-300">
                      {detail}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    "Cesárea previa (1)",
                    "Cesárea previa (2 o +)",
                    "Miomectomía",
                    "Legrado uterino",
                    "Conización",
                    "Otra cirugía",
                  ].map((surg) => (
                    <button
                      key={surg}
                      type="button"
                      onClick={() => handleSetPersonalDetail(item.id, surg)}
                      className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                        detail === surg
                          ? "bg-red-600 text-white shadow-2xs font-bold ring-1 ring-red-700"
                          : "bg-white hover:bg-red-100 text-red-950 border border-red-200"
                      }`}
                    >
                      {surg}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={detail}
                  onChange={(e) => handleSetPersonalDetail(item.id, e.target.value)}
                  placeholder="Detalles quirúrgicos (ej. Cesárea segmentaria transversa en 2022)..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-red-300 focus:outline-hidden focus:ring-1 focus:ring-red-500 font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Si es Alergia Medicamentos */}
            {item.id === "Alergia medicamentos" && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-amber-950 block">
                  Medicamentos alérgenos identificados:
                </span>
                <div className="flex flex-wrap gap-1">
                  {["Penicilina", "AINEs / Ibuprofeno", "Sulfas", "Cefalosporinas", "Metamizol"].map((med) => (
                    <button
                      key={med}
                      type="button"
                      onClick={() => handleSetPersonalDetail(item.id, med)}
                      className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                        detail === med
                          ? "bg-amber-600 text-white shadow-2xs font-bold ring-1 ring-amber-700"
                          : "bg-white hover:bg-amber-100 text-amber-950 border border-amber-200"
                      }`}
                    >
                      {med}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={detail}
                  onChange={(e) => handleSetPersonalDetail(item.id, e.target.value)}
                  placeholder="Especifique fármaco o tipo de reacción (ej. Urticaria, Shock anafiláctico)..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Si es Violencia */}
            {item.id === "Violencia" && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-amber-950 block">
                  Tipo de violencia detectada (Ficha de Tamizaje MINSA):
                </span>
                <div className="flex flex-wrap gap-1">
                  {["Psicológica", "Física", "Sexual", "Económica"].map((vType) => (
                    <button
                      key={vType}
                      type="button"
                      onClick={() => handleSetPersonalDetail(item.id, vType)}
                      className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                        detail === vType
                          ? "bg-amber-600 text-white shadow-2xs font-bold ring-1 ring-amber-700"
                          : "bg-white hover:bg-amber-100 text-amber-950 border border-amber-200"
                      }`}
                    >
                      {vType}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={detail}
                  onChange={(e) => handleSetPersonalDetail(item.id, e.target.value)}
                  placeholder="Observaciones de protección o derivación a servicio social / CEM..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Si es Otros */}
            {item.id === "Otros" && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-950 block">
                  Especifique otra patología médica o quirúrgica:
                </label>
                <input
                  type="text"
                  value={baselineData.personalHistoryOther || ""}
                  onChange={(e) =>
                    setBaselineData({
                      ...baselineData,
                      personalHistoryOther: e.target.value,
                    })
                  }
                  placeholder="ej. Hipotiroidismo, Trombofilia, Lupus, etc."
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Para el resto de items */}
            {item.id !== "Cirugía Pélv. uterina" && item.id !== "Alergia medicamentos" && item.id !== "Violencia" && item.id !== "Otros" && (
              <div className="space-y-1">
                <input
                  type="text"
                  value={detail}
                  onChange={(e) => handleSetPersonalDetail(item.id, e.target.value)}
                  placeholder="Detalles clínicos o tratamiento actual (opcional)..."
                  className={`w-full text-xs px-2.5 py-1 rounded-lg bg-white border focus:outline-hidden focus:ring-1 font-medium text-slate-800 placeholder:text-slate-400 ${
                    item.severity === "continuous"
                      ? "border-red-300 focus:ring-red-500"
                      : "border-amber-300 focus:ring-amber-500"
                  }`}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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
              ACORDEÓN 4: ANTECEDENTES FAMILIARES (FAMILIARES DIRECTOS)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("antecedentesFamiliares")}
              className="w-full p-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  ANTECEDENTES FAMILIARES (FAMILIARES DIRECTOS)
                </span>
                {familyAlertsCount === 0 ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Sin alertas familiares
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black border border-amber-500 shadow-2xs">
                    <AlertTriangle className="w-3 h-3 text-amber-950" />
                    {familyAlertsCount} {familyAlertsCount === 1 ? "Alerta familiar" : "Alertas familiares"}
                  </span>
                )}
              </div>
              {openSections.antecedentesFamiliares ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {openSections.antecedentesFamiliares && (
              <div className="p-4 sm:p-6 space-y-5 text-xs border-t border-border bg-white">
                
                {/* 4.1 Barra Superior de Resumen y Acción Rápida */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-heading font-extrabold text-heading uppercase">
                        Matriz de Antecedentes Familiares & Consanguinidad
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Marque las patologías en familiares directos (1er y 2do grado). Las casillas amarillas señalan factor de alerta obstétrica.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleFamilyHistory("Ninguno")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        baselineData.familyHistory?.includes("Ninguno")
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300"
                      }`}
                      title="Marcar ninguno y desmarcar cualquier patología"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>✓ Marcar Ninguno (Sanos)</span>
                    </button>
                  </div>
                </div>

                {/* 4.2 Grid de 2 Columnas idéntico a la ficha física */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  
                  {/* COLUMNA 1: Ninguno, Alergias, Enf. Hipertens. Emb., Epilepsia, Diabetes, Enferm. Congénitas, Emb. Múltiple */}
                  <div className="space-y-2.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Columna 1 &bull; Heredofamiliares
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {FAMILY_HISTORY_ITEMS_COL1.filter((i) => baselineData.familyHistory?.includes(i.id)).length} seleccionados
                      </span>
                    </div>

                    <div className="space-y-2">
                      {FAMILY_HISTORY_ITEMS_COL1.map((item) => renderFamilyHistoryCard(item))}
                    </div>
                  </div>

                  {/* COLUMNA 2: Malaria, Hipertensión Arterial, Hipotiroidismo, Neoplasia (cáncer -), TBC Pulmonar, Otros */}
                  <div className="space-y-2.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Columna 2 &bull; Sistémicos & Crónicos
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {FAMILY_HISTORY_ITEMS_COL2.filter((i) => baselineData.familyHistory?.includes(i.id)).length} seleccionados
                      </span>
                    </div>

                    <div className="space-y-2">
                      {FAMILY_HISTORY_ITEMS_COL2.map((item) => renderFamilyHistoryCard(item))}
                    </div>
                  </div>

                </div>

                {/* 4.3 Nota Médica Manuscrita del Dr. Patrick Jacinto Gomero */}
                <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                        Indicación del Dr. Patrick Jacinto Gomero
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-semibold border border-amber-300">
                        Anotación Manuscrita Oficial
                      </span>
                    </div>
                    <p className="text-xs text-amber-950 italic font-semibold leading-relaxed">
                      &ldquo;Familiares directos. Qué enfermedades sufren, al costado colocamos qué familiar.&rdquo;
                    </p>
                    <p className="text-[11px] text-amber-900/90 leading-tight">
                      Permite registrar consanguinidad de 1er y 2do grado (Madre, Padre, Hermanos, Abuelos) para la evaluación de riesgo obstétrico (ARO), predisposición a preeclampsia, diabetes gestacional, trastornos tiroideos y tamizaje genético.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 5: ANTECEDENTES PERSONALES PATOLÓGICOS (3 COLUMNAS MINSA)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("antecedentesPersonales")}
              className="w-full p-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center shrink-0">
                  5
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  ANTECEDENTES PERSONALES PATOLÓGICOS
                </span>

                {/* Badges de alerta y seguimiento continuo */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {personalContinuousCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black border border-red-700 shadow-2xs animate-pulse">
                      🟥 {personalContinuousCount} Seguimiento continuo
                    </span>
                  )}
                  {personalAlertsCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black border border-amber-500 shadow-2xs">
                      🟨 {personalAlertsCount} {personalAlertsCount === 1 ? "Alerta" : "Alertas"}
                    </span>
                  )}
                  {personalContinuousCount === 0 && personalAlertsCount === 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Sin antecedentes patológicos
                    </span>
                  )}
                </div>
              </div>

              {openSections.antecedentesPersonales ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {openSections.antecedentesPersonales && (
              <div className="p-4 sm:p-6 space-y-5 text-xs border-t border-border bg-white">
                
                {/* 5.1 Barra Superior de Resumen y Acción Rápida */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <ShieldAlert className="w-4 h-4 text-red-700" />
                    </div>
                    <div>
                      <div className="text-xs font-heading font-extrabold text-heading uppercase">
                        Matriz de Antecedentes Personales Patológicos (MINSA / CLAP)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Casillas rojas [🟥] requieren <strong>seguimiento continuo</strong>. Casillas amarillas [🟨] indican <strong>factor de alerta</strong>.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePersonalHistory("Ninguno")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        baselineData.personalHistory?.includes("Ninguno")
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300"
                      }`}
                      title="Marcar ninguno y desmarcar cualquier patología personal"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>✓ Marcar Ninguno (Sana)</span>
                    </button>
                  </div>
                </div>

                {/* 5.2 Grid de 3 Columnas idéntico al formato oficial */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  
                  {/* COLUMNA 1 */}
                  <div className="space-y-2.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Columna 1 &bull; Gineco-Obstétricos & Clínicos
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {PERSONAL_HISTORY_ITEMS_COL1.filter((i) => baselineData.personalHistory?.includes(i.id)).length} / {PERSONAL_HISTORY_ITEMS_COL1.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {PERSONAL_HISTORY_ITEMS_COL1.map((item) => renderPersonalHistoryCard(item))}
                    </div>
                  </div>

                  {/* COLUMNA 2 */}
                  <div className="space-y-2.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Columna 2 &bull; Materno-Perinatales & Crónicos
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {PERSONAL_HISTORY_ITEMS_COL2.filter((i) => baselineData.personalHistory?.includes(i.id)).length} / {PERSONAL_HISTORY_ITEMS_COL2.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {PERSONAL_HISTORY_ITEMS_COL2.map((item) => renderPersonalHistoryCard(item))}
                    </div>
                  </div>

                  {/* COLUMNA 3 */}
                  <div className="space-y-2.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Columna 3 &bull; Complicaciones & Infecciosas
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {PERSONAL_HISTORY_ITEMS_COL3.filter((i) => baselineData.personalHistory?.includes(i.id)).length} / {PERSONAL_HISTORY_ITEMS_COL3.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {PERSONAL_HISTORY_ITEMS_COL3.map((item) => renderPersonalHistoryCard(item))}
                    </div>
                  </div>

                </div>

                {/* 5.3 Nota Médica del Dr. Patrick Jacinto Gomero */}
                <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-200 text-red-900 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4 text-red-700" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-950 uppercase tracking-wide">
                        Protocolo Obstétrico &bull; Dr. Patrick Jacinto Gomero
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-200 text-red-950 font-semibold border border-red-300">
                        Signo de Alerta Crítica 👁️👁️
                      </span>
                    </div>
                    <p className="text-xs text-red-950 italic font-semibold leading-relaxed">
                      Anotación en Cirugía Pélvico-Uterina: &ldquo;cesárea&rdquo; con signo visual de vigilancia estricta (👁️👁️).
                    </p>
                    <p className="text-[11px] text-red-900/90 leading-tight">
                      Las 7 casillas rojas [🟥] señalan condiciones de <strong>seguimiento continuo obligatorio</strong> (Cesárea previa, Eclampsia, Hemorragia Postparto, Cardiopatía, TBC, VIH, Aborto habitual). Requieren manejo multidisciplinario, plan de parto institucional y reserva hemodinámica.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 6: VACUNAS PREVIAS, ANTITETÁNICA & SOMATOMETRÍA (EN COLA)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("vacunas")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                  6
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  VACUNAS PREVIAS, ANTITETÁNICA & SOMATOMETRÍA
                </span>
              </div>
              {openSections.vacunas ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {openSections.vacunas && (
              <div className="p-5 text-center space-y-2 border-t border-border bg-slate-50/50">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                  <span>Paso 6 en Cola</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Inmunizaciones (Rubeola, Hepatitis B, VPH, Fiebre Amarilla, Antitetánica) y Antropometría
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 7: DATOS BASALES DEL EMBARAZO ACTUAL (FUM, ECOGRAFÍA, FPP)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("embarazo")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center shrink-0">
                  7
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
                  <span>Paso 7 en Cola</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Cálculo de Regla de Naegele, Duda de FUM, Ecografía Precoz, Hospitalización y Emergencias
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 8: EXAMEN FÍSICO BASAL & EXÁMENES DE LABORATORIO
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("laboratorio")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0">
                  8
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
                  <span>Paso 8 en Cola</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Examen Físico Basal (Mamas, Cuello Uterino, Pelvis) y Batería de Laboratorio (Hemoglobina, Glucosa, VDRL, VIH, PAP, etc.)
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 9: REGISTRO DE ATENCIONES PRENATALES LONGITUDINALES (9 CONSULTAS)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("atenciones")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                  9
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
                  <span>Paso 9 en Cola</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Matriz Longitudinal de 9 Atenciones Prenatales MINSA (EG, Peso, PA, AU, FCF, Mov. Fetales, etc.)
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 10: EVALUACIÓN DE RIESGO OBSTÉTRICO (ARO) & CONDUCTA
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("riesgos")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  10
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
                  <span>Paso 10 en Cola</span>
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
