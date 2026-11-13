"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Search,
  User,
  Filter,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Phone,
  FileText,
  Trash2,
  Edit2,
  Check,
  UserCheck,
} from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";
import {
  MedicalAppointment,
  AppointmentStatus,
  AppointmentType,
} from "@/types/medical";
import { AppointmentModal } from "@/components/agenda/AppointmentModal";
import { generateAppointmentReminderWhatsAppUrl } from "@/lib/whatsappShare";

const TYPE_COLORS: Record<AppointmentType, { bg: string; text: string; border: string }> = {
  CONSULTA_PRIMERA_VEZ: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  CONTROL_GINECOLOGICO: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
  CHEQUEO_INTEGRAL: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  CONTROL_PRENATAL: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-300" },
  COLPOSCOPIA: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  ECOGRAFIA: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" },
  PROCEDIMIENTO_MENOR: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
};

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  PENDIENTE: { label: "Pendiente", bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
  CONFIRMADA: { label: "Confirmada", bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
  EN_ESPERA: { label: "En Sala de Espera", bg: "bg-amber-100", text: "text-amber-900", dot: "bg-amber-500" },
  ATENDIDA: { label: "Atendida / En Consulta", bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
  CANCELADA: { label: "Cancelada", bg: "bg-rose-100", text: "text-rose-800", dot: "bg-rose-500" },
  NO_ASISTIO: { label: "No Asistió", bg: "bg-slate-200", text: "text-slate-600", dot: "bg-slate-500" },
};

export default function AgendaPage() {
  const {
    appointments,
    doctorsList,
    doctorProfile,
    deleteAppointment,
    updateAppointment,
  } = useMedicalStore();

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("TODOS");
  const [selectedStatus, setSelectedStatus] = useState<string>("TODAS");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<MedicalAppointment | null>(null);

  // Navegación de fecha
  const handleShiftDate = (days: number) => {
    const current = new Date(selectedDate + "T00:00:00");
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  // Filtrado de citas
  const filteredAppointments = useMemo(() => {
    return (appointments || [])
      .filter((appt) => {
        if (selectedDate && appt.appointmentDate !== selectedDate) return false;
        if (selectedDoctorId !== "TODOS" && appt.doctorId !== selectedDoctorId) return false;
        if (selectedStatus !== "TODAS" && appt.status !== selectedStatus) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            appt.patientName.toLowerCase().includes(q) ||
            appt.patientDni.includes(q) ||
            appt.reason.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  }, [appointments, selectedDate, selectedDoctorId, selectedStatus, searchQuery]);

  // Métricas del día seleccionado
  const dayStats = useMemo(() => {
    const dayList = (appointments || []).filter((a) => a.appointmentDate === selectedDate);
    return {
      total: dayList.length,
      confirmadas: dayList.filter((a) => a.status === "CONFIRMADA").length,
      enEspera: dayList.filter((a) => a.status === "EN_ESPERA").length,
      atendidas: dayList.filter((a) => a.status === "ATENDIDA").length,
    };
  }, [appointments, selectedDate]);

  const handleStatusChange = (apptId: string, newStatus: AppointmentStatus) => {
    updateAppointment(apptId, { status: newStatus });
  };

  const handleSendReminder = (appt: MedicalAppointment) => {
    const doctor = doctorsList.find((d) => d.id === appt.doctorId) || doctorProfile;
    const url = generateAppointmentReminderWhatsAppUrl(appt, doctor);
    updateAppointment(appt.id, { reminderSent: true });
    window.open(url, "_blank");
  };

  const handleDelete = (appt: MedicalAppointment) => {
    Swal.fire({
      title: "¿Eliminar Cita?",
      text: `¿Desea cancelar y eliminar la cita de ${appt.patientName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        deleteAppointment(appt.id);
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Cabecera y Botón Nuevo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-heading tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Agenda Médica & Citas CENDO
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Gestión de turnos de consultorio, sala de espera y recordatorios automáticos por WhatsApp
          </p>
        </div>

        <button
          onClick={() => {
            setEditingAppointment(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Agendar Nueva Cita</span>
        </button>
      </div>

      {/* 2. Tarjetas de Resumen KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Citas del Día</span>
            <span className="text-2xl font-heading font-extrabold text-heading">{dayStats.total}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Confirmadas</span>
            <span className="text-2xl font-heading font-extrabold text-emerald-700">{dayStats.confirmadas}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">En Sala de Espera</span>
            <span className="text-2xl font-heading font-extrabold text-amber-700">{dayStats.enEspera}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Atendidas</span>
            <span className="text-2xl font-heading font-extrabold text-blue-700">{dayStats.atendidas}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Barra de Control de Fecha y Filtros */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Navegación de Fecha */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleShiftDate(-1)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Día Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedDate === todayStr
                  ? "bg-primary text-white"
                  : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Hoy
            </button>

            <button
              onClick={() => handleShiftDate(1)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Día Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-heading focus:bg-white focus:outline-none"
            />
          </div>

          {/* Filtro por Médico */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted hidden sm:inline">Especialista:</span>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="TODOS">Todos los Médicos CENDO</option>
              {doctorsList.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.doctorTitle} {doc.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtros de Estado & Búsqueda */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-1">
            {["TODAS", "CONFIRMADA", "EN_ESPERA", "PENDIENTE", "ATENDIDA", "CANCELADA"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedStatus === st
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                }`}
              >
                {st === "TODAS" ? "Todas" : STATUS_CONFIG[st as AppointmentStatus]?.label || st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted" />
            <input
              type="text"
              placeholder="Buscar paciente o motivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Lista de Citas */}
      <div className="space-y-3">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appt) => {
            const typeStyle = TYPE_COLORS[appt.appointmentType] || TYPE_COLORS.CONSULTA_PRIMERA_VEZ;
            const statusStyle = STATUS_CONFIG[appt.status] || STATUS_CONFIG.CONFIRMADA;

            return (
              <div
                key={appt.id}
                className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Columna Izquierda: Hora & Paciente */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Hora */}
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0 w-24">
                    <span className="font-mono font-extrabold text-base text-primary block leading-none">
                      {appt.appointmentTime}
                    </span>
                    <span className="text-[10px] text-muted font-mono mt-1 block">
                      {appt.durationMinutes} min
                    </span>
                  </div>

                  {/* Datos Paciente & Cita */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/pacientes/${appt.patientId}`}
                        className="font-heading font-extrabold text-sm sm:text-base text-heading hover:text-primary hover:underline transition-colors truncate"
                      >
                        {appt.patientName}
                      </Link>
                      <span className="font-mono text-xs text-muted">
                        DNI {appt.patientDni}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
                      >
                        {appt.appointmentType.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">
                      {appt.reason}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted pt-0.5">
                      <span className="flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5 text-primary" />
                        <strong>{appt.doctorName}</strong>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {appt.patientPhone}
                      </span>
                      {appt.notes && (
                        <>
                          <span>&bull;</span>
                          <span className="text-[11px] text-slate-500 italic truncate max-w-xs">
                            "{appt.notes}"
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Estado y Acciones Rápidas */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  {/* Selector de Estado */}
                  <select
                    value={appt.status}
                    onChange={(e) => handleStatusChange(appt.id, e.target.value as AppointmentStatus)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer border-none focus:outline-none ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    <option value="CONFIRMADA">● Confirmada</option>
                    <option value="EN_ESPERA">● En Sala de Espera</option>
                    <option value="ATENDIDA">● Atendida</option>
                    <option value="PENDIENTE">● Pendiente</option>
                    <option value="CANCELADA">● Cancelada</option>
                    <option value="NO_ASISTIO">● No Asistió</option>
                  </select>

                  {/* Botón WhatsApp 1 Clic */}
                  <button
                    onClick={() => handleSendReminder(appt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                      appt.reminderSent
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                    title="Enviar recordatorio por WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{appt.reminderSent ? "Reenviar WhatsApp" : "Recordatorio WA"}</span>
                  </button>

                  {/* Enlace a Historia Clínica */}
                  <Link
                    href={`/pacientes/${appt.patientId}`}
                    className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-primary transition-colors cursor-pointer"
                    title="Abrir Historia Clínica"
                  >
                    <FileText className="w-4 h-4" />
                  </Link>

                  {/* Editar */}
                  <button
                    onClick={() => {
                      setEditingAppointment(appt);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-primary transition-colors cursor-pointer"
                    title="Editar Cita"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Eliminar */}
                  <button
                    onClick={() => handleDelete(appt)}
                    className="p-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Eliminar Cita"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-2xl bg-surface border border-border shadow-xs space-y-3">
            <CalendarIcon className="w-12 h-12 text-muted mx-auto" />
            <h3 className="font-heading font-bold text-base text-heading">
              No hay citas programadas para esta fecha
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Utilice el botón superior para programar citas de consultas, ecografías o procedimientos para esta fecha.
            </p>
            <button
              onClick={() => {
                setEditingAppointment(null);
                setIsModalOpen(true);
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Cita Ahora</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Agendamiento */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointmentToEdit={editingAppointment}
      />
    </div>
  );
}

