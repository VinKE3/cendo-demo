"use client";

import React from "react";
import { FlaskConical, Receipt, Plus, MessageCircle, Printer } from "lucide-react";
import Swal from "sweetalert2";
import { Patient, LabOrder, ProcedureQuote, DoctorProfile } from "@/types/medical";
import { generateLabOrderWhatsAppUrl, generateQuoteWhatsAppUrl } from "@/lib/whatsappShare";

interface TabLaboratorioCotizacionesProps {
  patient: Patient;
  labOrders: LabOrder[];
  quotes: ProcedureQuote[];
  doctorProfile?: DoctorProfile | null;
  onOpenNewLabOrder: () => void;
  onEditLabOrder: (ord: LabOrder) => void;
  onPrintLabOrder: (ord: LabOrder) => void;
  onDeleteLabOrder: (id: string) => void;
  onOpenNewQuote: () => void;
  onPrintQuote: (quote: ProcedureQuote) => void;
  onDeleteQuote: (id: string) => void;
}

export function TabLaboratorioCotizaciones({
  patient,
  labOrders,
  quotes,
  doctorProfile,
  onOpenNewLabOrder,
  onEditLabOrder,
  onPrintLabOrder,
  onDeleteLabOrder,
  onOpenNewQuote,
  onPrintQuote,
  onDeleteQuote,
}: TabLaboratorioCotizacionesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Órdenes de Laboratorio Clínico */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-teal-600" />
            <h3 className="font-heading font-bold text-sm text-heading">
              Órdenes de Laboratorio ({labOrders.length})
            </h3>
          </div>
          <button
            onClick={onOpenNewLabOrder}
            className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Orden</span>
          </button>
        </div>

        <div className="space-y-3">
          {labOrders.length > 0 ? (
            labOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-teal-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 text-teal-800">
                    LAB-{ord.id.replace("lab-", "").slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-muted">
                      {ord.orderDate}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase font-mono ${
                        ord.urgency === "Urgente"
                          ? "bg-red-100 text-red-800"
                          : ord.urgency === "Prioritario"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {ord.urgency}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-semibold text-heading leading-snug">
                  {ord.diagnosis || "Sin diagnóstico especificado"}
                </p>

                <div className="space-y-1 pt-1 border-t border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Análisis Solicitados ({ord.items.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {ord.items.map((item) => (
                      <span
                        key={item.id}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10.5px] font-medium text-slate-800"
                      >
                        {item.testName}
                      </span>
                    ))}
                    {ord.customTests && (
                      <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-[10.5px] font-medium text-teal-900 italic">
                        + {ord.customTests}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                  <button
                    onClick={() => {
                      const url = generateLabOrderWhatsAppUrl(patient, ord, doctorProfile);
                      window.open(url, "_blank");
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    title="Enviar orden por WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onPrintLabOrder(ord)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Ver / Imprimir</span>
                  </button>

                  <button
                    onClick={() => onEditLabOrder(ord)}
                    className="text-xs font-semibold text-slate-700 hover:text-teal-700 transition-colors cursor-pointer"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => {
                      Swal.fire({
                        title: "¿Eliminar Orden?",
                        text: "Esta acción no se puede deshacer.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#EF4444",
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar",
                      }).then((res) => {
                        if (res.isConfirmed) {
                          onDeleteLabOrder(ord.id);
                        }
                      });
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center space-y-1">
              <FlaskConical className="w-8 h-8 text-muted mx-auto" />
              <p className="text-xs font-semibold text-heading">Sin órdenes de laboratorio</p>
              <p className="text-[11px] text-muted">
                Genere órdenes clínicas estructuradas para análisis y perfiles ginecológicos.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Presupuestos y Cotizaciones */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h3 className="font-heading font-bold text-sm text-heading">
              Presupuestos Médicos ({quotes.length})
            </h3>
          </div>
          <button
            onClick={onOpenNewQuote}
            className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nueva Cotización</span>
          </button>
        </div>

        <div className="space-y-3">
          {quotes.length > 0 ? (
            quotes.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 hover:border-emerald-400 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                      COT-{q.id.slice(0, 8)}
                    </span>
                    <span className="text-xs font-mono font-bold text-heading">
                      {q.quoteDate}
                    </span>
                    <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                      Vigencia: {q.validityDays} días
                    </span>
                  </div>
                  <span className="font-mono font-extrabold text-sm text-emerald-700">
                    Total: S/ {q.total.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-slate-800">
                    Ítems cotizados ({q.items.length}):
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {q.items.map((it, idx) => (
                      <li key={idx} className="truncate">
                        <strong>{it.name}</strong> — S/ {it.finalPrice.toFixed(2)} {it.discountPercent ? "(Desc " + it.discountPercent + "%)" : ""}
                      </li>
                    ))}
                  </ul>
                  {q.discountTotal > 0 && (
                    <p className="text-[11px] font-bold text-emerald-700">
                      Descuento total otorgado: -S/ {q.discountTotal.toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200">
                  <button
                    onClick={() => {
                      const url = generateQuoteWhatsAppUrl(q, doctorProfile);
                      window.open(url, "_blank");
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    title="Enviar presupuesto por WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onPrintQuote(q)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Ver / Imprimir A4</span>
                  </button>

                  <button
                    onClick={() => {
                      Swal.fire({
                        title: "¿Eliminar Presupuesto?",
                        text: "Esta acción no se puede deshacer.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#EF4444",
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar",
                      }).then((res) => {
                        if (res.isConfirmed) {
                          onDeleteQuote(q.id);
                        }
                      });
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center space-y-1">
              <Receipt className="w-8 h-8 text-muted mx-auto" />
              <p className="text-xs font-semibold text-heading">Sin presupuestos emitidos</p>
              <p className="text-[11px] text-muted">
                Genere cotizaciones automáticas con las tarifas del catálogo de CENDO.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
