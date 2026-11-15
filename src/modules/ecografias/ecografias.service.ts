/**
 * Módulo de Ecografías Especializadas - Servicio Supabase CRUD
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { createClient } from "@/lib/supabase/client";
import { ensureUuid, getPatientUuid } from "@/lib/supabaseSync";
import { CreateUltrasoundInput, UltrasoundReport } from "./ecografias.types";
import { validateUltrasoundInput } from "./ecografias.validator";

function mapRow(row: any): UltrasoundReport {
  return {
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id || "doc-patrick-jacinto",
    doctorName: row.doctor_name || "Dr. Patrick José Jacinto Gomero",
    doctorCmp: row.doctor_cmp || "61693",
    doctorRne: row.doctor_rne || undefined,
    reportDate: row.report_date ? String(row.report_date).slice(0, 10) : "",
    ultrasoundType: row.ultrasound_type || "TRANSVAGINAL",
    indication: row.indication || "",
    findings: typeof row.findings === "string" ? JSON.parse(row.findings) : (row.findings || {}),
    conclusion: row.conclusion || "",
    recommendations: row.recommendations || undefined,
    images: Array.isArray(row.images) ? row.images : (typeof row.images === "string" ? JSON.parse(row.images) : []),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export async function fetchUltrasoundReportsFromSupabase(patientId?: string): Promise<UltrasoundReport[]> {
  const supabase = createClient();
  let query = supabase.from("ultrasound_reports").select("*").order("report_date", { ascending: false });
  if (patientId) query = query.eq("patient_id", getPatientUuid(patientId));
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function saveUltrasoundReportToSupabase(
  input: CreateUltrasoundInput
): Promise<{ success: boolean; data?: UltrasoundReport; error?: string }> {
  const validation = validateUltrasoundInput(input);
  if (!validation.success) return { success: false, error: validation.error };

  const v = validation.data;
  const echoId = v.id ? ensureUuid(v.id) : (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "00000000-0000-0000-0000-000000000000");
  const payload = {
    id: echoId,
    patient_id: getPatientUuid(v.patientId),
    doctor_id: v.doctorId,
    doctor_name: v.doctorName,
    doctor_cmp: v.doctorCmp,
    doctor_rne: v.doctorRne || null,
    report_date: v.reportDate,
    ultrasound_type: v.ultrasoundType,
    indication: v.indication,
    findings: v.findings,
    conclusion: v.conclusion,
    recommendations: v.recommendations || null,
    images: v.images,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await createClient()
    .from("ultrasound_reports")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error || !data) return { success: false, error: error?.message || "Error al persistir ecografía" };
  return { success: true, data: mapRow(data) };
}

export async function deleteUltrasoundReportFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await createClient().from("ultrasound_reports").delete().eq("id", ensureUuid(id));
  return error ? { success: false, error: error.message } : { success: true };
}
