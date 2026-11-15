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
  MedicalConsultation,
  UltrasoundReport,
  MinorProcedureReport,
  ProcedureQuote,
  MedicalAppointment,
} from "@/types/medical";
import { INITIAL_DOCTOR } from "@/store/useMedicalStore";
import { generateGoogleCalendarUrl } from "./calendarExport";

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
  doctor?: DoctorProfile | null
): string {
  const doc = doctor || INITIAL_DOCTOR;
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);

  const message = [
    `👋 *Estimada ${patient.firstName} ${patient.lastName}*,`,
    ``,
    `Le saluda el consultorio del *${doc.doctorTitle} ${doc.fullName}* (${doc.clinicName}).`,
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
    `🏥 *Sede de Atención:* ${doc.clinicAddress}`,
    `📞 *Central de Citas:* ${doc.phone}`,
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
  doctor?: DoctorProfile | null
): string {
  const doc = doctor || INITIAL_DOCTOR;
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);

  const message = [
    `👋 *Estimada ${patient.firstName} ${patient.lastName}*,`,
    ``,
    `Le saluda el consultorio del *${doc.doctorTitle} ${doc.fullName}* (${doc.clinicName}).`,
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
    `🏥 *Sede:* ${doc.clinicAddress}`,
    `📞 *Consultas:* ${doc.phone}`,
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
  doctor?: DoctorProfile | null
): string {
  const doc = doctor || INITIAL_DOCTOR;
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
    `Le saluda el *${doc.doctorTitle} ${doc.fullName}* (${doc.clinicName}).`,
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
    `👨‍⚕️ *Médico Evaluador:* ${doc.doctorTitle} ${doc.fullName}`,
    `📜 *Colegiatura:* CMP ${doc.cmp} | RNE ${doc.rne}`,
    `🏥 *Sede:* ${doc.clinicAddress}`,
    `📞 *Central:* ${doc.phone}`,
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
  doctor?: DoctorProfile | null
): string {
  const doc = doctor || INITIAL_DOCTOR;
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
    `Le saluda el *${doc.doctorTitle} ${doc.fullName}* (${doc.clinicName}).`,
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
    `👨‍⚕️ *Médico Solicitante:* ${doc.doctorTitle} ${doc.fullName} (CMP ${doc.cmp} - RNE ${doc.rne})`,
    `🏥 *Sede CENDO:* ${doc.clinicAddress}`,
    `📞 *Consultas:* ${doc.phone}`,
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
  doctor?: DoctorProfile | null
): string {
  const doc = doctor || INITIAL_DOCTOR;
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);
  const lastVisit =
    card.visits && card.visits.length > 0
      ? card.visits[card.visits.length - 1]
      : null;

  const message = [
    `👋 *Estimada ${patient.firstName} ${patient.lastName}*,`,
    ``,
    `Le saluda el consultorio del *${doc.doctorTitle} ${doc.fullName}* (${doc.clinicName}).`,
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
    `🏥 *Sede de Atención:* ${doc.clinicAddress}`,
    `📞 *Central de Emergencias / Citas:* ${doc.phone}`,
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
  documentObj: PatientDocument,
  doctor?: DoctorProfile | null
): string {
  const doc = doctor || INITIAL_DOCTOR;
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);

  const message = [
    `👋 *Estimada ${patient.firstName} ${patient.lastName}*,`,
    ``,
    `Le saluda el consultorio del *${doc.doctorTitle} ${doc.fullName}* (${doc.clinicName}).`,
    ``,
    `📂 Le compartimos el documento / informe médico registrado en su expediente clínico:`,
    `📋 *Documento:* ${documentObj.title}`,
    `🏷 *Tipo:* ${documentObj.documentType}`,
    `🗓 *Fecha:* ${documentObj.createdAt.split("T")[0]}`,
    documentObj.notes ? `📝 *Observación / Resumen:* ${documentObj.notes}` : null,
    ``,
    `🔗 *Puede visualizar o descargar su documento en el siguiente enlace oficial:*`,
    `${documentObj.fileUrl}`,
    ``,
    `🏥 *Sede de Atención:* ${doc.clinicAddress}`,
    `📞 *Central de Consultas:* ${doc.phone}`,
    ``,
    `_CENDO - Archivo Digital Clínico Seguro._`,
  ]
    .filter(Boolean)
    .join("\n");

  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${targetPhone}?text=${encodedText}`;
}

export function generateConsultationWhatsAppUrl(
  patient: Patient,
  cons: MedicalConsultation,
  doctor?: DoctorProfile | null
): string {
  const doc = doctor || INITIAL_DOCTOR;
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);

  const message = [
    `👋 *Estimada ${patient.firstName} ${patient.lastName}*,`,
    ``,
    `Le saluda el consultorio del *${doc.doctorTitle} ${doc.fullName}* (${doc.clinicName}).`,
    ``,
    `🩺 Le compartimos el resumen de su *Consulta Médica Ginecológica*:`,
    `🗓 *Fecha de Atención:* ${cons.consultationDate}`,
    `📋 *Motivo de Consulta:* ${cons.reasonForVisit}`,
    `🩺 *Diagnóstico:* ${cons.diagnosis}${cons.cie10Code ? ` (${cons.cie10Code})` : ""}`,
    ``,
    `📌 *Plan de Tratamiento / Indicaciones:*`,
    `${cons.treatmentPlan}`,
    ``,
    cons.nextAppointmentDate ? `🗓 *Próximo Control Recomendado:* ${cons.nextAppointmentDate}` : null,
    `🏥 *Sede:* ${doc.clinicAddress}`,
    `📞 *Citas y Consultas:* ${doc.phone}`,
    ``,
    `_CENDO - Centro Especializado de Endometriosis y Ginecología._`,
  ].filter(Boolean).join("\n");

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function generateUltrasoundWhatsAppUrl(
  patient: Patient,
  echo: UltrasoundReport,
  doctor?: DoctorProfile | null
): string {
  const doc = doctor || INITIAL_DOCTOR;
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);

  const typeLabels: Record<string, string> = {
    TRANSVAGINAL: "Ecografía Transvaginal",
    PELVICA: "Ecografía Pélvica",
    MAMA_BILATERAL: "Ecografía Mamaria Bilateral",
    OBSTETRICA_1T: "Ecografía Obstétrica 1er Trimestre",
    OBSTETRICA_2T_3T: "Ecografía Obstétrica de Detalle",
    DOPPLER: "Ecografía Doppler Especializada",
  };

  const message = [
    `👋 *Estimada ${patient.firstName} ${patient.lastName}*,`,
    ``,
    `Le saluda el consultorio del *${doc.doctorTitle} ${doc.fullName}* (${doc.clinicName}).`,
    ``,
    `📡 Le compartimos las conclusiones de su *${typeLabels[echo.ultrasoundType] || "Ecografía"}*:`,
    `🗓 *Fecha:* ${echo.reportDate}`,
    `📋 *Indicación:* ${echo.indication}`,
    `🩺 *Conclusión Diagnóstica:* ${echo.conclusion}`,
    echo.findings.biradsCategory ? `🏷 *Clasificación:* ${echo.findings.biradsCategory}` : null,
    echo.recommendations ? `📌 *Sugerencia / Plan:* ${echo.recommendations}` : null,
    ``,
    `🏥 *Sede:* ${doc.clinicAddress}`,
    `📞 *Citas:* ${doc.phone}`,
    ``,
    `_Conserve este reporte para su control ecográfico._`,
  ].filter(Boolean).join("\n");

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function generateMinorProcedureWhatsAppUrl(
  patient: Patient,
  proc: MinorProcedureReport,
  doctor?: DoctorProfile | null
): string {
  const doc = doctor || INITIAL_DOCTOR;
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);

  const message = [
    `👋 *Estimada ${patient.firstName} ${patient.lastName}*,`,
    ``,
    `Le saluda el consultorio del *${doc.doctorTitle} ${doc.fullName}* (${doc.clinicName}).`,
    ``,
    `🩺 Le compartimos el reporte e indicaciones post-procedimiento:`,
    `📋 *Procedimiento Realizado:* ${proc.procedureType.replace(/_/g, " ")}`,
    `🗓 *Fecha:* ${proc.procedureDate}`,
    `🩺 *Diagnóstico Post-Operatorio:* ${proc.postOpDiagnosis}`,
    proc.procedureDetails.specimenSentToPathology ? `🔬 *Muestra a Patología:* Enviada (${proc.procedureDetails.specimenDescription || "En estudio"})` : null,
    ``,
    `⚠️ *CUIDADOS E INDICACIONES POST-PROCEDIMIENTO:*`,
    `${proc.postOpIndications}`,
    proc.medicationsPrescribed ? `\n💊 *Medicamentos Indicados:*\n${proc.medicationsPrescribed}` : null,
    proc.nextControlDate ? `\n🗓 *Próximo Control en Consultorio:* ${proc.nextControlDate}` : null,
    ``,
    `🏥 *Sede de Atención:* ${doc.clinicAddress}`,
    `📞 *Emergencias / Consultas:* ${doc.phone}`,
    ``,
    `_CENDO - Compromiso con su bienestar y pronta recuperación._`,
  ].filter(Boolean).join("\n");

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function generateQuoteWhatsAppUrl(
  quote: ProcedureQuote,
  doctor?: DoctorProfile | null
): string {
  const doc = doctor || INITIAL_DOCTOR;
  const targetPhone = cleanPhoneForWhatsApp(quote.patientPhone);

  const itemsLines = quote.items.map(
    (item, idx) => `  ${idx + 1}. ${item.name} - S/ ${item.finalPrice.toFixed(2)}`
  ).join("\n");

  const message = [
    `👋 *Estimada ${quote.patientName}*,`,
    ``,
    `Le saluda el consultorio del *${doc.doctorTitle} ${doc.fullName}* (${doc.clinicName}).`,
    ``,
    `📑 Le compartimos el *Presupuesto Oficial* solicitado para su atención:`,
    `🗓 *Fecha de Emisión:* ${quote.quoteDate} (Vigencia: ${quote.validityDays} días)`,
    ``,
    `💼 *DETALLE DE PROCEDIMIENTOS:*`,
    itemsLines,
    ``,
    quote.discountTotal > 0 ? `🔹 *Subtotal:* S/ ${quote.subtotal.toFixed(2)}` : null,
    quote.discountTotal > 0 ? `🎁 *Descuento Especial:* -S/ ${quote.discountTotal.toFixed(2)}` : null,
    `💰 *TOTAL A PAGAR:* *S/ ${quote.total.toFixed(2)}*`,
    `💳 *Formas de Pago:* ${quote.paymentTerms}`,
    quote.notes ? `📝 *Observaciones:* ${quote.notes}` : null,
    ``,
    `🏥 *Sede:* ${doc.clinicAddress}`,
    `📞 *Para agendar o resolver consultas:* ${doc.phone}`,
    ``,
    `_CENDO - Presupuesto institucional garantizado._`,
  ].filter(Boolean).join("\n");

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function generateAppointmentReminderWhatsAppUrl(
  appt: MedicalAppointment,
  doctor?: DoctorProfile | null
): string {
  const doc = doctor || INITIAL_DOCTOR;
  const targetPhone = cleanPhoneForWhatsApp(appt.patientPhone);

  const typeLabels: Record<string, string> = {
    CONSULTA_PRIMERA_VEZ: "Consulta Ginecológica (Primera Vez)",
    CONTROL_GINECOLOGICO: "Control Ginecológico Periódico",
    CHEQUEO_INTEGRAL: "Chequeo Preventivo Integral CENDO",
    CONTROL_PRENATAL: "Control Prenatal (MINSA/CLAP)",
    COLPOSCOPIA: "Colposcopía Especializada",
    ECOGRAFIA: "Ecografía Especializada",
    PROCEDIMIENTO_MENOR: "Procedimiento Menor en Consultorio",
  };

  const message = [
    `👋 *Recordatorio de Cita Médica en CENDO*`,
    ``,
    `Estimada *${appt.patientName}*, le recordamos su próxima cita médica con el *${doc.doctorTitle} ${doc.fullName}*:`,
    ``,
    `🗓 *Fecha:* *${appt.appointmentDate}*`,
    `⏰ *Hora:* *${appt.appointmentTime}* (Duración aprox: ${appt.durationMinutes} min)`,
    `🩺 *Motivo / Especialidad:* ${typeLabels[appt.appointmentType] || appt.reason}`,
    `🏥 *Sede:* ${doc.clinicAddress}`,
    ``,
    `📅 *Añadir a su Calendario (Google / iPhone):*`,
    generateGoogleCalendarUrl(appt, doc),
    ``,
    `💡 *Recomendaciones para su atención:*`,
    `• Llegar con 10 minutos de anticipación.`,
    `• Portar DNI físico y exámenes médicos previos.`,
    `• Si no puede asistir, por favor avisar con 24h de anticipación.`,
    ``,
    `📞 *Confirmación o cambios:* ${doc.phone}`,
    ``,
    `_¡Le esperamos en CENDO para brindarle la mejor atención!_`,
  ].filter(Boolean).join("\n");

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}
