"use client";

import React from "react";
import { AlertTriangle, Check, Stethoscope, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { PrenatalBaselineData } from "@/types/medical";

interface PhysicalExamItemDef {
  id: "clinicalExam" | "breastsExam" | "cervixExam" | "pelvisExam" | "dentalExam";
  detailKey: "clinicalExamDetail" | "breastsExamDetail" | "cervixExamDetail" | "pelvisExamDetail" | "dentalExamDetail";
  snippetName: string;
  title: string;
  subtitle: string;
  chips: string[];
}

const PHYSICAL_EXAM_ITEMS: PhysicalExamItemDef[] = [
  {
    id: "clinicalExam",
    detailKey: "clinicalExamDetail",
    snippetName: "Clínico:",
    title: "Examen Clínico General",
    subtitle: "Evaluación sistémica general: cardiopulmonar, abdomen, tiroides, piel, mucosas y miembros",
    chips: [
      "Palidez moderada/severa",
      "Edema pretibial (+/+++)",
      "Soplo cardiaco",
      "Bocio / Tiroides aumentada",
      "Varices marcadas",
      "Cicatriz operatoria",
    ],
  },
  {
    id: "breastsExam",
    detailKey: "breastsExamDetail",
    snippetName: "Mamas:",
    title: "Examen Clínico de Mamas",
    subtitle: "Inspección, simetría, palpación de nódulos y evaluación de pezones para lactancia materna",
    chips: [
      "Pezón plano / umbilicado",
      "Nódulo mamario palpable",
      "Mastalgia severa",
      "Galactorrea",
      "Secreción sanguinolenta",
      "Retracción cutánea",
    ],
  },
  {
    id: "cervixExam",
    detailKey: "cervixExamDetail",
    snippetName: "Cuello Uterino:",
    title: "Cuello Uterino (Especuloscopía)",
    subtitle: "Inspección visual del cérvix con espéculo, secreciones, ectropion sangrante o lesiones cervicales",
    chips: [
      "Ectropion sangrante al contacto",
      "Pólipo endocervical",
      "Cervicitis mucopurulenta",
      "Flujo vaginal anormal / leucorrea",
      "Lesión sospechosa",
      "Cuello corto",
    ],
  },
  {
    id: "pelvisExam",
    detailKey: "pelvisExamDetail",
    snippetName: "Pelvis:",
    title: "Pelvis (Pelvimetría Clínica)",
    subtitle: "Evaluación pelvimétrica (promontorio, espinas ciáticas, ángulo subpúbico y descarte de DCP)",
    chips: [
      "Pelvis estrecha / DCP probable",
      "Promontorio accesible (Conjugado < 10.5cm)",
      "Espinas ciáticas prominentes",
      "Ángulo subpúbico agudo (< 90°)",
      "Diámetro bi-isquiático reducido",
    ],
  },
  {
    id: "dentalExam",
    detailKey: "dentalExamDetail",
    snippetName: "Odont.:",
    title: "Odontoestomatológico (Salud Bucal)",
    subtitle: "Evaluación bucodental para descarte de focos sépticos, caries profundas, periodontitis o gingivitis gestacional",
    chips: [
      "Caries dental activa múltiple",
      "Gingivitis gestacional sangrante",
      "Enfermedad periodontal",
      "Foco séptico / Infección activa",
      "Piezas ausentes",
      "Dolor / flemón activo",
    ],
  },
];

interface Section8ExamenFisicoProps {
  isOpen: boolean;
  onToggle: () => void;
  baselineData: PrenatalBaselineData;
  setBaselineData: React.Dispatch<React.SetStateAction<PrenatalBaselineData>>;
}

export function Section8ExamenFisico({
  isOpen,
  onToggle,
  baselineData,
  setBaselineData,
}: Section8ExamenFisicoProps) {
  const physicalExamAlertsCount = [
    baselineData.clinicalExam,
    baselineData.breastsExam,
    baselineData.cervixExam,
    baselineData.pelvisExam,
    baselineData.dentalExam,
  ].filter((status) => status === "Sin Examen" || status === "Patológico").length;

  const handleMarkAllPhysicalExamsNormal = () => {
    setBaselineData((prev) => ({
      ...prev,
      clinicalExam: "Normal",
      clinicalExamDetail: "",
      breastsExam: "Normal",
      breastsExamDetail: "",
      cervixExam: "Normal",
      cervixExamDetail: "",
      pelvisExam: "Normal",
      pelvisExamDetail: "",
      dentalExam: "Normal",
      dentalExamDetail: "",
    }));
  };

  const handleResetPhysicalExams = () => {
    setBaselineData((prev) => ({
      ...prev,
      clinicalExam: "Sin Examen",
      clinicalExamDetail: "",
      breastsExam: "Sin Examen",
      breastsExamDetail: "",
      cervixExam: "Sin Examen",
      cervixExamDetail: "",
      pelvisExam: "Sin Examen",
      pelvisExamDetail: "",
      dentalExam: "Sin Examen",
      dentalExamDetail: "",
    }));
  };


  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0">
            8
          </span>
          <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
            EXAMEN FÍSICO BASAL (CLÍNICO, MAMAS, CUELLO UTERINO, PELVIS & ODONTOLÓGICO)
          </span>
          <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
            Formato Oficial MINSA / CLAP
          </span>
        </div>
        <div className="flex items-center gap-2">
          {physicalExamAlertsCount === 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Normal Completo (5/5)
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {physicalExamAlertsCount} {physicalExamAlertsCount === 1 ? "Alerta" : "Alertas"} (Sin Examen / Patológico)
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 space-y-4 text-xs border-t border-border bg-white">

          {/* Acciones Rápidas */}
          <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
            <span className="text-xs text-slate-500 font-medium">Evaluaciones físicas obligatorias:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllPhysicalExamsNormal}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Marcar todos los 5 exámenes como normales"
              >
                <Check className="w-3.5 h-3.5" />
                <span>✓ Marcar Todos Normales</span>
              </button>
              <button
                type="button"
                onClick={handleResetPhysicalExams}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                title="Restablecer todos los exámenes a Sin Examen"
              >
                <span>Restablecer</span>
              </button>
            </div>
          </div>

          {/* 8.3 Lista de las 5 Evaluaciones Físicas (Clínico, Mamas, Cuello Uterino, Pelvis, Odont.) */}
          <div className="space-y-3">
            {PHYSICAL_EXAM_ITEMS.map((item) => {
              const status = baselineData[item.id] || "Normal";
              const detail = baselineData[item.detailKey] || "";

              const isSinExamen = status === "Sin Examen";
              const isNormal = status === "Normal";
              const isPatologico = status === "Patológico";

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${isPatologico
                      ? "bg-amber-50/70 border-amber-400 ring-1 ring-amber-300/70 shadow-xs"
                      : isSinExamen
                        ? "bg-amber-50/40 border-amber-300 shadow-2xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Identificación del Examen con nombre oficial de la captura */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-black bg-slate-900 text-white uppercase tracking-wider">
                          {item.snippetName}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {item.title}
                        </span>

                        {/* Badge de estado actual */}
                        {isNormal && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            NORMAL [ ]
                          </span>
                        )}
                        {isSinExamen && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-950 border border-amber-400">
                            SIN EXAMEN [🟨 ALERTA]
                          </span>
                        )}
                        {isPatologico && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-amber-950 border border-amber-600 shadow-2xs">
                            PATOLÓGICO [🟨 ALERTA]
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Las 3 Opciones Idénticas al Carnet MINSA */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">

                      {/* 1. Sin Examen [🟨] */}
                      <button
                        type="button"
                        onClick={() =>
                          setBaselineData({
                            ...baselineData,
                            [item.id]: "Sin Examen",
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isSinExamen
                            ? "bg-amber-300 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400"
                            : "bg-amber-50/60 hover:bg-amber-100 border-amber-200 text-amber-900"
                          }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-600 inline-block shrink-0 shadow-2xs" />
                        <span>Sin Examen</span>
                        <span className="text-[10px] font-mono text-amber-900/80">[🟨]</span>
                      </button>

                      {/* 2. Normal [ ] */}
                      <button
                        type="button"
                        onClick={() =>
                          setBaselineData({
                            ...baselineData,
                            [item.id]: "Normal",
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isNormal
                            ? "bg-emerald-100 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-400"
                            : "bg-white hover:bg-slate-50 border-slate-300 text-slate-700"
                          }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-xs bg-white border border-slate-400 inline-block shrink-0" />
                        <span>Normal</span>
                        <span className="text-[10px] font-mono text-slate-500">[ ]</span>
                      </button>

                      {/* 3. Patológico [🟨] */}
                      <button
                        type="button"
                        onClick={() =>
                          setBaselineData({
                            ...baselineData,
                            [item.id]: "Patológico",
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isPatologico
                            ? "bg-amber-300 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400"
                            : "bg-amber-50/60 hover:bg-amber-100 border-amber-200 text-amber-900"
                          }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-600 inline-block shrink-0 shadow-2xs" />
                        <span>Patológico</span>
                        <span className="text-[10px] font-mono text-amber-900/80">[🟨]</span>
                      </button>
                    </div>
                  </div>

                  {/* Desplegable interactivo si es Patológico */}
                  {isPatologico && (
                    <div className="mt-3.5 p-3.5 rounded-lg bg-amber-50/90 border border-amber-300 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                          Detalle del Hallazgo Patológico ({item.snippetName.replace(":", "")}):
                        </span>
                        <span className="text-[10px] text-amber-800 italic">
                          Haz clic en las sugerencias clínicas o escribe la observación
                        </span>
                      </div>

                      {/* Chips de sugerencias clínicas rápidas */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.chips.map((chip) => {
                          const isChipActive = detail.includes(chip);
                          return (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => {
                                if (isChipActive) {
                                  const parts = detail
                                    .split(", ")
                                    .map((p) => p.trim())
                                    .filter((p) => p !== chip && p.length > 0);
                                  setBaselineData({
                                    ...baselineData,
                                    [item.detailKey]: parts.join(", "),
                                  });
                                } else {
                                  const newDetail = detail.trim().length > 0 ? `${detail.trim()}, ${chip}` : chip;
                                  setBaselineData({
                                    ...baselineData,
                                    [item.detailKey]: newDetail,
                                  });
                                }
                              }}
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${isChipActive
                                  ? "bg-amber-400 text-amber-950 font-bold border border-amber-600 shadow-2xs"
                                  : "bg-white hover:bg-amber-100 border border-amber-200 text-amber-900"
                                }`}
                            >
                              {isChipActive ? `✓ ${chip}` : `+ ${chip}`}
                            </button>
                          );
                        })}
                      </div>

                      {/* Campo de texto libre para detalle patológico */}
                      <div className="pt-0.5">
                        <input
                          type="text"
                          value={detail}
                          onChange={(e) =>
                            setBaselineData({
                              ...baselineData,
                              [item.detailKey]: e.target.value,
                            })
                          }
                          placeholder={`Describir hallazgo patológico en ${item.snippetName.replace(":", "")} (ej. grado, ubicación, conducta terapéutica)...`}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-amber-300 bg-white text-slate-800 placeholder:text-amber-800/40 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Recordatorio amigable si es Sin Examen */}
                  {isSinExamen && (
                    <div className="mt-3 px-3 py-2 rounded-lg bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          <strong>Alerta de Omisión:</strong> El examen {item.title.toLowerCase()} no ha sido realizado. Registrar en la siguiente cita.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setBaselineData({
                            ...baselineData,
                            [item.id]: "Normal",
                          })
                        }
                        className="text-[11px] font-bold text-amber-950 underline hover:text-amber-800 cursor-pointer"
                      >
                        Marcar Realizado (Normal)
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 8.4 Banner de Resumen y Recomendación Técnica MINSA */}
          {PHYSICAL_EXAM_ITEMS.some((i) => baselineData[i.id] === "Patológico") && (
            <div className="p-3.5 rounded-xl bg-amber-100 border border-amber-300 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-950 uppercase block">
                  Alerta de Hallazgos Patológicos en Examen Físico Basal
                </span>
                <p className="text-[11px] text-amber-900 mt-0.5">
                  Se han consignado hallazgos patológicos que requieren formulación de plan de trabajo, interconsulta o tratamiento inmediato según corresponda. Registrar en las notas de evolución médica y plan de parto.
                </p>
              </div>
            </div>
          )}

          {/* Nota Normativa MINSA NTS N° 105 */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 uppercase text-[10px] block">
                Norma Técnica de Salud MINSA &bull; NTS N° 105-MINSA/DGSP
              </span>
              <p className="mt-0.5">
                El examen físico de la primera atención prenatal es mandatorio para la estratificación del riesgo materno-perinatal:
                especuloscopía (descarte de ectropion sangrante, cervicitis y neoplasia), mamas (detección de pezones planos/umbilicados para estimulación y consejería de lactancia precoz), pelvimetría clínica y evaluación odontoestomatológica para prevenir parto pretérmino asociado a focos infecciosos bucales.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
