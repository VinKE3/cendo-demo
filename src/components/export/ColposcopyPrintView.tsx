"use client";

import React from "react";
import { ColposcopyReport, Patient, DoctorProfile } from "@/types/medical";
import { CervicalClock } from "@/components/colposcopia/CervicalClock";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CendoFooterWave } from "./CendoFooterWave";

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
      className="max-w-[210mm] mx-auto text-slate-900 bg-white font-sans text-xs space-y-8 print:space-y-0"
    >
      {/* =========================================================================
          PÁGINA 1: Criterios IFCPC, Hallazgos Normales & Anormales (Pág. 9 en Dossier)
          ========================================================================= */}
      <div className="p-8 sm:p-10 border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:p-0 min-h-[297mm] flex flex-col justify-between print:break-after-page space-y-4">
        <div className="space-y-4">
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
                {doctor.doctorTitle} {report.doctorName || doctor.fullName}
              </p>
              <p className="text-[11px] text-primary font-semibold">
                {doctor.specialty}
              </p>
              <p className="text-[10px] font-mono font-bold text-slate-600">
                CMP {doctor.cmp} &bull; RNE {doctor.rne}
              </p>
            </div>
          </div>

          {/* 2. Título de Página 1 */}
          <div className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <div>
              <h2 className="text-sm font-heading font-extrabold text-primary uppercase tracking-wide">
                INFORME DE COLPOSCOPÍA ESPECIALIZADA (PÁGINA 1 / 2)
              </h2>
              <span className="text-[10px] text-slate-500">
                Nomenclatura Internacional IFCPC Río de Janeiro 2011 &bull; CENDO Miraflores
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-primary bg-white px-2 py-0.5 rounded border border-primary/20">
                N°: {report.id}
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Fecha: <strong>{report.reportDate}</strong>
              </p>
            </div>
          </div>

          {/* 3. Datos de Filiación de la Paciente */}
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

          {/* 4. Sección I: Criterios IFCPC de Evaluación General */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200">
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-700">
                I. Criterios de Evaluación General (IFCPC Río de Janeiro 2011)
              </span>
            </div>
            <div className="p-3 grid grid-cols-3 gap-3">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Adecuación del Examen:</span>
                <strong className="text-slate-900 text-xs mt-0.5 block">
                  {report.adequateColposcopy ? "Adecuada" : `Inadecuada (${report.inadequateReason || "No especificado"})`}
                </strong>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Unión Escamocolumnar (UEC):</span>
                <strong className="text-slate-900 text-xs mt-0.5 block">
                  {report.squamocolumnarJunctionVisible}
                </strong>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Zona de Transformación:</span>
                <strong className="text-slate-900 text-xs mt-0.5 block">
                  {report.transformationZoneType}
                </strong>
              </div>
            </div>
          </div>

          {/* 5. Sección II: Hallazgos Normales (Cols 22-26 de Excel) */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200">
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-700">
                II. Hallazgos Colposcópicos Normales
              </span>
            </div>
            <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${report.matureSquamousEpithelium ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-300 text-transparent"}`}>✓</span>
                <span>Epitelio Escamoso Maduro</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${report.ectopy ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-300 text-transparent"}`}>✓</span>
                <span>Epitelio Columnar / Ectopia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${report.nabothCyst ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-300 text-transparent"}`}>✓</span>
                <span>Quistes de Naboth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${report.cryptOpenings ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-300 text-transparent"}`}>✓</span>
                <span>Criptas Glandulares</span>
              </div>
            </div>
          </div>

          {/* 6. Sección III: Hallazgos Anormales (Grado 1, Grado 2, Schiller) */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200">
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-700">
                III. Hallazgos Colposcópicos Anormales & Test de Schiller
              </span>
            </div>
            <div className="p-3 space-y-3">
              {/* Grado 1 */}
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                  Grado 1 (Menor):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${report.thinAcetowhiteEpithelium ? "bg-amber-600 text-white border-amber-600" : "border-slate-300 text-transparent"}`}>✓</span>
                    <span>Acetoblanco tenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${report.irregularBorder ? "bg-amber-600 text-white border-amber-600" : "border-slate-300 text-transparent"}`}>✓</span>
                    <span>Borde irregular</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${report.fineMosaic ? "bg-amber-600 text-white border-amber-600" : "border-slate-300 text-transparent"}`}>✓</span>
                    <span>Mosaico fino</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${report.finePunctation ? "bg-amber-600 text-white border-amber-600" : "border-slate-300 text-transparent"}`}>✓</span>
                    <span>Punteado fino</span>
                  </div>
                </div>
              </div>

              {/* Grado 2 */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-red-800 uppercase block mb-1">
                  Grado 2 (Mayor):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${report.denseAcetowhiteEpithelium ? "bg-red-600 text-white border-red-600" : "border-slate-300 text-transparent"}`}>✓</span>
                    <span>Acetoblanco denso</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${report.rapidAcetowhite ? "bg-red-600 text-white border-red-600" : "border-slate-300 text-transparent"}`}>✓</span>
                    <span>Aparición rápida</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${report.coarseMosaic ? "bg-red-600 text-white border-red-600" : "border-slate-300 text-transparent"}`}>✓</span>
                    <span>Mosaico grueso</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${report.coarsePunctation ? "bg-red-600 text-white border-red-600" : "border-slate-300 text-transparent"}`}>✓</span>
                    <span>Punteado grueso</span>
                  </div>
                </div>
              </div>

              {/* Lugol / Schiller */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700">Test de Schiller (Solución de Lugol):</span>
                <span className="px-2.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-900 border border-slate-200">
                  {report.schillerTest}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cenefa de pie de Página 1 */}
        <div className="pt-4">
          <p className="text-[9px] text-slate-400 font-mono text-center mb-1">
            Continúa en Página 2: Sospecha de Invasión, Reloj de Biopsias, Diagnóstico y Tomas Fotográficas
          </p>
          <CendoFooterWave
            address={doctor.clinicAddress}
            email={doctor.contactEmail}
            phone={doctor.phone}
          />
        </div>
      </div>

      {/* =========================================================================
          PÁGINA 2: Reloj de Biopsias, Diagnóstico, 4 Fotos & Firma (Pág. 10 en Dossier)
          ========================================================================= */}
      <div className="p-8 sm:p-10 border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:p-0 min-h-[297mm] flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          {/* Header de Continuación */}
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" />
              <span className="text-xs font-heading font-extrabold text-primary">
                CENDO &bull; INFORME DE COLPOSCOPÍA (PÁGINA 2 / 2)
              </span>
            </div>
            <div className="text-right text-[10px] text-slate-600">
              Paciente: <strong>{patient.lastName}, {patient.firstName}</strong> (DNI {patient.dni})
            </div>
          </div>

          {/* Bloque: Biopsia Dirigida + Reloj Cervical + Diagnóstico Principal */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Diagnóstico Colposcópico (8 cols) */}
            <div className="md:col-span-8 space-y-3">
              <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-[11px] uppercase font-bold text-amber-950">
                    Diagnóstico Colposcópico Conclusivo:
                  </strong>
                  {report.cie10Code && (
                    <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                      CIE-10: {report.cie10Code}
                    </span>
                  )}
                </div>
                <p className="text-slate-900 font-semibold leading-relaxed text-xs">
                  {report.diagnosis}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-[10px] uppercase font-bold text-primary block">
                  Plan de Manejo y Conducta Recomendada:
                </strong>
                <p className="text-slate-800 font-medium leading-relaxed text-xs">
                  {report.planRecommendations}
                </p>
              </div>
            </div>

            {/* Reloj Cervical de Biopsia (4 cols) */}
            <div className="md:col-span-4 p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                Mapeo de Biopsia (Reloj)
              </span>
              <div className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                <CervicalClock
                  selectedHours={report.biopsyClockHours || []}
                  interactive={false}
                  size="sm"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-800">
                {report.cervicalBiopsyTaken && (report.biopsyClockHours || []).length > 0
                  ? `Biopsia a horas: ${report.biopsyClockHours.map((h) => `${h}:00`).join(", ")}`
                  : "Sin toma de biopsia dirigida"}
              </span>
            </div>
          </div>

          {/* Grilla Fotográfica Fija (4 Tomas de Alta Resolución) */}
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Registro Fotográfico Colposcópico Digital (4 Tomas)
            </h3>
            <div className="grid grid-cols-4 gap-2.5">
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

          {/* Firma y Sello del Médico Evaluador */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
            <div className="text-[9px] text-slate-400 font-mono space-y-0.5">
              <p>Documento médico legal &bull; CENDO Miraflores</p>
              <p>Generado a través del Sistema Clínico CENDO</p>
            </div>

            <div className="text-center space-y-1 min-w-[240px]">
              <div className="h-10 border-b border-slate-400 flex items-center justify-center">
                <span className="font-serif italic text-primary/70 text-sm select-none">
                  {report.doctorName || "Dr. Patrick Jacinto Gomero"}
                </span>
              </div>
              <p className="font-heading font-bold text-slate-900 text-xs">
                {doctor.doctorTitle} {report.doctorName || doctor.fullName}
              </p>
              <p className="text-[10px] text-slate-600 font-mono">
                {doctor.specialty} &bull; CMP {doctor.cmp} &bull; RNE {doctor.rne}
              </p>
            </div>
          </div>
        </div>

        {/* Cenefa Oficial Ondulada CENDO al pie de Página 2 */}
        <div className="pt-2">
          <CendoFooterWave
            address={doctor.clinicAddress}
            email={doctor.contactEmail}
            phone={doctor.phone}
          />
        </div>
      </div>
    </div>
  );
}
