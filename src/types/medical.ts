export interface DoctorProfile {
  id: string;
  email: string;
  fullName: string;
  doctorTitle: string;
  specialty: string;
  cmp: string;
  rne: string;
  clinicName: string;
  clinicAddress: string;
  phone: string;
  contactEmail: string;
  avatarUrl?: string;
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
  squamocolumnarJunctionVisible: "Visible" | "No visible" | "Parcialmente visible";
  transformationZoneType: "Tipo 1" | "Tipo 2" | "Tipo 3";
  matureSquamousEpithelium: boolean;
  ectopy: boolean;
  thinAcetowhiteEpithelium: boolean;
  denseAcetowhiteEpithelium: boolean;
  irregularBorder: boolean;
  fineMosaic: boolean;
  coarseMosaic: boolean;
  finePunctation: boolean;
  coarsePunctation: boolean;
  atypicalVessels: boolean;
  schillerTest: string; // "Negativo (Lugol Caoba)", "Positivo (Yodo negativo)", etc.
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

