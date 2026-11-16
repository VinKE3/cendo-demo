"use client";

import React from "react";
import { Check, ChevronDown, ChevronUp, FlaskConical } from "lucide-react";
import { PrenatalBaselineData } from "@/types/medical";

interface Section6InmunizacionesProps {
  isOpen: boolean;
  onToggle: () => void;
  baselineData: PrenatalBaselineData;
  setBaselineData: React.Dispatch<React.SetStateAction<PrenatalBaselineData>>;
  basalImc: string | null;
  isBasalUnderweight: boolean;
  isBasalOverweight: boolean;
  isBasalObesity: boolean;
  section6ContinuousCount: number;
  section6AlertsCount: number;
}

export function Section6Inmunizaciones({
  isOpen,
  onToggle,
  baselineData,
  setBaselineData,
  basalImc,
  isBasalUnderweight,
  isBasalOverweight,
  isBasalObesity,
  section6ContinuousCount,
  section6AlertsCount,
}: Section6InmunizacionesProps) {
  return (
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => onToggle}
              className="w-full p-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                  6
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  INMUNIZACIONES, SOMATOMETRÍA, GRUPO SANGUÍNEO & HÁBITOS NOCIVOS
                </span>

                {/* Badges de alerta y seguimiento continuo */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {section6ContinuousCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black border border-red-700 shadow-2xs animate-pulse">
                      🟥 {section6ContinuousCount} Seguimiento continuo
                    </span>
                  )}
                  {section6AlertsCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black border border-amber-500 shadow-2xs">
                      🟨 {section6AlertsCount} {section6AlertsCount === 1 ? "Alerta" : "Alertas"}
                    </span>
                  )}
                  {section6ContinuousCount === 0 && section6AlertsCount === 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Parámetros basales normales
                    </span>
                  )}
                </div>
              </div>

              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {isOpen && (
              <div className="p-4 sm:p-6 space-y-5 text-xs border-t border-border bg-white">
                
                {/* 6.1 Barra Superior de Resumen y Acción Rápida */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-heading font-extrabold text-heading uppercase">
                        Matriz de Inmunizaciones, Antropometría, Inmunohematología & Hábitos
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Registro integrado de 5 bloques: Vacunas Previas, Antitetánica, Peso y Talla, Tipo de Sangre (Rh) y Hábitos Nocivos.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setBaselineData({
                          ...baselineData,
                          previousVaccines: { rubella: true, hepatitisB: true, hpv: true, yellowFever: true },
                          antitetanicaStatus: "Vacunada",
                          antitetanicaDosis: "2da",
                          bloodGroup: "O",
                          rhFactor: "Rh (+)",
                          smokerCigarettesDay: 0,
                          drugsUse: false,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Cargar perfil basal típico sin factores de riesgo"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>✓ Parámetros Típicos (O Rh+, No Fuma, No Drogas)</span>
                    </button>
                  </div>
                </div>

                {/* 6.2 Grid Integrado de los 5 Bloques Clínicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  
                  {/* BLOQUE 1: VACUNAS PREVIAS */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Vac. Previas
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Inmunizaciones previas</span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { key: "rubella", label: "Rubeola", hint: "Protección contra síndrome rubeola congénita" },
                        { key: "hepatitisB", label: "Hepatitis B", hint: "Prevención de transmisión vertical VHB" },
                        { key: "hpv", label: "Papiloma Virus (VPH)", hint: "Prevención de lesiones cervicales" },
                        { key: "yellowFever", label: "Fiebre Amarilla", hint: "Relevante en zona endémica / viajes" },
                      ].map((vac) => {
                        const isYes = (baselineData.previousVaccines as any)?.[vac.key] !== false;
                        return (
                          <div
                            key={vac.key}
                            className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2"
                          >
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">{vac.label}</span>
                              <span className="text-[10px] text-slate-500">{vac.hint}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setBaselineData({
                                    ...baselineData,
                                    previousVaccines: {
                                      ...(baselineData.previousVaccines || { rubella: true, hepatitisB: true, hpv: true, yellowFever: true }),
                                      [vac.key]: true,
                                    },
                                  })
                                }
                                className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all cursor-pointer ${
                                  isYes
                                    ? "bg-emerald-600 text-white shadow-2xs"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                }`}
                              >
                                Si
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setBaselineData({
                                    ...baselineData,
                                    previousVaccines: {
                                      ...(baselineData.previousVaccines || { rubella: true, hepatitisB: true, hpv: true, yellowFever: true }),
                                      [vac.key]: false,
                                    },
                                  })
                                }
                                className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all cursor-pointer ${
                                  !isYes
                                    ? "bg-amber-500 text-white shadow-2xs"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                }`}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* BLOQUE 2: ANTITETÁNICA */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Antitetánica
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">dTpa / Tétanos neonatal</span>
                    </div>

                    <div className="space-y-2.5">
                      {/* N° Dosis Previa */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">N° Dosis Previa:</span>
                          <span className="text-[10px] text-slate-500">Recibidas antes de esta gestación</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            max={5}
                            value={baselineData.antitetanicaPrevDoses ?? 1}
                            onChange={(e) =>
                              setBaselineData({
                                ...baselineData,
                                antitetanicaPrevDoses: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="w-12 text-center font-mono font-bold text-xs border border-slate-300 rounded-md bg-slate-50 py-1"
                          />
                          <span className="text-xs font-semibold text-slate-600">dosis</span>
                        </div>
                      </div>

                      {/* Dosis mes de gestación: 1ra y 2da */}
                      <div className="p-2 rounded-lg bg-white border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-800 block">Dosis (Mes de Gestación):</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-600 block mb-1">1ra Dosis:</label>
                            <input
                              type="text"
                              value={baselineData.antitetanica1stDoseMonth || ""}
                              onChange={(e) =>
                                setBaselineData({
                                  ...baselineData,
                                  antitetanica1stDoseMonth: e.target.value,
                                })
                              }
                              placeholder="ej. 4to mes / 20 sem"
                              className="w-full text-xs px-2 py-1 rounded border border-slate-300 bg-slate-50 font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-600 block mb-1">2da Dosis:</label>
                            <input
                              type="text"
                              value={baselineData.antitetanica2ndDoseMonth || ""}
                              onChange={(e) =>
                                setBaselineData({
                                  ...baselineData,
                                  antitetanica2ndDoseMonth: e.target.value,
                                })
                              }
                              placeholder="ej. 6to mes / 28 sem"
                              className="w-full text-xs px-2 py-1 rounded border border-slate-300 bg-slate-50 font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Estados: Sin dosis [ALERTA] y No Aplica */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {/* Sin dosis [ALERTA] */}
                        <label
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                            baselineData.antitetanicaStatus === "Sin dosis"
                              ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                              : "bg-amber-50/70 border-amber-200 text-amber-900"
                          }`}
                        >
                          <span className="text-xs font-bold">Sin dosis [ALERTA]</span>
                          <input
                            type="radio"
                            name="antitetanicaStatusRadio"
                            checked={baselineData.antitetanicaStatus === "Sin dosis"}
                            onChange={() =>
                              setBaselineData({
                                ...baselineData,
                                antitetanicaStatus: "Sin dosis",
                                antitetanicaDosis: "Sin dosis",
                              })
                            }
                            className="text-amber-600 focus:ring-0"
                          />
                        </label>

                        {/* No Aplica */}
                        <label
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                            baselineData.antitetanicaStatus === "No Aplica"
                              ? "bg-slate-200 border-slate-400 text-slate-900 font-bold"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <span className="text-xs font-semibold">No Aplica</span>
                          <input
                            type="radio"
                            name="antitetanicaStatusRadio"
                            checked={baselineData.antitetanicaStatus === "No Aplica"}
                            onChange={() =>
                              setBaselineData({
                                ...baselineData,
                                antitetanicaStatus: "No Aplica",
                                antitetanicaDosis: "No aplica",
                              })
                            }
                            className="text-primary focus:ring-0"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 3: PESO Y TALLA (SOMATOMETRÍA & IMC) */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                          Peso y Talla
                        </span>
                        <span className="text-[10px] text-slate-500 italic">peso antes del embarazo.</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Somatometría</span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Peso Habitual : [ ][ ] kg */}
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Peso Habitual:</span>
                          <span className="text-[10px] text-slate-500">Peso pregestacional en kg</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setBaselineData({
                                ...baselineData,
                                usualWeightKg: Math.max(30, (baselineData.usualWeightKg || 55) - 1),
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                          >
                            -
                          </button>
                          <div className="flex items-center gap-0.5">
                            {String(Math.round(baselineData.usualWeightKg || 58))
                              .padStart(2, "0")
                              .slice(-2)
                              .split("")
                              .map((digit, i) => (
                                <span
                                  key={i}
                                  className="w-7 h-8 border-2 border-slate-400 bg-white rounded-xs flex items-center justify-center font-mono font-black text-sm text-slate-900 shadow-2xs"
                                >
                                  {digit}
                                </span>
                              ))}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setBaselineData({
                                ...baselineData,
                                usualWeightKg: Math.min(180, (baselineData.usualWeightKg || 55) + 1),
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                          >
                            +
                          </button>
                          <span className="text-xs font-bold text-slate-700 ml-1">kg</span>
                        </div>
                      </div>

                      {/* Talla : [ 1 ][ ][ ] cm */}
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Talla:</span>
                          <span className="text-[10px] text-slate-500">Estatura materna en cm</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setBaselineData({
                                ...baselineData,
                                heightCm: Math.max(120, (baselineData.heightCm || 160) - 1),
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                          >
                            -
                          </button>
                          <div className="flex items-center gap-0.5">
                            <span
                              className="w-7 h-8 border-2 border-slate-400 bg-slate-100 rounded-xs flex items-center justify-center font-mono font-black text-sm text-slate-700 shadow-2xs"
                              title="Preimpreso '1'"
                            >
                              1
                            </span>
                            {String(Math.round(baselineData.heightCm || 162))
                              .slice(1)
                              .padStart(2, "0")
                              .slice(-2)
                              .split("")
                              .map((digit, i) => (
                                <span
                                  key={i}
                                  className="w-7 h-8 border-2 border-slate-400 bg-white rounded-xs flex items-center justify-center font-mono font-black text-sm text-slate-900 shadow-2xs"
                                >
                                  {digit}
                                </span>
                              ))}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setBaselineData({
                                ...baselineData,
                                heightCm: Math.min(210, (baselineData.heightCm || 160) + 1),
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                          >
                            +
                          </button>
                          <span className="text-xs font-bold text-slate-700 ml-1">cm</span>
                        </div>
                      </div>

                      {/* Cálculo Dinámico de IMC */}
                      <div
                        className={`p-2.5 rounded-lg border flex items-center justify-between ${
                          isBasalObesity || isBasalUnderweight
                            ? "bg-amber-100 border-amber-300 text-amber-950"
                            : isBasalOverweight
                            ? "bg-amber-50 border-amber-200 text-amber-900"
                            : "bg-emerald-50 border-emerald-200 text-emerald-900"
                        }`}
                      >
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider block">IMC Pregestacional:</span>
                          <span className="text-xs font-black">
                            {basalImc ? `${basalImc} kg/m²` : "--"}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isBasalUnderweight
                                ? "bg-amber-300 text-amber-950 border border-amber-400"
                                : isBasalOverweight
                                ? "bg-amber-200 text-amber-900 border border-amber-300"
                                : isBasalObesity
                                ? "bg-amber-400 text-amber-950 border border-amber-500 font-black"
                                : "bg-emerald-200 text-emerald-900 border border-emerald-300"
                            }`}
                          >
                            {isBasalUnderweight
                              ? "Bajo Peso [ALERTA]"
                              : isBasalOverweight
                              ? "Sobrepeso [ALERTA]"
                              : isBasalObesity
                              ? "Obesidad [ALERTA]"
                              : "Peso Adecuado (Eutrófica)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 4: TIPO DE SANGRE & FACTOR RH (SPAN 2 COLS) */}
                  <div className="lg:col-span-2 p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                          Tipo de sangre
                        </span>
                        {baselineData.rhFactor === "Rh (-) Sensibilizada" && (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black border border-red-700 animate-pulse">
                            🟥 SEGUIMIENTO CONTINUO: ISOINMUNIZACIÓN RH
                          </span>
                        )}
                        {(baselineData.rhFactor === "Rh (-) No Sensibilizada" || baselineData.rhFactor === "Rh (-) Desconocida") && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black border border-amber-500">
                            🟨 ALERTA: GESTANTE RH NEGATIVO
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Inmunohematología</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Grupo ABO */}
                      <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-800 block uppercase tracking-wide">
                          Grupo:
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          {["A", "B", "AB", "O"].map((grp) => (
                            <label
                              key={grp}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-all ${
                                baselineData.bloodGroup === grp
                                  ? "bg-slate-900 border-slate-900 text-white font-black shadow-xs ring-2 ring-slate-400"
                                  : "bg-white border-slate-300 hover:border-slate-400 text-slate-800 font-bold"
                              }`}
                            >
                              <span className="text-sm font-mono">{grp}</span>
                              <input
                                type="radio"
                                name="bloodGroupRadio"
                                checked={baselineData.bloodGroup === grp}
                                onChange={() => setBaselineData({ ...baselineData, bloodGroup: grp })}
                                className="sr-only"
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Factor Rh */}
                      <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-800 block uppercase tracking-wide">
                          Factor Rh:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Rh (+) [ ] */}
                          <label
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                              baselineData.rhFactor === "Rh (+)" || !baselineData.rhFactor
                                ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs"
                                : "bg-white border-slate-200 text-slate-700"
                            }`}
                          >
                            <span className="text-xs font-semibold">Rh (+)</span>
                            <input
                              type="radio"
                              name="rhFactorRadio"
                              checked={baselineData.rhFactor === "Rh (+)" || !baselineData.rhFactor}
                              onChange={() => setBaselineData({ ...baselineData, rhFactor: "Rh (+)" })}
                              className="text-emerald-600 focus:ring-0"
                            />
                          </label>

                          {/* Rh(-) Sen Desc [ALERTA] */}
                          <label
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                              baselineData.rhFactor === "Rh (-) Desconocida"
                                ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                                : "bg-amber-50/70 border-amber-200 text-amber-900"
                            }`}
                            title="Sensibilización desconocida: solicitar Coombs indirecto"
                          >
                            <span className="text-xs font-bold">Rh(-) Sen Desc [ALERTA]</span>
                            <input
                              type="radio"
                              name="rhFactorRadio"
                              checked={baselineData.rhFactor === "Rh (-) Desconocida"}
                              onChange={() => setBaselineData({ ...baselineData, rhFactor: "Rh (-) Desconocida" })}
                              className="text-amber-600 focus:ring-0"
                            />
                          </label>

                          {/* Rh(-) No Sen [ALERTA] */}
                          <label
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                              baselineData.rhFactor === "Rh (-) No Sensibilizada"
                                ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                                : "bg-amber-50/70 border-amber-200 text-amber-900"
                            }`}
                            title="No sensibilizada: indicar profilaxis con Ig anti-D"
                          >
                            <span className="text-xs font-bold">Rh(-) No Sen [ALERTA]</span>
                            <input
                              type="radio"
                              name="rhFactorRadio"
                              checked={baselineData.rhFactor === "Rh (-) No Sensibilizada"}
                              onChange={() => setBaselineData({ ...baselineData, rhFactor: "Rh (-) No Sensibilizada" })}
                              className="text-amber-600 focus:ring-0"
                            />
                          </label>

                          {/* Rh(-) Sen [ROJO] */}
                          <label
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                              baselineData.rhFactor === "Rh (-) Sensibilizada"
                                ? "bg-red-600 border-red-700 text-white font-black shadow-xs ring-2 ring-red-400"
                                : "bg-red-50 border-red-200 text-red-900 font-bold"
                            }`}
                            title="Seguimiento continuo: isoinmunización Rh confirmada"
                          >
                            <span className="text-xs font-bold">Rh(-) Sen [ROJO]</span>
                            <input
                              type="radio"
                              name="rhFactorRadio"
                              checked={baselineData.rhFactor === "Rh (-) Sensibilizada"}
                              onChange={() => setBaselineData({ ...baselineData, rhFactor: "Rh (-) Sensibilizada" })}
                              className="text-red-600 focus:ring-0"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 5: HÁBITOS NOCIVOS (FUMA & DROGAS) (1 COL) */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Hábitos Nocivos
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Toxicología</span>
                    </div>

                    <div className="space-y-3">
                      {/* Fuma */}
                      <div
                        className={`p-2.5 rounded-lg border transition-all ${
                          (baselineData.smokerCigarettesDay || 0) > 0
                            ? "bg-amber-100 border-amber-300 text-amber-950"
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold uppercase">Fuma:</span>
                          {(baselineData.smokerCigarettesDay || 0) > 0 && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-300 text-amber-950 border border-amber-400">
                              ALERTA
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-600">N° Cigarros / día:</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              max={60}
                              value={baselineData.smokerCigarettesDay || 0}
                              onChange={(e) =>
                                setBaselineData({
                                  ...baselineData,
                                  smokerCigarettesDay: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className="w-14 text-center font-mono font-bold text-xs border border-slate-300 rounded bg-white py-1"
                            />
                            <span className="text-xs text-slate-600">cig/d</span>
                          </div>
                        </div>
                      </div>

                      {/* Drogas */}
                      <div
                        className={`p-2.5 rounded-lg border transition-all ${
                          baselineData.drugsUse === true
                            ? "bg-red-50 border-red-300 text-red-950 ring-1 ring-red-400"
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold uppercase">Drogas:</span>
                          {baselineData.drugsUse === true && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-red-600 text-white border border-red-700">
                              SEGUIMIENTO ROJO
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Si [ROJO] */}
                          <label
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                              baselineData.drugsUse === true
                                ? "bg-red-600 border-red-700 text-white font-black shadow-xs ring-1 ring-red-400"
                                : "bg-red-50 border-red-200 text-red-900 font-bold"
                            }`}
                            title="Seguimiento continuo: consumo de sustancias"
                          >
                            <span className="text-xs font-bold">Si [ROJO]</span>
                            <input
                              type="radio"
                              name="drugsUseRadio"
                              checked={baselineData.drugsUse === true}
                              onChange={() => setBaselineData({ ...baselineData, drugsUse: true })}
                              className="text-red-600 focus:ring-0"
                            />
                          </label>

                          {/* No [ ] */}
                          <label
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                              baselineData.drugsUse !== true
                                ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                                : "bg-white border-slate-200 text-slate-700"
                            }`}
                          >
                            <span className="text-xs font-semibold">No</span>
                            <input
                              type="radio"
                              name="drugsUseRadio"
                              checked={baselineData.drugsUse !== true}
                              onChange={() => setBaselineData({ ...baselineData, drugsUse: false })}
                              className="text-emerald-600 focus:ring-0"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 6.3 Nota Clínica de Vigilancia Obstétrica */}
                <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-200 text-blue-900 flex items-center justify-center shrink-0 mt-0.5">
                    <FlaskConical className="w-4 h-4 text-blue-700" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                        Evaluación Inmunohematológica & Factores Fisiológicos Basales
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200 text-blue-950 font-semibold border border-blue-300">
                        Norma Técnica MINSA
                      </span>
                    </div>
                    <p className="text-xs text-blue-950 italic font-semibold leading-relaxed">
                      El peso pregestacional permite calcular el IMC basal y definir la meta de ganancia ponderal durante el embarazo.
                    </p>
                    <p className="text-[11px] text-blue-900/90 leading-tight">
                      La gestante con <strong>Rh(-) Sensibilizada</strong> o consumo de <strong>Drogas</strong> se estratifica de inmediato como <strong>Alto Riesgo Obstétrico (ARO)</strong> con seguimiento continuo por medicina materno-fetal.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
  );
}
