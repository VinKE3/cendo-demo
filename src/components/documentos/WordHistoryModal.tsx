"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  X,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  FileCode,
  Sparkles,
} from "lucide-react";
import { Patient, WordHistoryDocument } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import { uploadDocumentFileToStorage } from "@/lib/supabaseSync";

interface WordHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export function WordHistoryModal({
  isOpen,
  onClose,
  patient,
}: WordHistoryModalProps) {
  const { addWordHistory } = useMedicalStore();

  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      // Sugerencia inicial para notas
      if (!notes) {
        setNotes(`Historia clínica anterior migrada desde documento Word (${selected.name}).`);
      }
    }
  };

  const handleSave = async () => {
    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "Archivo Requerido",
        text: "Por favor seleccione un archivo en formato Word (.doc o .docx) para adjuntar.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    setIsUploading(true);

    try {
      // 1. Subir a Supabase Storage
      const uploaded = await uploadDocumentFileToStorage(file, patient.id, file.name);

      const fileUrl = uploaded?.publicUrl || URL.createObjectURL(file);
      const newDoc: WordHistoryDocument = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `word-${Date.now()}`,
        patientId: patient.id,
        fileName: file.name,
        fileSize: file.size,
        fileUrl,
        extractedText: extractedText.trim() || undefined,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      addWordHistory(newDoc);

      Swal.fire({
        icon: "success",
        title: "Historia Word Adjuntada",
        text: `El documento "${file.name}" se guardó en el expediente de la paciente y en Supabase Storage.`,
        timer: 1800,
        showConfirmButton: false,
      });

      onClose();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error al Subir",
        text: err?.message || "Ocurrió un error al procesar el archivo Word.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-2xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-heading">
                Adjuntar Historia Clínica en Word (.docx)
              </h2>
              <p className="text-xs text-muted">
                Paciente: <strong>{patient.lastName}, {patient.firstName}</strong> &bull; DNI {patient.dni}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-heading hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Zona de Dropzone */}
          <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-2xl p-6 text-center bg-blue-50/30 transition-colors">
            <input
              type="file"
              id="word-file-input"
              accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="word-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  {file ? file.name : "Haga clic para seleccionar archivo Word (.docx / .doc)"}
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB &bull; Listo para subir a Supabase Storage`
                    : "Soporta documentos de Word de historias clínicas anteriores, informes externos o evoluciones"}
                </p>
              </div>
            </label>
          </div>

          {/* Transcripción / Resumen Clave del Word */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Resumen / Texto Extraído de la Historia (Opcional pero Recomendado)</span>
            </label>
            <textarea
              rows={5}
              placeholder="Pegue aquí el texto principal o antecedentes relevantes del documento Word para que el médico pueda leerlo directamente sin tener que descargar el archivo..."
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-blue-500 focus:outline-none font-mono"
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Notas / Origen del Documento</label>
            <input
              type="text"
              placeholder="Ej: Archivo histórico 2024 remitido por la paciente desde clínica anterior..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 border-t border-border bg-slate-50 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isUploading}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isUploading ? "Subiendo a Supabase..." : "Guardar en Historia"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
