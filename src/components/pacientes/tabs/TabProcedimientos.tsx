"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Scissors, Plus, MessageCircle, Printer } from "lucide-react";
import Swal from "sweetalert2";
import { Patient, MinorProcedureReport, DoctorProfile } from "@/types/medical";
import { generateMinorProcedureWhatsAppUrl } from "@/lib/whatsappShare";
import { TablePagination } from "@/components/common/TablePagination";

interface TabProcedimientosProps {
  patient: Patient;
  minorProcedures: MinorProcedureReport[];
  doctorProfile?: DoctorProfile | null;
  onOpenNewMinorProc: () => void;
  onEditMinorProc: (proc: MinorProcedureReport) => void;
  onPrintMinorProc: (proc: MinorProcedureReport) => void;
  onDeleteMinorProc: (id: string) => void;
}

export function TabProcedimientos({
  patient,
  minorProcedures,
  doctorProfile,
  onOpenNewMinorProc,
  onEditMinorProc,
  onPrintMinorProc,
  onDeleteMinorProc,
}: TabProcedimientosProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(minorProcedures.length / pageSize));
    if (currentPage > maxPage) {
      setCurrentPage(1);
    }
  }, [minorProcedures.length, pageSize, currentPage]);

  const paginatedProcedures = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return minorProcedures.slice(start, start + pageSize);
  }, [minorProcedures, currentPage, pageSize]);
  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-rose-600" />
          <div>
            <h3 className="font-heading font-bold text-sm text-heading">
              Procedimientos Menores & Biopsias en Consultorio ({minorProcedures.length})
            </h3>
            <p className="text-[11px] text-muted">
              Biopsia cervical dirigida, Biopsia Pipelle, Cono LEEP, DIU e implantes con protocolo quirúrgico
            </p>
          </div>
        </div>
        <button
          onClick={onOpenNewMinorProc}
          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Registrar Procedimiento</span>
        </button>
      </div>

      <div className="space-y-3">
        {minorProcedures.length > 0 ? (
          <>
            {paginatedProcedures.map((proc) => (
              <div
                key={proc.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 hover:border-rose-400 transition-colors"
              >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800">
                    {proc.procedureType.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs font-mono font-bold text-heading">
                    {proc.procedureDate}
                  </span>
                  {proc.cie10Code && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-800">
                      CIE-10: {proc.cie10Code}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted">
                  Cirujano: <strong>{proc.doctorName}</strong>
                </span>
              </div>

              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900 leading-snug">
                  Post-Op: {proc.postOpDiagnosis}
                </p>
                <p className="text-slate-600">
                  <strong>Pre-Op:</strong> {proc.preOpDiagnosis} &bull; <strong>Anestesia:</strong> {proc.anesthesiaType}
                </p>
                <p className="text-slate-700">
                  <strong>Patología:</strong> {proc.procedureDetails.specimenSentToPathology ? "Muestra remitida (" + (proc.procedureDetails.specimenDescription || "En estudio") + ")" : "No requerida"} &bull; <strong>Hemostasia:</strong> {proc.procedureDetails.hemostasisMethod}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    const url = generateMinorProcedureWhatsAppUrl(patient, proc, doctorProfile);
                    window.open(url, "_blank");
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  title="Enviar indicaciones postoperatorias por WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => onPrintMinorProc(proc)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Ver / Imprimir A4</span>
                </button>

                <button
                  onClick={() => onEditMinorProc(proc)}
                  className="text-xs font-semibold text-slate-700 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  Editar
                </button>

                <button
                  onClick={() => {
                    Swal.fire({
                      title: "¿Eliminar Procedimiento?",
                      text: "Esta acción no se puede deshacer.",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#EF4444",
                      confirmButtonText: "Sí, eliminar",
                      cancelButtonText: "Cancelar",
                    }).then((res) => {
                      if (res.isConfirmed) {
                        onDeleteMinorProc(proc.id);
                      }
                    });
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          <div className="pt-3 border-t border-slate-200">
            <TablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={minorProcedures.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 15, 25, 50]}
              itemLabel="procedimientos"
            />
          </div>
        </>
        ) : (
          <div className="py-8 text-center space-y-1">
            <Scissors className="w-8 h-8 text-muted mx-auto" />
            <p className="text-xs font-semibold text-heading">Sin procedimientos menores registrados</p>
            <p className="text-[11px] text-muted">
              Registre protocolos de biopsias de cérvix, endometrio, cono LEEP o inserción de DIU.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
