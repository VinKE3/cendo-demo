"use client";

import React from "react";
import { Patient, DoctorProfile, MedicalPrescription } from "@/types/medical";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CendoFooterWave } from "@/components/export/CendoFooterWave";
import { Stethoscope, Calendar, User, FileText, Pill } from "lucide-react";

interface PrescriptionPrintViewProps {
  prescription: MedicalPrescription;
  patient: Patient;
  doctor: DoctorProfile;
}

export function PrescriptionPrintView({
  prescription,
  patient,
  doctor,
}: PrescriptionPrintViewProps) {
  const doctorDisplayName = (prescription.doctorName || doctor.fullName)
    .replace(/^dr\.?\s+/i, "")
    .trim();

  const titlePrefix = doctor.doctorTitle || "Dr.";

  return (
    <div
      id="prescription-print-sheet"
      className="max-w-[210mm] mx-auto text-slate-900 bg-white font-sans text-xs"
    >
      <div className="page-sheet w-[210mm] min-h-[297mm] max-h-[297mm] p-[10mm_14mm_6mm_14mm] flex flex-col justify-between border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:rounded-none overflow-hidden box-border">
        {/* Contenido Superior */}
        <div className="space-y-4 flex-1">
          {/* 1. Membrete Institucional CENDO */}
          <div className="border-b-2 border-primary pb-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandLogo size="lg" showText={false} />
              <div>
                <h1 className="text-xl font-heading font-extrabold text-primary tracking-tight">
                  CENDO &bull; CENTRO DE ENDOMETRIOSIS
                </h1>
                <p className="text-[11px] font-semibold text-slate-700">
                  Ginecología Especializada &bull; Cirugía Laparoscópica &bull; Patología Cervical
                </p>
                <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                  {doctor.clinicAddress} &bull; Citas: {doctor.phone}
                </p>
              </div>
            </div>

            <div className="text-right border-l border-slate-200 pl-4 shrink-0">
              <div className="inline-block px-2.5 py-1 rounded-md bg-accent-soft text-primary font-heading font-extrabold text-xs tracking-wider uppercase border border-primary/20">
                RECETA MÉDICA
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                N° REC-{prescription.id.replace("rec-", "").slice(0, 8)}
              </p>
              <p className="text-[10px] text-slate-700 font-bold">
                Fecha: {prescription.prescriptionDate}
              </p>
            </div>
          </div>

          {/* 2. Tarjeta de Filiación de la Paciente */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            <div className="md:col-span-6">
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

            <div className="md:col-span-2">
              <span className="text-[9.5px] uppercase font-bold text-slate-500 block">
                Teléfono:
              </span>
              <span className="font-mono text-slate-700">{patient.phone}</span>
            </div>

            {prescription.diagnosis && (
              <div className="md:col-span-12 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <div>
                  <strong className="text-slate-700">Diagnóstico Conclusivo: </strong>
                  <span className="text-slate-900 font-medium">{prescription.diagnosis}</span>
                </div>
                {prescription.cie10Code && (
                  <span className="font-mono text-[9.5px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    CIE-10: {prescription.cie10Code}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 3. Cuerpo de la Prescripción Médica (RP/) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 border-b border-primary/30 pb-1">
              <span className="font-serif italic font-extrabold text-2xl text-primary select-none">
                Rp/
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Tratamiento Farmacológico Prescrito
              </span>
            </div>

            <div className="space-y-3">
              {prescription.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-slate-200/90 bg-white shadow-2xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-primary text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <strong className="text-sm font-heading font-extrabold text-slate-900">
                        {item.medicationName}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700 border border-slate-200">
                        {item.presentation}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-accent-soft text-primary font-bold">
                        {item.route}
                      </span>
                    </div>
                  </div>

                  <div className="pl-7 space-y-0.5 text-xs text-slate-800 leading-snug">
                    <p>
                      <strong>Posología / Dosis:</strong> {item.dosage} &bull;{" "}
                      <strong>Frecuencia:</strong> {item.frequency} &bull;{" "}
                      <strong>Duración:</strong> {item.duration}
                    </p>
                    {item.instructions && (
                      <p className="text-[11px] text-slate-600 italic">
                        <strong>Indicación especial:</strong> {item.instructions}
                      </p>
                    )}
                    {item.quantity && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        Cantidad a despachar en farmacia: <strong>{item.quantity}</strong>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Indicaciones Generales y Cuidados Médicos */}
          {prescription.generalIndications && (
            <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200 space-y-1">
              <strong className="text-[10px] uppercase font-bold text-indigo-950 block">
                Indicaciones Generales, Dieta y Cuidados Clínicos:
              </strong>
              <p className="text-indigo-950 whitespace-pre-line leading-relaxed text-xs">
                {prescription.generalIndications}
              </p>
            </div>
          )}

          {/* 5. Próxima Cita de Control */}
          {prescription.nextAppointmentDate && (
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs text-amber-950">
              <span className="font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                Próxima Cita de Control Ginecológico:
              </span>
              <strong className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-amber-300">
                {prescription.nextAppointmentDate}
              </strong>
            </div>
          )}

          {/* 6. Firma y Sello Médico Oficial */}
          <div className="pt-4 border-t border-slate-200 flex items-end justify-between text-xs">
            <div className="text-[8.5px] text-slate-400 font-mono space-y-0.5 max-w-sm">
              <p>Documento médico legal &bull; Válido para dispensación en farmacia</p>
              <p>Ley General de Salud N° 26842 &bull; Sistema Clínico CENDO Miraflores</p>
            </div>

            <div className="text-center space-y-0.5 min-w-[240px]">
              <div className="h-10 border-b border-slate-400 flex items-center justify-center">
                <span className="font-serif italic text-primary/80 text-base select-none">
                  {titlePrefix} {doctorDisplayName}
                </span>
              </div>
              <p className="font-heading font-extrabold text-slate-900 text-xs">
                {titlePrefix.toUpperCase()} {doctorDisplayName.toUpperCase()}
              </p>
              <p className="text-[9.5px] text-slate-600 font-mono">
                {doctor.specialty}
              </p>
              <p className="text-[9.5px] text-slate-700 font-mono font-bold">
                CMP {prescription.doctorCmp || doctor.cmp} &bull; RNE {prescription.doctorRne || doctor.rne}
              </p>
            </div>
          </div>
        </div>

        {/* Cenefa Oficial Ondulada CENDO al pie */}
        <div className="shrink-0 pt-2">
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
