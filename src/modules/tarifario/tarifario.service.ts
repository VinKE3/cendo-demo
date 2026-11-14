import { createClient } from "@/lib/supabase/client";
import {
  ProcedureTariff,
  CreateTariffInput,
  UpdateTariffInput,
  TariffCategory,
} from "./tarifario.types";

interface TariffRow {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  price: number | string;
  active: boolean;
  created_at?: string;
}

function ensureUuid(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "c1000000-0000-0000-0000-" + Math.random().toString(16).substring(2, 14).padEnd(12, "0");
}

function rowToEntity(row: TariffRow): ProcedureTariff {
  return {
    id: row.id,
    code: row.code || "",
    name: row.name || "",
    category: (row.category || "Procedimiento") as TariffCategory,
    description: row.description || "",
    price: Number(row.price) || 0,
    active: Boolean(row.active),
    createdAt: row.created_at,
  };
}

export async function fetchTariff(): Promise<ProcedureTariff[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("procedures_tariff")
      .select("*")
      .order("code", { ascending: true });

    if (error || !data) return [];
    return (data as TariffRow[]).map(rowToEntity);
  } catch {
    return [];
  }
}

export async function createTariffItem(
  input: CreateTariffInput
): Promise<ProcedureTariff | null> {
  try {
    const supabase = createClient();
    const newId = ensureUuid();
    const row = {
      id: newId,
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      category: input.category,
      description: input.description?.trim() || null,
      price: input.price,
      active: input.active !== undefined ? input.active : true,
    };

    const { data, error } = await supabase
      .from("procedures_tariff")
      .insert(row)
      .select()
      .single();

    if (error || !data) return null;
    return rowToEntity(data as TariffRow);
  } catch {
    return null;
  }
}

export async function updateTariffItem(
  id: string,
  updates: UpdateTariffInput
): Promise<boolean> {
  try {
    const supabase = createClient();
    const payload: Partial<TariffRow> = {};

    if (updates.code !== undefined) payload.code = updates.code.trim().toUpperCase();
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.description !== undefined) payload.description = updates.description.trim();
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.active !== undefined) payload.active = updates.active;

    const { error } = await supabase
      .from("procedures_tariff")
      .update(payload)
      .eq("id", id);

    return !error;
  } catch {
    return false;
  }
}

export async function deleteTariffItem(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("procedures_tariff").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}
