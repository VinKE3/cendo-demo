"use client";

import React from "react";
import { Activity, Plus, MessageCircle, Printer } from "lucide-react";
import Swal from "sweetalert2";
import { Patient, UltrasoundReport, DoctorProfile } from "@/types/medical";
import { generateUltrasoundWhatsAppUrl } from "@/lib/whatsappShare";

interface TabEcografiasProps {
  patient: Patient;
  ultrasoundReports: UltrasoundReport[];
  doctorProfile?: DoctorProfile | null;
  onOpenNewUltrasound: () => void;
  onEditUltrasound: (echo: UltrasoundReport) => void;
  onPrintUltrasound: (echo: UltrasoundReport) => void;
  onDeleteUltrasound: (id: string) => void;
}

export function TabEcografias({
  patient,
  ultrasoundReports,
  doctorProfile,
  onOpenNewUltrasound,
  onEditUltrasound,
  onPrintUltrasound,
  onDeleteUltrasound,
}: TabEcografiasProps) {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="font-heading font-bold text-sm text-heading">
              Informes de Ecografía Especializada ({ultrasoundReports.length})
            </h3>
            <p className="text-[11px] text-muted">
              Transvaginal de endometriosis (Protocolo IDEA), Mamaria BI-RADS, Obstétrica y Pélvica
            </p>
          </div>
        </div>
        <button
          onClick={onOpenNewUltrasound}
          className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Nueva Ecografía</span>
        </button>
      </div>

      <div className="space-y-3">
        {ultrasoundReports.length > 0 ? (
          ultrasoundReports.map((echo) => (
            <div
              key={echo.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 hover:border-teal-400 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 text-teal-800">
                    {echo.ultrasoundType}
                  </span>
                  <span className="text-xs font-mono font-bold text-heading">
                    {echo.reportDate}
                  </span>
                  {echo.findings.biradsCategory && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                      {echo.findings.biradsCategory}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted">
                  Especialista: <strong>{echo.doctorName}</strong>
                </span>
              </div>

              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900 leading-snug">
                  {echo.conclusion}
                </p>
                <p className="text-slate-600">
                  <strong>Indicación:</strong> {echo.indication}
                </p>
                {echo.recommendations && (
                  <p className="text-slate-700">
                    <strong>Recomendaciones:</strong> {echo.recommendations}
                  </p>
                )}
              </div>

              {echo.images && echo.images.length > 0 && (
                <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                  {echo.images.map((im, idx) => (
                    <img
                      key={idx}
                      src={im.url}
                      alt={im.caption}
                      className="w-16 h-12 object-cover rounded-lg border border-slate-300 shadow-2xs shrink-0"
                      title={im.caption}
                    />
                  ))}
                  <span className="text-[10px] text-muted font-mono">{echo.images.length} capturas</span>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    const url = generateUltrasoundWhatsAppUrl(patient, echo, doctorProfile);
                    window.open(url, "_blank");
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  title="Enviar reporte por WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => onPrintUltrasound(echo)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Ver / Imprimir A4</span>
                </button>

                <button
                  onClick={() => onEditUltrasound(echo)}
                  className="text-xs font-semibold text-slate-700 hover:text-teal-700 transition-colors cursor-pointer"
                >
                  Editar
                </button>

                <button
                  onClick={() => {
                    Swal.fire({
                      title: "¿Eliminar Ecografía?",
                      text: "Esta acción no se puede deshacer.",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#EF4444",
                      confirmButtonText: "Sí, eliminar",
                      cancelButtonText: "Cancelar",
                    }).then((res) => {
                      if (res.isConfirmed) {
                        onDeleteUltrasound(echo.id);
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
            <Activity className="w-8 h-8 text-muted mx-auto" />
            <p className="text-xs font-semibold text-heading">Sin ecografías especializadas registradas</p>
            <p className="text-[11px] text-muted">
              Emita informes ecográficos con plantillas especializadas para endometriosis, BI-RADS u obstetricia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
