"use client";

import React from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { PrenatalBaselineData } from "@/types/medical";

interface Section3GestacionAntProps {
  isOpen: boolean;
  onToggle: () => void;
  baselineData: PrenatalBaselineData;
  setBaselineData: React.Dispatch<React.SetStateAction<PrenatalBaselineData>>;
}

export function Section3GestacionAnt({
  isOpen,
  onToggle,
  baselineData,
  setBaselineData,
}: Section3GestacionAntProps) {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
            3
          </span>
          <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
            GESTACIÓN ANTERIOR & CAPTACIÓN
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {baselineData.previousDeliveryType || "No Aplica"} &bull; Lactancia: {baselineData.breastfeedingMonths || "No aplica"}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 space-y-5 text-xs border-t border-border bg-white">

          {/* 3.1 Barra Superior Informativa */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                GA
              </div>
              <div>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                  Historial del Embarazo Inmediatamente Anterior
                </span>
                <span className="text-[11px] text-muted block">
                  Periodo intergenésico, vía de culminación, tipo de aborto, lactancia y captación
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-500 inline-block" />
                <span className="font-bold text-slate-700">= ALERTA</span>
              </div>
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <span className="w-3.5 h-3.5 rounded-xs bg-red-600 border border-red-700 inline-block" />
                <span className="font-bold text-slate-700">= Seguimiento continuo</span>
              </div>
            </div>
          </div>

          {/* 3.2 Caja Principal de Gestación Anterior */}
          <div className="rounded-2xl border-2 border-slate-300 p-5 space-y-5 bg-white relative shadow-2xs">

            {/* Fila 1: Fecha de término y Período Intergenésico */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              {/* Fecha de terminación */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-700 uppercase">Fecha:</span>
                <input
                  type="date"
                  value={baselineData.previousDeliveryDate || ""}
                  onChange={(e) => setBaselineData({ ...baselineData, previousDeliveryDate: e.target.value })}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">(Día / Mes / Año)</span>
              </div>

              {/* Per. Intergenésico Adecuado */}
              <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Per. Intergenésico Adecuado:</span>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="adequateIntergenesicRadio"
                    checked={baselineData.adequateIntergenesicPeriod === true}
                    onChange={() => setBaselineData({ ...baselineData, adequateIntergenesicPeriod: true })}
                    className="text-primary focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-slate-700">Si</span>
                </label>

                {/* No con Alerta Amarilla */}
                <label
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded border cursor-pointer transition-colors ${baselineData.adequateIntergenesicPeriod === false
                      ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                      : "bg-amber-50/70 border-amber-200 text-amber-900"
                    }`}
                  title="Alerta: Periodo intergenésico corto (< 18 meses) o largo (> 5 años)"
                >
                  <input
                    type="radio"
                    name="adequateIntergenesicRadio"
                    checked={baselineData.adequateIntergenesicPeriod === false}
                    onChange={() => setBaselineData({ ...baselineData, adequateIntergenesicPeriod: false })}
                    className="text-amber-600 focus:ring-0"
                  />
                  <span className="text-xs">No [ALERTA]</span>
                </label>
              </div>
            </div>

            {/* Fila 2: Tres Columnas Principales (Terminación, Tipo de Aborto, Lactancia & Lugar) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* COLUMNA 1: Terminación */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2.5">
                <div className="border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                    Terminación
                  </span>
                  <span className="text-[10px] text-slate-500">¿Cómo culminó el embarazo previo?</span>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                    <span className="text-xs font-semibold text-slate-800">Parto Vaginal</span>
                    <input
                      type="radio"
                      name="deliveryTypeRadio"
                      checked={baselineData.previousDeliveryType === "Parto Vaginal"}
                      onChange={() => setBaselineData({ ...baselineData, previousDeliveryType: "Parto Vaginal" })}
                      className="text-primary focus:ring-0"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                    <span className="text-xs font-semibold text-slate-800">Cesárea</span>
                    <input
                      type="radio"
                      name="deliveryTypeRadio"
                      checked={baselineData.previousDeliveryType === "Cesárea"}
                      onChange={() => setBaselineData({ ...baselineData, previousDeliveryType: "Cesárea" })}
                      className="text-primary focus:ring-0"
                    />
                  </label>

                  {/* Aborto [ALERTA] */}
                  <label
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${baselineData.previousDeliveryType === "Aborto"
                        ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                        : "bg-amber-50/60 border-amber-200 text-amber-900"
                      }`}
                  >
                    <span className="text-xs">Aborto [ALERTA]</span>
                    <input
                      type="radio"
                      name="deliveryTypeRadio"
                      checked={baselineData.previousDeliveryType === "Aborto"}
                      onChange={() => setBaselineData({ ...baselineData, previousDeliveryType: "Aborto" })}
                      className="text-amber-600 focus:ring-0"
                    />
                  </label>

                  {/* Ectópico [ALERTA] */}
                  <label
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${baselineData.previousDeliveryType === "Ectópico"
                        ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                        : "bg-amber-50/60 border-amber-200 text-amber-900"
                      }`}
                  >
                    <span className="text-xs">Ectópico [ALERTA]</span>
                    <input
                      type="radio"
                      name="deliveryTypeRadio"
                      checked={baselineData.previousDeliveryType === "Ectópico"}
                      onChange={() => setBaselineData({ ...baselineData, previousDeliveryType: "Ectópico" })}
                      className="text-amber-600 focus:ring-0"
                    />
                  </label>

                  {/* Aborto Molar [ALERTA] */}
                  <label
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${baselineData.previousDeliveryType === "Aborto molar"
                        ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                        : "bg-amber-50/60 border-amber-200 text-amber-900"
                      }`}
                  >
                    <span className="text-xs">Aborto molar [ALERTA]</span>
                    <input
                      type="radio"
                      name="deliveryTypeRadio"
                      checked={baselineData.previousDeliveryType === "Aborto molar"}
                      onChange={() => setBaselineData({ ...baselineData, previousDeliveryType: "Aborto molar" })}
                      className="text-amber-600 focus:ring-0"
                    />
                  </label>

                  {/* No Aplica */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-700">No Aplica</span>
                      <span className="text-[10px] text-slate-400 italic">(cuando es primigesta)</span>
                    </div>
                    <input
                      type="radio"
                      name="deliveryTypeRadio"
                      checked={baselineData.previousDeliveryType === "No Aplica" || !baselineData.previousDeliveryType}
                      onChange={() => setBaselineData({ ...baselineData, previousDeliveryType: "No Aplica" })}
                      className="text-primary focus:ring-0"
                    />
                  </label>
                </div>
              </div>

              {/* COLUMNA 2: Si fue aborto: Tipo de Aborto */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2.5">
                <div className="border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                    Si fue aborto: Tipo de Aborto
                  </span>
                  <span className="text-[10px] text-slate-500">Clasificación clínica del evento</span>
                </div>

                <div className="space-y-1.5">
                  {/* Incompleto [ALERTA] */}
                  <label
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${baselineData.previousAbortionType === "Incompleto"
                        ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                        : "bg-amber-50/60 border-amber-200 text-amber-900"
                      }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">Incompleto [ALERTA]</span>
                      <span className="text-[10px] text-amber-900/80 italic font-normal">cuando quedó restos</span>
                    </div>
                    <input
                      type="radio"
                      name="abortionTypeRadio"
                      checked={baselineData.previousAbortionType === "Incompleto"}
                      onChange={() => setBaselineData({ ...baselineData, previousAbortionType: "Incompleto" })}
                      className="text-amber-600 focus:ring-0"
                    />
                  </label>

                  {/* Completo [ALERTA] */}
                  <label
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${baselineData.previousAbortionType === "Completo"
                        ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                        : "bg-amber-50/60 border-amber-200 text-amber-900"
                      }`}
                  >
                    <span className="text-xs">Completo [ALERTA]</span>
                    <input
                      type="radio"
                      name="abortionTypeRadio"
                      checked={baselineData.previousAbortionType === "Completo"}
                      onChange={() => setBaselineData({ ...baselineData, previousAbortionType: "Completo" })}
                      className="text-amber-600 focus:ring-0"
                    />
                  </label>

                  {/* Frustro / Retenido [ALERTA] */}
                  <label
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${baselineData.previousAbortionType === "Frustro/Retenido"
                        ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                        : "bg-amber-50/60 border-amber-200 text-amber-900"
                      }`}
                  >
                    <span className="text-xs">Frustro / Retenido [ALERTA]</span>
                    <input
                      type="radio"
                      name="abortionTypeRadio"
                      checked={baselineData.previousAbortionType === "Frustro/Retenido"}
                      onChange={() => setBaselineData({ ...baselineData, previousAbortionType: "Frustro/Retenido" })}
                      className="text-amber-600 focus:ring-0"
                    />
                  </label>

                  {/* Séptico [ALERTA] */}
                  <label
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${baselineData.previousAbortionType === "Séptico"
                        ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                        : "bg-amber-50/60 border-amber-200 text-amber-900"
                      }`}
                  >
                    <span className="text-xs">Séptico [ALERTA]</span>
                    <input
                      type="radio"
                      name="abortionTypeRadio"
                      checked={baselineData.previousAbortionType === "Séptico"}
                      onChange={() => setBaselineData({ ...baselineData, previousAbortionType: "Séptico" })}
                      className="text-amber-600 focus:ring-0"
                    />
                  </label>

                  {/* No Aplica */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                    <span className="text-xs font-semibold text-slate-700">No Aplica</span>
                    <input
                      type="radio"
                      name="abortionTypeRadio"
                      checked={baselineData.previousAbortionType === "No Aplica" || !baselineData.previousAbortionType}
                      onChange={() => setBaselineData({ ...baselineData, previousAbortionType: "No Aplica" })}
                      className="text-primary focus:ring-0"
                    />
                  </label>
                </div>
              </div>

              {/* COLUMNA 3: Lactancia Materna & Lugar del Parto */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-4">
                {/* Lactancia Materna */}
                <div className="space-y-2">
                  <div className="border-b border-slate-200 pb-1.5">
                    <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                      Lactancia Materna
                    </span>
                    <span className="text-[10px] text-slate-500">Duración en gestación previa</span>
                  </div>

                  <div className="space-y-1.5">
                    {/* no hubo [ROJO] */}
                    <label
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${baselineData.breastfeedingMonths === "no hubo" || baselineData.breastfeedingMonths === "No hubo"
                          ? "bg-red-500 border-red-600 text-white font-black shadow-xs ring-2 ring-red-400/50"
                          : "bg-red-50 border-red-200 text-red-900 font-bold"
                        }`}
                      title="Seguimiento continuo: falta total de lactancia"
                    >
                      <span className="text-xs">no hubo [SEGUIMIENTO ROJO]</span>
                      <input
                        type="radio"
                        name="breastfeedingRadio"
                        checked={baselineData.breastfeedingMonths === "no hubo" || baselineData.breastfeedingMonths === "No hubo"}
                        onChange={() => setBaselineData({ ...baselineData, breastfeedingMonths: "no hubo" })}
                        className="text-red-600 focus:ring-0"
                      />
                    </label>

                    {/* < 6 meses [ALERTA] */}
                    <label
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${baselineData.breastfeedingMonths === "< 6 meses"
                          ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                          : "bg-amber-50/60 border-amber-200 text-amber-900"
                        }`}
                    >
                      <span className="text-xs">&lt; 6 meses [ALERTA]</span>
                      <input
                        type="radio"
                        name="breastfeedingRadio"
                        checked={baselineData.breastfeedingMonths === "< 6 meses"}
                        onChange={() => setBaselineData({ ...baselineData, breastfeedingMonths: "< 6 meses" })}
                        className="text-amber-600 focus:ring-0"
                      />
                    </label>

                    {/* 6 meses o más */}
                    <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                      <span className="text-xs font-semibold text-slate-800">6 meses o más</span>
                      <input
                        type="radio"
                        name="breastfeedingRadio"
                        checked={baselineData.breastfeedingMonths === "6 meses o más"}
                        onChange={() => setBaselineData({ ...baselineData, breastfeedingMonths: "6 meses o más" })}
                        className="text-primary focus:ring-0"
                      />
                    </label>

                    {/* No aplica */}
                    <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                      <span className="text-xs font-semibold text-slate-700">No aplica</span>
                      <input
                        type="radio"
                        name="breastfeedingRadio"
                        checked={baselineData.breastfeedingMonths === "No aplica" || !baselineData.breastfeedingMonths}
                        onChange={() => setBaselineData({ ...baselineData, breastfeedingMonths: "No aplica" })}
                        className="text-primary focus:ring-0"
                      />
                    </label>
                  </div>
                </div>

                {/* Lugar del parto */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                    Lugar del parto
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                      <span className="text-xs font-semibold text-slate-800">EESS (Clínica)</span>
                      <input
                        type="radio"
                        name="deliveryPlaceRadio"
                        checked={baselineData.deliveryPlace === "EESS" || !baselineData.deliveryPlace}
                        onChange={() => setBaselineData({ ...baselineData, deliveryPlace: "EESS" })}
                        className="text-primary focus:ring-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                      <span className="text-xs font-semibold text-slate-800">Domic. (Casa)</span>
                      <input
                        type="radio"
                        name="deliveryPlaceRadio"
                        checked={baselineData.deliveryPlace === "Domic."}
                        onChange={() => setBaselineData({ ...baselineData, deliveryPlace: "Domic." })}
                        className="text-primary focus:ring-0"
                      />
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* Fila 3: Captada y Referida por Agente Comunitario (2 Sub-cajas inferiores) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
              {/* Caja 1: Captada */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 uppercase block">Captada:</span>
                  <span className="text-[10px] text-slate-500">Identificación precoz (&lt; 14 semanas)</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <input
                      type="radio"
                      name="pregnancyCapturedRadio"
                      checked={baselineData.pregnancyCaptured !== false}
                      onChange={() => setBaselineData({ ...baselineData, pregnancyCaptured: true })}
                      className="text-primary focus:ring-0"
                    />
                    <span className="text-xs font-bold text-slate-800">Si</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <input
                      type="radio"
                      name="pregnancyCapturedRadio"
                      checked={baselineData.pregnancyCaptured === false}
                      onChange={() => setBaselineData({ ...baselineData, pregnancyCaptured: false })}
                      className="text-primary focus:ring-0"
                    />
                    <span className="text-xs font-bold text-slate-800">No</span>
                  </label>
                </div>
              </div>

              {/* Caja 2: Referida X Ag. Comuni */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 uppercase block">Referida X Ag. Comuni:</span>
                  <span className="text-[10px] text-slate-500 italic">una persona comunitaria / promotora</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <input
                      type="radio"
                      name="communityAgentRadio"
                      checked={baselineData.communityAgentReferred === true}
                      onChange={() => setBaselineData({ ...baselineData, communityAgentReferred: true })}
                      className="text-primary focus:ring-0"
                    />
                    <span className="text-xs font-bold text-slate-800">Si</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <input
                      type="radio"
                      name="communityAgentRadio"
                      checked={baselineData.communityAgentReferred !== true}
                      onChange={() => setBaselineData({ ...baselineData, communityAgentReferred: false })}
                      className="text-primary focus:ring-0"
                    />
                    <span className="text-xs font-bold text-slate-800">No</span>
                  </label>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
