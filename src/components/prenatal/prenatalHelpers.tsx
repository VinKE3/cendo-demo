"use client";

import React from "react";

export const CLINIC_DOCTORS = [
  "PATRICK JOSE JACINTO GOMERO",
  "GABRIELA MENDOZA RIOS",
  "CARLOS ALBERTO MEDINA",
];

export function parseObstetricFormula(formula?: string) {
  if (!formula) return { gestas: 1, abortos: 0, partosVaginales: 0, cesareas: 0, nacidosVivos: 0, viven: 0 };
  const gMatch = formula.match(/G\s*(\d+)/i);
  const pMatch = formula.match(/P\s*(\d)(\d)(\d)(\d)/i);
  const gestas = gMatch ? parseInt(gMatch[1], 10) : 1;
  let partosVaginales = 0;
  let cesareas = 0;
  let abortos = 0;
  let nacidosVivos = 0;
  let viven = 0;

  if (pMatch) {
    const termino = parseInt(pMatch[1], 10);
    const prematuro = parseInt(pMatch[2], 10);
    abortos = parseInt(pMatch[3], 10);
    nacidosVivos = parseInt(pMatch[4], 10);
    viven = nacidosVivos;
    partosVaginales = termino + prematuro;
  }
  return { gestas, abortos, partosVaginales, cesareas, nacidosVivos, viven };
}

/**
 * Componente visual que reproduce las casillas cuadradas individuales
 * del formato oficial MINSA (No. HC, DNI, Código Afiliación, etc.)
 */
export function DigitGrid({
  value,
  length,
  className = "",
}: {
  value: string;
  length: number;
  className?: string;
}) {
  const cleanVal = (value || "").replace(/\s/g, "").slice(0, length);
  const chars = cleanVal.split("");
  const cells = Array.from({ length }, (_, i) => chars[i] || "");

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {cells.map((char, idx) => (
        <span
          key={idx}
          className="w-5 h-6 sm:w-6 sm:h-7 border border-slate-400 bg-white flex items-center justify-center font-mono font-bold text-xs text-slate-800 shadow-2xs rounded-xs"
        >
          {char}
        </span>
      ))}
    </div>
  );
}

/**
 * Componente visual de 2 casillas gemelas cuadradas [ ][ ]
 * para el diagrama de antecedentes obstétricos (Gestas, Partos, Cesáreas, etc.)
 */
export function PairDigitBox({
  label,
  value,
  onChange,
  variant = "default",
  badge,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  variant?: "default" | "yellow" | "red";
  badge?: string;
}) {
  const formatted = String(Math.max(0, value || 0)).padStart(2, "0").slice(-2);
  const d1 = formatted[0];
  const d2 = formatted[1];

  const colorStyles = {
    default: "bg-white border-slate-400 text-slate-800",
    yellow: "bg-amber-300 border-amber-500 text-amber-950 font-black shadow-2xs",
    red: "bg-red-500 border-red-600 text-white font-black shadow-2xs ring-2 ring-red-400/50",
  }[variant];

  return (
    <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all min-w-[105px] w-full max-w-[140px]">
      <div className="flex items-center gap-0.5">
        <span className={`w-7 h-8 sm:w-8 sm:h-9 border-2 rounded-xs flex items-center justify-center font-mono font-bold text-sm ${colorStyles}`}>
          {d1}
        </span>
        <span className={`w-7 h-8 sm:w-8 sm:h-9 border-2 rounded-xs flex items-center justify-center font-mono font-bold text-sm ${colorStyles}`}>
          {d2}
        </span>
      </div>

      <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight text-center leading-tight">
        {label}
      </span>

      {badge && (
        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
            variant === "red"
              ? "bg-red-100 text-red-800"
              : variant === "yellow"
              ? "bg-amber-100 text-amber-900"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {badge}
        </span>
      )}

      {/* Controles de ajuste rápido (+ / - / input) */}
      <div className="flex items-center gap-1 pt-0.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
          title="Restar 1"
        >
          -
        </button>
        <input
          type="number"
          min={0}
          max={99}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
          className="w-9 text-center font-mono font-bold text-xs border border-slate-300 rounded bg-slate-50 py-0.5"
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
          title="Sumar 1"
        >
          +
        </button>
      </div>
    </div>
  );
}
