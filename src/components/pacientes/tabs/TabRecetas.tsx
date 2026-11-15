"use client";

import React from "react";
import { Pill, Plus, MessageCircle, Printer } from "lucide-react";
import Swal from "sweetalert2";
import { Patient, MedicalPrescription, DoctorProfile } from "@/types/medical";
import { generatePrescriptionWhatsAppUrl } from "@/lib/whatsappShare";

interface TabRecetasProps {
  patient: Patient;
  prescriptions: MedicalPrescription[];
  doctorProfile?: DoctorProfile | null;
  onOpenNewPrescription: () => void;
  onEditPrescription: (rec: MedicalPrescription) => void;
  onPrintPrescription: (rec: MedicalPrescription) => void;
  onDeletePrescription: (id: string) => void;
}

export function TabRecetas({
  patient,
  prescriptions,
  doctorProfile,
  onOpenNewPrescription,
  onEditPrescription,
  onPrintPrescription,
  onDeletePrescription,
}: TabRecetasProps) {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-heading font-bold text-sm text-heading">
              Recetas Médicas Emitidas ({prescriptions.length})
            </h3>
            <p className="text-[11px] text-muted">
              Recetario inteligente conectado al Vademécum con dosis clínicas estructuradas y firma médica
            </p>
          </div>
        </div>
        <button
          onClick={onOpenNewPrescription}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Emitir Receta</span>
        </button>
      </div>

      <div className="space-y-3">
        {prescriptions.length > 0 ? (
          prescriptions.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                  REC-{rec.id.replace("rec-", "").slice(0, 8)}
                </span>
                <span className="text-xs font-mono font-semibold text-muted">
                  {rec.prescriptionDate}
                </span>
              </div>

              <p className="text-xs font-semibold text-heading leading-snug">
                {rec.diagnosis || "Sin diagnóstico especificado"}
              </p>

              {/* Medicamentos Prescritos */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200">
                {rec.items.map((item, idx) => (
                  <div key={item.id} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="font-bold text-emerald-700 font-mono text-[11px] shrink-0">
                      {idx + 1}.
                    </span>
                    <div>
                      <strong>{item.medicationName}</strong>: {item.dosage} &bull; {item.frequency} &bull; {item.duration}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    const url = generatePrescriptionWhatsAppUrl(patient, rec, doctorProfile);
                    window.open(url, "_blank");
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  title="Enviar receta por WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => onPrintPrescription(rec)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Ver / Imprimir</span>
                </button>

                <button
                  onClick={() => onEditPrescription(rec)}
                  className="text-xs font-semibold text-slate-700 hover:text-primary transition-colors cursor-pointer"
                >
                  Editar
                </button>

                <button
                  onClick={() => {
                    Swal.fire({
                      title: "¿Eliminar Receta?",
                      text: "Esta acción no se puede deshacer.",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#EF4444",
                      confirmButtonText: "Sí, eliminar",
                      cancelButtonText: "Cancelar",
                    }).then((res) => {
                      if (res.isConfirmed) {
                        onDeletePrescription(rec.id);
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
            <Pill className="w-8 h-8 text-muted mx-auto" />
            <p className="text-xs font-semibold text-heading">Sin recetas médicas emitidas</p>
            <p className="text-[11px] text-muted">
              Emita una receta médica conectada al vademécum con selección de dosis en 1 clic.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
