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
  hemoglobin1?: number;
  hemoglobin1Date?: string;
  hemoglobin2?: number;
  hemoglobin2Date?: string;
  bloodGlucose1?: number;
  bloodGlucose1Date?: string;
  vdrlRpr1?: "No reactivo" | "Reactivo" | "No se hizo" | string;
  vdrlRpr1Date?: string;
  hivScreening1?: "Negativo" | "Positivo" | "No se hizo" | string;
  hivScreening1Date?: string;
  hepatitisBScreening?: "Negativo" | "Positivo" | "No se hizo" | string;
  hepatitisBScreeningDate?: string;
  completeUrineExam?: "Normal" | "Patológico" | "No se hizo" | string;
  completeUrineExamDate?: string;
  urineCulture?: "Negativo" | "Positivo" | "Pendiente" | "No se hizo" | string;
  papTestResult?: "Normal" | "Anormal" | "No se hizo" | string;
  colposcopyResult?: "Normal" | "Anormal" | "No se hizo" | string;
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
