/**
 * Módulo de Consultas Ginecológicas - Servicio Supabase CRUD
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { createClient } from "@/lib/supabase/client";
import { ensureUuid, getPatientUuid } from "@/lib/supabaseSync";
import {
  CreateConsultationInput,
  MedicalConsultation,
} from "./consultas.types";
import { validateConsultationInput } from "./consultas.validator";

export async function fetchConsultationsFromSupabase(
  patientId?: string
): Promise<MedicalConsultation[]> {
  const supabase = createClient();
  let query = supabase
    .from("medical_consultations")
    .select("*")
    .order("consultation_date", { ascending: false });

  if (patientId) {
    const pUuid = getPatientUuid(patientId);
    query = query.eq("patient_id", pUuid);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("Error al obtener consultas de Supabase:", error?.message);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorCmp: row.doctor_cmp,
    doctorRne: row.doctor_rne || undefined,
    consultationDate: row.consultation_date ? String(row.consultation_date).slice(0, 10) : "",
    reasonForVisit: row.reason_for_visit,
    illnessTime: row.illness_time || undefined,
    symptoms: row.symptoms || undefined,
    vitalSigns: row.vital_signs || {},
    physicalExam: row.physical_exam || {},
    diagnosis: row.diagnosis,
    cie10Code: row.cie10_code || undefined,
    treatmentPlan: row.treatment_plan,
    auxiliaryExams: row.auxiliary_exams || undefined,
    prescriptionNotes: row.prescription_notes || undefined,
    nextAppointmentDate: row.next_appointment_date ? String(row.next_appointment_date).slice(0, 10) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function saveConsultationToSupabase(
  input: CreateConsultationInput
): Promise<{ success: boolean; data?: MedicalConsultation; error?: string }> {
  const validation = validateConsultationInput(input);
  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  const supabase = createClient();
  const consId = input.id
    ? ensureUuid(input.id)
    : typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "00000000-0000-0000-0000-000000000000";
  const patientUuid = getPatientUuid(input.patientId);

  const payload = {
    id: consId,
    patient_id: patientUuid,
    doctor_id: input.doctorId,
    doctor_name: input.doctorName,
    doctor_cmp: input.doctorCmp,
    doctor_rne: input.doctorRne || null,
    consultation_date: input.consultationDate,
    reason_for_visit: input.reasonForVisit,
    illness_time: input.illnessTime || null,
    symptoms: input.symptoms || null,
    vital_signs: input.vitalSigns,
    physical_exam: input.physicalExam,
    diagnosis: input.diagnosis,
    cie10_code: input.cie10Code || null,
    treatment_plan: input.treatmentPlan,
    auxiliary_exams: input.auxiliaryExams || null,
    prescription_notes: input.prescriptionNotes || null,
    next_appointment_date: input.nextAppointmentDate || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("medical_consultations")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || "Error al persistir consulta en Supabase" };
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
      consultationDate: String(data.consultation_date).slice(0, 10),
      reasonForVisit: data.reason_for_visit,
      illnessTime: data.illness_time || undefined,
      symptoms: data.symptoms || undefined,
      vitalSigns: data.vital_signs,
      physicalExam: data.physical_exam,
      diagnosis: data.diagnosis,
      cie10Code: data.cie10_code || undefined,
      treatmentPlan: data.treatment_plan,
      auxiliaryExams: data.auxiliary_exams || undefined,
      prescriptionNotes: data.prescription_notes || undefined,
      nextAppointmentDate: data.next_appointment_date ? String(data.next_appointment_date).slice(0, 10) : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

export async function deleteConsultationFromSupabase(id: string): Promise<boolean> {
  const supabase = createClient();
  const targetId = ensureUuid(id);
  const { error } = await supabase.from("medical_consultations").delete().eq("id", targetId);
  return !error;
}
