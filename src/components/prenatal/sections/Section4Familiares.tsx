"use client";

import React from "react";
import { AlertTriangle, Check, ChevronDown, ChevronUp, Users } from "lucide-react";
import { PrenatalBaselineData } from "@/types/medical";


interface FamilyHistoryItemDef {
  id: string;
  label: string;
  isAlert: boolean;
  hint?: string;
  handwrittenNote?: string;
}

const FAMILY_HISTORY_ITEMS_COL1: FamilyHistoryItemDef[] = [
  {
    id: "Ninguno",
    label: "Ninguno",
    isAlert: false,
    hint: "Sin patologías familiares relevantes",
  },
  {
    id: "Alergias",
    label: "Alergias",
    isAlert: true,
    hint: "Medicamentosas, alimentarias o anafilaxia",
  },
  {
    id: "Enf. Hipertens. Emb.",
    label: "Enf. Hipertens. Emb.",
    isAlert: true,
    hint: "Preeclampsia / Eclampsia en madre o hermanas",
  },
  {
    id: "Epilepsia",
    label: "Epilepsia",
    isAlert: true,
    hint: "Trastornos convulsivos o epilepsia heredofamiliar",
  },
  {
    id: "Diabetes",
    label: "Diabetes",
    isAlert: true,
    hint: "Diabetes Mellitus Tipo 1, Tipo 2 o Gestacional",
  },
  {
    id: "Enferm.Congénitas",
    label: "Enferm. Congénitas",
    isAlert: true,
    hint: "Malformaciones, defectos del tubo neural o cromosomopatías",
  },
  {
    id: "Emb. Multiple",
    label: "Emb. Múltiple",
    isAlert: true,
    hint: "Embarazos gemelares o múltiples en consanguíneos",
  },
];

const FAMILY_HISTORY_ITEMS_COL2: FamilyHistoryItemDef[] = [
  {
    id: "Malaria",
    label: "Malaria",
    isAlert: false,
    hint: "Paludismo o procedencia de zona endémica",
  },
  {
    id: "Hipertención Arterial",
    label: "Hipertensión Arterial",
    isAlert: true,
    hint: "Hipertensión esencial crónica en padres o abuelos",
  },
  {
    id: "Hipotiroidismo",
    label: "Hipotiroidismo",
    isAlert: true,
    hint: "Disfunción tiroidea o tiroiditis autoinmune",
  },
  {
    id: "Neoplasia",
    label: "Neoplasia",
    isAlert: true,
    handwrittenNote: "cáncer -",
    hint: "Cáncer de mama, cérvix, colon u otras neoplasias",
  },
  {
    id: "TBC Pulmonar",
    label: "TBC Pulmonar",
    isAlert: true,
    hint: "Tuberculosis activa o contacto directo",
  },
  {
    id: "Otros",
    label: "Otros",
    isAlert: true,
    hint: "Otras patologías sistémicas familiares relevantes",
  },
];

interface Section4FamiliaresProps {
  isOpen: boolean;
  onToggle: () => void;
  baselineData: PrenatalBaselineData;
  setBaselineData: React.Dispatch<React.SetStateAction<PrenatalBaselineData>>;
}

export function Section4Familiares({
  isOpen,
  onToggle,
  baselineData,
  setBaselineData,
}: Section4FamiliaresProps) {
  const handleToggleFamilyHistory = (itemId: string) => {
    setBaselineData((prev) => {
      const current = prev.familyHistory || [];
      const currentDetails = { ...(prev.familyHistoryDetails || {}) };

      if (itemId === "Ninguno") {
        return {
          ...prev,
          familyHistory: ["Ninguno"],
          familyHistoryDetails: {},
          familyHistoryOther: "",
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
        if (!currentDetails[itemId]) {
          currentDetails[itemId] = "Madre";
        }
      }

      if (updatedList.length === 0) {
        return {
          ...prev,
          familyHistory: ["Ninguno"],
          familyHistoryDetails: {},
          familyHistoryOther: "",
        };
      }

      return {
        ...prev,
        familyHistory: updatedList,
        familyHistoryDetails: currentDetails,
      };
    });
  };

  const handleSetFamilyRelative = (itemId: string, relative: string) => {
    setBaselineData((prev) => ({
      ...prev,
      familyHistoryDetails: {
        ...(prev.familyHistoryDetails || {}),
        [itemId]: relative,
      },
    }));
  };

  const familyAlertsCount = (baselineData.familyHistory || []).filter(
    (item) => item !== "Ninguno" && item !== "Malaria"
  ).length;

  const renderFamilyHistoryCard = (item: FamilyHistoryItemDef) => {
    const isChecked = baselineData.familyHistory?.includes(item.id);
    const detail = baselineData.familyHistoryDetails?.[item.id] || "";

    return (
      <div
        key={item.id}
        className={`rounded-xl border transition-all duration-200 ${
          isChecked
            ? item.isAlert
              ? "bg-amber-50/90 border-amber-400 shadow-xs ring-1 ring-amber-300/60"
              : "bg-emerald-50/80 border-emerald-400 shadow-xs ring-1 ring-emerald-300/60"
            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
        }`}
      >
        {/* Fila principal clickable */}
        <div
          onClick={() => handleToggleFamilyHistory(item.id)}
          className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
        >
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-bold ${
                  isChecked
                    ? item.isAlert
                      ? "text-amber-950 font-black"
                      : "text-emerald-950 font-black"
                    : "text-slate-800"
                }`}
              >
                {item.label}
              </span>

              {/* Anotación manuscrita del Dr. Patrick en Neoplasia */}
              {item.handwrittenNote && (
                <span className="text-[10px] bg-white px-1.5 py-0.2 rounded border border-slate-300 text-slate-700 italic font-mono font-medium shadow-2xs">
                  {item.handwrittenNote}
                </span>
              )}

              {/* Distintivo de alerta */}
              {item.isAlert && (
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
                className={`text-[10px] mt-0.5 ${
                  isChecked
                    ? item.isAlert
                      ? "text-amber-800"
                      : "text-emerald-800"
                    : "text-slate-500"
                }`}
              >
                {item.hint}
              </span>
            )}
          </div>

          {/* Casilla oficial (Amarilla o Blanca) */}
          <div className="shrink-0 flex items-center gap-2">
            {item.isAlert ? (
              <div
                className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                  isChecked
                    ? "bg-amber-400 border-amber-600 text-amber-950 shadow-xs ring-2 ring-amber-300"
                    : "bg-amber-200/90 border-amber-400 text-amber-800 hover:bg-amber-300"
                }`}
                title={isChecked ? "Marcado como alerta" : "Casilla amarilla = Factor de alerta"}
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
                title={isChecked ? "Marcado" : "Casilla blanca"}
              >
                {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            )}
          </div>
        </div>

        {/* Subpanel expandible al marcar (excepto 'Ninguno') */}
        {isChecked && item.id !== "Ninguno" && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="px-3 pb-3 pt-2.5 border-t border-amber-200/80 space-y-2.5 bg-amber-100/40 rounded-b-xl"
          >
            {/* Si es 'Otros', ingresar patología específica */}
            {item.id === "Otros" && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-950 block">
                  Especificar Patología / Enfermedad:
                </label>
                <input
                  type="text"
                  value={baselineData.familyHistoryOther || ""}
                  onChange={(e) =>
                    setBaselineData({
                      ...baselineData,
                      familyHistoryOther: e.target.value,
                    })
                  }
                  placeholder="ej. Lupus eritematoso, Cardiopatía congénita, etc."
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Selector de familiar directo (Anotación manuscrita: 'al costado ponemos qué familiar') */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-700" />
                  ¿Qué familiar directo sufre esta condición?
                </span>
                {detail && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 border border-amber-300">
                    {detail}
                  </span>
                )}
              </div>

              {/* Chips rápidos de parentesco */}
              <div className="flex flex-wrap gap-1">
                {[
                  "Madre",
                  "Padre",
                  "Hermana",
                  "Hermano",
                  "Abuela Materna",
                  "Abuelo Materno",
                  "Abuela Paterna",
                  "Abuelo Paterno",
                ].map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => handleSetFamilyRelative(item.id, rel)}
                    className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                      detail === rel
                        ? "bg-amber-600 text-white shadow-2xs font-bold ring-1 ring-amber-700"
                        : "bg-white hover:bg-amber-100 text-amber-950 border border-amber-200"
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>

              {/* Input libre para detalle específico */}
              <input
                type="text"
                value={detail}
                onChange={(e) => handleSetFamilyRelative(item.id, e.target.value)}
                placeholder="O especifique parentesco y detalle (ej. Madre diagnosticada a los 45a)..."
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>
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
                  4
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  ANTECEDENTES FAMILIARES (FAMILIARES DIRECTOS)
                </span>
                {familyAlertsCount === 0 ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Sin alertas familiares
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black border border-amber-500 shadow-2xs">
                    <AlertTriangle className="w-3 h-3 text-amber-950" />
                    {familyAlertsCount} {familyAlertsCount === 1 ? "Alerta familiar" : "Alertas familiares"}
                  </span>
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </button>

            {isOpen && (
              <div className="p-4 sm:p-6 space-y-5 text-xs border-t border-border bg-white">
                
                {/* 4.1 Barra Superior de Resumen y Acción Rápida */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-heading font-extrabold text-heading uppercase">
                        Matriz de Antecedentes Familiares & Consanguinidad
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Marque las patologías en familiares directos (1er y 2do grado). Las casillas amarillas señalan factor de alerta obstétrica.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleFamilyHistory("Ninguno")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        baselineData.familyHistory?.includes("Ninguno")
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300"
                      }`}
                      title="Marcar ninguno y desmarcar cualquier patología"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>✓ Marcar Ninguno (Sanos)</span>
                    </button>
                  </div>
                </div>

                {/* 4.2 Grid de 2 Columnas idéntico a la ficha física */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  
                  {/* COLUMNA 1: Ninguno, Alergias, Enf. Hipertens. Emb., Epilepsia, Diabetes, Enferm. Congénitas, Emb. Múltiple */}
                  <div className="space-y-2.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Columna 1 &bull; Heredofamiliares
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {FAMILY_HISTORY_ITEMS_COL1.filter((i) => baselineData.familyHistory?.includes(i.id)).length} seleccionados
                      </span>
                    </div>

                    <div className="space-y-2">
                      {FAMILY_HISTORY_ITEMS_COL1.map((item) => renderFamilyHistoryCard(item))}
                    </div>
                  </div>

                  {/* COLUMNA 2: Malaria, Hipertensión Arterial, Hipotiroidismo, Neoplasia (cáncer -), TBC Pulmonar, Otros */}
                  <div className="space-y-2.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                        Columna 2 &bull; Sistémicos & Crónicos
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {FAMILY_HISTORY_ITEMS_COL2.filter((i) => baselineData.familyHistory?.includes(i.id)).length} seleccionados
                      </span>
                    </div>

                    <div className="space-y-2">
                      {FAMILY_HISTORY_ITEMS_COL2.map((item) => renderFamilyHistoryCard(item))}
                    </div>
                  </div>

                </div>

                {/* 4.3 Nota Médica Manuscrita del Dr. Patrick Jacinto Gomero */}
                <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                        Indicación del Dr. Patrick Jacinto Gomero
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-semibold border border-amber-300">
                        Anotación Manuscrita Oficial
                      </span>
                    </div>
                    <p className="text-xs text-amber-950 italic font-semibold leading-relaxed">
                      &ldquo;Familiares directos. Qué enfermedades sufren, al costado colocamos qué familiar.&rdquo;
                    </p>
                    <p className="text-[11px] text-amber-900/90 leading-tight">
                      Permite registrar consanguinidad de 1er y 2do grado (Madre, Padre, Hermanos, Abuelos) para la evaluación de riesgo obstétrico (ARO), predisposición a preeclampsia, diabetes gestacional, trastornos tiroideos y tamizaje genético.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
  );
}
