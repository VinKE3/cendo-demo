/**
 * Módulo de Agenda de Citas Médicas - Validaciones & Detección de Conflictos
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { z } from "zod";
import {
  AppointmentStatus,
  AppointmentType,
  CreateAppointmentInput,
  MedicalAppointment,
} from "./agenda.types";

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "PENDIENTE",
  "CONFIRMADA",
  "EN_ESPERA",
  "ATENDIDA",
  "CANCELADA",
  "NO_ASISTIO",
];

export const APPOINTMENT_TYPES_CATALOG: { id: AppointmentType; label: string }[] = [
  { id: "CONSULTA_PRIMERA_VEZ", label: "Consulta Ginecológica (Primera Vez)" },
  { id: "CONTROL_GINECOLOGICO", label: "Control Ginecológico Periódico" },
  { id: "CHEQUEO_INTEGRAL", label: "Chequeo Preventivo Integral CENDO" },
  { id: "CONTROL_PRENATAL", label: "Control Prenatal Oficial (MINSA/CLAP)" },
  { id: "COLPOSCOPIA", label: "Colposcopía Especializada & IFCPC" },
  { id: "ECOGRAFIA", label: "Ecografía Especializada (Transvaginal/Mama/Obstétrica)" },
  { id: "PROCEDIMIENTO_MENOR", label: "Procedimiento Menor en Consultorio (Biopsia / LEEP / DIU)" },
];

export const appointmentInputSchema = z.object({
  patientId: z.string().min(1, "El ID de paciente es obligatorio"),
  patientName: z.string().min(2, "El nombre de la paciente es obligatorio"),
  doctorId: z.string().min(1, "El especialista es obligatorio"),
  doctorName: z.string().min(2, "El nombre del médico es obligatorio"),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}/, "Formato de hora inválido (HH:mm)"),
  durationMinutes: z.number().int().min(5).max(240).default(30),
  appointmentType: z.enum([
    "CONSULTA_PRIMERA_VEZ",
    "CONTROL_GINECOLOGICO",
    "CHEQUEO_INTEGRAL",
    "CONTROL_PRENATAL",
    "COLPOSCOPIA",
    "ECOGRAFIA",
    "PROCEDIMIENTO_MENOR",
  ]),
  reason: z.string().optional(),
  status: z.enum([
    "PENDIENTE",
    "CONFIRMADA",
    "EN_ESPERA",
    "ATENDIDA",
    "CANCELADA",
    "NO_ASISTIO",
  ]).default("CONFIRMADA"),
});

export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function checkScheduleConflict(
  existingAppointments: MedicalAppointment[],
  candidate: {
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    durationMinutes?: number;
    excludeAppointmentId?: string;
  }
): { hasConflict: boolean; conflictingAppointment?: MedicalAppointment; reason?: string } {
  const candidateDuration = candidate.durationMinutes || 30;
  const candidateStart = parseTimeToMinutes(candidate.appointmentTime);
  const candidateEnd = candidateStart + candidateDuration;

  for (const appt of existingAppointments) {
    if (candidate.excludeAppointmentId && appt.id === candidate.excludeAppointmentId) continue;
    if (appt.status === "CANCELADA") continue;
    if (appt.doctorId !== candidate.doctorId) continue;
    if (appt.appointmentDate !== candidate.appointmentDate) continue;

    const apptStart = parseTimeToMinutes(appt.appointmentTime);
    const apptEnd = apptStart + (appt.durationMinutes || 30);

    // Detección de solapamiento de intervalos de tiempo
    if (candidateStart < apptEnd && candidateEnd > apptStart) {
      return {
        hasConflict: true,
        conflictingAppointment: appt,
        reason: `El médico ya tiene la cita de ${appt.patientName} (${appt.appointmentTime} - ${Math.floor(apptEnd / 60).toString().padStart(2, "0")}:${(apptEnd % 60).toString().padStart(2, "0")}) en ese horario.`,
      };
    }
  }

  return { hasConflict: false };
}

export function validateAppointmentInput(
  input: CreateAppointmentInput,
  existingList: MedicalAppointment[] = []
): { success: boolean; error?: string } {
  const zodResult = appointmentInputSchema.safeParse(input);
  if (!zodResult.success) {
    return { success: false, error: zodResult.error.errors[0]?.message || "Datos de cita inválidos" };
  }

  const conflictCheck = checkScheduleConflict(existingList, {
    doctorId: input.doctorId,
    appointmentDate: input.appointmentDate,
    appointmentTime: input.appointmentTime,
    durationMinutes: input.durationMinutes || 30,
    excludeAppointmentId: input.id,
  });

  if (conflictCheck.hasConflict) {
    return { success: false, error: conflictCheck.reason };
  }

  return { success: true };
}
