/**
 * CENDO - Módulo 14: Repositorio Documental (.pdf & .docx)
 * Tipos oficiales para gestión de exámenes externos, patología e historias clínicas importadas.
 */

export type DocumentCategory =
  | "PAP"
  | "VPH"
  | "PATOLOGIA"
  | "LABORATORIO"
  | "ECOGRAFIA"
  | "INFORME_MEDICO"
  | "CONSENTIMIENTO"
  | "OTRO";

export interface PatientDocument {
  id: string;
  patientId: string;
  documentType: DocumentCategory;
  title: string;
  fileName: string;
  fileUrl: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  notes?: string;
  createdAt: string;
  uploadedBy?: string;
}

export type CreatePatientDocumentInput = Omit<PatientDocument, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};

export interface WordHistoryDocument {
  id: string;
  patientId: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  extractedText?: string;
  notes?: string;
  createdAt: string;
}

export type CreateWordHistoryInput = Omit<WordHistoryDocument, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};

export interface DocumentUploadResult {
  publicUrl: string;
  filePath: string;
}
