/**
 * Módulo de Ecografías Especializadas - Definiciones de Tipos
 * Centro de Endometriosis y Ginecología (CENDO)
 * Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)
 */

export type UltrasoundType =
  | "TRANSVAGINAL"
  | "PELVICA"
  | "MAMA_BILATERAL"
  | "OBSTETRICA_1T"
  | "OBSTETRICA_2T_3T"
  | "DOPPLER";

export type BiradsCategory =
  | "BI-RADS 1"
  | "BI-RADS 2"
  | "BI-RADS 3"
  | "BI-RADS 4"
  | "BI-RADS 5";

export interface UltrasoundImage {
  url: string;
  caption: string;
  timestamp?: string;
}

export interface UltrasoundFindings {
  // Ginecológica & Endometriosis
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
  endometriosisFoci?: string;
  // Mama Bilateral
  breastPattern?: string;
  rightBreastFindings?: string;
  leftBreastFindings?: string;
  biradsCategory?: BiradsCategory;
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
  reportDate: string; // YYYY-MM-DD
  ultrasoundType: UltrasoundType;
  indication: string;
  findings: UltrasoundFindings;
  conclusion: string;
  recommendations?: string;
  images: UltrasoundImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUltrasoundInput {
  id?: string;
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
  images?: UltrasoundImage[];
}

export type UpdateUltrasoundInput = Partial<CreateUltrasoundInput>;
