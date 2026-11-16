"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Building2, ShieldAlert, HeartHandshake } from "lucide-react";
import { PrenatalRiskReport } from "@/types/medical";

interface TabRiesgoAroProps {
  risksReport: PrenatalRiskReport;
  attendingDoctor: string;
}

export function TabRiesgoAro({
  risksReport,
  attendingDoctor,
}: TabRiesgoAroProps) {
  return (
            <div className="space-y-5">
              {/* Banner Semáforo ARO */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs ${
                  risksReport.isHighRisk
                    ? "bg-red-50/80 border-red-300 text-red-950"
                    : "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      risksReport.isHighRisk
                        ? "bg-red-100 border-red-300 text-red-600"
                        : "bg-emerald-100 border-emerald-300 text-emerald-600"
                    }`}
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-heading font-black tracking-tight">
                        {risksReport.riskCategory}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          risksReport.isHighRisk
                            ? "bg-red-200/70 text-red-900 border-red-300"
                            : "bg-emerald-200/70 text-emerald-900 border-emerald-300"
                        }`}
                      >
                        NTS N° 105 MINSA
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed max-w-2xl">
                      {risksReport.isHighRisk
                        ? "Esta gestante presenta factores clínicos, antecedentes sociodemográficos o hallazgos paraclínicos que incrementan el riesgo materno-perinatal. Requiere atención médica especializada por Ginecología y Obstetricia, controles más frecuentes y plan de parto en establecimiento FONE/FONP."
                        : "Gestación de curso fisiológico sin factores de riesgo activos detectados al momento de la evaluación. Continúa control prenatal normado en establecimiento Nivel I / II."}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-2.5 rounded-xl bg-white/80 border border-slate-200 text-center shrink-0 self-stretch sm:self-auto flex sm:flex-col justify-between items-center sm:items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Criterios Detectados
                  </span>
                  <span
                    className={`text-2xl font-heading font-black ${
                      risksReport.isHighRisk ? "text-red-700" : "text-emerald-700"
                    }`}
                  >
                    {risksReport.warningFlags.length}
                  </span>
                </div>
              </div>

              {/* Lista de Criterios y Factores de Alerta Activos */}
              <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
                <div className="p-4 bg-slate-50/80 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                      Factores de Alerta y Riesgo Identificados en esta Paciente
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-muted">
                    {risksReport.warningFlags.length} alerta(s)
                  </span>
                </div>

                <div className="p-4">
                  {risksReport.warningFlags.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {risksReport.warningFlags.map((flag, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-950"
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <div className="space-y-0.5">
                            <strong className="block font-bold">{flag}</strong>
                            <span className="text-[11px] text-amber-800/90 block">
                              Monitoreo continuo en cada atención prenatal y registro en historia clínica.
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-emerald-800 space-y-1 bg-emerald-50/40 rounded-xl border border-emerald-200/60">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                      <p className="text-xs font-bold">Sin factores de riesgo obstétrico detectados</p>
                      <p className="text-[11px] text-emerald-700">
                        La gestante califica como Bajo Riesgo Obstétrico (BRO). Mantener controles periódicos cada 4 semanas.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Plan de Parto Institucional & Signos de Alarma MINSA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plan de Parto */}
                <div className="p-4 rounded-xl border border-border bg-white shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                      Plan de Parto Institucional
                    </h4>
                  </div>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Lugar Previsto para el Parto:</span>
                      <strong className="text-slate-900 block">
                        {risksReport.isHighRisk
                          ? "Establecimiento FONE / Hospital Nivel II-2 o III (Capacidad quirúrgica y UCI neonatal)"
                          : "Establecimiento FONP / Centro Quirúrgico CENDO o Institucional Nivel II"}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Médico Especialista Responsable:</span>
                      <strong className="text-slate-900 block">DR. {attendingDoctor} &bull; Gineco-Obstetra</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Acompañante Elegido:</span>
                      <strong className="text-slate-900 block">Familiar directo / Pareja autorizada en triaje</strong>
                    </div>
                  </div>
                </div>

                {/* Signos de Alarma Obstétrica */}
                <div className="p-4 rounded-xl border border-red-200/80 bg-red-50/30 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-red-900">
                    <HeartHandshake className="w-4 h-4 text-red-600" />
                    <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider">
                      Signos de Alarma para la Gestante (Emergencia 24h)
                    </h4>
                  </div>
                  <ul className="text-xs text-red-950 space-y-1.5 list-disc list-inside">
                    <li>Sangrado vaginal de cualquier cuantía o pérdida de líquido amniótico.</li>
                    <li>Dolor abdominal intenso tipo contracción uterina antes de tiempo.</li>
                    <li>Disminución o ausencia de movimientos fetales (&gt; 20 semanas).</li>
                    <li>Dolor de cabeza intenso (cefalea), zumbido de oídos (tinnitus) o visión borrosa.</li>
                    <li>Hinchazón repentina de manos, pies o cara (edema súbito).</li>
                    <li>Fiebre (&gt; 38°C) o escalofríos persistentes.</li>
                  </ul>
                  <div className="pt-1 text-[11px] font-bold text-red-800">
                    &bull; Ante cualquiera de estos signos, acudir de inmediato al Servicio de Emergencia Obstétrica más cercano o llamar al SAMU 106.
                  </div>
                </div>
              </div>
            </div>
  );
}
