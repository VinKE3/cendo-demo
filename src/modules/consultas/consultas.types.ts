/**
 * Módulo de Consultas Ginecológicas - Definiciones de Tipos
 * Centro de Endometriosis y Ginecología (CENDO)
 * Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)
 */

export interface ConsultationVitalSigns {
  bloodPressure: string; // ej. "110/70"
  heartRate: number; // lpm
  respiratoryRate?: number; // rpm
  temperature: number; // °C
  oxygenSaturation?: number; // %
  weightKg: number; // kg
  heightCm: number; // cm
  bmi: number; // IMC calculado
}

export interface ConsultationPhysicalExam {
  generalExam: string;
  breastsExam: string;
  externalGenitalia: string;
  speculoscopy: string; // Vagina y cérvix
  bimanualPalpation: string; // Útero y anexos
}

export interface MedicalConsultation {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorCmp: string;
  doctorRne?: string;
  consultationDate: string; // YYYY-MM-DD
  reasonForVisit: string;
  illnessTime?: string;
  symptoms?: string;
  vitalSigns: ConsultationVitalSigns;
  physicalExam: ConsultationPhysicalExam;
  diagnosis: string;
  cie10Code?: string;
  treatmentPlan: string;
  auxiliaryExams?: string;
  prescriptionNotes?: string;
  nextAppointmentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConsultationInput {
  id?: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorCmp: string;
  doctorRne?: string;
  consultationDate: string;
  reasonForVisit: string;
  illnessTime?: string;
  symptoms?: string;
  vitalSigns: ConsultationVitalSigns;
  physicalExam: ConsultationPhysicalExam;
  diagnosis: string;
  cie10Code?: string;
  treatmentPlan: string;
  auxiliaryExams?: string;
  prescriptionNotes?: string;
  nextAppointmentDate?: string;
}

export type UpdateConsultationInput = Partial<CreateConsultationInput>;

export interface Cie10Preset {
  label: string;
  code: string;
  text: string;
}
