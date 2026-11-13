"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Swal from "sweetalert2";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Search,
  Sparkles,
  MapPin,
  Phone,
  UserCheck,
  Building2,
  KeyRound,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useMedicalStore } from "@/store/useMedicalStore";
import { DoctorProfile } from "@/types/medical";

// Esquema de validación estricto
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico institucional es requerido")
    .email("Ingrese un formato de correo electrónico válido"),
  password: z
    .string()
    .min(4, "La contraseña debe tener al menos 4 caracteres"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { doctorsList, loginWithCredentials, isAuthenticated } = useMedicalStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("doc-patrick-jacinto");

  // Si ya tiene sesión activa, redirigir al Dashboard
  useEffect(() => {
    if (useMedicalStore.persist.hasHydrated() && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "cendoperu@gmail.com",
      password: "pjacinto@cendo",
      rememberMe: true,
    },
  });

  const currentEmail = watch("email");

  // Selección rápida de credenciales para demostración / prueba médica
  const handleSelectDoctorPreset = (doctor: DoctorProfile) => {
    setSelectedDoctorId(doctor.id);
    setValue("email", doctor.email, { shouldValidate: true });
    setValue("password", doctor.password || "pjacinto@cendo", { shouldValidate: true });
  };

  // Manejo de Inicio de Sesión
  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const result = loginWithCredentials(data.email, data.password);

      if (!result.success || !result.doctor) {
        await Swal.fire({
          icon: "error",
          title: "Acceso Denegado",
          text: result.error || "Credenciales incorrectas o usuario no registrado.",
          confirmButtonColor: "#0A4D68",
          confirmButtonText: "Reintentar",
        });
        return;
      }

      const doc = result.doctor;
      const roleText = doc.role === "director" ? "Director Médico" : "Médico Especialista";

      await Swal.fire({
        icon: "success",
        title: `¡Bienvenido(a), ${doc.doctorTitle} ${doc.fullName}!`,
        html: `
          <div class="text-left text-sm space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2">
            <p><strong>Cargo:</strong> <span class="text-emerald-700 font-bold">${roleText}</span></p>
            <p><strong>Especialidad:</strong> ${doc.specialty}</p>
            <p><strong>Credenciales SUSALUD:</strong> <span class="font-mono font-bold text-slate-800">CMP ${doc.cmp} &bull; RNE ${doc.rne}</span></p>
            <p><strong>Sede Asistencial:</strong> Miraflores &bull; Of. 405</p>
            <p class="text-xs text-slate-500 pt-2 border-t border-slate-200">
              Iniciando sesión segura con firma y sello médico dinámico...
            </p>
          </div>
        `,
        confirmButtonText: "Ingresar al Panel Clínico",
        confirmButtonColor: "#0A4D68",
        timer: 2200,
        timerProgressBar: true,
      });

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error de Sistema",
        text: "Ocurrió un error inesperado al procesar la autenticación.",
        confirmButtonColor: "#0A4D68",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* Columna Izquierda: Identidad Institucional CENDO */}
      <section className="lg:w-1/2 bg-gradient-to-br from-[#062c3d] via-[#0A4D68] to-[#085370] text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Luces volumétricas sutiles de fondo */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-cyan-400/10 pointer-events-none blur-3xl" />
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-secondary/15 pointer-events-none blur-2xl" />

        {/* Cabecera de Marca Oficial */}
        <div className="relative z-10">
          <BrandLogo size="lg" variant="dark" />
          <div className="mt-8 space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-secondary border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              Portal Médico Institucional &bull; Versión 2.0
            </div>
            <h1 className="text-3xl lg:text-4xl font-heading font-extrabold text-white tracking-tight leading-tight">
              Centro Especializado en Endometriosis y Salud Femenina
            </h1>
            <p className="text-slate-200 text-sm lg:text-base leading-relaxed max-w-xl">
              Plataforma asistencial de alta precisión para gestión de pacientes, colposcopía IFCPC,
              control prenatal y emisión de informes médicos certificados.
            </p>
          </div>
        </div>

        {/* Credenciales de la Sede y Dirección Médica */}
        <div className="my-8 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3 relative z-10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
              <Building2 className="w-4 h-4" />
              Sede Central de Atención
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              Consultorios Activos
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <p className="font-heading font-bold text-white text-base">
                Dr. Patrick José Jacinto Gomero
              </p>
              <p className="text-xs text-slate-200 font-mono">
                Director Médico &bull; CMP 61693 &bull; RNE 38657
              </p>
            </div>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>Av. Benavides 2975, Of. 405, Miraflores</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>Citas: 985 945 697</span>
            </div>
          </div>
        </div>

        {/* Módulos Asistenciales Destacados */}
        <div className="space-y-3 relative z-10">
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            Capacidades del Sistema Clínico
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/20 border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Colposcopía IFCPC y Mapeo Cervical</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/20 border border-white/5">
              <FileText className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Carnet Prenatal MINSA y Recetario</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/20 border border-white/5">
              <UserCheck className="w-4 h-4 text-secondary shrink-0" />
              <span>Multi-Médico con Firma y CMP Dinámico</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/20 border border-white/5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Informes PDF Inamovibles en 1 Clic</span>
            </div>
          </div>
        </div>

        {/* Footer Institucional */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300 relative z-10">
          <span>&copy; {new Date().getFullYear()} CENDO &bull; Centro de Endometriosis</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Acceso Cifrado TLS 1.3 &bull; SUSALUD
          </span>
        </div>
      </section>

      {/* Columna Derecha: Tarjeta de Acceso Profesional */}
      <section className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-lg space-y-6">
          {/* Cabecera del Formulario */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-soft text-primary font-semibold text-xs border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Portal Asistencial Autorizado
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-heading">
              Acceso a Profesionales de la Salud
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Ingrese con sus credenciales médicas para acceder a las historias clínicas,
              emisión de recetas y firma de informes diagnósticos.
            </p>
          </div>

          {/* Formulario de Inicio de Sesión */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo: Correo Institucional */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-heading uppercase tracking-wider"
              >
                Correo Electrónico Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="ej. pjacinto@cendo.pe"
                  {...register("email")}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm text-heading placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.email
                      ? "border-status-urgent focus:border-status-urgent"
                      : "border-border hover:border-slate-300 focus:border-primary"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-status-urgent mt-1 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo: Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-heading uppercase tracking-wider"
                >
                  Contraseña de Acceso
                </label>
                <button
                  type="button"
                  onClick={() => {
                    Swal.fire({
                      icon: "info",
                      title: "Recuperación de Contraseña",
                      text: "Para restablecer o cambiar su contraseña médica, comuníquese con el Director Médico (Dr. Patrick Jacinto) desde el módulo de Gestión de Usuarios.",
                      confirmButtonColor: "#0A4D68",
                    });
                  }}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  ¿Olvidó su clave?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl border bg-white text-sm text-heading placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.password
                      ? "border-status-urgent focus:border-status-urgent"
                      : "border-border hover:border-slate-300 focus:border-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-heading"
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-status-urgent mt-1 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 shrink-0" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Checkbox Recordar */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/30 border-border"
                />
                <span className="text-xs text-muted">
                  Recordar mi sesión en este equipo de consulta
                </span>
              </label>
            </div>

            {/* Botón de Ingreso Principal */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-[#07394E] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 transform active:scale-[0.99] mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verificando Credenciales...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-secondary" />
                  <span>Ingresar al Sistema Asistencial CENDO</span>
                  <ArrowRight className="w-4 h-4 text-white/80" />
                </>
              )}
            </button>
          </form>

          {/* Selector Profesional de Cuentas Médicas Registradas (Para Demo 2.0 y Selección Rápida) */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-primary" />
                Profesionales Médicos Registrados
              </span>
              <span className="text-[11px] text-muted font-medium">
                Clic para cargar perfil
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {doctorsList.map((doc) => {
                const isSelected =
                  currentEmail?.toLowerCase() === doc.email.toLowerCase() ||
                  selectedDoctorId === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleSelectDoctorPreset(doc)}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-150 flex items-start gap-2.5 group cursor-pointer ${
                      isSelected
                        ? "bg-accent-soft/60 border-primary shadow-xs"
                        : "bg-white border-slate-200 hover:border-primary/40 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-primary group-hover:bg-primary/10"
                      }`}
                    >
                      {doc.fullName
                        .split(" ")
                        .filter(Boolean)
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-heading font-bold text-heading truncate">
                          {doc.doctorTitle} {doc.fullName.split(" ").slice(0, 2).join(" ")}
                        </p>
                        {doc.role === "director" ? (
                          <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded shrink-0">
                            Director
                          </span>
                        ) : (
                          <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded shrink-0">
                            Especialista
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted font-mono truncate">
                        CMP {doc.cmp} &bull; RNE {doc.rne}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-muted text-center leading-snug pt-1">
              ¿Desea dar de alta un nuevo médico o cambiar credenciales? Ingrese como{" "}
              <strong>Director Médico</strong> y acceda al módulo de <strong>Equipo Médico</strong>.
            </p>
          </div>

          {/* Sello Normativo al pie de tarjeta */}
          <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200/80 flex items-center gap-2.5 text-[11px] text-slate-600">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Cumplimiento estricto de la <strong>Ley N° 29733</strong> (Protección de Datos
              Personales en Salud en el Perú) y normativa <strong>SUSALUD</strong>.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}