"use client";

import React from "react";
import { ColposcopyReport, Patient, DoctorProfile } from "@/types/medical";
import { CervicalClock } from "@/components/colposcopia/CervicalClock";
import { BrandLogo } from "@/components/layout/BrandLogo";

interface ColposcopyPrintViewProps {
  report: ColposcopyReport;
  patient: Patient;
  doctor: DoctorProfile;
}

export function ColposcopyPrintView({
  report,
  patient,
  doctor,
}: ColposcopyPrintViewProps) {
  return (
    <div
      id="colposcopy-print-sheet"
      className="bg-white text-slate-900 p-8 sm:p-10 max-w-[210mm] mx-auto border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:p-0 space-y-5"
    >
      {/* 1. Membrete Institucional CENDO */}
      <div className="border-b-2 border-primary pb-3 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandLogo size="lg" />
          <div>
            <h1 className="text-xl font-heading font-extrabold text-primary tracking-tight">
              CENDO &bull; CENTRO DE ENDOMETRIOSIS
            </h1>
            <p className="text-xs font-semibold text-slate-700">
              Ginecología Especializada &bull; Colposcopía &bull; Cirugía Ginecológica de Alta Precisión
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              {doctor.clinicAddress} &bull; Citas: {doctor.phone}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-xs font-heading font-bold text-slate-800">
            {doctor.doctorTitle} {doctor.fullName}
          </p>
          <p className="text-[11px] text-primary font-semibold">
            {doctor.specialty}
          </p>
          <p className="text-[10px] font-mono font-bold text-slate-600">
            CMP {doctor.cmp} &bull; RNE {doctor.rne}
          </p>
        </div>
      </div>

      {/* 2. Título del Documento e Identificación de Informe */}
      <div className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
        <div>
          <h2 className="text-sm font-heading font-extrabold text-primary uppercase tracking-wide">
            INFORME DE COLPOSCOPÍA ESPECIALIZADA
          </h2>
          <span className="text-[10px] text-slate-500">
            Nomenclatura Internacional IFCPC Río de Janeiro 2011
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-primary bg-white px-2.5 py-0.5 rounded border border-primary/20">
            Informe N°: {report.id}
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Fecha de Emisión: <strong>{report.reportDate}</strong>
          </p>
        </div>
      </div>

      {/* 3. Datos de la Paciente */}
      <div className="p-3.5 rounded-lg border border-slate-200 bg-white grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Apellidos y Nombres</span>
          <strong className="text-slate-900 block mt-0.5 truncate">
            {patient.lastName}, {patient.firstName}
          </strong>
        </div>

        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Documento de Identidad</span>
          <strong className="text-slate-900 font-mono block mt-0.5">
            DNI {patient.dni}
          </strong>
        </div>

        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Edad / Teléfono</span>
          <span className="text-slate-800 block mt-0.5">
            <strong>{patient.age} años</strong> &bull; {patient.phone}
          </span>
        </div>

        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Validez del Examen</span>
          <span
            className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
              report.adequateColposcopy
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            {report.adequateColposcopy ? "Colposcopía Adecuada" : "Colposcopía Inadecuada"}
          </span>
        </div>
      </div>

      {/* 4. Criterios IFCPC Río 2011 y Reloj de Biopsia */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Parámetros Colposcópicos (8 de 12 col) */}
        <div className="md:col-span-8 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Unión Escamocolumnar</span>
              <strong className="text-slate-900 text-xs mt-0.5 block">{report.squamocolumnarJunctionVisible}</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Zona de Transformación</span>
              <strong className="text-slate-900 text-xs mt-0.5 block">{report.transformationZoneType}</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Test de Schiller (Lugol)</span>
              <strong className="text-slate-900 text-xs mt-0.5 block">{report.schillerTest}</strong>
            </div>
          </div>

          {/* Hallazgos Clínicos Detallados */}
          <div className="p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              Evaluación Epitelial y Vascular Observada:
            </span>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              {report.matureSquamousEpithelium && (
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                  ✓ Epitelio escamoso maduro
                </span>
              )}
              {report.ectopy && (
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium">
                  ✓ Ectopia periorificial
                </span>
              )}
              {report.thinAcetowhiteEpithelium && (
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                  ⚠ Epitelio acetoblanco tenue (Grado 1)
                </span>
              )}
              {report.denseAcetowhiteEpithelium && (
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                  ⚠ Epitelio acetoblanco denso (Grado 2)
                </span>
              )}
              {report.irregularBorder && (
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  ⚠ Borde irregular
                </span>
              )}
              {report.fineMosaic && (
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  ⚠ Mosaico fino
                </span>
              )}
              {report.coarseMosaic && (
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                  ⚠ Mosaico grueso
                </span>
              )}
              {report.finePunctation && (
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  ⚠ Punteado fino
                </span>
              )}
              {report.coarsePunctation && (
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                  ⚠ Punteado grueso
                </span>
              )}
              {report.atypicalVessels && (
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 font-bold">
                  ⚠ Vasos atípicos de sospecha
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Reloj Cervical de Biopsia (4 de 12 col) */}
        <div className="md:col-span-4 p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center text-center space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
            Mapeo de Biopsias (Reloj)
          </span>
          <div className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
            <CervicalClock
              selectedHours={report.biopsyClockHours || []}
              interactive={false}
              size="sm"
            />
          </div>
          <span className="text-[10px] font-semibold text-slate-700">
            {report.cervicalBiopsyTaken && (report.biopsyClockHours || []).length > 0
              ? `Biopsia a horas: ${report.biopsyClockHours.map((h) => `${h}:00`).join(", ")}`
              : "Sin toma de biopsia dirigida"}
          </span>
        </div>
      </div>

      {/* 5. Grilla Fotográfica Fija (4 Tomas de Alta Resolución) */}
      <div className="space-y-1.5">
        <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
          Registro Fotográfico Colposcópico Digital (4 Tomas)
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {report.images.slice(0, 4).map((img, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200 overflow-hidden bg-slate-100 space-y-1"
            >
              <div className="aspect-4/3 relative bg-slate-200 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/60 text-white font-mono text-[8px] font-bold">
                  #{idx + 1}
                </span>
              </div>
              <p className="text-[9px] text-slate-700 font-medium px-1.5 pb-1 line-clamp-2 leading-tight">
                {img.caption}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Diagnóstico y Conducta / Recomendaciones */}
      <div className="space-y-2 text-xs">
        <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1">
          <div className="flex items-center justify-between">
            <strong className="text-[10px] uppercase font-bold text-amber-950">
              Diagnóstico Colposcópico Principal:
            </strong>
            {report.cie10Code && (
              <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                CIE-10: {report.cie10Code}
              </span>
            )}
          </div>
          <p className="text-slate-900 font-medium leading-relaxed">
            {report.diagnosis}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
          <strong className="text-[10px] uppercase font-bold text-primary block">
            Plan de Manejo y Conducta Recomendada:
          </strong>
          <p className="text-slate-800 font-medium leading-relaxed">
            {report.planRecommendations}
          </p>
        </div>
      </div>

      {/* 7. Firma y Sello del Médico Evaluador */}
      <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
        <div className="text-[9px] text-slate-400 font-mono space-y-0.5">
          <p>Documento médico legal &bull; CENDO Miraflores</p>
          <p>Generado a través del Sistema Clínico CENDO</p>
        </div>

        <div className="text-center space-y-1 min-w-[220px]">
          <div className="h-10 border-b border-slate-400 flex items-center justify-center">
            <span className="font-serif italic text-primary/70 text-sm select-none">
              Dr. Patrick Jacinto Gomero
            </span>
          </div>
          <p className="font-heading font-bold text-slate-900 text-xs">
            {doctor.doctorTitle} {doctor.fullName}
          </p>
          <p className="text-[10px] text-slate-600 font-mono">
            {doctor.specialty} &bull; CMP {doctor.cmp} &bull; RNE {doctor.rne}
          </p>
        </div>
      </div>
    </div>
  );
}

