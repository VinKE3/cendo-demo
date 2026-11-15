/**
 * Módulo de Ecografías Especializadas - Validador & Lógica Clínica
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { z } from "zod";
import { CreateUltrasoundInput, UltrasoundType, BiradsCategory } from "./ecografias.types";

export const ULTRASOUND_TYPE_LABELS: Record<UltrasoundType, string> = {
  TRANSVAGINAL: "Ecografía Transvaginal (Mapeo Ginecológico & Endometriosis)",
  PELVICA: "Ecografía Pélvica Suprapúbica",
  MAMA_BILATERAL: "Ecografía Mamaria Bilateral (Clasificación BI-RADS)",
  OBSTETRICA_1T: "Ecografía Obstétrica del 1er Trimestre (Viabilidad Fetal)",
  OBSTETRICA_2T_3T: "Ecografía Obstétrica Morfológica (2do - 3er Trimestre)",
  DOPPLER: "Ecografía Doppler Ginecológico Color de Alta Resolución",
};

export const BIRADS_DESCRIPTIONS: Record<BiradsCategory, string> = {
  "BI-RADS 1": "Negativo / Sin hallazgos patológicos (Control anual habitual)",
  "BI-RADS 2": "Hallazgos benignos / Quiste simple o fibroadenoma estable",
  "BI-RADS 3": "Probablemente benigno / Seguimiento a corto plazo (6 meses)",
  "BI-RADS 4": "Sospechoso de malignidad / Se sugiere biopsia percutánea",
  "BI-RADS 5": "Altamente sugestivo de malignidad / Manejo oncológico inmediato",
};

export function calculateUterusVolumeCc(lMm: number, apMm: number, tMm: number): number {
  if (lMm <= 0 || apMm <= 0 || tMm <= 0) return 0;
  return Math.round(((lMm * apMm * tMm * 0.523) / 1000) * 10) / 10;
}

export const ultrasoundSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1, "Debe seleccionar una paciente"),
  doctorId: z.string().default("doc-patrick-jacinto"),
  doctorName: z.string().min(2, "El nombre del médico es requerido"),
  doctorCmp: z.string().min(4, "El CMP del médico es requerido"),
  doctorRne: z.string().optional(),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  ultrasoundType: z.enum([
    "TRANSVAGINAL",
    "PELVICA",
    "MAMA_BILATERAL",
    "OBSTETRICA_1T",
    "OBSTETRICA_2T_3T",
    "DOPPLER",
  ]),
  indication: z.string().min(3, "La indicación clínica es requerida"),
  findings: z.record(z.any()).default({}),
  conclusion: z.string().min(3, "La conclusión ecográfica es requerida"),
  recommendations: z.string().optional(),
  images: z.array(z.object({
    url: z.string().min(1),
    caption: z.string().default(""),
    timestamp: z.string().optional(),
  })).default([]),
});

export function validateUltrasoundInput(
  input: CreateUltrasoundInput
): { success: true; data: z.infer<typeof ultrasoundSchema> } | { success: false; error: string } {
  const parsed = ultrasoundSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg };
  }
  return { success: true, data: parsed.data };
}
