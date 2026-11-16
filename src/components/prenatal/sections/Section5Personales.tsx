"use client";

import React from "react";
import { Check, ChevronDown, ChevronUp, ShieldAlert } from "lucide-react";
import { PrenatalBaselineData } from "@/types/medical";

interface PersonalHistoryItemDef {
  id: string;
  label: string;
  severity: "none" | "alert" | "continuous"; // none = blanco [ ], alert = amarillo [🟨], continuous = rojo [🟥]
  hint?: string;
  handwrittenNote?: string;
  doctorEyeWarning?: boolean;
}

const PERSONAL_HISTORY_ITEMS_COL1: PersonalHistoryItemDef[] = [
  {
    id: "Ninguno",
    label: "Ninguno",
    severity: "none",
    hint: "Sin antecedentes patológicos personales",
  },
  {
    id: "Aborto habitual/recurrente",
    label: "Aborto habitual/recurrente",
    severity: "continuous",
    hint: "≥ 2 o 3 abortos espontáneos consecutivos",
  },
  {
    id: "Alcoholismo",
    label: "- Alcoholismo",
    severity: "alert",
    hint: "Consumo de riesgo o dependencia alcohólica",
  },
  {
    id: "Alergia medicamentos",
    label: "Alergia medicamentos",
    severity: "alert",
    hint: "Reacciones adversas medicamentosas (RAM)",
  },
  {
    id: "Violencia",
    label: "Violencia",
    severity: "alert",
    hint: "Física, psicológica o sexual (Ficha MINSA)",
  },
  {
    id: "Asma Bronquial",
    label: "Asma Bronquial",
    severity: "alert",
    hint: "Hiperreactividad bronquial o broncoespasmo",
  },
  {
    id: "Cardiopatia",
    label: "Cardiopatia",
    severity: "continuous",
    hint: "Valvulopatía, cardiopatía congénita o arritmia",
  },
  {
    id: "Cirugía Pélv. uterina",
    label: "Cirugía Pélv. uterina",
    severity: "continuous",
    handwrittenNote: "cesárea",
    doctorEyeWarning: true,
    hint: "Cicatriz uterina previa (cesárea, miomectomía)",
  },
  {
    id: "Diabetes",
    label: "Diabetes",
    severity: "alert",
    hint: "Diabetes pregestacional Tipo 1 o Tipo 2",
  },
];

const PERSONAL_HISTORY_ITEMS_COL2: PersonalHistoryItemDef[] = [
  {
    id: "Eclampsia",
    label: "Eclampsia",
    severity: "continuous",
    hint: "Convulsiones tónico-clónicas en gestación previa",
  },
  {
    id: "Enferm. Congénitas",
    label: "Enferm. Congénitas",
    severity: "alert",
    hint: "Anomalías estructurales o cromosómicas maternas",
  },
  {
    id: "Enferm. Infecciosas",
    label: "Enferm. Infecciosas",
    severity: "alert",
    hint: "TORCH, hepatitis víricas, Chagas, ITS u otras",
  },
  {
    id: "Epilepsia",
    label: "Epilepsia",
    severity: "alert",
    hint: "Trastorno neurológico convulsivo / anticonvulsivantes",
  },
  {
    id: "Hemorra. Postparto",
    label: "Hemorra. Postparto",
    severity: "continuous",
    hint: "Atonía uterina o hemorragia masiva en parto previo",
  },
  {
    id: "Hipertensión Arterial",
    label: "Hipertensión Arterial",
    severity: "alert",
    hint: "Hipertensión arterial esencial crónica",
  },
  {
    id: "Coca",
    label: "Coca",
    severity: "alert",
    hint: "Consumo de cocaína, PBC o coqueo habitual",
  },
  {
    id: "Infertilidad",
    label: "Infertilidad",
    severity: "alert",
    hint: "Tratamiento de reproducción asistida o infertilidad",
  },
  {
    id: "Neoplasia",
    label: "Neoplasia",
    severity: "alert",
    hint: "Neoplasia maligna previa o activa",
  },
];

const PERSONAL_HISTORY_ITEMS_COL3: PersonalHistoryItemDef[] = [
  {
    id: "Otras Drogas",
    label: "Otras Drogas",
    severity: "alert",
    hint: "Sustancias psicoactivas, marihuana, opioides, etc.",
  },
  {
    id: "Parto Prolong.",
    label: "Parto Prolong.",
    severity: "alert",
    hint: "Fase activa prolongada o detención de dilatación",
  },
  {
    id: "Preeclampsia",
    label: "Preeclampsia",
    severity: "alert",
    hint: "Preeclampsia en gestaciones anteriores",
  },
  {
    id: "Prematuridad",
    label: "Prematuridad",
    severity: "alert",
    hint: "Parto pretérmino previo (< 37 semanas)",
  },
  {
    id: "Reten. Placenta",
    label: "Reten. Placenta",
    severity: "alert",
    hint: "Alumbramiento manual o retención placentaria previa",
  },
  {
    id: "Tabaco",
    label: "Tabaco",
    severity: "alert",
    hint: "Tabaquismo activo o pasivo",
  },
  {
    id: "TBC Pulmonar",
    label: "TBC Pulmonar",
    severity: "continuous",
    hint: "Tuberculosis activa o antecedente con tratamiento",
  },
  {
    id: "Transtorn. mentales",
    label: "Transtorn. mentales",
    severity: "alert",
    hint: "Depresión mayor, ansiedad, psicosis o bipolaridad",
  },
  {
    id: "VIH/SIDA",
    label: "VIH/SIDA",
    severity: "continuous",
    hint: "Infección por retrovirus (Protocolo TARV materno)",
  },
  {
    id: "Otros",
    label: "Otros",
    severity: "alert",
    hint: "Otras patologías médicas o quirúrgicas relevantes",
  },
];

interface Section5PersonalesProps {
  isOpen: boolean;
  onToggle: () => void;
  baselineData: PrenatalBaselineData;
  setBaselineData: React.Dispatch<React.SetStateAction<PrenatalBaselineData>>;
}

export function Section5Personales({
  isOpen,
  onToggle,
  baselineData,
  setBaselineData,
}: Section5PersonalesProps) {
  const handleTogglePersonalHistory = (itemId: string) => {
    setBaselineData((prev) => {
      const current = prev.personalHistory || [];
      const currentDetails = { ...(prev.personalHistoryDetails || {}) };

      if (itemId === "Ninguno") {
        return {
          ...prev,
          personalHistory: ["Ninguno"],
          personalHistoryDetails: {},
          personalHistoryOther: "",
        };
      }

      const withoutNinguno = current.filter((x) => x !== "Ninguno");
      const exists = withoutNinguno.includes(itemId);

      let updatedList: string[];
      if (exists) {
        updatedList = withoutNinguno.filter((x) => x !== itemId);
        delete currentDetails[itemId];
      } else {
        updatedList = [...withoutNinguno, itemId];
        if (itemId === "Cirugía Pélv. uterina" && !currentDetails[itemId]) {
          currentDetails[itemId] = "Cesárea previa";
        }
      }

      if (updatedList.length === 0) {
        return {
          ...prev,
          personalHistory: ["Ninguno"],
          personalHistoryDetails: {},
          personalHistoryOther: "",
        };
      }

      return {
        ...prev,
        personalHistory: updatedList,
        personalHistoryDetails: currentDetails,
      };
    });
  };

  const handleSetPersonalDetail = (itemId: string, detail: string) => {
    setBaselineData((prev) => ({
      ...prev,
      personalHistoryDetails: {
        ...(prev.personalHistoryDetails || {}),
        [itemId]: detail,
      },
    }));
  };

  const allPersonalItems = [
    ...PERSONAL_HISTORY_ITEMS_COL1,
    ...PERSONAL_HISTORY_ITEMS_COL2,
    ...PERSONAL_HISTORY_ITEMS_COL3,
  ];

  const personalContinuousCount = (baselineData.personalHistory || []).filter((id) => {
    const item = allPersonalItems.find((i) => i.id === id);
    return item?.severity === "continuous";
  }).length;

  const personalAlertsCount = (baselineData.personalHistory || []).filter((id) => {
    const item = allPersonalItems.find((i) => i.id === id);
    return item?.severity === "alert";
  }).length;

  const renderPersonalHistoryCard = (item: PersonalHistoryItemDef) => {
    const isChecked = baselineData.personalHistory?.includes(item.id);
    const detail = baselineData.personalHistoryDetails?.[item.id] || "";

    const cardStyles = isChecked
      ? item.severity === "continuous"
        ? "bg-red-50/90 border-red-400 shadow-xs ring-1 ring-red-300/70"
        : item.severity === "alert"
        ? "bg-amber-50/90 border-amber-400 shadow-xs ring-1 ring-amber-300/70"
        : "bg-emerald-50/80 border-emerald-400 shadow-xs ring-1 ring-emerald-300/60"
      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50";

    return (
      <div
        key={item.id}
        className={`rounded-xl border transition-all duration-200 ${cardStyles}`}
      >
        {/* Fila principal clickable */}
        <div
          onClick={() => handleTogglePersonalHistory(item.id)}
          className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5 cursor-pointer select-none"
        >
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-xs font-bold leading-tight ${
                  isChecked
                    ? item.severity === "continuous"
                      ? "text-red-950 font-black"
                      : item.severity === "alert"
                      ? "text-amber-950 font-black"
                      : "text-emerald-950 font-black"
                    : "text-slate-800"
                }`}
              >
                {item.label}
              </span>

              {/* Anotación manuscrita: 'cesárea' */}
              {item.handwrittenNote && (
                <span className="text-[10px] bg-red-100 border border-red-300 text-red-900 font-bold px-1.5 py-0.2 rounded italic shadow-2xs">
                  {item.handwrittenNote}
                </span>
              )}

              {/* Dibujo de ojos del Dr. Patrick 👁️👁️ */}
              {item.doctorEyeWarning && (
                <span className="text-xs" title="Ojo Clínico: Cicatriz uterina requiere vigilancia estrecha">
                  👁️👁️
                </span>
              )}

              {/* Distintivo de severidad */}
              {item.severity === "continuous" && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    isChecked
                      ? "bg-red-600 text-white border border-red-700"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  SEGUIMIENTO ROJO
                </span>
              )}
              {item.severity === "alert" && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    isChecked
                      ? "bg-amber-300 text-amber-950 border border-amber-400"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  ALERTA
                </span>
              )}
            </div>

            {item.hint && (
              <span
                className={`text-[10px] mt-0.5 line-clamp-1 ${
                  isChecked
                    ? item.severity === "continuous"
                      ? "text-red-800"
                      : item.severity === "alert"
                      ? "text-amber-800"
                      : "text-emerald-800"
                    : "text-slate-500"
                }`}
              >
                {item.hint}
              </span>
            )}
          </div>

          {/* Casilla oficial (Roja [🟥], Amarilla [🟨] o Blanca [ ]) */}
          <div className="shrink-0 flex items-center">
            {item.severity === "continuous" ? (
              <div
                className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                  isChecked
                    ? "bg-red-600 border-red-800 text-white shadow-xs ring-2 ring-red-400"
                    : "bg-red-500 border-red-600 text-white hover:bg-red-600"
                }`}
                title="Casilla roja = Requiere seguimiento continuo"
              >
                {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            ) : item.severity === "alert" ? (
              <div
                className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                  isChecked
                    ? "bg-amber-400 border-amber-600 text-amber-950 shadow-xs ring-2 ring-amber-300"
                    : "bg-amber-300 border-amber-500 text-amber-900 hover:bg-amber-400"
                }`}
                title="Casilla amarilla = Factor de alerta"
              >
                {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            ) : (
              <div
                className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                  isChecked
                    ? "bg-emerald-500 border-emerald-600 text-white shadow-xs"
                    : "bg-white border-slate-300 text-slate-400 hover:border-slate-400"
                }`}
                title="Casilla blanca"
              >
                {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            )}
          </div>
        </div>

        {/* Subpanel expandible al marcar (para detalles clínicos clave) */}
        {isChecked && item.id !== "Ninguno" && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`px-3 pb-3 pt-2 border-t space-y-2 rounded-b-xl ${
              item.severity === "continuous"
                ? "border-red-200/80 bg-red-100/40"
                : "border-amber-200/80 bg-amber-100/40"
            }`}
          >
            {/* Si es Cirugía Pélvica / Uterina (Nota: cesárea 👁️👁️) */}
            {item.id === "Cirugía Pélv. uterina" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-red-950 flex items-center gap-1">
                    <span>👁️👁️ Tipo de cirugía uterina / cicatriz:</span>
                  </span>
                  {detail && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-200 text-red-900 border border-red-300">
                      {detail}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    "Cesárea previa (1)",
                    "Cesárea previa (2 o +)",
                    "Miomectomía",
                    "Legrado uterino",
                    "Conización",
                    "Otra cirugía",
                  ].map((surg) => (
                    <button
                      key={surg}
                      type="button"
                      onClick={() => handleSetPersonalDetail(item.id, surg)}
                      className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                        detail === surg
                          ? "bg-red-600 text-white shadow-2xs font-bold ring-1 ring-red-700"
                          : "bg-white hover:bg-red-100 text-red-950 border border-red-200"
                      }`}
                    >
                      {surg}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={detail}
                  onChange={(e) => handleSetPersonalDetail(item.id, e.target.value)}
                  placeholder="Detalles quirúrgicos (ej. Cesárea segmentaria transversa en 2022)..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-red-300 focus:outline-hidden focus:ring-1 focus:ring-red-500 font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Si es Alergia Medicamentos */}
            {item.id === "Alergia medicamentos" && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-amber-950 block">
                  Medicamentos alérgenos identificados:
                </span>
                <div className="flex flex-wrap gap-1">
                  {["Penicilina", "AINEs / Ibuprofeno", "Sulfas", "Cefalosporinas", "Metamizol"].map((med) => (
                    <button
                      key={med}
                      type="button"
                      onClick={() => handleSetPersonalDetail(item.id, med)}
                      className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                        detail === med
                          ? "bg-amber-600 text-white shadow-2xs font-bold ring-1 ring-amber-700"
                          : "bg-white hover:bg-amber-100 text-amber-950 border border-amber-200"
                      }`}
                    >
                      {med}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={detail}
                  onChange={(e) => handleSetPersonalDetail(item.id, e.target.value)}
                  placeholder="Especifique fármaco o tipo de reacción (ej. Urticaria, Shock anafiláctico)..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Si es Violencia */}
            {item.id === "Violencia" && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-amber-950 block">
                  Tipo de violencia detectada (Ficha de Tamizaje MINSA):
                </span>
                <div className="flex flex-wrap gap-1">
                  {["Psicológica", "Física", "Sexual", "Económica"].map((vType) => (
                    <button
                      key={vType}
                      type="button"
                      onClick={() => handleSetPersonalDetail(item.id, vType)}
                      className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                        detail === vType
                          ? "bg-amber-600 text-white shadow-2xs font-bold ring-1 ring-amber-700"
                          : "bg-white hover:bg-amber-100 text-amber-950 border border-amber-200"
                      }`}
                    >
                      {vType}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={detail}
                  onChange={(e) => handleSetPersonalDetail(item.id, e.target.value)}
                  placeholder="Observaciones de protección o derivación a servicio social / CEM..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Si es Otros */}
            {item.id === "Otros" && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-950 block">
                  Especifique otra patología médica o quirúrgica:
                </label>
                <input
                  type="text"
                  value={baselineData.personalHistoryOther || ""}
                  onChange={(e) =>
                    setBaselineData({
                      ...baselineData,
                      personalHistoryOther: e.target.value,
                    })
                  }
                  placeholder="ej. Hipotiroidismo, Trombofilia, Lupus, etc."
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Para el resto de items */}
            {item.id !== "Cirugía Pélv. uterina" && item.id !== "Alergia medicamentos" && item.id !== "Violencia" && item.id !== "Otros" && (
              <div className="space-y-1">
                <input
                  type="text"
                  value={detail}
                  onChange={(e) => handleSetPersonalDetail(item.id, e.target.value)}
                  placeholder="Detalles clínicos o tratamiento actual (opcional)..."
                  className={`w-full text-xs px-2.5 py-1 rounded-lg bg-white border focus:outline-hidden focus:ring-1 font-medium text-slate-800 placeholder:text-slate-400 ${
                    item.severity === "continuous"
                      ? "border-red-300 focus:ring-red-500"
                      : "border-amber-300 focus:ring-amber-500"
                  }`}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => onToggle}
              className="w-full p-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center shrink-0">
                  5
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  ANTECEDENTES PERSONALES PATOLÓGICOS
                </span>

                {/* Badges de alerta y seguimiento continuo */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {personalContinuousCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black border border-red-700 shadow-2xs animate-pulse">
                      🟥 {personalContinuousCount} Seguimiento continuo
                    </span>
                  )}
                  {personalAlertsCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black border border-amber-500 shadow-2xs">
                      🟨 {personalAlertsCount} {personalAlertsCount === 1 ? "Alerta" : "Alertas"}
                    </span>
                  )}
                  {personalContinuousCount === 0 && personalAlertsCount === 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Sin antecedentes patológicos
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
                
                {/* 5.1 Barra Superior de Resumen y Acción Rápida */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <ShieldAlert className="w-4 h-4 text-red-700" />
                    </div>
                    <div>
                      <div className="text-xs font-heading font-extrabold text-heading uppercase">
                        Matriz de Antecedentes Personales Patológicos (MINSA / CLAP)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Casillas rojas [🟥] requieren <strong>seguimiento continuo</strong>. Casillas amarillas [🟨] indican <strong>factor de alerta</strong>.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePersonalHistory("Ninguno")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        baselineData.personalHistory?.includes("Ninguno")
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300"
                      }`}
                      title="Marcar ninguno y desmarcar cualquier patología personal"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>✓ Marcar Ninguno (Sana)</span>
                    </button>
                  </div>
                </div>

                {/* 5.2 Grid de 3 Columnas idéntico al formato oficial */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  
                  {/* COLUMNA 1 */}
                  <div className="space-y-2.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Columna 1 &bull; Gineco-Obstétricos & Clínicos
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {PERSONAL_HISTORY_ITEMS_COL1.filter((i) => baselineData.personalHistory?.includes(i.id)).length} / {PERSONAL_HISTORY_ITEMS_COL1.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {PERSONAL_HISTORY_ITEMS_COL1.map((item) => renderPersonalHistoryCard(item))}
                    </div>
                  </div>

                  {/* COLUMNA 2 */}
                  <div className="space-y-2.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Columna 2 &bull; Materno-Perinatales & Crónicos
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {PERSONAL_HISTORY_ITEMS_COL2.filter((i) => baselineData.personalHistory?.includes(i.id)).length} / {PERSONAL_HISTORY_ITEMS_COL2.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {PERSONAL_HISTORY_ITEMS_COL2.map((item) => renderPersonalHistoryCard(item))}
                    </div>
                  </div>

                  {/* COLUMNA 3 */}
                  <div className="space-y-2.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Columna 3 &bull; Complicaciones & Infecciosas
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {PERSONAL_HISTORY_ITEMS_COL3.filter((i) => baselineData.personalHistory?.includes(i.id)).length} / {PERSONAL_HISTORY_ITEMS_COL3.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {PERSONAL_HISTORY_ITEMS_COL3.map((item) => renderPersonalHistoryCard(item))}
                    </div>
                  </div>

                </div>

                {/* 5.3 Nota Médica del Dr. Patrick Jacinto Gomero */}
                <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-200 text-red-900 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4 text-red-700" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-950 uppercase tracking-wide">
                        Protocolo Obstétrico &bull; Dr. Patrick Jacinto Gomero
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-200 text-red-950 font-semibold border border-red-300">
                        Signo de Alerta Crítica 👁️👁️
                      </span>
                    </div>
                    <p className="text-xs text-red-950 italic font-semibold leading-relaxed">
                      Anotación en Cirugía Pélvico-Uterina: &ldquo;cesárea&rdquo; con signo visual de vigilancia estricta (👁️👁️).
                    </p>
                    <p className="text-[11px] text-red-900/90 leading-tight">
                      Las 7 casillas rojas [🟥] señalan condiciones de <strong>seguimiento continuo obligatorio</strong> (Cesárea previa, Eclampsia, Hemorragia Postparto, Cardiopatía, TBC, VIH, Aborto habitual). Requieren manejo multidisciplinario, plan de parto institucional y reserva hemodinámica.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
  );
}
