"use client";

import React from "react";
import { DoctorProfile, ProcedureQuote } from "@/types/medical";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CendoFooterWave } from "@/components/export/CendoFooterWave";

interface QuotePrintViewProps {
  quote: ProcedureQuote;
  doctor: DoctorProfile;
}

export function QuotePrintView({ quote, doctor }: QuotePrintViewProps) {
  const doctorDisplayName = (quote.doctorName || doctor.fullName)
    .replace(/^dr\.?\s+/i, "")
    .trim();

  const titlePrefix = doctor.doctorTitle || "Dr.";

  return (
    <div
      id="quote-print-sheet"
      className="max-w-[210mm] mx-auto text-slate-900 bg-white font-sans text-xs"
    >
      <div className="page-sheet w-[210mm] min-h-[297mm] max-h-[297mm] p-[10mm_14mm_6mm_14mm] flex flex-col justify-between border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:rounded-none overflow-hidden box-border">
        {/* Contenido Superior */}
        <div className="space-y-4 flex-1">
          {/* Membrete CENDO */}
          <div className="border-b-2 border-primary pb-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandLogo size="lg" showText={false} />
              <div>
                <h1 className="text-xl font-heading font-extrabold text-primary tracking-tight">
                  CENDO &bull; CENTRO DE ENDOMETRIOSIS
                </h1>
                <p className="text-[11px] font-semibold text-slate-700">
                  Ginecología Especializada &bull; Cirugía Laparoscópica Avanzada
                </p>
                <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                  {doctor.clinicAddress} &bull; Central: {doctor.phone}
                </p>
              </div>
            </div>

            <div className="text-right border-l border-slate-200 pl-4 shrink-0">
              <div className="inline-block px-2.5 py-1 rounded-md bg-accent-soft text-primary font-heading font-extrabold text-xs tracking-wider uppercase border border-primary/20">
                PRESUPUESTO MÉDICO
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                COT-{quote.id.slice(0, 8)}
              </p>
              <p className="text-[10px] text-slate-700 font-bold">
                Fecha: {quote.quoteDate}
              </p>
              <p className="text-[9.5px] text-amber-800 font-semibold">
                Vigencia: {quote.validityDays} días
              </p>
            </div>
          </div>

          {/* Datos del Paciente */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            <div className="md:col-span-8">
              <span className="text-[9.5px] uppercase font-bold text-slate-500 block">
                Paciente / Titular del Presupuesto:
              </span>
              <strong className="text-sm font-heading font-bold text-slate-900">
                {quote.patientName}
              </strong>
            </div>

            <div className="md:col-span-4 text-right">
              <span className="text-[9.5px] uppercase font-bold text-slate-500 block">
                Teléfono de Contacto:
              </span>
              <span className="font-mono font-bold text-slate-900">{quote.patientPhone}</span>
            </div>
          </div>

          {/* Tabla de Procedimientos Cotizados */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-[10.5px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3">Procedimiento / Servicio Médico</th>
                  <th className="py-2.5 px-3 w-28">Categoría</th>
                  <th className="py-2.5 px-3 text-right w-24">Precio Reg.</th>
                  <th className="py-2.5 px-3 text-right w-20">Desc.</th>
                  <th className="py-2.5 px-3 text-right w-24">Total (S/)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quote.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <strong className="text-slate-900 block font-heading">{item.name}</strong>
                      <span className="font-mono text-[10px] text-slate-500">{item.code}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">{item.category}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      S/ {item.regularPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold">
                      {item.discountPercent ? `${item.discountPercent}%` : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      S/ {item.finalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totales */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col items-end space-y-1">
              <div className="flex justify-between w-64 text-slate-600 text-xs">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">S/ {quote.subtotal.toFixed(2)}</span>
              </div>
              {quote.discountTotal > 0 && (
                <div className="flex justify-between w-64 text-emerald-700 text-xs font-semibold">
                  <span>Descuento Especial CENDO:</span>
                  <span className="font-mono">- S/ {quote.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between w-64 text-slate-950 font-heading font-extrabold text-sm pt-1.5 border-t border-slate-300">
                <span>TOTAL A PAGAR:</span>
                <span className="font-mono text-base text-primary">S/ {quote.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Condiciones Comerciales y Formas de Pago */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1.5 text-xs">
            <h3 className="font-heading font-bold text-[10.5px] uppercase tracking-wider text-slate-700">
              Condiciones de Pago & Términos del Presupuesto
            </h3>
            <p className="text-slate-800 leading-relaxed font-sans">
              {quote.paymentTerms}
            </p>
            {quote.notes && (
              <div className="pt-2 border-t border-slate-200">
                <strong className="text-slate-700 text-[10px] uppercase font-bold block">Observaciones:</strong>
                <p className="text-slate-700 leading-snug">{quote.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Firma Oficial */}
        <div className="mt-4 pt-2 border-t border-slate-200">
          <div className="flex items-end justify-between">
            <div className="text-[9.5px] text-slate-500 space-y-0.5">
              <p className="font-semibold text-slate-700">
                CENDO &bull; Centro de Endometriosis y Ginecología
              </p>
              <p>Presupuesto garantizado por el periodo de vigencia indicado</p>
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
                CMP {doctor.cmp} &bull; RNE {doctor.rne}
              </p>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
                Director Médico CENDO
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

