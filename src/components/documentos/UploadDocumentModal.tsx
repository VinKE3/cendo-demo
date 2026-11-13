"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  FlaskConical,
  Microscope,
  Activity,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Swal from "sweetalert2";
import { DocumentCategory, PatientDocument } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import { uploadDocumentFileToStorage } from "@/lib/supabaseSync";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

const CATEGORIES: { value: DocumentCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "PAP", label: "Citología PAP", icon: <Microscope className="w-4 h-4" />, color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "VPH", label: "Test Molecular VPH", icon: <FlaskConical className="w-4 h-4" />, color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  { value: "PATOLOGIA", label: "Biopsia / Patología", icon: <FileCheck className="w-4 h-4" />, color: "bg-rose-100 text-rose-800 border-rose-200" },
  { value: "LABORATORIO", label: "Análisis Laboratorio", icon: <Activity className="w-4 h-4" />, color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "ECOGRAFIA", label: "Ecografía Externa", icon: <FileText className="w-4 h-4" />, color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "INFORME_MEDICO", label: "Informe Médico", icon: <FileText className="w-4 h-4" />, color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "CONSENTIMIENTO", label: "Consentimiento", icon: <FileCheck className="w-4 h-4" />, color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "OTRO", label: "Otro Documento", icon: <FileText className="w-4 h-4" />, color: "bg-slate-100 text-slate-800 border-slate-200" },
];

const QUICK_TITLES = [
  "Informe de Biopsia de Cérvix - Anatomía Patológica",
  "Citología Cervico-Vaginal PAP ThinPrep - Biolaq",
  "Panel Molecular VPH 23 Genotipos PCR - Biolaq",
  "Batería de Laboratorio Gestacional 1er Trimestre",
  "Dosaje Marcador Tumoral CA-125 & Perfil Inflamatorio",
  "Densitometría Ósea Dual (DEXA) - Columna y Fémur",
  "Mamografía Digital Bilateral",
];

export function UploadDocumentModal({
  isOpen,
  onClose,
  patientId,
  patientName,
}: UploadDocumentModalProps) {
  const { addPatientDocument } = useMedicalStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentCategory>("LABORATORIO");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        // Sugerir título amigable basado en el nombre del archivo
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      Swal.fire({
        icon: "warning",
        title: "Archivo requerido",
        text: "Por favor seleccione un archivo PDF o imagen para subir.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    if (!title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Título requerido",
        text: "Ingrese un título descriptivo para el documento.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Subir archivo a Supabase Storage (Bucket: lab-reports)
      const uploadRes = await uploadDocumentFileToStorage(
        selectedFile,
        patientId,
        selectedFile.name
      );

      // Si falla la red de storage (o modo offline), generar URL fallback local
      const fileUrl = uploadRes?.publicUrl || URL.createObjectURL(selectedFile);
      const filePath = uploadRes?.filePath || `${patientId}/${selectedFile.name}`;

      const newDoc: PatientDocument = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `doc-${Date.now()}`,
        patientId,
        documentType,
        title: title.trim(),
        fileName: selectedFile.name,
        fileUrl,
        filePath,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type || "application/pdf",
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      };

      addPatientDocument(newDoc);

      await Swal.fire({
        icon: "success",
        title: "Documento Guardado",
        text: `El archivo "${title}" ha sido incorporado al repositorio de la paciente.`,
        confirmButtonColor: "#0A4D68",
        timer: 1800,
        showConfirmButton: false,
      });

      // Limpiar y cerrar
      setSelectedFile(null);
      setTitle("");
      setNotes("");
      onClose();
    } catch (err: any) {
      console.error("Error al subir documento:", err);
      Swal.fire({
        icon: "error",
        title: "Error al subir",
        text: err?.message || "No se pudo subir el archivo. Intente nuevamente.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-primary to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <Upload className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm tracking-wide">
                Subir Documento o Examen Externo (PDF)
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                Expediente: <strong className="text-white">{patientName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleUpload} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Zona de Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : selectedFile
                ? "border-emerald-400 bg-emerald-50/50"
                : "border-slate-300 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-sm truncate max-w-md">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB &bull; {selectedFile.type || "Documento"}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    Clic para cambiar de archivo
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Upload className="w-8 h-8 text-primary mx-auto" />
                <p className="font-bold text-slate-800 text-xs">
                  Arrastra tu archivo PDF o imagen médica aquí, o <span className="text-primary underline">haz clic para examinar</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  Formatos admitidos: PDF, JPG, PNG (máx. 25 MB por archivo)
                </p>
              </div>
            )}
          </div>

          {/* Categoría Clínica */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Tipo de Documento / Examen Clínico *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = documentType === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setDocumentType(cat.value)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium"
                    }`}
                  >
                    <span className={isSelected ? "text-primary" : "text-slate-400"}>
                      {cat.icon}
                    </span>
                    <span className="text-[11px] truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título Descriptivo */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Título del Documento *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Citología PAP ThinPrep - Laboratorio Biolaq"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
              required
            />

            {/* Chips de Sugerencia Rápida */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Sugerencias rápidas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TITLES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTitle(t)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors cursor-pointer truncate max-w-xs"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notas / Observaciones Médicas */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Observaciones Clínicas / Conclusiones del Examen (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ej. Frotis con flora habitual. Negativo a neoplasia. Control en 1 año."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs resize-none"
            />
          </div>

          {/* Footer de Acciones */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Subiendo a Supabase Storage...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Guardar en Repositorio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

