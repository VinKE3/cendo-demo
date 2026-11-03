"use client";

import React from "react";
import { Activity, Stethoscope } from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";

export default function ChequeosPage() {
  const { clinicalCheckups, patients } = useMedicalStore();
  const checkup = clinicalCheckups[0];
  const patient = patients.find((p) => p.id === checkup?.patientId) || patients[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-heading">
            Chequeo Integral Ginecológico y Ecografías
          </h1>
          <p className="text-xs text-muted">
            Evaluación pélvica, ecografía transvaginal doppler y ecografía mamaria bilateral
          </p>
        </div>
      </div>

      {checkup && (
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-heading font-bold text-heading">
              Paciente: {patient?.lastName}, {patient?.firstName} (DNI: {patient?.dni})
            </h2>
            <p className="text-xs text-muted">
              Fecha de Atención: {checkup.checkupDate} &bull; Motivo: {checkup.reasonForConsultation}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-heading text-sm">Ecografía Mamaria Bilateral</h3>
              <p className="text-muted leading-relaxed">{checkup.breastUltrasoundFindings}</p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span>Clasificación:</span>
                <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {checkup.breastUltrasoundBirads}
                </strong>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-heading text-sm">Ecografía Transvaginal Doppler</h3>
              <p className="text-muted leading-relaxed">{checkup.transvaginalUltrasoundFindings}</p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span>Útero: <strong>{checkup.uterusMeasurements}</strong></span>
                <span>Endometrio: <strong>{checkup.endometriumThicknessMm} mm</strong></span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2 text-xs">
            <p><strong className="text-indigo-950">Conclusiones:</strong> {checkup.conclusions}</p>
            <p><strong className="text-indigo-950">Prescripción Médica:</strong> {checkup.medicalPrescription}</p>
          </div>
        </div>
      )}

      {!checkup && (
        <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-2">
          <p className="text-sm font-semibold text-heading">No hay chequeos ni ecografías registradas</p>
          <p className="text-xs text-muted">Inicie una nueva evaluación ginecológica para registrar ecografías.</p>
        </div>
      )}
    </div>
  );
}

