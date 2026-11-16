"use client";

import React from "react";
import { Activity, Plus, Trash2 } from "lucide-react";
import { PrenatalVisitItem } from "@/types/medical";

interface TabConsultasMatrizProps {
  visitsList: PrenatalVisitItem[];
  setVisitsList: React.Dispatch<React.SetStateAction<PrenatalVisitItem[]>>;
  handleAddQuickVisit: () => void;
  handleDeleteVisit: (index: number) => void;
}

export function TabConsultasMatriz({
  visitsList,
  setVisitsList,
  handleAddQuickVisit,
  handleDeleteVisit,
}: TabConsultasMatrizProps) {
  return (
            <div className="space-y-5">
              {/* Barra de Título y Acción Rápida */}
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <h3 className="text-sm font-heading font-extrabold text-teal-950 uppercase tracking-wide">
                      Matriz Longitudinal de 9 Consultas Prenatales (Norma Técnica MINSA)
                    </h3>
                  </div>
                  <p className="text-xs text-teal-800">
                    Registre y monitoree la evolución clínica, biometría fetal, hemodinamia y suplementación en cada una de las 9 visitas normadas.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuickVisit}
                  disabled={visitsList.length >= 9}
                  className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Registrar Atención N° {visitsList.length + 1}</span>
                </button>
              </div>

              {/* Indicadores KPI de Control Prenatal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-border bg-white shadow-2xs">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Atenciones Realizadas</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-heading font-black text-heading">{visitsList.length}</span>
                    <span className="text-xs font-bold text-muted">/ 9 normadas</span>
                  </div>
                  <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((visitsList.length / 9) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-white shadow-2xs">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Última Presión Arterial</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-lg font-heading font-bold text-heading">
                      {visitsList[visitsList.length - 1]?.bloodPressure || "—"}
                    </span>
                    <span className="text-[10px] text-muted">mmHg</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 block mt-1">
                    Meta: &lt; 140/90 mmHg
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-white shadow-2xs">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Última F.C.F. Fetal</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-lg font-heading font-bold text-heading">
                      {visitsList[visitsList.length - 1]?.fetalHeartRate ? `${visitsList[visitsList.length - 1].fetalHeartRate} lpm` : "—"}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 block mt-1">
                    Rango normal: 120 - 160 lpm
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-white shadow-2xs">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Próxima Cita Prevista</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-sm font-heading font-bold text-primary truncate">
                      {visitsList[visitsList.length - 1]?.nextAppointmentDate || "Pendiente"}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 block mt-1">
                    Control cada 4 sem (&lt; 28s)
                  </span>
                </div>
              </div>

              {/* Tabla de Matriz Longitudinal Oficial */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                        <th className="p-3 w-48 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">
                          Parámetro Clínico MINSA
                        </th>
                        {Array.from({ length: 9 }).map((_, idx) => (
                          <th
                            key={idx}
                            className={`p-3 text-center min-w-[130px] border-r border-slate-200 ${
                              idx < visitsList.length
                                ? "bg-teal-50/70 text-teal-900 font-extrabold"
                                : "text-slate-400 bg-slate-50/40"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <span>Atención {idx + 1}</span>
                              {idx < visitsList.length && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVisit(idx)}
                                  className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Eliminar atención"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
                      {/* Fecha de Atención */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                          Fecha de Atención
                        </td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-r border-slate-100 font-mono">
                              {v ? (
                                <input
                                  type="date"
                                  value={v.visitDate}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].visitDate = e.target.value;
                                    setVisitsList(updated);
                                  }}
                                  className="text-xs text-center border border-slate-300 rounded px-1.5 py-1 w-28 font-mono bg-white focus:ring-1 focus:ring-teal-500"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Edad Gestacional */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                          Edad Gestacional (sem)
                        </td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-r border-slate-100 font-mono font-bold text-teal-800">
                              {v ? (
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    value={v.gestationalAgeWeeks}
                                    onChange={(e) => {
                                      const updated = [...visitsList];
                                      updated[idx].gestationalAgeWeeks = parseInt(e.target.value, 10) || 0;
                                      setVisitsList(updated);
                                    }}
                                    className="w-12 text-center border border-slate-300 rounded py-0.5 text-xs font-bold bg-white"
                                  />
                                  <span>sem</span>
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Peso Madre */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                          Peso Madre (kg)
                        </td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-r border-slate-100 font-mono">
                              {v ? (
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={v.maternalWeightKg}
                                    onChange={(e) => {
                                      const updated = [...visitsList];
                                      updated[idx].maternalWeightKg = parseFloat(e.target.value) || 0;
                                      setVisitsList(updated);
                                    }}
                                    className="w-14 text-center border border-slate-300 rounded py-0.5 text-xs bg-white"
                                  />
                                  <span>kg</span>
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Presión Arterial */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                          Presión Arterial (mmHg)
                        </td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          const isHigh = v && parseInt(v.bloodPressure.split("/")[1] || "0", 10) >= 90;
                          return (
                            <td key={idx} className={`p-2 text-center border-r border-slate-100 font-mono ${isHigh ? "bg-red-50" : ""}`}>
                              {v ? (
                                <input
                                  type="text"
                                  value={v.bloodPressure}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].bloodPressure = e.target.value;
                                    setVisitsList(updated);
                                  }}
                                  placeholder="110/70"
                                  className={`w-20 text-center border rounded py-0.5 text-xs font-bold ${
                                    isHigh ? "border-red-500 text-red-700 bg-red-100" : "border-slate-300 bg-white"
                                  }`}
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Altura Uterina */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                          Altura Uterina (cm)
                        </td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-r border-slate-100 font-mono">
                              {v ? (
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    value={v.uterineHeightCm}
                                    onChange={(e) => {
                                      const updated = [...visitsList];
                                      updated[idx].uterineHeightCm = parseInt(e.target.value, 10) || 0;
                                      setVisitsList(updated);
                                    }}
                                    className="w-12 text-center border border-slate-300 rounded py-0.5 text-xs bg-white"
                                  />
                                  <span>cm</span>
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* FCF (Latidos/min) */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                          F.C.F. Fetal (lpm)
                        </td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          const isFcfAbnormal = v && v.fetalHeartRate > 0 && (v.fetalHeartRate < 120 || v.fetalHeartRate > 160);
                          return (
                            <td key={idx} className={`p-2 text-center border-r border-slate-100 font-mono ${isFcfAbnormal ? "bg-red-50" : ""}`}>
                              {v ? (
                                <input
                                  type="number"
                                  value={v.fetalHeartRate || ""}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].fetalHeartRate = parseInt(e.target.value, 10) || 0;
                                    setVisitsList(updated);
                                  }}
                                  placeholder="140"
                                  className={`w-14 text-center border rounded py-0.5 text-xs font-bold ${
                                    isFcfAbnormal ? "border-red-500 text-red-700 bg-red-100" : "text-emerald-700 border-slate-300 bg-white"
                                  }`}
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Presentación / Posición */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                          Presentación / Situación
                        </td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-r border-slate-100 text-[11px]">
                              {v ? (
                                <div className="flex items-center justify-center gap-1 font-mono">
                                  <select
                                    value={v.fetusPresentation || "C"}
                                    onChange={(e) => {
                                      const updated = [...visitsList];
                                      updated[idx].fetusPresentation = e.target.value as any;
                                      setVisitsList(updated);
                                    }}
                                    className="border border-slate-300 rounded px-1 py-0.5 text-[11px] bg-white"
                                  >
                                    <option value="C">Cefálico (C)</option>
                                    <option value="P">Pelviano (P)</option>
                                    <option value="T">Transverso (T)</option>
                                    <option value="NA">N/A (&lt;28s)</option>
                                  </select>
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Mov. Fetales & Edema */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                          Mov. Fetales / Edema
                        </td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-r border-slate-100">
                              {v ? (
                                <div className="flex items-center justify-center gap-1 text-[11px] font-mono">
                                  <span title="Movimientos Fetales">MF: {v.fetalMovements || "++"}</span>
                                  <span>&bull;</span>
                                  <span title="Edema">Ed: {v.edema || "SE"}</span>
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Proteinuria */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                          Proteinuria Cualitativa
                        </td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-r border-slate-100 font-mono">
                              {v ? (
                                <select
                                  value={v.proteinuria || "-"}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].proteinuria = e.target.value as "-" | "+" | "++" | "+++" | "NSH";
                                    setVisitsList(updated);
                                  }}
                                  className="border border-slate-300 rounded px-1.5 py-0.5 text-[11px] bg-white font-mono"
                                >
                                  <option value="-">(-) Negativa</option>
                                  <option value="+">(+) 30 mg/dL</option>
                                  <option value="++">(++) 100 mg/dL</option>
                                  <option value="+++">(+++) 300 mg/dL</option>
                                  <option value="NSH">NSH (No se hizo)</option>
                                </select>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Suplementación Hierro / Calcio */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                          Suplementación (Fe / Ca)
                        </td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-r border-slate-100 text-[11px]">
                              {v ? (
                                <div className="flex items-center justify-center gap-2">
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={v.ironFolicAcidGiven}
                                      onChange={(e) => {
                                        const updated = [...visitsList];
                                        updated[idx].ironFolicAcidGiven = e.target.checked;
                                        setVisitsList(updated);
                                      }}
                                      className="rounded text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="font-bold text-teal-900">Fe</span>
                                  </label>
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={v.calciumGiven}
                                      onChange={(e) => {
                                        const updated = [...visitsList];
                                        updated[idx].calciumGiven = e.target.checked;
                                        setVisitsList(updated);
                                      }}
                                      className="rounded text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="font-bold text-teal-900">Ca</span>
                                  </label>
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Próxima Cita */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                          Próxima Cita
                        </td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-r border-slate-100 font-mono">
                              {v ? (
                                <input
                                  type="date"
                                  value={v.nextAppointmentDate}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].nextAppointmentDate = e.target.value;
                                    setVisitsList(updated);
                                  }}
                                  className="text-[11px] text-center border border-slate-300 rounded px-1 py-1 w-28 font-mono font-bold text-teal-800 bg-white"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {visitsList.length === 0 && (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/30 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 mx-auto flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-sm text-teal-950">
                      No hay atenciones prenatales registradas aún
                    </h4>
                    <p className="text-xs text-teal-700 max-w-md mx-auto mt-1">
                      Haga clic en <strong>"+ Registrar Atención N° 1"</strong> para abrir la primera visita médica con cálculo automático de edad gestacional y parámetros basales.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQuickVisit}
                    className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar Primera Atención Ahora</span>
                  </button>
                </div>
              )}
            </div>
  );
}
