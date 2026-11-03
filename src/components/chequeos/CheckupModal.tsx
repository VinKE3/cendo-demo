"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Swal from "sweetalert2";
import {
  X,
  Activity,
  Sparkles,
  Check,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  Stethoscope,
} from "lucide-react";
import { ClinicalCheckup } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";

const checkupSchema = z.object({
  patientId: z.string().min(1, "Debe seleccionar una paciente"),
  checkupDate: z.string().min(10, "Fecha inválida (YYYY-MM-DD)"),
  reasonForConsultation: z.string().min(3, "El motivo de consulta es requerido"),
  breastUltrasoundFindings: z.string().min(3, "Los hallazgos mamarios son requeridos"),
  breastUltrasoundBirads: z.string().default("BI-RADS 1 (Normal)"),
  breastLesionMeasurements: z.string().default("Sin lesiones focales"),
  transvaginalUltrasoundFindings: z.string().min(3, "Los hallazgos transvaginales son requeridos"),
  uterusMeasurements: z.string().min(2, "Las medidas del útero son requeridas (ej. 68 x 38 x 49 mm)"),
  endometriumThicknessMm: z.coerce
    .number({ invalid_type_error: "Grosor endometrial numérico requerido" })
    .min(0.5, "Mínimo 0.5 mm")
    .max(35, "Máximo 35 mm"),
  ovariesFindings: z.string().default("Ovarios de características ecográficas normales"),
  papResult: z.string().default("Pendiente de resultado"),
  vphResult: z.string().default("No solicitado / Pendiente"),
  conclusions: z.string().min(3, "Las conclusiones diagnósticas son requeridas"),
  medicalPrescription: z.string().default(""),
});

type CheckupFormData = z.infer<typeof checkupSchema>;

interface CheckupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ClinicalCheckup | null;
  defaultPatientId?: string;
}

export function CheckupModal({
  isOpen,
  onClose,
  initialData,
  defaultPatientId,
}: CheckupModalProps) {
  const { patients, addClinicalCheckup, updateClinicalCheckup } = useMedicalStore();
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckupFormData>({
    resolver: zodResolver(checkupSchema),
    defaultValues: {
      patientId: defaultPatientId || (patients[0]?.id || ""),
      checkupDate: new Date().toISOString().split("T")[0],
      reasonForConsultation: "Chequeo ginecológico preventivo anual",
      breastUltrasoundFindings: "Parénquima mamario de distribución simétrica sin nódulos sólidos ni microcalcificaciones.",
      breastUltrasoundBirads: "BI-RADS 1 (Normal)",
      breastLesionMeasurements: "Sin lesiones focales",
      transvaginalUltrasoundFindings: "Útero en AVF de morfología conservada. Miometrio homogéneo.",
      uterusMeasurements: "70 x 40 x 48 mm (Vol: 70 cc)",
      endometriumThicknessMm: 4.5,
      ovariesFindings: "Ovarios normales bilateralmente sin masas quísticas.",
      papResult: "Negativo para lesión intraepitelial",
      vphResult: "Negativo",
      conclusions: "Chequeo ginecológico dentro de límites normales.",
      medicalPrescription: "1. Control preventivo anual.\n2. Hábitos de vida saludables.",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          patientId: initialData.patientId,
          checkupDate: initialData.checkupDate,
          reasonForConsultation: initialData.reasonForConsultation,
          breastUltrasoundFindings: initialData.breastUltrasoundFindings,
          breastUltrasoundBirads: initialData.breastUltrasoundBirads,
          breastLesionMeasurements: initialData.breastLesionMeasurements,
          transvaginalUltrasoundFindings: initialData.transvaginalUltrasoundFindings,
          uterusMeasurements: initialData.uterusMeasurements,
          endometriumThicknessMm: initialData.endometriumThicknessMm,
          ovariesFindings: initialData.ovariesFindings,
          papResult: initialData.papResult,
          vphResult: initialData.vphResult,
          conclusions: initialData.conclusions,
          medicalPrescription: initialData.medicalPrescription || "",
        });
      } else {
        reset({
          patientId: defaultPatientId || (patients[0]?.id || ""),
          checkupDate: new Date().toISOString().split("T")[0],
          reasonForConsultation: "Chequeo ginecológico preventivo anual",
          breastUltrasoundFindings: "Parénquima mamario de distribución simétrica sin nódulos sólidos ni microcalcificaciones.",
          breastUltrasoundBirads: "BI-RADS 1 (Normal)",
          breastLesionMeasurements: "Sin lesiones focales",
          transvaginalUltrasoundFindings: "Útero en AVF de morfología conservada. Miometrio homogéneo sin nódulos.",
          uterusMeasurements: "70 x 40 x 48 mm (Vol: 70 cc)",
          endometriumThicknessMm: 4.5,
          ovariesFindings: "Ovarios normales bilateralmente sin masas quísticas.",
          papResult: "Negativo para lesión intraepitelial",
          vphResult: "Negativo",
          conclusions: "Chequeo ginecológico dentro de límites normales.",
          medicalPrescription: "1. Control preventivo anual.\n2. Estilo de vida saludable.",
        });
      }
    }
  }, [isOpen, initialData, defaultPatientId, patients, reset]);

  // PLANTILLAS RÁPIDAS CLÍNICAS
  const applyTemplate = (type: "normal" | "cyst" | "fibroid" | "endo") => {
    if (type === "normal") {
      setValue("breastUltrasoundFindings", "Parénquima mamario bilateral de distribución normal, sin nódulos ni adenopatías axilares patológicas.");
      setValue("breastUltrasoundBirads", "BI-RADS 1 (Normal)");
      setValue("breastLesionMeasurements", "Sin lesiones focales");
      setValue("transvaginalUltrasoundFindings", "Útero en AVF de medidas habituales. Miometrio homogéneo. Endometrio trilaminar regular.");
      setValue("uterusMeasurements", "68 x 38 x 46 mm (Vol: 62 cc)");
      setValue("endometriumThicknessMm", 5.2);
      setValue("ovariesFindings", "Ovarios de aspecto folicular fisiológico normal.");
      setValue("conclusions", "Chequeo ginecológico preventivo satisfactorio. Ecografías mamaria y transvaginal dentro de la normalidad.");
      setValue("medicalPrescription", "Control anual rutinario.");
    } else if (type === "cyst") {
      setValue("breastUltrasoundFindings", "En mama izquierda a radio 10 se observa nódulo anecoico de bordes bien delimitados, con refuerzo acústico posterior, compatible con quiste simple.");
      setValue("breastUltrasoundBirads", "BI-RADS 2 (Benigno)");
      setValue("breastLesionMeasurements", "Quiste simple 6.3 x 2.4 mm en radio 10 mama izquierda");
      setValue("transvaginalUltrasoundFindings", "Útero en AVF sin alteraciones miometriales. Endometrio lineal homogéneo.");
      setValue("conclusions", "Quiste simple benigno en mama izquierda (BI-RADS 2). Ecografía transvaginal normal.");
      setValue("medicalPrescription", "Ecografía mamaria de control en 1 año. No requiere intervención.");
    } else if (type === "fibroid") {
      setValue("transvaginalUltrasoundFindings", "Útero en AVF aumentado de volumen. En pared anterior intramural se visualiza nódulo hipoecoico bien delimitado de 28 x 25 mm compatible con mioma uterino FIGO 4.");
      setValue("uterusMeasurements", "85 x 52 x 62 mm (Vol: 143 cc)");
      setValue("endometriumThicknessMm", 6.8);
      setValue("conclusions", "Miomatosis uterina intramural única de 28 mm. Mama bilateral sin hallazgos patológicos (BI-RADS 1).");
      setValue("medicalPrescription", "1. Monitoreo ecográfico en 6 meses.\n2. Evaluar sangrado menstrual anormal.");
    } else if (type === "endo") {
      setValue("transvaginalUltrasoundFindings", "En ovario derecho se observa formación quística redondeada de 34 x 28 mm con ecos internos tenues en vidrio esmerilado, compatible con endometrioma ovárico.");
      setValue("ovariesFindings", "Ovario derecho con endometrioma de 34 mm. Ovario izquierdo normal.");
      setValue("conclusions", "Endometriosis ovárica derecha (Endometrioma de 34 mm). Descartar adherencias pélvicas.");
      setValue("medicalPrescription", "1. Dienogest 2mg diario vía oral continuo.\n2. Ecografía pélvica de control en 3 meses.");
    }

    Swal.fire({
      icon: "info",
      title: "Plantilla Aplicada",
      text: "Se cargaron los parámetros clínicos predefinidos. Puede ajustar cualquier medida específica.",
      confirmButtonColor: "#0A4D68",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  if (!isOpen) return null;

  const onSubmit = async (data: CheckupFormData) => {
    try {
      if (isEditing && initialData) {
        updateClinicalCheckup(initialData.id, {
          patientId: data.patientId,
          checkupDate: data.checkupDate,
          reasonForConsultation: data.reasonForConsultation.trim(),
          breastUltrasoundFindings: data.breastUltrasoundFindings.trim(),
          breastUltrasoundBirads: data.breastUltrasoundBirads,
          breastLesionMeasurements: data.breastLesionMeasurements.trim(),
          transvaginalUltrasoundFindings: data.transvaginalUltrasoundFindings.trim(),
          uterusMeasurements: data.uterusMeasurements.trim(),
          endometriumThicknessMm: data.endometriumThicknessMm,
          ovariesFindings: data.ovariesFindings.trim(),
          papResult: data.papResult.trim(),
          vphResult: data.vphResult.trim(),
          conclusions: data.conclusions.trim(),
          medicalPrescription: data.medicalPrescription.trim(),
        });

        await Swal.fire({
          icon: "success",
          title: "Chequeo Actualizado",
          text: "El registro de chequeo y ecografías se actualizó exitosamente.",
          confirmButtonColor: "#0A4D68",
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        addClinicalCheckup({
          patientId: data.patientId,
          checkupDate: data.checkupDate,
          reasonForConsultation: data.reasonForConsultation.trim(),
          breastUltrasoundFindings: data.breastUltrasoundFindings.trim(),
          breastUltrasoundBirads: data.breastUltrasoundBirads,
          breastLesionMeasurements: data.breastLesionMeasurements.trim(),
          transvaginalUltrasoundFindings: data.transvaginalUltrasoundFindings.trim(),
          uterusMeasurements: data.uterusMeasurements.trim(),
          endometriumThicknessMm: data.endometriumThicknessMm,
          ovariesFindings: data.ovariesFindings.trim(),
          papResult: data.papResult.trim(),
          vphResult: data.vphResult.trim(),
          conclusions: data.conclusions.trim(),
          medicalPrescription: data.medicalPrescription.trim(),
        });

        await Swal.fire({
          icon: "success",
          title: "Chequeo Registrado",
          text: "El informe de chequeo y ecografías se guardó en la historia clínica.",
          confirmButtonColor: "#0A4D68",
          timer: 1600,
          showConfirmButton: false,
        });
      }

      onClose();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: "Ocurrió un inconveniente al guardar el chequeo.",
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
        className="bg-surface w-full max-w-3xl rounded-2xl border border-border shadow-2xl overflow-hidden cursor-default transition-all my-8 flex flex-col max-h-[90vh]"
      >
        {/* Cabecera */}
        <div className="p-5 border-b border-border bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-heading text-base">
                {isEditing ? "Editar Chequeo Ginecológico & Ecografías" : "Nuevo Chequeo Ginecológico & Ecografías"}
              </h3>
              <p className="text-xs text-muted">
                Evaluación ecográfica de mama, útero y anexos con Doppler Color
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Barra de Plantillas Rápidas */}
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              Plantillas Rápidas de Diagnóstico
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyTemplate("normal")}
                className="px-2.5 py-1 rounded-lg bg-white text-indigo-900 border border-indigo-200 text-xs font-semibold hover:bg-indigo-100/70 transition-colors"
              >
                Mama & TV Normales (BI-RADS 1)
              </button>
              <button
                type="button"
                onClick={() => applyTemplate("cyst")}
                className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 border border-emerald-200 text-xs font-semibold hover:bg-emerald-50 transition-colors"
              >
                Quiste Simple Mama (BI-RADS 2)
              </button>
              <button
                type="button"
                onClick={() => applyTemplate("fibroid")}
                className="px-2.5 py-1 rounded-lg bg-white text-amber-900 border border-amber-200 text-xs font-semibold hover:bg-amber-50 transition-colors"
              >
                Mioma Intramural Uterino
              </button>
              <button
                type="button"
                onClick={() => applyTemplate("endo")}
                className="px-2.5 py-1 rounded-lg bg-white text-purple-900 border border-purple-200 text-xs font-semibold hover:bg-purple-50 transition-colors"
              >
                Endometrioma Ovárico
              </button>
            </div>
          </div>

          {/* Paciente y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Paciente Evaluada <span className="text-status-alert">*</span>
              </label>
              <select
                {...register("patientId")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-bold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.lastName}, {p.firstName} (DNI: {p.dni})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Fecha del Chequeo <span className="text-status-alert">*</span>
              </label>
              <input
                type="date"
                {...register("checkupDate")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-mono font-bold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Motivo de Consulta */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-heading uppercase tracking-wider block">
              Motivo de Consulta y Antecedente Clínico <span className="text-status-alert">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Chequeo preventivo anual y control de método anticonceptivo"
              {...register("reasonForConsultation")}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* SECCIÓN 1: Ecografía Mamaria Bilateral */}
          <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-3">
            <h4 className="font-heading font-extrabold text-xs text-heading uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              1. Ecografía Mamaria Bilateral
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-heading text-[10px] uppercase block">
                  Hallazgos Ecográficos Mamarios
                </label>
                <textarea
                  rows={2}
                  {...register("breastUltrasoundFindings")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-heading text-[10px] uppercase block">
                  Clasificación BI-RADS
                </label>
                <select
                  {...register("breastUltrasoundBirads")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="BI-RADS 1 (Normal)">BI-RADS 1 (Normal / Negativo)</option>
                  <option value="BI-RADS 2 (Benigno)">BI-RADS 2 (Benigno / Quiste simple)</option>
                  <option value="BI-RADS 3 (Prob. Benigno)">BI-RADS 3 (Probablemente benigno - Control 6m)</option>
                  <option value="BI-RADS 4 (Sospechoso)">BI-RADS 4 (Sospecha - Biopsia)</option>
                  <option value="BI-RADS 5 (Maligno)">BI-RADS 5 (Altamente sugestivo de malignidad)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-heading text-[10px] uppercase block">
                Medidas de Lesiones Mamarias (mm)
              </label>
              <input
                type="text"
                placeholder="Ej. Quiste simple 6.3 x 2.4 mm en radio 10 mama izquierda o Sin lesiones focales"
                {...register("breastLesionMeasurements")}
                className="w-full px-3 py-1.5 rounded-xl border border-border bg-white text-xs"
              />
            </div>
          </div>

          {/* SECCIÓN 2: Ecografía Transvaginal Doppler */}
          <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-3">
            <h4 className="font-heading font-extrabold text-xs text-heading uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              2. Ecografía Transvaginal Doppler Pélvica
            </h4>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-heading text-[10px] uppercase block">
                Hallazgos Uterinos y Anexiales
              </label>
              <textarea
                rows={2}
                {...register("transvaginalUltrasoundFindings")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-heading text-[10px] uppercase block">
                  Medidas del Útero & Volumen
                </label>
                <input
                  type="text"
                  placeholder="Ej. 68 x 38 x 49 mm (Vol: 66 cc)"
                  {...register("uterusMeasurements")}
                  className="w-full px-3 py-1.5 rounded-xl border border-border bg-white text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-heading text-[10px] uppercase block">
                  Grosor Endometrial (mm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("endometriumThicknessMm")}
                  className="w-full px-3 py-1.5 rounded-xl border border-border bg-white text-xs font-mono font-bold text-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-heading text-[10px] uppercase block">
                  Hallazgos Ováricos
                </label>
                <input
                  type="text"
                  placeholder="Ovarios normales sin masas"
                  {...register("ovariesFindings")}
                  className="w-full px-3 py-1.5 rounded-xl border border-border bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Laboratorio Asociado (PAP & VPH) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-heading text-[10px] uppercase block">
                Resultado Citología PAP
              </label>
              <input
                type="text"
                placeholder="Negativo para LIE o ASC-US"
                {...register("papResult")}
                className="w-full px-3 py-1.5 rounded-xl border border-border bg-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-heading text-[10px] uppercase block">
                Resultado Test Molecular VPH
              </label>
              <input
                type="text"
                placeholder="Negativo para 23 genotipos"
                {...register("vphResult")}
                className="w-full px-3 py-1.5 rounded-xl border border-border bg-white text-xs"
              />
            </div>
          </div>

          {/* SECCIÓN 4: Conclusiones y Prescripción Médica */}
          <div className="space-y-3 pt-2 border-t border-border text-xs">
            <div className="space-y-1">
              <label className="font-bold text-heading text-xs uppercase block">
                Conclusiones Diagnósticas Globales <span className="text-status-alert">*</span>
              </label>
              <textarea
                rows={2}
                {...register("conclusions")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-heading text-xs uppercase block">
                Receta / Prescripción Médica y Plan Terapéutico
              </label>
              <textarea
                rows={2}
                placeholder="1. Medicamentos indicados...&#10;2. Próximo control..."
                {...register("medicalPrescription")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs resize-none font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Botones de Envío */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3 shrink-0">
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
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-secondary" />
              <span>{isEditing ? "Guardar Cambios" : "Registrar Chequeo & Ecografías"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

