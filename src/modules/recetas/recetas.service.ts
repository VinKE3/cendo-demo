/**
 * Módulo de Recetas Médicas Inteligentes - Servicio Supabase CRUD
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { createClient } from "@/lib/supabase/client";
import { ensureUuid, getPatientUuid } from "@/lib/supabaseSync";
import {
  CreatePrescriptionInput,
  MedicalPrescription,
} from "./recetas.types";
import { validatePrescriptionInput } from "./recetas.validator";

export async function fetchPrescriptionsFromSupabase(
  patientId?: string
): Promise<MedicalPrescription[]> {
  const supabase = createClient();
  let query = supabase
    .from("medical_prescriptions")
    .select("*")
    .order("prescription_date", { ascending: false });

  if (patientId) {
    const pUuid = getPatientUuid(patientId);
    query = query.eq("patient_id", pUuid);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("Error al obtener recetas de Supabase:", error?.message);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id || "",
    doctorName: row.doctor_name,
    doctorCmp: row.doctor_cmp,
    doctorRne: row.doctor_rne || undefined,
    prescriptionDate: row.prescription_date ? String(row.prescription_date).slice(0, 10) : "",
    diagnosis: row.diagnosis,
    cie10Code: row.cie10_code || undefined,
    items: Array.isArray(row.items) ? row.items : [],
    generalIndications: row.general_indications || undefined,
    nextAppointmentDate: row.next_appointment_date ? String(row.next_appointment_date).slice(0, 10) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function savePrescriptionToSupabase(
  input: CreatePrescriptionInput
): Promise<{ success: boolean; data?: MedicalPrescription; error?: string }> {
  const validation = validatePrescriptionInput(input);
  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  const supabase = createClient();
  const recId = input.id
    ? ensureUuid(input.id)
    : typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "00000000-0000-0000-0000-000000000000";
  const patientUuid = getPatientUuid(input.patientId);

  const payload = {
    id: recId,
    patient_id: patientUuid,
    doctor_id: input.doctorId,
    doctor_name: input.doctorName,
    doctor_cmp: input.doctorCmp,
    doctor_rne: input.doctorRne || null,
    prescription_date: input.prescriptionDate,
    diagnosis: input.diagnosis,
    cie10_code: input.cie10Code || null,
    items: input.items,
    general_indications: input.generalIndications || null,
    next_appointment_date: input.nextAppointmentDate || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("medical_prescriptions")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || "Error al persistir receta en Supabase" };
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
      prescriptionDate: String(data.prescription_date).slice(0, 10),
      diagnosis: data.diagnosis,
      cie10Code: data.cie10_code || undefined,
      items: Array.isArray(data.items) ? data.items : [],
      generalIndications: data.general_indications || undefined,
      nextAppointmentDate: data.next_appointment_date ? String(data.next_appointment_date).slice(0, 10) : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

export async function deletePrescriptionFromSupabase(id: string): Promise<boolean> {
  const supabase = createClient();
  const targetId = ensureUuid(id);
  const { error } = await supabase.from("medical_prescriptions").delete().eq("id", targetId);
  return !error;
}
