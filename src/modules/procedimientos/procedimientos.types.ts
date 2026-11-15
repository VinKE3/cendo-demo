/**
 * Módulo de Procedimientos Menores & Biopsias - Definiciones de Tipos
 * Centro de Endometriosis y Ginecología (CENDO)
 * Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)
 */

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

export type AnesthesiaType = "Local (Lidocaína 2%)" | "Sedación" | "Sin Anestesia" | "Tópica";
export type BleedingAmount = "Mínimo (< 10 ml)" | "Escaso" | "Moderado";
export type HemostasisMethod = "Solución de Monsel" | "Electrocoagulación" | "Compresión" | "Sutura";

export interface ProcedureDetails {
  asepsisTechnique: string;
  biopsySites?: string;
  specimenSentToPathology: boolean;
  specimenDescription?: string;
  bleedingAmount: BleedingAmount;
  hemostasisMethod: HemostasisMethod;
  complications: string;
}

export interface MinorProcedureReport {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorCmp: string;
  doctorRne?: string;
  procedureDate: string; // YYYY-MM-DD
  procedureType: ProcedureType;
  preOpDiagnosis: string;
  postOpDiagnosis: string;
  cie10Code?: string;
  anesthesiaType: AnesthesiaType;
  procedureDetails: ProcedureDetails;
  postOpIndications: string;
  medicationsPrescribed?: string;
  nextControlDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMinorProcedureInput {
  id?: string;
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
  anesthesiaType?: AnesthesiaType;
  procedureDetails: ProcedureDetails;
  postOpIndications: string;
  medicationsPrescribed?: string;
  nextControlDate?: string;
}

export type UpdateMinorProcedureInput = Partial<CreateMinorProcedureInput>;
