"use client";

import React from "react";
import { Patient, DoctorProfile, MinorProcedureReport } from "@/types/medical";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CendoFooterWave } from "@/components/export/CendoFooterWave";

interface MinorProcedurePrintViewProps {
  procedure: MinorProcedureReport;
  patient: Patient;
  doctor: DoctorProfile;
}

export function MinorProcedurePrintView({
  procedure,
  patient,
  doctor,
}: MinorProcedurePrintViewProps) {
  const doctorDisplayName = (procedure.doctorName || doctor.fullName)
    .replace(/^dr\.?\s+/i, "")
    .trim();

  const titlePrefix = doctor.doctorTitle || "Dr.";
  const det = procedure.procedureDetails;

  return (
    <div
      id="procedure-print-sheet"
      className="max-w-[210mm] mx-auto text-slate-900 bg-white font-sans text-xs"
    >
      <div className="page-sheet w-[210mm] min-h-[297mm] max-h-[297mm] p-[10mm_14mm_6mm_14mm] flex flex-col justify-between border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:rounded-none overflow-hidden box-border">
        {/* Contenido */}
        <div className="space-y-3.5 flex-1">
          {/* Membrete CENDO */}
          <div className="border-b-2 border-primary pb-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandLogo size="lg" showText={false} />
              <div>
                <h1 className="text-xl font-heading font-extrabold text-primary tracking-tight">
                  CENDO &bull; CENTRO DE ENDOMETRIOSIS
                </h1>
                <p className="text-[11px] font-semibold text-slate-700">
                  Cirugía Ambulatoria &bull; Patología Cervical &bull; Procedimientos de Consultorio
                </p>
                <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                  {doctor.clinicAddress} &bull; Citas: {doctor.phone}
                </p>
              </div>
            </div>

            <div className="text-right border-l border-slate-200 pl-4 shrink-0">
              <div className="inline-block px-2.5 py-1 rounded-md bg-accent-soft text-primary font-heading font-extrabold text-xs tracking-wider uppercase border border-primary/20">
                PROTOCOLO QUIRÚRGICO MENOR
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                N° PROC-{procedure.id.slice(0, 8)}
              </p>
              <p className="text-[10px] text-slate-700 font-bold">
                Fecha: {procedure.procedureDate}
              </p>
            </div>
          </div>

          {/* Tarjeta de Paciente */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            <div className="md:col-span-5">
              <span className="text-[9.5px] uppercase font-bold text-slate-500 block">
                Paciente:
              </span>
              <strong className="text-sm font-heading font-bold text-slate-900">
                {patient.lastName}, {patient.firstName}
              </strong>
            </div>

            <div className="md:col-span-2">
              <span className="text-[9.5px] uppercase font-bold text-slate-500 block">
                DNI:
              </span>
              <span className="font-mono font-bold text-slate-900">{patient.dni}</span>
            </div>

            <div className="md:col-span-2">
              <span className="text-[9.5px] uppercase font-bold text-slate-500 block">
                Edad:
              </span>
              <span className="font-semibold text-slate-800">{patient.age} años</span>
            </div>

            <div className="md:col-span-3">
              <span className="text-[9.5px] uppercase font-bold text-slate-500 block">
                Procedimiento:
              </span>
              <strong className="text-primary text-[11px] block font-mono">
                {procedure.procedureType.replace(/_/g, " ")}
              </strong>
            </div>
          </div>

          {/* Diagnósticos Pre y Post */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Diagnóstico Preoperatorio:
              </span>
              <p className="font-semibold text-slate-900 text-xs mt-0.5">
                {procedure.preOpDiagnosis}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                  Diagnóstico Postoperatorio:
                </span>
                {procedure.cie10Code && (
                  <span className="font-mono text-[10px] font-bold text-emerald-800">
                    CIE-10: {procedure.cie10Code}
                  </span>
                )}
              </div>
              <p className="font-bold text-emerald-950 text-xs mt-0.5">
                {procedure.postOpDiagnosis}
              </p>
            </div>
          </div>

          {/* Protocolo Quirúrgico y Asepsia */}
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2">
            <h2 className="text-[10px] uppercase font-bold text-primary tracking-wider border-b border-slate-200 pb-1">
              Descripción de la Técnica Quirúrgica
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block">Anestesia Empleada:</span>
                <strong className="font-mono text-slate-900">{procedure.anesthesiaType}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Sangrado Operatorio:</span>
                <strong className="font-mono text-slate-900">{det.bleedingAmount}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Método de Hemostasia:</span>
                <strong className="font-mono text-slate-900">{det.hemostasisMethod}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Envío a Patología:</span>
                <strong className="font-mono text-slate-900">{det.specimenSentToPathology ? "Sí (Remitido)" : "No requerido"}</strong>
              </div>
            </div>

            <div className="space-y-1.5 text-xs pt-1">
              <div>
                <strong className="text-slate-700 block text-[11px]">Técnica de Asepsia & Antisepsia:</strong>
                <p className="text-slate-800 leading-snug">{det.asepsisTechnique}</p>
              </div>

              {det.biopsySites && (
                <div>
                  <strong className="text-slate-700 block text-[11px]">Sitio anatómico de toma de muestra:</strong>
                  <p className="text-slate-800">{det.biopsySites}</p>
                </div>
              )}

              {det.specimenDescription && (
                <div className="p-2 rounded bg-amber-50/70 border border-amber-200">
                  <strong className="text-amber-950 block text-[11px]">Rotulación y Descripción de Muestra:</strong>
                  <p className="text-amber-900">{det.specimenDescription}</p>
                </div>
              )}

              <div>
                <strong className="text-slate-700 block text-[11px]">Complicaciones Intraoperatorias:</strong>
                <p className="text-slate-800">{det.complications || "Ninguna. Procedimiento tolerado sin eventualidades."}</p>
              </div>
            </div>
          </div>

          {/* Cuidados e Indicaciones Post-Procedimiento */}
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h2 className="text-[10px] uppercase font-bold text-primary tracking-wider">
                Cuidados e Indicaciones Post-Procedimiento
              </h2>
              {procedure.nextControlDate && (
                <span className="text-[11px] font-bold text-primary">
                  Control en Consultorio: {procedure.nextControlDate}
                </span>
              )}
            </div>

            <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
              {procedure.postOpIndications}
            </div>

            {procedure.medicationsPrescribed && (
              <div className="pt-2 border-t border-slate-100 text-xs">
                <strong className="text-slate-900">Medicación Farmacológica Prescrita: </strong>
                <span className="text-slate-800">{procedure.medicationsPrescribed}</span>
              </div>
            )}
          </div>
        </div>

        {/* Firma Oficial */}
        <div className="mt-4 pt-2 border-t border-slate-200">
          <div className="flex items-end justify-between">
            <div className="text-[9.5px] text-slate-500 space-y-0.5">
              <p className="font-semibold text-slate-700">
                CENDO &bull; Centro de Endometriosis y Cirugía Ginecológica
              </p>
              <p>Protocolo Operatorio Registrado Electrónicamente con Firma Digital</p>
              <p className="font-mono">Miraflores, Lima - Perú</p>
            </div>

            <div className="text-center w-64 border-t border-slate-400 pt-2 shrink-0">
              <p className="text-xs font-heading font-extrabold text-slate-900">
                {titlePrefix} {doctorDisplayName}
              </p>
              <p className="text-[10px] font-semibold text-slate-700">
                {doctor.specialty}
              </p>
              <p className="text-[9.5px] font-mono font-bold text-slate-600">
                CMP {procedure.doctorCmp || doctor.cmp} &bull; RNE {procedure.doctorRne || doctor.rne}
              </p>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
                Cirujano Ginecólogo Especialista
              </p>
            </div>
          </div>

          <div className="mt-2">
            <CendoFooterWave />
          </div>
        </div>
      </div>
    </div>
  );
}

