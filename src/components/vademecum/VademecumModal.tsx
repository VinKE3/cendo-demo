"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Swal from "sweetalert2";
import {
  X,
  Pill,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Building2,
  Tag,
} from "lucide-react";
import { MedicationVademecum } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";

const brandSchema = z.object({
  brandName: z.string().min(1, "Nombre de marca requerido"),
  laboratory: z.string().min(1, "Laboratorio requerido"),
  presentation: z.string().min(1, "Presentación requerida"),
  referencePricePen: z.coerce
    .number({ invalid_type_error: "Precio numérico requerido" })
    .min(0, "El precio no puede ser negativo"),
});

const vademecumSchema = z.object({
  genericName: z
    .string()
    .min(2, "El nombre genérico o principio activo es requerido"),
  atcCode: z.string().min(2, "El código ATC es requerido").toUpperCase(),
  therapeuticGroup: z
    .string()
    .min(3, "El grupo terapéutico / indicación es requerido"),
  indications: z.string().min(3, "Las indicaciones clínicas son requeridas"),
  contraindications: z.string().default(""),
  commercialBrands: z
    .array(brandSchema)
    .min(1, "Debe registrar al menos una marca comercial disponible en Perú"),
});

type VademecumFormData = z.infer<typeof vademecumSchema>;

interface VademecumModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MedicationVademecum | null;
}

export function VademecumModal({
  isOpen,
  onClose,
  initialData,
}: VademecumModalProps) {
  const { addVademecumItem, updateVademecumItem } = useMedicalStore();
  const isEditing = Boolean(initialData);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VademecumFormData>({
    resolver: zodResolver(vademecumSchema),
    defaultValues: {
      genericName: "",
      atcCode: "",
      therapeuticGroup: "",
      indications: "",
      contraindications: "",
      commercialBrands: [
        {
          brandName: "",
          laboratory: "",
          presentation: "",
          referencePricePen: 35.0,
        },
      ],
    },
  });

  // Dynamic field array for multiple brands
  const { fields, append, remove } = useFieldArray({
    control,
    name: "commercialBrands",
  });

  // Load data for edit or reset for new
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          genericName: initialData.genericName,
          atcCode: initialData.atcCode,
          therapeuticGroup: initialData.therapeuticGroup,
          indications: initialData.indications,
          contraindications: initialData.contraindications || "",
          commercialBrands: initialData.commercialBrands.map((b) => ({
            brandName: b.brandName,
            laboratory: b.laboratory,
            presentation: b.presentation,
            referencePricePen: b.referencePricePen,
          })),
        });
      } else {
        reset({
          genericName: "",
          atcCode: "",
          therapeuticGroup: "",
          indications: "",
          contraindications: "",
          commercialBrands: [
            {
              brandName: "",
              laboratory: "",
              presentation: "",
              referencePricePen: 35.0,
            },
          ],
        });
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

  const onSubmit = async (data: VademecumFormData) => {
    try {
      if (isEditing && initialData) {
        updateVademecumItem(initialData.id, {
          genericName: data.genericName.trim(),
          atcCode: data.atcCode.trim().toUpperCase(),
          therapeuticGroup: data.therapeuticGroup.trim(),
          indications: data.indications.trim(),
          contraindications: data.contraindications.trim(),
          commercialBrands: data.commercialBrands.map((b) => ({
            brandName: b.brandName.trim(),
            laboratory: b.laboratory.trim(),
            presentation: b.presentation.trim(),
            referencePricePen: b.referencePricePen,
          })),
        });

        await Swal.fire({
          icon: "success",
          title: "Vademécum Actualizado",
          text: `"${data.genericName}" y sus ${data.commercialBrands.length} marcas se actualizaron correctamente.`,
          confirmButtonColor: "#0A4D68",
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        addVademecumItem({
          genericName: data.genericName.trim(),
          atcCode: data.atcCode.trim().toUpperCase(),
          therapeuticGroup: data.therapeuticGroup.trim(),
          indications: data.indications.trim(),
          contraindications: data.contraindications.trim(),
          commercialBrands: data.commercialBrands.map((b) => ({
            brandName: b.brandName.trim(),
            laboratory: b.laboratory.trim(),
            presentation: b.presentation.trim(),
            referencePricePen: b.referencePricePen,
          })),
        });

        await Swal.fire({
          icon: "success",
          title: "Medicamento Registrado",
          text: `"${data.genericName}" se incorporó al vademécum ginecológico oficial.`,
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
        text: "Ocurrió un inconveniente al registrar el medicamento.",
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
        {/* Cabecera del Modal */}
        <div className="p-5 border-b border-border bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-heading text-base">
                {isEditing ? "Editar Fármaco en Vademécum" : "Nuevo Principio Activo y Marcas"}
              </h3>
              <p className="text-xs text-muted">
                {isEditing
                  ? `Modificando ${initialData?.genericName} (${initialData?.commercialBrands.length} marcas)`
                  : "Registre principio activo, grupo terapéutico y marcas comerciales con precios en S/"}
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Fila 1: Principio Activo y Código ATC */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Nombre Genérico / Principio Activo <span className="text-status-alert">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Dienogest 2mg o Mupirocina 2%"
                {...register("genericName")}
                className={`w-full px-3 py-2 rounded-xl border bg-surface text-xs font-bold text-heading placeholder:text-muted focus:outline-none focus:ring-2 ${
                  errors.genericName
                    ? "border-status-alert focus:ring-status-alert/20"
                    : "border-border focus:ring-primary/20"
                }`}
              />
              {errors.genericName && (
                <p className="text-[11px] text-status-alert flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.genericName.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Código ATC <span className="text-status-alert">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. G03DB08"
                {...register("atcCode")}
                className={`w-full px-3 py-2 rounded-xl border bg-surface text-xs font-mono font-bold text-heading placeholder:text-muted focus:outline-none focus:ring-2 ${
                  errors.atcCode
                    ? "border-status-alert focus:ring-status-alert/20"
                    : "border-border focus:ring-primary/20"
                }`}
              />
              {errors.atcCode && (
                <p className="text-[11px] text-status-alert flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.atcCode.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Grupo Terapéutico */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-heading uppercase tracking-wider block">
              Grupo Terapéutico / Clasificación <span className="text-status-alert">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Progestágeno / Tratamiento de Endometriosis y Dolor Pélvico"
              {...register("therapeuticGroup")}
              className={`w-full px-3 py-2 rounded-xl border bg-surface text-xs font-medium text-heading placeholder:text-muted focus:outline-none focus:ring-2 ${
                errors.therapeuticGroup
                  ? "border-status-alert focus:ring-status-alert/20"
                  : "border-border focus:ring-primary/20"
              }`}
            />
            {errors.therapeuticGroup && (
              <p className="text-[11px] text-status-alert flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.therapeuticGroup.message}</span>
              </p>
            )}
          </div>

          {/* Indicaciones y Contraindicaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Indicaciones Clínicas <span className="text-status-alert">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Endometriosis sintomática, dolor pélvico crónico, etc."
                {...register("indications")}
                className={`w-full px-3 py-2 rounded-xl border bg-surface text-xs font-medium text-heading placeholder:text-muted focus:outline-none focus:ring-2 resize-none ${
                  errors.indications
                    ? "border-status-alert focus:ring-status-alert/20"
                    : "border-border focus:ring-primary/20"
                }`}
              />
              {errors.indications && (
                <p className="text-[11px] text-status-alert flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.indications.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Contraindicaciones Clave
              </label>
              <textarea
                rows={2}
                placeholder="Tromboembolismo venoso activo, hepatopatía severa..."
                {...register("contraindications")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>

          {/* SECCIÓN DINÁMICA: useFieldArray para Marcas Comerciales */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Marcas Comerciales y Precios en Farmacias Perú
                </h4>
                <p className="text-[11px] text-muted">
                  Agregue las distintas marcas de laboratorio disponibles para este principio activo.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  append({
                    brandName: "",
                    laboratory: "",
                    presentation: "",
                    referencePricePen: 40.0,
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center gap-1 border border-indigo-200 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agregar Marca</span>
              </button>
            </div>

            {errors.commercialBrands?.root && (
              <p className="text-[11px] text-status-alert flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.commercialBrands.root.message}</span>
              </p>
            )}

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-3 rounded-xl bg-slate-50 border border-border space-y-2 relative group hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted">
                    <span>Marca #{index + 1}</span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-muted hover:text-status-alert flex items-center gap-1 transition-colors"
                        title="Quitar marca"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Quitar</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {/* Nombre Marca */}
                    <div className="sm:col-span-1">
                      <input
                        type="text"
                        placeholder="Marca (ej. Visannette)"
                        {...register(`commercialBrands.${index}.brandName` as const)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs font-bold text-heading placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Laboratorio */}
                    <div className="sm:col-span-1">
                      <input
                        type="text"
                        placeholder="Lab (ej. Bayer)"
                        {...register(`commercialBrands.${index}.laboratory` as const)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Presentación */}
                    <div className="sm:col-span-1">
                      <input
                        type="text"
                        placeholder="Presentación (ej. Caja x 28)"
                        {...register(`commercialBrands.${index}.presentation` as const)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Precio Referencial */}
                    <div className="sm:col-span-1 relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted font-mono">
                        S/
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Precio S/"
                        {...register(`commercialBrands.${index}.referencePricePen` as const)}
                        className="w-full pl-7 pr-2.5 py-1.5 rounded-lg border border-border bg-white text-xs font-mono font-bold text-heading tabular-nums focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
              <span>{isEditing ? "Guardar Cambios" : "Crear Fármaco"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

