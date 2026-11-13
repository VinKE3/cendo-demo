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
  insuranceInfo?: string;
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

export type PrescriptionRoute =
  | "Vía Vaginal"
  | "Vía Oral"
  | "Vía Tópica"
  | "Vía Intramuscular"
  | "Vía Subcutánea"
  | "Otra";

export interface PrescriptionItem {
  id: string;
  medicationName: string; // ej: "Ginedazol (Metronidazol 500mg + Miconazol 100mg)"
  presentation: string; // ej: "Caja x 10 óvulos vaginales"
  route: PrescriptionRoute | string;
  dosage: string; // ej: "1 óvulo"
  frequency: string; // ej: "Cada 24 horas por las noches"
  duration: string; // ej: "Por 7 días continuos"
  instructions?: string; // ej: "Abstinencia sexual durante el tratamiento"
  quantity?: string; // ej: "1 caja"
}

export interface MedicalPrescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorCmp: string;
  doctorRne: string;
  prescriptionDate: string; // YYYY-MM-DD
  diagnosis: string;
  cie10Code?: string;
  items: PrescriptionItem[];
  generalIndications?: string;
  nextAppointmentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type LabCategory =
  | "Hematología & Bioquímica"
  | "Ginecología & Marcadores"
  | "Perfil Hormonal & Ovárico"
  | "Perfil Prenatal / Gestacional"
  | "Infeccioso & Microbiología"
  | "Orina & Función Renal"
  | "Otro";

export interface LabOrderItem {
  id: string;
  category: LabCategory | string;
  testName: string; // ej. "CA-125 (Marcador Ovárico / Endometriosis)"
  sampleType?: string; // ej. "Sangre venosa", "Orina", "Secreción endocervical"
  notes?: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorCmp: string;
  doctorRne: string;
  orderDate: string; // YYYY-MM-DD
  diagnosis: string;
  cie10Code?: string;
  items: LabOrderItem[];
  customTests?: string; // Campo libre para exámenes adicionales
  urgency: "Rutina" | "Prioritario" | "Urgente";
  patientInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

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




