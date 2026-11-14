/**
 * Módulo de Consultas Ginecológicas - Validaciones & Calculadoras Clínicas
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { z } from "zod";
import {
  Cie10Preset,
  ConsultationVitalSigns,
  CreateConsultationInput,
} from "./consultas.types";

export const FREQUENT_DIAGNOSES: Cie10Preset[] = [
  { label: "Endometriosis pélvica profunda (N80.3)", code: "N80.3", text: "Endometriosis pélvica profunda infiltrante (ligamentos uterosacros y tabique rectovaginal)" },
  { label: "Endometrioma ovárico (N80.1)", code: "N80.1", text: "Endometrioma ovárico con dolor pélvico cíclico y dispareunia" },
  { label: "Adenomiosis uterina (N80.0)", code: "N80.0", text: "Adenomiosis uterina difusa con dismenorrea y menorragia" },
  { label: "Displasia Cervical NIC 2 / LIE-AG (N87.1)", code: "N87.1", text: "Neoplasia Intraepitelial Cervical Grado 2 (NIC 2 / LIE-AG) en cérvix uterino" },
  { label: "Displasia Cervical NIC 1 / LIE-BG (N87.0)", code: "N87.0", text: "Neoplasia Intraepitelial Cervical Grado 1 (NIC 1 / LIE-BG) asociada a VPH" },
  { label: "Control de Embarazo Normal (Z34.0)", code: "Z34.0", text: "Supervisión de primer embarazo normal de curso favorable" },
  { label: "Miomatosis Uterina Sintomática (D25.9)", code: "D25.9", text: "Leiomiomatosis uterina intramural sintomática" },
  { label: "Síndrome de Ovario Poliquístico (E28.2)", code: "E28.2", text: "Síndrome de Ovario Poliquístico (SOP) fenotipo ovulatorio irregular" },
  { label: "Vaginitis / Cervicitis Mixta (N76.0)", code: "N76.0", text: "Cervicovaginitis mixta aguda en tratamiento antimicrobiano" },
];

export function calculateBmi(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 22.0;
  const heightMeters = heightCm / 100;
  return Number((weightKg / (heightMeters * heightMeters)).toFixed(2));
}

export function classifyBmi(bmi: number): string {
  if (bmi < 18.5) return "Bajo peso";
  if (bmi < 24.9) return "Peso saludable / Normal";
  if (bmi < 29.9) return "Sobrepeso";
  if (bmi < 34.9) return "Obesidad Grado I";
  if (bmi < 39.9) return "Obesidad Grado II";
  return "Obesidad Grado III (Mórbida)";
}

export function validateBloodPressure(bp: string): boolean {
  return /^\d{2,3}\/\d{2,3}$/.test(bp.trim());
}

export const vitalSignsSchema = z.object({
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, "Presión arterial inválida (ej. 110/70)"),
  heartRate: z.number().int().min(30).max(220),
  respiratoryRate: z.number().int().min(8).max(60).optional(),
  temperature: z.number().min(34).max(43),
  oxygenSaturation: z.number().int().min(50).max(100).optional(),
  weightKg: z.number().min(20).max(300),
  heightCm: z.number().min(80).max(240),
  bmi: z.number().min(10).max(80),
});

export const consultationInputSchema = z.object({
  patientId: z.string().min(1, "El ID de paciente es obligatorio"),
  doctorId: z.string().min(1, "El especialista es obligatorio"),
  doctorName: z.string().min(2, "El nombre del médico es obligatorio"),
  doctorCmp: z.string().min(3, "El CMP del médico es obligatorio"),
  consultationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  reasonForVisit: z.string().min(3, "El motivo de consulta es obligatorio"),
  diagnosis: z.string().min(3, "El diagnóstico médico es obligatorio"),
  treatmentPlan: z.string().min(3, "El plan de tratamiento es obligatorio"),
  vitalSigns: vitalSignsSchema,
});

export function validateConsultationInput(
  input: CreateConsultationInput
): { success: boolean; error?: string } {
  const result = consultationInputSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Datos de consulta inválidos" };
  }
  return { success: true };
}
