/**
 * Módulo de Cotizaciones y Presupuestos - Validaciones & Calculadoras
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { z } from "zod";
import {
  CreateQuoteInput,
  QuoteItem,
  QuoteTotals,
} from "./cotizaciones.types";

export function calculateQuoteTotals(items: QuoteItem[]): QuoteTotals {
  const subtotal = items.reduce((acc, it) => acc + (Number(it.regularPrice) || 0), 0);
  const total = items.reduce((acc, it) => acc + (Number(it.finalPrice) || 0), 0);
  const discountTotal = Math.max(0, subtotal - total);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountTotal: Number(discountTotal.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

export function calculateItemFinalPrice(regularPrice: number, discountPercent: number = 0): number {
  const validDiscount = Math.max(0, Math.min(100, discountPercent));
  const finalPrice = regularPrice * (1 - validDiscount / 100);
  return Number(finalPrice.toFixed(2));
}

export const quoteItemSchema = z.object({
  procedureId: z.string().min(1, "El ID de procedimiento es obligatorio"),
  code: z.string().min(1, "El código es obligatorio"),
  name: z.string().min(2, "El nombre del procedimiento es obligatorio"),
  category: z.string().min(2, "La categoría es obligatoria"),
  regularPrice: z.number().positive("El precio regular debe ser mayor a 0"),
  discountPercent: z.number().min(0).max(100).default(0),
  finalPrice: z.number().min(0, "El precio final no puede ser negativo"),
});

export const quoteInputSchema = z.object({
  patientId: z.string().min(1, "El ID de paciente es obligatorio"),
  patientName: z.string().min(2, "El nombre de la paciente es obligatorio"),
  doctorId: z.string().min(1, "El especialista es obligatorio"),
  doctorName: z.string().min(2, "El nombre del médico es obligatorio"),
  validityDays: z.number().int().min(1).max(180).default(30),
  items: z.array(quoteItemSchema).min(1, "Debe agregar al menos un procedimiento a la cotización"),
});

export function validateQuoteInput(
  input: CreateQuoteInput
): { success: boolean; error?: string } {
  const result = quoteInputSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Datos de cotización inválidos" };
  }
  return { success: true };
}
