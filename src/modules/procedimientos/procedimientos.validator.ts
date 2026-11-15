/**
 * Módulo de Procedimientos Menores & Biopsias - Validador & Lógica Clínica
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { z } from "zod";
import { CreateMinorProcedureInput, ProcedureType } from "./procedimientos.types";

export const PROCEDURE_TYPE_LABELS: Record<ProcedureType, string> = {
  BIOPSIA_CERVICAL: "Biopsia Cervical Dirigida por Colposcopía",
  BIOPSIA_ENDOMETRIAL: "Biopsia Endometrial con Cánula de Pipelle de Cornier",
  CONO_LEEP: "Cono LEEP con Asa Diatérmica (Resección Cervical)",
  POLIPECTOMIA: "Polipectomía Cervical / Endocervical",
  INSERCION_DIU: "Inserción de DIU / SIU (Mirena / Kyleena / T de Cobre)",
  RETIRO_DIU: "Retiro de DIU / SIU",
  INSERCION_IMPLANTE: "Inserción de Implante Subdérmico (Jadelle / Nexplanon)",
  RETIRO_IMPLANTE: "Retiro de Implante Subdérmico",
  OTRO: "Otro Procedimiento Menor Ginecológico",
};

export const procedureDetailsSchema = z.object({
  asepsisTechnique: z.string().default("Antisepsia con clorhexidina al 2%"),
  biopsySites: z.string().optional(),
  specimenSentToPathology: z.boolean().default(false),
  specimenDescription: z.string().optional(),
  bleedingAmount: z.enum(["Mínimo (< 10 ml)", "Escaso", "Moderado"]).default("Mínimo (< 10 ml)"),
  hemostasisMethod: z.enum(["Solución de Monsel", "Electrocoagulación", "Compresión", "Sutura"]).default("Solución de Monsel"),
  complications: z.string().default("Sin complicaciones inmediatas."),
});

export const minorProcedureSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1, "Debe seleccionar una paciente"),
  doctorId: z.string().default("doc-patrick-jacinto"),
  doctorName: z.string().min(2, "El nombre del médico es requerido"),
  doctorCmp: z.string().min(4, "El CMP del médico es requerido"),
  doctorRne: z.string().optional(),
  procedureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  procedureType: z.enum([
    "BIOPSIA_CERVICAL",
    "BIOPSIA_ENDOMETRIAL",
    "CONO_LEEP",
    "POLIPECTOMIA",
    "INSERCION_DIU",
    "RETIRO_DIU",
    "INSERCION_IMPLANTE",
    "RETIRO_IMPLANTE",
    "OTRO",
  ]),
  preOpDiagnosis: z.string().min(3, "El diagnóstico pre-operatorio es requerido"),
  postOpDiagnosis: z.string().min(3, "El diagnóstico post-operatorio es requerido"),
  cie10Code: z.string().optional(),
  anesthesiaType: z.enum(["Local (Lidocaína 2%)", "Sedación", "Sin Anestesia", "Tópica"]).default("Local (Lidocaína 2%)"),
  procedureDetails: procedureDetailsSchema,
  postOpIndications: z.string().min(3, "Las indicaciones post-operatorias son requeridas"),
  medicationsPrescribed: z.string().optional(),
  nextControlDate: z.string().optional(),
});

export function validateMinorProcedureInput(
  input: CreateMinorProcedureInput
): { success: true; data: z.infer<typeof minorProcedureSchema> } | { success: false; error: string } {
  const parsed = minorProcedureSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg };
  }
  return { success: true, data: parsed.data };
}
