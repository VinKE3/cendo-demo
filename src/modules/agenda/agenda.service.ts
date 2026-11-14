/**
 * Módulo de Agenda de Citas Médicas - Servicio Supabase CRUD
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { createClient } from "@/lib/supabase/client";
import { ensureUuid, getPatientUuid } from "@/lib/supabaseSync";
import {
  CreateAppointmentInput,
  MedicalAppointment,
  UpdateAppointmentInput,
} from "./agenda.types";
import { validateAppointmentInput } from "./agenda.validator";

export async function fetchAppointmentsFromSupabase(): Promise<MedicalAppointment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medical_appointments")
    .select("*, patients(first_name, last_name, dni, phone)")
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (error || !data) {
    console.error("Error al obtener citas de Supabase:", error?.message);
    return [];
  }

  return data.map((row: any) => {
    const pat = row.patients;
    const patName = pat ? `${pat.last_name}, ${pat.first_name}` : "Paciente CENDO";
    return {
      id: row.id,
      patientId: row.patient_id,
      patientName: patName,
      patientDni: pat?.dni || "",
      patientPhone: pat?.phone || "",
      doctorId: row.doctor_id,
      doctorName: row.doctor_name,
      appointmentDate: row.appointment_date ? String(row.appointment_date).slice(0, 10) : "",
      appointmentTime: row.appointment_time ? String(row.appointment_time).slice(0, 5) : "09:00",
      durationMinutes: Number(row.duration_minutes) || 30,
      appointmentType: row.appointment_type,
      reason: row.reason || "",
      status: row.status || "CONFIRMADA",
      notes: row.notes || undefined,
      reminderSent: !!row.reminder_sent,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export async function saveAppointmentToSupabase(
  input: CreateAppointmentInput,
  existingList: MedicalAppointment[] = []
): Promise<{ success: boolean; data?: MedicalAppointment; error?: string }> {
  const validation = validateAppointmentInput(input, existingList);
  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  const supabase = createClient();
  const appointmentId = input.id
    ? ensureUuid(input.id)
    : typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "00000000-0000-0000-0000-000000000000";
  const patientUuid = getPatientUuid(input.patientId);

  const payload = {
    id: appointmentId,
    patient_id: patientUuid,
    doctor_id: input.doctorId,
    doctor_name: input.doctorName,
    appointment_date: input.appointmentDate,
    appointment_time: input.appointmentTime,
    duration_minutes: input.durationMinutes || 30,
    appointment_type: input.appointmentType,
    reason: input.reason || "Consulta Especializada CENDO",
    status: input.status || "CONFIRMADA",
    notes: input.notes || null,
    reminder_sent: !!input.reminderSent,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("medical_appointments")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || "Error al persistir cita en Supabase" };
  }

  return {
    success: true,
    data: {
      id: data.id,
      patientId: data.patient_id,
      patientName: input.patientName,
      patientDni: input.patientDni || "",
      patientPhone: input.patientPhone || "",
      doctorId: data.doctor_id,
      doctorName: data.doctor_name,
      appointmentDate: String(data.appointment_date).slice(0, 10),
      appointmentTime: String(data.appointment_time).slice(0, 5),
      durationMinutes: data.duration_minutes,
      appointmentType: data.appointment_type,
      reason: data.reason,
      status: data.status,
      notes: data.notes || undefined,
      reminderSent: data.reminder_sent,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

export async function deleteAppointmentFromSupabase(id: string): Promise<boolean> {
  const supabase = createClient();
  const targetId = ensureUuid(id);
  const { error } = await supabase.from("medical_appointments").delete().eq("id", targetId);
  return !error;
}
