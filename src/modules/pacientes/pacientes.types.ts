/**
 * CENDO - MÓDULO PACIENTES Y DIRECTORIO CLÍNICO
 * Tipos de datos e interfaces para la ficha patronímica y filiación de pacientes.
 */

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
  educationLevel?: string;
  birthPlace?: string;
  religion?: string;
  insuranceInfo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreatePatientInput = Omit<Patient, "id" | "createdAt" | "updatedAt">;
export type UpdatePatientInput = Partial<CreatePatientInput>;
