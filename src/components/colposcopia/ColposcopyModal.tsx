"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Swal from "sweetalert2";
import {
  X,
  FileCheck2,
  Sparkles,
  Camera,
  Clock,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  User,
  ShieldCheck,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { ColposcopyReport, ColposcopyImage } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import { CervicalClock } from "./CervicalClock";

const colposcopySchema = z.object({
  patientId: z.string().min(1, "Debe seleccionar una paciente"),
  reportDate: z.string().min(10, "Fecha inválida (YYYY-MM-DD)"),
  adequateColposcopy: z.boolean().default(true),
  squamocolumnarJunctionVisible: z.enum(["Visible", "No visible", "Parcialmente visible"]),
  transformationZoneType: z.enum(["Tipo 1", "Tipo 2", "Tipo 3"]),
  matureSquamousEpithelium: z.boolean().default(true),
  ectopy: z.boolean().default(false),
  thinAcetowhiteEpithelium: z.boolean().default(false),
  denseAcetowhiteEpithelium: z.boolean().default(false),
  irregularBorder: z.boolean().default(false),
  fineMosaic: z.boolean().default(false),
  coarseMosaic: z.boolean().default(false),
  finePunctation: z.boolean().default(false),
  coarsePunctation: z.boolean().default(false),
  atypicalVessels: z.boolean().default(false),
  schillerTest: z.string().default("Negativo (Lugol Caoba)"),
  cervicalBiopsyTaken: z.boolean().default(false),
  diagnosis: z.string().min(3, "El diagnóstico colposcópico es requerido"),
  planRecommendations: z.string().min(3, "Las recomendaciones son requeridas"),
  cie10Code: z.string().default("N87.9"),
  doctorName: z.string().default(""),
});

type ColposcopyFormData = z.infer<typeof colposcopySchema>;

interface ColposcopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ColposcopyReport | null;
  defaultPatientId?: string;
}

const DEFAULT_IMAGES: ColposcopyImage[] = [
  {
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop",
    caption: "Cérvix con SSF: Ectopia periorificial sin sangrado",
    timestamp: "11:15",
  },
  {
    url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=500&auto=format&fit=crop",
    caption: "Ácido acético al 5%: Evaluación acetoblanca",
    timestamp: "11:18",
  },
  {
    url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=500&auto=format&fit=crop",
    caption: "Zona de transformación ampliada",
    timestamp: "11:21",
  },
  {
    url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=500&auto=format&fit=crop",
    caption: "Test de Schiller: Captación homogénea caoba",
    timestamp: "11:24",
  },
];

export function ColposcopyModal({
  isOpen,
  onClose,
  initialData,
  defaultPatientId,
}: ColposcopyModalProps) {
  const { patients, doctorProfile, addColposcopyReport, updateColposcopyReport } =
    useMedicalStore();
  const isEditing = Boolean(initialData);

  // Estados de acordeón estilo SANNA
  const [openSections, setOpenSections] = useState({
    ifcpc: true,
    findings: true,
    biopsy: true,
    photos: true,
    diagnosis: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Horas del reloj de biopsia
  const [biopsyHours, setBiopsyHours] = useState<string[]>([]);

  // Imágenes colposcópicas (4 fotos)
  const [images, setImages] = useState<ColposcopyImage[]>(DEFAULT_IMAGES);

  const defaultDoctorSignature = `Dr. ${doctorProfile.fullName} (CMP ${doctorProfile.cmp} / RNE ${doctorProfile.rne})`;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ColposcopyFormData>({
    resolver: zodResolver(colposcopySchema),
    defaultValues: {
      patientId: defaultPatientId || (patients[0]?.id || ""),
      reportDate: new Date().toISOString().split("T")[0],
      adequateColposcopy: true,
      squamocolumnarJunctionVisible: "Visible",
      transformationZoneType: "Tipo 1",
      matureSquamousEpithelium: true,
      ectopy: false,
      thinAcetowhiteEpithelium: false,
      denseAcetowhiteEpithelium: false,
      irregularBorder: false,
      fineMosaic: false,
      coarseMosaic: false,
      finePunctation: false,
      coarsePunctation: false,
      atypicalVessels: false,
      schillerTest: "Negativo (Lugol Caoba)",
      cervicalBiopsyTaken: false,
      diagnosis: "",
      planRecommendations: "",
      cie10Code: "N87.9",
      doctorName: defaultDoctorSignature,
    },
  });

  const watchBiopsyTaken = watch("cervicalBiopsyTaken");

  // Cargar datos para edición o nuevo
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          patientId: initialData.patientId,
          reportDate: initialData.reportDate,
          adequateColposcopy: initialData.adequateColposcopy,
          squamocolumnarJunctionVisible: initialData.squamocolumnarJunctionVisible,
          transformationZoneType: initialData.transformationZoneType,
          matureSquamousEpithelium: initialData.matureSquamousEpithelium,
          ectopy: initialData.ectopy,
          thinAcetowhiteEpithelium: initialData.thinAcetowhiteEpithelium,
          denseAcetowhiteEpithelium: initialData.denseAcetowhiteEpithelium,
          irregularBorder: initialData.irregularBorder,
          fineMosaic: initialData.fineMosaic,
          coarseMosaic: initialData.coarseMosaic,
          finePunctation: initialData.finePunctation,
          coarsePunctation: initialData.coarsePunctation,
          atypicalVessels: initialData.atypicalVessels,
          schillerTest: initialData.schillerTest,
          cervicalBiopsyTaken: initialData.cervicalBiopsyTaken,
          diagnosis: initialData.diagnosis,
          planRecommendations: initialData.planRecommendations,
          cie10Code: initialData.cie10Code,
          doctorName: initialData.doctorName || defaultDoctorSignature,
        });
        setBiopsyHours(initialData.biopsyClockHours || []);
        setImages(initialData.images && initialData.images.length > 0 ? initialData.images : DEFAULT_IMAGES);
      } else {
        reset({
          patientId: defaultPatientId || (patients[0]?.id || ""),
          reportDate: new Date().toISOString().split("T")[0],
          adequateColposcopy: true,
          squamocolumnarJunctionVisible: "Visible",
          transformationZoneType: "Tipo 1",
          matureSquamousEpithelium: true,
          ectopy: false,
          thinAcetowhiteEpithelium: false,
          denseAcetowhiteEpithelium: false,
          irregularBorder: false,
          fineMosaic: false,
          coarseMosaic: false,
          finePunctation: false,
          coarsePunctation: false,
          atypicalVessels: false,
          schillerTest: "Negativo (Lugol Caoba)",
          cervicalBiopsyTaken: false,
          diagnosis: "Colposcopía adecuada. Zona de transformación Tipo 1. Epitelio escamoso maduro, sin hallazgos colposcópicos sugerentes de malignidad ni displasia.",
          planRecommendations: "Control citológico (Papanicolaou) preventivo anual.",
          cie10Code: "Z01.4",
          doctorName: defaultDoctorSignature,
        });
        setBiopsyHours([]);
        setImages(DEFAULT_IMAGES);
      }
    }
  }, [isOpen, initialData, defaultPatientId, defaultDoctorSignature, patients, reset]);

  // BOTÓN MÁGICO: Marcar Hallazgos Normales por Defecto
  const handleSetNormalDefaults = () => {
    setValue("adequateColposcopy", true);
    setValue("squamocolumnarJunctionVisible", "Visible");
    setValue("transformationZoneType", "Tipo 1");
    setValue("matureSquamousEpithelium", true);
    setValue("ectopy", false);
    setValue("thinAcetowhiteEpithelium", false);
    setValue("denseAcetowhiteEpithelium", false);
    setValue("irregularBorder", false);
    setValue("fineMosaic", false);
    setValue("coarseMosaic", false);
    setValue("finePunctation", false);
    setValue("coarsePunctation", false);
    setValue("atypicalVessels", false);
    setValue("schillerTest", "Negativo (Lugol Caoba)");
    setValue("cervicalBiopsyTaken", false);
    setValue("cie10Code", "Z01.4");
    setValue(
      "diagnosis",
      "Colposcopía adecuada. Zona de transformación Tipo 1. Epitelio escamoso maduro, sin hallazgos colposcópicos de sospecha ni displasia cervical."
    );
    setValue("planRecommendations", "Control citológico preventivo en 1 año.");
    setBiopsyHours([]);

    Swal.fire({
      icon: "success",
      title: "Parámetros Normales Aplicados",
      text: "Se marcaron todos los hallazgos fisiológicos normales por defecto. Active únicamente los hallazgos patológicos positivos observados.",
      confirmButtonColor: "#0A4D68",
      timer: 1800,
      showConfirmButton: false,
    });
  };

  // Selector rápido CIE-10
  const handleSelectCie10 = (code: string, desc: string) => {
    setValue("cie10Code", code);
    if (!watch("diagnosis")) {
      setValue("diagnosis", desc);
    }
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Archivo No Válido",
        text: "Por favor seleccione una imagen (JPEG, PNG, WebP).",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImages((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            url: result,
          };
          return updated;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const onSubmit = async (data: ColposcopyFormData) => {
    try {
      if (data.cervicalBiopsyTaken && biopsyHours.length === 0) {
        await Swal.fire({
          icon: "warning",
          title: "Indique las Horas de Biopsia",
          text: "Marcó que se tomó biopsia dirigida de cérvix. Por favor haga clic en el Reloj Cervical en al menos una hora (ej. 6:00 o 12:00) para ubicar el sitio de la toma.",
          confirmButtonColor: "#0A4D68",
        });
        return;
      }
      if (isEditing && initialData) {
        updateColposcopyReport(initialData.id, {
          patientId: data.patientId,
          reportDate: data.reportDate,
          adequateColposcopy: data.adequateColposcopy,
          squamocolumnarJunctionVisible: data.squamocolumnarJunctionVisible,
          transformationZoneType: data.transformationZoneType,
          matureSquamousEpithelium: data.matureSquamousEpithelium,
          ectopy: data.ectopy,
          thinAcetowhiteEpithelium: data.thinAcetowhiteEpithelium,
          denseAcetowhiteEpithelium: data.denseAcetowhiteEpithelium,
          irregularBorder: data.irregularBorder,
          fineMosaic: data.fineMosaic,
          coarseMosaic: data.coarseMosaic,
          finePunctation: data.finePunctation,
          coarsePunctation: data.coarsePunctation,
          atypicalVessels: data.atypicalVessels,
          schillerTest: data.schillerTest,
          cervicalBiopsyTaken: data.cervicalBiopsyTaken,
          biopsyClockHours: data.cervicalBiopsyTaken ? biopsyHours : [],
          images,
          diagnosis: data.diagnosis.trim(),
          planRecommendations: data.planRecommendations.trim(),
          cie10Code: data.cie10Code,
          doctorName: data.doctorName || defaultDoctorSignature,
        });

        await Swal.fire({
          icon: "success",
          title: "Informe Actualizado",
          text: "El informe de colposcopía se actualizó exitosamente.",
          confirmButtonColor: "#0A4D68",
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        addColposcopyReport({
          patientId: data.patientId,
          reportDate: data.reportDate,
          adequateColposcopy: data.adequateColposcopy,
          squamocolumnarJunctionVisible: data.squamocolumnarJunctionVisible,
          transformationZoneType: data.transformationZoneType,
          matureSquamousEpithelium: data.matureSquamousEpithelium,
          ectopy: data.ectopy,
          thinAcetowhiteEpithelium: data.thinAcetowhiteEpithelium,
          denseAcetowhiteEpithelium: data.denseAcetowhiteEpithelium,
          irregularBorder: data.irregularBorder,
          fineMosaic: data.fineMosaic,
          coarseMosaic: data.coarseMosaic,
          finePunctation: data.finePunctation,
          coarsePunctation: data.coarsePunctation,
          atypicalVessels: data.atypicalVessels,
          schillerTest: data.schillerTest,
          cervicalBiopsyTaken: data.cervicalBiopsyTaken,
          biopsyClockHours: data.cervicalBiopsyTaken ? biopsyHours : [],
          images,
          diagnosis: data.diagnosis.trim(),
          planRecommendations: data.planRecommendations.trim(),
          cie10Code: data.cie10Code,
          doctorName: data.doctorName || defaultDoctorSignature,
        });

        await Swal.fire({
          icon: "success",
          title: "Informe Generado",
          text: "Informe de colposcopía IFCPC guardado en la historia clínica.",
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
        text: "Ocurrió un inconveniente al registrar el informe colposcópico.",
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
        className="bg-surface w-full max-w-4xl rounded-2xl border border-border shadow-2xl overflow-hidden cursor-default transition-all my-8 flex flex-col max-h-[90vh]"
      >
        {/* Cabecera del Modal con Botón Mágico */}
        <div className="p-5 border-b border-border bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-heading text-base">
                {isEditing ? "Editar Informe de Colposcopía" : "Nueva Evaluación de Colposcopía"}
              </h3>
              <p className="text-xs text-muted">
                Nomenclatura IFCPC Río de Janeiro &bull; Protocolo Digital CENDO
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleSetNormalDefaults}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              title="Pone todos los hallazgos en normales/benignos con 1 clic"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Marcar Normales por Defecto</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulario Acordeón con Scroll */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Fila Inicial: Selector de Paciente y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-border">
            <div className="space-y-1">
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
                Fecha del Procedimiento <span className="text-status-alert">*</span>
              </label>
              <input
                type="date"
                {...register("reportDate")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-mono font-bold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* BLOQUE 1: Criterios IFCPC & Nomenclatura Río de Janeiro */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("ifcpc")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Criterios de Calidad IFCPC & Nomenclatura Río de Janeiro
                </span>
              </div>
              {openSections.ifcpc ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {openSections.ifcpc && (
              <div className="p-4 space-y-4 text-xs border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Adecuada */}
                  <div className="space-y-1">
                    <label className="font-bold text-heading uppercase tracking-wider block text-[10px]">
                      Adecuación Colposcópica
                    </label>
                    <select
                      {...register("adequateColposcopy", {
                        setValueAs: (v) => v === "true" || v === true,
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="true">Adecuada</option>
                      <option value="false">Inadecuada</option>
                    </select>
                  </div>

                  {/* UEC */}
                  <div className="space-y-1">
                    <label className="font-bold text-heading uppercase tracking-wider block text-[10px]">
                      Unión Escamocolumnar (UEC)
                    </label>
                    <select
                      {...register("squamocolumnarJunctionVisible")}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Visible">Visible</option>
                      <option value="Parcialmente visible">Parcialmente visible</option>
                      <option value="No visible">No visible</option>
                    </select>
                  </div>

                  {/* Tipo de ZT */}
                  <div className="space-y-1">
                    <label className="font-bold text-heading uppercase tracking-wider block text-[10px]">
                      Tipo de Zona de Transformación
                    </label>
                    <select
                      {...register("transformationZoneType")}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Tipo 1">Tipo 1 (Completamente ectocervical)</option>
                      <option value="Tipo 2">Tipo 2 (Componente endocervical visible)</option>
                      <option value="Tipo 3">Tipo 3 (Componente endocervical no visible)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("matureSquamousEpithelium")}
                      className="w-4 h-4 rounded text-primary accent-primary"
                    />
                    <span className="font-medium text-heading">Epitelio escamoso maduro normal</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("ectopy")}
                      className="w-4 h-4 rounded text-primary accent-primary"
                    />
                    <span className="font-medium text-heading">Ectopia / Ectropion periorificial</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* BLOQUE 2: Hallazgos Patológicos Mayores y Menores */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("findings")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Hallazgos Colposcópicos Anormales & Test de Schiller
                </span>
              </div>
              {openSections.findings ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {openSections.findings && (
              <div className="p-4 space-y-4 text-xs border-t border-border">
                <p className="text-[11px] text-muted">
                  Seleccione únicamente los hallazgos positivos identificados con ácido acético al 5% o Lugol:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("thinAcetowhiteEpithelium")}
                      className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                    />
                    <span className="text-[11px] font-medium text-heading">Acetoblanco Tenue</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("denseAcetowhiteEpithelium")}
                      className="w-4 h-4 rounded text-red-600 accent-red-600"
                    />
                    <span className="text-[11px] font-medium text-heading">Acetoblanco Denso</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("irregularBorder")}
                      className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                    />
                    <span className="text-[11px] font-medium text-heading">Borde Irregular</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("fineMosaic")}
                      className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                    />
                    <span className="text-[11px] font-medium text-heading">Mosaico Fino</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("coarseMosaic")}
                      className="w-4 h-4 rounded text-red-600 accent-red-600"
                    />
                    <span className="text-[11px] font-medium text-heading">Mosaico Grueso</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("finePunctation")}
                      className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                    />
                    <span className="text-[11px] font-medium text-heading">Punteado Fino</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("coarsePunctation")}
                      className="w-4 h-4 rounded text-red-600 accent-red-600"
                    />
                    <span className="text-[11px] font-medium text-heading">Punteado Grueso</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("atypicalVessels")}
                      className="w-4 h-4 rounded text-red-600 accent-red-600"
                    />
                    <span className="text-[11px] font-medium text-heading">Vasos Atípicos</span>
                  </label>
                </div>

                {/* Test de Schiller */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="font-bold text-heading uppercase tracking-wider block text-[10px] mb-1">
                    Test de Schiller (Lugol)
                  </label>
                  <select
                    {...register("schillerTest")}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Negativo (Lugol Caoba)">Negativo (Lugol Caoba homogéneo - Normal)</option>
                    <option value="Positivo (Yodo negativo)">Positivo (Yodo negativo - Zona acetoblanca no capta)</option>
                    <option value="Moteado / Captación parcial">Moteado / Captación parcial inflamatoria</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* BLOQUE 3: Mapeo de Biopsias con Reloj Cervical Interactivo (SVG) */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("biopsy")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-red-100 text-red-800 font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Mapeo de Biopsia Cervical & Reloj de Cuadrantes (SVG)
                </span>
              </div>
              {openSections.biopsy ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {openSections.biopsy && (
              <div className="p-4 space-y-4 text-xs border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("cervicalBiopsyTaken")}
                      className="w-5 h-5 rounded text-red-600 accent-red-600"
                    />
                    <span className="font-bold text-heading text-sm">
                      Se realizó toma de Biopsia de Cérvix dirigida
                    </span>
                  </label>

                  {watchBiopsyTaken && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                      Pin Tischler + Formol
                    </span>
                  )}
                </div>

                {watchBiopsyTaken ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-border flex flex-col items-center justify-center space-y-2">
                    <p className="text-xs font-bold text-heading">
                      Haga clic en las horas anatómicas (1 a 12) para indicar los sitios exactos de biopsia:
                    </p>
                    <CervicalClock
                      selectedHours={biopsyHours}
                      onChange={setBiopsyHours}
                      interactive={true}
                      size="md"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-muted italic bg-slate-50 p-3 rounded-xl border border-dashed border-border">
                    No se indicó biopsia dirigida en este procedimiento. Active la casilla superior para desplegar el mapa interactivo si tomó muestras.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* BLOQUE 4: Registro Fotográfico Colposcópico (4 Tomas) */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("photos")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Registro Fotográfico Colposcópico (Grilla Fija Proporcional)
                </span>
              </div>
              {openSections.photos ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {openSections.photos && (
              <div className="p-4 space-y-3 text-xs border-t border-border">
                <p className="text-[11px] text-muted">
                  4 tomas fotográficas estándar para el informe impreso y PDF institucional:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="group rounded-xl border border-border overflow-hidden bg-slate-100 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all"
                    >
                      <div className="aspect-4/3 relative bg-slate-200 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.caption}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[9px] font-bold">
                          Foto #{idx + 1}
                        </span>

                        {/* Botón de Reemplazo / Subida de Foto */}
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white cursor-pointer backdrop-blur-[1px]">
                          <Upload className="w-5 h-5 drop-shadow" />
                          <span className="text-[10px] font-semibold">Cambiar Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(idx, e)}
                          />
                        </label>
                      </div>
                      <div className="p-2 space-y-1 bg-white">
                        <label className="text-[9px] font-bold text-muted uppercase block">
                          Epígrafe de la Toma:
                        </label>
                        <input
                          type="text"
                          value={img.caption}
                          onChange={(e) => {
                            const newImages = [...images];
                            newImages[idx].caption = e.target.value;
                            setImages(newImages);
                          }}
                          className="w-full text-[10px] font-semibold text-heading bg-transparent border-b border-border/80 focus:outline-none focus:border-primary"
                          placeholder="Descripción clínica..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BLOQUE 5: Diagnóstico, Recomendaciones y CIE-10 */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("diagnosis")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  5
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Diagnóstico, Recomendaciones Clínicas y CIE-10
                </span>
              </div>
              {openSections.diagnosis ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {openSections.diagnosis && (
              <div className="p-4 space-y-4 text-xs border-t border-border">
                {/* Atajos Rápidos CIE-10 */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Atajos de Códigos CIE-10 Ginecológicos Frecuentes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectCie10("Z01.4", "Colposcopía y examen ginecológico de rutina sin hallazgos patológicos.")}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono text-[11px] font-bold hover:bg-emerald-100 border border-emerald-200"
                    >
                      Z01.4 (Normal)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectCie10("N87.0", "Displasia cervical leve (Neoplasia intraepitelial cervical NIC 1 / LIEBG).")}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-mono text-[11px] font-bold hover:bg-amber-100 border border-amber-200"
                    >
                      N87.0 (LIEBG / NIC 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectCie10("N87.1", "Displasia cervical moderada (Neoplasia intraepitelial cervical NIC 2 / LIEAG).")}
                      className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 font-mono text-[11px] font-bold hover:bg-red-100 border border-red-200"
                    >
                      N87.1 (LIEAG / NIC 2)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectCie10("N87.9", "Displasia cervical, no especificada.")}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono text-[11px] font-bold hover:bg-slate-200 border border-slate-300"
                    >
                      N87.9 (Displasia no esp.)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectCie10("N72", "Cervicitis inflamatoria aguda o crónica.")}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-mono text-[11px] font-bold hover:bg-sky-100 border border-sky-200"
                    >
                      N72 (Cervicitis)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-1 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-heading block">
                      Código CIE-10
                    </label>
                    <input
                      type="text"
                      {...register("cie10Code")}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-heading block">
                      Diagnóstico Colposcópico Conclusivo <span className="text-status-alert">*</span>
                    </label>
                    <textarea
                      rows={2}
                      {...register("diagnosis")}
                      placeholder="Conclusiones diagnósticas del examen..."
                      className={`w-full px-3 py-2 rounded-xl border bg-white text-xs font-medium text-heading focus:outline-none focus:ring-2 resize-none ${
                        errors.diagnosis
                          ? "border-status-alert focus:ring-status-alert/20"
                          : "border-border focus:ring-primary/20"
                      }`}
                    />
                    {errors.diagnosis && (
                      <p className="text-[11px] text-status-alert flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.diagnosis.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-heading block">
                    Conducta y Recomendaciones Terapéuticas <span className="text-status-alert">*</span>
                  </label>
                  <textarea
                    rows={2}
                    {...register("planRecommendations")}
                    placeholder="Plan a seguir, control citológico en 6 meses, tratamiento o biopsia..."
                    className={`w-full px-3 py-2 rounded-xl border bg-white text-xs font-medium text-heading focus:outline-none focus:ring-2 resize-none ${
                      errors.planRecommendations
                        ? "border-status-alert focus:ring-status-alert/20"
                        : "border-border focus:ring-primary/20"
                    }`}
                  />
                  {errors.planRecommendations && (
                    <p className="text-[11px] text-status-alert flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.planRecommendations.message}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
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
              <span>{isEditing ? "Guardar Cambios de Informe" : "Emitir Informe de Colposcopía"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

