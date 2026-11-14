import * as z from "zod";
import { FurCalculationResult } from "./antecedentes.types";

export const STANDARD_CONTRACEPTIVE_OPTIONS = [
  "Ninguno (Embarazo deseado y planificado)",
  "Ninguno (Sin vida sexual activa)",
  "Ninguno",
  "Preservativo de barrera",
  "Preservativo / Condón masculino",
  "Anticonceptivos orales combinados",
  "Anticonceptivos de progestágeno solo (Minipíldora)",
  "Inyectable mensual",
  "Inyectable trimestral (Depo-Provera)",
  "Implante subdérmico (Jadelle / Implanon)",
  "DIU T de Cobre (TCu 380A)",
  "DIU Hormonal (Mirena / Kyleena)",
  "Parche transdérmico",
  "Anillo vaginal",
  "Ligadura de trompas",
  "Quirúrgico / Salpingoclasia bilateral previa",
  "Vasectomía (pareja)",
  "Método del ritmo / Abstinencia periódica",
  "Método de lactancia y amenorrea (MELA)",
  "Anticoncepción oral de emergencia (AOE)",
];

export const backgroundSchema = z.object({
  obstetricFormula: z
    .string()
    .trim()
    .min(1, "La fórmula obstétrica es requerida (ej. G0 P0000)")
    .transform((val) => val.toUpperCase()),
  menarche: z.coerce.number().min(8, "Edad mínima 8 años").max(20, "Edad máxima 20 años").optional(),
  sexualDebutAge: z.coerce.number().min(10, "Edad mínima 10 años").max(40, "Edad máxima 40 años").optional(),
  sexualPartnersCount: z.coerce.number().min(0, "Mínimo 0 parejas").optional(),
  catamenialRegimen: z.string().trim().default("28/4"),
  stiHistory: z.string().trim().default("Niega ITS"),
  contraceptiveMethod: z.string().trim().default("Ninguno"),
  lastMenstrualPeriod: z.string().trim().default(""),
  papHistory: z.string().trim().default("No refiere"),
  vphTestHistory: z.string().trim().default("No realizado"),
  hasDiabetes: z.string().trim().default("Niega"),
  hasHypertension: z.string().trim().default("Niega"),
  hasAsthma: z.string().trim().default("Niega"),
  medicalAllergies: z.string().trim().default("Niega"),
  surgeriesHistory: z.string().trim().default("Niega"),
  familyHistory: z.string().trim().default("No refiere"),
  otherPathologies: z.string().trim().default("Niega"),
  notes: z.string().trim().default(""),
});

export type BackgroundFormData = z.infer<typeof backgroundSchema>;

/**
 * Calculadora de semanas y días de amenorrea obstétrica a partir de la FUR (Fecha de Última Regla).
 */
export function calculateGestationalAgeFromFur(furString: string): FurCalculationResult | null {
  if (!furString || !/^\d{4}-\d{2}-\d{2}$/.test(furString)) return null;

  const furDate = new Date(furString + "T00:00:00");
  if (isNaN(furDate.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - furDate.getTime();
  if (diffTime < 0) {
    return { days: 0, weeks: 0, remainingDays: 0, text: "", error: "La FUR no puede ser una fecha futura" };
  }

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  const remainingDays = diffDays % 7;

  return {
    days: diffDays,
    weeks,
    remainingDays,
    text: `${weeks} sem ${remainingDays} d (${diffDays} días de amenorrea)`,
  };
}
