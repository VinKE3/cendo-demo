"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Swal from "sweetalert2";
import { X, Receipt, Check, AlertCircle } from "lucide-react";
import { ProcedureTariff } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";

const tariffSchema = z.object({
  code: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(15, "El código no debe exceder 15 caracteres")
    .toUpperCase(),
  name: z
    .string()
    .min(3, "El nombre del procedimiento debe tener al menos 3 caracteres"),
  category: z.enum(["Consulta", "Procedimiento", "Ecografía", "Laboratorio", "Paquete"], {
    errorMap: () => ({ message: "Seleccione una categoría válida" }),
  }),
  description: z.string().default(""),
  price: z.coerce
    .number({ invalid_type_error: "Ingrese un precio numérico válido" })
    .positive("El precio oficial debe ser mayor a S/ 0.00")
    .min(1, "El precio mínimo es S/ 1.00"),
  active: z.boolean().default(true),
});

type TariffFormData = z.infer<typeof tariffSchema>;

interface TariffModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ProcedureTariff | null;
}

export function TariffModal({ isOpen, onClose, initialData }: TariffModalProps) {
  const { addTariffItem, updateTariffItem } = useMedicalStore();
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TariffFormData>({
    resolver: zodResolver(tariffSchema),
    defaultValues: {
      code: "",
      name: "",
      category: "Procedimiento",
      description: "",
      price: 150,
      active: true,
    },
  });

  // Cargar datos al abrir modal para editar o resetear para nuevo
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          code: initialData.code,
          name: initialData.name,
          category: initialData.category,
          description: initialData.description || "",
          price: initialData.price,
          active: initialData.active,
        });
      } else {
        reset({
          code: "",
          name: "",
          category: "Procedimiento",
          description: "",
          price: 150,
          active: true,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  // Manejador tecla ESC
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

  const onSubmit = async (data: TariffFormData) => {
    try {
      if (isEditing && initialData) {
        updateTariffItem(initialData.id, {
          code: data.code.trim().toUpperCase(),
          name: data.name.trim(),
          category: data.category,
          description: data.description.trim(),
          price: data.price,
          active: data.active,
        });

        await Swal.fire({
          icon: "success",
          title: "Tarifa Actualizada",
          text: `El procedimiento "${data.name}" se actualizó correctamente en el tarifario.`,
          confirmButtonColor: "#0A4D68",
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        addTariffItem({
          code: data.code.trim().toUpperCase(),
          name: data.name.trim(),
          category: data.category,
          description: data.description.trim(),
          price: data.price,
          active: data.active,
        });

        await Swal.fire({
          icon: "success",
          title: "Procedimiento Registrado",
          text: `"${data.name}" se agregó exitosamente al tarifario oficial.`,
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
        text: "Ocurrió un inconveniente al procesar los datos de la tarifa.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden cursor-default transition-all transform scale-100"
      >
        {/* Cabecera del Modal */}
        <div className="p-5 border-b border-border bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-heading text-base">
                {isEditing ? "Editar Tarifa Médica" : "Nuevo Procedimiento / Examen"}
              </h3>
              <p className="text-xs text-muted">
                {isEditing
                  ? `Modificando examen código ${initialData?.code}`
                  : "Ingrese los datos del nuevo procedimiento o paquete ginecológico"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Código */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Código <span className="text-status-alert">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. GIN-002, COL-002"
                {...register("code")}
                className={`w-full px-3 py-2 rounded-xl border bg-surface text-xs font-mono font-bold text-heading placeholder:text-muted focus:outline-none focus:ring-2 ${
                  errors.code
                    ? "border-status-alert focus:ring-status-alert/20"
                    : "border-border focus:ring-primary/20"
                }`}
              />
              {errors.code && (
                <p className="text-[11px] text-status-alert flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.code.message}</span>
                </p>
              )}
            </div>

            {/* Categoría */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Categoría <span className="text-status-alert">*</span>
              </label>
              <select
                {...register("category")}
                className={`w-full px-3 py-2 rounded-xl border bg-surface text-xs font-medium text-heading focus:outline-none focus:ring-2 ${
                  errors.category
                    ? "border-status-alert focus:ring-status-alert/20"
                    : "border-border focus:ring-primary/20"
                }`}
              >
                <option value="Consulta">Consulta</option>
                <option value="Procedimiento">Procedimiento</option>
                <option value="Ecografía">Ecografía</option>
                <option value="Laboratorio">Laboratorio</option>
                <option value="Paquete">Paquete</option>
              </select>
              {errors.category && (
                <p className="text-[11px] text-status-alert flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.category.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Nombre del Procedimiento */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-heading uppercase tracking-wider block">
              Nombre Oficial del Procedimiento <span className="text-status-alert">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Biopsia Endometrial con Cánula Cornier"
              {...register("name")}
              className={`w-full px-3 py-2 rounded-xl border bg-surface text-xs font-medium text-heading placeholder:text-muted focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-status-alert focus:ring-status-alert/20"
                  : "border-border focus:ring-primary/20"
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-status-alert flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          {/* Precio y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Precio */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Precio Oficial (S/) <span className="text-status-alert">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted font-mono">
                  S/
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("price")}
                  className={`w-full pl-8 pr-3 py-2 rounded-xl border bg-surface text-xs font-mono font-bold text-heading tabular-nums placeholder:text-muted focus:outline-none focus:ring-2 ${
                    errors.price
                      ? "border-status-alert focus:ring-status-alert/20"
                      : "border-border focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.price && (
                <p className="text-[11px] text-status-alert flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.price.message}</span>
                </p>
              )}
            </div>

            {/* Activo / Inactivo */}
            <div className="space-y-1 flex flex-col justify-end">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Disponibilidad
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-slate-50/50 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  {...register("active")}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary"
                />
                <span className="text-xs font-semibold text-heading">
                  Activo para consultas y reportes
                </span>
              </label>
            </div>
          </div>

          {/* Descripción Clínica */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-heading uppercase tracking-wider block">
              Descripción Clínica y Alcance
            </label>
            <textarea
              rows={2}
              placeholder="Detalles sobre insumos incluidos, anestesia local o frasco de patología..."
              {...register("description")}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
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
              <span>{isEditing ? "Guardar Cambios" : "Crear Tarifa"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

