export type DoctorRole = "director" | "doctor" | "assistant";

export interface DoctorProfile {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  doctorTitle: string; // "Dr." | "Dra." | "Lic."
  specialty: string;
  cmp: string;
  rne: string;
  clinicName: string;
  clinicAddress: string;
  phone: string;
  contactEmail: string;
  avatarUrl?: string;
  signatureUrl?: string;
  role: DoctorRole;
  isActive: boolean;
  createdAt?: string;
}

export interface Patient {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
  age: number;
  phone: string;
  email: string;
  address: string;
  civilStatus: string;
  occupation: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientBackground {
  id: string;
  patientId: string;
  menarche?: number;
  sexualDebutAge?: number;
  sexualPartnersCount?: number;
  obstetricFormula: string; // G_ P____
  contraceptiveMethod: string;
  lastMenstrualPeriod: string; // FUR (YYYY-MM-DD)
  papHistory: string;
  vphTestHistory: string;
  medicalAllergies: string;
  surgeriesHistory: string;
  familyHistory: string;
  notes?: string;
  updatedAt: string;
}

export interface ColposcopyImage {
  url: string;
  caption: string;
  timestamp: string;
}

export interface ColposcopyReport {
  id: string;
  patientId: string;
  reportDate: string; // YYYY-MM-DD
  adequateColposcopy: boolean;
  inadequateReason?: string;
  squamocolumnarJunctionVisible: "Visible" | "No visible" | "Parcialmente visible";
  transformationZoneType: "Tipo 1" | "Tipo 2" | "Tipo 3";
  matureSquamousEpithelium: boolean;
  ectopy: boolean;
  // Criterios IFCPC adicionales normales
  nabothCyst?: boolean;
  cryptOpenings?: boolean;
  deciduosis?: boolean;
  // Hallazgos Grado 1 (menor)
  thinAcetowhiteEpithelium: boolean;
  irregularBorder: boolean;
  fineMosaic: boolean;
  finePunctation: boolean;
  // Hallazgos Grado 2 (mayor)
  denseAcetowhiteEpithelium: boolean;
  rapidAcetowhite?: boolean;
  thickenedGlands?: boolean;
  coarseMosaic: boolean;
  coarsePunctation: boolean;
  sharpBorders?: boolean;
  innerBorderSign?: boolean;
  ridgeSign?: boolean;
  // No específicos
  leukoplakia?: boolean;
  erosion?: boolean;
  schillerTest: string; // "Negativo (Lugol Caoba)", "Positivo (Yodo negativo)", etc.
  // Sospecha de Invasión
  atypicalVessels: boolean;
  fragileVessels?: boolean;
  irregularSurface?: boolean;
  exophyticLesion?: boolean;
  necrosis?: boolean;
  nodularTumor?: boolean;
  // Hallazgos Varios
  congenitalTZ?: boolean;
  condyloma?: boolean;
  polyp?: boolean;
  inflammation?: boolean;
  stenosis?: boolean;
  postTreatmentAnomaly?: boolean;
  endometriosisFoci?: boolean;
  otherFindings?: string;
  // Biopsia y Diagnóstico
  cervicalBiopsyTaken: boolean;
  biopsyClockHours: string[]; // ["1", "2", ..., "12"]
  images: ColposcopyImage[];
  diagnosis: string;
  planRecommendations: string;
  cie10Code: string;
  doctorName: string;
  createdAt: string;
}

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

export interface ProcedureTariff {
  id: string;
  code: string;
  name: string;
  category: "Consulta" | "Procedimiento" | "Ecografía" | "Laboratorio" | "Paquete";
  description: string;
  price: number;
  active: boolean;
  createdAt: string;
}

export interface CommercialBrand {
  brandName: string;
  laboratory: string;
  presentation: string;
  referencePricePen: number;
}

export interface MedicationVademecum {
  id: string;
  genericName: string;
  atcCode: string;
  therapeuticGroup: string;
  commercialBrands: CommercialBrand[];
  indications: string;
  contraindications: string;
  createdAt: string;
}

