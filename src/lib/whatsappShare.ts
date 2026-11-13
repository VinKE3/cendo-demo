/**
 * CENDO - Generador de Mensajes y Enlace Directo a WhatsApp para Pacientes
 * Permite al Dr. Patrick enviar informes, resúmenes y citas con 1 solo clic.
 */

import {
  Patient,
  ColposcopyReport,
  ClinicalCheckup,
  DoctorProfile,
  MedicalPrescription,
  LabOrder,
  PrenatalCard,
  PatientDocument,
} from "@/types/medical";

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

export function generateLabOrderWhatsAppUrl(
  patient: Patient,
  labOrder: LabOrder,
  doctor: DoctorProfile
): string {
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);

  const itemsFormatted = labOrder.items
    .map(
      (item, idx) =>
        `🔬 *${idx + 1}. ${item.testName}* (${item.sampleType || "Sangre"})${
          item.notes ? `\n   _Nota: ${item.notes}_` : ""
        }`
    )
    .join("\n");

  const message = [
    `👋 *Estimada ${patient.firstName} ${patient.lastName}*,`,
    ``,
    `Le saluda el *${doctor.doctorTitle} ${doctor.fullName}* (${doctor.clinicName}).`,
    ``,
    `🧪 Le compartimos su *ORDEN DE ANÁLISIS DE LABORATORIO CLÍNICO* (Fecha: ${labOrder.orderDate}):`,
    labOrder.diagnosis ? `🩺 *Indicación / Diagnóstico:* ${labOrder.diagnosis}` : null,
    `⚠️ *Prioridad:* ${labOrder.urgency}`,
    ``,
    `*ANÁLISIS SOLICITADOS:*`,
    itemsFormatted,
    labOrder.customTests ? `\n*Otros Exámenes:* ${labOrder.customTests}` : null,
    ``,
    `📌 *PREPARACIÓN DE LA PACIENTE:*`,
    labOrder.patientInstructions ||
      "Ayuno de 8 a 10 horas. Abstinencia sexual y no aplicar óvulos 48 horas previas.",
    ``,
    `👨‍⚕️ *Médico Solicitante:* ${doctor.doctorTitle} ${doctor.fullName} (CMP ${doctor.cmp} - RNE ${doctor.rne})`,
    `🏥 *Sede CENDO:* ${doctor.clinicAddress}`,
    `📞 *Consultas:* ${doctor.phone}`,
    ``,
    `_Puede presentar este mensaje o la orden impresa en el laboratorio de su preferencia (ej. Biolaq, Laboratorios Roe, Suiza Lab)._`,
  ]
    .filter(Boolean)
    .join("\n");

  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${targetPhone}?text=${encodedText}`;
}

export function generatePrenatalWhatsAppUrl(
  patient: Patient,
  card: PrenatalCard,
  doctor: DoctorProfile
): string {
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);
  const lastVisit =
    card.visits && card.visits.length > 0
      ? card.visits[card.visits.length - 1]
      : null;

  const message = [
    `👋 *Estimada ${patient.firstName} ${patient.lastName}*,`,
    ``,
    `Le saluda el consultorio del *${doctor.doctorTitle} ${doctor.fullName}* (${doctor.clinicName}).`,
    ``,
    `🤰 Le compartimos el resumen de su *Control Prenatal (MINSA / CLAP)*:`,
    `🗓 *FUM:* ${card.baseline.fum} | *FPP (Fecha Probable de Parto):* ${card.baseline.fpp}`,
    lastVisit
      ? `🩺 *Última Atención (N° ${lastVisit.visitNumber} - ${lastVisit.visitDate}):*`
      : null,
    lastVisit
      ? `   • *Edad Gestacional:* ${lastVisit.gestationalAgeWeeks} sem ${lastVisit.gestationalAgeDays} d`
      : null,
    lastVisit ? `   • *Presión Arterial:* ${lastVisit.bloodPressure} mmHg` : null,
    lastVisit ? `   • *Peso Materno:* ${lastVisit.maternalWeightKg} kg` : null,
    lastVisit && lastVisit.fetalHeartRate > 0
      ? `   • *FCF Fetal:* ${lastVisit.fetalHeartRate} lat/min (Normal)`
      : null,
    lastVisit && lastVisit.uterineHeightCm > 0
      ? `   • *Altura Uterina:* ${lastVisit.uterineHeightCm} cm`
      : null,
    lastVisit ? `   • *Próxima Cita:* ${lastVisit.nextAppointmentDate}` : null,
    ``,
    `⚠️ *SIGNOS DE ALARMA (ACUDIR A EMERGENCIA):*`,
    `• Sangrado o pérdida de líquido por la vagina`,
    `• Dolor abdominal intenso o contracciones antes de tiempo`,
    `• Fiebre, dolor de cabeza severo o hinchazón de cara/manos`,
    `• Disminución de los movimientos del bebé`,
    ``,
    `🏥 *Sede de Atención:* ${doctor.clinicAddress}`,
    `📞 *Central de Emergencias / Citas:* ${doctor.phone}`,
    ``,
    `_CENDO - Cuidando la salud de mamá y bebé con los más altos estándares clínicos._`,
  ]
    .filter(Boolean)
    .join("\n");

  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${targetPhone}?text=${encodedText}`;
}

export function generateDocumentWhatsAppUrl(
  patient: Patient,
  doc: PatientDocument,
  doctor: DoctorProfile
): string {
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);

  const message = [
    `👋 *Estimada ${patient.firstName} ${patient.lastName}*,`,
    ``,
    `Le saluda el consultorio del *${doctor.doctorTitle} ${doctor.fullName}* (${doctor.clinicName}).`,
    ``,
    `📂 Le compartimos el documento / informe médico registrado en su expediente clínico:`,
    `📋 *Documento:* ${doc.title}`,
    `🏷 *Tipo:* ${doc.documentType}`,
    `🗓 *Fecha:* ${doc.createdAt.split("T")[0]}`,
    doc.notes ? `📝 *Observación / Resumen:* ${doc.notes}` : null,
    ``,
    `🔗 *Puede visualizar o descargar su documento en el siguiente enlace oficial:*`,
    `${doc.fileUrl}`,
    ``,
    `🏥 *Sede de Atención:* ${doctor.clinicAddress}`,
    `📞 *Central de Consultas:* ${doctor.phone}`,
    ``,
    `_CENDO - Archivo Digital Clínico Seguro._`,
  ]
    .filter(Boolean)
    .join("\n");

  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${targetPhone}?text=${encodedText}`;
}
