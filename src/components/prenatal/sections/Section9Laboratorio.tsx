"use client";

import React from "react";
import { AlertTriangle, Check, Stethoscope, ChevronDown, ChevronUp, BookOpen, ShieldAlert, Activity, FlaskConical } from "lucide-react";
import { PrenatalBaselineData } from "@/types/medical";

interface Section9LaboratorioProps {
  isOpen: boolean;
  onToggle: () => void;
  baselineData: PrenatalBaselineData;
  setBaselineData: React.Dispatch<React.SetStateAction<PrenatalBaselineData>>;
}

export function Section9Laboratorio({
  isOpen,
  onToggle,
  baselineData,
  setBaselineData,
}: Section9LaboratorioProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const isHb1Anemia = !baselineData.hemoglobin1NotDone && typeof baselineData.hemoglobin1 === "number" && baselineData.hemoglobin1 < 11.0;
  const isHb2Anemia = !baselineData.hemoglobin2NotDone && typeof baselineData.hemoglobin2 === "number" && baselineData.hemoglobin2 < 11.0;
  const isHbDischargeAnemia = !baselineData.hemoglobinDischargeNotDone && typeof baselineData.hemoglobinDischarge === "number" && baselineData.hemoglobinDischarge < 11.0;

  const labPathologicalAlerts: string[] = [];
  if (isHb1Anemia) labPathologicalAlerts.push(`Hb 1: ${baselineData.hemoglobin1} g/dL (Anemia)`);
  if (isHb2Anemia) labPathologicalAlerts.push(`Hb 2: ${baselineData.hemoglobin2} g/dL (Anemia)`);
  if (isHbDischargeAnemia) labPathologicalAlerts.push(`Hb Alta: ${baselineData.hemoglobinDischarge} g/dL (Anemia)`);
  if (baselineData.glucose1Result === "Anormal") labPathologicalAlerts.push("Glicemia 1 Anormal");
  if (baselineData.glucose2Result === "Anormal") labPathologicalAlerts.push("Glicemia 2 Anormal");
  if (baselineData.glucoseToleranceResult === "Anormal") labPathologicalAlerts.push("Tolerancia a Glucosa Anormal");
  if (baselineData.vdrlRpr1Result === "Reactivo") labPathologicalAlerts.push("VDRL/RPR 1 Reactivo");
  if (baselineData.vdrlRpr2Result === "Reactivo") labPathologicalAlerts.push("VDRL/RPR 2 Reactivo");
  if (baselineData.ftaAbsResult === "Reactivo") labPathologicalAlerts.push("FTA Abs. Reactivo");
  if (baselineData.tphaResult === "Reactivo") labPathologicalAlerts.push("TPHA Reactivo");
  if (baselineData.rapidSyphilisResult === "Reactivo") labPathologicalAlerts.push("Prueba Rápida Sífilis Reactiva");
  if (baselineData.hivRapid1Result === "Reactivo") labPathologicalAlerts.push("VIH Prueba Rápida 1 Reactiva");
  if (baselineData.hivRapid2Result === "Reactivo") labPathologicalAlerts.push("VIH Prueba Rápida 2 Reactiva");
  if (baselineData.hivElisaResult === "Reactivo") labPathologicalAlerts.push("VIH ELISA Reactivo");
  if (baselineData.westernBlotResult === "Positivo") labPathologicalAlerts.push("Western Blot Positivo");
  if (baselineData.htlv1Result === "Positivo") labPathologicalAlerts.push("HTLV-I Positivo");
  if (baselineData.torchResult === "Positivo") labPathologicalAlerts.push("TORCH Positivo");
  if (baselineData.thickBloodSmearResult === "Positivo") labPathologicalAlerts.push("Gota Gruesa Positiva (Malaria)");
  if (baselineData.malariaRapidResult === "Positivo") labPathologicalAlerts.push("Malaria Prueba Rápida Positiva");
  if (baselineData.malariaFluorescenceResult === "Positivo") labPathologicalAlerts.push("Fluorescencia Malaria Positiva");
  if (baselineData.completeUrineExamResult === "Positivo") labPathologicalAlerts.push("Examen de Orina Patológico");
  if (baselineData.leukocyturiaResult === "Positivo") labPathologicalAlerts.push("Leucocituria Patológica");
  if (baselineData.nitritesResult === "Positivo") labPathologicalAlerts.push("Nitritos Positivos");
  if (baselineData.urineCultureResult === "Positivo") labPathologicalAlerts.push("Urocultivo Positivo (Bacteriuria)");
  if (baselineData.bkSputumResult === "Positivo") labPathologicalAlerts.push("BK en Esputo Positivo");
  if (baselineData.listeriaResult === "Positivo") labPathologicalAlerts.push("Listeria Positiva");
  if (baselineData.hepatitisBResult === "Positivo") labPathologicalAlerts.push("Hepatitis B Positiva");
  if (baselineData.papTestResult === "Anormal") labPathologicalAlerts.push("PAP Anormal");
  if (baselineData.ivaaResult === "Anormal") labPathologicalAlerts.push("IVAA Anormal");
  if (baselineData.colposcopyResult === "Anormal") labPathologicalAlerts.push("Colposcopia Anormal");

  const labPendingCount = [
    baselineData.hemoglobin1NotDone,
    baselineData.hemoglobin2NotDone,
    baselineData.glucose1Result === "No se Hizo",
    baselineData.glucose2Result === "No se Hizo",
    baselineData.glucoseToleranceResult === "No se Hizo",
    baselineData.vdrlRpr1Result === "No se Hizo",
    baselineData.vdrlRpr2Result === "No se Hizo",
    baselineData.ftaAbsResult === "No se Hizo",
    baselineData.tphaResult === "No se Hizo",
    baselineData.rapidSyphilisResult === "No se Hizo",
    baselineData.hivRapid1Result === "No se Hizo",
    baselineData.hivRapid2Result === "No se Hizo",
    baselineData.hivElisaResult === "No se Hizo",
    baselineData.westernBlotResult === "No se Hizo",
    baselineData.htlv1Result === "No se Hizo",
    baselineData.torchResult === "No se Hizo",
    baselineData.thickBloodSmearResult === "No se Hizo",
    baselineData.malariaRapidResult === "No se Hizo",
    baselineData.malariaFluorescenceResult === "No se Hizo",
    baselineData.completeUrineExamResult === "No se Hizo",
    baselineData.leukocyturiaResult === "No se Hizo",
    baselineData.nitritesResult === "No se Hizo",
    baselineData.urineCultureResult === "No se Hizo",
    baselineData.bkSputumResult === "No se Hizo",
    baselineData.listeriaResult === "No se Hizo",
    baselineData.hepatitisBResult === "No se Hizo",
    baselineData.papTestResult === "No se Hizo",
    baselineData.ivaaResult === "No se Hizo",
    baselineData.colposcopyResult === "No se Hizo",
  ].filter(Boolean).length;

  const handleFillNormalLabPanel = () => {
    setBaselineData((prev) => ({
      ...prev,
      hemoglobin1: 12.4,
      hemoglobin1Date: todayStr,
      hemoglobin1NotDone: false,
      hemoglobin2: 12.2,
      hemoglobin2Date: todayStr,
      hemoglobin2NotDone: false,
      hemoglobinDischarge: 12.0,
      hemoglobinDischargeDate: "",
      hemoglobinDischargeNotDone: true,
      bloodGlucose1: 84,
      bloodGlucose1Date: todayStr,
      glucose1Result: "Normal",
      glucose1Date: todayStr,
      glucose1Value: 84,
      glucose2Result: "Normal",
      glucose2Date: todayStr,
      glucose2Value: 86,
      glucoseToleranceResult: "No se Aplica",
      glucoseToleranceDate: "",
      vdrlRpr1: "No reactivo",
      vdrlRpr1Date: todayStr,
      vdrlRpr1Result: "No reactivo",
      vdrlRpr2Result: "No se Aplica",
      ftaAbsResult: "No se Aplica",
      tphaResult: "No se Aplica",
      rapidSyphilisResult: "No reactivo",
      rapidSyphilisDate: todayStr,
      hivScreening1: "Negativo",
      hivScreening1Date: todayStr,
      hivRapid1Result: "No reactivo",
      hivRapid1Date: todayStr,
      hivRapid2Result: "No se Aplica",
      hivElisaResult: "No se Aplica",
      westernBlotResult: "No se Aplica",
      htlv1Result: "Negativo",
      htlv1Date: todayStr,
      torchResult: "No se Aplica",
      thickBloodSmearResult: "No se Aplica",
      malariaRapidResult: "No se Aplica",
      malariaFluorescenceResult: "No se Aplica",
      completeUrineExam: "Normal",
      completeUrineExamDate: todayStr,
      completeUrineExamResult: "Negativo",
      leukocyturiaResult: "Negativo",
      nitritesResult: "Negativo",
      nitritesDate: todayStr,
      urineCulture: "Negativo",
      urineCultureResult: "Negativo",
      urineCultureDate: todayStr,
      bkSputumResult: "No se Aplica",
      listeriaResult: "No se Aplica",
      hepatitisBScreening: "Negativo",
      hepatitisBScreeningDate: todayStr,
      hepatitisBResult: "Negativo",
      hepatitisBDate: todayStr,
      papTestResult: "Normal",
      papTestDate: todayStr,
      ivaaResult: "No se Aplica",
      colposcopyResult: "No se Aplica",
    }));
  };

  const handleResetLabPanel = () => {
    setBaselineData((prev) => ({
      ...prev,
      hemoglobin1NotDone: true,
      hemoglobin2NotDone: true,
      hemoglobinDischargeNotDone: true,
      glucose1Result: "No se Hizo",
      glucose2Result: "No se Hizo",
      glucoseToleranceResult: "No se Hizo",
      vdrlRpr1Result: "No se Hizo",
      vdrlRpr2Result: "No se Hizo",
      ftaAbsResult: "No se Hizo",
      tphaResult: "No se Hizo",
      rapidSyphilisResult: "No se Hizo",
      hivRapid1Result: "No se Hizo",
      hivRapid2Result: "No se Hizo",
      hivElisaResult: "No se Hizo",
      westernBlotResult: "No se Hizo",
      htlv1Result: "No se Hizo",
      torchResult: "No se Hizo",
      thickBloodSmearResult: "No se Hizo",
      malariaRapidResult: "No se Hizo",
      malariaFluorescenceResult: "No se Hizo",
      completeUrineExamResult: "No se Hizo",
      leukocyturiaResult: "No se Hizo",
      nitritesResult: "No se Hizo",
      urineCultureResult: "No se Hizo",
      bkSputumResult: "No se Hizo",
      listeriaResult: "No se Hizo",
      hepatitisBResult: "No se Hizo",
      papTestResult: "No se Hizo",
      ivaaResult: "No se Hizo",
      colposcopyResult: "No se Hizo",
    }));
  };

  const renderLabRow = ({
    label,
    value,
    onChange,
    dateValue,
    onDateChange,
    safeText = "Normal",
    alertText = "Anormal",
    hasNoApplies = false,
    numericVal,
    onNumericChange,
    numericUnit,
    badge,
  }: {
    label: string;
    value?: string;
    onChange: (val: string) => void;
    dateValue?: string;
    onDateChange?: (date: string) => void;
    safeText?: string;
    alertText?: string;
    hasNoApplies?: boolean;
    numericVal?: number;
    onNumericChange?: (val: number | undefined) => void;
    numericUnit?: string;
    badge?: string;
  }) => {
    const isSafe = value === safeText;
    const isAlert = value === alertText;
    const isNotDone = value === "No se Hizo";
    const isNoApplies = value === "No se Aplica";

    return (
      <div
        className={`p-3 rounded-xl border transition-all space-y-2.5 ${isAlert
            ? "bg-amber-50/80 border-amber-400 ring-1 ring-amber-300 shadow-2xs"
            : isNotDone
              ? "bg-amber-50/30 border-amber-200"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
      >
        {/* Línea 1: Nombre de la prueba y estado actual */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">{label}</span>
            {badge && (
              <span className="text-[10px] text-slate-500 font-mono italic">({badge})</span>
            )}
          </div>

          <div>
            {isSafe && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {safeText} [ ]
              </span>
            )}
            {isAlert && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-300 text-amber-950 border border-amber-500 shadow-2xs">
                {alertText} [🟨 ALERTA]
              </span>
            )}
            {isNotDone && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                No se Hizo [🟨 ALERTA]
              </span>
            )}
            {isNoApplies && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                No Aplica [ ]
              </span>
            )}
          </div>
        </div>

        {/* Línea 2: Casillas de selección + Valor Numérico + Fecha */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
          {/* Botones de selección directa */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Opción 1: Seguro (Normal / Negativo / No reactivo) */}
            <button
              type="button"
              onClick={() => onChange(safeText)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isSafe
                  ? "bg-emerald-100 border-emerald-500 text-emerald-950 shadow-2xs ring-1 ring-emerald-300"
                  : "bg-white hover:bg-slate-50 border-slate-300 text-slate-700"
                }`}
            >
              <span className="w-3 h-3 rounded-xs bg-white border border-slate-400 inline-block shrink-0" />
              <span>{safeText}</span>
              <span className="text-[10px] font-mono text-slate-500">[ ]</span>
            </button>

            {/* Opción 2: Alerta (Anormal / Positivo / Reactivo) */}
            <button
              type="button"
              onClick={() => onChange(alertText)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isAlert
                  ? "bg-amber-300 border-amber-500 text-amber-950 shadow-2xs ring-1 ring-amber-400"
                  : "bg-amber-50/60 hover:bg-amber-100 border-amber-200 text-amber-900"
                }`}
            >
              <span className="w-3 h-3 rounded-xs bg-amber-400 border border-amber-600 inline-block shrink-0 shadow-2xs" />
              <span>{alertText}</span>
              <span className="text-[10px] font-mono text-amber-900">[🟨]</span>
            </button>

            {/* Opción 3: No se Hizo */}
            <button
              type="button"
              onClick={() => onChange("No se Hizo")}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isNotDone
                  ? "bg-amber-300 border-amber-500 text-amber-950 shadow-2xs ring-1 ring-amber-400"
                  : "bg-amber-50/60 hover:bg-amber-100 border-amber-200 text-amber-900"
                }`}
            >
              <span className="w-3 h-3 rounded-xs bg-amber-400 border border-amber-600 inline-block shrink-0 shadow-2xs" />
              <span>No se Hizo</span>
              <span className="text-[10px] font-mono text-amber-900">[🟨]</span>
            </button>

            {/* Opción 4: No se Aplica */}
            {hasNoApplies && (
              <button
                type="button"
                onClick={() => onChange("No se Aplica")}
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isNoApplies
                    ? "bg-slate-200 border-slate-500 text-slate-900 shadow-2xs ring-1 ring-slate-400"
                    : "bg-white hover:bg-slate-50 border-slate-300 text-slate-600"
                  }`}
              >
                <span className="w-3 h-3 rounded-xs bg-white border border-slate-400 inline-block shrink-0" />
                <span>No Aplica</span>
                <span className="text-[10px] font-mono text-slate-500">[ ]</span>
              </button>
            )}
          </div>

          {/* Input Numérico Opcional y Fecha */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {numericUnit && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                <input
                  type="number"
                  value={numericVal !== undefined ? numericVal : ""}
                  onChange={(e) => onNumericChange?.(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0"
                  className="w-16 text-xs font-mono font-bold px-1.5 py-0.5 rounded border border-slate-300 bg-white text-slate-800 text-center"
                />
                <span className="text-[11px] text-slate-600 font-mono font-semibold">{numericUnit}</span>
              </div>
            )}

            {onDateChange && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-600 font-mono">Fecha:</span>
                <input
                  type="date"
                  value={dateValue || ""}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="text-xs font-mono px-2 py-0.5 rounded border border-slate-300 bg-white text-slate-800"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper de renderizado para Hemoglobina con casillas Hg(%) (Estructura en 2 líneas)
  const renderHemoglobinRow = ({
    label,
    val,
    onValChange,
    notDone,
    onNotDoneChange,
    dateVal,
    onDateChange,
  }: {
    label: string;
    val?: number;
    onValChange: (v: number | undefined) => void;
    notDone?: boolean;
    onNotDoneChange: (nd: boolean) => void;
    dateVal?: string;
    onDateChange: (d: string) => void;
  }) => {
    const isAnemia = !notDone && typeof val === "number" && val < 11.0;
    const isSevereAnemia = !notDone && typeof val === "number" && val < 7.0;

    return (
      <div
        className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${isSevereAnemia
            ? "bg-rose-50 border-rose-400 ring-1 ring-rose-300 shadow-2xs"
            : isAnemia
              ? "bg-amber-50/80 border-amber-400 ring-1 ring-amber-300 shadow-2xs"
              : notDone
                ? "bg-amber-50/30 border-amber-200"
                : "bg-white border-slate-200 hover:border-slate-300"
          }`}
      >
        {/* Línea 1: Etiqueta y estado */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
          <span className="text-xs font-bold text-slate-900">{label}</span>
          {!notDone && typeof val === "number" ? (
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${isSevereAnemia
                  ? "bg-rose-500 text-white"
                  : isAnemia
                    ? "bg-amber-400 text-amber-950"
                    : "bg-emerald-100 text-emerald-800"
                }`}
            >
              {isSevereAnemia ? "Severa (<7 g/dL) [🟥]" : isAnemia ? "Anemia Gestacional (<11 g/dL) [🟨]" : "Normal (≥11 g/dL)"}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              No se Hizo [🟨 ALERTA]
            </span>
          )}
        </div>

        {/* Línea 2: Casillas Hg(%) + Botón No se Hizo + Fecha */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          {/* Casillas [ ][ ].[ ] Hg(%) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-700">Hg(%):</span>
            <input
              type="number"
              step="0.1"
              disabled={notDone}
              value={val !== undefined ? val : ""}
              onChange={(e) => onValChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="12.0"
              className="w-20 text-xs font-mono font-black text-center px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 shadow-2xs"
            />
            <span className="text-xs font-mono text-slate-500 font-bold">g/dL</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* No se Hizo [🟨] */}
            <button
              type="button"
              onClick={() => onNotDoneChange(!notDone)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${notDone
                  ? "bg-amber-300 border-amber-500 text-amber-950 shadow-2xs ring-1 ring-amber-400"
                  : "bg-amber-50/60 hover:bg-amber-100 border-amber-200 text-amber-900"
                }`}
            >
              <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-600 inline-block shrink-0 shadow-2xs" />
              <span>No se Hizo</span>
              <span className="text-[10px] font-mono text-amber-900">[🟨]</span>
            </button>

            {/* Fecha */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-600 font-mono">Fecha:</span>
              <input
                type="date"
                value={dateVal || ""}
                onChange={(e) => onDateChange(e.target.value)}
                className="text-xs font-mono px-2 py-0.5 rounded border border-slate-300 bg-white text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center justify-center shrink-0">
            9
          </span>
          <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
            EXÁMENES DE LABORATORIO BASALES (MINSA / CLAP)
          </span>
          <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-50 text-cyan-800 border border-cyan-200">
            Batería Gestacional Completa
          </span>
        </div>
        <div className="flex items-center gap-2">
          {labPathologicalAlerts.length > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {labPathologicalAlerts.length} {labPathologicalAlerts.length === 1 ? "Alerta Patológica" : "Alertas Patológicas"} [🟨]
            </span>
          ) : labPendingCount > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
              {labPendingCount} Pruebas Sin Realizar
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Panel Basal Completo Normal
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
        <div className="p-4 sm:p-6 space-y-5 text-xs border-t border-border bg-white">

          {/* 9.1 Barra Superior de Resumen y Acciones Rápidas */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs shrink-0">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-heading font-extrabold text-heading uppercase">
                  Batería de Laboratorio Gestacional (MINSA / CLAP)
                </div>
                <div className="text-[11px] text-slate-500">
                  Monitoreo hematológico, metabólico, tamizaje de ITS (Sífilis / VIH), urológico, infeccioso y cervical.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleFillNormalLabPanel}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Cargar resultados negativos y normales en el panel basal"
              >
                <Check className="w-3.5 h-3.5" />
                <span>✓ Cargar Panel Basal Normal</span>
              </button>
              <button
                type="button"
                onClick={handleResetLabPanel}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                title="Restablecer todas las pruebas a No se Hizo"
              >
                <span>Restablecer Todo</span>
              </button>
            </div>
          </div>

          {/* 9.2 Leyenda idéntica al Carnet MINSA */}
          <div className="flex items-center gap-4 px-3 py-2 rounded-lg bg-slate-50/70 border border-slate-200/80 text-[11px] text-slate-600 flex-wrap">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Leyenda de Colores MINSA:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-white border border-slate-400 inline-block" />
              <span><strong>Casilla Blanca [ ]:</strong> Normal / Negativo / No reactivo / No Aplica</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-600 shadow-2xs inline-block" />
              <span><strong>Casilla Amarilla [🟨]:</strong> ALERTA (Anormal, Reactivo, Positivo o No se Hizo)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-rose-500 border border-rose-700 shadow-2xs inline-block" />
              <span><strong>Casilla Roja [🟥]:</strong> Seguimiento Continuo (Hb &lt; 7.0 g/dL Anemia Severa)</span>
            </div>
          </div>

          {/* 9.3 Bloques de Laboratorio en Cascada (Uno debajo del otro para máxima legibilidad y cero solapamiento) */}
          <div className="space-y-5">

            {/* BLOQUE A: HEMOGLOBINA Hg(%) */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-600" />
                  Hemoglobina Hg(%) & Descarte de Anemia
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Punto de corte: 11.0 g/dL</span>
              </div>

              <div className="space-y-2">
                {renderHemoglobinRow({
                  label: "Hemoglobina 1:",
                  val: baselineData.hemoglobin1,
                  onValChange: (v) => setBaselineData({ ...baselineData, hemoglobin1: v }),
                  notDone: baselineData.hemoglobin1NotDone,
                  onNotDoneChange: (nd) => setBaselineData({ ...baselineData, hemoglobin1NotDone: nd }),
                  dateVal: baselineData.hemoglobin1Date,
                  onDateChange: (d) => setBaselineData({ ...baselineData, hemoglobin1Date: d }),
                })}

                {renderHemoglobinRow({
                  label: "Hemoglobina 2:",
                  val: baselineData.hemoglobin2,
                  onValChange: (v) => setBaselineData({ ...baselineData, hemoglobin2: v }),
                  notDone: baselineData.hemoglobin2NotDone,
                  onNotDoneChange: (nd) => setBaselineData({ ...baselineData, hemoglobin2NotDone: nd }),
                  dateVal: baselineData.hemoglobin2Date,
                  onDateChange: (d) => setBaselineData({ ...baselineData, hemoglobin2Date: d }),
                })}

                {renderHemoglobinRow({
                  label: "Hemogl. al Alta :",
                  val: baselineData.hemoglobinDischarge,
                  onValChange: (v) => setBaselineData({ ...baselineData, hemoglobinDischarge: v }),
                  notDone: baselineData.hemoglobinDischargeNotDone,
                  onNotDoneChange: (nd) => setBaselineData({ ...baselineData, hemoglobinDischargeNotDone: nd }),
                  dateVal: baselineData.hemoglobinDischargeDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, hemoglobinDischargeDate: d }),
                })}
              </div>
            </div>

            {/* BLOQUE B: GLICEMIA & TOLERANCIA A LA GLUCOSA */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-cyan-600" />
                  Glicemia & Tolerancia a la Glucosa
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Descarte Diabetes Gestacional</span>
              </div>

              <div className="space-y-2">
                {renderLabRow({
                  label: "Glicemia 1:",
                  value: baselineData.glucose1Result || "Normal",
                  onChange: (val) => setBaselineData({ ...baselineData, glucose1Result: val }),
                  dateValue: baselineData.glucose1Date,
                  onDateChange: (d) => setBaselineData({ ...baselineData, glucose1Date: d }),
                  numericVal: baselineData.glucose1Value,
                  onNumericChange: (v) => setBaselineData({ ...baselineData, glucose1Value: v }),
                  numericUnit: "mg/dL",
                  safeText: "Normal",
                  alertText: "Anormal",
                })}

                {renderLabRow({
                  label: "Glicemia 2:",
                  value: baselineData.glucose2Result || "Normal",
                  onChange: (val) => setBaselineData({ ...baselineData, glucose2Result: val }),
                  dateValue: baselineData.glucose2Date,
                  onDateChange: (d) => setBaselineData({ ...baselineData, glucose2Date: d }),
                  numericVal: baselineData.glucose2Value,
                  onNumericChange: (v) => setBaselineData({ ...baselineData, glucose2Value: v }),
                  numericUnit: "mg/dL",
                  safeText: "Normal",
                  alertText: "Anormal",
                })}

                {renderLabRow({
                  label: "Tolerancia Glucosa:",
                  badge: "Sobrecarga 75g",
                  value: baselineData.glucoseToleranceResult || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, glucoseToleranceResult: val }),
                  dateValue: baselineData.glucoseToleranceDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, glucoseToleranceDate: d }),
                  numericVal: baselineData.glucoseToleranceValue,
                  onNumericChange: (v) => setBaselineData({ ...baselineData, glucoseToleranceValue: v }),
                  numericUnit: "mg/dL",
                  safeText: "Normal",
                  alertText: "Anormal",
                  hasNoApplies: true,
                })}
              </div>
            </div>

            {/* BLOQUE C: SÍFILIS & TAMIZAJE VIH */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-cyan-600" />
                  Sífilis & Tamizaje VIH (Prevención Transmisión Vertical)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Serología Obligatoria</span>
              </div>

              <div className="space-y-2">
                {renderLabRow({
                  label: "VDRL/RPR 1 :",
                  value: baselineData.vdrlRpr1Result || "No reactivo",
                  onChange: (val) => setBaselineData({ ...baselineData, vdrlRpr1Result: val, vdrlRpr1: val }),
                  dateValue: baselineData.vdrlRpr1Date,
                  onDateChange: (d) => setBaselineData({ ...baselineData, vdrlRpr1Date: d }),
                  safeText: "No reactivo",
                  alertText: "Reactivo",
                })}

                {renderLabRow({
                  label: "VDRL/RPR 2 :",
                  value: baselineData.vdrlRpr2Result || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, vdrlRpr2Result: val }),
                  dateValue: baselineData.vdrlRpr2Date,
                  onDateChange: (d) => setBaselineData({ ...baselineData, vdrlRpr2Date: d }),
                  safeText: "No reactivo",
                  alertText: "Reactivo",
                  hasNoApplies: true,
                })}

                {renderLabRow({
                  label: "FTA Abs. :",
                  badge: "Treponémica",
                  value: baselineData.ftaAbsResult || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, ftaAbsResult: val }),
                  dateValue: baselineData.ftaAbsDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, ftaAbsDate: d }),
                  safeText: "No reactivo",
                  alertText: "Reactivo",
                  hasNoApplies: true,
                })}

                {renderLabRow({
                  label: "TPHA :",
                  badge: "Hemaglutinación",
                  value: baselineData.tphaResult || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, tphaResult: val }),
                  dateValue: baselineData.tphaDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, tphaDate: d }),
                  safeText: "No reactivo",
                  alertText: "Reactivo",
                  hasNoApplies: true,
                })}

                {renderLabRow({
                  label: "Prueba Rap. Sifilis :",
                  value: baselineData.rapidSyphilisResult || "No reactivo",
                  onChange: (val) => setBaselineData({ ...baselineData, rapidSyphilisResult: val }),
                  dateValue: baselineData.rapidSyphilisDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, rapidSyphilisDate: d }),
                  safeText: "No reactivo",
                  alertText: "Reactivo",
                })}

                {renderLabRow({
                  label: "VIH Prueba Rap. 1 :",
                  value: baselineData.hivRapid1Result || "No reactivo",
                  onChange: (val) => setBaselineData({ ...baselineData, hivRapid1Result: val }),
                  dateValue: baselineData.hivRapid1Date,
                  onDateChange: (d) => setBaselineData({ ...baselineData, hivRapid1Date: d }),
                  safeText: "No reactivo",
                  alertText: "Reactivo",
                })}

                {renderLabRow({
                  label: "Prueba Rap. 2 :",
                  badge: "VIH 3er Trim.",
                  value: baselineData.hivRapid2Result || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, hivRapid2Result: val }),
                  dateValue: baselineData.hivRapid2Date,
                  onDateChange: (d) => setBaselineData({ ...baselineData, hivRapid2Date: d }),
                  safeText: "No reactivo",
                  alertText: "Reactivo",
                  hasNoApplies: true,
                })}

                {renderLabRow({
                  label: "ELISA :",
                  badge: "VIH Confirmatoria",
                  value: baselineData.hivElisaResult || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, hivElisaResult: val }),
                  dateValue: baselineData.hivElisaDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, hivElisaDate: d }),
                  safeText: "No reactivo",
                  alertText: "Reactivo",
                  hasNoApplies: true,
                })}
              </div>
            </div>

            {/* BLOQUE D: INFECCIONES ESPECIALES & VECTORES */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-600" />
                  Infecciones Especiales & Zoonosis / Vectores
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Western Blot, HTLV, TORCH, Malaria</span>
              </div>

              <div className="space-y-2">
                {renderLabRow({
                  label: "IFI / Western Blot:",
                  badge: "Inmunofluorescencia",
                  value: baselineData.westernBlotResult || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, westernBlotResult: val }),
                  dateValue: baselineData.westernBlotDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, westernBlotDate: d }),
                  safeText: "Negativo",
                  alertText: "Positivo",
                  hasNoApplies: true,
                })}

                {renderLabRow({
                  label: "HTLV I:",
                  value: baselineData.htlv1Result || "Negativo",
                  onChange: (val) => setBaselineData({ ...baselineData, htlv1Result: val }),
                  dateValue: baselineData.htlv1Date,
                  onDateChange: (d) => setBaselineData({ ...baselineData, htlv1Date: d }),
                  safeText: "Negativo",
                  alertText: "Positivo",
                  hasNoApplies: true,
                })}

                {renderLabRow({
                  label: "TORCH:",
                  badge: "Toxo, Rubeola, CMV, Herpes",
                  value: baselineData.torchResult || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, torchResult: val }),
                  dateValue: baselineData.torchDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, torchDate: d }),
                  safeText: "Negativo",
                  alertText: "Positivo",
                  hasNoApplies: true,
                })}

                {renderLabRow({
                  label: "Gota Gruesa:",
                  badge: "Malaria Endémica",
                  value: baselineData.thickBloodSmearResult || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, thickBloodSmearResult: val }),
                  dateValue: baselineData.thickBloodSmearDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, thickBloodSmearDate: d }),
                  safeText: "Negativo",
                  alertText: "Positivo",
                  hasNoApplies: true,
                })}

                {renderLabRow({
                  label: "Malaria Prueba Ráp:",
                  value: baselineData.malariaRapidResult || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, malariaRapidResult: val }),
                  dateValue: baselineData.malariaRapidDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, malariaRapidDate: d }),
                  safeText: "Negativo",
                  alertText: "Positivo",
                  hasNoApplies: true,
                })}

                {renderLabRow({
                  label: "Fluorec. Malaria:",
                  value: baselineData.malariaFluorescenceResult || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, malariaFluorescenceResult: val }),
                  dateValue: baselineData.malariaFluorescenceDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, malariaFluorescenceDate: d }),
                  safeText: "Negativo",
                  alertText: "Positivo",
                  hasNoApplies: true,
                })}
              </div>
            </div>

            {/* BLOQUE E: EXAMEN DE ORINA, UROCULTIVO & OTRAS INFECCIONES */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-cyan-600" />
                  Examen de Orina, Urocultivo & Hepatitis B
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Prevención de Prematuridad</span>
              </div>

              <div className="space-y-2">
                {renderLabRow({
                  label: "Ex. Comp. Orina:",
                  value: baselineData.completeUrineExamResult || "Negativo",
                  onChange: (val) => setBaselineData({ ...baselineData, completeUrineExamResult: val }),
                  dateValue: baselineData.completeUrineExamDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, completeUrineExamDate: d }),
                  safeText: "Negativo",
                  alertText: "Positivo",
                })}

                {renderLabRow({
                  label: "Leucocituria:",
                  value: baselineData.leukocyturiaResult || "Negativo",
                  onChange: (val) => setBaselineData({ ...baselineData, leukocyturiaResult: val }),
                  safeText: "Negativo",
                  alertText: "Positivo",
                })}

                {renderLabRow({
                  label: "Nitritos:",
                  value: baselineData.nitritesResult || "Negativo",
                  onChange: (val) => setBaselineData({ ...baselineData, nitritesResult: val }),
                  dateValue: baselineData.nitritesDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, nitritesDate: d }),
                  safeText: "Negativo",
                  alertText: "Positivo",
                })}

                {renderLabRow({
                  label: "Urocultivo:",
                  badge: "Bacteriuria Asintomática",
                  value: baselineData.urineCultureResult || "Negativo",
                  onChange: (val) => setBaselineData({ ...baselineData, urineCultureResult: val }),
                  dateValue: baselineData.urineCultureDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, urineCultureDate: d }),
                  safeText: "Negativo",
                  alertText: "Positivo",
                  hasNoApplies: true,
                })}

                {renderLabRow({
                  label: "BK en Espuro:",
                  badge: "BK Esputo / TBC",
                  value: baselineData.bkSputumResult || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, bkSputumResult: val }),
                  dateValue: baselineData.bkSputumDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, bkSputumDate: d }),
                  safeText: "Negativo",
                  alertText: "Positivo",
                  hasNoApplies: true,
                })}

                {renderLabRow({
                  label: "Listeria:",
                  value: baselineData.listeriaResult || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, listeriaResult: val }),
                  dateValue: baselineData.listeriaDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, listeriaDate: d }),
                  safeText: "Negativo",
                  alertText: "Positivo",
                  hasNoApplies: true,
                })}

                {renderLabRow({
                  label: "Tamizaje: Hepatitis B:",
                  badge: "HBsAg",
                  value: baselineData.hepatitisBResult || "Negativo",
                  onChange: (val) => setBaselineData({ ...baselineData, hepatitisBResult: val }),
                  dateValue: baselineData.hepatitisBDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, hepatitisBDate: d }),
                  safeText: "Negativo",
                  alertText: "Positivo",
                  hasNoApplies: true,
                })}
              </div>
            </div>

            {/* BLOQUE F: TAMIZAJE CERVICAL EN GESTANTES */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
                  Tamizaje de Cáncer de Cuello Uterino en Gestantes
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Descarte Neoplasia Cervical</span>
              </div>

              <div className="space-y-2">
                {renderLabRow({
                  label: "PAP:",
                  badge: "Papanicolaou",
                  value: baselineData.papTestResult || "Normal",
                  onChange: (val) => setBaselineData({ ...baselineData, papTestResult: val }),
                  dateValue: baselineData.papTestDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, papTestDate: d }),
                  safeText: "Normal",
                  alertText: "Anormal",
                })}

                {renderLabRow({
                  label: "IVAA:",
                  badge: "Ácido Acético",
                  value: baselineData.ivaaResult || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, ivaaResult: val }),
                  dateValue: baselineData.ivaaDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, ivaaDate: d }),
                  safeText: "Normal",
                  alertText: "Anormal",
                  hasNoApplies: true,
                })}

                {renderLabRow({
                  label: "Colposcopia:",
                  value: baselineData.colposcopyResult || "No se Aplica",
                  onChange: (val) => setBaselineData({ ...baselineData, colposcopyResult: val }),
                  dateValue: baselineData.colposcopyDate,
                  onDateChange: (d) => setBaselineData({ ...baselineData, colposcopyDate: d }),
                  safeText: "Normal",
                  alertText: "Anormal",
                  hasNoApplies: true,
                })}
              </div>
            </div>

          </div>

          {/* 9.4 Banners de Protocolo Clínico & Alertas Patológicas */}
          {labPathologicalAlerts.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-100 border border-amber-300 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" />
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  Alertas Patológicas Detectadas en Laboratorio ({labPathologicalAlerts.length}):
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {labPathologicalAlerts.map((al) => (
                  <span key={al} className="px-2.5 py-1 rounded-md text-xs font-black bg-amber-300 border border-amber-500 text-amber-950 shadow-2xs">
                    {al}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-amber-900 pt-1">
                <strong>Conducta Inmediata:</strong> Si VDRL/Sífilis reactivo, iniciar Penicilina Benzatínica 2.4 MUI según esquema MINSA para gestante y pareja. Si Urocultivo positivo, iniciar antibioticoterapia para prevención de parto prematuro y corioamnionitis. Si VIH reactivo, activar protocolo TARV materno.
              </p>
            </div>
          )}

          {/* Nota Normativa MINSA NTS N° 105 */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
            <BookOpen className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 uppercase text-[10px] block">
                Norma Técnica de Salud MINSA &bull; Batería de Laboratorio CPN (NTS N° 105)
              </span>
              <p className="mt-0.5">
                Toda gestante debe contar en su primera atención prenatal con hemoglobina basal, glicemia en ayunas, tamizaje de sífilis (VDRL/PR), prueba rápida de VIH con consejería previa, tamizaje de Hepatitis B (HBsAg), urocultivo o examen de orina completo para despistaje de bacteriuria asintomática, y tamizaje de cáncer de cuello uterino (PAP).
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
