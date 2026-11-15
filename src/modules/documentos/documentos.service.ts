import { createClient } from "@/lib/supabase/client";
import { getPatientUuid } from "@/lib/supabaseSync";
import { PatientDocument, CreatePatientDocumentInput, WordHistoryDocument, CreateWordHistoryInput } from "./documentos.types";
import { patientDocumentSchema, wordHistorySchema } from "./documentos.validator";

function ensureUuid(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id;
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "00000000-0000-0000-0000-" + Math.random().toString(16).substring(2, 14).padEnd(12, "0");
}

function mapRowToPatientDocument(row: any): PatientDocument {
  return {
    id: row.id,
    patientId: row.patient_id,
    documentType: row.document_type || "OTRO",
    title: row.title || "Documento Clínico",
    fileName: row.file_name || "documento.pdf",
    fileUrl: row.file_url || "",
    filePath: row.file_path || undefined,
    fileSize: row.file_size != null ? Number(row.file_size) : undefined,
    mimeType: row.mime_type || "application/pdf",
    notes: row.notes || undefined,
    uploadedBy: row.uploaded_by || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapRowToWordHistory(row: any): WordHistoryDocument {
  return {
    id: row.id,
    patientId: row.patient_id,
    fileName: row.file_name || "historia.docx",
    fileSize: Number(row.file_size) || 0,
    fileUrl: row.file_url || "",
    extractedText: row.extracted_text || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export async function fetchDocumentsByPatientId(patientId: string): Promise<PatientDocument[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("patient_documents")
    .select("*")
    .eq("patient_id", getPatientUuid(patientId))
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapRowToPatientDocument);
}

export async function saveDocumentToSupabase(docInput: CreatePatientDocumentInput): Promise<PatientDocument> {
  const validated = patientDocumentSchema.parse(docInput);
  const supabase = createClient();
  const docUuid = ensureUuid(docInput.id);
  const patientUuid = getPatientUuid(validated.patientId);

  const payload = {
    id: docUuid,
    patient_id: patientUuid,
    document_type: validated.documentType,
    title: validated.title,
    file_url: validated.fileUrl,
    file_name: validated.fileName,
    file_size: validated.fileSize ?? null,
    mime_type: validated.mimeType,
    notes: validated.notes ?? null,
    created_at: docInput.createdAt || new Date().toISOString(),
  };

  const { data, error } = await supabase.from("patient_documents").upsert(payload).select("*").single();
  if (error) throw new Error(`Error al guardar documento: ${error.message}`);
  return mapRowToPatientDocument(data);
}

export async function deleteDocumentFromSupabase(id: string, filePath?: string): Promise<boolean> {
  const supabase = createClient();
  const targetId = ensureUuid(id);
  if (filePath) {
    await supabase.storage.from("lab-reports").remove([filePath]);
  }
  const { error } = await supabase.from("patient_documents").delete().eq("id", targetId);
  return !error;
}

export async function fetchWordHistoriesByPatientId(patientId: string): Promise<WordHistoryDocument[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("word_history_documents")
    .select("*")
    .eq("patient_id", getPatientUuid(patientId))
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapRowToWordHistory);
}

export async function saveWordHistoryToSupabase(docInput: CreateWordHistoryInput): Promise<WordHistoryDocument> {
  const validated = wordHistorySchema.parse(docInput);
  const supabase = createClient();
  const docUuid = ensureUuid(docInput.id);
  const patientUuid = getPatientUuid(validated.patientId);

  const payload = {
    id: docUuid,
    patient_id: patientUuid,
    file_name: validated.fileName,
    file_size: validated.fileSize,
    file_url: validated.fileUrl,
    extracted_text: validated.extractedText ?? null,
    notes: validated.notes ?? null,
    created_at: docInput.createdAt || new Date().toISOString(),
  };

  const { data, error } = await supabase.from("word_history_documents").upsert(payload).select("*").single();
  if (error) throw new Error(`Error al guardar historia Word: ${error.message}`);
  return mapRowToWordHistory(data);
}

export async function deleteWordHistoryFromSupabase(id: string, filePath?: string): Promise<boolean> {
  const supabase = createClient();
  const targetId = ensureUuid(id);
  if (filePath) {
    await supabase.storage.from("lab-reports").remove([filePath]);
  }
  const { error } = await supabase.from("word_history_documents").delete().eq("id", targetId);
  return !error;
}
