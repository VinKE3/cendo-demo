"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Swal from "sweetalert2";
import {
  X,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Check,
  AlertCircle,
  Briefcase,
  Heart,
  Fingerprint,
} from "lucide-react";
import { Patient } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import { calculateAge } from "@/lib/utils";

const patientSchema = z.object({
  dni: z
    .string()
    .min(8, "El DNI o documento debe tener al menos 8 caracteres")
    .max(12, "El documento no debe exceder 12 caracteres")
    .regex(/^[0-9A-Za-z]+$/, "El documento solo debe contener letras o números"),
  firstName: z
    .string()
    .min(2, "Los nombres de la paciente son requeridos")
    .transform((val) => val.trim().toUpperCase()),
  lastName: z
    .string()
    .min(2, "Los apellidos de la paciente son requeridos")
    .transform((val) => val.trim().toUpperCase()),
  birthDate: z
    .string()
    .min(10, "Seleccione una fecha de nacimiento válida")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido (YYYY-MM-DD)"),
  phone: z.string().min(6, "Ingrese un teléfono de contacto válido (mínimo 6 dígitos)"),
  email: z
    .string()
    .email("Ingrese un correo electrónico válido")
    .or(z.literal("")),
  address: z.string().default(""),
  civilStatus: z.string().default("Soltera"),
  occupation: z.string().default(""),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Patient | null;
  onSuccess?: (patient: Patient) => void;
}

export function PatientModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: PatientModalProps) {
  const { addPatient, updatePatient, getPatientByDni } = useMedicalStore();
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      dni: "",
      firstName: "",
      lastName: "",
      birthDate: "1998-01-01",
      phone: "",
      email: "",
      address: "",
      civilStatus: "Soltera",
      occupation: "",
    },
  });

  // Escuchar fecha de nacimiento para cálculo reactivo de edad
  const birthDateValue = watch("birthDate");
  const computedAge = useMemo(() => {
    return calculateAge(birthDateValue);
  }, [birthDateValue]);

  // Cargar datos para edición o resetear para nueva paciente
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          dni: initialData.dni,
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          birthDate: initialData.birthDate,
          phone: initialData.phone || "",
          email: initialData.email || "",
          address: initialData.address || "",
          civilStatus: initialData.civilStatus || "Soltera",
          occupation: initialData.occupation || "",
        });
      } else {
        reset({
          dni: "",
          firstName: "",
          lastName: "",
          birthDate: "1998-01-01",
          phone: "",
          email: "",
          address: "",
          civilStatus: "Soltera",
          occupation: "",
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

  const onSubmit = async (data: PatientFormData) => {
    const cleanDni = data.dni.trim();

    // 1. Validar bloqueo de DNI duplicado
    const existingPatient = getPatientByDni(cleanDni);
    if (existingPatient && (!isEditing || existingPatient.id !== initialData?.id)) {
      await Swal.fire({
        icon: "warning",
        title: "DNI Ya Registrado",
        html: `
          <div class="text-left text-xs space-y-1">
            <p>El documento <strong>${cleanDni}</strong> ya pertenece a:</p>
            <p class="font-bold text-sm text-[#0A4D68] mt-1">${existingPatient.lastName}, ${existingPatient.firstName}</p>
            <p class="text-slate-500">Edad: ${existingPatient.age} años &bull; Tel: ${existingPatient.phone}</p>
            <p class="text-[11px] text-red-600 font-semibold mt-2">Por seguridad clínica, no se permiten duplicados en el directorio de CENDO.</p>
          </div>
        `,
        confirmButtonColor: "#0A4D68",
        confirmButtonText: "Entendido",
      });
      return;
    }

    try {
      const calculatedAge = computedAge;

      if (isEditing && initialData) {
        updatePatient(initialData.id, {
          dni: cleanDni,
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthDate,
          age: calculatedAge,
          phone: data.phone.trim(),
          email: data.email.trim(),
          address: data.address.trim(),
          civilStatus: data.civilStatus,
          occupation: data.occupation.trim(),
        });

        const updated: Patient = {
          ...initialData,
          dni: cleanDni,
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthDate,
          age: calculatedAge,
          phone: data.phone.trim(),
          email: data.email.trim(),
          address: data.address.trim(),
          civilStatus: data.civilStatus,
          occupation: data.occupation.trim(),
          updatedAt: new Date().toISOString(),
        };

        await Swal.fire({
          icon: "success",
          title: "Datos Actualizados",
          text: `La ficha de ${data.lastName}, ${data.firstName} ha sido actualizada.`,
          confirmButtonColor: "#0A4D68",
          timer: 1600,
          showConfirmButton: false,
        });

        onSuccess?.(updated);
      } else {
        const newPatient = addPatient({
          dni: cleanDni,
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthDate,
          age: calculatedAge,
          phone: data.phone.trim(),
          email: data.email.trim(),
          address: data.address.trim(),
          civilStatus: data.civilStatus,
          occupation: data.occupation.trim(),
        });

        await Swal.fire({
          icon: "success",
          title: "Paciente Registrada",
          text: `${data.lastName}, ${data.firstName} ha sido ingresada al directorio clínico CENDO.`,
          confirmButtonColor: "#0A4D68",
          timer: 1600,
          showConfirmButton: false,
        });

        onSuccess?.(newPatient);
      }

      onClose();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text: "Ocurrió un inconveniente al guardar los datos de filiación.",
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
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-heading text-base">
                {isEditing ? "Editar Datos de Filiación" : "Registrar Nueva Paciente"}
              </h3>
              <p className="text-xs text-muted">
                {isEditing
                  ? `Modificando paciente DNI ${initialData?.dni}`
                  : "Ingrese los datos de identidad y contacto para abrir historia clínica"}
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
          {/* Fila 1: DNI y Fecha Nacimiento con Cálculo de Edad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* DNI */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                DNI / Documento <span className="text-status-alert">*</span>
              </label>
              <div className="relative">
                <Fingerprint className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  maxLength={12}
                  placeholder="Ej. 72961954"
                  {...register("dni")}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-surface text-xs font-mono font-bold text-heading placeholder:text-muted focus:outline-none focus:ring-2 ${
                    errors.dni
                      ? "border-status-alert focus:ring-status-alert/20"
                      : "border-border focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.dni && (
                <p className="text-[11px] text-status-alert flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.dni.message}</span>
                </p>
              )}
            </div>

            {/* Fecha de Nacimiento */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Fecha Nacimiento <span className="text-status-alert">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  {...register("birthDate")}
                  className={`w-full px-3 py-2 rounded-xl border bg-surface text-xs font-mono text-heading focus:outline-none focus:ring-2 ${
                    errors.birthDate
                      ? "border-status-alert focus:ring-status-alert/20"
                      : "border-border focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.birthDate && (
                <p className="text-[11px] text-status-alert flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.birthDate.message}</span>
                </p>
              )}
            </div>

            {/* Cálculo Automático de Edad */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Edad Calculada
              </label>
              <div className="px-3 py-2 rounded-xl border border-sky-200 bg-sky-50 flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-900">
                  {computedAge > 0 ? `${computedAge} años` : "Calculando..."}
                </span>
                <span className="text-[10px] text-sky-700 font-mono uppercase bg-white/60 px-1.5 py-0.5 rounded">
                  Automático
                </span>
              </div>
            </div>
          </div>

          {/* Fila 2: Apellidos y Nombres */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Apellidos Completos <span className="text-status-alert">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. HERRERA ROJAS"
                {...register("lastName")}
                className={`w-full px-3 py-2 rounded-xl border bg-surface text-xs font-bold text-heading placeholder:text-muted focus:outline-none focus:ring-2 ${
                  errors.lastName
                    ? "border-status-alert focus:ring-status-alert/20"
                    : "border-border focus:ring-primary/20"
                }`}
              />
              {errors.lastName && (
                <p className="text-[11px] text-status-alert flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.lastName.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Nombres Completos <span className="text-status-alert">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. MARÍA STEPHANY"
                {...register("firstName")}
                className={`w-full px-3 py-2 rounded-xl border bg-surface text-xs font-bold text-heading placeholder:text-muted focus:outline-none focus:ring-2 ${
                  errors.firstName
                    ? "border-status-alert focus:ring-status-alert/20"
                    : "border-border focus:ring-primary/20"
                }`}
              />
              {errors.firstName && (
                <p className="text-[11px] text-status-alert flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.firstName.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Fila 3: Teléfono y Correo Electrónico */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Teléfono / WhatsApp <span className="text-status-alert">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="tel"
                  placeholder="Ej. 992 481 029"
                  {...register("phone")}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-surface text-xs font-mono font-bold text-heading placeholder:text-muted focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? "border-status-alert focus:ring-status-alert/20"
                      : "border-border focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-status-alert flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.phone.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  placeholder="ejemplo@email.com"
                  {...register("email")}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-surface text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-status-alert focus:ring-status-alert/20"
                      : "border-border focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-status-alert flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Fila 4: Estado Civil y Ocupación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Estado Civil
              </label>
              <select
                {...register("civilStatus")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Soltera">Soltera</option>
                <option value="Casada">Casada</option>
                <option value="Conviviente">Conviviente</option>
                <option value="Divorciada">Divorciada</option>
                <option value="Viuda">Viuda</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                Ocupación / Profesión
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Ej. Licenciada en Administración"
                  {...register("occupation")}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Fila 5: Dirección */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-heading uppercase tracking-wider block">
              Dirección de Domicilio / Distrito
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Ej. Calle Los Pinos 142, Dpto 502, Miraflores"
                {...register("address")}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              <span>{isEditing ? "Guardar Cambios" : "Registrar Paciente"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

