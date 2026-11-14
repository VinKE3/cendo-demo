import { createClient } from "@/lib/supabase/client";
import {
  MedicationVademecum,
  CreateMedicationInput,
  UpdateMedicationInput,
} from "./vademecum.types";

interface VademecumRow {
  id: string;
  generic_name: string;
  atc_code: string | null;
  therapeutic_group: string;
  commercial_brands: unknown;
  indications: string | null;
  contraindications: string | null;
  created_at?: string;
}

function ensureUuid(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "c2000000-0000-0000-0000-" + Math.random().toString(16).substring(2, 14).padEnd(12, "0");
}

function rowToEntity(row: VademecumRow): MedicationVademecum {
  let brands = [];
  if (Array.isArray(row.commercial_brands)) {
    brands = row.commercial_brands;
  } else if (typeof row.commercial_brands === "string") {
    try {
      brands = JSON.parse(row.commercial_brands);
    } catch {
      brands = [];
    }
  }

  return {
    id: row.id,
    genericName: row.generic_name || "",
    atcCode: row.atc_code || "",
    therapeuticGroup: row.therapeutic_group || "",
    commercialBrands: brands,
    indications: row.indications || "",
    contraindications: row.contraindications || "",
    createdAt: row.created_at,
  };
}

export async function fetchVademecum(): Promise<MedicationVademecum[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("medications_vademecum")
      .select("*")
      .order("generic_name", { ascending: true });

    if (error || !data) return [];
    return (data as VademecumRow[]).map(rowToEntity);
  } catch {
    return [];
  }
}

export async function createMedication(
  input: CreateMedicationInput
): Promise<MedicationVademecum | null> {
  try {
    const supabase = createClient();
    const newId = ensureUuid();
    const row = {
      id: newId,
      generic_name: input.genericName.trim(),
      atc_code: input.atcCode?.trim().toUpperCase() || null,
      therapeutic_group: input.therapeuticGroup.trim(),
      commercial_brands: input.commercialBrands || [],
      indications: input.indications?.trim() || null,
      contraindications: input.contraindications?.trim() || null,
    };

    const { data, error } = await supabase
      .from("medications_vademecum")
      .insert(row)
      .select()
      .single();

    if (error || !data) return null;
    return rowToEntity(data as VademecumRow);
  } catch {
    return null;
  }
}

export async function updateMedication(
  id: string,
  updates: UpdateMedicationInput
): Promise<boolean> {
  try {
    const supabase = createClient();
    const payload: Partial<VademecumRow> = {};

    if (updates.genericName !== undefined) payload.generic_name = updates.genericName.trim();
    if (updates.atcCode !== undefined) payload.atc_code = updates.atcCode.trim().toUpperCase();
    if (updates.therapeuticGroup !== undefined) payload.therapeutic_group = updates.therapeuticGroup.trim();
    if (updates.commercialBrands !== undefined) payload.commercial_brands = updates.commercialBrands;
    if (updates.indications !== undefined) payload.indications = updates.indications.trim();
    if (updates.contraindications !== undefined) payload.contraindications = updates.contraindications.trim();

    const { error } = await supabase
      .from("medications_vademecum")
      .update(payload)
      .eq("id", id);

    return !error;
  } catch {
    return false;
  }
}

export async function deleteMedication(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("medications_vademecum").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}
