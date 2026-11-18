/**
 * CENDO - Generador de Enlaces y Archivos para Calendarios Digitales
 * Soporta Google Calendar, Apple Calendar (iPhone / iPad / Mac) y Outlook.
 */

import { MedicalAppointment, DoctorProfile } from "@/types/medical";
import { INITIAL_DOCTOR } from "@/store/useMedicalStore";

export type CalendarExportAppointment = {
  id?: string;
  patientName: string;
  patientDni: string;
  patientPhone: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes?: number;
  appointmentType: string;
  reason: string;
  notes?: string;
};

/**
 * Formatea una fecha y hora local a formato compacto para URLs de calendario: YYYYMMDDTHHmmSS
 */
function formatToCompactDateTime(dateStr: string, timeStr: string, addMinutes = 0): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);

  const d = new Date(year, month - 1, day, hours, minutes + addMinutes, 0);

  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  const ss = "00";

  return `${yyyy}${mm}${dd}T${hh}${min}${ss}`;
}

/**
 * Genera el enlace directo a Google Calendar (abre en navegador web o app de Google Calendar)
 */
export function generateGoogleCalendarUrl(
  appointment: CalendarExportAppointment,
  doctor?: DoctorProfile | null,
  options?: { compact?: boolean }
): string {
  const doc = doctor || INITIAL_DOCTOR;
  const duration = appointment.durationMinutes || 30;

  const startIso = formatToCompactDateTime(appointment.appointmentDate, appointment.appointmentTime, 0);
  const endIso = formatToCompactDateTime(appointment.appointmentDate, appointment.appointmentTime, duration);

  const cleanTitle = `Cita CENDO: ${appointment.patientName}`;
  const title = encodeURIComponent(cleanTitle);

  let detailsText = "";
  if (options?.compact) {
    detailsText = `Cita médica con ${appointment.doctorName} en CENDO. Tel: ${doc.phone}`;
  } else {
    detailsText = [
      `🩺 CITA MÉDICA GINECOLÓGICA - CENDO`,
      ``,
      `👤 Paciente: ${appointment.patientName}`,
      `🆔 DNI: ${appointment.patientDni}`,
      `📞 Celular: ${appointment.patientPhone}`,
      `👨‍⚕️ Médico Tratante: ${appointment.doctorName}`,
      `📋 Motivo: ${appointment.reason}`,
      appointment.notes ? `📝 Notas: ${appointment.notes}` : "",
      ``,
      `🏥 Sede: ${doc.clinicAddress}`,
      `📞 Central de Citas: ${doc.phone}`,
      ``,
      `💡 Llegar con 10 minutos de anticipación y portar DNI físico.`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  const details = encodeURIComponent(detailsText);
  const location = encodeURIComponent(doc.clinicAddress);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}&ctz=America/Lima`;
}

/**
 * Genera el contenido estándar RFC 5545 (.ics) para Apple Calendar (iPhone / Mac) y Outlook
 */
export function generateIcsContent(
  appointment: CalendarExportAppointment,
  doctor?: DoctorProfile | null
): string {
  const doc = doctor || INITIAL_DOCTOR;
  const duration = appointment.durationMinutes || 30;

  const startCompact = formatToCompactDateTime(appointment.appointmentDate, appointment.appointmentTime, 0);
  const endCompact = formatToCompactDateTime(appointment.appointmentDate, appointment.appointmentTime, duration);

  const nowIso = new Date().toISOString().replace(/-|:|\.\d\d\d/g, "");

  const summary = `Cita CENDO: ${appointment.patientName} (${appointment.appointmentType.replace(/_/g, " ")})`;
  const description = `Paciente: ${appointment.patientName} | DNI: ${appointment.patientDni} | Tel: ${appointment.patientPhone} | Médico: ${appointment.doctorName} | Motivo: ${appointment.reason}${appointment.notes ? ` | Notas: ${appointment.notes}` : ""}`;
  const location = doc.clinicAddress.replace(/,/g, "\\,");
  const uid = appointment.id || `temp-${Date.now()}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CENDO//Centro de Endometriosis y Ginecologia//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:America/Lima",
    "X-LIC-LOCATION:America/Lima",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0500",
    "TZNAME:PET",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:cendo-appt-${uid}@cendo.pe`,
    `DTSTAMP:${nowIso}Z`,
    `DTSTART;TZID=America/Lima:${startCompact}`,
    `DTEND;TZID=America/Lima:${endCompact}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:Recordatorio de Cita Médica CENDO con ${appointment.patientName}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Descarga en el navegador el archivo .ics para abrir en Apple Calendar (iPhone / Mac / iPad)
 */
export function downloadIcsForAppleCalendar(
  appointment: CalendarExportAppointment,
  doctor?: DoctorProfile | null
): void {
  const ics = generateIcsContent(appointment, doctor);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);

  const cleanName = appointment.patientName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  const fileName = `Cita_CENDO_${cleanName}_${appointment.appointmentDate}.ics`;

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
