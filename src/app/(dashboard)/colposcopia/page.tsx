"use client";

import React from "react";
import Link from "next/link";
import { FileCheck2, Camera, Clock, User, CheckCircle2 } from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";

export default function ColposcopiaPage() {
  const { colposcopyReports, patients } = useMedicalStore();
  const report = colposcopyReports[0];
  const patient = patients[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-heading">
            Informes de Colposcopía Especializada
          </h1>
          <p className="text-xs text-muted">
            Nomenclatura IFCPC Río de Janeiro &bull; Registro Fotográfico y Mapeo de Biopsias
          </p>
        </div>
      </div>

      {report && (
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-primary bg-accent-soft px-2.5 py-0.5 rounded-full">
                Informe: {report.id}
              </span>
              <h2 className="text-lg font-heading font-bold text-heading mt-1">
                Paciente: {patient?.lastName}, {patient?.firstName} (DNI: {patient?.dni})
              </h2>
              <p className="text-xs text-muted">
                Fecha del Examen: {report.reportDate} &bull; Médico: {report.doctorName}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-status-normal border border-emerald-200 self-start sm:self-auto">
              Colposcopía Adecuada
            </span>
          </div>

          {/* Grilla Fotográfica Colposcópica */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
              Registro Fotográfico Colposcópico (4 Tomas)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {report.images.map((img, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border overflow-hidden bg-slate-100 space-y-1.5 shadow-2xs"
                >
                  <div className="aspect-4/3 relative bg-slate-200 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[10px] text-muted p-2 line-clamp-2 leading-tight">
                    {img.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Parámetros Clínicos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-muted block text-[10px] uppercase font-bold">Unión Escamocolumnar</span>
              <strong className="text-heading text-sm">{report.squamocolumnarJunctionVisible}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-muted block text-[10px] uppercase font-bold">Zona de Transformación</span>
              <strong className="text-heading text-sm">{report.transformationZoneType}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-muted block text-[10px] uppercase font-bold">Test de Schiller</span>
              <strong className="text-heading text-sm">{report.schillerTest}</strong>
            </div>
          </div>

          {/* Diagnóstico y Plan */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
            <p><strong className="text-amber-900">Diagnóstico Colposcópico:</strong> {report.diagnosis}</p>
            <p><strong className="text-amber-900">Conducta / Recomendaciones:</strong> {report.planRecommendations}</p>
          </div>
        </div>
      )}
    </div>
  );
}

