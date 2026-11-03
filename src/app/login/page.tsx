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
} from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useMedicalStore } from "@/store/useMedicalStore";

// Esquema de validación con Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Ingrese un correo electrónico válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { loginDemo, loginCustom, doctorProfile, isAuthenticated } = useMedicalStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "cendoperu@gmail.com",
      password: "demo-password-123",
    },
  });

  // Manejo de Acceso Demo en 1 Clic
  const handleDemoAccess = () => {
    loginDemo();
    Swal.fire({
      icon: "success",
      title: "¡Bienvenido, Dr. Patrick!",
      html: `
        <div class="text-left text-sm space-y-1">
          <p><strong>Médico:</strong> ${doctorProfile.fullName}</p>
          <p><strong>CMP:</strong> ${doctorProfile.cmp} | <strong>RNE:</strong> ${doctorProfile.rne}</p>
          <p><strong>Sede:</strong> Miraflores, Lima</p>
          <p class="text-xs text-slate-500 mt-2">Cargando módulos de colposcopía, vademécum y tarifario...</p>
        </div>
      `,
      confirmButtonText: "Ir al Dashboard",
      confirmButtonColor: "#0A4D68",
      timer: 2000,
      timerProgressBar: true,
    }).then(() => {
      router.push("/dashboard");
    });
  };

  // Manejo de Formulario Estándar
  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      // Simulación de autenticación clínica
      loginCustom(data.email);
      await Swal.fire({
        icon: "success",
        title: "Sesión Iniciada",
        text: `Acceso concedido para ${data.email}`,
        confirmButtonColor: "#0A4D68",
        timer: 1500,
        showConfirmButton: false,
      });
      router.push("/dashboard");
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error de Autenticación",
        text: "Verifique sus credenciales institucionales o use el botón de Acceso Demo.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-main">
      {/* Columna Izquierda: Identidad Institucional CENDO */}
      <section className="lg:w-1/2 bg-gradient-to-br from-[#07364a] via-[#0A4D68] to-[#0d5977] text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Adorno visual sutil de fondo */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none blur-3xl" />
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-secondary/10 pointer-events-none blur-2xl" />

        {/* Cabecera de Marca */}
        <div className="relative z-10">
          <BrandLogo size="lg" variant="dark" />
          <div className="mt-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-secondary">
              <Sparkles className="w-3.5 h-3.5" />
              Sistema Clínico Especializado
            </div>
            <h1 className="text-3xl lg:text-4xl font-heading font-extrabold text-white tracking-tight leading-tight">
              Gestión Integral Ginecológica y Colposcopía Avanzada
            </h1>
            <p className="text-slate-200 text-sm lg:text-base leading-relaxed">
              Plataforma asistencial de alta precisión para el diagnóstico, seguimiento
              y tratamiento de patologías del tracto genital inferior y endometriosis.
            </p>
          </div>
        </div>

        {/* Credenciales del Especialista */}
        <div className="my-8 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <p className="font-heading font-bold text-white text-base">
                Dr. Patrick José Jacinto Gomero
              </p>
              <p className="text-xs text-slate-200 font-mono">
                CMP 61693 &bull; RNE 38657 &bull; Ginecología y Obstetricia
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>Av. Benavides 2975, Of. 405, Miraflores</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>Tel: 985 945 697</span>
            </div>
          </div>
        </div>

        {/* Resumen de Módulos Clínicos */}
        <div className="space-y-3 relative z-10">
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            Módulos del Sistema Clínico
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/15">
              <CheckCircle2 className="w-4 h-4 text-status-normal shrink-0" />
              <span>Colposcopía IFCPC y Reloj Cervical</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/15">
              <Search className="w-4 h-4 text-secondary shrink-0" />
              <span>Buscador Rápido Ctrl + K en vivo</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/15">
              <FileText className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Informes PDF Inamovibles & Excel</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/15">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tarifario & Vademécum en Soles (S/)</span>
            </div>
          </div>
        </div>

        {/* Footer Institucional */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300 relative z-10">
          <span>&copy; {new Date().getFullYear()} CENDO &bull; Dr. Patrick Jacinto</span>
          <span className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-status-normal" />
            Acceso Médico Seguro TLS 1.3
          </span>
        </div>
      </section>

      {/* Columna Derecha: Tarjeta de Acceso */}
      <section className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Cabecera del Formulario */}
          <div className="space-y-2">
            <div className="inline-block px-2.5 py-0.5 rounded-md bg-accent-soft text-primary font-semibold text-xs border border-primary/20">
              Acceso a Consulta Médica
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-heading">
              Iniciar Sesión
            </h2>
            <p className="text-muted text-sm">
              Ingrese con sus credenciales médicas autorizadas o utilice el acceso demostrativo.
            </p>
          </div>

          {/* Botón Destacado: ACCESO DEMO DR. PATRICK */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-secondary/40 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-secondary fill-secondary" />
                Acceso Rápido para Demostración
              </span>
              <span className="text-[10px] bg-secondary text-white font-bold px-2 py-0.5 rounded-full">
                1 Clic
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-snug">
              Inicia sesión automáticamente con el perfil del <strong>Dr. Patrick Jacinto</strong> y
              los datos reales precargados (paciente María Stephany Herrera, vademécum y tarifario).
            </p>
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-secondary to-amber-600 hover:from-secondary-hover hover:to-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-white" />
              ⚡ Ingresar con Cuenta Demo (Dr. Patrick Jacinto)
            </button>
          </div>

          {/* Separador */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-main px-3 text-xs text-muted font-medium uppercase">
              o con credenciales
            </span>
          </div>

          {/* Formulario Estándar */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo: Correo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-heading">
                Correo Electrónico Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="ejemplo@cendoperu.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-surface text-sm text-heading placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                    errors.email ? "border-status-alert" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-status-alert font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Campo: Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-heading">
                  Contraseña Clínica
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setValue("email", "cendoperu@gmail.com");
                    setValue("password", "demo-password-123");
                  }}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Autocompletar
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-surface text-sm text-heading placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                    errors.password ? "border-status-alert" : "border-slate-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-heading"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-status-alert font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <Stethoscope className="w-4 h-4" />
              {isSubmitting ? "Autenticando..." : "Ingresar al Sistema Clínico"}
            </button>
          </form>

          {/* Soporte */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-xs text-muted">
              Sede Miraflores: Av. Alfredo Benavides 2975, Of. 405.
              <br />
              Soporte de sistemas CENDO:{" "}
              <a href="mailto:cendoperu@gmail.com" className="text-primary font-medium hover:underline">
                cendoperu@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

