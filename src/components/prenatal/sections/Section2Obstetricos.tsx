"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PrenatalBaselineData } from "@/types/medical";
import { DigitGrid, PairDigitBox } from "../prenatalHelpers";

interface Section2ObstetricosProps {
  isOpen: boolean;
  onToggle: () => void;
  baselineData: PrenatalBaselineData;
  setBaselineData: React.Dispatch<React.SetStateAction<PrenatalBaselineData>>;
  isParityRisk: boolean;
}

export function Section2Obstetricos({
  isOpen,
  onToggle,
  baselineData,
  setBaselineData,
  isParityRisk,
}: Section2ObstetricosProps) {
  const totalPartos = (baselineData.partosVaginales || 0) + (baselineData.cesareas || 0);

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
            2
          </span>
          <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
            ANTECEDENTES OBSTÉTRICOS (ÁRBOL DE PARIDAD)
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            G{baselineData.gestas} P{totalPartos}{baselineData.abortos}{baselineData.nacidosVivos} &bull; Viven {baselineData.viven}
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
          {/* 2.1 Barra Superior de Resumen de Fórmula */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                GP
              </div>
              <div>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                  Fórmula Obstétrica Calculada
                </span>
                <span className="text-[11px] font-mono font-bold text-primary block">
                  G{baselineData.gestas} P{totalPartos}{baselineData.abortos}{baselineData.nacidosVivos} &bull; {baselineData.viven} Viven &bull; {baselineData.cesareas} Cesáreas
                </span>
              </div>
            </div>

            {/* Leyenda de colores del diagrama */}
            <div className="flex items-center gap-2.5 text-[10px] bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs flex-wrap">
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-xs bg-white border border-slate-400 inline-block" />
                <span className="text-slate-600 font-semibold">Paridad estándar</span>
              </div>
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-500 inline-block" />
                <span className="text-amber-950 font-bold">= ALERTA</span>
              </div>
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <span className="w-3.5 h-3.5 rounded-xs bg-red-600 border border-red-700 inline-block" />
                <span className="text-red-950 font-bold">= Seguimiento continuo</span>
              </div>
            </div>
          </div>

          {/* 2.2 DIAGRAMA DE ANTECEDENTES OBSTÉTRICOS */}
          <div className="rounded-2xl border-2 border-slate-300 p-5 space-y-6 bg-slate-50/40 relative shadow-2xs overflow-x-auto">

            {/* Cabecera integrada sobre el diagrama */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Diagrama de Flujo de Antecedentes Obstétricos
              </span>
              <span className="text-[11px] text-muted font-sans hidden sm:inline">
                Cada variable muestra 2 casillas gemelas editables con botones (+ / -)
              </span>
            </div>

            {/* Estructura del Árbol (5 Columnas Horizontales) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-5 items-stretch min-w-[780px]">

              {/* COLUMNA 1: GESTAS (Raíz) */}
              <div className="flex flex-col items-center justify-center space-y-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-center space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Paso 1</span>
                  <strong className="text-xs text-slate-900 block">Total Gestas</strong>
                </div>

                <PairDigitBox
                  label="Gestas"
                  value={baselineData.gestas}
                  onChange={(val) => setBaselineData({ ...baselineData, gestas: val })}
                  badge={baselineData.gestas >= 4 ? "Multípara" : baselineData.gestas === 1 ? "Primigesta" : undefined}
                />

                <div className="text-[10px] text-center text-slate-500 max-w-[120px] pt-1 border-t border-slate-100">
                  Total de embarazos previos y actual
                </div>
              </div>

              {/* COLUMNA 2: ABORTOS & CRITERIOS DE ALERTA DE PARTOS */}
              <div className="flex flex-col justify-between space-y-3">
                {/* Rama Abortos (Alerta Amarilla) */}
                <div className="flex flex-col items-center p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                    Pérdidas (&lt; 22 sem.)
                  </span>
                  <PairDigitBox
                    label="Abortos"
                    value={baselineData.abortos}
                    onChange={(val) => setBaselineData({ ...baselineData, abortos: val })}
                    variant={baselineData.abortos > 0 ? "yellow" : "default"}
                    badge={baselineData.abortos >= 3 ? "Recurrente" : baselineData.abortos > 0 ? "Alerta" : undefined}
                  />
                </div>

                {/* Caja de 4 Criterios de Alerta que alimentan a Partos */}
                <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block text-center border-b border-amber-200 pb-1">
                    Criterios de Alerta (Partos)
                  </span>
                  <div className="space-y-1.5 text-xs">
                    {/* 0 ó + 3 */}
                    <div
                      className={`flex items-center justify-between p-1.5 rounded-lg border transition-colors ${isParityRisk ? "bg-amber-300 border-amber-500 text-amber-950 font-bold" : "bg-white border-slate-200 text-slate-600"
                        }`}
                      title={isParityRisk ? "Alerta: 0 partos (Nulípara) o 4 a más partos (Multípara)" : "Paridad intermedia"}
                    >
                      <span className="text-[11px]">0 ó + 3</span>
                      <span className={`w-4 h-4 rounded-xs border flex items-center justify-center font-bold text-[10px] ${isParityRisk ? "bg-amber-400 border-amber-600 text-amber-950" : "border-slate-300 bg-slate-50"
                        }`}>
                        {isParityRisk ? "✓" : ""}
                      </span>
                    </div>

                    {/* < 2500 g */}
                    <label className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-300 cursor-pointer transition-colors">
                      <span className="text-[11px] font-semibold text-slate-700">&lt; 2500 g</span>
                      <input
                        type="checkbox"
                        checked={baselineData.lowWeightHistory ?? false}
                        onChange={(e) => setBaselineData({ ...baselineData, lowWeightHistory: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                      />
                    </label>

                    {/* Múltiple */}
                    <label className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-300 cursor-pointer transition-colors">
                      <span className="text-[11px] font-semibold text-slate-700">Múltiple</span>
                      <input
                        type="checkbox"
                        checked={baselineData.multipleHistory ?? false}
                        onChange={(e) => setBaselineData({ ...baselineData, multipleHistory: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                      />
                    </label>

                    {/* < 37 sem. */}
                    <label className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-300 cursor-pointer transition-colors">
                      <span className="text-[11px] font-semibold text-slate-700">&lt; 37 sem.</span>
                      <input
                        type="checkbox"
                        checked={baselineData.pretermHistory ?? false}
                        onChange={(e) => setBaselineData({ ...baselineData, pretermHistory: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* COLUMNA 3: PARTOS (Vaginales & Cesáreas) */}
              <div className="flex flex-col justify-between space-y-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div>
                  <div className="text-center mb-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Paso 2</span>
                    <strong className="text-xs text-slate-900 block">Total Partos</strong>
                  </div>
                  {/* Casilla de Partos Total */}
                  <PairDigitBox
                    label="Partos"
                    value={totalPartos}
                    onChange={(val) => {
                      setBaselineData({ ...baselineData, partosVaginales: Math.max(0, val - (baselineData.cesareas || 0)) });
                    }}
                    badge={isParityRisk ? "Alerta 0 / +3" : "Paridad Normal"}
                    variant={isParityRisk ? "yellow" : "default"}
                  />
                </div>

                <div className="w-full border-t border-slate-200 pt-2 space-y-2.5">
                  {/* Vaginales */}
                  <PairDigitBox
                    label="Vaginales"
                    value={baselineData.partosVaginales}
                    onChange={(val) => setBaselineData({ ...baselineData, partosVaginales: val })}
                  />

                  {/* Cesáreas (Alerta Roja de Seguimiento) */}
                  <PairDigitBox
                    label="Cesáreas"
                    value={baselineData.cesareas}
                    onChange={(val) => setBaselineData({ ...baselineData, cesareas: val })}
                    variant={baselineData.cesareas > 0 ? "red" : "default"}
                    badge={baselineData.cesareas > 0 ? "Seguimiento Rojo" : undefined}
                  />
                </div>
              </div>

              {/* COLUMNA 4: NACIDOS VIVOS & NACIDOS MUERTOS */}
              <div className="flex flex-col justify-between space-y-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div>
                  <div className="text-center mb-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Paso 3</span>
                    <strong className="text-xs text-slate-900 block">Condición Natal</strong>
                  </div>
                  {/* Nacidos Vivos */}
                  <PairDigitBox
                    label="Nacidos vivos"
                    value={baselineData.nacidosVivos}
                    onChange={(val) => setBaselineData({ ...baselineData, nacidosVivos: val, viven: Math.min(baselineData.viven, val) })}
                  />
                </div>

                <div className="w-full border-t border-slate-200 pt-2">
                  {/* Nacidos Muertos (Alerta Amarilla) */}
                  <PairDigitBox
                    label="Nacidos muertos"
                    value={baselineData.nacidosMuertos}
                    onChange={(val) => setBaselineData({ ...baselineData, nacidosMuertos: val })}
                    variant={baselineData.nacidosMuertos > 0 ? "yellow" : "default"}
                    badge={baselineData.nacidosMuertos > 0 ? "Óbito Alerta" : undefined}
                  />
                </div>
              </div>

              {/* COLUMNA 5: DESENLACES DE NACIDOS VIVOS (Viven / Muertes Neonatales) */}
              <div className="flex flex-col justify-between space-y-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div>
                  <div className="text-center mb-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Paso 4</span>
                    <strong className="text-xs text-slate-900 block">Supervivencia</strong>
                  </div>
                  {/* Viven */}
                  <PairDigitBox
                    label="Viven"
                    value={baselineData.viven}
                    onChange={(val) => setBaselineData({ ...baselineData, viven: val })}
                    variant={baselineData.viven < baselineData.nacidosVivos ? "yellow" : "default"}
                    badge={baselineData.viven < baselineData.nacidosVivos ? "Pérdida infantil" : undefined}
                  />
                </div>

                <div className="w-full border-t border-slate-200 pt-2 space-y-2.5">
                  {/* Muerto - 1ra semana */}
                  <PairDigitBox
                    label="Muerto - 1ra sem."
                    value={baselineData.deadFirstWeek ?? 0}
                    onChange={(val) => setBaselineData({ ...baselineData, deadFirstWeek: val })}
                    variant={(baselineData.deadFirstWeek ?? 0) > 0 ? "yellow" : "default"}
                    badge={(baselineData.deadFirstWeek ?? 0) > 0 ? "Precoz ≤7d" : undefined}
                  />

                  {/* Después - 1ra semana */}
                  <PairDigitBox
                    label="Después - 1ra sem."
                    value={baselineData.deadAfterFirstWeek ?? 0}
                    onChange={(val) => setBaselineData({ ...baselineData, deadAfterFirstWeek: val })}
                    variant={(baselineData.deadAfterFirstWeek ?? 0) > 0 ? "yellow" : "default"}
                    badge={(baselineData.deadAfterFirstWeek ?? 0) > 0 ? "Tardía >7d" : undefined}
                  />
                </div>
              </div>

            </div>

            {/* 2.3 CAMPO INFERIOR: RN DE MAYOR PESO (4 CASILLAS) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  RN de mayor peso:
                </span>
                <DigitGrid
                  value={String(baselineData.rnMayorPesoGramos || 0).padStart(4, "0")}
                  length={4}
                />
                <span className="text-xs font-bold text-slate-600">gramos</span>
                <input
                  type="number"
                  min={500}
                  max={6500}
                  step={50}
                  value={baselineData.rnMayorPesoGramos || ""}
                  onChange={(e) =>
                    setBaselineData({
                      ...baselineData,
                      rnMayorPesoGramos: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  placeholder="ej. 3400"
                  className="w-24 px-2.5 py-1 text-xs font-mono font-bold text-center rounded-lg border border-slate-300 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                {baselineData.rnMayorPesoGramos && baselineData.rnMayorPesoGramos >= 4000 ? (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    ⚠️ Alerta: Macrosomía Fetal (≥ 4000g)
                  </span>
                ) : baselineData.rnMayorPesoGramos && baselineData.rnMayorPesoGramos > 0 && baselineData.rnMayorPesoGramos < 2500 ? (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    ⚠️ Alerta: Bajo Peso al Nacer (&lt; 2500g)
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Rango estándar esperado: 2500g - 3999g
                  </span>
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
