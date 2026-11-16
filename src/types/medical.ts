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
  colposcopyFindings?: string;
  colposcopyResult?: string;
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

// ============================================================================
// CARNET DE CONTROL PRENATAL MINSA / CLAP (MÓDULO 13) - MODULARIZADO
// ============================================================================
export type {
  PrenatalVisitItem,
  PrenatalBaselineData,
  MaternalPathologyItem,
  PrenatalCard,
  PrenatalRiskReport,
  CreatePrenatalCardInput,
  UpdatePrenatalCardInput,
} from "@/modules/prenatal";

// ============================================================================
// REPOSITORIO DE DOCUMENTOS Y EXÁMENES EXTERNOS (MÓDULO 14) - MODULARIZADO
// ============================================================================
export type {
  DocumentCategory,
  PatientDocument,
  CreatePatientDocumentInput,
  WordHistoryDocument,
  CreateWordHistoryInput,
  DocumentUploadResult,
} from "@/modules/documentos";

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
// ETAPA B: FORMATOS DE ECOGRAFÍA ESPECIALIZADA (PUNTO 5) - MODULARIZADO
// ============================================================================

export type {
  UltrasoundType,
  BiradsCategory,
  UltrasoundImage,
  UltrasoundFindings,
  UltrasoundReport,
  CreateUltrasoundInput,
  UpdateUltrasoundInput,
} from "@/modules/ecografias";

// ============================================================================
// ETAPA B: FORMATOS DE PROCEDIMIENTOS MENORES & BIOPSIAS (PUNTO 6) - MODULARIZADO
// ============================================================================

export type {
  ProcedureType,
  AnesthesiaType,
  BleedingAmount,
  HemostasisMethod,
  ProcedureDetails,
  MinorProcedureReport,
  CreateMinorProcedureInput,
  UpdateMinorProcedureInput,
} from "@/modules/procedimientos";

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
// CATÁLOGO MAESTRO CIE-10 (GINECOLOGÍA & OBSTETRICIA)
// ============================================================================
export type {
  Cie10Item,
  Cie10Category,
} from "@/modules/catalogo/cie10Catalog";








