import { z } from "zod";
import { DocumentCategory } from "./documentos.types";

export const patientDocumentSchema = z.object({
  patientId: z.string().min(1, "El ID de la paciente es obligatorio"),
  documentType: z.enum([
    "PAP",
    "VPH",
    "PATOLOGIA",
    "LABORATORIO",
    "ECOGRAFIA",
    "INFORME_MEDICO",
    "CONSENTIMIENTO",
    "OTRO",
  ]),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  fileName: z.string().min(1, "El nombre de archivo es obligatorio"),
  fileUrl: z.string().url("URL de archivo inválida"),
  filePath: z.string().optional(),
  fileSize: z.number().nonnegative().optional(),
  mimeType: z.string().default("application/pdf"),
  notes: z.string().optional(),
  uploadedBy: z.string().optional(),
});

export const wordHistorySchema = z.object({
  patientId: z.string().min(1, "El ID de la paciente es obligatorio"),
  fileName: z.string().min(1, "El nombre de archivo es obligatorio"),
  fileSize: z.number().nonnegative(),
  fileUrl: z.string().url("URL de archivo inválida"),
  extractedText: z.string().optional(),
  notes: z.string().optional(),
});

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string; color: string }[] = [
  { value: "PAP", label: "Citología PAP", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "VPH", label: "Test Molecular VPH", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  { value: "PATOLOGIA", label: "Biopsia / Patología", color: "bg-rose-100 text-rose-800 border-rose-200" },
  { value: "LABORATORIO", label: "Análisis Laboratorio", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "ECOGRAFIA", label: "Ecografía Externa", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "INFORME_MEDICO", label: "Informe Médico", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "CONSENTIMIENTO", label: "Consentimiento", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "OTRO", label: "Otro Documento", color: "bg-slate-100 text-slate-800 border-slate-200" },
];

export const QUICK_DOCUMENT_TITLES = [
  "Informe de Biopsia de Cérvix - Anatomía Patológica",
  "Citología Cervico-Vaginal PAP ThinPrep - Biolaq",
  "Panel Molecular VPH 23 Genotipos PCR - Biolaq",
  "Batería de Laboratorio Gestacional 1er Trimestre",
  "Dosaje Marcador Tumoral CA-125 & Perfil Inflamatorio",
  "Densitometría Ósea Dual (DEXA) - Columna y Fémur",
  "Mamografía Digital Bilateral",
];

export const MAX_DOCUMENT_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export function validateDocumentFile(fileSize: number, mimeType: string): { valid: boolean; error?: string } {
  if (fileSize > MAX_DOCUMENT_FILE_SIZE_BYTES) {
    return { valid: false, error: "El archivo excede el tamaño máximo permitido de 25 MB." };
  }
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  if (!allowed.includes(mimeType) && !mimeType.startsWith("image/")) {
    return { valid: false, error: "Tipo de archivo no soportado. Formatos válidos: PDF, Word (DOCX) e imágenes." };
  }
  return { valid: true };
}
