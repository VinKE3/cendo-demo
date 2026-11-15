/**
 * Módulo de Órdenes de Laboratorio Clínico - Servicio Supabase CRUD
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { createClient } from "@/lib/supabase/client";
import { ensureUuid, getPatientUuid } from "@/lib/supabaseSync";
import {
  CreateLabOrderInput,
  LabOrder,
} from "./laboratorio.types";
import { validateLabOrderInput } from "./laboratorio.validator";

export async function fetchLabOrdersFromSupabase(
  patientId?: string
): Promise<LabOrder[]> {
  const supabase = createClient();
  let query = supabase
    .from("lab_orders")
    .select("*")
    .order("order_date", { ascending: false });

  if (patientId) {
    const pUuid = getPatientUuid(patientId);
    query = query.eq("patient_id", pUuid);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("Error al obtener órdenes de laboratorio de Supabase:", error?.message);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id || "",
    doctorName: row.doctor_name,
    doctorCmp: row.doctor_cmp,
    doctorRne: row.doctor_rne || undefined,
    orderDate: row.order_date ? String(row.order_date).slice(0, 10) : "",
    diagnosis: row.diagnosis,
    cie10Code: row.cie10_code || undefined,
    urgency: row.urgency || "Rutina",
    items: Array.isArray(row.items) ? row.items : [],
    customTests: row.custom_tests || undefined,
    patientInstructions: row.patient_instructions || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function saveLabOrderToSupabase(
  input: CreateLabOrderInput
): Promise<{ success: boolean; data?: LabOrder; error?: string }> {
  const validation = validateLabOrderInput(input);
  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  const supabase = createClient();
  const orderId = input.id
    ? ensureUuid(input.id)
    : typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "00000000-0000-0000-0000-000000000000";
  const patientUuid = getPatientUuid(input.patientId);

  const payload = {
    id: orderId,
    patient_id: patientUuid,
    doctor_id: input.doctorId,
    doctor_name: input.doctorName,
    doctor_cmp: input.doctorCmp,
    doctor_rne: input.doctorRne || null,
    order_date: input.orderDate,
    diagnosis: input.diagnosis,
    cie10_code: input.cie10Code || null,
    urgency: input.urgency || "Rutina",
    items: input.items,
    custom_tests: input.customTests || null,
    patient_instructions: input.patientInstructions || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("lab_orders")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || "Error al persistir orden de laboratorio en Supabase" };
  }

  return {
    success: true,
    data: {
      id: data.id,
      patientId: data.patient_id,
      doctorId: data.doctor_id,
      doctorName: data.doctor_name,
      doctorCmp: data.doctor_cmp,
      doctorRne: data.doctor_rne || undefined,
      orderDate: String(data.order_date).slice(0, 10),
      diagnosis: data.diagnosis,
      cie10Code: data.cie10_code || undefined,
      urgency: data.urgency,
      items: Array.isArray(data.items) ? data.items : [],
      customTests: data.custom_tests || undefined,
      patientInstructions: data.patient_instructions || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

export async function deleteLabOrderFromSupabase(id: string): Promise<boolean> {
  const supabase = createClient();
  const targetId = ensureUuid(id);
  const { error } = await supabase.from("lab_orders").delete().eq("id", targetId);
  return !error;
}
