"use client";

import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import {
  X,
  Receipt,
  Plus,
  Trash2,
  CheckCircle,
  Printer,
  MessageCircle,
  Search,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { Patient, ProcedureQuote, QuoteItem, ProcedureTariff } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import { generateQuoteWhatsAppUrl } from "@/lib/whatsappShare";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  onSavedAndPrint?: (quote: ProcedureQuote) => void;
}

export function QuoteModal({
  isOpen,
  onClose,
  patient,
  onSavedAndPrint,
}: QuoteModalProps) {
  const { doctorProfile, tariffItems, addQuote } = useMedicalStore();

  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [validityDays, setValidityDays] = useState(30);
  const [paymentTerms, setPaymentTerms] = useState(
    "50% al programar procedimiento, 50% el día de la atención. Aceptamos efectivo, transferencias bancarias BCP / BBVA y todas las tarjetas de crédito."
  );
  const [notes, setNotes] = useState(
    "Incluye honorarios profesionales y controles postoperatorios en consultorio por 30 días."
  );

  const [selectedItems, setSelectedItems] = useState<QuoteItem[]>([]);
  const [searchTariff, setSearchTariff] = useState("");

  useEffect(() => {
    if (patient) {
      setPatientName(`${patient.lastName}, ${patient.firstName}`);
      setPatientPhone(patient.phone || "");
    } else {
      setPatientName("");
      setPatientPhone("");
    }
    setSelectedItems([]);
  }, [patient, isOpen]);

  // Cálculos automáticos
  const subtotal = useMemo(() => {
    return selectedItems.reduce((acc, it) => acc + it.regularPrice, 0);
  }, [selectedItems]);

  const total = useMemo(() => {
    return selectedItems.reduce((acc, it) => acc + it.finalPrice, 0);
  }, [selectedItems]);

  const discountTotal = useMemo(() => {
    return Math.max(0, subtotal - total);
  }, [subtotal, total]);

  // Búsqueda en tarifario
  const filteredTariff = useMemo(() => {
    if (!searchTariff.trim()) return tariffItems.slice(0, 8);
    const q = searchTariff.toLowerCase();
    return tariffItems.filter(
      (t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [tariffItems, searchTariff]);

  if (!isOpen) return null;

  const handleAddTariffItem = (t: ProcedureTariff) => {
    const newItem: QuoteItem = {
      procedureId: t.id,
      code: t.code,
      name: t.name,
      category: t.category,
      regularPrice: t.price,
      discountPercent: 0,
      finalPrice: t.price,
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const handleUpdateItemDiscount = (index: number, discountPercent: number) => {
    setSelectedItems(
      selectedItems.map((item, idx) => {
        if (idx !== index) return item;
        const finalPrice = Math.round(item.regularPrice * (1 - discountPercent / 100));
        return {
          ...item,
          discountPercent,
          finalPrice,
        };
      })
    );
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, idx) => idx !== index));
  };

  const handleSave = (shouldPrint = false) => {
    if (!patientName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nombre Requerido",
        text: "Por favor ingrese el nombre de la paciente o titular del presupuesto.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    if (selectedItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Agregue Procedimientos",
        text: "Por favor seleccione al menos un procedimiento del tarifario.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    const newQuote: ProcedureQuote = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `quote-${Date.now()}`,
      patientId: patient ? patient.id : "pat-custom",
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      doctorId: doctorProfile.id,
      doctorName: `${doctorProfile.doctorTitle} ${doctorProfile.fullName}`,
      quoteDate: new Date().toISOString().split("T")[0],
      validityDays,
      items: selectedItems,
      subtotal,
      discountTotal,
      total,
      paymentTerms: paymentTerms.trim(),
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    addQuote(newQuote);

    Swal.fire({
      icon: "success",
      title: "Presupuesto Generado",
      text: `Presupuesto por S/ ${total.toFixed(2)} registrado exitosamente.`,
      timer: 1500,
      showConfirmButton: false,
    });

    onClose();
    if (shouldPrint && onSavedAndPrint) {
      onSavedAndPrint(newQuote);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-heading">
                Cotizador de Procedimientos & Presupuesto Oficial
              </h2>
              <p className="text-xs text-muted">
                Emisión de presupuesto con tarifas CENDO y despacho por WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-heading hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Datos Paciente y Vigencia */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 space-y-1">
              <label className="font-bold text-heading block">Paciente / Destinataria *</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Nombre completo de la paciente..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="font-bold text-heading block">Teléfono / WhatsApp *</label>
              <input
                type="text"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="985 945 697"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="font-bold text-heading block">Vigencia (Días)</label>
              <select
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:border-emerald-600 focus:bg-white focus:outline-none"
              >
                <option value={15}>15 días calendario</option>
                <option value={30}>30 días calendario (Estándar)</option>
                <option value={45}>45 días calendario</option>
                <option value={60}>60 días calendario</option>
              </select>
            </div>
          </div>

          {/* Buscador de Tarifario y Procedimientos seleccionados */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Catálogo de Tarifas */}
            <div className="md:col-span-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs block">Catálogo de Procedimientos CENDO</span>
                <span className="text-[10px] text-muted">Clic para agregar</span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted" />
                <input
                  type="text"
                  placeholder="Buscar en tarifario..."
                  value={searchTariff}
                  onChange={(e) => setSearchTariff(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {filteredTariff.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleAddTariffItem(t)}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-slate-900 block text-[11px] leading-tight">{t.name}</strong>
                      <span className="text-[9.5px] text-slate-500 font-mono">{t.code} &bull; {t.category}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-800 text-xs shrink-0 ml-2">
                      S/ {t.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ítems Seleccionados en el Presupuesto */}
            <div className="md:col-span-7 p-3.5 rounded-xl bg-white border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-xs block">
                    Procedimientos en Cotización ({selectedItems.length})
                  </span>
                  <span className="text-[11px] font-mono font-bold text-primary">
                    Total: S/ {total.toFixed(2)}
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pt-2 pr-1">
                  {selectedItems.length > 0 ? (
                    selectedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <strong className="text-slate-900 block text-[11px] truncate">{item.name}</strong>
                          <span className="text-[9.5px] text-slate-500 font-mono">Reg: S/ {item.regularPrice.toFixed(2)}</span>
                        </div>

                        {/* Descuento */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-slate-500 font-semibold">Desc:</span>
                          <select
                            value={item.discountPercent || 0}
                            onChange={(e) => handleUpdateItemDiscount(idx, Number(e.target.value))}
                            className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-[10px] font-mono font-bold text-emerald-800"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={10}>10%</option>
                            <option value={15}>15%</option>
                            <option value={20}>20%</option>
                            <option value={25}>25%</option>
                          </select>
                        </div>

                        {/* Precio Final */}
                        <span className="font-mono font-bold text-xs text-slate-900 shrink-0 w-20 text-right">
                          S/ {item.finalPrice.toFixed(2)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-muted">
                      <Receipt className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                      <p className="text-xs font-semibold">Sin procedimientos agregados</p>
                      <p className="text-[10px]">Haga clic en los ítems del catálogo izquierdo.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumen de Totales */}
              {selectedItems.length > 0 && (
                <div className="pt-2 border-t border-slate-200 flex flex-col items-end space-y-0.5 text-xs">
                  <div className="flex justify-between w-56 text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">S/ {subtotal.toFixed(2)}</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between w-56 text-emerald-700 font-semibold">
                      <span>Descuento:</span>
                      <span className="font-mono">- S/ {discountTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between w-56 font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>TOTAL:</span>
                    <span className="font-mono text-sm text-emerald-700">S/ {total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Condiciones y Notas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Formas de Pago y Condiciones</label>
              <textarea
                rows={2}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Notas / Observaciones</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 border-t border-border bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            {patientPhone && selectedItems.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const tempQuote: ProcedureQuote = {
                    id: "temp-quote",
                    patientId: patient ? patient.id : "pat-custom",
                    patientName,
                    patientPhone,
                    doctorId: doctorProfile.id,
                    doctorName: doctorProfile.fullName,
                    quoteDate: new Date().toISOString().split("T")[0],
                    validityDays,
                    items: selectedItems,
                    subtotal,
                    discountTotal,
                    total,
                    paymentTerms,
                    notes,
                    createdAt: new Date().toISOString(),
                  };
                  const url = generateQuoteWhatsAppUrl(tempQuote, doctorProfile);
                  window.open(url, "_blank");
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Presupuesto por WhatsApp</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Guardar e Imprimir</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Guardar Presupuesto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

