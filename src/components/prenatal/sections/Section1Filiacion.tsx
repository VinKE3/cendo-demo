"use client";

import React from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { PrenatalBaselineData, Patient } from "@/types/medical";
import { DigitGrid } from "../prenatalHelpers";

interface Section1FiliacionProps {
  isOpen: boolean;
  onToggle: () => void;
  baselineData: PrenatalBaselineData;
  setBaselineData: React.Dispatch<React.SetStateAction<PrenatalBaselineData>>;
  patient: Patient;
  clinicEstablishment: string;
  setClinicEstablishment: React.Dispatch<React.SetStateAction<string>>;
  patientAge: number;
  setPatientAge: React.Dispatch<React.SetStateAction<number>>;
  isAgeRisk: boolean;
}

export function Section1Filiacion({
  isOpen,
  onToggle,
  baselineData,
  setBaselineData,
  patient,
  clinicEstablishment,
  setClinicEstablishment,
  patientAge,
  setPatientAge,
  isAgeRisk,
}: Section1FiliacionProps) {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0">
            1
          </span>
          <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
            FILIACIÓN DE LA GESTANTE & UBIGEO
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
            Filiación & Datos Sociodemográficos
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 space-y-4 text-xs border-t border-border bg-white">

          {/* 1.1 Cabecera CENDO: Título de Ficha + No. HC + Leyenda de Alertas */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Left: Clínica CENDO */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm shrink-0">
                <FileText className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider block">
                  CENDO &bull; Ficha de Control Materno Perinatal (CPN)
                </span>
                <span className="text-[11px] text-muted block">
                  Seguimiento longitudinal ambulatorio &amp; criterios de vigilancia obstétrica
                </span>
              </div>
            </div>

            {/* Right: No. HC (8 Casillas) + Leyenda */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-heading">No. HC:</span>
                <DigitGrid value={patient.dni} length={8} />
              </div>

              <div className="flex items-center gap-2 text-[10px] bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-500 inline-block" />
                  <span className="font-bold text-slate-700">= ALERTA</span>
                </div>
                <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-red-600 border border-red-700 inline-block" />
                  <span className="font-bold text-slate-700">= Seguimiento continuo</span>
                </div>
              </div>
            </div>
          </div>

          {/* 1.2 Caja Principal de Filiación */}
          <div className="rounded-2xl border-2 border-slate-300 p-5 space-y-5 bg-white relative shadow-2xs">

            {/* Cabecera integrada sobre la caja */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Nombres y Apellidos:</span>
                <span className="text-sm font-extrabold text-heading">
                  {patient.lastName}, {patient.firstName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase shrink-0">Establecimiento:</span>
                <input
                  type="text"
                  value={clinicEstablishment}
                  onChange={(e) => setClinicEstablishment(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary w-72"
                />
              </div>
            </div>

            {/* BLOQUE 1: Establecimiento de Origen */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-700 shrink-0">Establ. Origen:</span>
              <input
                type="text"
                value={baselineData.establishmentOrigin || ""}
                onChange={(e) => setBaselineData({ ...baselineData, establishmentOrigin: e.target.value })}
                placeholder="Centro de salud de origen..."
                className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex items-center gap-4 shrink-0 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={baselineData.originNoApplies ?? true}
                    onChange={(e) =>
                      setBaselineData({
                        ...baselineData,
                        originNoApplies: e.target.checked,
                        originReferral: e.target.checked ? false : baselineData.originReferral,
                      })
                    }
                    className="rounded text-primary focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-slate-700">No Aplica</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={baselineData.originReferral ?? false}
                    onChange={(e) =>
                      setBaselineData({
                        ...baselineData,
                        originReferral: e.target.checked,
                        originNoApplies: e.target.checked ? false : baselineData.originNoApplies,
                      })
                    }
                    className="rounded text-primary focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-slate-700">Referencia</span>
                </label>
              </div>
            </div>

            {/* BLOQUE 2: Tipo de Seguro & Código de Afiliación (En 2 columnas separadas para evitar colisión) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
              {/* Columna Izquierda: Tipo de Seguro */}
              <div className="flex flex-col gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Tipo de Seguro:</span>
                <div className="flex flex-wrap items-center gap-3">
                  {(["SIS", "ESSALUD", "PRIVADO", "No Aplica"] as const).map((seg) => (
                    <label key={seg} className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      <input
                        type="radio"
                        name="insuranceTypeRadio"
                        checked={baselineData.insuranceType === seg}
                        onChange={() => setBaselineData({ ...baselineData, insuranceType: seg })}
                        className="text-primary focus:ring-0"
                      />
                      <span className="text-xs font-semibold text-slate-800">{seg}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Columna Derecha: Código Afiliación Seguro (Con espacio amplio para las 12 casillas) */}
              <div className="flex flex-col gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">Código Afiliación Seguro:</span>
                  <input
                    type="text"
                    maxLength={12}
                    value={baselineData.insuranceAffiliationCode || ""}
                    onChange={(e) =>
                      setBaselineData({ ...baselineData, insuranceAffiliationCode: e.target.value.toUpperCase() })
                    }
                    placeholder="Ingresar código (hasta 12 car.)"
                    className="w-48 px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div className="overflow-x-auto py-0.5">
                  <DigitGrid value={baselineData.insuranceAffiliationCode || ""} length={12} />
                </div>
              </div>
            </div>

            {/* BLOQUE 3: DNI N° + Ocupación + Edad + Casilla Roja de Seguimiento */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-3 border-t border-slate-200">
              {/* DNI N° (4 cols) */}
              <div className="md:col-span-4 flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-700 shrink-0">DNI N°:</span>
                <DigitGrid value={patient.dni} length={8} />
              </div>

              {/* Ocupación (4 cols) */}
              <div className="md:col-span-4 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 shrink-0">Ocupación:</span>
                <input
                  type="text"
                  value={baselineData.patientOccupation || ""}
                  onChange={(e) => setBaselineData({ ...baselineData, patientOccupation: e.target.value })}
                  placeholder="Ocupación de la gestante..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Edad + Indicador Rojo < 15 / > 35 (4 cols) */}
              <div className="md:col-span-4 flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700">Edad:</span>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(parseInt(e.target.value, 10) || 0)}
                    className="w-14 px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-center bg-white"
                  />
                  <span className="text-[11px] text-slate-500">años</span>
                </div>

                {/* Casilla Roja de Seguimiento Continuo (< 15 / > 35) */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${isAgeRisk
                      ? "bg-red-500 text-white font-extrabold border-red-600 shadow-sm ring-2 ring-red-400/50"
                      : "bg-slate-50 text-slate-600 border-slate-300"
                    }`}
                  title={isAgeRisk ? "¡Alerta de Riesgo Obstétrico! (< 15 o > 35 años)" : "Edad dentro del rango estándar"}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-xs flex items-center justify-center font-bold text-[10px] ${isAgeRisk ? "bg-white text-red-600" : "border border-red-400 bg-red-100 text-red-600"
                      }`}
                  >
                    {isAgeRisk ? "✓" : ""}
                  </span>
                  <span className="text-[11px] font-bold">&lt; 15 / &gt; 35 (Seguimiento)</span>
                </div>
              </div>
            </div>

            {/* BLOQUE 4: Nivel de Instrucción (Estudios) & Años Aprobados */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold text-slate-700 shrink-0">Estudios:</span>

                  {/* Analfabeta (Alerta Amarilla) */}
                  <label
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${baselineData.educationLevel === "Analfabeta"
                        ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                        : "bg-amber-50 border-amber-200 text-amber-900"
                      }`}
                    title="Casilla de ALERTA"
                  >
                    <input
                      type="radio"
                      name="educationRadio"
                      checked={baselineData.educationLevel === "Analfabeta"}
                      onChange={() => setBaselineData({ ...baselineData, educationLevel: "Analfabeta" })}
                      className="text-amber-600 focus:ring-0"
                    />
                    <span className="text-xs font-bold">Analfabeta [ALERTA]</span>
                  </label>

                  <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer">
                    <input
                      type="radio"
                      name="educationRadio"
                      checked={baselineData.educationLevel === "Primaria"}
                      onChange={() => setBaselineData({ ...baselineData, educationLevel: "Primaria" })}
                      className="text-primary focus:ring-0"
                    />
                    <span className="text-xs text-slate-700">Primaria</span>
                  </label>

                  <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer">
                    <input
                      type="radio"
                      name="educationRadio"
                      checked={baselineData.educationLevel === "Secundaria"}
                      onChange={() => setBaselineData({ ...baselineData, educationLevel: "Secundaria" })}
                      className="text-primary focus:ring-0"
                    />
                    <span className="text-xs text-slate-700">Secundaria</span>
                  </label>

                  <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer">
                    <input
                      type="radio"
                      name="educationRadio"
                      checked={baselineData.educationLevel === "Superior Univ"}
                      onChange={() => setBaselineData({ ...baselineData, educationLevel: "Superior Univ" })}
                      className="text-primary focus:ring-0"
                    />
                    <span className="text-xs text-slate-700">Superior</span>
                  </label>

                  <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer">
                    <input
                      type="radio"
                      name="educationRadio"
                      checked={baselineData.educationLevel === "Superior No Univ"}
                      onChange={() => setBaselineData({ ...baselineData, educationLevel: "Superior No Univ" })}
                      className="text-primary focus:ring-0"
                    />
                    <span className="text-xs text-slate-700">Superior no Univ.</span>
                  </label>
                </div>

                {/* Años aprobados */}
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">Años aprobados:</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={baselineData.approvedEducationYears ?? 5}
                    onChange={(e) =>
                      setBaselineData({
                        ...baselineData,
                        approvedEducationYears: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-14 px-2 py-1 text-center font-bold text-xs rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* BLOQUE 5: Estado Civil & Padre del RN (En su propia fila dedicada, SIN Ubigeo mezclado) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-3 border-t border-slate-200">
              {/* Estado Civil (7 cols) */}
              <div className="lg:col-span-7 flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold text-slate-700 shrink-0">Estado Civil:</span>

                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="civilStatusRadio"
                    checked={baselineData.civilStatus === "Casada"}
                    onChange={() => setBaselineData({ ...baselineData, civilStatus: "Casada" })}
                    className="text-primary focus:ring-0"
                  />
                  <span className="text-xs text-slate-700">Casada</span>
                </label>

                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="civilStatusRadio"
                    checked={baselineData.civilStatus === "Conviviente"}
                    onChange={() => setBaselineData({ ...baselineData, civilStatus: "Conviviente" })}
                    className="text-primary focus:ring-0"
                  />
                  <span className="text-xs text-slate-700">Conviviente</span>
                </label>

                {/* Soltera con Alerta Amarilla */}
                <label
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${baselineData.civilStatus === "Soltera"
                      ? "bg-amber-300 border-amber-500 text-amber-950 font-bold shadow-2xs"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}
                  title="Casilla de ALERTA"
                >
                  <input
                    type="radio"
                    name="civilStatusRadio"
                    checked={baselineData.civilStatus === "Soltera"}
                    onChange={() => setBaselineData({ ...baselineData, civilStatus: "Soltera" })}
                    className="text-amber-600 focus:ring-0"
                  />
                  <span className="text-xs font-bold">Soltera [ALERTA]</span>
                </label>

                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="civilStatusRadio"
                    checked={baselineData.civilStatus === "Otro"}
                    onChange={() => setBaselineData({ ...baselineData, civilStatus: "Otro" })}
                    className="text-primary focus:ring-0"
                  />
                  <span className="text-xs text-slate-700">Otro</span>
                </label>
              </div>

              {/* Padre RN (5 cols) */}
              <div className="lg:col-span-5 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 shrink-0">Padre RN:</span>
                <input
                  type="text"
                  value={baselineData.fatherName || ""}
                  onChange={(e) => setBaselineData({ ...baselineData, fatherName: e.target.value })}
                  placeholder="Nombres y Apellidos del padre..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>

            {/* BLOQUE 6: Dirección, Localidad & Ubigeo (Organizado en 2 filas limpias) */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              {/* Fila 6.1: Dirección + Localidad + Cod. Sector */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-6 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 shrink-0">Dirección:</span>
                  <input
                    type="text"
                    value={baselineData.patientAddress || ""}
                    onChange={(e) => setBaselineData({ ...baselineData, patientAddress: e.target.value })}
                    placeholder="Dirección domiciliaria completa..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-4 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 shrink-0">Localidad:</span>
                  <input
                    type="text"
                    value={baselineData.locality || ""}
                    onChange={(e) => setBaselineData({ ...baselineData, locality: e.target.value })}
                    placeholder="Localidad..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700 shrink-0">Sector:</span>
                  <input
                    type="text"
                    value={baselineData.healthSectorCode || ""}
                    onChange={(e) => setBaselineData({ ...baselineData, healthSectorCode: e.target.value })}
                    placeholder="SEC-01"
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white text-center"
                  />
                </div>
              </div>

              {/* Fila 6.2: Departamento, Provincia, Distrito */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 shrink-0">Departamento:</span>
                  <input
                    type="text"
                    value={baselineData.department || ""}
                    onChange={(e) => setBaselineData({ ...baselineData, department: e.target.value })}
                    placeholder="ej. Lima"
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 shrink-0">Provincia:</span>
                  <input
                    type="text"
                    value={baselineData.province || ""}
                    onChange={(e) => setBaselineData({ ...baselineData, province: e.target.value })}
                    placeholder="ej. Lima"
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 shrink-0">Distrito:</span>
                  <input
                    type="text"
                    value={baselineData.district || ""}
                    onChange={(e) => setBaselineData({ ...baselineData, district: e.target.value })}
                    placeholder="ej. Miraflores"
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* BLOQUE 7: Contacto (Teléfono & Correo) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 shrink-0">Teléfono:</span>
                <input
                  type="text"
                  value={baselineData.patientPhone || ""}
                  onChange={(e) => setBaselineData({ ...baselineData, patientPhone: e.target.value })}
                  placeholder="ej. 987654321"
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 shrink-0">Correo electrónico:</span>
                <input
                  type="email"
                  value={baselineData.patientEmail || ""}
                  onChange={(e) => setBaselineData({ ...baselineData, patientEmail: e.target.value })}
                  placeholder="ej. paciente@gmail.com"
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
