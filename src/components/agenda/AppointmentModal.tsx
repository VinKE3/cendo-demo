"use client";

import React, { useState, useEffect } from "react";
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
    doctorsList,
    doctorProfile,
    addAppointment,
    updateAppointment,
  } = useMedicalStore();

  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientDni, setPatientDni] = useState("");
  const [patientPhone, setPatientPhone] = useState("");

  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorProfile.id);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("CONSULTA_PRIMERA_VEZ");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<AppointmentStatus>("CONFIRMADA");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (appointmentToEdit) {
      setSelectedPatientId(appointmentToEdit.patientId);
      setPatientName(appointmentToEdit.patientName);
      setPatientDni(appointmentToEdit.patientDni);
      setPatientPhone(appointmentToEdit.patientPhone);
      setSelectedDoctorId(appointmentToEdit.doctorId);
      setAppointmentDate(appointmentToEdit.appointmentDate);
      setAppointmentTime(appointmentToEdit.appointmentTime);
      setDurationMinutes(appointmentToEdit.durationMinutes);
      setAppointmentType(appointmentToEdit.appointmentType);
      setReason(appointmentToEdit.reason);
      setStatus(appointmentToEdit.status);
      setNotes(appointmentToEdit.notes || "");
    } else {
      const today = new Date().toISOString().split("T")[0];
      setAppointmentDate(today);
      setAppointmentTime("10:00");
      setDurationMinutes(30);
      setAppointmentType("CONSULTA_PRIMERA_VEZ");
      setStatus("CONFIRMADA");
      setNotes("Llegar con 10 minutos de anticipación.");

      if (defaultPatientId) {
        const p = patients.find((pat) => pat.id === defaultPatientId);
        if (p) {
          setSelectedPatientId(p.id);
          setPatientName(`${p.lastName}, ${p.firstName}`);
          setPatientDni(p.dni);
          setPatientPhone(p.phone);
        }
      } else if (patients.length > 0) {
        const p = patients[0];
        setSelectedPatientId(p.id);
        setPatientName(`${p.lastName}, ${p.firstName}`);
        setPatientDni(p.dni);
        setPatientPhone(p.phone);
      }
    }
  }, [appointmentToEdit, defaultPatientId, isOpen, patients]);

  const handlePatientSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedPatientId(pId);
    const p = patients.find((pat) => pat.id === pId);
    if (p) {
      setPatientName(`${p.lastName}, ${p.firstName}`);
      setPatientDni(p.dni);
      setPatientPhone(p.phone);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    if (!patientName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Paciente Requerido",
        text: "Por favor seleccione una paciente de la lista.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    const assignedDoctor = doctorsList.find((d) => d.id === selectedDoctorId) || doctorProfile;

    const payload = {
      patientId: selectedPatientId || "pat-manual",
      patientName: patientName.trim(),
      patientDni: patientDni.trim(),
      patientPhone: patientPhone.trim(),
      doctorId: assignedDoctor.id,
      doctorName: `${assignedDoctor.doctorTitle} ${assignedDoctor.fullName}`,
      appointmentDate: appointmentDate || new Date().toISOString().split("T")[0],
      appointmentTime,
      durationMinutes: Number(durationMinutes) || 30,
      appointmentType,
      reason: reason.trim() || APPOINTMENT_TYPES.find((t) => t.id === appointmentType)?.label || "Consulta CENDO",
      status,
      notes: notes.trim() || undefined,
      reminderSent: appointmentToEdit ? appointmentToEdit.reminderSent : false,
    };

    if (appointmentToEdit) {
      updateAppointment(appointmentToEdit.id, payload);
      Swal.fire({
        icon: "success",
        title: "Cita Actualizada",
        text: "La cita ha sido modificada y sincronizada.",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      addAppointment(payload);
      Swal.fire({
        icon: "success",
        title: "Cita Agendada",
        text: `Cita programada para ${payload.patientName} a las ${payload.appointmentTime}.`,
        timer: 1500,
        showConfirmButton: false,
      });
    }

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
          {/* Selección de Paciente */}
          <div className="space-y-1">
            <label className="font-bold text-heading block">Paciente *</label>
            <select
              value={selectedPatientId}
              onChange={handlePatientSelectChange}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:border-primary focus:bg-white focus:outline-none"
            >
              <option value="" disabled>Seleccione una paciente registrada...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.lastName}, {p.firstName} — DNI {p.dni} ({p.phone})
                </option>
              ))}
            </select>
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
                    appointmentDate: appointmentDate || new Date().toISOString().split("T")[0],
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

