"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  Share2,
  ExternalLink,
  FileText,
  Calendar,
  FileCheck,
  FlaskConical,
  Microscope,
  Activity,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import Swal from "sweetalert2";
import { Patient, PatientDocument, DoctorProfile } from "@/types/medical";
import { generateDocumentWhatsAppUrl } from "@/lib/whatsappShare";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PatientDocument | null;
  patient: Patient;
  doctor: DoctorProfile;
  onDeleteRequested?: (doc: PatientDocument) => void;
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  document: doc,
  patient,
  doctor,
  onDeleteRequested,
}: DocumentViewerModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !doc) return null;

  const isPdf =
    doc.mimeType?.includes("pdf") ||
    doc.fileName.toLowerCase().endsWith(".pdf") ||
    doc.fileUrl.toLowerCase().includes(".pdf");

  const isImage =
    doc.mimeType?.includes("image") ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.fileName);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(doc.fileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = generateDocumentWhatsAppUrl(patient, doc, doctor);
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
        {/* Cabecera del Visor */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-white/10 shrink-0">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white tracking-wider uppercase shrink-0">
                  {doc.documentType}
                </span>
                <h3 className="font-heading font-extrabold text-sm truncate text-white">
                  {doc.title}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5">
                <span>{doc.fileName}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {doc.createdAt.split("T")[0]}
                </span>
                {doc.fileSize && (
                  <>
                    <span>&bull;</span>
                    <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Barra de Acciones Superior */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Compartir enlace seguro a WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copiar URL directa del archivo"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copiar Link</span>
                </>
              )}
            </button>

            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={doc.fileName}
              className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Abrir o descargar en pestaña nueva"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar</span>
            </a>

            {onDeleteRequested && (
              <button
                onClick={() => onDeleteRequested(doc)}
                className="p-1.5 rounded-xl text-rose-400 hover:text-white hover:bg-rose-600/30 transition-colors cursor-pointer ml-1"
                title="Eliminar documento del expediente"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Panel de Contenido: Visor PDF / Imagen */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col">
          {isPdf ? (
            <iframe
              src={doc.fileUrl}
              title={doc.title}
              className="w-full h-full border-0 bg-white"
            />
          ) : isImage ? (
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              <img
                src={doc.fileUrl}
                alt={doc.title}
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-slate-300"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <FileText className="w-16 h-16 text-slate-400" />
              <p className="font-bold text-slate-700 text-sm">
                Vista previa directa no disponible para este tipo de archivo
              </p>
              <p className="text-xs text-slate-500 max-w-md">
                Puede descargar el archivo o abrirlo en una pestaña independiente usando el botón siguiente:
              </p>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-2 hover:bg-primary-dark transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Archivo en Nueva Pestaña</span>
              </a>
            </div>
          )}
        </div>

        {/* Barra Inferior con Notas Clínicas */}
        {doc.notes && (
          <div className="px-6 py-3 bg-amber-50/80 border-t border-amber-200 flex items-start gap-2.5 text-xs text-amber-950 shrink-0">
            <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 shrink-0 pt-0.5">
              Observación Médica:
            </span>
            <p className="font-medium leading-relaxed">{doc.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

