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
  insuranceType: "SIS" | "ESSALUD" | "PRIVADO" | "No Aplica";
  insuranceCode?: string;
  educationLevel: "Analfabeta" | "Primaria" | "Secundaria" | "Superior No Univ" | "Superior Univ";
  civilStatus: "Soltera" | "Casada" | "Conviviente" | "Otro";
  fatherName?: string;
  fatherDni?: string;
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
  previousDeliveryDate?: string;
  previousDeliveryType?: "Parto Vaginal" | "Cesárea" | "Aborto" | "Ectópico" | "Molar";
  previousAbortionType?: "Incompleto" | "Completo" | "Frustro/Retenido" | "Séptico" | "No Aplica";
  adequateIntergenesicPeriod?: boolean;
  breastfeedingMonths?: "< 6 meses" | "6 meses o más" | "No hubo";
  familyHistory: string[];
  personalHistory: string[];
  previousVaccines: { rubella: boolean; hepatitisB: boolean; hpv: boolean; yellowFever: boolean };
  usualWeightKg: number;
  heightCm: number;
  bloodGroup: "A" | "B" | "AB" | "O";
  rhFactor: "Rh (+)" | "Rh (-) Sensibilizada" | "Rh (-) No Sensibilizada";
  smokerCigarettesDay?: number;
  drugsUse?: boolean;
  fum: string;
  fumDoubt: boolean;
  ultrasoundGestationalAgeWeeks?: number;
  ultrasoundDate?: string;
  fpp: string;
  clinicalExam: "Normal" | "Patológico";
  breastsExam: "Normal" | "Patológico" | "Sin Examen";
  cervixExam: "Normal" | "Patológico" | "Sin Examen";
  pelvisExam: "Normal" | "Anormal" | "Sin Examen";
  dentalExam: "Normal" | "Patológico" | "Sin Examen";
  hemoglobin1?: number;
  hemoglobin2?: number;
  bloodGlucose1?: number;
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
