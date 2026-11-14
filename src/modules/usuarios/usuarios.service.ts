import { createClient } from "@/lib/supabase/client";
import {
  DoctorProfile,
  CreateDoctorInput,
  UpdateDoctorInput,
  DoctorRole,
} from "./usuarios.types";

interface ProfileRow {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  doctor_title: string;
  specialty: string;
  cmp: string;
  rne: string;
  clinic_name?: string;
  clinic_address?: string;
  phone?: string;
  contact_email?: string;
  avatar_url?: string | null;
  signature_url?: string | null;
  role?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

function ensureUuid(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "a0000000-0000-0000-0000-" + Math.random().toString(16).substring(2, 14).padEnd(12, "0");
}

function rowToEntity(row: ProfileRow): DoctorProfile {
  return {
    id: row.id,
    email: row.email,
    password: row.password || "Cendo123",
    fullName: row.full_name || "Médico Especialista",
    doctorTitle: row.doctor_title || "Dr.",
    specialty: row.specialty || "Ginecología y Obstetricia",
    cmp: row.cmp || "",
    rne: row.rne || "",
    clinicName: row.clinic_name || "CENDO - Centro de Endometriosis y Ginecología",
    clinicAddress: row.clinic_address || "Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima",
    phone: row.phone || "985 945 697",
    contactEmail: row.contact_email || row.email,
    avatarUrl: row.avatar_url || "",
    signatureUrl: row.signature_url || "",
    role: (row.role as DoctorRole) || "doctor",
    isActive: row.is_active !== false,
    createdAt: row.created_at,
  };
}

export async function fetchDoctors(): Promise<DoctorProfile[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return (data as ProfileRow[]).map(rowToEntity);
  } catch {
    return [];
  }
}

export async function createDoctor(
  input: CreateDoctorInput
): Promise<DoctorProfile | null> {
  try {
    const supabase = createClient();
    const newId = ensureUuid();
    const row = {
      id: newId,
      email: input.email.trim().toLowerCase(),
      full_name: input.fullName.trim(),
      doctor_title: input.doctorTitle || "Dr.",
      specialty: input.specialty.trim(),
      cmp: input.cmp.trim(),
      rne: input.rne.trim(),
      clinic_name: input.clinicName || "CENDO - Centro de Endometriosis y Ginecología",
      clinic_address: input.clinicAddress || "Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima",
      phone: input.phone || "985 945 697",
      contact_email: input.contactEmail || input.email,
      avatar_url: input.avatarUrl || null,
      signature_url: input.signatureUrl || null,
      role: input.role || "doctor",
      password: input.password || "Cendo123",
      is_active: input.isActive !== false,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .insert(row)
      .select()
      .single();

    if (error || !data) return null;
    return rowToEntity(data as ProfileRow);
  } catch {
    return null;
  }
}

export async function updateDoctorProfile(
  id: string,
  updates: UpdateDoctorInput
): Promise<boolean> {
  try {
    const supabase = createClient();
    const payload: Partial<ProfileRow> = { updated_at: new Date().toISOString() };

    if (updates.email !== undefined) payload.email = updates.email.trim().toLowerCase();
    if (updates.fullName !== undefined) payload.full_name = updates.fullName.trim();
    if (updates.doctorTitle !== undefined) payload.doctor_title = updates.doctorTitle;
    if (updates.specialty !== undefined) payload.specialty = updates.specialty.trim();
    if (updates.cmp !== undefined) payload.cmp = updates.cmp.trim();
    if (updates.rne !== undefined) payload.rne = updates.rne.trim();
    if (updates.phone !== undefined) payload.phone = updates.phone.trim();
    if (updates.clinicAddress !== undefined) payload.clinic_address = updates.clinicAddress.trim();
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.signatureUrl !== undefined) payload.signature_url = updates.signatureUrl || null;
    if (updates.password !== undefined) payload.password = updates.password;

    const { error } = await supabase.from("profiles").update(payload).eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function updateDoctorPassword(
  idOrEmail: string,
  newPassword: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    const clean = idOrEmail.trim();
    const query = clean.includes("@")
      ? supabase.from("profiles").update({ password: newPassword.trim(), updated_at: new Date().toISOString() }).ilike("email", clean.toLowerCase())
      : supabase.from("profiles").update({ password: newPassword.trim(), updated_at: new Date().toISOString() }).eq("id", clean);

    const { error } = await query;
    return !error;
  } catch {
    return false;
  }
}

export async function deleteDoctor(idOrEmail: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const clean = idOrEmail.trim();
    const query = clean.includes("@")
      ? supabase.from("profiles").delete().ilike("email", clean.toLowerCase())
      : supabase.from("profiles").delete().eq("id", clean);

    const { error } = await query;
    return !error;
  } catch {
    return false;
  }
}
