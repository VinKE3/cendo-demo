/**
 * CENDO - Generador de Mensajes y Enlace Directo a WhatsApp para Pacientes
 * Permite al Dr. Patrick enviar informes, resúmenes y citas con 1 solo clic.
 */

import { Patient, ColposcopyReport, ClinicalCheckup, DoctorProfile } from "@/types/medical";

export function cleanPhoneForWhatsApp(phone: string): string {
  // Quitar espacios, guiones y caracteres no numéricos
  const cleaned = phone.replace(/\D/g, "");
  // Si tiene 9 dígitos (formato estándar Perú), agregar código de país +51
  if (cleaned.length === 9) {
    return `51${cleaned}`;
  }
  return cleaned;
}

export function generateColposcopyWhatsAppUrl(
  patient: Patient,
  report: ColposcopyReport,
  doctor: DoctorProfile
): string {
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);

  const message = [
    `👋 *Estimada ${patient.firstName} ${patient.lastName}*,`,
    ``,
    `Le saluda el consultorio del *${doctor.doctorTitle} ${doctor.fullName}* (${doctor.clinicName}).`,
    ``,
    `📄 Le compartimos el resumen de su *Informe de Colposcopía Especializada*:`,
    `🗓 *Fecha de atención:* ${report.reportDate}`,
    `🩺 *Diagnóstico Colposcópico:* ${report.diagnosis}`,
    report.cie10Code ? `🔖 *CIE-10:* ${report.cie10Code}` : "",
    `📌 *Recomendaciones / Plan:* ${report.planRecommendations}`,
    report.cervicalBiopsyTaken
      ? `🔬 *Biopsia Dirigida:* Realizada (Horas: ${report.biopsyClockHours.map((h) => `${h}:00`).join(", ")}) - Pendiente resultado de anatomía patológica.`
      : `✅ *Biopsia:* No requerida.`,
    ``,
    `🏥 *Sede de Atención:* ${doctor.clinicAddress}`,
    `📞 *Central de Citas:* ${doctor.phone}`,
    ``,
    `_Conserve este mensaje para su control ginecológico preventivo._`,
  ]
    .filter(Boolean)
    .join("\n");

  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${targetPhone}?text=${encodedText}`;
}

export function generateCheckupWhatsAppUrl(
  patient: Patient,
  checkup: ClinicalCheckup,
  doctor: DoctorProfile
): string {
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);

  const message = [
    `👋 *Estimada ${patient.firstName} ${patient.lastName}*,`,
    ``,
    `Le saluda el consultorio del *${doctor.doctorTitle} ${doctor.fullName}* (${doctor.clinicName}).`,
    ``,
    `📋 Le compartimos las conclusiones de su *Chequeo Ginecológico Preventivo Integral*:`,
    `🗓 *Fecha:* ${checkup.checkupDate}`,
    `🩺 *Conclusiones Clínicas:* ${checkup.conclusions}`,
    checkup.breastUltrasoundBirads
      ? `🔬 *Ecografía de Mamas:* Clasificación ${checkup.breastUltrasoundBirads}`
      : "",
    checkup.medicalPrescription
      ? `💊 *Receta / Indicaciones:* ${checkup.medicalPrescription}`
      : "",
    ``,
    `🏥 *Sede:* ${doctor.clinicAddress}`,
    `📞 *Consultas:* ${doctor.phone}`,
    ``,
    `_CENDO - Especialistas en Endometriosis y Cirugía Ginecológica de Alta Precisión._`,
  ]
    .filter(Boolean)
    .join("\n");

  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${targetPhone}?text=${encodedText}`;
}

