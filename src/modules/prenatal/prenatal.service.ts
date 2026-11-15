import { createClient } from "@/lib/supabase/client";
import { getPatientUuid } from "@/lib/supabaseSync";
import { PrenatalCard, CreatePrenatalCardInput } from "./prenatal.types";
import { prenatalCardSchema } from "./prenatal.validator";

function ensureUuid(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id;
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "00000000-0000-0000-0000-" + Math.random().toString(16).substring(2, 14).padEnd(12, "0");
}

function mapRowToPrenatalCard(row: any): PrenatalCard {
  return {
    id: row.id,
    patientId: row.patient_id,
    clinicEstablishment: row.clinic_establishment || "CENDO - Centro de Endometriosis",
    attendingDoctorId: row.attending_doctor_id || "doc-patrick-jacinto",
    attendingDoctorName: row.attending_doctor_name || "Dr. Patrick Jacinto Gomero",
    baseline: typeof row.baseline === "string" ? JSON.parse(row.baseline) : (row.baseline || {}),
    visits: Array.isArray(row.visits) ? row.visits : (typeof row.visits === "string" ? JSON.parse(row.visits) : []),
    maternalPathologies: Array.isArray(row.maternal_pathologies)
      ? row.maternal_pathologies
      : (typeof row.maternal_pathologies === "string" ? JSON.parse(row.maternal_pathologies) : []),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export async function fetchPrenatalCardByPatientId(patientId: string): Promise<PrenatalCard | null> {
  const supabase = createClient();
  const patientUuid = getPatientUuid(patientId);
  const { data, error } = await supabase
    .from("prenatal_cards")
    .select("*")
    .eq("patient_id", patientUuid)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapRowToPrenatalCard(data);
}

export async function fetchPrenatalCardById(id: string): Promise<PrenatalCard | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("prenatal_cards")
    .select("*")
    .eq("id", ensureUuid(id))
    .maybeSingle();

  if (error || !data) return null;
  return mapRowToPrenatalCard(data);
}

export async function savePrenatalCard(cardInput: CreatePrenatalCardInput | PrenatalCard): Promise<PrenatalCard> {
  const validated = prenatalCardSchema.parse(cardInput);
  const supabase = createClient();
  const cardUuid = ensureUuid(cardInput.id);
  const patientUuid = getPatientUuid(validated.patientId);

  const payload = {
    id: cardUuid,
    patient_id: patientUuid,
    clinic_establishment: validated.clinicEstablishment,
    attending_doctor_id: validated.attendingDoctorId,
    attending_doctor_name: validated.attendingDoctorName,
    baseline: validated.baseline,
    visits: validated.visits,
    maternal_pathologies: validated.maternalPathologies,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("prenatal_cards")
    .upsert(payload)
    .select("*")
    .single();

  if (error) throw new Error(`Error al guardar carnet prenatal: ${error.message}`);
  return mapRowToPrenatalCard(data);
}

export async function deletePrenatalCard(id: string): Promise<boolean> {
  const supabase = createClient();
  const targetId = ensureUuid(id);
  const { error } = await supabase.from("prenatal_cards").delete().eq("id", targetId);
  if (error) {
    console.warn("Aviso delete carnet prenatal Supabase:", error.message);
    return false;
  }
  return true;
}
