"use client";

import React from "react";
import { Patient, DoctorProfile, LabOrder } from "@/types/medical";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CendoFooterWave } from "@/components/export/CendoFooterWave";
import { FlaskConical, AlertCircle, Info, Calendar, User, Microscope, FileCheck } from "lucide-react";

interface LabOrderPrintViewProps {
  labOrder: LabOrder;
  patient: Patient;
  doctor: DoctorProfile;
}

export function LabOrderPrintView({
  labOrder,
  patient,
  doctor,
}: LabOrderPrintViewProps) {
  const doctorDisplayName = (labOrder.doctorName || doctor.fullName)
    .replace(/^dr\.?\s+/i, "")
    .trim();

  const titlePrefix = doctor.doctorTitle || "Dr.";

  return (
    <div
      id="lab-order-print-sheet"
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
              <div
                className={`inline-block px-2.5 py-1 rounded-md font-heading font-extrabold text-xs tracking-wider uppercase border ${
                  labOrder.templateType && labOrder.templateType !== "GENERAL"
                    ? "bg-purple-50 text-purple-900 border-purple-300"
                    : "bg-teal-50 text-primary border-primary/20"
                }`}
              >
                {labOrder.templateType && labOrder.templateType !== "GENERAL"
                  ? labOrder.templateTitle
                    ? labOrder.templateTitle.split("(")[0].trim().toUpperCase()
                    : "REMISIÓN A PATOLOGÍA"
                  : "ORDEN DE LABORATORIO"}
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                N° LAB-{labOrder.id.replace("lab-", "").slice(0, 8)}
              </p>
              <p className="text-[10px] text-slate-700 font-bold">
                Fecha: {labOrder.orderDate}
              </p>
              <span
                className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-bold uppercase font-mono ${
                  labOrder.urgency === "Urgente"
                    ? "bg-red-100 text-red-800 border border-red-300"
                    : labOrder.urgency === "Prioritario"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                Prioridad: {labOrder.urgency}
              </span>
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

            {labOrder.diagnosis && (
              <div className="md:col-span-12 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <div>
                  <strong className="text-slate-700">Diagnóstico Presuntivo / Indicación: </strong>
                  <span className="text-slate-900 font-medium">{labOrder.diagnosis}</span>
                </div>
                {labOrder.cie10Code && (
                  <span className="font-mono font-bold text-[9.5px] bg-slate-200/80 px-2 py-0.5 rounded text-slate-800">
                    CIE-10: {labOrder.cie10Code}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 2.5 Datos Especializados de la Muestra & Remisión a Patología / Citología */}
          {labOrder.specimenDetails && labOrder.templateType !== "GENERAL" && (
            <div className="p-3 rounded-lg bg-purple-50/60 border border-purple-200 text-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-purple-200 pb-1">
                <span className="font-heading font-extrabold text-[10.5px] text-purple-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Microscope className="w-3.5 h-3.5 text-purple-700" /> Remisión de Muestra & Estudio Patológico / Citológico
                </span>
                <span className="font-mono text-[9px] text-purple-800 font-bold px-1.5 py-0.5 rounded bg-purple-100">
                  {labOrder.templateTitle || labOrder.templateType}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10.5px]">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Sitio Anatómico / Toma:</span>
                  <span className="font-semibold text-slate-900">{labOrder.specimenDetails.anatomicalSite || "No especificado"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Fijador / Medio:</span>
                  <span className="font-mono text-slate-800">{labOrder.specimenDetails.fixative || "Formol tamponado 10%"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">N° Frascos:</span>
                  <span className="font-bold text-slate-900">{labOrder.specimenDetails.containerCount || 1} frasco(s)</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Aspecto Macroscópico:</span>
                  <span className="text-slate-800">{labOrder.specimenDetails.cervixAspect || "Sin particularidades"}</span>
                </div>
              </div>

              {/* Correlación Gineco-Obstétrica */}
              {(labOrder.specimenDetails.fur || labOrder.specimenDetails.parity || labOrder.specimenDetails.mac) && (
                <div className="pt-1.5 border-t border-purple-200 grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <strong className="text-slate-600">FUR: </strong>
                    <span className="font-mono font-semibold text-slate-900">{labOrder.specimenDetails.fur || "—"}</span>
                  </div>
                  <div>
                    <strong className="text-slate-600">Fórmula Obstétrica: </strong>
                    <span className="font-mono font-semibold text-slate-900">{labOrder.specimenDetails.parity || "—"}</span>
                  </div>
                  <div>
                    <strong className="text-slate-600">Método MAC: </strong>
                    <span className="font-semibold text-slate-900">{labOrder.specimenDetails.mac || "—"}</span>
                  </div>
                </div>
              )}

              {labOrder.specimenDetails.clinicalObservations && (
                <div className="pt-1 border-t border-purple-200 text-[10px]">
                  <strong className="text-slate-600">Observaciones para el Patólogo: </strong>
                  <span className="text-slate-800 italic">{labOrder.specimenDetails.clinicalObservations}</span>
                </div>
              )}
            </div>
          )}

          {/* 3. Tabla de Análisis Solicitados */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-slate-800">
                  Exámenes de Laboratorio Solicitados ({labOrder.items.length})
                </span>
              </div>
              <span className="text-[9.5px] text-slate-500 font-mono">
                Laboratorio Clínico / Patología Quirúrgica
              </span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2 px-3 w-10 text-center">#</th>
                  <th className="py-2 px-3">Análisis Clínico</th>
                  <th className="py-2 px-3 w-48">Tipo de Muestra</th>
                  <th className="py-2 px-3 w-56">Indicación Específica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {labOrder.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 text-center font-mono text-[11px] font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span>{item.testName}</span>
                      </div>
                      <span className="text-[9.5px] text-slate-500 font-normal block pl-3">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-700 font-mono text-[10.5px]">
                      {item.sampleType || "Sangre venosa"}
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[10.5px] italic">
                      {item.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Exámenes Adicionales / Complementarios si existen */}
          {labOrder.customTests && (
            <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-200">
              <strong className="text-[10px] uppercase font-bold text-teal-950 block mb-0.5">
                Exámenes Complementarios Adicionales:
              </strong>
              <p className="text-xs text-slate-800 font-medium">{labOrder.customTests}</p>
            </div>
          )}

          {/* 5. Indicaciones y Preparación para el Paciente */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Info className="w-3.5 h-3.5 text-primary" />
              <strong className="text-[10px] uppercase tracking-wider font-bold text-primary">
                Indicaciones de Preparación para la Paciente:
              </strong>
            </div>
            <p className="text-[11px] text-slate-800 font-medium leading-relaxed pl-5">
              {labOrder.patientInstructions ||
                "Ayuno de 8 a 10 horas. Abstinencia sexual y no aplicar óvulos ni cremas vaginales 48 horas antes de la toma de muestra. Entregar primera orina de la mañana en frasco estéril."}
            </p>
          </div>
        </div>

        {/* Talón de Recepción y Cadena de Custodia de Muestra */}
        {labOrder.templateType && labOrder.templateType !== "GENERAL" && (
          <div className="mx-0 my-2 p-2 rounded border border-dashed border-slate-300 bg-slate-50/80 text-[9px] text-slate-600 space-y-1">
            <div className="flex justify-between font-bold text-slate-700">
              <span>TALÓN DE RECEPCIÓN & CADENA DE CUSTODIA (LABORATORIO RECEPTOR)</span>
              <span>N° REGISTRO PATOLÓGICO: ____________________</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[8.5px]">
              <div>Recibido por (Nombre y DNI): _________________________________</div>
              <div>Fecha y Hora Recepción: _____/_____/202___  ____:____</div>
              <div>Estado de Muestra / Envase: [  ] Adecuado  [  ] Observado</div>
            </div>
          </div>
        )}

        {/* Cenefa de pie y Firma Médica */}
        <div className="shrink-0 pt-4 space-y-3">
          {/* Firma y Sello Digital */}
          <div className="border-t border-slate-200 pt-3 flex items-end justify-between">
            <div className="text-[9px] text-slate-400 font-mono space-y-0.5">
              <p>Validez médica legal &bull; CENDO Miraflores</p>
              <p>Emitido a través del Sistema Clínico CENDO</p>
            </div>

            <div className="text-center space-y-0.5 min-w-[220px]">
              <div className="h-10 border-b border-slate-400 flex items-center justify-center">
                <span className="font-serif italic text-primary/70 text-sm select-none">
                  {titlePrefix} {doctorDisplayName}
                </span>
              </div>
              <p className="font-heading font-extrabold text-slate-900 text-xs">
                {titlePrefix.toUpperCase()} {doctorDisplayName.toUpperCase()}
              </p>
              <p className="text-[9.5px] text-slate-600 font-mono">
                {doctor.specialty} &bull; CMP {labOrder.doctorCmp || doctor.cmp} &bull; RNE {labOrder.doctorRne || doctor.rne}
              </p>
            </div>
          </div>

          {/* Cenefa Oficial Ondulada CENDO */}
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

