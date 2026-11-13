"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Swal from "sweetalert2";
import {
  X,
  Stethoscope,
  Shield,
  Mail,
  Lock,
  Phone,
  Building2,
  FileCheck,
  CheckCircle,
  Eye,
  EyeOff,
  Stamp,
  User,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { DoctorProfile, DoctorRole } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";

const doctorSchema = z.object({
  fullName: z.string().min(3, "El nombre completo es requerido"),
  doctorTitle: z.enum(["Dr.", "Dra.", "Lic."]),
  specialty: z.string().min(3, "La especialidad médica es requerida"),
  cmp: z
    .string()
    .min(4, "El CMP debe tener al menos 4 dígitos")
    .regex(/^\d+$/, "El CMP debe contener solo números"),
  rne: z
    .string()
    .min(4, "El RNE debe tener al menos 4 dígitos")
    .regex(/^\d+$/, "El RNE debe contener solo números"),
  role: z.enum(["director", "doctor", "assistant"]),
  email: z.string().email("Ingrese un correo electrónico válido"),
  password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
  phone: z.string().min(6, "El teléfono de contacto es requerido"),
  clinicAddress: z.string().min(5, "La dirección de atención es requerida"),
  isActive: z.boolean(),
  signatureUrl: z.string().optional(),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorToEdit?: DoctorProfile | null;
}

const COMMON_SPECIALTIES = [
  "Ginecología y Obstetricia - Endometriosis y Colposcopía",
  "Ginecología Oncológica y Patología Cervical",
  "Cirugía Ginecológica Mínimamente Invasiva y Fertilidad",
  "Ecografía Doppler Ginecológica y Obstétrica",
  "Medicina Materno Fetal y Alto Riesgo Obstétrico",
  "Urología Ginecológica y Piso Pélvico",
  "Endocrinología Ginecológica y Reproducción Asistida",
];

export function DoctorModal({ isOpen, onClose, doctorToEdit }: DoctorModalProps) {
  const { addDoctor, updateDoctor } = useMedicalStore();
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = Boolean(doctorToEdit);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      fullName: "",
      doctorTitle: "Dr.",
      specialty: COMMON_SPECIALTIES[0],
      cmp: "",
      rne: "",
      role: "doctor",
      email: "",
      password: "cendo" + Math.floor(100 + Math.random() * 900),
      phone: "985 945 697",
      clinicAddress: "Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima",
      isActive: true,
      signatureUrl: "",
    },
  });

  const watchedFullName = watch("fullName");
  const watchedDoctorTitle = watch("doctorTitle");
  const watchedCmp = watch("cmp");
  const watchedRne = watch("rne");
  const watchedSpecialty = watch("specialty");

  useEffect(() => {
    if (doctorToEdit) {
      reset({
        fullName: doctorToEdit.fullName,
        doctorTitle: (doctorToEdit.doctorTitle as "Dr." | "Dra." | "Lic.") || "Dr.",
        specialty: doctorToEdit.specialty,
        cmp: doctorToEdit.cmp,
        rne: doctorToEdit.rne,
        role: doctorToEdit.role,
        email: doctorToEdit.email,
        password: doctorToEdit.password || "pjacinto@cendo",
        phone: doctorToEdit.phone,
        clinicAddress: doctorToEdit.clinicAddress || "Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima",
        isActive: doctorToEdit.isActive ?? true,
        signatureUrl: doctorToEdit.signatureUrl || "",
      });
    } else {
      reset({
        fullName: "",
        doctorTitle: "Dr.",
        specialty: COMMON_SPECIALTIES[0],
        cmp: "",
        rne: "",
        role: "doctor",
        email: "",
        password: "cendo" + Math.floor(100 + Math.random() * 900),
        phone: "985 945 697",
        clinicAddress: "Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima",
        isActive: true,
        signatureUrl: "",
      });
    }
  }, [doctorToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: DoctorFormData) => {
    try {
      if (isEditing && doctorToEdit) {
        updateDoctor(doctorToEdit.id, {
          fullName: data.fullName.trim(),
          doctorTitle: data.doctorTitle,
          specialty: data.specialty.trim(),
          cmp: data.cmp.trim(),
          rne: data.rne.trim(),
          role: data.role as DoctorRole,
          email: data.email.trim().toLowerCase(),
          password: data.password,
          phone: data.phone.trim(),
          clinicAddress: data.clinicAddress.trim(),
          isActive: data.isActive,
          signatureUrl: data.signatureUrl || "",
        });

        await Swal.fire({
          icon: "success",
          title: "Datos Actualizados",
          text: `La información de ${data.doctorTitle} ${data.fullName} ha sido guardada exitosamente.`,
          confirmButtonColor: "#0A4D68",
          timer: 1800,
        });
      } else {
        addDoctor({
          fullName: data.fullName.trim(),
          doctorTitle: data.doctorTitle,
          specialty: data.specialty.trim(),
          cmp: data.cmp.trim(),
          rne: data.rne.trim(),
          role: data.role as DoctorRole,
          email: data.email.trim().toLowerCase(),
          password: data.password,
          phone: data.phone.trim(),
          contactEmail: data.email.trim().toLowerCase(),
          clinicName: "CENDO - Centro de Endometriosis",
          clinicAddress: data.clinicAddress.trim(),
          isActive: data.isActive,
          signatureUrl: data.signatureUrl || "",
          avatarUrl:
            data.doctorTitle === "Dra."
              ? "https://images.unsplash.com/photo-1594824813583-0599c9c8e1a1?q=80&w=300&auto=format&fit=crop"
              : "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&auto=format&fit=crop",
        });

        const welcomeText = `🏥 CENDO - Centro de Endometriosis\nEstimado(a) ${data.doctorTitle} ${data.fullName},\n\nSe ha habilitado su cuenta en el Portal Médico Asistencial de CENDO:\n🔗 Enlace: https://app.cendo.pe/login\n📧 Correo: ${data.email}\n🔑 Contraseña de acceso: ${data.password}\n\nSus informes de colposcopía y recetas médicas se emitirán formalmente con su CMP ${data.cmp} y RNE ${data.rne}.\n\nCualquier consulta sobre sus credenciales puede coordinarse con la Dirección Médica (Dr. Patrick Jacinto).`;

        await Swal.fire({
          icon: "success",
          title: "Médico Registrado Exitosamente",
          html: `
            <div class="text-left text-xs text-slate-700 space-y-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2">
              <p><strong>Médico:</strong> ${data.doctorTitle} ${data.fullName}</p>
              <p><strong>Credenciales SUSALUD:</strong> <span class="font-mono font-bold text-slate-900">CMP ${data.cmp} &bull; RNE ${data.rne}</span></p>
              <p><strong>Usuario / Correo:</strong> <code class="font-bold text-primary">${data.email}</code></p>
              <p><strong>Contraseña Asignada:</strong> <code class="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-300">${data.password}</code></p>
              <div class="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-[11px] leading-snug">
                El especialista ya puede iniciar sesión individualmente. Presione el botón verde para enviarle sus credenciales por WhatsApp.
              </div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: "📲 Enviar Credenciales por WhatsApp",
          cancelButtonText: "Listo, cerrar",
          confirmButtonColor: "#059669",
          cancelButtonColor: "#0A4D68",
        }).then((result) => {
          if (result.isConfirmed) {
            navigator.clipboard.writeText(welcomeText);
            const cleanPhone = data.phone.replace(/\D/g, "");
            if (cleanPhone.length >= 9) {
              const phoneWithCountry = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;
              window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(welcomeText)}`, "_blank");
            } else {
              Swal.fire({
                icon: "success",
                title: "Credenciales Copiadas",
                text: "El mensaje formal ha sido copiado al portapapeles. Péguelo en el chat de WhatsApp del doctor.",
                confirmButtonColor: "#0A4D68",
              });
            }
          }
        });
      }

      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: "No se pudo registrar el profesional médico.",
        confirmButtonColor: "#0A4D68",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="bg-gradient-to-r from-[#062c3d] to-[#0A4D68] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-secondary border border-white/10">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-extrabold text-white">
                {isEditing ? "Editar Profesional Médico" : "Registrar Nuevo Profesional Médico"}
              </h2>
              <p className="text-xs text-slate-300">
                Acreditación SUSALUD, Colegio Médico del Perú (CMP) y RNE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Fila 1: Título y Nombre Completo */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-1 space-y-1.5">
              <label className="block text-xs font-bold text-heading uppercase tracking-wider">
                Tratamiento
              </label>
              <select
                {...register("doctorTitle")}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Dr.">Dr.</option>
                <option value="Dra.">Dra.</option>
                <option value="Lic.">Lic.</option>
              </select>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold text-heading uppercase tracking-wider">
                Nombres y Apellidos Completos *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="ej. José Luis Carrasco Pérez"
                  {...register("fullName")}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-white text-sm text-heading placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-status-urgent">{errors.fullName.message}</p>
              )}
            </div>
          </div>

          {/* Fila 2: Especialidad y Rol */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8 space-y-1.5">
              <label className="block text-xs font-bold text-heading uppercase tracking-wider">
                Especialidad Médica *
              </label>
              <input
                type="text"
                list="specialty-suggestions"
                placeholder="ej. Ginecología Oncológica y Patología Cervical"
                {...register("specialty")}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-heading placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <datalist id="specialty-suggestions">
                {COMMON_SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec} />
                ))}
              </datalist>
              {errors.specialty && (
                <p className="text-xs text-status-urgent">{errors.specialty.message}</p>
              )}
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label className="block text-xs font-bold text-heading uppercase tracking-wider">
                Rol en CENDO
              </label>
              <select
                {...register("role")}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="doctor">Médico Especialista</option>
                <option value="director">Director Médico</option>
                <option value="assistant">Asistente / Obstetra</option>
              </select>
            </div>
          </div>

          {/* Fila 3: Credenciales Médicas (CMP y RNE) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <FileCheck className="w-4 h-4 text-primary" />
              Acreditación Profesional (Colegio Médico del Perú)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  N° de Colegiatura Médica (CMP) *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="ej. 61693"
                  {...register("cmp")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm font-mono font-bold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {errors.cmp && (
                  <p className="text-xs text-status-urgent">{errors.cmp.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Registro Nacional de Especialista (RNE) *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="ej. 38657"
                  {...register("rne")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm font-mono font-bold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {errors.rne && (
                  <p className="text-xs text-status-urgent">{errors.rne.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Fila 4: Correo de Acceso y Contraseña */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-heading uppercase tracking-wider">
                Correo Institucional (Login) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="ej. doctor@cendo.pe"
                  {...register("email")}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-white text-sm text-heading placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-status-urgent">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-heading uppercase tracking-wider">
                  Contraseña de Acceso *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const randomPass = "Cendo" + Math.floor(100 + Math.random() * 900) + "!*";
                    setValue("password", randomPass, { shouldValidate: true });
                    setShowPassword(true);
                  }}
                  className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-secondary" />
                  Generar clave segura
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-white text-sm text-heading placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted hover:text-heading"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-status-urgent">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Fila 5: Teléfono y Dirección Sede */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-heading uppercase tracking-wider">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="ej. 985 945 697"
                  {...register("phone")}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-white text-sm text-heading placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-heading uppercase tracking-wider">
                Sede / Consultorio
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-muted absolute left-3.5 top-3" />
                <input
                  type="text"
                  {...register("clinicAddress")}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-white text-sm text-heading placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Previsualización del Sello Médico Oficial Dinámico */}
          <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-accent-soft/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                <Stamp className="w-4 h-4 text-secondary" />
                Sello Médico Oficial para Informes PDF y Recetas
              </span>
              <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full">
                Generado Automáticamente
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-0.5 text-left">
                <p className="font-serif italic text-primary font-bold text-sm">
                  {watchedDoctorTitle} {watchedFullName || "Nombre del Profesional"}
                </p>
                <p className="font-heading font-extrabold text-[11px] text-slate-800 tracking-wide uppercase">
                  {watchedDoctorTitle.toUpperCase()} {(watchedFullName || "NOMBRES Y APELLIDOS").toUpperCase()}
                </p>
                <p className="text-[10px] text-slate-600 font-mono">
                  {watchedSpecialty || "Especialidad"} &bull; CMP {watchedCmp || "XXXXX"} &bull; RNE {watchedRne || "XXXXX"}
                </p>
                <p className="text-[9px] text-slate-400 font-sans">
                  CENDO &bull; Centro de Endometriosis &bull; Miraflores
                </p>
              </div>

              <div className="w-16 h-16 rounded-full border-2 border-primary/40 flex flex-col items-center justify-center text-primary text-[8px] font-bold text-center leading-tight p-1 shrink-0 bg-primary/5">
                <Stethoscope className="w-4 h-4 text-primary mb-0.5" />
                <span>CENDO</span>
                <span>MÉDICO</span>
              </div>
            </div>
          </div>

          {/* Toggle Activo */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register("isActive")}
                className="w-4 h-4 rounded text-primary focus:ring-primary/30 border-border"
              />
              <span className="text-xs font-semibold text-heading">
                Cuenta Médica Habilitada para Atención y Firma de Informes
              </span>
            </label>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-heading hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#07394E] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-secondary" />
              <span>{isEditing ? "Guardar Cambios" : "Registrar Especialista"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
