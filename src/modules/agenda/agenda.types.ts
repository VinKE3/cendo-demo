/**
 * Módulo de Agenda de Citas Médicas - Definiciones de Tipos
 * Centro de Endometriosis y Ginecología (CENDO)
 * Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)
 */

export type AppointmentStatus =
  | "PENDIENTE"
  | "CONFIRMADA"
  | "EN_ESPERA"
  | "ATENDIDA"
  | "CANCELADA"
  | "NO_ASISTIO";

export type AppointmentType =
  | "CONSULTA_PRIMERA_VEZ"
  | "CONTROL_GINECOLOGICO"
  | "CHEQUEO_INTEGRAL"
  | "CONTROL_PRENATAL"
  | "COLPOSCOPIA"
  | "ECOGRAFIA"
  | "PROCEDIMIENTO_MENOR";

export interface MedicalAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientDni: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  durationMinutes: number;
  appointmentType: AppointmentType;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentInput {
  id?: string;
  patientId: string;
  patientName: string;
  patientDni?: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes?: number;
  appointmentType: AppointmentType;
  reason?: string;
  status?: AppointmentStatus;
  notes?: string;
  reminderSent?: boolean;
}

export type UpdateAppointmentInput = Partial<Omit<MedicalAppointment, "id" | "createdAt" | "updatedAt">>;

export interface AppointmentFilterOptions {
  date?: string;
  doctorId?: string;
  status?: string;
  patientId?: string;
  searchQuery?: string;
}

export interface AppointmentDayStats {
  total: number;
  confirmadas: number;
  enEspera: number;
  atendidas: number;
  canceladas: number;
}
