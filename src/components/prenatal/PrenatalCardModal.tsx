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

interface PhysicalExamItemDef {
  id: "clinicalExam" | "breastsExam" | "cervixExam" | "pelvisExam" | "dentalExam";
  detailKey: "clinicalExamDetail" | "breastsExamDetail" | "cervixExamDetail" | "pelvisExamDetail" | "dentalExamDetail";
  snippetName: string;
  title: string;
  subtitle: string;
  chips: string[];
}

const PHYSICAL_EXAM_ITEMS: PhysicalExamItemDef[] = [
  {
    id: "clinicalExam",
    detailKey: "clinicalExamDetail",
    snippetName: "Clínico:",
    title: "Examen Clínico General",
    subtitle: "Evaluación sistémica general: cardiopulmonar, abdomen, tiroides, piel, mucosas y miembros",
    chips: [
      "Palidez moderada/severa",
      "Edema pretibial (+/+++)",
      "Soplo cardiaco",
      "Bocio / Tiroides aumentada",
      "Varices marcadas",
      "Cicatriz operatoria",
    ],
  },
  {
    id: "breastsExam",
    detailKey: "breastsExamDetail",
    snippetName: "Mamas:",
    title: "Examen Clínico de Mamas",
    subtitle: "Inspección, simetría, palpación de nódulos y evaluación de pezones para lactancia materna",
    chips: [
      "Pezón plano / umbilicado",
      "Nódulo mamario palpable",
      "Mastalgia severa",
      "Galactorrea",
      "Secreción sanguinolenta",
      "Retracción cutánea",
    ],
  },
  {
    id: "cervixExam",
    detailKey: "cervixExamDetail",
    snippetName: "Cuello Uterino:",
    title: "Cuello Uterino (Especuloscopía)",
    subtitle: "Inspección visual del cérvix con espéculo, secreciones, ectropion sangrante o lesiones cervicales",
    chips: [
      "Ectropion sangrante al contacto",
      "Pólipo endocervical",
      "Cervicitis mucopurulenta",
      "Flujo vaginal anormal / leucorrea",
      "Lesión sospechosa",
      "Cuello corto",
    ],
  },
  {
    id: "pelvisExam",
    detailKey: "pelvisExamDetail",
    snippetName: "Pelvis:",
    title: "Pelvis (Pelvimetría Clínica)",
    subtitle: "Evaluación pelvimétrica (promontorio, espinas ciáticas, ángulo subpúbico y descarte de DCP)",
    chips: [
      "Pelvis estrecha / DCP probable",
      "Promontorio accesible (Conjugado < 10.5cm)",
      "Espinas ciáticas prominentes",
      "Ángulo subpúbico agudo (< 90°)",
      "Diámetro bi-isquiático reducido",
    ],
  },
  {
    id: "dentalExam",
    detailKey: "dentalExamDetail",
    snippetName: "Odont.:",
    title: "Odontoestomatológico (Salud Bucal)",
    subtitle: "Evaluación bucodental para descarte de focos sépticos, caries profundas, periodontitis o gingivitis gestacional",
    chips: [
      "Caries dental activa múltiple",
      "Gingivitis gestacional sangrante",
      "Enfermedad periodontal",
      "Foco séptico / Infección activa",
      "Piezas ausentes",
      "Dolor / flemón activo",
    ],
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
    antecedentesPersonales: false,
    vacunas: false,
    embarazo: false,
    examenFisico: false,
    laboratorio: true, // Sección 9 desplegada por defecto para revisión inmediata de Kevin
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

    // ==========================================
    // EXÁMENES DE LABORATORIO (MINSA / CLAP)
    // ==========================================
    // Hemoglobina
    hemoglobin1: 12.4,
    hemoglobin1Date: "2026-10-15",
    hemoglobin1NotDone: false,
    hemoglobin2: 12.2,
    hemoglobin2Date: "2027-01-15",
    hemoglobin2NotDone: false,
    hemoglobinDischarge: 12.0,
    hemoglobinDischargeDate: "",
    hemoglobinDischargeNotDone: true,

    // Glicemia & Sobrecarga
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

    // Sífilis & Infecciones de Transmisión Sexual
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

    // Infecciones Especiales & Zoonosis/Vectores
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

    // Orina & Infecciones
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

    // Tamizaje Cervical en Gestantes
    papTestResult: "Normal",
    papTestDate: "2026-10-15",
    ivaaResult: "No se Aplica",
    ivaaDate: "",
    colposcopyResult: "No se Aplica",
    colposcopyDate: "",
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

  // Cálculos reactivos de Somatometría & IMC Basal (Sección 6)
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

  // Alertas de Embarazo Actual, Hospitalización, Emergencias y Violencia (Sección 7)
  const isFumDoubtAlert = baselineData.fumDoubt === true;
  const isHospitalizedAlert = baselineData.hospitalized === true;
  const isEmergencyAlert = baselineData.hadEmergency === true;
  const isViolenceAlert = baselineData.violenceScreening?.violenceDetected === true;

  const section7AlertsCount =
    (isFumDoubtAlert ? 1 : 0) +
    (isHospitalizedAlert ? 1 : 0) +
    (isEmergencyAlert ? 1 : 0) +
    (isViolenceAlert ? 1 : 0);

  // Alertas de Examen Físico Basal (Sección 8)
  const physicalExamAlertsCount = [
    baselineData.clinicalExam,
    baselineData.breastsExam,
    baselineData.cervixExam,
    baselineData.pelvisExam,
    baselineData.dentalExam,
  ].filter((status) => status === "Sin Examen" || status === "Patológico").length;

  const handleMarkAllPhysicalExamsNormal = () => {
    setBaselineData((prev) => ({
      ...prev,
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
    }));
  };

  const handleResetPhysicalExams = () => {
    setBaselineData((prev) => ({
      ...prev,
      clinicalExam: "Sin Examen",
      clinicalExamDetail: "",
      breastsExam: "Sin Examen",
      breastsExamDetail: "",
      cervixExam: "Sin Examen",
      cervixExamDetail: "",
      pelvisExam: "Sin Examen",
      pelvisExamDetail: "",
      dentalExam: "Sin Examen",
      dentalExamDetail: "",
    }));
  };

  // Alertas de Exámenes de Laboratorio (Sección 9)
  const isHb1Anemia = !baselineData.hemoglobin1NotDone && typeof baselineData.hemoglobin1 === "number" && baselineData.hemoglobin1 < 11.0;
  const isHb2Anemia = !baselineData.hemoglobin2NotDone && typeof baselineData.hemoglobin2 === "number" && baselineData.hemoglobin2 < 11.0;
  const isHbDischargeAnemia = !baselineData.hemoglobinDischargeNotDone && typeof baselineData.hemoglobinDischarge === "number" && baselineData.hemoglobinDischarge < 11.0;

  const labPathologicalAlerts: string[] = [];
  if (isHb1Anemia) labPathologicalAlerts.push(`Hb 1: ${baselineData.hemoglobin1} g/dL (Anemia)`);
  if (isHb2Anemia) labPathologicalAlerts.push(`Hb 2: ${baselineData.hemoglobin2} g/dL (Anemia)`);
  if (isHbDischargeAnemia) labPathologicalAlerts.push(`Hb Alta: ${baselineData.hemoglobinDischarge} g/dL (Anemia)`);
  if (baselineData.glucose1Result === "Anormal") labPathologicalAlerts.push("Glicemia 1 Anormal");
  if (baselineData.glucose2Result === "Anormal") labPathologicalAlerts.push("Glicemia 2 Anormal");
  if (baselineData.glucoseToleranceResult === "Anormal") labPathologicalAlerts.push("Tolerancia a Glucosa Anormal");
  if (baselineData.vdrlRpr1Result === "Reactivo") labPathologicalAlerts.push("VDRL/RPR 1 Reactivo");
  if (baselineData.vdrlRpr2Result === "Reactivo") labPathologicalAlerts.push("VDRL/RPR 2 Reactivo");
  if (baselineData.ftaAbsResult === "Reactivo") labPathologicalAlerts.push("FTA Abs. Reactivo");
  if (baselineData.tphaResult === "Reactivo") labPathologicalAlerts.push("TPHA Reactivo");
  if (baselineData.rapidSyphilisResult === "Reactivo") labPathologicalAlerts.push("Prueba Rápida Sífilis Reactiva");
  if (baselineData.hivRapid1Result === "Reactivo") labPathologicalAlerts.push("VIH Prueba Rápida 1 Reactiva");
  if (baselineData.hivRapid2Result === "Reactivo") labPathologicalAlerts.push("VIH Prueba Rápida 2 Reactiva");
  if (baselineData.hivElisaResult === "Reactivo") labPathologicalAlerts.push("VIH ELISA Reactivo");
  if (baselineData.westernBlotResult === "Positivo") labPathologicalAlerts.push("Western Blot Positivo");
  if (baselineData.htlv1Result === "Positivo") labPathologicalAlerts.push("HTLV-I Positivo");
  if (baselineData.torchResult === "Positivo") labPathologicalAlerts.push("TORCH Positivo");
  if (baselineData.thickBloodSmearResult === "Positivo") labPathologicalAlerts.push("Gota Gruesa Positiva (Malaria)");
  if (baselineData.malariaRapidResult === "Positivo") labPathologicalAlerts.push("Malaria Prueba Rápida Positiva");
  if (baselineData.malariaFluorescenceResult === "Positivo") labPathologicalAlerts.push("Fluorescencia Malaria Positiva");
  if (baselineData.completeUrineExamResult === "Positivo") labPathologicalAlerts.push("Examen de Orina Patológico");
  if (baselineData.leukocyturiaResult === "Positivo") labPathologicalAlerts.push("Leucocituria Patológica");
  if (baselineData.nitritesResult === "Positivo") labPathologicalAlerts.push("Nitritos Positivos");
  if (baselineData.urineCultureResult === "Positivo") labPathologicalAlerts.push("Urocultivo Positivo (Bacteriuria)");
  if (baselineData.bkSputumResult === "Positivo") labPathologicalAlerts.push("BK en Esputo Positivo");
  if (baselineData.listeriaResult === "Positivo") labPathologicalAlerts.push("Listeria Positiva");
  if (baselineData.hepatitisBResult === "Positivo") labPathologicalAlerts.push("Hepatitis B Positiva");
  if (baselineData.papTestResult === "Anormal") labPathologicalAlerts.push("PAP Anormal");
  if (baselineData.ivaaResult === "Anormal") labPathologicalAlerts.push("IVAA Anormal");
  if (baselineData.colposcopyResult === "Anormal") labPathologicalAlerts.push("Colposcopia Anormal");

  const labPendingCount = [
    baselineData.hemoglobin1NotDone,
    baselineData.hemoglobin2NotDone,
    baselineData.glucose1Result === "No se Hizo",
    baselineData.glucose2Result === "No se Hizo",
    baselineData.glucoseToleranceResult === "No se Hizo",
    baselineData.vdrlRpr1Result === "No se Hizo",
    baselineData.vdrlRpr2Result === "No se Hizo",
    baselineData.ftaAbsResult === "No se Hizo",
    baselineData.tphaResult === "No se Hizo",
    baselineData.rapidSyphilisResult === "No se Hizo",
    baselineData.hivRapid1Result === "No se Hizo",
    baselineData.hivRapid2Result === "No se Hizo",
    baselineData.hivElisaResult === "No se Hizo",
    baselineData.westernBlotResult === "No se Hizo",
    baselineData.htlv1Result === "No se Hizo",
    baselineData.torchResult === "No se Hizo",
    baselineData.thickBloodSmearResult === "No se Hizo",
    baselineData.malariaRapidResult === "No se Hizo",
    baselineData.malariaFluorescenceResult === "No se Hizo",
    baselineData.completeUrineExamResult === "No se Hizo",
    baselineData.leukocyturiaResult === "No se Hizo",
    baselineData.nitritesResult === "No se Hizo",
    baselineData.urineCultureResult === "No se Hizo",
    baselineData.bkSputumResult === "No se Hizo",
    baselineData.listeriaResult === "No se Hizo",
    baselineData.hepatitisBResult === "No se Hizo",
    baselineData.papTestResult === "No se Hizo",
    baselineData.ivaaResult === "No se Hizo",
    baselineData.colposcopyResult === "No se Hizo",
  ].filter(Boolean).length;

  const handleFillNormalLabPanel = () => {
    setBaselineData((prev) => ({
      ...prev,
      hemoglobin1: 12.4,
      hemoglobin1Date: todayStr,
      hemoglobin1NotDone: false,
      hemoglobin2: 12.2,
      hemoglobin2Date: todayStr,
      hemoglobin2NotDone: false,
      hemoglobinDischarge: 12.0,
      hemoglobinDischargeDate: "",
      hemoglobinDischargeNotDone: true,
      bloodGlucose1: 84,
      bloodGlucose1Date: todayStr,
      glucose1Result: "Normal",
      glucose1Date: todayStr,
      glucose1Value: 84,
      glucose2Result: "Normal",
      glucose2Date: todayStr,
      glucose2Value: 86,
      glucoseToleranceResult: "No se Aplica",
      glucoseToleranceDate: "",
      vdrlRpr1: "No reactivo",
      vdrlRpr1Date: todayStr,
      vdrlRpr1Result: "No reactivo",
      vdrlRpr2Result: "No se Aplica",
      ftaAbsResult: "No se Aplica",
      tphaResult: "No se Aplica",
      rapidSyphilisResult: "No reactivo",
      rapidSyphilisDate: todayStr,
      hivScreening1: "Negativo",
      hivScreening1Date: todayStr,
      hivRapid1Result: "No reactivo",
      hivRapid1Date: todayStr,
      hivRapid2Result: "No se Aplica",
      hivElisaResult: "No se Aplica",
      westernBlotResult: "No se Aplica",
      htlv1Result: "Negativo",
      htlv1Date: todayStr,
      torchResult: "No se Aplica",
      thickBloodSmearResult: "No se Aplica",
      malariaRapidResult: "No se Aplica",
      malariaFluorescenceResult: "No se Aplica",
      completeUrineExam: "Normal",
      completeUrineExamDate: todayStr,
      completeUrineExamResult: "Negativo",
      leukocyturiaResult: "Negativo",
      nitritesResult: "Negativo",
      nitritesDate: todayStr,
      urineCulture: "Negativo",
      urineCultureResult: "Negativo",
      urineCultureDate: todayStr,
      bkSputumResult: "No se Aplica",
      listeriaResult: "No se Aplica",
      hepatitisBScreening: "Negativo",
      hepatitisBScreeningDate: todayStr,
      hepatitisBResult: "Negativo",
      hepatitisBDate: todayStr,
      papTestResult: "Normal",
      papTestDate: todayStr,
      ivaaResult: "No se Aplica",
      colposcopyResult: "No se Aplica",
    }));
  };

  const handleResetLabPanel = () => {
    setBaselineData((prev) => ({
      ...prev,
      hemoglobin1NotDone: true,
      hemoglobin2NotDone: true,
      hemoglobinDischargeNotDone: true,
      glucose1Result: "No se Hizo",
      glucose2Result: "No se Hizo",
      glucoseToleranceResult: "No se Hizo",
      vdrlRpr1Result: "No se Hizo",
      vdrlRpr2Result: "No se Hizo",
      ftaAbsResult: "No se Hizo",
      tphaResult: "No se Hizo",
      rapidSyphilisResult: "No se Hizo",
      hivRapid1Result: "No se Hizo",
      hivRapid2Result: "No se Hizo",
      hivElisaResult: "No se Hizo",
      westernBlotResult: "No se Hizo",
      htlv1Result: "No se Hizo",
      torchResult: "No se Hizo",
      thickBloodSmearResult: "No se Hizo",
      malariaRapidResult: "No se Hizo",
      malariaFluorescenceResult: "No se Hizo",
      completeUrineExamResult: "No se Hizo",
      leukocyturiaResult: "No se Hizo",
      nitritesResult: "No se Hizo",
      urineCultureResult: "No se Hizo",
      bkSputumResult: "No se Hizo",
      listeriaResult: "No se Hizo",
      hepatitisBResult: "No se Hizo",
      papTestResult: "No se Hizo",
      ivaaResult: "No se Hizo",
      colposcopyResult: "No se Hizo",
    }));
  };

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

  // Helper de renderizado para cada fila de laboratorio del Carnet MINSA
  const renderLabRow = ({
    label,
    value,
    onChange,
    dateValue,
    onDateChange,
    safeText = "Normal",
    alertText = "Anormal",
    hasNoApplies = false,
    numericVal,
    onNumericChange,
    numericUnit,
    badge,
  }: {
    label: string;
    value?: string;
    onChange: (val: string) => void;
    dateValue?: string;
    onDateChange?: (date: string) => void;
    safeText?: string;
    alertText?: string;
    hasNoApplies?: boolean;
    numericVal?: number;
    onNumericChange?: (val: number | undefined) => void;
    numericUnit?: string;
    badge?: string;
  }) => {
    const isSafe = value === safeText;
    const isAlert = value === alertText;
    const isNotDone = value === "No se Hizo";
    const isNoApplies = value === "No se Aplica";

    return (
      <div
        className={`p-2.5 rounded-lg border transition-all flex flex-col md:flex-row md:items-center justify-between gap-2.5 ${
          isAlert
            ? "bg-amber-100/70 border-amber-400 ring-1 ring-amber-300 shadow-2xs"
            : isNotDone
            ? "bg-amber-50/40 border-amber-200"
            : "bg-white border-slate-200 hover:border-slate-300"
        }`}
      >
        {/* Etiqueta del examen */}
        <div className="flex items-center gap-1.5 min-w-[130px] shrink-0">
          <span className="text-xs font-bold text-slate-800">{label}</span>
          {badge && (
            <span className="text-[10px] text-slate-500 font-mono italic">({badge})</span>
          )}
        </div>

        {/* Segmented Selector idéntico a las casillas del Carnet */}
        <div className="flex items-center gap-1 flex-wrap shrink-0">
          {/* Opción 1: Seguro (Normal / Negativo / No reactivo) */}
          <button
            type="button"
            onClick={() => onChange(safeText)}
            className={`px-2 py-1 rounded border text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              isSafe
                ? "bg-emerald-100 border-emerald-500 text-emerald-950 shadow-2xs"
                : "bg-white hover:bg-slate-50 border-slate-300 text-slate-700"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-white border border-slate-400 inline-block shrink-0" />
            <span>{safeText}</span>
            <span className="text-[9px] font-mono text-slate-500">[ ]</span>
          </button>

          {/* Opción 2: Alerta (Anormal / Positivo / Reactivo) */}
          <button
            type="button"
            onClick={() => onChange(alertText)}
            className={`px-2 py-1 rounded border text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              isAlert
                ? "bg-amber-300 border-amber-500 text-amber-950 shadow-2xs ring-1 ring-amber-400"
                : "bg-amber-50/50 hover:bg-amber-100 border-amber-200 text-amber-900"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 border border-amber-600 inline-block shrink-0 shadow-2xs" />
            <span>{alertText}</span>
            <span className="text-[9px] font-mono text-amber-900">[🟨]</span>
          </button>

          {/* Opción 3: No se Hizo */}
          <button
            type="button"
            onClick={() => onChange("No se Hizo")}
            className={`px-2 py-1 rounded border text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              isNotDone
                ? "bg-amber-300 border-amber-500 text-amber-950 shadow-2xs ring-1 ring-amber-400"
                : "bg-amber-50/50 hover:bg-amber-100 border-amber-200 text-amber-900"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 border border-amber-600 inline-block shrink-0 shadow-2xs" />
            <span>No se Hizo</span>
            <span className="text-[9px] font-mono text-amber-900">[🟨]</span>
          </button>

          {/* Opción 4: No se Aplica */}
          {hasNoApplies && (
            <button
              type="button"
              onClick={() => onChange("No se Aplica")}
              className={`px-2 py-1 rounded border text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isNoApplies
                  ? "bg-slate-200 border-slate-500 text-slate-900 shadow-2xs"
                  : "bg-white hover:bg-slate-50 border-slate-300 text-slate-600"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-white border border-slate-400 inline-block shrink-0" />
              <span>No Aplica</span>
              <span className="text-[9px] font-mono text-slate-500">[ ]</span>
            </button>
          )}
        </div>

        {/* Input Numérico Opcional y Fecha */}
        <div className="flex items-center gap-2 shrink-0">
          {numericUnit && (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={numericVal !== undefined ? numericVal : ""}
                onChange={(e) => onNumericChange?.(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0"
                className="w-14 text-xs font-mono font-bold px-1.5 py-1 rounded border border-slate-300 bg-slate-50 text-slate-800 text-center"
              />
              <span className="text-[10px] text-slate-500 font-mono">{numericUnit}</span>
            </div>
          )}

          {onDateChange && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500 font-mono">Fecha:</span>
              <input
                type="date"
                value={dateValue || ""}
                onChange={(e) => onDateChange(e.target.value)}
                className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50 text-slate-800"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper de renderizado para Hemoglobina con casillas Hg(%)
  const renderHemoglobinRow = ({
    label,
    val,
    onValChange,
    notDone,
    onNotDoneChange,
    dateVal,
    onDateChange,
  }: {
    label: string;
    val?: number;
    onValChange: (v: number | undefined) => void;
    notDone?: boolean;
    onNotDoneChange: (nd: boolean) => void;
    dateVal?: string;
    onDateChange: (d: string) => void;
  }) => {
    const isAnemia = !notDone && typeof val === "number" && val < 11.0;
    const isSevereAnemia = !notDone && typeof val === "number" && val < 7.0;

    return (
      <div
        className={`p-3 rounded-lg border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isSevereAnemia
            ? "bg-rose-50 border-rose-400 ring-1 ring-rose-300"
            : isAnemia
            ? "bg-amber-50/80 border-amber-400 ring-1 ring-amber-300"
            : notDone
            ? "bg-amber-50/40 border-amber-200"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center gap-2 min-w-[140px] shrink-0">
          <span className="text-xs font-bold text-slate-800">{label}</span>
          {!notDone && typeof val === "number" && (
            <span
              className={`text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                isSevereAnemia
                  ? "bg-rose-500 text-white"
                  : isAnemia
                  ? "bg-amber-400 text-amber-950"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {isSevereAnemia ? "Severa (<7)" : isAnemia ? "Anemia (<11)" : "Normal"}
            </span>
          )}
        </div>

        {/* 3 Casillas [ ][ ].[ ] Hg(%) */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-slate-500 font-bold">Hg(%):</span>
            <input
              type="number"
              step="0.1"
              disabled={notDone}
              value={val !== undefined ? val : ""}
              onChange={(e) => onValChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="12.0"
              className="w-18 text-xs font-mono font-black text-center px-2 py-1 rounded border border-slate-300 bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400"
            />
            <span className="text-[10px] text-slate-500 font-mono">g/dL</span>
          </div>

          {/* No se Hizo [🟨] */}
          <button
            type="button"
            onClick={() => onNotDoneChange(!notDone)}
            className={`px-2.5 py-1 rounded border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              notDone
                ? "bg-amber-300 border-amber-500 text-amber-950 shadow-2xs ring-1 ring-amber-400"
                : "bg-amber-50/60 hover:bg-amber-100 border-amber-200 text-amber-900"
            }`}
          >
            <span className="w-3 h-3 rounded-xs bg-amber-400 border border-amber-600 inline-block shrink-0 shadow-2xs" />
            <span>No se Hizo</span>
            <span className="text-[10px] font-mono text-amber-900">[🟨]</span>
          </button>

          {/* Fecha */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-mono">Fecha:</span>
            <input
              type="date"
              value={dateVal || ""}
              onChange={(e) => onDateChange(e.target.value)}
              className="text-[11px] font-mono px-2 py-1 rounded border border-slate-300 bg-slate-50 text-slate-800"
            />
          </div>
        </div>
      </div>
    );
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
              ACORDEÓN 6: INMUNIZACIONES, SOMATOMETRÍA, GRUPO/RH & HÁBITOS NOCIVOS
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("vacunas")}
              className="w-full p-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                  6
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  INMUNIZACIONES, SOMATOMETRÍA, GRUPO SANGUÍNEO & HÁBITOS NOCIVOS
                </span>

                {/* Badges de alerta y seguimiento continuo */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {section6ContinuousCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black border border-red-700 shadow-2xs animate-pulse">
                      🟥 {section6ContinuousCount} Seguimiento continuo
                    </span>
                  )}
                  {section6AlertsCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black border border-amber-500 shadow-2xs">
                      🟨 {section6AlertsCount} {section6AlertsCount === 1 ? "Alerta" : "Alertas"}
                    </span>
                  )}
                  {section6ContinuousCount === 0 && section6AlertsCount === 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Parámetros basales normales
                    </span>
                  )}
                </div>
              </div>

              {openSections.vacunas ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {openSections.vacunas && (
              <div className="p-4 sm:p-6 space-y-5 text-xs border-t border-border bg-white">
                
                {/* 6.1 Barra Superior de Resumen y Acción Rápida */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-heading font-extrabold text-heading uppercase">
                        Matriz de Inmunizaciones, Antropometría, Inmunohematología & Hábitos
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Registro integrado de 5 bloques: Vacunas Previas, Antitetánica, Peso y Talla, Tipo de Sangre (Rh) y Hábitos Nocivos.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setBaselineData({
                          ...baselineData,
                          previousVaccines: { rubella: true, hepatitisB: true, hpv: true, yellowFever: true },
                          antitetanicaStatus: "Vacunada",
                          antitetanicaDosis: "2da",
                          bloodGroup: "O",
                          rhFactor: "Rh (+)",
                          smokerCigarettesDay: 0,
                          drugsUse: false,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Cargar perfil basal típico sin factores de riesgo"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>✓ Parámetros Típicos (O Rh+, No Fuma, No Drogas)</span>
                    </button>
                  </div>
                </div>

                {/* 6.2 Grid Integrado de los 5 Bloques Clínicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  
                  {/* BLOQUE 1: VACUNAS PREVIAS */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Vac. Previas
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Inmunizaciones previas</span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { key: "rubella", label: "Rubeola", hint: "Protección contra síndrome rubeola congénita" },
                        { key: "hepatitisB", label: "Hepatitis B", hint: "Prevención de transmisión vertical VHB" },
                        { key: "hpv", label: "Papiloma Virus (VPH)", hint: "Prevención de lesiones cervicales" },
                        { key: "yellowFever", label: "Fiebre Amarilla", hint: "Relevante en zona endémica / viajes" },
                      ].map((vac) => {
                        const isYes = (baselineData.previousVaccines as any)?.[vac.key] !== false;
                        return (
                          <div
                            key={vac.key}
                            className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2"
                          >
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">{vac.label}</span>
                              <span className="text-[10px] text-slate-500">{vac.hint}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setBaselineData({
                                    ...baselineData,
                                    previousVaccines: {
                                      ...(baselineData.previousVaccines || { rubella: true, hepatitisB: true, hpv: true, yellowFever: true }),
                                      [vac.key]: true,
                                    },
                                  })
                                }
                                className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all cursor-pointer ${
                                  isYes
                                    ? "bg-emerald-600 text-white shadow-2xs"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                }`}
                              >
                                Si
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setBaselineData({
                                    ...baselineData,
                                    previousVaccines: {
                                      ...(baselineData.previousVaccines || { rubella: true, hepatitisB: true, hpv: true, yellowFever: true }),
                                      [vac.key]: false,
                                    },
                                  })
                                }
                                className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all cursor-pointer ${
                                  !isYes
                                    ? "bg-amber-500 text-white shadow-2xs"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                }`}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* BLOQUE 2: ANTITETÁNICA */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Antitetánica
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">dTpa / Tétanos neonatal</span>
                    </div>

                    <div className="space-y-2.5">
                      {/* N° Dosis Previa */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">N° Dosis Previa:</span>
                          <span className="text-[10px] text-slate-500">Recibidas antes de esta gestación</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            max={5}
                            value={baselineData.antitetanicaPrevDoses ?? 1}
                            onChange={(e) =>
                              setBaselineData({
                                ...baselineData,
                                antitetanicaPrevDoses: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="w-12 text-center font-mono font-bold text-xs border border-slate-300 rounded-md bg-slate-50 py-1"
                          />
                          <span className="text-xs font-semibold text-slate-600">dosis</span>
                        </div>
                      </div>

                      {/* Dosis mes de gestación: 1ra y 2da */}
                      <div className="p-2 rounded-lg bg-white border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-800 block">Dosis (Mes de Gestación):</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-600 block mb-1">1ra Dosis:</label>
                            <input
                              type="text"
                              value={baselineData.antitetanica1stDoseMonth || ""}
                              onChange={(e) =>
                                setBaselineData({
                                  ...baselineData,
                                  antitetanica1stDoseMonth: e.target.value,
                                })
                              }
                              placeholder="ej. 4to mes / 20 sem"
                              className="w-full text-xs px-2 py-1 rounded border border-slate-300 bg-slate-50 font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-600 block mb-1">2da Dosis:</label>
                            <input
                              type="text"
                              value={baselineData.antitetanica2ndDoseMonth || ""}
                              onChange={(e) =>
                                setBaselineData({
                                  ...baselineData,
                                  antitetanica2ndDoseMonth: e.target.value,
                                })
                              }
                              placeholder="ej. 6to mes / 28 sem"
                              className="w-full text-xs px-2 py-1 rounded border border-slate-300 bg-slate-50 font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Estados: Sin dosis [ALERTA] y No Aplica */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {/* Sin dosis [ALERTA] */}
                        <label
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                            baselineData.antitetanicaStatus === "Sin dosis"
                              ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                              : "bg-amber-50/70 border-amber-200 text-amber-900"
                          }`}
                        >
                          <span className="text-xs font-bold">Sin dosis [ALERTA]</span>
                          <input
                            type="radio"
                            name="antitetanicaStatusRadio"
                            checked={baselineData.antitetanicaStatus === "Sin dosis"}
                            onChange={() =>
                              setBaselineData({
                                ...baselineData,
                                antitetanicaStatus: "Sin dosis",
                                antitetanicaDosis: "Sin dosis",
                              })
                            }
                            className="text-amber-600 focus:ring-0"
                          />
                        </label>

                        {/* No Aplica */}
                        <label
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                            baselineData.antitetanicaStatus === "No Aplica"
                              ? "bg-slate-200 border-slate-400 text-slate-900 font-bold"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <span className="text-xs font-semibold">No Aplica</span>
                          <input
                            type="radio"
                            name="antitetanicaStatusRadio"
                            checked={baselineData.antitetanicaStatus === "No Aplica"}
                            onChange={() =>
                              setBaselineData({
                                ...baselineData,
                                antitetanicaStatus: "No Aplica",
                                antitetanicaDosis: "No aplica",
                              })
                            }
                            className="text-primary focus:ring-0"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 3: PESO Y TALLA (SOMATOMETRÍA & IMC) */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                          Peso y Talla
                        </span>
                        <span className="text-[10px] text-slate-500 italic">peso antes del embarazo.</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Somatometría</span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Peso Habitual : [ ][ ] kg */}
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Peso Habitual:</span>
                          <span className="text-[10px] text-slate-500">Peso pregestacional en kg</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setBaselineData({
                                ...baselineData,
                                usualWeightKg: Math.max(30, (baselineData.usualWeightKg || 55) - 1),
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                          >
                            -
                          </button>
                          <div className="flex items-center gap-0.5">
                            {String(Math.round(baselineData.usualWeightKg || 58))
                              .padStart(2, "0")
                              .slice(-2)
                              .split("")
                              .map((digit, i) => (
                                <span
                                  key={i}
                                  className="w-7 h-8 border-2 border-slate-400 bg-white rounded-xs flex items-center justify-center font-mono font-black text-sm text-slate-900 shadow-2xs"
                                >
                                  {digit}
                                </span>
                              ))}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setBaselineData({
                                ...baselineData,
                                usualWeightKg: Math.min(180, (baselineData.usualWeightKg || 55) + 1),
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                          >
                            +
                          </button>
                          <span className="text-xs font-bold text-slate-700 ml-1">kg</span>
                        </div>
                      </div>

                      {/* Talla : [ 1 ][ ][ ] cm */}
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Talla:</span>
                          <span className="text-[10px] text-slate-500">Estatura materna en cm</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setBaselineData({
                                ...baselineData,
                                heightCm: Math.max(120, (baselineData.heightCm || 160) - 1),
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                          >
                            -
                          </button>
                          <div className="flex items-center gap-0.5">
                            <span
                              className="w-7 h-8 border-2 border-slate-400 bg-slate-100 rounded-xs flex items-center justify-center font-mono font-black text-sm text-slate-700 shadow-2xs"
                              title="Preimpreso '1'"
                            >
                              1
                            </span>
                            {String(Math.round(baselineData.heightCm || 162))
                              .slice(1)
                              .padStart(2, "0")
                              .slice(-2)
                              .split("")
                              .map((digit, i) => (
                                <span
                                  key={i}
                                  className="w-7 h-8 border-2 border-slate-400 bg-white rounded-xs flex items-center justify-center font-mono font-black text-sm text-slate-900 shadow-2xs"
                                >
                                  {digit}
                                </span>
                              ))}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setBaselineData({
                                ...baselineData,
                                heightCm: Math.min(210, (baselineData.heightCm || 160) + 1),
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                          >
                            +
                          </button>
                          <span className="text-xs font-bold text-slate-700 ml-1">cm</span>
                        </div>
                      </div>

                      {/* Cálculo Dinámico de IMC */}
                      <div
                        className={`p-2.5 rounded-lg border flex items-center justify-between ${
                          isBasalObesity || isBasalUnderweight
                            ? "bg-amber-100 border-amber-300 text-amber-950"
                            : isBasalOverweight
                            ? "bg-amber-50 border-amber-200 text-amber-900"
                            : "bg-emerald-50 border-emerald-200 text-emerald-900"
                        }`}
                      >
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider block">IMC Pregestacional:</span>
                          <span className="text-xs font-black">
                            {basalImc ? `${basalImc} kg/m²` : "--"}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isBasalUnderweight
                                ? "bg-amber-300 text-amber-950 border border-amber-400"
                                : isBasalOverweight
                                ? "bg-amber-200 text-amber-900 border border-amber-300"
                                : isBasalObesity
                                ? "bg-amber-400 text-amber-950 border border-amber-500 font-black"
                                : "bg-emerald-200 text-emerald-900 border border-emerald-300"
                            }`}
                          >
                            {isBasalUnderweight
                              ? "Bajo Peso [ALERTA]"
                              : isBasalOverweight
                              ? "Sobrepeso [ALERTA]"
                              : isBasalObesity
                              ? "Obesidad [ALERTA]"
                              : "Peso Adecuado (Eutrófica)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 4: TIPO DE SANGRE & FACTOR RH (SPAN 2 COLS) */}
                  <div className="lg:col-span-2 p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                          Tipo de sangre
                        </span>
                        {baselineData.rhFactor === "Rh (-) Sensibilizada" && (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black border border-red-700 animate-pulse">
                            🟥 SEGUIMIENTO CONTINUO: ISOINMUNIZACIÓN RH
                          </span>
                        )}
                        {(baselineData.rhFactor === "Rh (-) No Sensibilizada" || baselineData.rhFactor === "Rh (-) Desconocida") && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black border border-amber-500">
                            🟨 ALERTA: GESTANTE RH NEGATIVO
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Inmunohematología</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Grupo ABO */}
                      <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-800 block uppercase tracking-wide">
                          Grupo:
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          {["A", "B", "AB", "O"].map((grp) => (
                            <label
                              key={grp}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-all ${
                                baselineData.bloodGroup === grp
                                  ? "bg-slate-900 border-slate-900 text-white font-black shadow-xs ring-2 ring-slate-400"
                                  : "bg-white border-slate-300 hover:border-slate-400 text-slate-800 font-bold"
                              }`}
                            >
                              <span className="text-sm font-mono">{grp}</span>
                              <input
                                type="radio"
                                name="bloodGroupRadio"
                                checked={baselineData.bloodGroup === grp}
                                onChange={() => setBaselineData({ ...baselineData, bloodGroup: grp })}
                                className="sr-only"
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Factor Rh */}
                      <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-800 block uppercase tracking-wide">
                          Factor Rh:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Rh (+) [ ] */}
                          <label
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                              baselineData.rhFactor === "Rh (+)" || !baselineData.rhFactor
                                ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs"
                                : "bg-white border-slate-200 text-slate-700"
                            }`}
                          >
                            <span className="text-xs font-semibold">Rh (+)</span>
                            <input
                              type="radio"
                              name="rhFactorRadio"
                              checked={baselineData.rhFactor === "Rh (+)" || !baselineData.rhFactor}
                              onChange={() => setBaselineData({ ...baselineData, rhFactor: "Rh (+)" })}
                              className="text-emerald-600 focus:ring-0"
                            />
                          </label>

                          {/* Rh(-) Sen Desc [ALERTA] */}
                          <label
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                              baselineData.rhFactor === "Rh (-) Desconocida"
                                ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                                : "bg-amber-50/70 border-amber-200 text-amber-900"
                            }`}
                            title="Sensibilización desconocida: solicitar Coombs indirecto"
                          >
                            <span className="text-xs font-bold">Rh(-) Sen Desc [ALERTA]</span>
                            <input
                              type="radio"
                              name="rhFactorRadio"
                              checked={baselineData.rhFactor === "Rh (-) Desconocida"}
                              onChange={() => setBaselineData({ ...baselineData, rhFactor: "Rh (-) Desconocida" })}
                              className="text-amber-600 focus:ring-0"
                            />
                          </label>

                          {/* Rh(-) No Sen [ALERTA] */}
                          <label
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                              baselineData.rhFactor === "Rh (-) No Sensibilizada"
                                ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                                : "bg-amber-50/70 border-amber-200 text-amber-900"
                            }`}
                            title="No sensibilizada: indicar profilaxis con Ig anti-D"
                          >
                            <span className="text-xs font-bold">Rh(-) No Sen [ALERTA]</span>
                            <input
                              type="radio"
                              name="rhFactorRadio"
                              checked={baselineData.rhFactor === "Rh (-) No Sensibilizada"}
                              onChange={() => setBaselineData({ ...baselineData, rhFactor: "Rh (-) No Sensibilizada" })}
                              className="text-amber-600 focus:ring-0"
                            />
                          </label>

                          {/* Rh(-) Sen [ROJO] */}
                          <label
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                              baselineData.rhFactor === "Rh (-) Sensibilizada"
                                ? "bg-red-600 border-red-700 text-white font-black shadow-xs ring-2 ring-red-400"
                                : "bg-red-50 border-red-200 text-red-900 font-bold"
                            }`}
                            title="Seguimiento continuo: isoinmunización Rh confirmada"
                          >
                            <span className="text-xs font-bold">Rh(-) Sen [ROJO]</span>
                            <input
                              type="radio"
                              name="rhFactorRadio"
                              checked={baselineData.rhFactor === "Rh (-) Sensibilizada"}
                              onChange={() => setBaselineData({ ...baselineData, rhFactor: "Rh (-) Sensibilizada" })}
                              className="text-red-600 focus:ring-0"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 5: HÁBITOS NOCIVOS (FUMA & DROGAS) (1 COL) */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Hábitos Nocivos
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Toxicología</span>
                    </div>

                    <div className="space-y-3">
                      {/* Fuma */}
                      <div
                        className={`p-2.5 rounded-lg border transition-all ${
                          (baselineData.smokerCigarettesDay || 0) > 0
                            ? "bg-amber-100 border-amber-300 text-amber-950"
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold uppercase">Fuma:</span>
                          {(baselineData.smokerCigarettesDay || 0) > 0 && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-300 text-amber-950 border border-amber-400">
                              ALERTA
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-600">N° Cigarros / día:</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              max={60}
                              value={baselineData.smokerCigarettesDay || 0}
                              onChange={(e) =>
                                setBaselineData({
                                  ...baselineData,
                                  smokerCigarettesDay: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className="w-14 text-center font-mono font-bold text-xs border border-slate-300 rounded bg-white py-1"
                            />
                            <span className="text-xs text-slate-600">cig/d</span>
                          </div>
                        </div>
                      </div>

                      {/* Drogas */}
                      <div
                        className={`p-2.5 rounded-lg border transition-all ${
                          baselineData.drugsUse === true
                            ? "bg-red-50 border-red-300 text-red-950 ring-1 ring-red-400"
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold uppercase">Drogas:</span>
                          {baselineData.drugsUse === true && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-red-600 text-white border border-red-700">
                              SEGUIMIENTO ROJO
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Si [ROJO] */}
                          <label
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                              baselineData.drugsUse === true
                                ? "bg-red-600 border-red-700 text-white font-black shadow-xs ring-1 ring-red-400"
                                : "bg-red-50 border-red-200 text-red-900 font-bold"
                            }`}
                            title="Seguimiento continuo: consumo de sustancias"
                          >
                            <span className="text-xs font-bold">Si [ROJO]</span>
                            <input
                              type="radio"
                              name="drugsUseRadio"
                              checked={baselineData.drugsUse === true}
                              onChange={() => setBaselineData({ ...baselineData, drugsUse: true })}
                              className="text-red-600 focus:ring-0"
                            />
                          </label>

                          {/* No [ ] */}
                          <label
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                              baselineData.drugsUse !== true
                                ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                                : "bg-white border-slate-200 text-slate-700"
                            }`}
                          >
                            <span className="text-xs font-semibold">No</span>
                            <input
                              type="radio"
                              name="drugsUseRadio"
                              checked={baselineData.drugsUse !== true}
                              onChange={() => setBaselineData({ ...baselineData, drugsUse: false })}
                              className="text-emerald-600 focus:ring-0"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 6.3 Nota Clínica de Vigilancia Obstétrica */}
                <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-200 text-blue-900 flex items-center justify-center shrink-0 mt-0.5">
                    <FlaskConical className="w-4 h-4 text-blue-700" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                        Evaluación Inmunohematológica & Factores Fisiológicos Basales
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200 text-blue-950 font-semibold border border-blue-300">
                        Norma Técnica MINSA
                      </span>
                    </div>
                    <p className="text-xs text-blue-950 italic font-semibold leading-relaxed">
                      El peso pregestacional permite calcular el IMC basal y definir la meta de ganancia ponderal durante el embarazo.
                    </p>
                    <p className="text-[11px] text-blue-900/90 leading-tight">
                      La gestante con <strong>Rh(-) Sensibilizada</strong> o consumo de <strong>Drogas</strong> se estratifica de inmediato como <strong>Alto Riesgo Obstétrico (ARO)</strong> con seguimiento continuo por medicina materno-fetal.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 7: EMBARAZO ACTUAL, HOSPITALIZACIÓN, EMERGENCIA & VIOLENCIA
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("embarazo")}
              className="w-full p-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center shrink-0">
                  7
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  DATOS BASALES DEL EMBARAZO ACTUAL (FUM, ECOGRAFÍA, FPP, HOSPITALIZACIÓN & VIOLENCIA)
                </span>

                {/* Badges de alerta */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {section7AlertsCount > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black border border-amber-500 shadow-2xs">
                      🟨 {section7AlertsCount} {section7AlertsCount === 1 ? "Alerta" : "Alertas"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      <Check className="w-3 h-3 text-emerald-600" />
                      FUM confiable & sin eventos agudos
                    </span>
                  )}
                </div>
              </div>

              {openSections.embarazo ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {openSections.embarazo && (
              <div className="p-4 sm:p-6 space-y-5 text-xs border-t border-border bg-white">
                
                {/* 7.1 Barra Superior de Resumen y Cálculo FPP */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-heading font-extrabold text-heading uppercase">
                        Cronología Obstétrica & Eventos Intercurrentes (MINSA / CLAP)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Cálculo de EG actual ({currentGestAge.formatted}), FPP Naegele, primera ecografía, antecedentes de hospitalización y tamizaje de violencia.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const calculated = calculateNaegeleFPP(baselineData.fum);
                        setBaselineData({
                          ...baselineData,
                          fpp: calculated,
                          fumDoubt: false,
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Recalcular FPP con Regla de Naegele"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>Recalcular FPP Naegele</span>
                    </button>
                  </div>
                </div>

                {/* 7.2 Grid de 4 Bloques (2x2) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                  
                  {/* BLOQUE 1: FUM, ECOGRAFÍA & FPP */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Fecha última Menstruación
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">FUM & Ecografía Precoz</span>
                    </div>

                    {/* FUM y Duda */}
                    <div className="p-3 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">FUM :</span>
                        <input
                          type="date"
                          value={baselineData.fum}
                          onChange={(e) => {
                            const newFum = e.target.value;
                            setBaselineData({
                              ...baselineData,
                              fum: newFum,
                              fpp: calculateNaegeleFPP(newFum),
                            });
                          }}
                          className="text-xs font-mono font-bold px-2.5 py-1.5 rounded-md border border-slate-300 bg-slate-50 text-slate-800"
                        />
                      </div>

                      {/* Duda: Si [ALERTA] / No */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">Duda :</span>
                        <div className="flex items-center gap-1.5">
                          <label
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                              baselineData.fumDoubt
                                ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                                : "bg-amber-50/60 border-amber-200 text-amber-900"
                            }`}
                          >
                            <span className="text-xs">Si [ALERTA]</span>
                            <input
                              type="radio"
                              name="fumDoubtRadio"
                              checked={baselineData.fumDoubt === true}
                              onChange={() => setBaselineData({ ...baselineData, fumDoubt: true })}
                              className="text-amber-600 focus:ring-0"
                            />
                          </label>

                          <label
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                              !baselineData.fumDoubt
                                ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                                : "bg-white border-slate-200 text-slate-700"
                            }`}
                          >
                            <span className="text-xs">No</span>
                            <input
                              type="radio"
                              name="fumDoubtRadio"
                              checked={!baselineData.fumDoubt}
                              onChange={() => setBaselineData({ ...baselineData, fumDoubt: false })}
                              className="text-emerald-600 focus:ring-0"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* EG. (Ecografía) - "la primera ecografía" */}
                    <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">EG. (Ecografía) :</span>
                          <span className="text-[10px] text-slate-500 italic">la primera ecografía</span>
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={baselineData.ultrasoundNoApplies === true}
                            onChange={(e) =>
                              setBaselineData({
                                ...baselineData,
                                ultrasoundNoApplies: e.target.checked,
                              })
                            }
                            className="rounded text-primary focus:ring-0"
                          />
                          <span>No Aplica</span>
                        </label>
                      </div>

                      {!baselineData.ultrasoundNoApplies && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                          {/* Casillas [ ][ ] Sem. */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setBaselineData({
                                  ...baselineData,
                                  ultrasoundGestationalAgeWeeks: Math.max(
                                    4,
                                    (baselineData.ultrasoundGestationalAgeWeeks || 8) - 1
                                  ),
                                })
                              }
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                            >
                              -
                            </button>
                            <div className="flex items-center gap-0.5">
                              {String(baselineData.ultrasoundGestationalAgeWeeks || 7)
                                .padStart(2, "0")
                                .slice(-2)
                                .split("")
                                .map((d, i) => (
                                  <span
                                    key={i}
                                    className="w-7 h-8 border-2 border-slate-400 bg-white rounded-xs flex items-center justify-center font-mono font-black text-sm text-slate-900 shadow-2xs"
                                  >
                                    {d}
                                  </span>
                                ))}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setBaselineData({
                                  ...baselineData,
                                  ultrasoundGestationalAgeWeeks: Math.min(
                                    42,
                                    (baselineData.ultrasoundGestationalAgeWeeks || 8) + 1
                                  ),
                                })
                              }
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                            >
                              +
                            </button>
                            <span className="text-xs font-bold text-slate-700 ml-1">Sem.</span>
                          </div>

                          {/* Fecha de ecografía */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-600">Fecha :</span>
                            <input
                              type="date"
                              value={baselineData.ultrasoundDate || ""}
                              onChange={(e) =>
                                setBaselineData({
                                  ...baselineData,
                                  ultrasoundDate: e.target.value,
                                })
                              }
                              className="text-xs font-mono font-medium px-2 py-1 rounded border border-slate-300 bg-slate-50"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fecha Probable de Parto (FPP) */}
                    <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-sky-950 uppercase tracking-wide block">
                          Fecha Probable de Parto:
                        </span>
                        <span className="text-[10px] text-sky-800">
                          EG Actual: <strong>{currentGestAge.formatted}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="date"
                          value={baselineData.fpp}
                          onChange={(e) =>
                            setBaselineData({
                              ...baselineData,
                              fpp: e.target.value,
                            })
                          }
                          className="text-xs font-mono font-black px-2.5 py-1.5 rounded-md border border-sky-300 bg-white text-sky-950 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 2: HOSPITALIZACIÓN */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Hospitalización:
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Ingreso Hospitalario</span>
                    </div>

                    {/* Hospitalización: Si [ALERTA] / No */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-xs font-bold text-slate-800">Hospitalización:</span>
                      <div className="flex items-center gap-1.5">
                        <label
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                            baselineData.hospitalized === true
                              ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                              : "bg-amber-50/60 border-amber-200 text-amber-900"
                          }`}
                        >
                          <span className="text-xs">Si [ALERTA]</span>
                          <input
                            type="radio"
                            name="hospitalizedRadio"
                            checked={baselineData.hospitalized === true}
                            onChange={() => setBaselineData({ ...baselineData, hospitalized: true })}
                            className="text-amber-600 focus:ring-0"
                          />
                        </label>

                        <label
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                            baselineData.hospitalized !== true
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <span className="text-xs">No</span>
                          <input
                            type="radio"
                            name="hospitalizedRadio"
                            checked={baselineData.hospitalized !== true}
                            onChange={() => setBaselineData({ ...baselineData, hospitalized: false })}
                            className="text-emerald-600 focus:ring-0"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Fecha de Hospitalización */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Fecha:</span>
                      <input
                        type="date"
                        value={baselineData.hospitalizationHistory?.date || ""}
                        onChange={(e) =>
                          setBaselineData({
                            ...baselineData,
                            hospitalizationHistory: {
                              ...(baselineData.hospitalizationHistory || {}),
                              date: e.target.value,
                            },
                          })
                        }
                        className="text-xs font-mono font-medium px-2 py-1 rounded border border-slate-300 bg-slate-50"
                      />
                    </div>

                    {/* Diagnóstico */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                      <span className="text-xs font-bold text-slate-800 block">Diagnóstico:</span>
                      <input
                        type="text"
                        value={baselineData.hospitalizationHistory?.diagnosis || ""}
                        onChange={(e) =>
                          setBaselineData({
                            ...baselineData,
                            hospitalizationHistory: {
                              ...(baselineData.hospitalizationHistory || {}),
                              diagnosis: e.target.value,
                            },
                          })
                        }
                        placeholder="ej. Amenaza de parto pretérmino, Hiperémesis gravídica..."
                        className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-slate-50 font-medium"
                      />
                    </div>

                    {/* CIE 10: [ ][ ][ ][ ][ ] */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">CIE 10:</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, idx) => {
                            const char = (baselineData.hospitalizationHistory?.cie10 || "")[idx] || "";
                            return (
                              <span
                                key={idx}
                                className="w-6 h-7 border-2 border-slate-400 bg-white rounded-xs flex items-center justify-center font-mono font-bold text-xs text-slate-900 shadow-2xs"
                              >
                                {char}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap">
                        {["O20.0", "O60.0", "O14.0", "O21.0"].map((code) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() =>
                              setBaselineData({
                                ...baselineData,
                                hospitalizationHistory: {
                                  ...(baselineData.hospitalizationHistory || {}),
                                  cie10: code,
                                },
                              })
                            }
                            className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 hover:bg-slate-200 font-mono font-bold text-slate-700"
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 3: EMERGENCIA */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Emergencia
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Atención Urgente</span>
                    </div>

                    {/* Atención por Emergencia: Si [ALERTA] / No */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-xs font-bold text-slate-800">Atención por Emergencia:</span>
                      <div className="flex items-center gap-1.5">
                        <label
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                            baselineData.hadEmergency === true
                              ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                              : "bg-amber-50/60 border-amber-200 text-amber-900"
                          }`}
                        >
                          <span className="text-xs">Si [ALERTA]</span>
                          <input
                            type="radio"
                            name="emergencyRadio"
                            checked={baselineData.hadEmergency === true}
                            onChange={() => setBaselineData({ ...baselineData, hadEmergency: true })}
                            className="text-amber-600 focus:ring-0"
                          />
                        </label>

                        <label
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                            baselineData.hadEmergency !== true
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <span className="text-xs">No</span>
                          <input
                            type="radio"
                            name="emergencyRadio"
                            checked={baselineData.hadEmergency !== true}
                            onChange={() => setBaselineData({ ...baselineData, hadEmergency: false })}
                            className="text-emerald-600 focus:ring-0"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Fecha de Emergencia */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Fecha:</span>
                      <input
                        type="date"
                        value={baselineData.emergencyHistory?.date || ""}
                        onChange={(e) =>
                          setBaselineData({
                            ...baselineData,
                            emergencyHistory: {
                              ...(baselineData.emergencyHistory || {}),
                              date: e.target.value,
                            },
                          })
                        }
                        className="text-xs font-mono font-medium px-2 py-1 rounded border border-slate-300 bg-slate-50"
                      />
                    </div>

                    {/* Diagnóstico */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                      <span className="text-xs font-bold text-slate-800 block">Diagnóstico:</span>
                      <input
                        type="text"
                        value={baselineData.emergencyHistory?.diagnosis || ""}
                        onChange={(e) =>
                          setBaselineData({
                            ...baselineData,
                            emergencyHistory: {
                              ...(baselineData.emergencyHistory || {}),
                              diagnosis: e.target.value,
                            },
                          })
                        }
                        placeholder="ej. Sangrado vaginal 1er trimestre, Cólico nefrítico..."
                        className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-slate-50 font-medium"
                      />
                    </div>

                    {/* CIE 10: [ ][ ][ ][ ][ ] */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">CIE 10:</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, idx) => {
                            const char = (baselineData.emergencyHistory?.cie10 || "")[idx] || "";
                            return (
                              <span
                                key={idx}
                                className="w-6 h-7 border-2 border-slate-400 bg-white rounded-xs flex items-center justify-center font-mono font-bold text-xs text-slate-900 shadow-2xs"
                              >
                                {char}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap">
                        {["O20.0", "O23.4", "O26.8", "N23"].map((code) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() =>
                              setBaselineData({
                                ...baselineData,
                                emergencyHistory: {
                                  ...(baselineData.emergencyHistory || {}),
                                  cie10: code,
                                },
                              })
                            }
                            className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 hover:bg-slate-200 font-mono font-bold text-slate-700"
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 4: VIOLENCIA / GÉNERO */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Violencia / género
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Tamizaje MINSA</span>
                    </div>

                    {/* Ficha Tamizaje: Si / No */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Ficha Tamizaje:</span>
                        <span className="text-[10px] text-slate-500">Aplicación de cuestionario oficial</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setBaselineData({
                              ...baselineData,
                              violenceScreening: {
                                ...(baselineData.violenceScreening || {}),
                                screeningDone: true,
                              },
                            })
                          }
                          className={`px-3 py-1 text-xs rounded-md font-bold transition-all cursor-pointer ${
                            baselineData.violenceScreening?.screeningDone !== false
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          Si
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setBaselineData({
                              ...baselineData,
                              violenceScreening: {
                                ...(baselineData.violenceScreening || {}),
                                screeningDone: false,
                              },
                            })
                          }
                          className={`px-3 py-1 text-xs rounded-md font-bold transition-all cursor-pointer ${
                            baselineData.violenceScreening?.screeningDone === false
                              ? "bg-slate-800 text-white shadow-2xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Violencia: Si [ALERTA] / No */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Violencia:</span>
                        <span className="text-[10px] text-slate-500">Detección positiva en tamizaje</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <label
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                            baselineData.violenceScreening?.violenceDetected === true
                              ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                              : "bg-amber-50/60 border-amber-200 text-amber-900"
                          }`}
                        >
                          <span className="text-xs">Si [ALERTA]</span>
                          <input
                            type="radio"
                            name="violenceDetectedRadio"
                            checked={baselineData.violenceScreening?.violenceDetected === true}
                            onChange={() =>
                              setBaselineData({
                                ...baselineData,
                                violenceScreening: {
                                  ...(baselineData.violenceScreening || {}),
                                  violenceDetected: true,
                                },
                              })
                            }
                            className="text-amber-600 focus:ring-0"
                          />
                        </label>

                        <label
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                            baselineData.violenceScreening?.violenceDetected !== true
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <span className="text-xs">No</span>
                          <input
                            type="radio"
                            name="violenceDetectedRadio"
                            checked={baselineData.violenceScreening?.violenceDetected !== true}
                            onChange={() =>
                              setBaselineData({
                                ...baselineData,
                                violenceScreening: {
                                  ...(baselineData.violenceScreening || {}),
                                  violenceDetected: false,
                                },
                              })
                            }
                            className="text-emerald-600 focus:ring-0"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Fecha de Tamizaje */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Fecha:</span>
                      <input
                        type="date"
                        value={baselineData.violenceScreening?.date || ""}
                        onChange={(e) =>
                          setBaselineData({
                            ...baselineData,
                            violenceScreening: {
                              ...(baselineData.violenceScreening || {}),
                              date: e.target.value,
                            },
                          })
                        }
                        className="text-xs font-mono font-medium px-2 py-1 rounded border border-slate-300 bg-slate-50"
                      />
                    </div>
                  </div>

                </div>

                {/* 7.3 Alerta clínica si se detecta violencia */}
                {baselineData.violenceScreening?.violenceDetected === true && (
                  <div className="p-3.5 rounded-xl bg-amber-100 border border-amber-300 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-amber-950 uppercase block">
                        Alerta de Protección Integral &bull; Violencia de Género Detectada
                      </span>
                      <p className="text-[11px] text-amber-900 mt-0.5">
                        Activar protocolo de soporte emocional y confidencial. Referir a Servicio Social, Psicología y coordinar apoyo con Centro Emergencia Mujer (CEM / Línea 100).
                      </p>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 8: EXAMEN FÍSICO BASAL (CLÍNICO, MAMAS, CUELLO UTERINO, PELVIS & ODONTOLÓGICO)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("examenFisico")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0">
                  8
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  EXAMEN FÍSICO BASAL (CLÍNICO, MAMAS, CUELLO UTERINO, PELVIS & ODONTOLÓGICO)
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  Formato Oficial MINSA / CLAP
                </span>
              </div>
              <div className="flex items-center gap-2">
                {physicalExamAlertsCount === 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Normal Completo (5/5)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {physicalExamAlertsCount} {physicalExamAlertsCount === 1 ? "Alerta" : "Alertas"} (Sin Examen / Patológico)
                  </span>
                )}
                {openSections.examenFisico ? (
                  <ChevronUp className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted" />
                )}
              </div>
            </button>

            {openSections.examenFisico && (
              <div className="p-4 sm:p-6 space-y-5 text-xs border-t border-border bg-white">
                
                {/* 8.1 Barra Superior de Resumen y Acciones Rápidas */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-heading font-extrabold text-heading uppercase">
                        Examen Físico Basal de la Gestante (MINSA / CLAP)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Evaluación inicial obligatoria. Casillas amarillas <span className="font-bold text-amber-700 font-mono">[🟨]</span> representan alertas clínicas u omisión de examen basal.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={handleMarkAllPhysicalExamsNormal}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Marcar todos los 5 exámenes como normales"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>✓ Marcar Todos Normales (Examen Completo)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetPhysicalExams}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                      title="Restablecer todos los exámenes a Sin Examen"
                    >
                      <span>Restablecer</span>
                    </button>
                  </div>
                </div>

                {/* 8.2 Leyenda idéntica al Carnet MINSA */}
                <div className="flex items-center gap-4 px-3 py-2 rounded-lg bg-slate-50/70 border border-slate-200/80 text-[11px] text-slate-600 flex-wrap">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Leyenda MINSA:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-600 shadow-2xs inline-block" />
                    <span><strong>Casilla Amarilla [🟨]:</strong> Alerta (Sin Examen u Hallazgo Patológico)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-xs bg-white border border-slate-400 inline-block" />
                    <span><strong>Casilla Blanca [ ]:</strong> Normal (Parámetro fisiológico sin alteración)</span>
                  </div>
                </div>

                {/* 8.3 Lista de las 5 Evaluaciones Físicas (Clínico, Mamas, Cuello Uterino, Pelvis, Odont.) */}
                <div className="space-y-3">
                  {PHYSICAL_EXAM_ITEMS.map((item) => {
                    const status = baselineData[item.id] || "Normal";
                    const detail = baselineData[item.detailKey] || "";

                    const isSinExamen = status === "Sin Examen";
                    const isNormal = status === "Normal";
                    const isPatologico = status === "Patológico";

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          isPatologico
                            ? "bg-amber-50/70 border-amber-400 ring-1 ring-amber-300/70 shadow-xs"
                            : isSinExamen
                            ? "bg-amber-50/40 border-amber-300 shadow-2xs"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          {/* Identificación del Examen con nombre oficial de la captura */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-xs font-mono font-black bg-slate-900 text-white uppercase tracking-wider">
                                {item.snippetName}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                {item.title}
                              </span>

                              {/* Badge de estado actual */}
                              {isNormal && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  NORMAL [ ]
                                </span>
                              )}
                              {isSinExamen && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-950 border border-amber-400">
                                  SIN EXAMEN [🟨 ALERTA]
                                </span>
                              )}
                              {isPatologico && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-amber-950 border border-amber-600 shadow-2xs">
                                  PATOLÓGICO [🟨 ALERTA]
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {item.subtitle}
                            </p>
                          </div>

                          {/* Las 3 Opciones Idénticas al Carnet MINSA */}
                          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                            
                            {/* 1. Sin Examen [🟨] */}
                            <button
                              type="button"
                              onClick={() =>
                                setBaselineData({
                                  ...baselineData,
                                  [item.id]: "Sin Examen",
                                })
                              }
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSinExamen
                                  ? "bg-amber-300 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400"
                                  : "bg-amber-50/60 hover:bg-amber-100 border-amber-200 text-amber-900"
                              }`}
                            >
                              <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-600 inline-block shrink-0 shadow-2xs" />
                              <span>Sin Examen</span>
                              <span className="text-[10px] font-mono text-amber-900/80">[🟨]</span>
                            </button>

                            {/* 2. Normal [ ] */}
                            <button
                              type="button"
                              onClick={() =>
                                setBaselineData({
                                  ...baselineData,
                                  [item.id]: "Normal",
                                })
                              }
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isNormal
                                  ? "bg-emerald-100 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-400"
                                  : "bg-white hover:bg-slate-50 border-slate-300 text-slate-700"
                              }`}
                            >
                              <span className="w-3.5 h-3.5 rounded-xs bg-white border border-slate-400 inline-block shrink-0" />
                              <span>Normal</span>
                              <span className="text-[10px] font-mono text-slate-500">[ ]</span>
                            </button>

                            {/* 3. Patológico [🟨] */}
                            <button
                              type="button"
                              onClick={() =>
                                setBaselineData({
                                  ...baselineData,
                                  [item.id]: "Patológico",
                                })
                              }
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isPatologico
                                  ? "bg-amber-300 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400"
                                  : "bg-amber-50/60 hover:bg-amber-100 border-amber-200 text-amber-900"
                              }`}
                            >
                              <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-600 inline-block shrink-0 shadow-2xs" />
                              <span>Patológico</span>
                              <span className="text-[10px] font-mono text-amber-900/80">[🟨]</span>
                            </button>
                          </div>
                        </div>

                        {/* Desplegable interactivo si es Patológico */}
                        {isPatologico && (
                          <div className="mt-3.5 p-3.5 rounded-lg bg-amber-50/90 border border-amber-300 space-y-2.5">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                                Detalle del Hallazgo Patológico ({item.snippetName.replace(":", "")}):
                              </span>
                              <span className="text-[10px] text-amber-800 italic">
                                Haz clic en las sugerencias clínicas o escribe la observación
                              </span>
                            </div>

                            {/* Chips de sugerencias clínicas rápidas */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.chips.map((chip) => {
                                const isChipActive = detail.includes(chip);
                                return (
                                  <button
                                    key={chip}
                                    type="button"
                                    onClick={() => {
                                      if (isChipActive) {
                                        const parts = detail
                                          .split(", ")
                                          .map((p) => p.trim())
                                          .filter((p) => p !== chip && p.length > 0);
                                        setBaselineData({
                                          ...baselineData,
                                          [item.detailKey]: parts.join(", "),
                                        });
                                      } else {
                                        const newDetail = detail.trim().length > 0 ? `${detail.trim()}, ${chip}` : chip;
                                        setBaselineData({
                                          ...baselineData,
                                          [item.detailKey]: newDetail,
                                        });
                                      }
                                    }}
                                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                                      isChipActive
                                        ? "bg-amber-400 text-amber-950 font-bold border border-amber-600 shadow-2xs"
                                        : "bg-white hover:bg-amber-100 border border-amber-200 text-amber-900"
                                    }`}
                                  >
                                    {isChipActive ? `✓ ${chip}` : `+ ${chip}`}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Campo de texto libre para detalle patológico */}
                            <div className="pt-0.5">
                              <input
                                type="text"
                                value={detail}
                                onChange={(e) =>
                                  setBaselineData({
                                    ...baselineData,
                                    [item.detailKey]: e.target.value,
                                  })
                                }
                                placeholder={`Describir hallazgo patológico en ${item.snippetName.replace(":", "")} (ej. grado, ubicación, conducta terapéutica)...`}
                                className="w-full text-xs px-3 py-2 rounded-lg border border-amber-300 bg-white text-slate-800 placeholder:text-amber-800/40 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                              />
                            </div>
                          </div>
                        )}

                        {/* Recordatorio amigable si es Sin Examen */}
                        {isSinExamen && (
                          <div className="mt-3 px-3 py-2 rounded-lg bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-900">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>
                                <strong>Alerta de Omisión:</strong> El examen {item.title.toLowerCase()} no ha sido realizado. Registrar en la siguiente cita.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setBaselineData({
                                  ...baselineData,
                                  [item.id]: "Normal",
                                })
                              }
                              className="text-[11px] font-bold text-amber-950 underline hover:text-amber-800 cursor-pointer"
                            >
                              Marcar Realizado (Normal)
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 8.4 Banner de Resumen y Recomendación Técnica MINSA */}
                {PHYSICAL_EXAM_ITEMS.some((i) => baselineData[i.id] === "Patológico") && (
                  <div className="p-3.5 rounded-xl bg-amber-100 border border-amber-300 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-amber-950 uppercase block">
                        Alerta de Hallazgos Patológicos en Examen Físico Basal
                      </span>
                      <p className="text-[11px] text-amber-900 mt-0.5">
                        Se han consignado hallazgos patológicos que requieren formulación de plan de trabajo, interconsulta o tratamiento inmediato según corresponda. Registrar en las notas de evolución médica y plan de parto.
                      </p>
                    </div>
                  </div>
                )}

                {/* Nota Normativa MINSA NTS N° 105 */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
                  <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 uppercase text-[10px] block">
                      Norma Técnica de Salud MINSA &bull; NTS N° 105-MINSA/DGSP
                    </span>
                    <p className="mt-0.5">
                      El examen físico de la primera atención prenatal es mandatorio para la estratificación del riesgo materno-perinatal:
                      especuloscopía (descarte de ectropion sangrante, cervicitis y neoplasia), mamas (detección de pezones planos/umbilicados para estimulación y consejería de lactancia precoz), pelvimetría clínica y evaluación odontoestomatológica para prevenir parto pretérmino asociado a focos infecciosos bucales.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 9: EXÁMENES DE LABORATORIO BASALES (MINSA / CLAP)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("laboratorio")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center justify-center shrink-0">
                  9
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  EXÁMENES DE LABORATORIO BASALES (MINSA / CLAP)
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-50 text-cyan-800 border border-cyan-200">
                  Batería Gestacional Completa
                </span>
              </div>
              <div className="flex items-center gap-2">
                {labPathologicalAlerts.length > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {labPathologicalAlerts.length} {labPathologicalAlerts.length === 1 ? "Alerta Patológica" : "Alertas Patológicas"} [🟨]
                  </span>
                ) : labPendingCount > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                    {labPendingCount} Pruebas Sin Realizar
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Panel Basal Completo Normal
                  </span>
                )}
                {openSections.laboratorio ? (
                  <ChevronUp className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted" />
                )}
              </div>
            </button>

            {openSections.laboratorio && (
              <div className="p-4 sm:p-6 space-y-5 text-xs border-t border-border bg-white">
                
                {/* 9.1 Barra Superior de Resumen y Acciones Rápidas */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-heading font-extrabold text-heading uppercase">
                        Batería de Laboratorio Gestacional (MINSA / CLAP)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Monitoreo hematológico, metabólico, tamizaje de ITS (Sífilis / VIH), urológico, infeccioso y cervical.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={handleFillNormalLabPanel}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Cargar resultados negativos y normales en el panel basal"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>✓ Cargar Panel Basal Normal</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetLabPanel}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                      title="Restablecer todas las pruebas a No se Hizo"
                    >
                      <span>Restablecer Todo</span>
                    </button>
                  </div>
                </div>

                {/* 9.2 Leyenda idéntica al Carnet MINSA */}
                <div className="flex items-center gap-4 px-3 py-2 rounded-lg bg-slate-50/70 border border-slate-200/80 text-[11px] text-slate-600 flex-wrap">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Leyenda de Colores MINSA:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-xs bg-white border border-slate-400 inline-block" />
                    <span><strong>Casilla Blanca [ ]:</strong> Normal / Negativo / No reactivo / No Aplica</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-600 shadow-2xs inline-block" />
                    <span><strong>Casilla Amarilla [🟨]:</strong> ALERTA (Anormal, Reactivo, Positivo o No se Hizo)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-xs bg-rose-500 border border-rose-700 shadow-2xs inline-block" />
                    <span><strong>Casilla Roja [🟥]:</strong> Seguimiento Continuo (Hb &lt; 7.0 g/dL Anemia Severa)</span>
                  </div>
                </div>

                {/* 9.3 Grid de Laboratorio (2 Grandes Columnas para Cero Solapamiento) */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  
                  {/* ========================================================
                      COLUMNA IZQUIERDA: HEMOGLOBINA, GLICEMIA & ITS (SÍFILIS/VIH)
                      ======================================================== */}
                  <div className="space-y-4">
                    
                    {/* BLOQUE A: HEMOGLOBINA Hg(%) */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                      <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                        <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-cyan-600" />
                          Hemoglobina Hg(%) & Descarte de Anemia
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Punto de corte: 11.0 g/dL</span>
                      </div>

                      <div className="space-y-2">
                        {renderHemoglobinRow({
                          label: "Hemoglobina 1:",
                          val: baselineData.hemoglobin1,
                          onValChange: (v) => setBaselineData({ ...baselineData, hemoglobin1: v }),
                          notDone: baselineData.hemoglobin1NotDone,
                          onNotDoneChange: (nd) => setBaselineData({ ...baselineData, hemoglobin1NotDone: nd }),
                          dateVal: baselineData.hemoglobin1Date,
                          onDateChange: (d) => setBaselineData({ ...baselineData, hemoglobin1Date: d }),
                        })}

                        {renderHemoglobinRow({
                          label: "Hemoglobina 2:",
                          val: baselineData.hemoglobin2,
                          onValChange: (v) => setBaselineData({ ...baselineData, hemoglobin2: v }),
                          notDone: baselineData.hemoglobin2NotDone,
                          onNotDoneChange: (nd) => setBaselineData({ ...baselineData, hemoglobin2NotDone: nd }),
                          dateVal: baselineData.hemoglobin2Date,
                          onDateChange: (d) => setBaselineData({ ...baselineData, hemoglobin2Date: d }),
                        })}

                        {renderHemoglobinRow({
                          label: "Hemogl. al Alta :",
                          val: baselineData.hemoglobinDischarge,
                          onValChange: (v) => setBaselineData({ ...baselineData, hemoglobinDischarge: v }),
                          notDone: baselineData.hemoglobinDischargeNotDone,
                          onNotDoneChange: (nd) => setBaselineData({ ...baselineData, hemoglobinDischargeNotDone: nd }),
                          dateVal: baselineData.hemoglobinDischargeDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, hemoglobinDischargeDate: d }),
                        })}
                      </div>
                    </div>

                    {/* BLOQUE B: GLICEMIA & TOLERANCIA A LA GLUCOSA */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                      <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                        <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider flex items-center gap-1.5">
                          <FlaskConical className="w-3.5 h-3.5 text-cyan-600" />
                          Glicemia & Tolerancia a la Glucosa
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Descarte Diabetes Gestacional</span>
                      </div>

                      <div className="space-y-2">
                        {renderLabRow({
                          label: "Glicemia 1:",
                          value: baselineData.glucose1Result || "Normal",
                          onChange: (val) => setBaselineData({ ...baselineData, glucose1Result: val }),
                          dateValue: baselineData.glucose1Date,
                          onDateChange: (d) => setBaselineData({ ...baselineData, glucose1Date: d }),
                          numericVal: baselineData.glucose1Value,
                          onNumericChange: (v) => setBaselineData({ ...baselineData, glucose1Value: v }),
                          numericUnit: "mg/dL",
                          safeText: "Normal",
                          alertText: "Anormal",
                        })}

                        {renderLabRow({
                          label: "Glicemia 2:",
                          value: baselineData.glucose2Result || "Normal",
                          onChange: (val) => setBaselineData({ ...baselineData, glucose2Result: val }),
                          dateValue: baselineData.glucose2Date,
                          onDateChange: (d) => setBaselineData({ ...baselineData, glucose2Date: d }),
                          numericVal: baselineData.glucose2Value,
                          onNumericChange: (v) => setBaselineData({ ...baselineData, glucose2Value: v }),
                          numericUnit: "mg/dL",
                          safeText: "Normal",
                          alertText: "Anormal",
                        })}

                        {renderLabRow({
                          label: "Tolerancia Glucosa:",
                          badge: "Sobrecarga 75g",
                          value: baselineData.glucoseToleranceResult || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, glucoseToleranceResult: val }),
                          dateValue: baselineData.glucoseToleranceDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, glucoseToleranceDate: d }),
                          numericVal: baselineData.glucoseToleranceValue,
                          onNumericChange: (v) => setBaselineData({ ...baselineData, glucoseToleranceValue: v }),
                          numericUnit: "mg/dL",
                          safeText: "Normal",
                          alertText: "Anormal",
                          hasNoApplies: true,
                        })}
                      </div>
                    </div>

                    {/* BLOQUE C: SÍFILIS & TAMIZAJE VIH */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                      <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                        <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-cyan-600" />
                          Sífilis & Tamizaje VIH (Prevención Transmisión Vertical)
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Serología Obligatoria</span>
                      </div>

                      <div className="space-y-2">
                        {renderLabRow({
                          label: "VDRL/RPR 1 :",
                          value: baselineData.vdrlRpr1Result || "No reactivo",
                          onChange: (val) => setBaselineData({ ...baselineData, vdrlRpr1Result: val, vdrlRpr1: val }),
                          dateValue: baselineData.vdrlRpr1Date,
                          onDateChange: (d) => setBaselineData({ ...baselineData, vdrlRpr1Date: d }),
                          safeText: "No reactivo",
                          alertText: "Reactivo",
                        })}

                        {renderLabRow({
                          label: "VDRL/RPR 2 :",
                          value: baselineData.vdrlRpr2Result || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, vdrlRpr2Result: val }),
                          dateValue: baselineData.vdrlRpr2Date,
                          onDateChange: (d) => setBaselineData({ ...baselineData, vdrlRpr2Date: d }),
                          safeText: "No reactivo",
                          alertText: "Reactivo",
                          hasNoApplies: true,
                        })}

                        {renderLabRow({
                          label: "FTA Abs. :",
                          badge: "Treponémica",
                          value: baselineData.ftaAbsResult || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, ftaAbsResult: val }),
                          dateValue: baselineData.ftaAbsDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, ftaAbsDate: d }),
                          safeText: "No reactivo",
                          alertText: "Reactivo",
                          hasNoApplies: true,
                        })}

                        {renderLabRow({
                          label: "TPHA :",
                          badge: "Hemaglutinación",
                          value: baselineData.tphaResult || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, tphaResult: val }),
                          dateValue: baselineData.tphaDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, tphaDate: d }),
                          safeText: "No reactivo",
                          alertText: "Reactivo",
                          hasNoApplies: true,
                        })}

                        {renderLabRow({
                          label: "Prueba Rap. Sifilis :",
                          value: baselineData.rapidSyphilisResult || "No reactivo",
                          onChange: (val) => setBaselineData({ ...baselineData, rapidSyphilisResult: val }),
                          dateValue: baselineData.rapidSyphilisDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, rapidSyphilisDate: d }),
                          safeText: "No reactivo",
                          alertText: "Reactivo",
                        })}

                        {renderLabRow({
                          label: "VIH Prueba Rap. 1 :",
                          value: baselineData.hivRapid1Result || "No reactivo",
                          onChange: (val) => setBaselineData({ ...baselineData, hivRapid1Result: val }),
                          dateValue: baselineData.hivRapid1Date,
                          onDateChange: (d) => setBaselineData({ ...baselineData, hivRapid1Date: d }),
                          safeText: "No reactivo",
                          alertText: "Reactivo",
                        })}

                        {renderLabRow({
                          label: "Prueba Rap. 2 :",
                          badge: "VIH 3er Trim.",
                          value: baselineData.hivRapid2Result || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, hivRapid2Result: val }),
                          dateValue: baselineData.hivRapid2Date,
                          onDateChange: (d) => setBaselineData({ ...baselineData, hivRapid2Date: d }),
                          safeText: "No reactivo",
                          alertText: "Reactivo",
                          hasNoApplies: true,
                        })}

                        {renderLabRow({
                          label: "ELISA :",
                          badge: "VIH Confirmatoria",
                          value: baselineData.hivElisaResult || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, hivElisaResult: val }),
                          dateValue: baselineData.hivElisaDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, hivElisaDate: d }),
                          safeText: "No reactivo",
                          alertText: "Reactivo",
                          hasNoApplies: true,
                        })}
                      </div>
                    </div>

                  </div>

                  {/* ========================================================
                      COLUMNA DERECHA: INFECCIONES ESPECIALES, ORINA & CUELLO
                      ======================================================== */}
                  <div className="space-y-4">
                    
                    {/* BLOQUE D: INFECCIONES ESPECIALES & VECTORES */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                      <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                        <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-cyan-600" />
                          Infecciones Especiales & Zoonosis / Vectores
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Western Blot, HTLV, TORCH, Malaria</span>
                      </div>

                      <div className="space-y-2">
                        {renderLabRow({
                          label: "IFI / Western Blot:",
                          badge: "Inmunofluorescencia",
                          value: baselineData.westernBlotResult || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, westernBlotResult: val }),
                          dateValue: baselineData.westernBlotDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, westernBlotDate: d }),
                          safeText: "Negativo",
                          alertText: "Positivo",
                          hasNoApplies: true,
                        })}

                        {renderLabRow({
                          label: "HTLV I:",
                          value: baselineData.htlv1Result || "Negativo",
                          onChange: (val) => setBaselineData({ ...baselineData, htlv1Result: val }),
                          dateValue: baselineData.htlv1Date,
                          onDateChange: (d) => setBaselineData({ ...baselineData, htlv1Date: d }),
                          safeText: "Negativo",
                          alertText: "Positivo",
                          hasNoApplies: true,
                        })}

                        {renderLabRow({
                          label: "TORCH:",
                          badge: "Toxo, Rubeola, CMV, Herpes",
                          value: baselineData.torchResult || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, torchResult: val }),
                          dateValue: baselineData.torchDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, torchDate: d }),
                          safeText: "Negativo",
                          alertText: "Positivo",
                          hasNoApplies: true,
                        })}

                        {renderLabRow({
                          label: "Gota Gruesa:",
                          badge: "Malaria Endémica",
                          value: baselineData.thickBloodSmearResult || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, thickBloodSmearResult: val }),
                          dateValue: baselineData.thickBloodSmearDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, thickBloodSmearDate: d }),
                          safeText: "Negativo",
                          alertText: "Positivo",
                          hasNoApplies: true,
                        })}

                        {renderLabRow({
                          label: "Malaria Prueba Ráp:",
                          value: baselineData.malariaRapidResult || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, malariaRapidResult: val }),
                          dateValue: baselineData.malariaRapidDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, malariaRapidDate: d }),
                          safeText: "Negativo",
                          alertText: "Positivo",
                          hasNoApplies: true,
                        })}

                        {renderLabRow({
                          label: "Fluorec. Malaria:",
                          value: baselineData.malariaFluorescenceResult || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, malariaFluorescenceResult: val }),
                          dateValue: baselineData.malariaFluorescenceDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, malariaFluorescenceDate: d }),
                          safeText: "Negativo",
                          alertText: "Positivo",
                          hasNoApplies: true,
                        })}
                      </div>
                    </div>

                    {/* BLOQUE E: EXAMEN DE ORINA, UROCULTIVO & OTRAS INFECCIONES */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                      <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                        <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider flex items-center gap-1.5">
                          <FlaskConical className="w-3.5 h-3.5 text-cyan-600" />
                          Examen de Orina, Urocultivo & Hepatitis B
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Prevención de Prematuridad</span>
                      </div>

                      <div className="space-y-2">
                        {renderLabRow({
                          label: "Ex. Comp. Orina:",
                          value: baselineData.completeUrineExamResult || "Negativo",
                          onChange: (val) => setBaselineData({ ...baselineData, completeUrineExamResult: val }),
                          dateValue: baselineData.completeUrineExamDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, completeUrineExamDate: d }),
                          safeText: "Negativo",
                          alertText: "Positivo",
                        })}

                        {renderLabRow({
                          label: "Leucocituria:",
                          value: baselineData.leukocyturiaResult || "Negativo",
                          onChange: (val) => setBaselineData({ ...baselineData, leukocyturiaResult: val }),
                          safeText: "Negativo",
                          alertText: "Positivo",
                        })}

                        {renderLabRow({
                          label: "Nitritos:",
                          value: baselineData.nitritesResult || "Negativo",
                          onChange: (val) => setBaselineData({ ...baselineData, nitritesResult: val }),
                          dateValue: baselineData.nitritesDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, nitritesDate: d }),
                          safeText: "Negativo",
                          alertText: "Positivo",
                        })}

                        {renderLabRow({
                          label: "Urocultivo:",
                          badge: "Bacteriuria Asintomática",
                          value: baselineData.urineCultureResult || "Negativo",
                          onChange: (val) => setBaselineData({ ...baselineData, urineCultureResult: val }),
                          dateValue: baselineData.urineCultureDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, urineCultureDate: d }),
                          safeText: "Negativo",
                          alertText: "Positivo",
                          hasNoApplies: true,
                        })}

                        {renderLabRow({
                          label: "BK en Espuro:",
                          badge: "BK Esputo / TBC",
                          value: baselineData.bkSputumResult || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, bkSputumResult: val }),
                          dateValue: baselineData.bkSputumDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, bkSputumDate: d }),
                          safeText: "Negativo",
                          alertText: "Positivo",
                          hasNoApplies: true,
                        })}

                        {renderLabRow({
                          label: "Listeria:",
                          value: baselineData.listeriaResult || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, listeriaResult: val }),
                          dateValue: baselineData.listeriaDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, listeriaDate: d }),
                          safeText: "Negativo",
                          alertText: "Positivo",
                          hasNoApplies: true,
                        })}

                        {renderLabRow({
                          label: "Tamizaje: Hepatitis B:",
                          badge: "HBsAg",
                          value: baselineData.hepatitisBResult || "Negativo",
                          onChange: (val) => setBaselineData({ ...baselineData, hepatitisBResult: val }),
                          dateValue: baselineData.hepatitisBDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, hepatitisBDate: d }),
                          safeText: "Negativo",
                          alertText: "Positivo",
                          hasNoApplies: true,
                        })}
                      </div>
                    </div>

                    {/* BLOQUE F: TAMIZAJE CERVICAL EN GESTANTES */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                      <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                        <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
                          Tamizaje de Cáncer de Cuello Uterino en Gestantes
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Descarte Neoplasia Cervical</span>
                      </div>

                      <div className="space-y-2">
                        {renderLabRow({
                          label: "PAP:",
                          badge: "Papanicolaou",
                          value: baselineData.papTestResult || "Normal",
                          onChange: (val) => setBaselineData({ ...baselineData, papTestResult: val }),
                          dateValue: baselineData.papTestDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, papTestDate: d }),
                          safeText: "Normal",
                          alertText: "Anormal",
                        })}

                        {renderLabRow({
                          label: "IVAA:",
                          badge: "Ácido Acético",
                          value: baselineData.ivaaResult || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, ivaaResult: val }),
                          dateValue: baselineData.ivaaDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, ivaaDate: d }),
                          safeText: "Normal",
                          alertText: "Anormal",
                          hasNoApplies: true,
                        })}

                        {renderLabRow({
                          label: "Colposcopia:",
                          value: baselineData.colposcopyResult || "No se Aplica",
                          onChange: (val) => setBaselineData({ ...baselineData, colposcopyResult: val }),
                          dateValue: baselineData.colposcopyDate,
                          onDateChange: (d) => setBaselineData({ ...baselineData, colposcopyDate: d }),
                          safeText: "Normal",
                          alertText: "Anormal",
                          hasNoApplies: true,
                        })}
                      </div>
                    </div>

                  </div>

                </div>

                {/* 9.4 Banners de Protocolo Clínico & Alertas Patológicas */}
                {labPathologicalAlerts.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-100 border border-amber-300 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" />
                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                        Alertas Patológicas Detectadas en Laboratorio ({labPathologicalAlerts.length}):
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {labPathologicalAlerts.map((al) => (
                        <span key={al} className="px-2.5 py-1 rounded-md text-xs font-black bg-amber-300 border border-amber-500 text-amber-950 shadow-2xs">
                          {al}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-amber-900 pt-1">
                      <strong>Conducta Inmediata:</strong> Si VDRL/Sífilis reactivo, iniciar Penicilina Benzatínica 2.4 MUI según esquema MINSA para gestante y pareja. Si Urocultivo positivo, iniciar antibioticoterapia para prevención de parto prematuro y corioamnionitis. Si VIH reactivo, activar protocolo TARV materno.
                    </p>
                  </div>
                )}

                {/* Nota Normativa MINSA NTS N° 105 */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
                  <BookOpen className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 uppercase text-[10px] block">
                      Norma Técnica de Salud MINSA &bull; Batería de Laboratorio CPN (NTS N° 105)
                    </span>
                    <p className="mt-0.5">
                      Toda gestante debe contar en su primera atención prenatal con hemoglobina basal, glicemia en ayunas, tamizaje de sífilis (VDRL/PR), prueba rápida de VIH con consejería previa, tamizaje de Hepatitis B (HBsAg), urocultivo o examen de orina completo para despistaje de bacteriuria asintomática, y tamizaje de cáncer de cuello uterino (PAP).
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 10: REGISTRO DE ATENCIONES PRENATALES LONGITUDINALES (CONSULTAS)
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("atenciones")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                  10
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  REGISTRO DE ATENCIONES PRENATALES LONGITUDINALES (CONSULTAS)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  Paso 10 en Cola
                </span>
                {openSections.atenciones ? (
                  <ChevronUp className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted" />
                )}
              </div>
            </button>

            {openSections.atenciones && (
              <div className="p-5 text-center space-y-2 border-t border-border bg-slate-50/50">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span>Matriz Longitudinal de Atenciones Prenatales MINSA</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Matriz Longitudinal de 9 Consultas (Fecha, EG, Peso, PA, Altura Uterina, Presentación, FCF, Movimientos Fetales, Edema, Albuminuria, Sulfato Ferroso, etc.)
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              ACORDEÓN 11: EVALUACIÓN DE RIESGO OBSTÉTRICO (ARO) & CONDUCTA
              ========================================================================= */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("riesgos")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  11
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  EVALUACIÓN DE RIESGO OBSTÉTRICO (ARO) & CONDUCTA
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                  Paso 11 en Cola
                </span>
                {openSections.riesgos ? (
                  <ChevronUp className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted" />
                )}
              </div>
            </button>

            {openSections.riesgos && (
              <div className="p-5 text-center space-y-2 border-t border-border bg-slate-50/50">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-700" />
                  <span>Evaluación ARO & Conducta Integral</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Semáforo de Riesgo Obstétrico (Bajo Riesgo / Alto Riesgo / Muy Alto Riesgo) y Criterios Activos.
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
