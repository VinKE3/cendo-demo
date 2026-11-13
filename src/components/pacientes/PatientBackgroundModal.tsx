"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Swal from "sweetalert2";
import {
  X,
  Activity,
  Check,
  AlertCircle,
  Calendar,
  Shield,
  FileText,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";
import { PatientBackground } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";

export const STANDARD_CONTRACEPTIVE_OPTIONS = [
  "Ninguno",
  "Preservativo",
  "Anticonceptivos orales combinados",
  "Inyectable mensual",
  "Inyectable trimestral",
  "Implante subdérmico",
  "DIU T de Cobre",
  "DIU Hormonal (Mirena/Kyleena)",
  "Parche transdérmico",
  "Anillo vaginal",
  "Ligadura de trompas",
  "Quirúrgico / Salpingoclasia bilateral previa",
  "Vasectomía (pareja)",
  "Método del ritmo / Abstinencia periódica",
];

const backgroundSchema = z.object({
  obstetricFormula: z
    .string()
    .min(1, "La fórmula obstétrica es requerida (ej. G0 P0000)")
    .toUpperCase(),
  menarche: z.coerce.number().min(8, "Mínimo 8 años").max(20, "Máximo 20 años").optional(),
  sexualDebutAge: z.coerce.number().min(10, "Mínimo 10 años").max(40, "Máximo 40 años").optional(),
  sexualPartnersCount: z.coerce.number().min(0, "Mínimo 0").optional(),
  contraceptiveMethod: z.string().default("Ninguno"),
  lastMenstrualPeriod: z.string().default(""),
  papHistory: z.string().default("No refiere"),
  vphTestHistory: z.string().default("No realizado"),
  medicalAllergies: z.string().default("Niega"),
  surgeriesHistory: z.string().default("Niega"),
  familyHistory: z.string().default("No refiere"),
  notes: z.string().default(""),
});

type BackgroundFormData = z.infer<typeof backgroundSchema>;

interface PatientBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  initialData?: PatientBackground;
}

export function PatientBackgroundModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  initialData,
}: PatientBackgroundModalProps) {
  const { updateBackground } = useMedicalStore();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BackgroundFormData>({
    resolver: zodResolver(backgroundSchema),
    defaultValues: {
      obstetricFormula: "G0 P0000",
      menarche: 12,
      sexualDebutAge: 18,
      sexualPartnersCount: 1,
      contraceptiveMethod: "Ninguno",
      lastMenstrualPeriod: "",
      papHistory: "No refiere",
      vphTestHistory: "No realizado",
      medicalAllergies: "Niega",
      surgeriesHistory: "Niega",
      familyHistory: "No refiere",
      notes: "",
    },
  });

  const [customMacText, setCustomMacText] = useState("");
  const watchedMac = watch("contraceptiveMethod");

  // Lista dinámica de opciones que asegura que el valor actual de la paciente nunca quede vacío
  const availableMacOptions = useMemo(() => {
    const current = initialData?.contraceptiveMethod;
    if (current && !STANDARD_CONTRACEPTIVE_OPTIONS.includes(current)) {
      return [current, ...STANDARD_CONTRACEPTIVE_OPTIONS];
    }
    return STANDARD_CONTRACEPTIVE_OPTIONS;
  }, [initialData?.contraceptiveMethod]);

  // Calculadora Automática de Semanas / Días por FUR
  const watchedFur = watch("lastMenstrualPeriod");
  const furCalculation = useMemo(() => {
    if (!watchedFur) return null;
    const furDate = new Date(watchedFur + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - furDate.getTime();
    if (diffTime < 0) return { error: "La FUR no puede ser una fecha futura" };

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;

    return {
      days: diffDays,
      weeks,
      remainingDays,
      text: `${weeks} sem ${remainingDays} d (${diffDays} días de amenorrea)`,
    };
  }, [watchedFur]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          obstetricFormula: initialData.obstetricFormula || "G0 P0000",
          menarche: initialData.menarche || 12,
          sexualDebutAge: initialData.sexualDebutAge || 18,
          sexualPartnersCount: initialData.sexualPartnersCount ?? 1,
          contraceptiveMethod: initialData.contraceptiveMethod || "Ninguno",
          lastMenstrualPeriod: initialData.lastMenstrualPeriod || "",
          papHistory: initialData.papHistory || "No refiere",
          vphTestHistory: initialData.vphTestHistory || "No realizado",
          medicalAllergies: initialData.medicalAllergies || "Niega",
          surgeriesHistory: initialData.surgeriesHistory || "Niega",
          familyHistory: initialData.familyHistory || "No refiere",
          notes: initialData.notes || "",
        });
        setCustomMacText("");
      }
    }
  }, [isOpen, initialData, reset]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onSubmit = async (data: BackgroundFormData) => {
    try {
      const finalMac =
        data.contraceptiveMethod === "__OTRO__"
          ? (customMacText.trim() || "Otro")
          : data.contraceptiveMethod;

      updateBackground(patientId, {
        obstetricFormula: data.obstetricFormula.trim().toUpperCase(),
        menarche: data.menarche,
        sexualDebutAge: data.sexualDebutAge,
        sexualPartnersCount: data.sexualPartnersCount,
        contraceptiveMethod: finalMac,
        lastMenstrualPeriod: data.lastMenstrualPeriod,
        papHistory: data.papHistory.trim(),
        vphTestHistory: data.vphTestHistory.trim(),
        medicalAllergies: data.medicalAllergies.trim(),
        surgeriesHistory: data.surgeriesHistory.trim(),
        familyHistory: data.familyHistory.trim(),
        notes: data.notes.trim(),
      });

      await Swal.fire({
        icon: "success",
        title: "Antecedentes Actualizados",
        text: `El historial gineco-obstétrico de ${patientName} ha sido guardado exitosamente.`,
        confirmButtonColor: "#0A4D68",
        timer: 1600,
        showConfirmButton: false,
      });

      onClose();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: "No se pudieron guardar los antecedentes.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden cursor-default transition-all my-8"
      >
        {/* Cabecera */}
        <div className="p-5 border-b border-border bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-heading text-base">
                Antecedentes Gineco-Obstétricos
              </h3>
              <p className="text-xs text-muted">
                Paciente: <strong className="text-heading">{patientName}</strong> &bull; Historial persistente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Fila 1: Fórmula Obstétrica, MAC y FUR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Fórmula Obstétrica */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Fórmula Obstétrica <span className="text-status-alert">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. G0 P0000"
                {...register("obstetricFormula")}
                className={`w-full px-3 py-2 rounded-xl border bg-surface text-xs font-mono font-bold text-primary placeholder:text-muted focus:outline-none focus:ring-2 ${errors.obstetricFormula
                  ? "border-status-alert focus:ring-status-alert/20"
                  : "border-border focus:ring-primary/20"
                  }`}
              />
              <p className="text-[10px] text-muted">G: Gestas &bull; P: T P A V</p>
            </div>

            {/* MAC Actual */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                MAC Actual
              </label>
              <select
                {...register("contraceptiveMethod")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {availableMacOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
                <option value="__OTRO__">Otro (especificar libremente)...</option>
              </select>

              {watchedMac === "__OTRO__" && (
                <input
                  type="text"
                  placeholder="Escriba el método anticonceptivo..."
                  autoFocus
                  value={customMacText}
                  onChange={(e) => setCustomMacText(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-primary/40 bg-accent-soft/30 text-xs font-medium text-heading placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}
            </div>

            {/* FUR */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                FUR (Última Regla)
              </label>
              <input
                type="date"
                {...register("lastMenstrualPeriod")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-mono text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {furCalculation && !furCalculation.error && (
                <p className="text-[10px] text-primary font-bold bg-accent-soft px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3 text-secondary shrink-0" />
                  <span>{furCalculation.text}</span>
                </p>
              )}
            </div>
          </div>

          {/* Fila 2: Menarquia, IRS y Parejas Sexuales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Menarquia (Edad)
              </label>
              <input
                type="number"
                min={8}
                max={20}
                placeholder="Ej. 12"
                {...register("menarche")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-mono font-bold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                IRS (Inicio Sex.)
              </label>
              <input
                type="number"
                min={10}
                max={40}
                placeholder="Ej. 18"
                {...register("sexualDebutAge")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-mono font-bold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                N° Parejas Sexuales
              </label>
              <input
                type="number"
                min={0}
                placeholder="Ej. 1"
                {...register("sexualPartnersCount")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-mono font-bold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Fila 3: Historial Citológico PAP y Test VPH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Historial PAP Previo
              </label>
              <input
                type="text"
                placeholder="Ej. ASC-US (2025) o Negativo para lesión intraepitelial"
                {...register("papHistory")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Historial Test VPH
              </label>
              <input
                type="text"
                placeholder="Ej. Negativo 23 Genotipos PCR (2026)"
                {...register("vphTestHistory")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Fila 4: Alergias Medicamentosas y Cirugías Previas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Alergias Medicamentosas
              </label>
              <input
                type="text"
                placeholder="Ej. Niega alergias o Alergia a Penicilina"
                {...register("medicalAllergies")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Cirugías Previas
              </label>
              <input
                type="text"
                placeholder="Ej. Apendicectomía laparoscópica (2021)"
                {...register("surgeriesHistory")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Fila 5: Antecedentes Familiares y Notas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Antecedentes Familiares Relevantes
              </label>
              <textarea
                rows={2}
                placeholder="Ej. Madre con antecedente de miomatosis uterina operada"
                {...register("familyHistory")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Notas Clínicas Adicionales
              </label>
              <textarea
                rows={2}
                placeholder="Observaciones de la paciente para el Dr. Patrick Jacinto..."
                {...register("notes")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-muted hover:text-heading hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-secondary" />
              <span>Guardar Antecedentes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

