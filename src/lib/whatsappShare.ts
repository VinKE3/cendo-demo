/**
 * CENDO - Generador de Mensajes y Enlace Directo a WhatsApp para Pacientes
 * Permite al Dr. Patrick enviar informes, resúmenes y citas con 1 solo clic.
 */

import { Patient, ColposcopyReport, ClinicalCheckup, DoctorProfile, MedicalPrescription } from "@/types/medical";

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

export function generatePrescriptionWhatsAppUrl(
  patient: Patient,
  prescription: MedicalPrescription,
  doctor: DoctorProfile
): string {
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);

  const itemsFormatted = prescription.items
    .map((item, idx) => {
      return [
        `💊 *${idx + 1}. ${item.medicationName}* (${item.presentation})`,
        `   • *Dosis:* ${item.dosage} - ${item.route}`,
        `   • *Frecuencia:* ${item.frequency}`,
        `   • *Duración:* ${item.duration}`,
        item.instructions ? `   • *Indicación:* ${item.instructions}` : null,
        item.quantity ? `   • *Cantidad:* ${item.quantity}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const message = [
    `👋 *Estimada ${patient.firstName} ${patient.lastName}*,`,
    ``,
    `Le saluda el *${doctor.doctorTitle} ${doctor.fullName}* (${doctor.clinicName}).`,
    ``,
    `📋 Le enviamos su *RECETA MÉDICA OFICIAL* emitida el ${prescription.prescriptionDate}:`,
    prescription.diagnosis ? `🩺 *Diagnóstico:* ${prescription.diagnosis}` : null,
    ``,
    `*TRATAMIENTO PRESCRITO (RP/):*`,
    itemsFormatted,
    ``,
    prescription.generalIndications
      ? `📌 *Indicaciones Generales:* ${prescription.generalIndications}\n`
      : null,
    prescription.nextAppointmentDate
      ? `🗓 *Próximo Control:* ${prescription.nextAppointmentDate}\n`
      : null,
    `👨‍⚕️ *Médico Evaluador:* ${doctor.doctorTitle} ${doctor.fullName}`,
    `📜 *Colegiatura:* CMP ${doctor.cmp} | RNE ${doctor.rne}`,
    `🏥 *Sede:* ${doctor.clinicAddress}`,
    `📞 *Central:* ${doctor.phone}`,
    ``,
    `_Conserve este mensaje para su farmacia o tratamiento médico._`,
  ]
    .filter(Boolean)
    .join("\n");

  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${targetPhone}?text=${encodedText}`;
}

