"use client";

import React from "react";
import { FileCode, Plus, Download } from "lucide-react";
import Swal from "sweetalert2";
import { Patient, WordHistoryDocument, PatientDocument, DoctorProfile } from "@/types/medical";
import { PatientDocumentsSection } from "@/components/documentos/PatientDocumentsSection";

interface TabDocumentosWordProps {
  patient: Patient;
  wordHistories: WordHistoryDocument[];
  doctorProfile?: DoctorProfile | null;
  onOpenWordModal: () => void;
  onDeleteWordHistory: (id: string) => void;
  onOpenUploadDocModal: () => void;
  onViewDocument: (doc: PatientDocument) => void;
}

export function TabDocumentosWord({
  patient,
  wordHistories,
  doctorProfile,
  onOpenWordModal,
  onDeleteWordHistory,
  onOpenUploadDocModal,
  onViewDocument,
}: TabDocumentosWordProps) {
  return (
    <div className="space-y-6">
      {/* Repositorio de Documentos PDF y Exámenes Externos */}
      <PatientDocumentsSection
        patient={patient}
        doctor={doctorProfile}
        onOpenUploadModal={onOpenUploadDocModal}
        onViewDocument={onViewDocument}
      />

      {/* Historias Clínicas Migradas en Word */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-heading font-bold text-sm text-heading">
                Historias Clínicas Migradas en Word (.docx) ({wordHistories.length})
              </h3>
              <p className="text-[11px] text-muted">
                Archivos Word externos adjuntos y texto extraído para lectura directa en consulta
              </p>
            </div>
          </div>
          <button
            onClick={onOpenWordModal}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Adjuntar Archivo Word</span>
          </button>
        </div>

        <div className="space-y-3">
          {wordHistories.length > 0 ? (
            wordHistories.map((wDoc) => (
              <div
                key={wDoc.id}
                className="p-4 rounded-xl bg-blue-50/40 border border-blue-200 space-y-2 hover:border-blue-400 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-700 shrink-0" />
                    <span className="font-bold text-slate-900 text-xs truncate max-w-sm">
                      {wDoc.fileName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ({(wDoc.fileSize / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted">
                    {wDoc.createdAt.split("T")[0]}
                  </span>
                </div>

                {wDoc.extractedText && (
                  <div className="p-3 rounded-lg bg-white border border-blue-100 text-xs font-mono text-slate-800 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                    {wDoc.extractedText}
                  </div>
                )}

                {wDoc.notes && (
                  <p className="text-xs text-slate-600 italic">
                    <strong>Nota:</strong> {wDoc.notes}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-blue-100">
                  <a
                    href={wDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={wDoc.fileName}
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar .docx</span>
                  </a>

                  <button
                    onClick={() => {
                      Swal.fire({
                        title: "¿Eliminar Documento Word?",
                        text: "Esta acción no se puede deshacer.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#EF4444",
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar",
                      }).then((res) => {
                        if (res.isConfirmed) {
                          onDeleteWordHistory(wDoc.id);
                        }
                      });
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center space-y-1">
              <FileCode className="w-8 h-8 text-muted mx-auto" />
              <p className="text-xs font-semibold text-heading">Sin documentos Word adjuntos</p>
              <p className="text-[11px] text-muted">
                Adjunte archivos Word con historias clínicas o evoluciones previas de otras clínicas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
