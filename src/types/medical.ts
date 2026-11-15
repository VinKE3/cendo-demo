export type { DoctorRole, DoctorProfile, DoctorTitle } from "@/modules/usuarios";
export type { Patient } from "@/modules/pacientes";
export type { PatientBackground } from "@/modules/antecedentes";

export type {
  ColposcopyReport,
  ColposcopyImage,
  SCJVisibility,
  TZType,
  CervicalClockHour,
  CreateColposcopyInput,
  UpdateColposcopyInput,
} from "@/modules/colposcopia";

export interface ClinicalCheckup {
  id: string;
  patientId: string;
  checkupDate: string;
  reasonForConsultation: string;
  breastUltrasoundFindings: string;
  breastUltrasoundBirads: string;
  breastLesionMeasurements: string;
  transvaginalUltrasoundFindings: string;
  uterusMeasurements: string;
  endometriumThicknessMm: number;
  ovariesFindings: string;
  papResult: string;
  vphResult: string;
  conclusions: string;
  medicalPrescription: string;
  createdAt: string;
}

export type { ProcedureTariff, TariffCategory } from "@/modules/tarifario";
export type { CommercialBrand, MedicationVademecum } from "@/modules/vademecum";

// ============================================================================
// ETAPA A: RECETAS MÉDICAS INTELIGENTES (PUNTO 4) - MODULARIZADO
// ============================================================================
export type {
  PrescriptionRoute,
  PrescriptionItem,
  MedicalPrescription,
  CreatePrescriptionInput,
  ClinicalDosagePreset,
} from "@/modules/recetas";

// ============================================================================
// ETAPA A: ÓRDENES DE LABORATORIO CLÍNICO (PUNTO 8) - MODULARIZADO
// ============================================================================
export type {
  LabCategory,
  LabOrderItem,
  LabOrder,
  CreateLabOrderInput,
  CatalogLabTest,
  LabOrderUrgency,
} from "@/modules/laboratorio";

export interface PrenatalVisitItem {
  visitNumber: number; // 1 to 9
  visitDate: string; // YYYY-MM-DD
  visitTime?: string; // HH:mm
  gestationalAgeWeeks: number;
  gestationalAgeDays: number;
  maternalWeightKg: number;
  temperature: number;
  bloodPressure: string; // ej: "110/70"
  maternalPulse: number; // lpm
  uterineHeightCm: number;
  fetusSituation: "L" | "T" | "NA"; // Longitudinal / Transversa / No Aplica
  fetusPresentation: "C" | "P" | "NA"; // Cefálica / Pélvica / No Aplica
  fetusPosition: "D" | "I" | "NA"; // Derecha / Izquierda / No Aplica
  fetalHeartRate: number; // FCF lpm
  fetalMovements: "+" | "++" | "+++" | "SM" | "NA";
  proteinuria: "-" | "+" | "++" | "+++" | "NSH";
  edema: "-" | "+" | "++" | "+++" | "SE";
  tendonReflex: "0" | "+" | "++" | "+++";
  nippleExam?: "Formado" | "No Formado" | "Sin Examen";
  ironFolicAcidGiven: boolean;
  calciumGiven: boolean;
  counselingGiven?: string;
  ultrasoundGestationalAge?: string;
  biophysicalProfileScore?: string;
  nextAppointmentDate: string;
  homeVisit?: "Si" | "No" | "NA";
  attendingDoctorName: string;
  notes?: string;
}

export interface PrenatalBaselineData {
  insuranceType: "SIS" | "ESSALUD" | "PRIVADO" | "No Aplica";
  insuranceCode?: string;
  educationLevel: "Analfabeta" | "Primaria" | "Secundaria" | "Superior No Univ" | "Superior Univ";
  civilStatus: "Soltera" | "Casada" | "Conviviente" | "Otro";
  fatherName?: string;
  fatherDni?: string;
  // Antecedentes Obstétricos
  gestas: number;
  abortos: number;
  partosVaginales: number;
  cesareas: number;
  nacidosVivos: number;
  nacidosMuertos: number;
  viven: number;
  rnMayorPesoGramos?: number;
  multipleHistory?: boolean;
  pretermHistory?: boolean;
  // Gestación Anterior
  previousDeliveryDate?: string;
  previousDeliveryType?: "Parto Vaginal" | "Cesárea" | "Aborto" | "Ectópico" | "Molar";
  previousAbortionType?: "Incompleto" | "Completo" | "Frustro/Retenido" | "Séptico" | "No Aplica";
  adequateIntergenesicPeriod?: boolean;
  breastfeedingMonths?: "< 6 meses" | "6 meses o más" | "No hubo";
  // Antecedentes Médicos
  familyHistory: string[];
  personalHistory: string[];
  previousVaccines: {
    rubella: boolean;
    hepatitisB: boolean;
    hpv: boolean;
    yellowFever: boolean;
  };
  // Datos Basales
  usualWeightKg: number;
  heightCm: number;
  bloodGroup: "A" | "B" | "AB" | "O";
  rhFactor: "Rh (+)" | "Rh (-) Sensibilizada" | "Rh (-) No Sensibilizada";
  smokerCigarettesDay?: number;
  drugsUse?: boolean;
  // Fechas y Naegele
  fum: string; // YYYY-MM-DD
  fumDoubt: boolean;
  ultrasoundGestationalAgeWeeks?: number;
  ultrasoundDate?: string;
  fpp: string; // Fecha Probable de Parto calculada por Naegele
  // Examen Físico Basal
  clinicalExam: "Normal" | "Patológico";
  breastsExam: "Normal" | "Patológico" | "Sin Examen";
  cervixExam: "Normal" | "Patológico" | "Sin Examen";
  pelvisExam: "Normal" | "Anormal" | "Sin Examen";
  dentalExam: "Normal" | "Patológico" | "Sin Examen";
  // Laboratorios Basales
  hemoglobin1?: number; // g/dL
  hemoglobin2?: number;
  bloodGlucose1?: number; // mg/dL
  vdrlRpr1?: "No reactivo" | "Reactivo" | "No se hizo";
  hivScreening1?: "Negativo" | "Positivo" | "No se hizo";
  hepatitisBScreening?: "Negativo" | "Positivo" | "No se hizo";
  completeUrineExam?: "Normal" | "Patológico" | "No se hizo";
  urineCulture?: "Negativo" | "Positivo" | "Pendiente";
  papTestResult?: "Normal" | "Anormal" | "No se hizo";
  colposcopyResult?: "Normal" | "Anormal" | "No se hizo";
}

export interface MaternalPathologyItem {
  id: string;
  name: string;
  cie10: string;
  diagnosedDate: string;
}

export interface PrenatalCard {
  id: string;
  patientId: string;
  clinicEstablishment: string;
  attendingDoctorId: string;
  attendingDoctorName: string;
  baseline: PrenatalBaselineData;
  visits: PrenatalVisitItem[];
  maternalPathologies: MaternalPathologyItem[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ETAPA B: REPOSITORIO DE DOCUMENTOS Y EXÁMENES EXTERNOS (PDF)
// ============================================================================

export type DocumentCategory =
  | "PAP"
  | "VPH"
  | "PATOLOGIA"
  | "LABORATORIO"
  | "ECOGRAFIA"
  | "INFORME_MEDICO"
  | "CONSENTIMIENTO"
  | "OTRO";

export interface PatientDocument {
  id: string;
  patientId: string;
  documentType: DocumentCategory;
  title: string;
  fileName: string;
  fileUrl: string;
  filePath?: string; // Path en Supabase storage (ej: 'pat-1/123-doc.pdf')
  fileSize?: number; // bytes
  mimeType?: string; // 'application/pdf', 'image/jpeg', etc.
  notes?: string;
  createdAt: string;
  uploadedBy?: string;
}

// ============================================================================
// ETAPA B: NUEVA CONSULTA GINECOLÓGICA ESTRUCTURADA (PUNTO 13) - MODULARIZADO
// ============================================================================

export type {
  ConsultationVitalSigns,
  ConsultationPhysicalExam,
  MedicalConsultation,
  CreateConsultationInput,
} from "@/modules/consultas";

// ============================================================================
// ETAPA B: FORMATOS DE ECOGRAFÍA ESPECIALIZADA (PUNTO 5)
// ============================================================================

export type UltrasoundType =
  | "TRANSVAGINAL"
  | "PELVICA"
  | "MAMA_BILATERAL"
  | "OBSTETRICA_1T"
  | "OBSTETRICA_2T_3T"
  | "DOPPLER";

export interface UltrasoundFindings {
  // Ginecológica
  uterusPosition?: "AVF" | "RVF" | "Indiferente";
  uterusDimensions?: string;
  uterusVolumeCc?: number;
  myometriumStatus?: string;
  endometriumThicknessMm?: number;
  endometriumPattern?: "Trilaminar" | "Secretor" | "Atrófico" | "Engrosado irregular";
  rightOvaryDimensions?: string;
  leftOvaryDimensions?: string;
  ovariesNotes?: string;
  douglasPouch?: string;
  // Mama Bilateral
  breastPattern?: string;
  rightBreastFindings?: string;
  leftBreastFindings?: string;
  biradsCategory?: "BI-RADS 1" | "BI-RADS 2" | "BI-RADS 3" | "BI-RADS 4" | "BI-RADS 5";
  // Obstétrica
  gestationalSacsCount?: number;
  embryoCrownRumpLengthMm?: number;
  gestationalAgeByEcho?: string;
  fetalHeartRate?: number;
  placentaLocation?: string;
  amnioticFluidIndex?: string;
}

export interface UltrasoundReport {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorCmp: string;
  doctorRne?: string;
  reportDate: string;
  ultrasoundType: UltrasoundType;
  indication: string;
  findings: UltrasoundFindings;
  conclusion: string;
  recommendations?: string;
  images: { url: string; caption: string }[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ETAPA B: FORMATOS DE PROCEDIMIENTOS MENORES & BIOPSIAS (PUNTO 6)
// ============================================================================

export type ProcedureType =
  | "BIOPSIA_CERVICAL"
  | "BIOPSIA_ENDOMETRIAL"
  | "CONO_LEEP"
  | "POLIPECTOMIA"
  | "INSERCION_DIU"
  | "RETIRO_DIU"
  | "INSERCION_IMPLANTE"
  | "RETIRO_IMPLANTE"
  | "OTRO";

export interface ProcedureDetails {
  asepsisTechnique: string;
  biopsySites?: string;
  specimenSentToPathology: boolean;
  specimenDescription?: string;
  bleedingAmount: "Mínimo (< 10 ml)" | "Escaso" | "Moderado";
  hemostasisMethod: "Solución de Monsel" | "Electrocoagulación" | "Compresión" | "Sutura";
  complications: string;
}

export interface MinorProcedureReport {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorCmp: string;
  doctorRne?: string;
  procedureDate: string;
  procedureType: ProcedureType;
  preOpDiagnosis: string;
  postOpDiagnosis: string;
  cie10Code?: string;
  anesthesiaType: "Local (Lidocaína 2%)" | "Sedación" | "Sin Anestesia" | "Tópica";
  procedureDetails: ProcedureDetails;
  postOpIndications: string;
  medicationsPrescribed?: string;
  nextControlDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ETAPA C: TARIFAS COTIZADAS Y PRESUPUESTOS POR WHATSAPP (PUNTO 3) - MODULARIZADO
// ============================================================================
export type {
  QuoteItem,
  ProcedureQuote,
  CreateQuoteInput,
  QuoteTotals,
} from "@/modules/cotizaciones";

// ============================================================================
// ETAPA C: AGENDA DE CITAS Y DISPONIBILIDAD (PUNTOS 10 Y 11) - MODULARIZADO
// ============================================================================

export type {
  AppointmentStatus,
  AppointmentType,
  MedicalAppointment,
} from "@/modules/agenda";

// ============================================================================
// ETAPA C: HISTORIAS CLÍNICAS EN WORD (PUNTO 12)
// ============================================================================

export interface WordHistoryDocument {
  id: string;
  patientId: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  extractedText?: string;
  notes?: string;
  createdAt: string;
}





