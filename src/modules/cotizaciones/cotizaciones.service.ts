/**
 * Módulo de Cotizaciones y Presupuestos - Servicio Supabase CRUD
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { createClient } from "@/lib/supabase/client";
import { ensureUuid, getPatientUuid } from "@/lib/supabaseSync";
import {
  CreateQuoteInput,
  ProcedureQuote,
} from "./cotizaciones.types";
import {
  calculateQuoteTotals,
  validateQuoteInput,
} from "./cotizaciones.validator";

export async function fetchQuotesFromSupabase(
  patientId?: string
): Promise<ProcedureQuote[]> {
  const supabase = createClient();
  let query = supabase
    .from("procedure_quotes")
    .select("*, patients(first_name, last_name, phone)")
    .order("quote_date", { ascending: false });

  if (patientId) {
    const pUuid = getPatientUuid(patientId);
    query = query.eq("patient_id", pUuid);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("Error al obtener cotizaciones de Supabase:", error?.message);
    return [];
  }

  return data.map((row: any) => {
    const pat = row.patients;
    const patName = pat ? `${pat.last_name}, ${pat.first_name}` : "Paciente CENDO";
    return {
      id: row.id,
      patientId: row.patient_id,
      patientName: patName,
      patientPhone: pat?.phone || "",
      doctorId: row.doctor_id,
      doctorName: row.doctor_name,
      quoteDate: row.quote_date ? String(row.quote_date).slice(0, 10) : "",
      validityDays: Number(row.validity_days) || 30,
      items: Array.isArray(row.items) ? row.items : [],
      subtotal: Number(row.subtotal) || 0,
      discountTotal: Number(row.discount_total) || 0,
      total: Number(row.total) || 0,
      paymentTerms: row.payment_terms || "Efectivo, Transferencia o Tarjeta",
      notes: row.notes || undefined,
      createdAt: row.created_at,
    };
  });
}

export async function saveQuoteToSupabase(
  input: CreateQuoteInput
): Promise<{ success: boolean; data?: ProcedureQuote; error?: string }> {
  const validation = validateQuoteInput(input);
  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  const totals = calculateQuoteTotals(input.items);
  const supabase = createClient();
  const quoteId = input.id
    ? ensureUuid(input.id)
    : typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "00000000-0000-0000-0000-000000000000";
  const patientUuid = getPatientUuid(input.patientId);

  const payload = {
    id: quoteId,
    patient_id: patientUuid,
    doctor_id: input.doctorId,
    doctor_name: input.doctorName,
    quote_date: input.quoteDate || new Date().toISOString().split("T")[0],
    validity_days: input.validityDays || 30,
    items: input.items,
    subtotal: totals.subtotal,
    discount_total: totals.discountTotal,
    total: totals.total,
    payment_terms: input.paymentTerms || "Efectivo, Transferencia BCP/BBVA o Tarjeta",
    notes: input.notes || null,
  };

  const { data, error } = await supabase
    .from("procedure_quotes")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || "Error al persistir cotización en Supabase" };
  }

  return {
    success: true,
    data: {
      id: data.id,
      patientId: data.patient_id,
      patientName: input.patientName,
      patientPhone: input.patientPhone || "",
      doctorId: data.doctor_id,
      doctorName: data.doctor_name,
      quoteDate: String(data.quote_date).slice(0, 10),
      validityDays: data.validity_days,
      items: Array.isArray(data.items) ? data.items : [],
      subtotal: Number(data.subtotal),
      discountTotal: Number(data.discount_total),
      total: Number(data.total),
      paymentTerms: data.payment_terms,
      notes: data.notes || undefined,
      createdAt: data.created_at,
    },
  };
}

export async function deleteQuoteFromSupabase(id: string): Promise<boolean> {
  const supabase = createClient();
  const targetId = ensureUuid(id);
  const { error } = await supabase.from("procedure_quotes").delete().eq("id", targetId);
  return !error;
}
