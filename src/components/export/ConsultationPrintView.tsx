"use client";

import React from "react";
import { Patient, DoctorProfile, MedicalConsultation } from "@/types/medical";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CendoFooterWave } from "@/components/export/CendoFooterWave";

interface ConsultationPrintViewProps {
  consultation: MedicalConsultation;
  patient: Patient;
  doctor: DoctorProfile;
}

export function ConsultationPrintView({
  consultation,
  patient,
  doctor,
}: ConsultationPrintViewProps) {
  const doctorDisplayName = (consultation.doctorName || doctor.fullName)
    .replace(/^dr\.?\s+/i, "")
    .trim();

  const titlePrefix = doctor.doctorTitle || "Dr.";

  return (
    <div
      id="consultation-print-sheet"
      className="max-w-[210mm] mx-auto text-slate-900 bg-white font-sans text-xs"
    >
      <div className="page-sheet w-[210mm] min-h-[297mm] max-h-[297mm] p-[10mm_14mm_6mm_14mm] flex flex-col justify-between border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:rounded-none overflow-hidden box-border">
        {/* Contenido Superior */}
        <div className="space-y-3.5 flex-1">
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
                HISTORIA CLÍNICA &bull; CONSULTA
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                N° HC-CONS-{consultation.id.slice(0, 8)}
              </p>
              <p className="text-[10px] text-slate-700 font-bold">
                Fecha: {consultation.consultationDate}
              </p>
            </div>
          </div>

          {/* 2. Tarjeta de Filiación de la Paciente */}
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
                Teléfono:
              </span>
              <span className="font-mono text-slate-700">{patient.phone}</span>
            </div>
          </div>

          {/* 3. Anamnesis y Signos Vitales */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Anamnesis */}
            <div className="md:col-span-8 p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
              <h2 className="text-[10px] uppercase font-bold text-primary tracking-wider">
                1. Anamnesis & Motivo de Consulta
              </h2>
              <div>
                <span className="text-[10px] font-bold text-slate-600 block">Motivo:</span>
                <p className="text-xs font-semibold text-slate-900">{consultation.reasonForVisit}</p>
              </div>
              {consultation.illnessTime && (
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block">Tiempo de Enfermedad:</span>
                  <p className="text-xs text-slate-800">{consultation.illnessTime}</p>
                </div>
              )}
              {consultation.symptoms && (
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block">Síntomas Principales:</span>
                  <p className="text-xs text-slate-700">{consultation.symptoms}</p>
                </div>
              )}
            </div>

            {/* Signos Vitales & Medidas Antropométricas */}
            <div className="md:col-span-4 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <h2 className="text-[10px] uppercase font-bold text-primary tracking-wider">
                Signos Vitales
              </h2>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[9px]">P.A.:</span>
                  <strong className="font-mono text-slate-900">{consultation.vitalSigns.bloodPressure || "110/70"} mmHg</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">F.C.:</span>
                  <strong className="font-mono text-slate-900">{consultation.vitalSigns.heartRate || 72} lpm</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">F.R.:</span>
                  <strong className="font-mono text-slate-900">{consultation.vitalSigns.respiratoryRate || 18} rpm</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">SatO2:</span>
                  <strong className="font-mono text-slate-900">{consultation.vitalSigns.oxygenSaturation || 98}%</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">Temp.:</span>
                  <strong className="font-mono text-slate-900">{consultation.vitalSigns.temperature || 36.5} °C</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">Peso / Talla:</span>
                  <strong className="font-mono text-slate-900">{consultation.vitalSigns.weightKg} kg &bull; {consultation.vitalSigns.heightCm} cm</strong>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <span className="text-slate-500 text-[9.5px]">IMC Calculado:</span>{" "}
                  <strong className="font-mono text-primary font-bold">{consultation.vitalSigns.bmi || 22.0} kg/m²</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Examen Físico Ginecológico Estructurado */}
          <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
            <h2 className="text-[10px] uppercase font-bold text-primary tracking-wider border-b border-slate-200 pb-1">
              2. Examen Físico Dirigido
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div>
                <strong className="text-slate-700 block text-[10.5px]">Examen General:</strong>
                <p className="text-slate-800">{consultation.physicalExam.generalExam || "Buen estado general, hemodinámicamente estable."}</p>
              </div>
              <div>
                <strong className="text-slate-700 block text-[10.5px]">Examen de Mamas:</strong>
                <p className="text-slate-800">{consultation.physicalExam.breastsExam || "Mamas simétricas, sin nódulos patológicos palpables."}</p>
              </div>
              <div>
                <strong className="text-slate-700 block text-[10.5px]">Genitales Externos:</strong>
                <p className="text-slate-800">{consultation.physicalExam.externalGenitalia || "Normoconfigurados, sin lesiones."}</p>
              </div>
              <div>
                <strong className="text-slate-700 block text-[10.5px]">Especuloscopía (Vagina & Cérvix):</strong>
                <p className="text-slate-800">{consultation.physicalExam.speculoscopy || "Cérvix epitelizado, sin sangrado activo."}</p>
              </div>
              <div className="md:col-span-2 pt-1 border-t border-slate-100">
                <strong className="text-slate-700 block text-[10.5px]">Tacto Bimanual (Útero & Anexos):</strong>
                <p className="text-slate-800">{consultation.physicalExam.bimanualPalpation || "Útero en AVF, móvil, no doloroso. Anexos libres."}</p>
              </div>
            </div>
          </div>

          {/* 5. Diagnóstico & CIE-10 */}
          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] uppercase font-bold text-emerald-900 tracking-wider">
                3. Impresión Diagnóstica
              </h2>
              {consultation.cie10Code && (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-[10.5px]">
                  CIE-10: {consultation.cie10Code}
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-emerald-950 font-heading">
              {consultation.diagnosis}
            </p>
          </div>

          {/* 6. Plan de Tratamiento & Conducta */}
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h2 className="text-[10px] uppercase font-bold text-primary tracking-wider">
                4. Plan Terapéutico & Recomendaciones
              </h2>
              {consultation.nextAppointmentDate && (
                <span className="text-[11px] font-bold text-primary">
                  Próximo Control: {consultation.nextAppointmentDate}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
              {consultation.treatmentPlan}
            </div>

            {consultation.auxiliaryExams && (
              <div className="pt-2 border-t border-slate-100 text-xs">
                <strong className="text-primary text-[10.5px]">Exámenes Auxiliares Solicitados: </strong>
                <span className="text-slate-800">{consultation.auxiliaryExams}</span>
              </div>
            )}

            {consultation.prescriptionNotes && (
              <div className="pt-1.5 border-t border-slate-100 text-xs">
                <strong className="text-emerald-900 text-[10.5px]">Receta Médica / Prescripción (Rp/): </strong>
                <span className="text-slate-900 font-medium">{consultation.prescriptionNotes}</span>
              </div>
            )}
          </div>
        </div>

        {/* 7. Firma y Pie de Página Institucional */}
        <div className="mt-4 pt-2 border-t border-slate-200">
          <div className="flex items-end justify-between">
            <div className="text-[9.5px] text-slate-500 space-y-0.5">
              <p className="font-semibold text-slate-700">
                CENDO &bull; Centro de Endometriosis y Ginecología Avanzada
              </p>
              <p>Documento médico oficial generado electrónicamente &bull; Validez legal</p>
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
                CMP {consultation.doctorCmp || doctor.cmp} &bull; RNE {consultation.doctorRne || doctor.rne}
              </p>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
                Médico Especialista CENDO
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

