/**
 * CENDO - MÓDULO USUARIOS Y DIRECTORIO MÉDICO
 * Tipos de datos para perfiles de especialistas, roles y credenciales SUSALUD (CMP/RNE).
 */

export type DoctorRole = "director" | "doctor" | "assistant";
export type DoctorTitle = "Dr." | "Dra." | "Lic.";

export interface DoctorProfile {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  doctorTitle: DoctorTitle | string;
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

export type CreateDoctorInput = Omit<DoctorProfile, "id" | "createdAt">;
export type UpdateDoctorInput = Partial<CreateDoctorInput>;
