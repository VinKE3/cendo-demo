/**
 * Módulo de Recetas Médicas Inteligentes - Validaciones & Catálogos Clínicos
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { z } from "zod";
import {
  ClinicalDosagePreset,
  CreatePrescriptionInput,
  PrescriptionItem,
} from "./recetas.types";

export const CLINICAL_DOSAGE_PRESETS: ClinicalDosagePreset[] = [
  {
    label: "Dienogest 2mg diario continuo (Endometriosis)",
    badge: "Vía Oral",
    route: "Vía Oral",
    dosage: "1 comprimido (2 mg)",
    frequency: "Cada 24 horas a la misma hora sin interrupción",
    duration: "Por 6 meses continuos",
    instructions: "Tomar todos los días preferentemente por la noche. No suspender durante el sangrado.",
    quantity: "6 cajas x 28 comprimidos",
  },
  {
    label: "Óvulo Vaginal x 7 Noches (Infección Mixta)",
    badge: "Vía Vaginal",
    route: "Vía Vaginal",
    dosage: "1 óvulo",
    frequency: "Cada 24 horas por las noches antes de dormir",
    duration: "Por 7 días continuos",
    instructions: "Introducir profundamente en la vagina al acostarse. Abstinencia sexual durante el tratamiento.",
    quantity: "1 caja x 7 óvulos",
  },
  {
    label: "Antibiótico Oral c/12h x 7 días",
    badge: "Vía Oral",
    route: "Vía Oral",
    dosage: "1 tableta / cápsula",
    frequency: "Cada 12 horas después de los alimentos",
    duration: "Por 7 días continuos sin suspender",
    instructions: "Tomar con abundante agua después de las comidas. Completar el ciclo prescrito.",
    quantity: "14 tabletas / cápsulas",
  },
  {
    label: "AINE c/8h condicional al dolor menstrual",
    badge: "Vía Oral",
    route: "Vía Oral",
    dosage: "1 tableta (550 mg)",
    frequency: "Cada 8 horas con las comidas",
    duration: "Por 3 a 5 días condicional a dismenorrea",
    instructions: "Tomar siempre con alimentos para protección gástrica.",
    quantity: "15 tabletas",
  },
];

export const prescriptionItemSchema = z.object({
  id: z.string().optional(),
  medicationName: z.string().min(2, "El nombre del fármaco es obligatorio"),
  presentation: z.string().min(2, "La presentación médica es obligatoria"),
  route: z.string().min(2, "La vía de administración es obligatoria"),
  dosage: z.string().min(1, "La dosis es obligatoria"),
  frequency: z.string().min(2, "La frecuencia es obligatoria"),
  duration: z.string().min(2, "La duración es obligatoria"),
  instructions: z.string().optional(),
  quantity: z.string().optional(),
});

export const prescriptionInputSchema = z.object({
  patientId: z.string().min(1, "El ID de paciente es obligatorio"),
  doctorId: z.string().min(1, "El especialista es obligatorio"),
  doctorName: z.string().min(2, "El nombre del médico es obligatorio"),
  doctorCmp: z.string().min(3, "El CMP del médico es obligatorio"),
  prescriptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  diagnosis: z.string().min(3, "El diagnóstico médico es obligatorio"),
  items: z.array(prescriptionItemSchema).min(1, "Debe agregar al menos un medicamento a la receta"),
});

export function checkDuplicateMedicationInPrescription(
  items: PrescriptionItem[],
  candidateName: string
): boolean {
  const norm = candidateName.trim().toLowerCase();
  return items.some((item) => item.medicationName.trim().toLowerCase() === norm);
}

export function validatePrescriptionInput(
  input: CreatePrescriptionInput
): { success: boolean; error?: string } {
  const result = prescriptionInputSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Datos de receta médica inválidos" };
  }
  return { success: true };
}
