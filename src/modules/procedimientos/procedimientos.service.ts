/**
 * Módulo de Procedimientos Menores & Biopsias - Servicio Supabase CRUD
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { createClient } from "@/lib/supabase/client";
import { ensureUuid, getPatientUuid } from "@/lib/supabaseSync";
import { CreateMinorProcedureInput, MinorProcedureReport } from "./procedimientos.types";
import { validateMinorProcedureInput } from "./procedimientos.validator";

function mapRow(row: any): MinorProcedureReport {
  return {
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id || "doc-patrick-jacinto",
    doctorName: row.doctor_name || "Dr. Patrick José Jacinto Gomero",
    doctorCmp: row.doctor_cmp || "61693",
    doctorRne: row.doctor_rne || undefined,
    procedureDate: row.procedure_date ? String(row.procedure_date).slice(0, 10) : "",
    procedureType: row.procedure_type || "OTRO",
    preOpDiagnosis: row.pre_op_diagnosis || "",
    postOpDiagnosis: row.post_op_diagnosis || "",
    cie10Code: row.cie10_code || undefined,
    anesthesiaType: row.anesthesia_type || "Local (Lidocaína 2%)",
    procedureDetails: typeof row.procedure_details === "string" ? JSON.parse(row.procedure_details) : (row.procedure_details || {}),
    postOpIndications: row.post_op_indications || "",
    medicationsPrescribed: row.medications_prescribed || undefined,
    nextControlDate: row.next_control_date ? String(row.next_control_date).slice(0, 10) : undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export async function fetchMinorProceduresFromSupabase(patientId?: string): Promise<MinorProcedureReport[]> {
  const supabase = createClient();
  let query = supabase.from("minor_procedures").select("*").order("procedure_date", { ascending: false });
  if (patientId) query = query.eq("patient_id", getPatientUuid(patientId));
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function saveMinorProcedureToSupabase(
  input: CreateMinorProcedureInput
): Promise<{ success: boolean; data?: MinorProcedureReport; error?: string }> {
  const validation = validateMinorProcedureInput(input);
  if (!validation.success) return { success: false, error: validation.error };

  const v = validation.data;
  const procId = v.id ? ensureUuid(v.id) : (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "00000000-0000-0000-0000-000000000000");
  const payload = {
    id: procId,
    patient_id: getPatientUuid(v.patientId),
    doctor_id: v.doctorId,
    doctor_name: v.doctorName,
    doctor_cmp: v.doctorCmp,
    doctor_rne: v.doctorRne || null,
    procedure_date: v.procedureDate,
    procedure_type: v.procedureType,
    pre_op_diagnosis: v.preOpDiagnosis,
    post_op_diagnosis: v.postOpDiagnosis,
    cie10_code: v.cie10Code || null,
    anesthesia_type: v.anesthesiaType,
    procedure_details: v.procedureDetails,
    post_op_indications: v.postOpIndications,
    medications_prescribed: v.medicationsPrescribed || null,
    next_control_date: v.nextControlDate || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await createClient()
    .from("minor_procedures")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error || !data) return { success: false, error: error?.message || "Error al persistir procedimiento en Supabase" };
  return { success: true, data: mapRow(data) };
}

export async function deleteMinorProcedureFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await createClient().from("minor_procedures").delete().eq("id", ensureUuid(id));
  return error ? { success: false, error: error.message } : { success: true };
}
