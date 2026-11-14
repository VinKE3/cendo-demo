import * as z from "zod";
import { Patient } from "./pacientes.types";

export const patientSchema = z.object({
  dni: z
    .string()
    .trim()
    .min(8, "El DNI o documento debe tener al menos 8 dígitos")
    .max(12, "El documento no debe exceder 12 caracteres")
    .regex(/^[0-9A-Za-z]+$/, "El documento solo debe contener números o letras (DNI/CE/Pasaporte)"),
  firstName: z
    .string()
    .trim()
    .min(2, "Los nombres de la paciente son obligatorios (mínimo 2 letras)")
    .transform((val) => val.trim().toUpperCase()),
  lastName: z
    .string()
    .trim()
    .min(2, "Los apellidos de la paciente son obligatorios (mínimo 2 letras)")
    .transform((val) => val.trim().toUpperCase()),
  birthDate: z
    .string()
    .trim()
    .min(10, "Seleccione una fecha de nacimiento válida")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido de fecha (debe ser YYYY-MM-DD)"),
  phone: z
    .string()
    .trim()
    .min(6, "Ingrese un teléfono o celular válido (mínimo 6 dígitos)"),
  email: z
    .string()
    .trim()
    .email("Ingrese un correo electrónico válido")
    .or(z.literal("")),
  address: z.string().trim().default(""),
  civilStatus: z.string().trim().default("Soltera"),
  occupation: z.string().trim().default(""),
  educationLevel: z.string().trim().default("Superior Universitaria"),
  birthPlace: z.string().trim().default(""),
  religion: z.string().trim().default("Católica"),
});

export type PatientFormData = z.infer<typeof patientSchema>;

/**
 * Calcula con exactitud la edad cronológica en años a partir de la fecha de nacimiento (YYYY-MM-DD).
 */
export function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Validador anti-duplicados para el Directorio de Pacientes
 * Previene el registro de dos historias clínicas con el mismo documento de identidad (DNI).
 */
export function checkDuplicatePatient(
  dni: string,
  existingList: Patient[],
  excludeId?: string
): { isDuplicate: boolean; duplicatePatient?: Patient; reason?: string } {
  const cleanDni = dni.trim().toLowerCase();

  for (const patient of existingList) {
    if (excludeId && patient.id === excludeId) continue;

    if (patient.dni.trim().toLowerCase() === cleanDni) {
      return {
        isDuplicate: true,
        duplicatePatient: patient,
        reason: `El documento ${dni.trim()} ya se encuentra registrado a nombre de "${patient.lastName}, ${patient.firstName}".`,
      };
    }
  }

  return { isDuplicate: false };
}
