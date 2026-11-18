"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Stethoscope, Plus, MessageCircle, Printer } from "lucide-react";
import Swal from "sweetalert2";
import { Patient, MedicalConsultation, DoctorProfile } from "@/types/medical";
import { generateConsultationWhatsAppUrl } from "@/lib/whatsappShare";
import { TablePagination } from "@/components/common/TablePagination";

interface TabConsultasProps {
  patient: Patient;
  consultations: MedicalConsultation[];
  doctorProfile?: DoctorProfile | null;
  onOpenNewConsultation: () => void;
  onEditConsultation: (cons: MedicalConsultation) => void;
  onPrintConsultation: (cons: MedicalConsultation) => void;
  onDeleteConsultation: (id: string) => void;
}

export function TabConsultas({
  patient,
  consultations,
  doctorProfile,
  onOpenNewConsultation,
  onEditConsultation,
  onPrintConsultation,
  onDeleteConsultation,
}: TabConsultasProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(consultations.length / pageSize));
    if (currentPage > maxPage) {
      setCurrentPage(1);
    }
  }, [consultations.length, pageSize, currentPage]);

  const paginatedConsultations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return consultations.slice(start, start + pageSize);
  }, [consultations, currentPage, pageSize]);
  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-heading font-bold text-sm text-heading">
              Consultas Ginecológicas Estructuradas ({consultations.length})
            </h3>
            <p className="text-[11px] text-muted">
              Anamnesis, signos vitales antropométricos, examen físico dirigido, diagnóstico CIE-10 y plan terapéutico
            </p>
          </div>
        </div>
        <button
          onClick={onOpenNewConsultation}
          className="px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Registrar Consulta</span>
        </button>
      </div>

      <div className="space-y-3">
        {consultations.length > 0 ? (
          <>
            {paginatedConsultations.map((cons) => (
              <div
                key={cons.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 hover:border-primary/40 transition-colors"
              >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary">
                    CONS-{cons.id.slice(0, 8)}
                  </span>
                  <span className="text-xs font-mono font-bold text-heading">
                    {cons.consultationDate}
                  </span>
                  {cons.cie10Code && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                      CIE-10: {cons.cie10Code}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted font-semibold">
                  Médico: <strong>{cons.doctorName}</strong> (CMP {cons.doctorCmp})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                <div className="md:col-span-8 space-y-1">
                  <p className="font-bold text-slate-900 text-sm">
                    {cons.diagnosis}
                  </p>
                  <p className="text-slate-600">
                    <strong>Motivo:</strong> {cons.reasonForVisit}
                    {cons.illnessTime ? " (" + cons.illnessTime + ")" : ""}
                  </p>
                  <p className="text-slate-700 leading-snug font-sans">
                    <strong>Plan:</strong> {cons.treatmentPlan}
                  </p>
                </div>

                <div className="md:col-span-4 p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 text-[11px]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Signos Vitales:</span>
                  <p className="text-slate-700 font-mono">
                    P.A.: <strong>{cons.vitalSigns.bloodPressure}</strong> &bull; F.C.: <strong>{cons.vitalSigns.heartRate} lpm</strong>
                  </p>
                  <p className="text-slate-700 font-mono">
                    Peso: <strong>{cons.vitalSigns.weightKg} kg</strong> &bull; Talla: <strong>{cons.vitalSigns.heightCm} cm</strong> &bull; IMC: <strong className="text-primary">{cons.vitalSigns.bmi}</strong>
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    const url = generateConsultationWhatsAppUrl(patient, cons, doctorProfile);
                    window.open(url, "_blank");
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  title="Enviar resumen de consulta por WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => onPrintConsultation(cons)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Ver / Imprimir A4</span>
                </button>

                <button
                  onClick={() => onEditConsultation(cons)}
                  className="text-xs font-semibold text-slate-700 hover:text-primary transition-colors cursor-pointer"
                >
                  Editar
                </button>

                <button
                  onClick={() => {
                    Swal.fire({
                      title: "¿Eliminar Consulta?",
                      text: "Esta acción no se puede deshacer.",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#EF4444",
                      confirmButtonText: "Sí, eliminar",
                      cancelButtonText: "Cancelar",
                    }).then((res) => {
                      if (res.isConfirmed) {
                        onDeleteConsultation(cons.id);
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
              totalItems={consultations.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 15, 25, 50]}
              itemLabel="consultas"
            />
          </div>
        </>
        ) : (
          <div className="py-8 text-center space-y-1">
            <Stethoscope className="w-8 h-8 text-muted mx-auto" />
            <p className="text-xs font-semibold text-heading">Sin consultas estructuradas registradas</p>
            <p className="text-[11px] text-muted">
              Registre la atención ginecológica integral con signos vitales y examen físico en 1 clic.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
