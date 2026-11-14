import * as z from "zod";
import { DoctorProfile, DoctorRole, DoctorTitle } from "./usuarios.types";

export const doctorRoles: [DoctorRole, ...DoctorRole[]] = ["director", "doctor", "assistant"];
export const doctorTitles: [DoctorTitle, ...DoctorTitle[]] = ["Dr.", "Dra.", "Lic."];

export const COMMON_SPECIALTIES = [
  "Ginecología y Obstetricia - Endometriosis y Colposcopía",
  "Ginecología Oncológica y Patología Cervical",
  "Cirugía Ginecológica Mínimamente Invasiva y Fertilidad",
  "Ecografía Doppler Ginecológica y Obstétrica",
  "Medicina Materno Fetal y Alto Riesgo Obstétrico",
  "Urología Ginecológica y Piso Pélvico",
  "Endocrinología Ginecológica y Reproducción Asistida",
];

export const doctorSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "El nombre completo del especialista es requerido (mínimo 3 letras)"),
  doctorTitle: z.enum(doctorTitles, {
    errorMap: () => ({ message: "Seleccione un título profesional válido" }),
  }),
  specialty: z
    .string()
    .trim()
    .min(3, "La especialidad médica es requerida"),
  cmp: z
    .string()
    .trim()
    .min(4, "El número de colegiatura médica (CMP) debe tener al menos 4 dígitos")
    .regex(/^\d+$/, "El CMP debe contener únicamente dígitos numéricos"),
  rne: z
    .string()
    .trim()
    .min(4, "El registro nacional de especialista (RNE) debe tener al menos 4 dígitos")
    .regex(/^\d+$/, "El RNE debe contener únicamente dígitos numéricos"),
  role: z.enum(doctorRoles, {
    errorMap: () => ({ message: "Seleccione un rol institucional válido" }),
  }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Ingrese un correo electrónico con formato válido (ej. usuario@cendo.pe)"),
  password: z
    .string()
    .min(4, "La contraseña institucional debe tener al menos 4 caracteres"),
  phone: z
    .string()
    .trim()
    .min(6, "El teléfono o celular de contacto es requerido"),
  clinicAddress: z
    .string()
    .trim()
    .min(5, "La sede o consultorio de atención es requerida"),
  isActive: z.boolean().default(true),
  signatureUrl: z.string().optional().default(""),
});

export type DoctorFormData = z.infer<typeof doctorSchema>;

/**
 * Validador anti-duplicados para el Directorio Médico
 * Previene el registro de cuentas duplicadas por correo electrónico o por colegiatura (CMP).
 */
export function checkDuplicateDoctor(
  email: string,
  cmp: string,
  existingList: DoctorProfile[],
  excludeId?: string
): { isDuplicate: boolean; duplicateItem?: DoctorProfile; reason?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCmp = cmp.trim();

  for (const item of existingList) {
    if (excludeId && item.id === excludeId) continue;

    // Duplicado por correo institucional
    if (item.email.trim().toLowerCase() === cleanEmail) {
      return {
        isDuplicate: true,
        duplicateItem: item,
        reason: `Ya existe una cuenta médica registrada con el correo "${cleanEmail}" (${item.doctorTitle} ${item.fullName}).`,
      };
    }

    // Duplicado por CMP (Colegio Médico del Perú)
    if (cleanCmp && item.cmp && item.cmp.trim() === cleanCmp) {
      return {
        isDuplicate: true,
        duplicateItem: item,
        reason: `El número de colegiatura CMP ${cleanCmp} ya está registrado a nombre de ${item.doctorTitle} ${item.fullName}.`,
      };
    }
  }

  return { isDuplicate: false };
}
