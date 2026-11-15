/**
 * Módulo de Recetas Médicas Inteligentes - Definiciones de Tipos
 * Centro de Endometriosis y Ginecología (CENDO)
 * Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)
 */

export type PrescriptionRoute =
  | "Vía Vaginal"
  | "Vía Oral"
  | "Vía Tópica"
  | "Vía Intramuscular"
  | "Vía Subcutánea"
  | "Otra";

export interface PrescriptionItem {
  id: string;
  medicationName: string; // ej: "Dienogest 2mg" o "Ginedazol (Metronidazol + Miconazol)"
  presentation: string; // ej: "Caja x 28 comprimidos"
  route: PrescriptionRoute | string;
  dosage: string; // ej: "1 comprimido"
  frequency: string; // ej: "Cada 24 horas a la misma hora"
  duration: string; // ej: "Por 6 meses continuos"
  instructions?: string; // ej: "Tomar con o sin alimentos sin interrupción"
  quantity?: string; // ej: "6 cajas"
}

export interface MedicalPrescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorCmp: string;
  doctorRne?: string;
  prescriptionDate: string; // YYYY-MM-DD
  diagnosis: string;
  cie10Code?: string;
  items: PrescriptionItem[];
  generalIndications?: string;
  nextAppointmentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrescriptionInput {
  id?: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorCmp: string;
  doctorRne?: string;
  prescriptionDate: string;
  diagnosis: string;
  cie10Code?: string;
  items: PrescriptionItem[];
  generalIndications?: string;
  nextAppointmentDate?: string;
}

export type UpdatePrescriptionInput = Partial<CreatePrescriptionInput>;

export interface ClinicalDosagePreset {
  label: string;
  badge: string;
  route: PrescriptionRoute | string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: string;
}
