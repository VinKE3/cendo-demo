/**
 * Módulo de Colposcopía IFCPC 2011 - Validador & Lógica Clínica
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { z } from "zod";
import { CreateColposcopyInput, CervicalClockHour } from "./colposcopia.types";

export const VALID_CLOCK_HOURS: CervicalClockHour[] = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
];

export const colposcopySchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1, "Debe seleccionar una paciente"),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  adequateColposcopy: z.boolean().default(true),
  squamocolumnarJunctionVisible: z.enum(["Visible", "No visible", "Parcialmente visible"]).default("Visible"),
  transformationZoneType: z.enum(["Tipo 1", "Tipo 2", "Tipo 3"]).default("Tipo 1"),
  matureSquamousEpithelium: z.boolean().default(true),
  ectopy: z.boolean().default(false),
  thinAcetowhiteEpithelium: z.boolean().default(false),
  irregularBorder: z.boolean().default(false),
  fineMosaic: z.boolean().default(false),
  finePunctation: z.boolean().default(false),
  denseAcetowhiteEpithelium: z.boolean().default(false),
  coarseMosaic: z.boolean().default(false),
  coarsePunctation: z.boolean().default(false),
  atypicalVessels: z.boolean().default(false),
  schillerTest: z.string().default("Negativo (Lugol Caoba)"),
  cervicalBiopsyTaken: z.boolean().default(false),
  biopsyClockHours: z.array(z.string()).default([]),
  images: z.array(z.object({
    url: z.string().min(1),
    caption: z.string().default(""),
    timestamp: z.string().default(""),
  })).default([]),
  diagnosis: z.string().min(3, "El diagnóstico colposcópico es requerido"),
  planRecommendations: z.string().min(3, "Las recomendaciones son requeridas"),
  cie10Code: z.string().default("Z01.4"),
  doctorName: z.string().default("Dr. Patrick José Jacinto Gomero"),
});

export function normalizeClockHours(hours: string[]): string[] {
  const unique = Array.from(new Set(hours.filter((h) => VALID_CLOCK_HOURS.includes(h as CervicalClockHour))));
  return unique.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
}

export function classifyIFCPCSeverity(data: {
  atypicalVessels?: boolean;
  denseAcetowhiteEpithelium?: boolean;
  coarseMosaic?: boolean;
  coarsePunctation?: boolean;
  thinAcetowhiteEpithelium?: boolean;
  fineMosaic?: boolean;
  finePunctation?: boolean;
}): "Invasión" | "Grado 2 (Mayor)" | "Grado 1 (Menor)" | "Normal / Sin atipia" {
  if (data.atypicalVessels) return "Invasión";
  if (data.denseAcetowhiteEpithelium || data.coarseMosaic || data.coarsePunctation) {
    return "Grado 2 (Mayor)";
  }
  if (data.thinAcetowhiteEpithelium || data.fineMosaic || data.finePunctation) {
    return "Grado 1 (Menor)";
  }
  return "Normal / Sin atipia";
}

export function validateColposcopyInput(
  input: CreateColposcopyInput
): { success: true; data: z.infer<typeof colposcopySchema> } | { success: false; error: string } {
  if (input.cervicalBiopsyTaken && (!input.biopsyClockHours || input.biopsyClockHours.length === 0)) {
    return {
      success: false,
      error: "Si se tomó biopsia cervical, debe marcar al menos una hora en el reloj cervical (1h - 12h).",
    };
  }

  const parsed = colposcopySchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg };
  }

  parsed.data.biopsyClockHours = normalizeClockHours(parsed.data.biopsyClockHours);
  return { success: true, data: parsed.data };
}
