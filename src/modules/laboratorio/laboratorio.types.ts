/**
 * Módulo de Órdenes de Laboratorio Clínico - Definiciones de Tipos
 * Centro de Endometriosis y Ginecología (CENDO)
 * Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)
 */

export type LabCategory =
  | "Hematología & Bioquímica"
  | "Ginecología & Marcadores"
  | "Perfil Hormonal & Ovárico"
  | "Perfil Prenatal / Gestacional"
  | "Infeccioso & Microbiología"
  | "Orina & Función Renal"
  | "Otro";

export type LabOrderUrgency = "Rutina" | "Prioritario" | "Urgente";

export type LabTemplateType =
  | "GENERAL"
  | "PAP"
  | "BIOPSIA"
  | "TRUCUT"
  | "ITS"
  | "PERITONEAL"
  | "CUSTOM";

export interface LabSpecimenDetails {
  anatomicalSite?: string; // ej. "Cérvix a horas 12:00 y 6:00", "Mama Izquierda CSE (hora 2:00)", "Cavidad peritoneal"
  sampleMethod?: string; // ej. "Base líquida ThinPrep", "Convencional", "Tru-Cut 14G", "Lavado laparoscópico"
  fixative?: string; // ej. "Formol tamponado 10%", "Medio PreservCyt", "Frasco estéril heparinado"
  containerCount?: number; // ej. 1, 2 frascos
  cervixAspect?: string; // ej. "Ectopia periorificial con sangrado al contacto", "Normal"
  furDate?: string;
  fur?: string;
  obstetricParity?: string; // ej. "G2 P1011"
  parity?: string;
  contraceptiveMethod?: string;
  mac?: string;
  clinicalFindings?: string;
  clinicalObservations?: string;
  sampleObtainedAt?: string;
  procedureOrigin?: string; // ej. "Laparoscopía ginecológica", "Biopsia ambulatoria"
}

export interface LabOrderTemplate {
  id: string;
  title: string;
  category: string;
  templateType: LabTemplateType;
  sampleType: string;
  fixativeTransport: string;
  suggestedDiagnosis: string;
  cie10Code?: string;
  defaultTests: string[];
  clinicalNotes: string;
  isOfficial?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabOrderItem {
  id: string;
  category: LabCategory | string;
  testName: string; // ej. "CA-125 (Marcador Ovárico / Endometriosis)"
  sampleType?: string; // ej. "Sangre venosa", "Muestra endocervical"
  notes?: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorCmp: string;
  doctorRne?: string;
  orderDate: string; // YYYY-MM-DD
  diagnosis: string;
  cie10Code?: string;
  items: LabOrderItem[];
  customTests?: string;
  urgency: LabOrderUrgency;
  patientInstructions?: string;
  templateType?: LabTemplateType;
  templateTitle?: string;
  specimenDetails?: LabSpecimenDetails;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLabOrderInput {
  id?: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorCmp: string;
  doctorRne?: string;
  orderDate: string;
  diagnosis: string;
  cie10Code?: string;
  items: LabOrderItem[];
  customTests?: string;
  urgency?: LabOrderUrgency;
  patientInstructions?: string;
  templateType?: LabTemplateType;
  templateTitle?: string;
  specimenDetails?: LabSpecimenDetails;
}

export type UpdateLabOrderInput = Partial<CreateLabOrderInput>;

export interface CatalogLabTest {
  id: string;
  name: string;
  category: LabCategory;
  sampleType: string;
  notes?: string;
}
