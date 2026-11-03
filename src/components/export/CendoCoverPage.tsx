"use client";

import React from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CendoFooterWave } from "./CendoFooterWave";
import { Patient, DoctorProfile } from "@/types/medical";

interface CendoCoverPageProps {
  patient: Patient;
  doctor: DoctorProfile;
  documentTitle?: string;
}

export function CendoCoverPage({
  patient,
  doctor,
  documentTitle = "CHEQUEO GINECOLÓGICO",
}: CendoCoverPageProps) {
  const patientFullName = `${patient.lastName}, ${patient.firstName}`.toUpperCase();

  // Limpiar título de doctor para evitar "Dr. Dr."
  const cleanDoctorName = doctor.fullName.replace(/^dr\.?\s+/i, "");

  return (
    <div className="page-sheet w-[210mm] h-[297mm] max-h-[297mm] mx-auto bg-white p-[16mm_20mm_12mm_20mm] flex flex-col justify-between border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:rounded-none overflow-hidden box-border">
      {/* 1. Header con Logo CENDO (Solo isotipo, sin duplicar texto) */}
      <div className="flex items-center gap-4 border-b border-primary/20 pb-4">
        <BrandLogo size="lg" showText={false} />
        <div>
          <h1 className="text-xl font-heading font-extrabold text-primary tracking-tight">
            CENDO &bull; CENTRO DE ENDOMETRIOSIS
          </h1>
          <p className="text-xs font-semibold text-slate-700">
            Ginecología Especializada &bull; Cirugía Ginecológica de Alta Precisión
          </p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            {doctor.clinicAddress} &bull; Citas: {doctor.phone}
          </p>
        </div>
      </div>

      {/* 2. Cuerpo Central con Título y Nombre de la Paciente */}
      <div className="my-auto py-12 text-center space-y-4">
        <p className="text-xs font-heading font-bold text-slate-400 uppercase tracking-[0.3em]">
          INFORME CLÍNICO OFICIAL
        </p>

        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-primary tracking-tight">
          {documentTitle}
        </h2>

        {/* Pleca dorada institucional */}
        <div className="w-40 h-1 bg-amber-500 mx-auto rounded-full shadow-2xs" />

        <div className="pt-6 space-y-1">
          <p className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-wide">
            {patientFullName}
          </p>
          <p className="text-xs text-slate-500 font-mono">
            DNI: <strong className="text-slate-800">{patient.dni}</strong> &bull; Sede Miraflores
          </p>
        </div>
      </div>

      {/* 3. Firma Inferior y Cenefa Ondulada */}
      <div className="space-y-4 shrink-0">
        <div className="text-right pr-2 space-y-0.5">
          <p className="font-heading font-extrabold text-xs text-slate-900 tracking-wider">
            DR. {cleanDoctorName.toUpperCase()}
          </p>
          <p className="text-[11px] font-semibold text-primary uppercase tracking-wide">
            {doctor.specialty.toUpperCase()}
          </p>
          <p className="text-[10px] font-mono text-slate-500 font-bold">
            CMP {doctor.cmp} &bull; RNE {doctor.rne}
          </p>
        </div>

        {/* Cenefa Ondulada Oficial de CENDO */}
        <CendoFooterWave
          address={doctor.clinicAddress}
          email={doctor.contactEmail}
          phone={doctor.phone}
        />
      </div>
    </div>
  );
}

