"use client";

import React from "react";
import { Calendar, AlertTriangle, Check, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { PrenatalBaselineData } from "@/types/medical";
import { calculateNaegeleFPP } from "@/lib/prenatalCalculators";

interface Section7EmbarazoActualProps {
  isOpen: boolean;
  onToggle: () => void;
  baselineData: PrenatalBaselineData;
  setBaselineData: React.Dispatch<React.SetStateAction<PrenatalBaselineData>>;
  currentGestAge: { weeks: number; days: number; totalDays: number; formatted: string };
}

export function Section7EmbarazoActual({
  isOpen,
  onToggle,
  baselineData,
  setBaselineData,
  currentGestAge,
}: Section7EmbarazoActualProps) {
  const isFumDoubtAlert = baselineData.fumDoubt === true;
  const isHospitalizedAlert = baselineData.hospitalized === true;
  const isEmergencyAlert = baselineData.hadEmergency === true;
  const isViolenceAlert = baselineData.violenceScreening?.violenceDetected === true;

  const section7AlertsCount =
    (isFumDoubtAlert ? 1 : 0) +
    (isHospitalizedAlert ? 1 : 0) +
    (isEmergencyAlert ? 1 : 0) +
    (isViolenceAlert ? 1 : 0);

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center shrink-0">
            7
          </span>
          <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
            DATOS BASALES DEL EMBARAZO ACTUAL (FUM, ECOGRAFÍA, FPP, HOSPITALIZACIÓN & VIOLENCIA)
          </span>

          {/* Badges de alerta */}
          <div className="hidden sm:flex items-center gap-1.5">
            {section7AlertsCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black border border-amber-500 shadow-2xs">
                🟨 {section7AlertsCount} {section7AlertsCount === 1 ? "Alerta" : "Alertas"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                <Check className="w-3 h-3 text-emerald-600" />
                FUM confiable & sin eventos agudos
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
        <div className="p-4 sm:p-6 space-y-4 text-xs border-t border-border bg-white">

          {/* Acción Rápida: Recalcular Naegele */}
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs text-slate-500 font-medium">Cronología de la gestación actual:</span>
            <button
              type="button"
              onClick={() => {
                const calculated = calculateNaegeleFPP(baselineData.fum);
                setBaselineData({
                  ...baselineData,
                  fpp: calculated,
                  fumDoubt: false,
                });
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Recalcular FPP con Regla de Naegele"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Recalcular FPP Naegele</span>
            </button>
          </div>

          {/* 7.2 Grid de 4 Bloques (2x2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

            {/* BLOQUE 1: FUM, ECOGRAFÍA & FPP */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5">
              <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Fecha última Menstruación
                </span>
                <span className="text-[10px] text-slate-500 font-mono">FUM & Ecografía Precoz</span>
              </div>

              {/* FUM y Duda */}
              <div className="p-3 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">FUM :</span>
                  <input
                    type="date"
                    value={baselineData.fum}
                    onChange={(e) => {
                      const newFum = e.target.value;
                      setBaselineData({
                        ...baselineData,
                        fum: newFum,
                        fpp: calculateNaegeleFPP(newFum),
                      });
                    }}
                    className="text-xs font-mono font-bold px-2.5 py-1.5 rounded-md border border-slate-300 bg-slate-50 text-slate-800"
                  />
                </div>

                {/* Duda: Si [ALERTA] / No */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Duda :</span>
                  <div className="flex items-center gap-1.5">
                    <label
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${baselineData.fumDoubt
                          ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                          : "bg-amber-50/60 border-amber-200 text-amber-900"
                        }`}
                    >
                      <span className="text-xs">Si [ALERTA]</span>
                      <input
                        type="radio"
                        name="fumDoubtRadio"
                        checked={baselineData.fumDoubt === true}
                        onChange={() => setBaselineData({ ...baselineData, fumDoubt: true })}
                        className="text-amber-600 focus:ring-0"
                      />
                    </label>

                    <label
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${!baselineData.fumDoubt
                          ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                          : "bg-white border-slate-200 text-slate-700"
                        }`}
                    >
                      <span className="text-xs">No</span>
                      <input
                        type="radio"
                        name="fumDoubtRadio"
                        checked={!baselineData.fumDoubt}
                        onChange={() => setBaselineData({ ...baselineData, fumDoubt: false })}
                        className="text-emerald-600 focus:ring-0"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* EG. (Ecografía) - "la primera ecografía" */}
              <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">EG. (Ecografía) :</span>
                    <span className="text-[10px] text-slate-500 italic">la primera ecografía</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={baselineData.ultrasoundNoApplies === true}
                      onChange={(e) =>
                        setBaselineData({
                          ...baselineData,
                          ultrasoundNoApplies: e.target.checked,
                        })
                      }
                      className="rounded text-primary focus:ring-0"
                    />
                    <span>No Aplica</span>
                  </label>
                </div>

                {!baselineData.ultrasoundNoApplies && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    {/* Casillas [ ][ ] Sem. */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setBaselineData({
                            ...baselineData,
                            ultrasoundGestationalAgeWeeks: Math.max(
                              4,
                              (baselineData.ultrasoundGestationalAgeWeeks || 8) - 1
                            ),
                          })
                        }
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                      >
                        -
                      </button>
                      <div className="flex items-center gap-0.5">
                        {String(baselineData.ultrasoundGestationalAgeWeeks || 7)
                          .padStart(2, "0")
                          .slice(-2)
                          .split("")
                          .map((d, i) => (
                            <span
                              key={i}
                              className="w-7 h-8 border-2 border-slate-400 bg-white rounded-xs flex items-center justify-center font-mono font-black text-sm text-slate-900 shadow-2xs"
                            >
                              {d}
                            </span>
                          ))}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setBaselineData({
                            ...baselineData,
                            ultrasoundGestationalAgeWeeks: Math.min(
                              42,
                              (baselineData.ultrasoundGestationalAgeWeeks || 8) + 1
                            ),
                          })
                        }
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                      >
                        +
                      </button>
                      <span className="text-xs font-bold text-slate-700 ml-1">Sem.</span>
                    </div>

                    {/* Fecha de ecografía */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-600">Fecha :</span>
                      <input
                        type="date"
                        value={baselineData.ultrasoundDate || ""}
                        onChange={(e) =>
                          setBaselineData({
                            ...baselineData,
                            ultrasoundDate: e.target.value,
                          })
                        }
                        className="text-xs font-mono font-medium px-2 py-1 rounded border border-slate-300 bg-slate-50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Fecha Probable de Parto (FPP) */}
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-sky-950 uppercase tracking-wide block">
                    Fecha Probable de Parto:
                  </span>
                  <span className="text-[10px] text-sky-800">
                    EG Actual: <strong>{currentGestAge.formatted}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={baselineData.fpp}
                    onChange={(e) =>
                      setBaselineData({
                        ...baselineData,
                        fpp: e.target.value,
                      })
                    }
                    className="text-xs font-mono font-black px-2.5 py-1.5 rounded-md border border-sky-300 bg-white text-sky-950 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* BLOQUE 2: HOSPITALIZACIÓN */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5">
              <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Hospitalización:
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Ingreso Hospitalario</span>
              </div>

              {/* Hospitalización: Si [ALERTA] / No */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-xs font-bold text-slate-800">Hospitalización:</span>
                <div className="flex items-center gap-1.5">
                  <label
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${baselineData.hospitalized === true
                        ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                        : "bg-amber-50/60 border-amber-200 text-amber-900"
                      }`}
                  >
                    <span className="text-xs">Si [ALERTA]</span>
                    <input
                      type="radio"
                      name="hospitalizedRadio"
                      checked={baselineData.hospitalized === true}
                      onChange={() => setBaselineData({ ...baselineData, hospitalized: true })}
                      className="text-amber-600 focus:ring-0"
                    />
                  </label>

                  <label
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${baselineData.hospitalized !== true
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                        : "bg-white border-slate-200 text-slate-700"
                      }`}
                  >
                    <span className="text-xs">No</span>
                    <input
                      type="radio"
                      name="hospitalizedRadio"
                      checked={baselineData.hospitalized !== true}
                      onChange={() => setBaselineData({ ...baselineData, hospitalized: false })}
                      className="text-emerald-600 focus:ring-0"
                    />
                  </label>
                </div>
              </div>

              {/* Fecha de Hospitalización */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Fecha:</span>
                <input
                  type="date"
                  value={baselineData.hospitalizationHistory?.date || ""}
                  onChange={(e) =>
                    setBaselineData({
                      ...baselineData,
                      hospitalizationHistory: {
                        ...(baselineData.hospitalizationHistory || {}),
                        date: e.target.value,
                      },
                    })
                  }
                  className="text-xs font-mono font-medium px-2 py-1 rounded border border-slate-300 bg-slate-50"
                />
              </div>

              {/* Diagnóstico */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-800 block">Diagnóstico:</span>
                <input
                  type="text"
                  value={baselineData.hospitalizationHistory?.diagnosis || ""}
                  onChange={(e) =>
                    setBaselineData({
                      ...baselineData,
                      hospitalizationHistory: {
                        ...(baselineData.hospitalizationHistory || {}),
                        diagnosis: e.target.value,
                      },
                    })
                  }
                  placeholder="ej. Amenaza de parto pretérmino, Hiperémesis gravídica..."
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-slate-50 font-medium"
                />
              </div>

              {/* CIE 10: [ ][ ][ ][ ][ ] */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">CIE 10:</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, idx) => {
                      const char = (baselineData.hospitalizationHistory?.cie10 || "")[idx] || "";
                      return (
                        <span
                          key={idx}
                          className="w-6 h-7 border-2 border-slate-400 bg-white rounded-xs flex items-center justify-center font-mono font-bold text-xs text-slate-900 shadow-2xs"
                        >
                          {char}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {["O20.0", "O60.0", "O14.0", "O21.0"].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() =>
                        setBaselineData({
                          ...baselineData,
                          hospitalizationHistory: {
                            ...(baselineData.hospitalizationHistory || {}),
                            cie10: code,
                          },
                        })
                      }
                      className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 hover:bg-slate-200 font-mono font-bold text-slate-700"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* BLOQUE 3: EMERGENCIA */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5">
              <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Emergencia
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Atención Urgente</span>
              </div>

              {/* Atención por Emergencia: Si [ALERTA] / No */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-xs font-bold text-slate-800">Atención por Emergencia:</span>
                <div className="flex items-center gap-1.5">
                  <label
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${baselineData.hadEmergency === true
                        ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                        : "bg-amber-50/60 border-amber-200 text-amber-900"
                      }`}
                  >
                    <span className="text-xs">Si [ALERTA]</span>
                    <input
                      type="radio"
                      name="emergencyRadio"
                      checked={baselineData.hadEmergency === true}
                      onChange={() => setBaselineData({ ...baselineData, hadEmergency: true })}
                      className="text-amber-600 focus:ring-0"
                    />
                  </label>

                  <label
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${baselineData.hadEmergency !== true
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                        : "bg-white border-slate-200 text-slate-700"
                      }`}
                  >
                    <span className="text-xs">No</span>
                    <input
                      type="radio"
                      name="emergencyRadio"
                      checked={baselineData.hadEmergency !== true}
                      onChange={() => setBaselineData({ ...baselineData, hadEmergency: false })}
                      className="text-emerald-600 focus:ring-0"
                    />
                  </label>
                </div>
              </div>

              {/* Fecha de Emergencia */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Fecha:</span>
                <input
                  type="date"
                  value={baselineData.emergencyHistory?.date || ""}
                  onChange={(e) =>
                    setBaselineData({
                      ...baselineData,
                      emergencyHistory: {
                        ...(baselineData.emergencyHistory || {}),
                        date: e.target.value,
                      },
                    })
                  }
                  className="text-xs font-mono font-medium px-2 py-1 rounded border border-slate-300 bg-slate-50"
                />
              </div>

              {/* Diagnóstico */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-800 block">Diagnóstico:</span>
                <input
                  type="text"
                  value={baselineData.emergencyHistory?.diagnosis || ""}
                  onChange={(e) =>
                    setBaselineData({
                      ...baselineData,
                      emergencyHistory: {
                        ...(baselineData.emergencyHistory || {}),
                        diagnosis: e.target.value,
                      },
                    })
                  }
                  placeholder="ej. Sangrado vaginal 1er trimestre, Cólico nefrítico..."
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-slate-50 font-medium"
                />
              </div>

              {/* CIE 10: [ ][ ][ ][ ][ ] */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">CIE 10:</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, idx) => {
                      const char = (baselineData.emergencyHistory?.cie10 || "")[idx] || "";
                      return (
                        <span
                          key={idx}
                          className="w-6 h-7 border-2 border-slate-400 bg-white rounded-xs flex items-center justify-center font-mono font-bold text-xs text-slate-900 shadow-2xs"
                        >
                          {char}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {["O20.0", "O23.4", "O26.8", "N23"].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() =>
                        setBaselineData({
                          ...baselineData,
                          emergencyHistory: {
                            ...(baselineData.emergencyHistory || {}),
                            cie10: code,
                          },
                        })
                      }
                      className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 hover:bg-slate-200 font-mono font-bold text-slate-700"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* BLOQUE 4: VIOLENCIA / GÉNERO */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5">
              <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Violencia / género
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Tamizaje MINSA</span>
              </div>

              {/* Ficha Tamizaje: Si / No */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Ficha Tamizaje:</span>
                  <span className="text-[10px] text-slate-500">Aplicación de cuestionario oficial</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setBaselineData({
                        ...baselineData,
                        violenceScreening: {
                          ...(baselineData.violenceScreening || {}),
                          screeningDone: true,
                        },
                      })
                    }
                    className={`px-3 py-1 text-xs rounded-md font-bold transition-all cursor-pointer ${baselineData.violenceScreening?.screeningDone !== false
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
                        violenceScreening: {
                          ...(baselineData.violenceScreening || {}),
                          screeningDone: false,
                        },
                      })
                    }
                    className={`px-3 py-1 text-xs rounded-md font-bold transition-all cursor-pointer ${baselineData.violenceScreening?.screeningDone === false
                        ? "bg-slate-800 text-white shadow-2xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Violencia: Si [ALERTA] / No */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Violencia:</span>
                  <span className="text-[10px] text-slate-500">Detección positiva en tamizaje</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <label
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${baselineData.violenceScreening?.violenceDetected === true
                        ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                        : "bg-amber-50/60 border-amber-200 text-amber-900"
                      }`}
                  >
                    <span className="text-xs">Si [ALERTA]</span>
                    <input
                      type="radio"
                      name="violenceDetectedRadio"
                      checked={baselineData.violenceScreening?.violenceDetected === true}
                      onChange={() =>
                        setBaselineData({
                          ...baselineData,
                          violenceScreening: {
                            ...(baselineData.violenceScreening || {}),
                            violenceDetected: true,
                          },
                        })
                      }
                      className="text-amber-600 focus:ring-0"
                    />
                  </label>

                  <label
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${baselineData.violenceScreening?.violenceDetected !== true
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                        : "bg-white border-slate-200 text-slate-700"
                      }`}
                  >
                    <span className="text-xs">No</span>
                    <input
                      type="radio"
                      name="violenceDetectedRadio"
                      checked={baselineData.violenceScreening?.violenceDetected !== true}
                      onChange={() =>
                        setBaselineData({
                          ...baselineData,
                          violenceScreening: {
                            ...(baselineData.violenceScreening || {}),
                            violenceDetected: false,
                          },
                        })
                      }
                      className="text-emerald-600 focus:ring-0"
                    />
                  </label>
                </div>
              </div>

              {/* Fecha de Tamizaje */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Fecha:</span>
                <input
                  type="date"
                  value={baselineData.violenceScreening?.date || ""}
                  onChange={(e) =>
                    setBaselineData({
                      ...baselineData,
                      violenceScreening: {
                        ...(baselineData.violenceScreening || {}),
                        date: e.target.value,
                      },
                    })
                  }
                  className="text-xs font-mono font-medium px-2 py-1 rounded border border-slate-300 bg-slate-50"
                />
              </div>
            </div>

          </div>

          {/* 7.3 Alerta clínica si se detecta violencia */}
          {baselineData.violenceScreening?.violenceDetected === true && (
            <div className="p-3.5 rounded-xl bg-amber-100 border border-amber-300 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-950 uppercase block">
                  Alerta de Protección Integral &bull; Violencia de Género Detectada
                </span>
                <p className="text-[11px] text-amber-900 mt-0.5">
                  Activar protocolo de soporte emocional y confidencial. Referir a Servicio Social, Psicología y coordinar apoyo con Centro Emergencia Mujer (CEM / Línea 100).
                </p>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
