"use client";

import React, { useMemo } from "react";
import {
  Baby,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Printer,
  MessageCircle,
  Plus,
  Edit2,
  Heart,
  Scale,
  Activity,
  Shield,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { Patient, PrenatalCard, PrenatalVisitItem, DoctorProfile } from "@/types/medical";
import { calculateGestationalAge, evaluatePrenatalRisks } from "@/lib/prenatalCalculators";

interface TabControlPrenatalProps {
  patient: Patient;
  prenatalCard?: PrenatalCard | null;
  doctorProfile?: DoctorProfile | null;
  onOpenPrenatalModal: (tab?: "basal" | "consultas" | "aro") => void;
  onOpenPrenatalPrint: (card: PrenatalCard) => void;
}

export function TabControlPrenatal({
  patient,
  prenatalCard,
  doctorProfile,
  onOpenPrenatalModal,
  onOpenPrenatalPrint,
}: TabControlPrenatalProps) {
  // Cálculo de semanas de gestación y riesgo
  const { currentGestationalAge, risks, visitsCount } = useMemo(() => {
    if (!prenatalCard) {
      return { currentGestationalAge: null, risks: null, visitsCount: 0 };
    }
    const ga = calculateGestationalAge(prenatalCard.baseline.fum);
    const r = evaluatePrenatalRisks(
      prenatalCard.baseline,
      patient.age,
      prenatalCard.visits || []
    );
    return {
      currentGestationalAge: ga,
      risks: r,
      visitsCount: prenatalCard.visits?.length || 0,
    };
  }, [prenatalCard, patient.age]);

  // Si la paciente no tiene carnet aún
  if (!prenatalCard) {
    return (
      <div className="p-8 rounded-2xl bg-surface border border-border shadow-xs text-center space-y-5 max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
          <Baby className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-heading font-extrabold text-heading">
            Carnet de Control Prenatal (MINSA / CLAP)
          </h3>
          <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
            Esta paciente no cuenta aún con un carnet de control prenatal activo en el sistema.
            Aperture la ficha clínica perinatal con formato normado MINSA de 9 atenciones,
            cálculo automático de Naegele y detección de riesgo obstétrico.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => onOpenPrenatalModal("basal")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Aperturar Carnet de Control Prenatal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-6 border-t border-border/80">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Formato Oficial</span>
            <p className="text-xs font-semibold text-heading mt-0.5">MINSA / CLAP Perú</p>
            <p className="text-[10px] text-muted mt-0.5">Idéntico a la cartilla física nacional de 2 caras.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Calculadora Naegele</span>
            <p className="text-xs font-semibold text-heading mt-0.5">FPP & Semanas de EG</p>
            <p className="text-[10px] text-muted mt-0.5">Cálculo dinámico con alarma de postérmino.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Criterios de Alerta</span>
            <p className="text-xs font-semibold text-heading mt-0.5">Cribado ARO</p>
            <p className="text-[10px] text-muted mt-0.5">Casillas amarillas y rojas de riesgo.</p>
          </div>
        </div>
      </div>
    );
  }

  const { baseline, visits } = prenatalCard;

  return (
    <div className="space-y-6">
      {/* 1. Header de Control Prenatal & Acciones Rápidas */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Baby className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-heading font-extrabold text-heading">
                Carnet de Atención Prenatal Integral
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                MINSA / CLAP
              </span>
              {risks?.isHighRisk ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  <span>Alto Riesgo Obstétrico (ARO)</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Bajo Riesgo Obstétrico</span>
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-0.5">
              Establecimiento: <strong>{prenatalCard.clinicEstablishment || "CENDO Miraflores"}</strong> &bull; Especialista: <strong>{prenatalCard.attendingDoctorName || doctorProfile?.fullName || "Dr. Patrick Jacinto Gomero"}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onOpenPrenatalModal("consultas")}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow-md active:scale-95"
            title="Registrar los datos del control prenatal de hoy"
          >
            <Activity className="w-4 h-4 text-teal-100" />
            <span>+ Registrar Control de Hoy</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPrenatalPrint(prenatalCard)}
            className="px-3.5 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Ver informe oficial A4 e imprimir"
          >
            <Printer className="w-4 h-4 text-secondary" />
            <span>Ver / Imprimir A4</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPrenatalModal("basal")}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Edit2 className="w-4 h-4" />
            <span>Gestionar Carnet</span>
          </button>
        </div>
      </div>

      {/* 2. Tarjetas Métricas de la Gestación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Edad Gestacional */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
          <div className="flex items-center justify-between text-amber-900">
            <span className="text-[10px] uppercase font-bold tracking-wider">Edad Gestacional</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-heading font-extrabold text-amber-950">
            {currentGestationalAge
              ? `${currentGestationalAge.weeks}s ${currentGestationalAge.days}d`
              : "Calculando..."}
          </p>
          <p className="text-[11px] text-amber-800 font-mono">
            {currentGestationalAge ? `${currentGestationalAge.totalDays} días de amenorrea` : ""}
          </p>
        </div>

        {/* Card 2: FPP Naegele */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] uppercase font-bold tracking-wider">FPP (Regla Naegele)</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl font-heading font-extrabold text-primary font-mono">
            {baseline.fpp || "—"}
          </p>
          <p className="text-[11px] text-muted">
            FUM: <span className="font-mono font-semibold">{baseline.fum}</span> {baseline.fumDoubt ? "(Dudosa)" : "(Segura)"}
          </p>
        </div>

        {/* Card 3: Fórmula Obstétrica */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] uppercase font-bold tracking-wider">Fórmula Obstétrica</span>
            <Activity className="w-4 h-4 text-secondary" />
          </div>
          <p className="text-xl font-heading font-extrabold text-heading font-mono">
            G{baseline.gestas} P{baseline.partosVaginales + baseline.cesareas}{baseline.abortos}{baseline.nacidosVivos}
          </p>
          <p className="text-[11px] text-muted">
            {baseline.gestas === 1 ? "Primigesta" : `Multigesta (${baseline.gestas} gestas)`} &bull; {baseline.cesareas} cesárea(s)
          </p>
        </div>

        {/* Card 4: Avance de Atenciones */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] uppercase font-bold tracking-wider">Atenciones Prenatales</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-heading font-extrabold text-emerald-700">
            {visitsCount} de 9
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, (visitsCount / 9) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Panel de Criterios de Alerta y Factores de Riesgo */}
      {risks && risks.warningFlags.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2">
          <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Factores de Alerta y Riesgo Perinatal Detectados:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {risks.warningFlags.map((flag, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="truncate">{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Tabla de las 9 Atenciones Prenatales */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-heading font-bold text-sm text-heading flex items-center gap-2">
              <Baby className="w-4 h-4 text-primary" />
              <span>Matriz Longitudinal de Atenciones Prenatales (1 a 9)</span>
            </h3>
            <p className="text-xs text-muted">
              Parámetros clínicos registrados en cada visita conforme a la norma técnica del MINSA.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenPrenatalModal("consultas")}
            className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-800 font-bold hover:bg-teal-100 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" />
            <span>+ Registrar Nueva Atención</span>
          </button>
        </div>

        {visits && visits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-slate-600 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-bold text-center">N°</th>
                  <th className="py-2.5 px-3 font-bold">Fecha</th>
                  <th className="py-2.5 px-3 font-bold">Edad Gest.</th>
                  <th className="py-2.5 px-3 font-bold">Peso</th>
                  <th className="py-2.5 px-3 font-bold">P.A.</th>
                  <th className="py-2.5 px-3 font-bold">Alt. Uterina</th>
                  <th className="py-2.5 px-3 font-bold">FCF</th>
                  <th className="py-2.5 px-3 font-bold">Mov. Fet.</th>
                  <th className="py-2.5 px-3 font-bold">Edema</th>
                  <th className="py-2.5 px-3 font-bold">Sulf. Ferroso</th>
                  <th className="py-2.5 px-3 font-bold">Próx. Cita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {visits.map((v) => (
                  <tr key={v.visitNumber} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold font-mono text-center text-primary">
                      #{v.visitNumber}
                    </td>
                    <td className="py-2.5 px-3 font-semibold font-mono text-slate-800">
                      {v.visitDate}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-heading">
                      {v.gestationalAgeWeeks}s {v.gestationalAgeDays}d
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {v.maternalWeightKg} kg
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {v.bloodPressure}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {v.uterineHeightCm > 0 ? `${v.uterineHeightCm} cm` : "—"}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      {v.fetalHeartRate > 0 ? `${v.fetalHeartRate} lpm` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {v.fetalMovements || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {v.edema || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {v.ironFolicAcidGiven ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">✓ Sí</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">No</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-800">
                      {v.nextAppointmentDate || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted text-xs space-y-2">
            <Baby className="w-8 h-8 mx-auto text-slate-300" />
            <p>Aún no se han registrado atenciones periódicas para esta gestante.</p>
            <button
              type="button"
              onClick={() => onOpenPrenatalModal("consultas")}
              className="text-teal-700 font-bold hover:underline"
            >
              Registrar la 1ª Atención Prenatal
            </button>
          </div>
        )}
      </div>

      {/* 5. Datos Basales & Laboratorios de Tamizaje */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna Izquierda: Filiación & Antecedentes */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-muted">
              Filiación & Antecedentes
            </span>
            <span className="text-[11px] font-mono font-semibold text-primary">
              HC-{patient.dni}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-muted uppercase font-bold block">Grupo Sanguíneo & Rh</span>
              <p className="font-bold text-heading mt-0.5">{baseline.bloodGroup} {baseline.rhFactor}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted uppercase font-bold block">Peso Habitual & Talla</span>
              <p className="font-bold text-heading mt-0.5">{baseline.usualWeightKg} kg &bull; {baseline.heightCm} cm</p>
            </div>
            <div>
              <span className="text-[10px] text-muted uppercase font-bold block">Tipo de Seguro</span>
              <p className="font-semibold text-heading mt-0.5">{baseline.insuranceType} ({baseline.insuranceCode || "Particular"})</p>
            </div>
            <div>
              <span className="text-[10px] text-muted uppercase font-bold block">Nivel de Instrucción</span>
              <p className="font-semibold text-heading mt-0.5">{baseline.educationLevel}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-border/80 text-xs">
            <span className="text-[10px] text-muted uppercase font-bold block">Antecedentes Familiares / Personales</span>
            <p className="text-slate-700 mt-0.5">
              {[...(baseline.familyHistory || []), ...(baseline.personalHistory || [])].join(", ") || "Sin antecedentes patológicos de relevancia"}
            </p>
          </div>
        </div>

        {/* Columna Derecha: Laboratorios Basales de Tamizaje */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-muted">
              Exámenes de Tamizaje Basal MINSA
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              1º Trimestre
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-muted uppercase font-bold block">Hemoglobina 1</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">
                {baseline.hemoglobin1 ? `${baseline.hemoglobin1} g/dL` : "—"}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-muted uppercase font-bold block">Glucosa Basal</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">
                {baseline.bloodGlucose1 ? `${baseline.bloodGlucose1} mg/dL` : "—"}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-muted uppercase font-bold block">VDRL / RPR</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {baseline.vdrlRpr1 || "No reactivo"}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-muted uppercase font-bold block">Tamizaje VIH</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {baseline.hivScreening1 || "Negativo"}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-muted uppercase font-bold block">Hepatitis B</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {baseline.hepatitisBScreening || "Negativo"}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-muted uppercase font-bold block">Examen de Orina</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {baseline.completeUrineExam || "Normal"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
