/**
 * CENDO - MÓDULO ANTECEDENTES GINECO-OBSTÉTRICOS
 * Tipos de datos para el historial reproductivo, ginecológico y patológico de las pacientes.
 */

export interface PatientBackground {
  id: string;
  patientId: string;
  menarche?: number;
  sexualDebutAge?: number;
  sexualPartnersCount?: number;
  catamenialRegimen?: string; // R/C (Régimen Catamenial, ej. "28/4")
  stiHistory?: string; // ITS (Infecciones de transmisión sexual)
  obstetricFormula: string; // G_ P____ (ej. G0 P0000, G2 P1011)
  contraceptiveMethod: string;
  lastMenstrualPeriod: string; // FUR (YYYY-MM-DD)
  papHistory: string;
  vphTestHistory: string;
  hasDiabetes?: string; // "Niega" | "Sí"
  hasHypertension?: string; // "Niega" | "Sí"
  hasAsthma?: string; // "Niega" | "Sí"
  medicalAllergies: string;
  surgeriesHistory: string;
  familyHistory: string;
  otherPathologies?: string;
  notes?: string;
  updatedAt?: string;
}

export type SaveBackgroundInput = Omit<PatientBackground, "id" | "updatedAt">;
export type UpdateBackgroundInput = Partial<SaveBackgroundInput>;

export interface FurCalculationResult {
  days: number;
  weeks: number;
  remainingDays: number;
  text: string;
  error?: string;
}
