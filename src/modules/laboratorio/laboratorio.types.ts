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
}

export type UpdateLabOrderInput = Partial<CreateLabOrderInput>;

export interface CatalogLabTest {
  id: string;
  name: string;
  category: LabCategory;
  sampleType: string;
  notes?: string;
}
