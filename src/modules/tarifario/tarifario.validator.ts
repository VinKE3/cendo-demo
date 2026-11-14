import * as z from "zod";
import { ProcedureTariff, TariffCategory } from "./tarifario.types";

export const tariffCategories: [TariffCategory, ...TariffCategory[]] = [
  "Consulta",
  "Procedimiento",
  "Ecografía",
  "Laboratorio",
  "Paquete",
];

export const tariffSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(15, "El código no debe exceder 15 caracteres")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(3, "El nombre del procedimiento debe tener al menos 3 caracteres"),
  category: z.enum(tariffCategories, {
    errorMap: () => ({ message: "Seleccione una categoría médica válida" }),
  }),
  description: z.string().trim().default(""),
  price: z.coerce
    .number({ invalid_type_error: "Ingrese un precio numérico válido" })
    .min(0.01, "El precio oficial debe ser mayor a S/ 0.00"),
  active: z.boolean().default(true),
});

export type TariffFormData = z.infer<typeof tariffSchema>;

/**
 * Validador anti-duplicados para el Tarifario Médico
 * Previene la duplicación de código de prestación o nombre de procedimiento.
 */
export function checkDuplicateTariff(
  code: string,
  name: string,
  existingList: ProcedureTariff[],
  excludeId?: string
): { isDuplicate: boolean; duplicateItem?: ProcedureTariff; reason?: string } {
  const cleanCode = code.trim().toUpperCase();
  const cleanName = name.trim().toLowerCase();

  for (const item of existingList) {
    if (excludeId && item.id === excludeId) continue;

    // Comparación por código (ej. "CONS-001")
    if (item.code.trim().toUpperCase() === cleanCode) {
      return {
        isDuplicate: true,
        duplicateItem: item,
        reason: `El código "${cleanCode}" ya está en uso por "${item.name}".`,
      };
    }

    // Comparación por nombre insensible a mayúsculas y espacios
    if (item.name.trim().toLowerCase() === cleanName) {
      return {
        isDuplicate: true,
        duplicateItem: item,
        reason: `Ya existe un procedimiento registrado con el nombre "${item.name}" (Código: ${item.code}).`,
      };
    }
  }

  return { isDuplicate: false };
}
