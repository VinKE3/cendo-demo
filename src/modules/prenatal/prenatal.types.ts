/**
 * CENDO - Módulo 13: Carnet de Control Prenatal MINSA / CLAP
 * Tipos oficiales para el seguimiento longitudinal de la gestación y riesgo obstétrico.
 */

export interface PrenatalVisitItem {
  visitNumber: number;
  visitDate: string;
  visitTime?: string;
  gestationalAgeWeeks: number;
  gestationalAgeDays: number;
  maternalWeightKg: number;
  temperature: number;
  bloodPressure: string;
  maternalPulse: number;
  uterineHeightCm: number;
  fetusSituation: "L" | "T" | "NA";
  fetusPresentation: "C" | "P" | "NA";
  fetusPosition: "D" | "I" | "NA";
  fetalHeartRate: number;
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
  // Sección 1: Filiación y Ubigeo
  establishmentOrigin?: string;
  originNoApplies?: boolean;
  originReferral?: boolean;
  insuranceType: "SIS" | "ESSALUD" | "PRIVADO" | "No Aplica";
  insuranceCode?: string;
  insuranceAffiliationCode?: string;
  educationLevel: "Analfabeta" | "Primaria" | "Secundaria" | "Superior No Univ" | "Superior Univ";
  approvedEducationYears?: number;
  civilStatus: "Soltera" | "Casada" | "Conviviente" | "Otro";
  fatherName?: string;
  fatherDni?: string;
  locality?: string;
  healthSectorCode?: string;
  department?: string;
  province?: string;
  district?: string;
  patientAddress?: string;
  patientPhone?: string;
  patientEmail?: string;
  patientOccupation?: string;
  gestas: number;
  abortos: number;
  partosVaginales: number;
  cesareas: number;
  nacidosVivos: number;
  nacidosMuertos: number;
  viven: number;
  rnMayorPesoGramos?: number;
  lowWeightHistory?: boolean;
  multipleHistory?: boolean;
  pretermHistory?: boolean;
  parityRisk0or3?: boolean;
  deadFirstWeek?: number;
  deadAfterFirstWeek?: number;
  previousDeliveryDate?: string;
  previousDeliveryType?: "Parto Vaginal" | "Cesárea" | "Aborto" | "Ectópico" | "Aborto molar" | "Molar" | "No Aplica" | string;
  previousAbortionType?: "Incompleto" | "Completo" | "Frustro/Retenido" | "Séptico" | "No Aplica" | string;
  adequateIntergenesicPeriod?: boolean;
  breastfeedingMonths?: "< 6 meses" | "6 meses o más" | "no hubo" | "No hubo" | "No aplica" | string;
  deliveryPlace?: "EESS" | "Domic." | "No aplica" | string;
  pregnancyCaptured?: boolean;
  communityAgentReferred?: boolean;
  familyHistory: string[];
  familyHistoryDetails?: Record<string, string>;
  familyHistoryOther?: string;
  personalHistory: string[];
  personalHistoryDetails?: Record<string, string>;
  personalHistoryOther?: string;
  previousVaccines: { rubella: boolean; hepatitisB: boolean; hpv: boolean; yellowFever: boolean };
  antitetanicaDosis?: "Previa" | "1ra" | "2da" | "Sin dosis" | "No aplica" | string;
  antitetanicaPrevDoses?: number;
  antitetanica1stDoseMonth?: string;
  antitetanica2ndDoseMonth?: string;
  antitetanicaStatus?: "Sin dosis" | "No Aplica" | "Vacunada" | string;
  usualWeightKg: number;
  heightCm: number;
  bloodGroup: "A" | "B" | "AB" | "O" | string;
  rhFactor: "Rh (+)" | "Rh (-) Sensibilizada" | "Rh (-) No Sensibilizada" | "Rh (-) Desconocida" | string;
  smokerCigarettesDay?: number;
  drugsUse?: boolean;
  alcoholUse?: boolean;
  fum: string;
  fumDoubt: boolean;
  ultrasoundGestationalAgeWeeks?: number;
  ultrasoundDate?: string;
  ultrasoundNoApplies?: boolean;
  fpp: string;
  hospitalized?: boolean;
  hospitalizationHistory?: { date?: string; diagnosis?: string; cie10?: string };
  hadEmergency?: boolean;
  emergencyHistory?: { date?: string; diagnosis?: string; cie10?: string };
  violenceScreening?: { screeningDone?: boolean; violenceDetected?: boolean; date?: string };
  clinicalExam: "Normal" | "Patológico" | "Sin Examen" | string;
  clinicalExamDetail?: string;
  breastsExam: "Normal" | "Patológico" | "Sin Examen" | string;
  breastsExamDetail?: string;
  cervixExam: "Normal" | "Patológico" | "Sin Examen" | string;
  cervixExamDetail?: string;
  pelvisExam: "Normal" | "Patológico" | "Sin Examen" | string;
  pelvisExamDetail?: string;
  dentalExam: "Normal" | "Patológico" | "Sin Examen" | string;
  dentalExamDetail?: string;
  // ==========================================
  // EXÁMENES DE LABORATORIO (MINSA / CLAP)
  // ==========================================
  // Hemoglobina
  hemoglobin1?: number;
  hemoglobin1Date?: string;
  hemoglobin1NotDone?: boolean;
  hemoglobin2?: number;
  hemoglobin2Date?: string;
  hemoglobin2NotDone?: boolean;
  hemoglobinDischarge?: number;
  hemoglobinDischargeDate?: string;
  hemoglobinDischargeNotDone?: boolean;

  // Glicemia & Tolerancia
  bloodGlucose1?: number;
  bloodGlucose1Date?: string;
  glucose1Result?: "Normal" | "Anormal" | "No se Hizo" | string;
  glucose1Date?: string;
  glucose1Value?: number;
  glucose2Result?: "Normal" | "Anormal" | "No se Hizo" | string;
  glucose2Date?: string;
  glucose2Value?: number;
  glucoseToleranceResult?: "Normal" | "Anormal" | "No se Hizo" | "No se Aplica" | string;
  glucoseToleranceDate?: string;
  glucoseToleranceValue?: number;

  // Sífilis & Infecciones de Transmisión Sexual
  vdrlRpr1?: "No reactivo" | "Reactivo" | "No se hizo" | string;
  vdrlRpr1Date?: string;
  vdrlRpr1Result?: "No reactivo" | "Reactivo" | "No se Hizo" | string;
  vdrlRpr2Result?: "No reactivo" | "Reactivo" | "No se Hizo" | "No se Aplica" | string;
  vdrlRpr2Date?: string;
  ftaAbsResult?: "No reactivo" | "Reactivo" | "No se Hizo" | "No se Aplica" | string;
  ftaAbsDate?: string;
  tphaResult?: "No reactivo" | "Reactivo" | "No se Hizo" | "No se Aplica" | string;
  tphaDate?: string;
  rapidSyphilisResult?: "No reactivo" | "Reactivo" | "No se Hizo" | string;
  rapidSyphilisDate?: string;
  hivScreening1?: "Negativo" | "Positivo" | "No se hizo" | string;
  hivScreening1Date?: string;
  hivRapid1Result?: "No reactivo" | "Reactivo" | "No se Hizo" | string;
  hivRapid1Date?: string;
  hivRapid2Result?: "No reactivo" | "Reactivo" | "No se Hizo" | "No se Aplica" | string;
  hivRapid2Date?: string;
  hivElisaResult?: "No reactivo" | "Reactivo" | "No se Hizo" | "No se Aplica" | string;
  hivElisaDate?: string;

  // Infecciones Especiales & Zoonosis/Vectores
  westernBlotResult?: "Negativo" | "Positivo" | "No se Hizo" | "No se Aplica" | string;
  westernBlotDate?: string;
  htlv1Result?: "Negativo" | "Positivo" | "No se Hizo" | "No se Aplica" | string;
  htlv1Date?: string;
  torchResult?: "Negativo" | "Positivo" | "No se Hizo" | "No se Aplica" | string;
  torchDate?: string;
  thickBloodSmearResult?: "Negativo" | "Positivo" | "No se Hizo" | "No se Aplica" | string;
  thickBloodSmearDate?: string;
  malariaRapidResult?: "Negativo" | "Positivo" | "No se Hizo" | "No se Aplica" | string;
  malariaRapidDate?: string;
  malariaFluorescenceResult?: "Negativo" | "Positivo" | "No se Hizo" | "No se Aplica" | string;
  malariaFluorescenceDate?: string;

  // Orina & Infecciones
  completeUrineExam?: "Normal" | "Patológico" | "No se hizo" | string;
  completeUrineExamDate?: string;
  completeUrineExamResult?: "Negativo" | "Positivo" | "No se Hizo" | string;
  leukocyturiaResult?: "Negativo" | "Positivo" | "No se Hizo" | string;
  nitritesResult?: "Negativo" | "Positivo" | "No se Hizo" | string;
  nitritesDate?: string;
  urineCulture?: "Negativo" | "Positivo" | "Pendiente" | "No se hizo" | string;
  urineCultureResult?: "Negativo" | "Positivo" | "No se Hizo" | "No se Aplica" | string;
  urineCultureDate?: string;
  bkSputumResult?: "Negativo" | "Positivo" | "No se Hizo" | "No se Aplica" | string;
  bkSputumDate?: string;
  listeriaResult?: "Negativo" | "Positivo" | "No se Hizo" | "No se Aplica" | string;
  listeriaDate?: string;
  hepatitisBScreening?: "Negativo" | "Positivo" | "No se hizo" | string;
  hepatitisBScreeningDate?: string;
  hepatitisBResult?: "Negativo" | "Positivo" | "No se Hizo" | "No se Aplica" | string;
  hepatitisBDate?: string;

  // Tamizaje Cervical en Gestantes
  papTestResult?: "Normal" | "Anormal" | "No se Hizo" | string;
  papTestDate?: string;
  ivaaResult?: "Normal" | "Anormal" | "No se Hizo" | "No se Aplica" | string;
  ivaaDate?: string;
  colposcopyResult?: "Normal" | "Anormal" | "No se Hizo" | "No se Aplica" | string;
  colposcopyDate?: string;
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

export interface PrenatalRiskReport {
  isHighRisk: boolean;
  riskCategory: "Bajo Riesgo Obstétrico" | "Alto Riesgo Obstétrico (ARO)";
  warningFlags: string[];
}

export type CreatePrenatalCardInput = Omit<PrenatalCard, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

export type UpdatePrenatalCardInput = Partial<CreatePrenatalCardInput> & {
  id: string;
};
