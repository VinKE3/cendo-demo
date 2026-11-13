"use client";

import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";
import {
  Users,
  UserPlus,
  Stethoscope,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Edit2,
  Trash2,
  CheckCircle2,
  Power,
  Sparkles,
  Search,
  KeyRound,
  FileBadge,
  Stamp,
  Award,
} from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";
import { DoctorProfile } from "@/types/medical";
import { DoctorModal } from "@/components/usuarios/DoctorModal";

export default function UsuariosPage() {
  const {
    doctorsList,
    doctorProfile,
    switchActiveDoctor,
    deleteDoctor,
    toggleDoctorActive,
  } = useMedicalStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<DoctorProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  // Filtro de Médicos
  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((doc) => {
      const matchesSearch =
        doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.cmp.includes(searchTerm) ||
        doc.rne.includes(searchTerm) ||
        doc.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        filterRole === "all" || doc.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [doctorsList, searchTerm, filterRole]);

  // Manejo de Cambio Rápido de Médico Activo
  const handleSwitchDoctor = (doc: DoctorProfile) => {
    if (doc.id === doctorProfile.id) return;

    if (!doc.isActive) {
      Swal.fire({
        icon: "warning",
        title: "Cuenta Inactiva",
        text: "Este perfil médico se encuentra inactivo. Habilítelo antes de iniciar sesión.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    switchActiveDoctor(doc.id);
    Swal.fire({
      icon: "success",
      title: "Sesión Cambiada",
      html: `
        <p>Ahora está operando como <strong>${doc.doctorTitle} ${doc.fullName}</strong>.</p>
        <p class="text-xs text-slate-500 mt-2">
          CMP ${doc.cmp} &bull; RNE ${doc.rne}<br/>
          Todos los nuevos informes y recetas generadas llevarán sus credenciales y firma.
        </p>
      `,
      confirmButtonColor: "#0A4D68",
      timer: 2000,
      timerProgressBar: true,
    });
  };

  // Manejo de Eliminación
  const handleDelete = (doc: DoctorProfile) => {
    if (doc.id === "doc-patrick-jacinto") {
      Swal.fire({
        icon: "warning",
        title: "Acción Restringida",
        text: "No es posible eliminar al Director Médico Principal de CENDO (Dr. Patrick Jacinto).",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    Swal.fire({
      title: `¿Eliminar a ${doc.doctorTitle} ${doc.fullName}?`,
      text: "Esta acción removerá el acceso médico y su perfil del sistema CENDO.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        const result = deleteDoctor(doc.id);
        if (result.success) {
          Swal.fire({
            icon: "success",
            title: "Médico Eliminado",
            text: "El profesional ha sido retirado del sistema.",
            confirmButtonColor: "#0A4D68",
            timer: 1500,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: result.error || "No se pudo eliminar al médico.",
            confirmButtonColor: "#0A4D68",
          });
        }
      }
    });
  };

  // Abrir modal para crear nuevo médico
  const handleOpenCreateModal = () => {
    setDoctorToEdit(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar médico
  const handleOpenEditModal = (doc: DoctorProfile) => {
    setDoctorToEdit(doc);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-heading font-extrabold text-heading">
              Equipo Médico y Gestión de Usuarios
            </h1>
          </div>
          <p className="text-sm text-muted mt-1">
            Administración de especialistas clínicos, credenciales SUSALUD (CMP y RNE) y firmas digitales.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-[#07394E] text-white text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-secondary" />
          <span>Registrar Nuevo Especialista</span>
        </button>
      </div>

      {/* Banner de Sesión Activa del Médico */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#062c3d] via-[#0A4D68] to-[#085370] text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary shrink-0 font-bold text-base">
            {doctorProfile.fullName
              .split(" ")
              .filter(Boolean)
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Sesión Activa Actual
              </span>
              <span className="text-[10px] font-mono text-slate-300">
                {doctorProfile.role === "director" ? "Director Médico" : "Médico Especialista"}
              </span>
            </div>
            <p className="text-base font-heading font-bold text-white mt-0.5">
              {doctorProfile.doctorTitle} {doctorProfile.fullName}
            </p>
            <p className="text-xs text-slate-200 font-mono">
              CMP {doctorProfile.cmp} &bull; RNE {doctorProfile.rne} &bull; {doctorProfile.specialty}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/20 px-3.5 py-2 rounded-xl border border-white/10 text-xs text-slate-200">
          <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
          <span>
            Los nuevos informes colposcópicos, chequeos y recetas se firman con este perfil.
          </span>
        </div>
      </div>

      {/* Tarjetas de Estadísticas del Staff */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase">Total Profesionales</span>
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-heading font-extrabold text-heading mt-2">
            {doctorsList.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Registrados en la plataforma CENDO</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase">Especialistas Activos</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-heading font-extrabold text-emerald-700 mt-2">
            {doctorsList.filter((d) => d.isActive).length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Habilitados para firma de informes</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase">Director de Clínica</span>
            <span className="p-2 rounded-xl bg-amber-50 text-secondary">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <p className="text-sm font-heading font-extrabold text-heading mt-2 truncate">
            Dr. Patrick Jacinto
          </p>
          <p className="text-xs text-slate-500 mt-1">CMP 61693 &bull; RNE 38657</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase">Sede Asistencial</span>
            <span className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-sm font-heading font-extrabold text-heading mt-2 truncate">
            Miraflores &bull; Lima
          </p>
          <p className="text-xs text-slate-500 mt-1">Av. Benavides 2975, Of. 405</p>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por médico, especialidad, CMP o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-slate-50 hover:bg-white focus:bg-white text-sm text-heading placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">Todos los Roles</option>
            <option value="director">Directores Médicos</option>
            <option value="doctor">Médicos Especialistas</option>
            <option value="assistant">Asistentes / Obstetras</option>
          </select>
        </div>
      </div>

      {/* Grid de Tarjetas de Médicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDoctors.map((doc) => {
          const isActiveDoctor = doc.id === doctorProfile.id;
          return (
            <div
              key={doc.id}
              className={`rounded-2xl border p-5 transition-all duration-200 bg-surface shadow-2xs flex flex-col justify-between ${
                isActiveDoctor
                  ? "border-primary ring-2 ring-primary/20 shadow-sm"
                  : "border-border hover:border-slate-300"
              }`}
            >
              <div>
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                        isActiveDoctor
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-primary border border-slate-200"
                      }`}
                    >
                      {doc.fullName
                        .split(" ")
                        .filter(Boolean)
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-extrabold text-heading text-base">
                          {doc.doctorTitle} {doc.fullName}
                        </h3>
                        {isActiveDoctor && (
                          <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full">
                            En Sesión
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-primary font-medium mt-0.5">
                        {doc.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {doc.role === "director" ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        Director
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Especialista
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        doc.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {doc.isActive ? "Habilitado" : "Inactivo"}
                    </span>
                  </div>
                </div>

                {/* Credenciales y Contacto */}
                <div className="mt-4 pt-3 border-t border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 space-y-0.5">
                    <span className="text-[10px] font-semibold uppercase text-muted block">
                      Credenciales SUSALUD:
                    </span>
                    <p className="font-mono font-bold text-slate-900">
                      CMP: {doc.cmp} &bull; RNE: {doc.rne}
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 space-y-0.5">
                    <span className="text-[10px] font-semibold uppercase text-muted block">
                      Correo Institucional:
                    </span>
                    <p className="text-slate-800 truncate" title={doc.email}>
                      {doc.email}
                    </p>
                  </div>
                </div>

                {/* Sello Médico Registrado */}
                <div className="mt-3 p-2.5 rounded-xl bg-accent-soft/40 border border-primary/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Stamp className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="font-bold text-heading text-[11px] block">
                        Firma & Sello Médico Digital
                      </span>
                      <span className="text-[10px] text-muted font-mono">
                        {doc.doctorTitle} {doc.fullName} &bull; CMP {doc.cmp}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Vigente
                  </span>
                </div>
              </div>

              {/* Acciones de la Tarjeta */}
              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                <div>
                  {!isActiveDoctor ? (
                    <button
                      type="button"
                      onClick={() => handleSwitchDoctor(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all cursor-pointer"
                      title="Operar en el sistema con este médico"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Iniciar Sesión como este Médico</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Médico en uso
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(doc)}
                    className="p-2 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Editar datos y credenciales"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {doc.id !== "doc-patrick-jacinto" && (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleDoctorActive(doc.id)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          doc.isActive
                            ? "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={doc.isActive ? "Desactivar acceso" : "Activar acceso"}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(doc)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Eliminar médico"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border space-y-3">
          <Users className="w-10 h-10 text-muted mx-auto" />
          <p className="text-base font-heading font-bold text-heading">
            No se encontraron profesionales médicos
          </p>
          <p className="text-xs text-muted max-w-sm mx-auto">
            No hay especialistas que coincidan con el término de búsqueda o filtro seleccionado.
          </p>
        </div>
      )}

      {/* Modal para Crear o Editar */}
      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctorToEdit={doctorToEdit}
      />
    </div>
  );
}
