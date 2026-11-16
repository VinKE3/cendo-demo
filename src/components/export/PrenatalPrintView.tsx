"use client";

import React from "react";
import { Patient, DoctorProfile, PrenatalCard } from "@/types/medical";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CendoFooterWave } from "@/components/export/CendoFooterWave";
import { evaluatePrenatalRisks } from "@/lib/prenatalCalculators";

interface PrenatalPrintViewProps {
  card: PrenatalCard;
  patient: Patient;
  doctor: DoctorProfile;
}

export function PrenatalPrintView({
  card,
  patient,
  doctor,
}: PrenatalPrintViewProps) {
  const { baseline, visits, maternalPathologies } = card;
  const risks = evaluatePrenatalRisks(baseline, patient.age, visits);

  const doctorDisplayName = (card.attendingDoctorName || doctor.fullName)
    .replace(/^dr\.?\s+/i, "")
    .trim();

  // Asegurar 9 columnas para la tabla de atenciones
  const visitColumns = Array.from({ length: 9 }, (_, idx) => {
    return visits.find((v) => v.visitNumber === idx + 1) || null;
  });

  return (
    <div
      id="prenatal-print-sheet"
      className="max-w-[210mm] mx-auto text-slate-900 bg-white font-sans text-xs"
    >
      {/* =========================================================================
          PÁGINA 1: ANVERSO - FILIACIÓN, ANTECEDENTES Y DATOS BASALES DEL EMBARAZO
          ========================================================================= */}
      <div className="page-sheet w-[210mm] min-h-[297mm] max-h-[297mm] p-[8mm_12mm_5mm_12mm] flex flex-col justify-between border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:rounded-none overflow-hidden box-border">
        <div className="space-y-2 flex-1">
          {/* 1. Membrete Dual CENDO & Especialista (Formato Colposcopía) */}
          <div className="border-b-2 border-primary pb-2 flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <BrandLogo size="md" showText={false} />
              <div>
                <h1 className="text-sm font-heading font-extrabold text-primary tracking-tight">
                  CENDO &bull; CENTRO DE ENDOMETRIOSIS & GINECOLOGÍA
                </h1>
                <p className="text-[10px] font-semibold text-slate-700">
                  Unidad de Medicina Materno-Fetal &bull; Control Prenatal de Alta Precisión
                </p>
                <p className="text-[8.5px] text-slate-500 font-mono mt-0.2">
                  {doctor.clinicAddress} &bull; Citas: {doctor.phone}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs font-heading font-extrabold text-slate-800">
                DR. {doctorDisplayName.toUpperCase()}
              </p>
              <p className="text-[9.5px] text-primary font-semibold">
                {doctor.specialty}
              </p>
              <p className="text-[9px] font-mono font-bold text-slate-600">
                CMP {doctor.cmp || "61693"} &bull; RNE {doctor.rne || "38657"}
              </p>
            </div>
          </div>

          {/* 2. Barra de Título Oficial MINSA / CLAP */}
          <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded border border-slate-300">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-primary text-[10px] uppercase tracking-wide">
                  CARNET DE ATENCIÓN MATERNO PERINATAL (ANVERSO &bull; PÁG. 1 / 2)
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[8px] font-bold">
                  MINSA / CLAP &bull; NTS N° 105
                </span>
              </div>
              <p className="text-[8px] text-slate-500">
                Sistema Informático Perinatal &bull; Centro Especializado CENDO
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[7.5px] font-bold">
                <span className="flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-100 border border-amber-300 text-amber-900">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-xs inline-block" /> Alerta
                </span>
                <span className="flex items-center gap-0.5 px-1 py-0.2 rounded bg-red-100 border border-red-300 text-red-900">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-xs inline-block" /> Seguimiento
                </span>
              </div>
              <span className="font-mono font-extrabold text-slate-900 text-xs px-2 py-0.5 rounded bg-white border border-slate-300">
                HC-{patient.dni}
              </span>
            </div>
          </div>

          {/* 3. Sección I: Filiación y Datos de la Gestante */}
          <div className="border border-slate-300 rounded p-1.5 bg-slate-50/50 text-[9px] space-y-1">
            <div className="grid grid-cols-12 gap-1.5 items-center">
              <div className="col-span-5">
                <span className="text-[7.5px] font-bold uppercase text-slate-500 block">Apellidos y Nombres:</span>
                <strong className="text-slate-900 font-bold text-[10.5px]">
                  {patient.lastName}, {patient.firstName}
                </strong>
              </div>
              <div className="col-span-2">
                <span className="text-[7.5px] font-bold uppercase text-slate-500 block">DNI N°:</span>
                <span className="font-mono font-bold text-slate-900 text-[10px]">{patient.dni}</span>
              </div>
              <div className={`col-span-2 p-0.5 rounded ${patient.age < 15 || patient.age > 35 ? "bg-amber-100 border border-amber-300" : ""}`}>
                <span className="text-[7.5px] font-bold uppercase text-slate-500 block">Edad:</span>
                <span className="font-bold text-slate-900 text-[10px]">
                  {patient.age} años
                  {patient.age < 15 || patient.age > 35 ? (
                    <span className="ml-1 text-[7px] px-1 bg-amber-400 text-black font-extrabold rounded">ALERTA</span>
                  ) : null}
                </span>
              </div>
              <div className={`col-span-3 p-0.5 rounded ${baseline.civilStatus === "Soltera" ? "bg-amber-50 border border-amber-200" : ""}`}>
                <span className="text-[7.5px] font-bold uppercase text-slate-500 block">Estado Civil / Estudios:</span>
                <span className="font-semibold text-slate-800 text-[9px]">
                  {baseline.civilStatus} &bull; {baseline.educationLevel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-1.5 pt-0.5 border-t border-slate-200 text-[8.5px]">
              <div className="col-span-4">
                <span className="text-[7.5px] font-bold uppercase text-slate-500 block">Establecimiento / Seguro:</span>
                <span className="text-slate-800 font-medium">CENDO Miraflores &bull; {baseline.insuranceType} ({baseline.insuranceCode || "Particular"})</span>
              </div>
              <div className="col-span-5">
                <span className="text-[7.5px] font-bold uppercase text-slate-500 block">Domicilio / Localidad:</span>
                <span className="text-slate-800 truncate block">{patient.address || "Miraflores, Lima"}</span>
              </div>
              <div className="col-span-3">
                <span className="text-[7.5px] font-bold uppercase text-slate-500 block">Teléfono de Contacto:</span>
                <span className="font-mono font-bold text-slate-900">{patient.phone}</span>
              </div>
            </div>

            {baseline.fatherName && (
              <div className="pt-0.5 border-t border-slate-200 text-[8px] text-slate-700 flex items-center justify-between">
                <span><strong>Padre del RN:</strong> {baseline.fatherName} {baseline.fatherDni ? `(DNI: ${baseline.fatherDni})` : ""}</span>
                <span><strong>Embarazo Planeado:</strong> Sí</span>
              </div>
            )}
          </div>

          {/* 4. Sección II: Antecedentes Obstétricos (Matriz Gráfica CLAP) */}
          <div className="grid grid-cols-12 gap-1.5">
            {/* Antecedentes Obstétricos (7 cols) */}
            <div className="col-span-7 border border-slate-300 rounded p-1.5 bg-white text-[9px] space-y-1">
              <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
                <span className="font-bold uppercase tracking-wider text-primary text-[8px]">
                  Antecedentes Obstétricos (G_ P____)
                </span>
                <span className="font-mono font-extrabold text-slate-800 text-[9.5px]">
                  G{baseline.gestas} P{baseline.partosVaginales + baseline.cesareas}{baseline.abortos}{baseline.nacidosVivos}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 text-center pt-0.5">
                <div className={`p-1 rounded border ${baseline.gestas === 0 || baseline.gestas >= 4 ? "bg-amber-100 border-amber-300" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-[7px] uppercase font-bold text-slate-500 block">Gestas</span>
                  <strong className={`text-xs ${baseline.gestas === 0 || baseline.gestas >= 4 ? "text-amber-800 font-extrabold" : "text-slate-900"}`}>
                    {baseline.gestas}
                  </strong>
                  {baseline.gestas >= 4 && <span className="text-[6.5px] font-bold text-amber-800 block">ALERTA</span>}
                </div>
                <div className={`p-1 rounded border ${baseline.abortos > 0 ? (baseline.abortos >= 3 ? "bg-red-100 border-red-300 text-red-900" : "bg-amber-100 border-amber-300 text-amber-900") : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-[7px] uppercase font-bold text-slate-500 block">Abortos</span>
                  <strong className="text-xs font-extrabold">
                    {baseline.abortos}
                  </strong>
                  {baseline.abortos > 0 && <span className="text-[6.5px] font-bold block">{baseline.abortos >= 3 ? "ROJO" : "ALERTA"}</span>}
                </div>
                <div className="p-1 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[7px] uppercase font-bold text-slate-500 block">Vaginales</span>
                  <strong className="text-xs text-slate-900">{baseline.partosVaginales}</strong>
                </div>
                <div className={`p-1 rounded border ${baseline.cesareas > 0 ? "bg-amber-100 border-amber-300" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-[7px] uppercase font-bold text-slate-500 block">Cesáreas</span>
                  <strong className={`text-xs ${baseline.cesareas > 0 ? "text-amber-800 font-extrabold" : "text-slate-900"}`}>
                    {baseline.cesareas}
                  </strong>
                  {baseline.cesareas > 0 && <span className="text-[6.5px] font-bold text-amber-800 block">ALERTA</span>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 text-center pt-0.5">
                <div className="p-0.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[7px] uppercase font-bold text-slate-500 block">Nacidos Vivos</span>
                  <strong className="text-[10px] text-slate-900">{baseline.nacidosVivos}</strong>
                </div>
                <div className={`p-0.5 rounded border ${baseline.nacidosMuertos > 0 ? "bg-amber-100 border-amber-300 text-amber-900 font-bold" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-[7px] uppercase font-bold text-slate-500 block">Nacidos Muertos</span>
                  <strong className="text-[10px]">{baseline.nacidosMuertos}</strong>
                </div>
                <div className="p-0.5 rounded bg-emerald-50 border border-emerald-200">
                  <span className="text-[7px] uppercase font-bold text-emerald-800 block">Viven</span>
                  <strong className="text-[10px] text-emerald-700 font-bold">{baseline.viven}</strong>
                </div>
              </div>
            </div>

            {/* Gestación Anterior & Factores (5 cols) */}
            <div className="col-span-5 border border-slate-300 rounded p-1.5 bg-white text-[8.5px] space-y-1">
              <span className="font-bold uppercase tracking-wider text-primary text-[8px] block border-b border-slate-200 pb-0.5">
                Gestación Anterior & Factores
              </span>
              <p className="text-slate-700">
                Terminación: <strong>{baseline.previousDeliveryType || "No aplica / Primigesta"}</strong>
              </p>
              <p className="text-slate-700">
                Per. Intergenésico Adecuado: <strong>{baseline.adequateIntergenesicPeriod ? "Sí" : "No aplica / < 2 años"}</strong>
              </p>
              <p className="text-slate-700">
                Lactancia previa: <strong>{baseline.breastfeedingMonths || "No hubo"}</strong>
              </p>
              <div className="pt-0.5 border-t border-slate-100 flex items-center justify-between text-[7.5px]">
                <span>RN Mayor Peso: <strong>{baseline.rnMayorPesoGramos ? `${baseline.rnMayorPesoGramos}g` : "—"}</strong></span>
                <span className={baseline.pretermHistory ? "px-1 rounded bg-amber-100 text-amber-800 font-bold" : ""}>
                  Pretérmino: <strong>{baseline.pretermHistory ? "SÍ (Alerta)" : "NO"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* 5. Sección III: Antecedentes Familiares, Personales & Vacunas */}
          <div className="grid grid-cols-12 gap-1.5 text-[8px]">
            <div className="col-span-4 border border-slate-300 rounded p-1.5 bg-slate-50/50">
              <span className="font-bold text-slate-700 uppercase block mb-0.5 text-[7.5px]">Antecedentes Familiares:</span>
              <p className="text-slate-800 leading-tight">
                {baseline.familyHistory && baseline.familyHistory.length > 0
                  ? baseline.familyHistory.join(", ")
                  : "Sin antecedentes familiares de relevancia"}
              </p>
            </div>
            <div className="col-span-5 border border-slate-300 rounded p-1.5 bg-slate-50/50">
              <span className="font-bold text-slate-700 uppercase block mb-0.5 text-[7.5px]">Antecedentes Personales:</span>
              <p className="text-slate-800 leading-tight">
                {baseline.personalHistory && baseline.personalHistory.length > 0
                  ? baseline.personalHistory.join(", ")
                  : "Niega patologías médicas previas"}
              </p>
            </div>
            <div className="col-span-3 border border-slate-300 rounded p-1.5 bg-slate-50/50">
              <span className="font-bold text-slate-700 uppercase block mb-0.5 text-[7.5px]">Vacunas Previas:</span>
              <div className="grid grid-cols-2 gap-0.5 text-[7.5px]">
                <span>Rubeola: <strong>{baseline.previousVaccines?.rubella ? "✓ SÍ" : "NO"}</strong></span>
                <span>Hepatitis B: <strong>{baseline.previousVaccines?.hepatitisB ? "✓ SÍ" : "NO"}</strong></span>
                <span>Papiloma: <strong>{baseline.previousVaccines?.hpv ? "✓ SÍ" : "NO"}</strong></span>
                <span>F. Amarilla: <strong>{baseline.previousVaccines?.yellowFever ? "✓ SÍ" : "NO"}</strong></span>
              </div>
            </div>
          </div>

          {/* 6. Sección IV: Embarazo Actual & Calculadora de Naegele */}
          <div className="border border-slate-300 rounded p-1.5 bg-amber-50/40 text-[8.5px] space-y-1">
            <div className="flex items-center justify-between border-b border-amber-200 pb-0.5">
              <span className="font-heading font-extrabold uppercase tracking-wider text-amber-950 text-[8.5px]">
                Datos Basales del Embarazo Actual & Regla de Naegele
              </span>
              <span className={`px-2 py-0.2 rounded font-mono font-bold text-[8px] ${risks.isHighRisk ? "bg-red-200 text-red-900 border border-red-300" : "bg-emerald-100 text-emerald-900 border border-emerald-300"}`}>
                {risks.riskCategory}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 items-center">
              <div className={`col-span-2 p-1 rounded border ${baseline.usualWeightKg < 45 ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-amber-200"}`}>
                <span className="text-[7px] uppercase font-bold text-slate-500 block">Peso Habitual:</span>
                <strong className="text-slate-900 text-xs">{baseline.usualWeightKg} kg</strong>
                {baseline.usualWeightKg < 45 && <span className="text-[6.5px] font-bold text-amber-800 block">ALERTA</span>}
              </div>
              <div className={`col-span-2 p-1 rounded border ${baseline.heightCm < 150 ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-amber-200"}`}>
                <span className="text-[7px] uppercase font-bold text-slate-500 block">Talla:</span>
                <strong className="text-slate-900 text-xs">{baseline.heightCm} cm</strong>
                {baseline.heightCm < 150 && <span className="text-[6.5px] font-bold text-amber-800 block">ALERTA</span>}
              </div>
              <div className={`col-span-2 p-1 rounded border ${baseline.rhFactor.includes("Rh (-)") ? "bg-amber-100 border-amber-300" : "bg-white border-amber-200"}`}>
                <span className="text-[7px] uppercase font-bold text-slate-500 block">Grupo & Rh:</span>
                <strong className="text-slate-900 text-xs">{baseline.bloodGroup} {baseline.rhFactor}</strong>
              </div>
              <div className={`col-span-3 p-1 rounded border ${baseline.fumDoubt ? "bg-amber-100 border-amber-300" : "bg-white border-amber-200"}`}>
                <span className="text-[7px] uppercase font-bold text-slate-500 block">FUM (Última Regla):</span>
                <strong className="text-slate-900 text-xs font-mono">{baseline.fum}</strong>
                {baseline.fumDoubt && <span className="text-[6.5px] font-bold text-amber-800 block">FUM DUDOSA (ALERTA)</span>}
              </div>
              <div className="col-span-3 p-1 rounded bg-primary text-white border border-primary text-center">
                <span className="text-[7px] uppercase font-bold text-secondary block">FPP (Regla Naegele):</span>
                <strong className="text-white text-xs font-mono">{baseline.fpp}</strong>
              </div>
            </div>

            {baseline.ultrasoundGestationalAgeWeeks && (
              <div className="text-[8px] text-slate-700 flex items-center justify-between pt-0.5 border-t border-amber-200/60">
                <span>EG por Ecografía Precoz: <strong>{baseline.ultrasoundGestationalAgeWeeks} sem</strong> (Fecha: {baseline.ultrasoundDate || "—"})</span>
                <span>Fumadora: <strong>{baseline.smokerCigarettesDay ? `${baseline.smokerCigarettesDay} cig/d (ALERTA)` : "No"}</strong> &bull; Drogas: <strong>{baseline.drugsUse ? "Sí (ALERTA)" : "No"}</strong></span>
              </div>
            )}
          </div>

          {/* 7. Sección V: Examen Físico Basal & Laboratorios de Tamizaje */}
          <div className="grid grid-cols-12 gap-1.5 text-[8px]">
            {/* Examen Físico */}
            <div className="col-span-4 border border-slate-300 rounded p-1.5 bg-white space-y-0.5">
              <span className="font-bold uppercase tracking-wider text-primary text-[7.5px] block border-b border-slate-200 pb-0.5">
                Examen Físico Basal
              </span>
              <div className="space-y-0.5 text-[8px]">
                <div className="flex justify-between"><span>Ex. Clínico:</span><strong>{baseline.clinicalExam}</strong></div>
                <div className="flex justify-between"><span>Mamas:</span><strong>{baseline.breastsExam}</strong></div>
                <div className="flex justify-between"><span>Cérvix:</span><strong>{baseline.cervixExam}</strong></div>
                <div className="flex justify-between"><span>Pelvis:</span><strong>{baseline.pelvisExam}</strong></div>
                <div className="flex justify-between"><span>Odontológico:</span><strong>{baseline.dentalExam}</strong></div>
              </div>
            </div>

            {/* Laboratorios de Tamizaje MINSA */}
            <div className="col-span-8 border border-slate-300 rounded p-1.5 bg-white space-y-0.5">
              <span className="font-bold uppercase tracking-wider text-primary text-[7.5px] block border-b border-slate-200 pb-0.5">
                Exámenes de Laboratorio Basales (Tamizaje MINSA)
              </span>
              <div className="grid grid-cols-3 gap-1 text-[7.5px]">
                <div className={`p-1 rounded border ${baseline.hemoglobin1 && baseline.hemoglobin1 < 11 ? "bg-amber-100 border-amber-300" : "bg-slate-50 border-slate-200"}`}>
                  <span className="block text-slate-500 font-bold">Hemoglobina 1:</span>
                  <strong className="font-mono text-slate-900">{baseline.hemoglobin1 ? `${baseline.hemoglobin1} g/dL` : "—"}</strong>
                  {baseline.hemoglobin1 && baseline.hemoglobin1 < 11 && <span className="text-[6px] font-bold text-amber-800 block">ANEMIA (ALERTA)</span>}
                </div>
                <div className={`p-1 rounded border ${baseline.bloodGlucose1 && baseline.bloodGlucose1 >= 92 ? "bg-amber-100 border-amber-300" : "bg-slate-50 border-slate-200"}`}>
                  <span className="block text-slate-500 font-bold">Glicemia 1:</span>
                  <strong className="font-mono text-slate-900">{baseline.bloodGlucose1 ? `${baseline.bloodGlucose1} mg/dL` : "—"}</strong>
                  {baseline.bloodGlucose1 && baseline.bloodGlucose1 >= 92 && <span className="text-[6px] font-bold text-amber-800 block">DG (ALERTA)</span>}
                </div>
                <div className={`p-1 rounded border ${baseline.vdrlRpr1 === "Reactivo" ? "bg-red-100 border-red-300 text-red-900" : "bg-slate-50 border-slate-200"}`}>
                  <span className="block text-slate-500 font-bold">VDRL / RPR:</span>
                  <strong className="text-slate-900">{baseline.vdrlRpr1 || "No reactivo"}</strong>
                </div>
                <div className={`p-1 rounded border ${baseline.hivScreening1 === "Positivo" ? "bg-red-100 border-red-300 text-red-900" : "bg-slate-50 border-slate-200"}`}>
                  <span className="block text-slate-500 font-bold">Tamizaje VIH:</span>
                  <strong className="text-slate-900">{baseline.hivScreening1 || "Negativo"}</strong>
                </div>
                <div className={`p-1 rounded border ${baseline.hepatitisBScreening === "Positivo" ? "bg-red-100 border-red-300 text-red-900" : "bg-slate-50 border-slate-200"}`}>
                  <span className="block text-slate-500 font-bold">Hepatitis B:</span>
                  <strong className="text-slate-900">{baseline.hepatitisBScreening || "Negativo"}</strong>
                </div>
                <div className={`p-1 rounded border ${baseline.completeUrineExam === "Patológico" ? "bg-amber-100 border-amber-300" : "bg-slate-50 border-slate-200"}`}>
                  <span className="block text-slate-500 font-bold">Ex. Orina / Urocultivo:</span>
                  <strong className="text-slate-900">{baseline.completeUrineExam || "Normal"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 8. Sección VI: Criterios de Riesgo Perinatal Detectados */}
          {risks && risks.warningFlags.length > 0 && (
            <div className="border border-amber-300 rounded p-1 bg-amber-50/60 text-[8px] space-y-0.5">
              <span className="font-bold uppercase text-amber-950 block text-[7.5px]">
                Criterios de Alerta Perinatal Activos en este Embarazo:
              </span>
              <p className="text-amber-900 font-medium leading-tight">
                {risks.warningFlags.join(" • ")}
              </p>
            </div>
          )}
        </div>

        {/* Cenefa de pie de Página 1 & Sello Médico */}
        <div className="shrink-0 pt-1 space-y-1">
          <div className="border-t border-slate-200 pt-1 flex items-end justify-between text-[8px]">
            <div className="text-slate-500 font-mono">
              <p>Formato de Carnet Perinatal Oficial MINSA / CLAP &bull; Anverso</p>
              <p>Continúa en Reverso: Matriz de 9 Atenciones, Curva AU y Patologías Maternas</p>
            </div>

            <div className="text-center min-w-[180px]">
              <div className="h-6 border-b border-slate-400 flex items-center justify-center">
                <span className="font-serif italic text-primary/70 text-xs select-none">
                  Dr. {doctorDisplayName}
                </span>
              </div>
              <p className="font-heading font-extrabold text-slate-900 text-[9.5px]">
                DR. {doctorDisplayName.toUpperCase()}
              </p>
              <p className="text-[8px] text-slate-600 font-mono">
                CMP {doctor.cmp || "61693"} &bull; RNE {doctor.rne || "38657"}
              </p>
            </div>
          </div>

          <CendoFooterWave
            address={doctor.clinicAddress}
            email={doctor.contactEmail}
            phone={doctor.phone}
          />
        </div>
      </div>

      {/* =========================================================================
          PÁGINA 2: REVERSO - MATRIZ DE 9 ATENCIONES PRENATALES & SIGNOS DE ALARMA
          ========================================================================= */}
      <div className="page-sheet w-[210mm] min-h-[297mm] max-h-[297mm] p-[8mm_12mm_5mm_12mm] flex flex-col justify-between border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:rounded-none overflow-hidden box-border">
        <div className="space-y-2 flex-1">
          {/* Header Reverso */}
          <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" showText={false} />
              <span className="text-xs font-heading font-extrabold text-primary">
                CENDO &bull; CARNET DE ATENCIÓN PRENATAL (PÁGINA 2 / 2)
              </span>
            </div>
            <div className="text-right text-[9.5px] text-slate-600">
              Paciente: <strong>{patient.lastName}, {patient.firstName}</strong> &bull; DNI {patient.dni}
            </div>
          </div>

          {/* Caja Destacada: Signos de Alarma Obstétrica */}
          <div className="p-2 rounded-lg bg-red-50/80 border border-red-200 text-red-950 text-[8.5px] space-y-1">
            <div className="flex items-center justify-between">
              <strong className="font-heading font-extrabold uppercase tracking-wider text-red-900 text-[9px] flex items-center gap-1">
                ⚠️ SIGNOS DE ALARMA MATERNO-FETAL &bull; ACUDIR DE INMEDIATO A EMERGENCIA:
              </strong>
              <span className="font-mono text-[8px] font-bold text-red-800">EMERGENCIAS CENDO: {doctor.phone}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[8px] leading-tight text-red-900">
              <div>&bull; Sangrado o pérdida de líquido vaginal</div>
              <div>&bull; Fiebre o escalofríos intensos</div>
              <div>&bull; Dolor de cabeza intenso o zumbido</div>
              <div>&bull; Dolor abdominal tipo contracción</div>
              <div>&bull; Hinchazón de cara, manos o pies</div>
              <div>&bull; Disminución de movimientos fetales</div>
              <div>&bull; Vómitos continuos o deshidratación</div>
              <div>&bull; Visión borrosa o luces titilantes</div>
            </div>
          </div>

          {/* Tabla Central: MATRIZ DE 9 ATENCIONES PRENATALES */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <div className="bg-primary text-white px-2 py-1 flex items-center justify-between">
              <span className="font-heading font-extrabold text-[9px] uppercase tracking-wider">
                Control de Consultas Prenatales (Atención 1 a 9)
              </span>
              <span className="font-mono text-[8px]">
                {visits.length} atenciones registradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[8px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                    <th className="p-1 text-left font-bold w-40 border-r border-slate-200">Parámetro Clínico</th>
                    {visitColumns.map((_, idx) => (
                      <th
                        key={idx}
                        className={`p-1 text-center font-bold border-r border-slate-200 w-16 ${
                          idx < visits.length ? "bg-primary/10 text-primary font-extrabold" : "text-slate-400"
                        }`}
                      >
                        Atención {idx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-mono">
                  {/* Fila: Fecha */}
                  <tr className="bg-slate-50/50">
                    <td className="p-1 font-sans font-bold text-slate-700 border-r border-slate-200">Fecha y Hora</td>
                    {visitColumns.map((v, idx) => (
                      <td key={idx} className="p-1 text-center border-r border-slate-200 font-bold">
                        {v ? `${v.visitDate.slice(5)} ${v.visitTime || ""}` : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Fila: Edad Gestacional */}
                  <tr>
                    <td className="p-1 font-sans font-bold text-slate-700 border-r border-slate-200">Edad Gestacional</td>
                    {visitColumns.map((v, idx) => (
                      <td key={idx} className="p-1 text-center border-r border-slate-200 font-bold text-primary">
                        {v ? `${v.gestationalAgeWeeks}s ${v.gestationalAgeDays}d` : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Fila: Peso Madre */}
                  <tr className="bg-slate-50/50">
                    <td className="p-1 font-sans text-slate-700 border-r border-slate-200">Peso Madre (kg)</td>
                    {visitColumns.map((v, idx) => (
                      <td key={idx} className="p-1 text-center border-r border-slate-200">
                        {v ? `${v.maternalWeightKg}` : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Fila: Presión Arterial */}
                  <tr>
                    <td className="p-1 font-sans font-bold text-slate-700 border-r border-slate-200">Presión Art. (mmHg)</td>
                    {visitColumns.map((v, idx) => {
                      const isHigh = v && parseInt(v.bloodPressure.split("/")[1] || "0", 10) >= 90;
                      return (
                        <td
                          key={idx}
                          className={`p-1 text-center border-r border-slate-200 font-bold ${
                            isHigh ? "bg-red-100 text-red-900" : ""
                          }`}
                        >
                          {v ? v.bloodPressure : "—"}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Fila: Pulso Materno */}
                  <tr className="bg-slate-50/50">
                    <td className="p-1 font-sans text-slate-700 border-r border-slate-200">Pulso (por min) / T°</td>
                    {visitColumns.map((v, idx) => (
                      <td key={idx} className="p-1 text-center border-r border-slate-200">
                        {v ? `${v.maternalPulse} / ${v.temperature}°` : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Fila: Altura Uterina */}
                  <tr>
                    <td className="p-1 font-sans text-slate-700 border-r border-slate-200">Altura Uterina (cm)</td>
                    {visitColumns.map((v, idx) => (
                      <td key={idx} className="p-1 text-center border-r border-slate-200">
                        {v && v.uterineHeightCm > 0 ? `${v.uterineHeightCm} cm` : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Fila: Situación / Presentación */}
                  <tr className="bg-slate-50/50">
                    <td className="p-1 font-sans text-slate-700 border-r border-slate-200">Sit / Pres / Pos</td>
                    {visitColumns.map((v, idx) => (
                      <td key={idx} className="p-1 text-center border-r border-slate-200">
                        {v && v.fetusSituation !== "NA" ? `${v.fetusSituation}/${v.fetusPresentation}/${v.fetusPosition}` : "NA"}
                      </td>
                    ))}
                  </tr>

                  {/* Fila: F.C.F. Fetal */}
                  <tr>
                    <td className="p-1 font-sans font-bold text-slate-700 border-r border-slate-200">F.C.F. (lat/min)</td>
                    {visitColumns.map((v, idx) => {
                      const isFcfAbnormal = v && v.fetalHeartRate > 0 && (v.fetalHeartRate < 120 || v.fetalHeartRate > 160);
                      return (
                        <td
                          key={idx}
                          className={`p-1 text-center border-r border-slate-200 font-bold ${
                            isFcfAbnormal ? "bg-red-100 text-red-900" : "text-emerald-800"
                          }`}
                        >
                          {v && v.fetalHeartRate > 0 ? v.fetalHeartRate : "—"}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Fila: Movimientos Fetales */}
                  <tr className="bg-slate-50/50">
                    <td className="p-1 font-sans text-slate-700 border-r border-slate-200">Mov. Fetal / Proteinuria</td>
                    {visitColumns.map((v, idx) => (
                      <td key={idx} className="p-1 text-center border-r border-slate-200">
                        {v ? `${v.fetalMovements} / ${v.proteinuria}` : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Fila: Edema & Reflejo */}
                  <tr>
                    <td className="p-1 font-sans text-slate-700 border-r border-slate-200">Edema / Reflejos</td>
                    {visitColumns.map((v, idx) => (
                      <td key={idx} className="p-1 text-center border-r border-slate-200">
                        {v ? `${v.edema} / ROT ${v.tendonReflex}` : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Fila: Fierro & Calcio */}
                  <tr className="bg-slate-50/50">
                    <td className="p-1 font-sans text-slate-700 border-r border-slate-200">Hierro / Calcio Indicado</td>
                    {visitColumns.map((v, idx) => (
                      <td key={idx} className="p-1 text-center border-r border-slate-200">
                        {v ? `${v.ironFolicAcidGiven ? "Fe:✓" : "Fe:—"} ${v.calciumGiven ? "Ca:✓" : "Ca:—"}` : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Fila: Próxima Cita */}
                  <tr>
                    <td className="p-1 font-sans font-bold text-slate-700 border-r border-slate-200">Próxima Cita (a/m/d)</td>
                    {visitColumns.map((v, idx) => (
                      <td key={idx} className="p-1 text-center border-r border-slate-200 font-bold text-primary">
                        {v ? v.nextAppointmentDate.slice(5) : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Fila: Responsable */}
                  <tr className="bg-slate-50/50">
                    <td className="p-1 font-sans text-slate-700 border-r border-slate-200">Médico Tratante</td>
                    {visitColumns.map((v, idx) => (
                      <td key={idx} className="p-1 text-center border-r border-slate-200 text-[7px] truncate max-w-16">
                        {v ? v.attendingDoctorName.split(" ").slice(0, 2).join(" ") : "—"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Patologías Maternas Diagnosticadas (CIE 10) */}
          <div className="border border-slate-300 rounded p-1.5 bg-slate-50/80 text-[8.5px] space-y-1">
            <span className="font-bold uppercase tracking-wider text-primary text-[8.5px] block border-b border-slate-200 pb-0.5">
              Patologías Maternas Diagnosticadas (CIE-10)
            </span>
            {maternalPathologies && maternalPathologies.length > 0 ? (
              <div className="grid grid-cols-2 gap-1">
                {maternalPathologies.map((mp, idx) => (
                  <div key={mp.id || idx} className="flex items-center justify-between p-1 rounded bg-white border border-slate-200">
                    <span className="font-semibold text-slate-800">{idx + 1}. {mp.name}</span>
                    <span className="font-mono text-[8px] font-bold px-1.5 py-0.2 bg-slate-100 rounded border border-slate-300">
                      CIE: {mp.cie10} ({mp.diagnosedDate})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">Sin patologías maternas agregadas durante el embarazo actual.</p>
            )}
          </div>

          {/* Servicios de Psicoprofilaxis y Plan de Parto */}
          <div className="grid grid-cols-4 gap-1 text-[8px] text-center">
            <div className="p-1 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-600 block">Psicoprofilaxis</span>
              <strong className="text-emerald-700 font-bold">Indicada</strong>
            </div>
            <div className="p-1 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-600 block">Estimulación Prenatal</span>
              <strong className="text-emerald-700 font-bold">Coordinada</strong>
            </div>
            <div className="p-1 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-600 block">Plan de Parto</span>
              <strong className="text-primary font-bold">En elaboración</strong>
            </div>
            <div className="p-1 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-600 block">Lugar del Parto</span>
              <strong className="text-slate-900 font-bold">Clínica CENDO</strong>
            </div>
          </div>
        </div>

        {/* Cenefa de pie y Firma Médica */}
        <div className="shrink-0 pt-3 space-y-2">
          <div className="border-t border-slate-200 pt-2 flex items-end justify-between text-xs">
            <div className="text-[8.5px] text-slate-400 font-mono space-y-0.5">
              <p>Carnet Oficial Materno Perinatal &bull; CENDO Miraflores</p>
              <p>Conforme a la Norma Técnica de Salud NTS N° 105-MINSA</p>
            </div>

            <div className="text-center space-y-0.5 min-w-[210px]">
              <div className="h-8 border-b border-slate-400 flex items-center justify-center">
                <span className="font-serif italic text-primary/70 text-sm select-none">
                  {doctor.doctorTitle || "Dr."} {doctorDisplayName}
                </span>
              </div>
              <p className="font-heading font-extrabold text-slate-900 text-[11px]">
                {(doctor.doctorTitle || "DR.").toUpperCase()} {doctorDisplayName.toUpperCase()}
              </p>
              <p className="text-[9px] text-slate-600 font-mono">
                {doctor.specialty} &bull; CMP {doctor.cmp} &bull; RNE {doctor.rne}
              </p>
            </div>
          </div>

          <CendoFooterWave
            address={doctor.clinicAddress}
            email={doctor.contactEmail}
            phone={doctor.phone}
          />
        </div>
      </div>
    </div>
  );
}

