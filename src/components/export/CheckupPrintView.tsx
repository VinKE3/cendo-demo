"use client";

import React from "react";
import { ClinicalCheckup, Patient, DoctorProfile } from "@/types/medical";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CendoFooterWave } from "./CendoFooterWave";

interface CheckupPrintViewProps {
  checkup: ClinicalCheckup;
  patient: Patient;
  doctor: DoctorProfile;
}

export function CheckupPrintView({
  checkup,
  patient,
  doctor,
}: CheckupPrintViewProps) {
  return (
    <div
      id="checkup-print-sheet"
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
              Ginecología Especializada &bull; Ecografía Pélvica Doppler &bull; Ecografía Mamaria
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
            INFORME DE CHEQUEO GINECOLÓGICO INTEGRAL Y ECOGRAFÍAS
          </h2>
          <span className="text-[10px] text-slate-500">
            Ecografía Mamaria Bilateral &bull; Ecografía Transvaginal Doppler Pélvica
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-primary bg-white px-2.5 py-0.5 rounded border border-primary/20">
            Informe N°: {checkup.id}
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Fecha de Atención: <strong>{checkup.checkupDate}</strong>
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
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Motivo de Consulta</span>
          <span className="text-slate-800 block mt-0.5 font-medium truncate">
            {checkup.reasonForConsultation}
          </span>
        </div>
      </div>

      {/* 4. Sección Ecográfica Mamaria y Transvaginal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Ecografía Mamaria Bilateral */}
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wide">
              1. Ecografía Mamaria Bilateral
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              {checkup.breastUltrasoundBirads}
            </span>
          </div>

          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Hallazgos Ecográficos:</span>
            <p className="text-slate-800 leading-relaxed mt-0.5 bg-white p-2 rounded border border-slate-200 text-[11px]">
              {checkup.breastUltrasoundFindings}
            </p>
          </div>

          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Medición de Lesiones:</span>
            <p className="text-slate-900 font-medium mt-0.5">
              {checkup.breastLesionMeasurements}
            </p>
          </div>
        </div>

        {/* Ecografía Transvaginal Doppler Pélvica */}
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wide">
              2. Ecografía Transvaginal Doppler
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-primary border border-primary/20">
              Endometrio: {checkup.endometriumThicknessMm} mm
            </span>
          </div>

          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Hallazgos Miometriales & Uterinos:</span>
            <p className="text-slate-800 leading-relaxed mt-0.5 bg-white p-2 rounded border border-slate-200 text-[11px]">
              {checkup.transvaginalUltrasoundFindings}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-1.5 rounded bg-white border border-slate-200">
              <span className="text-[9px] text-slate-500 block uppercase font-bold">Medidas Útero</span>
              <strong className="text-slate-900">{checkup.uterusMeasurements}</strong>
            </div>
            <div className="p-1.5 rounded bg-white border border-slate-200">
              <span className="text-[9px] text-slate-500 block uppercase font-bold">Grosor Endometrial</span>
              <strong className="text-slate-900">{checkup.endometriumThicknessMm} mm</strong>
            </div>
          </div>

          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Ovarios y Anexos:</span>
            <p className="text-slate-800 mt-0.5 font-medium">
              {checkup.ovariesFindings}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Tamizaje Cervical Complementario */}
      <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1 text-xs">
        <h4 className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
          Tamizaje Citológico & Molecular Asociado
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <span className="text-[9px] uppercase text-slate-500 font-bold block">Papanicolaou (PAP)</span>
            <strong className="text-slate-900 block mt-0.5">{checkup.papResult}</strong>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <span className="text-[9px] uppercase text-slate-500 font-bold block">Test Molecular VPH PCR</span>
            <strong className="text-slate-900 block mt-0.5">{checkup.vphResult}</strong>
          </div>
        </div>
      </div>

      {/* 6. Conclusiones y Plan Terapéutico / Receta */}
      <div className="space-y-2 text-xs">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
          <strong className="text-[10px] uppercase font-bold text-primary block">
            Conclusiones Diagnósticas:
          </strong>
          <p className="text-slate-900 font-medium leading-relaxed">
            {checkup.conclusions}
          </p>
        </div>

        {checkup.medicalPrescription && (
          <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 space-y-1">
            <strong className="text-[10px] uppercase font-bold text-indigo-950 block">
              Plan Terapéutico y Prescripción Médica (Receta):
            </strong>
            <p className="text-indigo-950 whitespace-pre-line leading-relaxed font-medium bg-white/80 p-2.5 rounded border border-indigo-100">
              {checkup.medicalPrescription}
            </p>
          </div>
        )}
      </div>

      {/* 7. Firma y Sello Médico */}
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

      {/* 8. Cenefa Oficial Ondulada CENDO */}
      <CendoFooterWave
        address={doctor.clinicAddress}
        email={doctor.contactEmail}
        phone={doctor.phone}
      />
    </div>
  );
}

