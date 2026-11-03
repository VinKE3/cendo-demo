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

  return (
    <div className="min-h-[280mm] max-w-[210mm] mx-auto bg-white p-8 sm:p-12 flex flex-col justify-between border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:p-0 print:min-h-screen page-break-after">
      {/* 1. Header con Logo CENDO */}
      <div className="flex items-center gap-3">
        <BrandLogo size="xl" />
        <div>
          <h1 className="text-xl font-heading font-extrabold text-primary tracking-tight">
            CENDO &bull; CENTRO DE ENDOMETRIOSIS
          </h1>
          <p className="text-xs font-semibold text-slate-700">
            Ginecología Especializada &bull; Cirugía de Alta Precisión
          </p>
        </div>
      </div>

      {/* 2. Cuerpo Central con Título y Nombre de la Paciente */}
      <div className="my-auto py-16 text-center space-y-4">
        <p className="text-sm font-heading font-bold text-slate-500 uppercase tracking-[0.25em]">
          INFORME
        </p>

        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-primary tracking-tight">
          {documentTitle}
        </h2>

        {/* Pleca dorada institucional */}
        <div className="w-48 h-1 bg-amber-500 mx-auto rounded-full shadow-2xs" />

        <div className="pt-6">
          <p className="text-lg sm:text-xl font-heading font-bold text-slate-800 tracking-wide">
            {patientFullName}
          </p>
          <p className="text-xs text-muted font-mono mt-1">
            DNI: {patient.dni} &bull; Sede Miraflores
          </p>
        </div>
      </div>

      {/* 3. Firma Inferior y Cenefa Ondulada */}
      <div className="space-y-6">
        <div className="text-right pr-4 space-y-0.5">
          <p className="font-heading font-extrabold text-xs text-slate-900 tracking-wider">
            {doctor.doctorTitle} {doctor.fullName.toUpperCase()}
          </p>
          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
            {doctor.specialty.toUpperCase()}
          </p>
          <p className="text-[10px] font-mono text-slate-500">
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

