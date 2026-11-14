import { createClient } from "@/lib/supabase/client";
import {
  PatientBackground,
  SaveBackgroundInput,
} from "./antecedentes.types";

interface BackgroundRow {
  id: string;
  patient_id: string;
  menarche?: number | null;
  sexual_debut_age?: number | null;
  sexual_partners_count?: number | null;
  catamenial_regimen?: string | null;
  sti_history?: string | null;
  obstetric_formula: string;
  contraceptive_method: string;
  last_menstrual_period?: string | null;
  pap_history?: string | null;
  vph_test_history?: string | null;
  has_diabetes?: string | null;
  has_hypertension?: string | null;
  has_asthma?: string | null;
  medical_allergies?: string | null;
  surgeries_history?: string | null;
  family_history?: string | null;
  other_pathologies?: string | null;
  notes?: string | null;
  updated_at?: string;
}

function ensureUuid(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "b0000000-0000-0000-0000-" + Math.random().toString(16).substring(2, 14).padEnd(12, "0");
}

function rowToEntity(row: BackgroundRow): PatientBackground {
  const cleanLmp = row.last_menstrual_period
    ? (row.last_menstrual_period.match(/\d{4}-\d{2}-\d{2}/)?.[0] || "")
    : "";

  return {
    id: row.id,
    patientId: row.patient_id,
    menarche: row.menarche ?? undefined,
    sexualDebutAge: row.sexual_debut_age ?? undefined,
    sexualPartnersCount: row.sexual_partners_count ?? undefined,
    catamenialRegimen: row.catamenial_regimen || "28/4",
    stiHistory: row.sti_history || "Niega ITS",
    obstetricFormula: row.obstetric_formula || "G0 P0000",
    contraceptiveMethod: row.contraceptive_method || "Ninguno",
    lastMenstrualPeriod: cleanLmp,
    papHistory: row.pap_history || "No refiere",
    vphTestHistory: row.vph_test_history || "No realizado",
    hasDiabetes: row.has_diabetes || "Niega",
    hasHypertension: row.has_hypertension || "Niega",
    hasAsthma: row.has_asthma || "Niega",
    medicalAllergies: row.medical_allergies || "Niega",
    surgeriesHistory: row.surgeries_history || "Niega",
    familyHistory: row.family_history || "No refiere",
    otherPathologies: row.other_pathologies || "Niega",
    notes: row.notes || "",
    updatedAt: row.updated_at,
  };
}

export async function fetchBackgroundByPatientId(patientId: string): Promise<PatientBackground | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("patient_backgrounds")
      .select("*")
      .eq("patient_id", patientId)
      .maybeSingle();

    if (error || !data) return null;
    return rowToEntity(data as BackgroundRow);
  } catch {
    return null;
  }
}

export async function saveBackground(input: SaveBackgroundInput): Promise<PatientBackground | null> {
  try {
    const supabase = createClient();
    const cleanLmp = input.lastMenstrualPeriod
      ? (input.lastMenstrualPeriod.match(/\d{4}-\d{2}-\d{2}/)?.[0] || null)
      : null;

    const row = {
      id: ensureUuid(),
      patient_id: input.patientId,
      menarche: input.menarche ?? null,
      sexual_debut_age: input.sexualDebutAge ?? null,
      sexual_partners_count: input.sexualPartnersCount ?? null,
      catamenial_regimen: input.catamenialRegimen?.trim() || null,
      sti_history: input.stiHistory?.trim() || null,
      obstetric_formula: input.obstetricFormula.trim().toUpperCase(),
      contraceptive_method: input.contraceptiveMethod.trim(),
      last_menstrual_period: cleanLmp,
      pap_history: input.papHistory?.trim() || null,
      vph_test_history: input.vphTestHistory?.trim() || null,
      has_diabetes: input.hasDiabetes || "Niega",
      has_hypertension: input.hasHypertension || "Niega",
      has_asthma: input.hasAsthma || "Niega",
      medical_allergies: input.medicalAllergies?.trim() || "Niega",
      surgeries_history: input.surgeriesHistory?.trim() || "Niega",
      family_history: input.familyHistory?.trim() || "No refiere",
      other_pathologies: input.otherPathologies?.trim() || "Niega",
      notes: input.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("patient_backgrounds")
      .upsert(row, { onConflict: "patient_id" })
      .select()
      .single();

    if (error || !data) return null;
    return rowToEntity(data as BackgroundRow);
  } catch {
    return null;
  }
}

export async function deleteBackgroundByPatientId(patientId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("patient_backgrounds")
      .delete()
      .eq("patient_id", patientId);

    return !error;
  } catch {
    return false;
  }
}
