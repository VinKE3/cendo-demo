import { createClient } from "@/lib/supabase/client";
import {
  Patient,
  CreatePatientInput,
  UpdatePatientInput,
} from "./pacientes.types";
import { calculateAge } from "./pacientes.validator";

interface PatientRow {
  id: string;
  dni: string;
  document_number?: string;
  document_type?: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  birth_date: string | null;
  age?: number | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  district?: string | null;
  civil_status?: string | null;
  occupation?: string | null;
  education_level?: string | null;
  birth_place?: string | null;
  religion?: string | null;
  insurance_info?: string | null;
  created_at?: string;
  updated_at?: string;
}

function ensureUuid(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "10000000-0000-0000-0000-" + Math.random().toString(16).substring(2, 14).padEnd(12, "0");
}

function rowToEntity(row: PatientRow): Patient {
  const cleanBirthDate = row.birth_date
    ? (row.birth_date.match(/\d{4}-\d{2}-\d{2}/)?.[0] || "1998-01-01")
    : "1998-01-01";

  const age = row.age !== undefined && row.age !== null
    ? row.age
    : calculateAge(cleanBirthDate);

  return {
    id: row.id,
    dni: row.dni || row.document_number || "",
    firstName: row.first_name || "",
    lastName: row.last_name || "",
    birthDate: cleanBirthDate,
    age,
    phone: row.phone || "",
    email: row.email || "",
    address: row.address || "",
    civilStatus: row.civil_status || "Soltera",
    occupation: row.occupation || "",
    educationLevel: row.education_level || "Superior Universitaria",
    birthPlace: row.birth_place || "",
    religion: row.religion || "Católica",
    insuranceInfo: row.insurance_info || "Particular",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchPatients(): Promise<Patient[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return (data as PatientRow[]).map(rowToEntity);
  } catch {
    return [];
  }
}

export async function fetchPatientById(id: string): Promise<Patient | null> {
  try {
    const supabase = createClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let query = supabase.from("patients").select("*");

    if (isUuid) {
      query = query.eq("id", id);
    } else {
      query = query.or(`dni.eq.${id},document_number.eq.${id}`);
    }

    const { data, error } = await query.single();
    if (error || !data) return null;
    return rowToEntity(data as PatientRow);
  } catch {
    return null;
  }
}

export async function createPatient(
  input: CreatePatientInput
): Promise<Patient | null> {
  try {
    const supabase = createClient();
    const newId = ensureUuid();
    const cleanBirthDate = input.birthDate
      ? (input.birthDate.match(/\d{4}-\d{2}-\d{2}/)?.[0] || null)
      : null;

    const row = {
      id: newId,
      dni: input.dni.trim(),
      document_type: "DNI",
      document_number: input.dni.trim(),
      first_name: input.firstName.trim().toUpperCase(),
      last_name: input.lastName.trim().toUpperCase(),
      full_name: `${input.lastName.trim().toUpperCase()}, ${input.firstName.trim().toUpperCase()}`,
      birth_date: cleanBirthDate,
      age: input.age ?? (cleanBirthDate ? calculateAge(cleanBirthDate) : 25),
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
      district: "Miraflores",
      civil_status: input.civilStatus || "Soltera",
      occupation: input.occupation?.trim() || null,
      education_level: input.educationLevel || "Superior Universitaria",
      birth_place: input.birthPlace?.trim() || null,
      religion: input.religion || "Católica",
      insurance_info: input.insuranceInfo || "Particular",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("patients")
      .insert(row)
      .select()
      .single();

    if (error || !data) return null;
    return rowToEntity(data as PatientRow);
  } catch {
    return null;
  }
}

export async function updatePatient(
  id: string,
  updates: UpdatePatientInput
): Promise<boolean> {
  try {
    const supabase = createClient();
    const payload: Partial<PatientRow> = { updated_at: new Date().toISOString() };

    if (updates.dni !== undefined) {
      payload.dni = updates.dni.trim();
      payload.document_number = updates.dni.trim();
    }
    if (updates.firstName !== undefined) payload.first_name = updates.firstName.trim().toUpperCase();
    if (updates.lastName !== undefined) payload.last_name = updates.lastName.trim().toUpperCase();
    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      const fName = updates.firstName || "";
      const lName = updates.lastName || "";
      payload.full_name = `${lName.trim().toUpperCase()}, ${fName.trim().toUpperCase()}`;
    }
    if (updates.birthDate !== undefined) {
      payload.birth_date = updates.birthDate.match(/\d{4}-\d{2}-\d{2}/)?.[0] || null;
    }
    if (updates.age !== undefined) payload.age = updates.age;
    if (updates.phone !== undefined) payload.phone = updates.phone.trim();
    if (updates.email !== undefined) payload.email = updates.email.trim();
    if (updates.address !== undefined) payload.address = updates.address.trim();
    if (updates.civilStatus !== undefined) payload.civil_status = updates.civilStatus;
    if (updates.occupation !== undefined) payload.occupation = updates.occupation.trim();
    if (updates.educationLevel !== undefined) payload.education_level = updates.educationLevel;
    if (updates.birthPlace !== undefined) payload.birth_place = updates.birthPlace.trim();
    if (updates.religion !== undefined) payload.religion = updates.religion;

    const { error } = await supabase.from("patients").update(payload).eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function deletePatient(id: string, dni?: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let query = supabase.from("patients").delete();

    if (isUuid) {
      query = query.eq("id", id);
    } else if (dni) {
      query = query.or(`dni.eq.${dni},document_number.eq.${dni}`);
    } else {
      query = query.eq("id", id);
    }

    const { error } = await query;
    return !error;
  } catch {
    return false;
  }
}
