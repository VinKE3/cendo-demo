"use client";

import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import {
  X,
  Calendar,
  Clock,
  User,
  CheckCircle,
  MessageCircle,
  Stethoscope,
  Sparkles,
  Plus,
  Search,
  UserCheck,
  AlertTriangle,
  Phone,
  ArrowRight,
  SearchX,
} from "lucide-react";
import {
  Patient,
  DoctorProfile,
  MedicalAppointment,
  AppointmentStatus,
  AppointmentType,
} from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import { generateAppointmentReminderWhatsAppUrl } from "@/lib/whatsappShare";
import { generateGoogleCalendarUrl, downloadIcsForAppleCalendar } from "@/lib/calendarExport";
import { validateAppointmentInput, checkScheduleConflict } from "@/modules/agenda";
import { getPeruDateString } from "@/lib/utils";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentToEdit?: MedicalAppointment | null;
  defaultPatientId?: string;
}

const APPOINTMENT_TYPES: { id: AppointmentType; label: string }[] = [
  { id: "CONSULTA_PRIMERA_VEZ", label: "Consulta Ginecológica (Primera Vez)" },
  { id: "CONTROL_GINECOLOGICO", label: "Control Ginecológico Periódico" },
  { id: "CHEQUEO_INTEGRAL", label: "Chequeo Preventivo Integral CENDO" },
  { id: "CONTROL_PRENATAL", label: "Control Prenatal Oficial (MINSA/CLAP)" },
  { id: "COLPOSCOPIA", label: "Colposcopía Especializada & IFCPC" },
  { id: "ECOGRAFIA", label: "Ecografía Especializada (Transvaginal/Mama/Obstétrica)" },
  { id: "PROCEDIMIENTO_MENOR", label: "Procedimiento Menor en Consultorio (Biopsia / LEEP / DIU)" },
];

const STATUS_OPTIONS: { id: AppointmentStatus; label: string }[] = [
  { id: "PENDIENTE", label: "Pendiente" },
  { id: "CONFIRMADA", label: "Confirmada por Paciente" },
  { id: "EN_ESPERA", label: "En Sala de Espera" },
  { id: "ATENDIDA", label: "Atendida / En Consulta" },
  { id: "CANCELADA", label: "Cancelada" },
  { id: "NO_ASISTIO", label: "No Asistió" },
];

export function AppointmentModal({
  isOpen,
  onClose,
  appointmentToEdit,
  defaultPatientId,
}: AppointmentModalProps) {
  const {
    patients,
    appointments,
    doctorsList,
    doctorProfile,
    addAppointment,
    updateAppointment,
    addPatient,
    getPatientByDni,
  } = useMedicalStore();

  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientDni, setPatientDni] = useState("");
  const [patientPhone, setPatientPhone] = useState("");

  // Estado de búsqueda y autocompletado en tiempo real para continuadoras
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Modo Paciente Nueva
  const [isNewPatientMode, setIsNewPatientMode] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newDni, setNewDni] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorProfile.id);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("CONSULTA_PRIMERA_VEZ");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<AppointmentStatus>("CONFIRMADA");
  const [notes, setNotes] = useState("");

  // Paciente continuadora actualmente seleccionada
  const currentSelectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // Filtrado de pacientes en tiempo real por Nombre, Apellido o DNI
  const matchingPatients = useMemo(() => {
    const q = patientSearchQuery.trim().toLowerCase();
    if (!q) return patients.slice(0, 10);
    return patients.filter((p) => {
      const full = `${p.lastName} ${p.firstName}`.toLowerCase();
      const reverse = `${p.firstName} ${p.lastName}`.toLowerCase();
      const dni = (p.dni || "").toLowerCase();
      const phone = (p.phone || "").replace(/\s+/g, "");
      const cleanQ = q.replace(/\s+/g, "");
      return (
        full.includes(q) ||
        reverse.includes(q) ||
        dni.includes(q) ||
        phone.includes(cleanQ)
      );
    });
  }, [patients, patientSearchQuery]);

  // Función para autocompletar instantáneamente todos los datos de la paciente continuadora
  const selectPatientContinuadora = (p: Patient) => {
    setSelectedPatientId(p.id);
    const fullName = `${p.lastName}, ${p.firstName}`;
    setPatientName(fullName);
    setPatientDni(p.dni);
    setPatientPhone(p.phone || "");
    setPatientSearchQuery(fullName);
    setIsSearchOpen(false);
    setIsNewPatientMode(false);

    // Si la cita estaba en Consulta Primera Vez, actualizar a Control Ginecológico Continuadora
    setAppointmentType((prev) =>
      prev === "CONSULTA_PRIMERA_VEZ" ? "CONTROL_GINECOLOGICO" : prev
    );
  };

  // Detección reactiva en caso de que escriba en "+ Nueva Paciente" pero la paciente ya existe en CENDO
  const detectedExistingPatient = useMemo(() => {
    if (!isNewPatientMode) return null;
    const cleanDni = newDni.trim();
    if (cleanDni.length >= 7) {
      const byDni = patients.find((p) => p.dni === cleanDni);
      if (byDni) return byDni;
    }
    const cleanFull = `${newLastName} ${newFirstName}`.trim().toLowerCase();
    if (cleanFull.length >= 6) {
      const byName = patients.find((p) => {
        const pFull = `${p.lastName} ${p.firstName}`.toLowerCase();
        return pFull.includes(cleanFull);
      });
      if (byName) return byName;
    }
    return null;
  }, [isNewPatientMode, newDni, newFirstName, newLastName, patients]);

  useEffect(() => {
    if (appointmentToEdit) {
      setSelectedPatientId(appointmentToEdit.patientId);
      setPatientName(appointmentToEdit.patientName);
      setPatientDni(appointmentToEdit.patientDni);
      setPatientPhone(appointmentToEdit.patientPhone);
      setPatientSearchQuery(appointmentToEdit.patientName);
      setIsSearchOpen(false);
      setIsNewPatientMode(false);
      setSelectedDoctorId(appointmentToEdit.doctorId);
      setAppointmentDate(appointmentToEdit.appointmentDate);
      setAppointmentTime(appointmentToEdit.appointmentTime);
      setDurationMinutes(appointmentToEdit.durationMinutes);
      setAppointmentType(appointmentToEdit.appointmentType);
      setReason(appointmentToEdit.reason);
      setStatus(appointmentToEdit.status);
      setNotes(appointmentToEdit.notes || "");
    } else {
      setIsNewPatientMode(false);
      setIsSearchOpen(false);
      setNewFirstName("");
      setNewLastName("");
      setNewDni("");
      setNewPhone("");
      const today = getPeruDateString();
      setAppointmentDate(today);
      setAppointmentTime("10:00");
      setDurationMinutes(30);
      setStatus("CONFIRMADA");
      setNotes("Llegar con 10 minutos de anticipación.");

      if (defaultPatientId) {
        const p = patients.find((pat) => pat.id === defaultPatientId);
        if (p) {
          selectPatientContinuadora(p);
        }
      } else if (patients.length > 0) {
        const p = patients[0];
        selectPatientContinuadora(p);
      } else {
        setSelectedPatientId("");
        setPatientName("");
        setPatientDni("");
        setPatientPhone("");
        setPatientSearchQuery("");
        setAppointmentType("CONSULTA_PRIMERA_VEZ");
      }
    }
  }, [appointmentToEdit, defaultPatientId, isOpen, patients]);

  if (!isOpen) return null;

  const handleSave = () => {
    let finalPatientId = selectedPatientId;
    let finalPatientName = patientName.trim();
    let finalPatientDni = patientDni.trim();
    let finalPatientPhone = patientPhone.trim();

    // Si está en modo Paciente Nueva (Primera Vez)
    if (isNewPatientMode && !appointmentToEdit) {
      if (!newFirstName.trim() || !newLastName.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Datos Incompletos",
          text: "Por favor ingrese Nombres y Apellidos de la nueva paciente.",
          confirmButtonColor: "#0A4D68",
        });
        return;
      }
      if (!newDni.trim() || newDni.trim().length < 8) {
        Swal.fire({
          icon: "warning",
          title: "DNI Requerido",
          text: "Ingrese un DNI válido de 8 dígitos para registrar la Historia Clínica.",
          confirmButtonColor: "#0A4D68",
        });
        return;
      }

      // Verificar si ya existe por DNI
      const existing = getPatientByDni(newDni.trim());
      if (existing) {
        finalPatientId = existing.id;
        finalPatientName = `${existing.lastName}, ${existing.firstName}`;
        finalPatientDni = existing.dni;
        finalPatientPhone = newPhone.trim() || existing.phone;
      } else {
        // Crear paciente automáticamente en el sistema
        const created = addPatient({
          dni: newDni.trim(),
          firstName: newFirstName.trim().toUpperCase(),
          lastName: newLastName.trim().toUpperCase(),
          phone: newPhone.trim() || "999999999",
          email: "",
          address: "Lima, Perú",
          civilStatus: "Soltera",
          occupation: "Particular",
          age: 28,
          birthDate: "1996-01-01",
        });
        finalPatientId = created.id;
        finalPatientName = `${created.lastName}, ${created.firstName}`;
        finalPatientDni = created.dni;
        finalPatientPhone = created.phone;
      }
    } else {
      if (!finalPatientName) {
        Swal.fire({
          icon: "warning",
          title: "Paciente Requerido",
          text: "Por favor seleccione una paciente de la lista o registre una nueva.",
          confirmButtonColor: "#0A4D68",
        });
        return;
      }
    }

    const assignedDoctor = doctorsList.find((d) => d.id === selectedDoctorId) || doctorProfile;

    const payload = {
      id: appointmentToEdit ? appointmentToEdit.id : undefined,
      patientId: finalPatientId || "pat-manual",
      patientName: finalPatientName,
      patientDni: finalPatientDni,
      patientPhone: finalPatientPhone,
      doctorId: assignedDoctor.id,
      doctorName: `${assignedDoctor.doctorTitle} ${assignedDoctor.fullName}`,
      appointmentDate: appointmentDate || getPeruDateString(),
      appointmentTime,
      durationMinutes: Number(durationMinutes) || 30,
      appointmentType,
      reason: reason.trim() || APPOINTMENT_TYPES.find((t) => t.id === appointmentType)?.label || "Consulta CENDO",
      status,
      notes: notes.trim() || undefined,
      reminderSent: appointmentToEdit ? appointmentToEdit.reminderSent : false,
    };

    // Validación preventiva modular y detección de solapamiento de horarios
    const validation = validateAppointmentInput(payload, appointments || []);
    if (!validation.success) {
      Swal.fire({
        icon: "warning",
        title: "Conflicto en la Agenda",
        text: validation.error,
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    if (appointmentToEdit) {
      updateAppointment(appointmentToEdit.id, payload);
    } else {
      addAppointment(payload);
    }

    const gcalUrl = generateGoogleCalendarUrl(payload, assignedDoctor);

    Swal.fire({
      icon: "success",
      title: appointmentToEdit ? "Cita Modificada" : "Cita Agendada",
      html: `
        <div style="font-size: 13px; color: #475569; margin-bottom: 12px; text-align: left;">
          Paciente: <b>${payload.patientName}</b><br/>
          Fecha: <b>${payload.appointmentDate}</b> &bull; Hora: <b>${payload.appointmentTime}</b> (${payload.durationMinutes} min)<br/>
          Motivo: <b>${payload.reason}</b>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
          <a href="${gcalUrl}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 14px; background: #0284c7; color: white; border-radius: 10px; font-weight: bold; text-decoration: none; font-size: 12px;">
            📅 Añadir a Google Calendar
          </a>
        </div>
      `,
      showCancelButton: true,
      cancelButtonText: "Listo / Cerrar",
      showConfirmButton: true,
      confirmButtonText: "🍎 Descargar para iPhone (.ics)",
      confirmButtonColor: "#1e293b",
    }).then((res) => {
      if (res.isConfirmed) {
        downloadIcsForAppleCalendar(payload, assignedDoctor);
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-2xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-heading">
                {appointmentToEdit ? "Modificar Cita Médica" : "Agendar Nueva Cita en CENDO"}
              </h2>
              <p className="text-xs text-muted">
                Programación de consulta, ecografía o procedimiento con recordatorio WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-heading hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Selección o Registro de Paciente */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-heading block">Paciente *</label>
              {!appointmentToEdit && (
                <div className="flex items-center rounded-lg bg-slate-200/70 p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setIsNewPatientMode(false)}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      !isNewPatientMode
                        ? "bg-white text-primary shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Registrada ({patients.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewPatientMode(true);
                      setAppointmentType("CONSULTA_PRIMERA_VEZ");
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                      isNewPatientMode
                        ? "bg-primary text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Nueva Paciente</span>
                  </button>
                </div>
              )}
            </div>

            {!isNewPatientMode ? (
              <div className="space-y-2">
                {/* 1. Tarjeta de Paciente Continuadora Seleccionada (si ya está seleccionada y no se está buscando) */}
                {currentSelectedPatient && !isSearchOpen ? (
                  <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/70 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-heading font-extrabold text-xs text-emerald-950 truncate">
                            {patientName}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-300 uppercase shrink-0">
                            CONTINUADORA
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 font-mono truncate">
                          DNI: <strong>{patientDni}</strong> &bull; Cel: <strong>{patientPhone || "Sin teléfono"}</strong>
                          {currentSelectedPatient?.age ? ` • ${currentSelectedPatient.age} años` : ""}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(true);
                        setPatientSearchQuery("");
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Cambiar Paciente</span>
                    </button>
                  </div>
                ) : (
                  /* 2. Campo de Búsqueda Predictivo en Tiempo Real */
                  <div className="relative">
                    {/* Backdrop transparente para cerrar dropdown al dar clic fuera */}
                    {isSearchOpen && (
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsSearchOpen(false)}
                      />
                    )}

                    <div className="relative z-30">
                      <Search className="w-4 h-4 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        autoFocus={isSearchOpen}
                        placeholder="Escriba el nombre, apellido o DNI de la paciente continuadora..."
                        value={patientSearchQuery}
                        onChange={(e) => {
                          setPatientSearchQuery(e.target.value);
                          setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border-2 border-primary/50 text-xs font-bold text-heading placeholder:text-slate-400 placeholder:font-normal focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-sm"
                      />
                      {patientSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setPatientSearchQuery("");
                            setIsSearchOpen(true);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Menú Flotante Predictivo */}
                    {isSearchOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-600">
                            Pacientes Continuadoras ({matchingPatients.length})
                          </span>
                          <span className="text-[10px]">Escriba para filtrar</span>
                        </div>

                        {matchingPatients.length > 0 ? (
                          matchingPatients.map((p) => {
                            const isCurrent = p.id === selectedPatientId;
                            return (
                              <div
                                key={p.id}
                                onClick={() => selectPatientContinuadora(p)}
                                className={`p-2.5 hover:bg-emerald-50/70 cursor-pointer transition-colors flex items-center justify-between gap-2.5 ${
                                  isCurrent ? "bg-primary/5 border-l-4 border-primary" : ""
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-extrabold text-xs flex items-center justify-center shrink-0">
                                    {p.firstName.charAt(0)}{p.lastName.charAt(0)}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-extrabold text-slate-900 text-xs truncate">
                                      {p.lastName}, {p.firstName}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-mono">
                                      DNI: <strong className="text-slate-800">{p.dni}</strong> &bull; Cel: {p.phone || "—"} {p.age ? `• ${p.age} años` : ""}
                                    </p>
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-1">
                                  <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-primary text-white flex items-center gap-1 shadow-2xs">
                                    <span>Cargar Datos</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center space-y-2">
                            <SearchX className="w-6 h-6 text-slate-400 mx-auto" />
                            <p className="text-xs text-slate-600">
                              No se encontró paciente registrada que coincida con <strong>"{patientSearchQuery}"</strong>
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setIsNewPatientMode(true);
                                setNewFirstName(patientSearchQuery.toUpperCase());
                                setIsSearchOpen(false);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Registrar como Nueva Paciente</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {/* Banner si detecta paciente ya existente */}
                {detectedExistingPatient && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="text-[11px] leading-tight min-w-0">
                        <p className="font-extrabold text-amber-900 truncate">
                          ¡Paciente Continuadora Detectada en CENDO!
                        </p>
                        <p className="text-amber-800 font-mono text-[10.5px] truncate">
                          {detectedExistingPatient.lastName}, {detectedExistingPatient.firstName} (DNI {detectedExistingPatient.dni})
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectPatientContinuadora(detectedExistingPatient)}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10.5px] shrink-0 transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Cargar Datos</span>
                    </button>
                  </div>
                )}

                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Paciente de Primera Vez:</strong> Al agendar la cita se creará automáticamente su Historia Clínica en CENDO.
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block uppercase">Nombres *</label>
                    <input
                      type="text"
                      placeholder="Ej. Carla Paola"
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block uppercase">Apellidos *</label>
                    <input
                      type="text"
                      placeholder="Ej. Fernández Soto"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block uppercase">DNI (8 dígitos) *</label>
                    <input
                      type="text"
                      maxLength={8}
                      placeholder="Ej. 74859612"
                      value={newDni}
                      onChange={(e) => setNewDni(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block uppercase">Celular / WhatsApp *</label>
                    <input
                      type="text"
                      placeholder="Ej. 987654321"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Médico Asignado */}
          <div className="space-y-1">
            <label className="font-bold text-heading block">Médico Especialista CENDO *</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:border-primary focus:bg-white focus:outline-none"
            >
              {doctorsList.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.doctorTitle} {doc.fullName} ({doc.specialty})
                </option>
              ))}
            </select>
          </div>

          {/* Fecha, Hora y Duración */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-heading block">Fecha de Cita *</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-heading block">Hora *</label>
              <input
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-heading block">Duración Estimada</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:border-primary focus:bg-white focus:outline-none"
              >
                <option value={15}>15 minutos (Control rápido)</option>
                <option value={30}>30 minutos (Estándar)</option>
                <option value={45}>45 minutos (Consulta compleja)</option>
                <option value={60}>60 minutos (Procedimiento / LEEP)</option>
                <option value={90}>90 minutos (Cirugía mayor ambulatoria)</option>
              </select>
            </div>
          </div>

          {/* Tipo de Cita y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-heading block">Tipo de Cita *</label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:border-primary focus:bg-white focus:outline-none"
              >
                {APPOINTMENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-heading block">Estado Inicial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-primary focus:border-primary focus:bg-white focus:outline-none"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Motivo Detallado */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Motivo / Notas de la Cita</label>
            <input
              type="text"
              placeholder="Ej: Evaluación de dolor pélvico crónico, control ecográfico..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-primary focus:outline-none"
            />
          </div>

          {/* Indicaciones para Paciente */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Indicaciones / Preparación para la Paciente</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Vejiga vacía para ecografía transvaginal, traer DNI físico..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 border-t border-border bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            {patientPhone && (
              <button
                type="button"
                onClick={() => {
                  const assignedDoctor = doctorsList.find((d) => d.id === selectedDoctorId) || doctorProfile;
                  const tempAppt: MedicalAppointment = {
                    id: appointmentToEdit ? appointmentToEdit.id : "temp-appt",
                    patientId: selectedPatientId,
                    patientName,
                    patientDni,
                    patientPhone,
                    doctorId: assignedDoctor.id,
                    doctorName: assignedDoctor.fullName,
                    appointmentDate: appointmentDate || getPeruDateString(),
                    appointmentTime,
                    durationMinutes,
                    appointmentType,
                    reason: reason || "Cita médica en CENDO",
                    status,
                    notes,
                    reminderSent: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  const url = generateAppointmentReminderWhatsAppUrl(tempAppt, assignedDoctor);
                  window.open(url, "_blank");
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Recordatorio WhatsApp</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{appointmentToEdit ? "Guardar Cambios" : "Agendar Cita"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

