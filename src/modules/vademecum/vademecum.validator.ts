import * as z from "zod";
import { MedicationVademecum } from "./vademecum.types";

export const brandSchema = z.object({
  brandName: z.string().trim().min(1, "El nombre de la marca comercial es requerido"),
  laboratory: z.string().trim().min(1, "El laboratorio fabricante es requerido"),
  presentation: z.string().trim().min(1, "La presentación comercial es requerida"),
  referencePricePen: z.coerce
    .number({ invalid_type_error: "El precio debe ser un valor numérico" })
    .min(0, "El precio referencial en soles no puede ser negativo"),
});

export const vademecumSchema = z.object({
  genericName: z
    .string()
    .trim()
    .min(2, "El nombre genérico o principio activo debe tener al menos 2 caracteres"),
  atcCode: z
    .string()
    .trim()
    .min(2, "El código anatómico terapéutico (ATC) es requerido")
    .transform((val) => val.toUpperCase()),
  therapeuticGroup: z
    .string()
    .trim()
    .min(3, "La clasificación o grupo terapéutico es requerido"),
  indications: z
    .string()
    .trim()
    .min(3, "Las indicaciones clínicas de prescripción son requeridas"),
  contraindications: z.string().trim().default(""),
  commercialBrands: z
    .array(brandSchema)
    .min(1, "Debe registrar al menos una marca comercial disponible en Perú"),
});

export type VademecumFormData = z.infer<typeof vademecumSchema>;

/**
 * Validador anti-duplicados para el Vademécum
 * Previene que se registre el mismo principio activo o el mismo código ATC dos veces.
 */
export function checkDuplicateMedication(
  genericName: string,
  atcCode: string | undefined,
  existingList: MedicationVademecum[],
  excludeId?: string
): { isDuplicate: boolean; duplicateItem?: MedicationVademecum; reason?: string } {
  const cleanName = genericName.trim().toLowerCase();
  const cleanAtc = (atcCode || "").trim().toUpperCase();

  for (const item of existingList) {
    if (excludeId && item.id === excludeId) continue;

    // Comparación de nombre genérico ignorando mayúsculas y espacios
    if (item.genericName.trim().toLowerCase() === cleanName) {
      return {
        isDuplicate: true,
        duplicateItem: item,
        reason: `Ya existe un fármaco registrado con el principio activo "${item.genericName}".`,
      };
    }

    // Comparación por código ATC (si existe y no está vacío)
    if (cleanAtc && item.atcCode && item.atcCode.trim().toUpperCase() === cleanAtc) {
      return {
        isDuplicate: true,
        duplicateItem: item,
        reason: `El código ATC "${cleanAtc}" ya está asignado al fármaco "${item.genericName}".`,
      };
    }
  }

  return { isDuplicate: false };
}
