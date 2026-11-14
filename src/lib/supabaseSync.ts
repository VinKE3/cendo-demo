/**
 * CENDO - Sincronizador en Segundo Plano con Supabase
 * Permite sincronizar las operaciones CRUD (Pacientes, Colposcopía, Chequeos)
 * directamente con la base de datos PostgreSQL de Supabase en la nube.
 *
 * Principio Offline-First / Safe-Catch:
 * Las operaciones en la interfaz se resuelven en 0 ms gracias a Zustand.
 * En segundo plano se intenta persistir en Supabase. Si la red falla o la
 * tabla aún no existe, captura el error de forma silenciosa para que la
 * presentación médica nunca se interrumpa.
 */

import { createClient } from "@/lib/supabase/client";
import {
  Patient,
  ColposcopyReport,
  ClinicalCheckup,
  PatientBackground,
  MedicalPrescription,
  LabOrder,
  PrenatalCard,
  PatientDocument,
  MedicalConsultation,
  UltrasoundReport,
  MinorProcedureReport,
  ProcedureQuote,
  MedicalAppointment,
  WordHistoryDocument,
  DoctorProfile,
  DoctorRole,
} from "@/types/medical";

export function ensureUuid(id: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "00000000-0000-0000-0000-000000000000";
}

export function getPatientUuid(patientId: string, dni?: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(patientId)) {
    return patientId;
  }
  // 5 Nuevos Pacientes Oficiales
  if (dni === "73819204" || patientId === "pat-luciana-ramos") {
    return "10000000-0000-0000-0000-000000000001";
  }
  if (dni === "75294816" || patientId === "pat-fiorella-mendoza") {
    return "10000000-0000-0000-0000-000000000002";
  }
  if (dni === "71628493" || patientId === "pat-gabriela-paredes") {
    return "10000000-0000-0000-0000-000000000003";
  }
  if (dni === "74195820" || patientId === "pat-daniela-castro") {
    return "10000000-0000-0000-0000-000000000004";
  }
  if (dni === "09482715" || patientId === "pat-carmen-huaman") {
    return "10000000-0000-0000-0000-000000000005";
  }
  // Compatibilidad anterior
  if (dni === "72961954" || patientId === "pat-stephany-herrera") {
    return "11111111-1111-1111-1111-111111111111";
  }
  if (dni === "74829105" || patientId === "pat-camila-rossi") {
    return "22222222-2222-2222-2222-222222222222";
  }
  if (dni === "71948263" || patientId === "pat-valeria-alarcon") {
    return "33333333-3333-3333-3333-333333333333";
  }
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "00000000-0000-0000-0000-000000000000";
}

export async function syncPatientToSupabase(patient: Patient): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }

    const uuid = getPatientUuid(patient.id, patient.dni);

    const { error } = await supabase.from("patients").upsert(
      {
        id: uuid,
        dni: patient.dni,
        document_type: "DNI",
        document_number: patient.dni,
        first_name: patient.firstName,
        last_name: patient.lastName,
        full_name: `${(patient.lastName || "").trim().toUpperCase()}, ${(patient.firstName || "").trim().toUpperCase()}`,
        birth_date: patient.birthDate,
        phone: patient.phone || null,
        email: patient.email || null,
        address: patient.address || null,
        district: "Miraflores",
        civil_status: patient.civilStatus || null,
        occupation: patient.occupation || null,
        education_level: patient.educationLevel || null,
        birth_place: patient.birthPlace || null,
        religion: patient.religion || null,
        insurance_info: "Particular",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "dni" }
    );

    if (error) {
      console.warn("Aviso sync paciente Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function deletePatientFromSupabase(patientId: string, dni?: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(patientId);
    let query = supabase.from("patients").delete();

    if (isUuid) {
      query = query.eq("id", patientId);
    } else if (dni) {
      query = query.eq("document_number", dni);
    } else if (patientId === "pat-stephany-herrera") {
      query = query.eq("document_number", "72961954");
    } else if (patientId === "pat-camila-rossi") {
      query = query.eq("document_number", "74829105");
    } else if (patientId === "pat-valeria-alarcon") {
      query = query.eq("document_number", "71948263");
    } else {
      query = query.eq("id", patientId);
    }

    const { error } = await query;
    if (error) {
      console.warn("Aviso delete paciente Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function syncBackgroundToSupabase(bg: PatientBackground): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }

    const { error } = await supabase.from("patient_backgrounds").upsert(
      {
        id: bg.id,
        patient_id: bg.patientId,
        menarche: bg.menarche,
        sexual_debut_age: bg.sexualDebutAge,
        sexual_partners_count: bg.sexualPartnersCount,
        catamenial_regimen: bg.catamenialRegimen || null,
        sti_history: bg.stiHistory || null,
        obstetric_formula: bg.obstetricFormula,
        contraceptive_method: bg.contraceptiveMethod,
        last_menstrual_period: bg.lastMenstrualPeriod || null,
        pap_history: bg.papHistory,
        vph_test_history: bg.vphTestHistory,
        has_diabetes: bg.hasDiabetes || null,
        has_hypertension: bg.hasHypertension || null,
        has_asthma: bg.hasAsthma || null,
        medical_allergies: bg.medicalAllergies,
        surgeries_history: bg.surgeriesHistory,
        family_history: bg.familyHistory,
        other_pathologies: bg.otherPathologies || null,
        notes: bg.notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "patient_id" }
    );

    if (error) {
      console.warn("Aviso sync antecedentes Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function syncColposcopyToSupabase(report: ColposcopyReport): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }

    const { error } = await supabase.from("colposcopy_reports").upsert(
      {
        id: report.id,
        patient_id: report.patientId,
        report_date: report.reportDate,
        adequate_colposcopy: report.adequateColposcopy,
        squamocolumnar_junction_visible: report.squamocolumnarJunctionVisible,
        transformation_zone_type: report.transformationZoneType,
        mature_squamous_epithelium: report.matureSquamousEpithelium,
        ectopy: report.ectopy,
        thin_acetowhite_epithelium: report.thinAcetowhiteEpithelium,
        dense_acetowhite_epithelium: report.denseAcetowhiteEpithelium,
        irregular_border: report.irregularBorder,
        fine_mosaic: report.fineMosaic,
        coarse_mosaic: report.coarseMosaic,
        fine_punctation: report.finePunctation,
        coarse_punctation: report.coarsePunctation,
        atypical_vessels: report.atypicalVessels,
        schiller_test: report.schillerTest,
        cervical_biopsy_taken: report.cervicalBiopsyTaken,
        biopsy_clock_hours: report.biopsyClockHours || [],
        images: report.images || [],
        diagnosis: report.diagnosis,
        plan_recommendations: report.planRecommendations,
        cie10_code: report.cie10Code,
        doctor_name: report.doctorName,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("Aviso sync colposcopía Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function syncPrescriptionToSupabase(rec: MedicalPrescription): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }

    const patientUuid = getPatientUuid(rec.patientId);
    const recUuid = ensureUuid(rec.id);

    const { error } = await supabase.from("medical_prescriptions").upsert(
      {
        id: recUuid,
        patient_id: patientUuid,
        doctor_id: rec.doctorId,
        doctor_name: rec.doctorName,
        doctor_cmp: rec.doctorCmp,
        doctor_rne: rec.doctorRne || null,
        prescription_date: rec.prescriptionDate,
        diagnosis: rec.diagnosis,
        cie10_code: rec.cie10Code || null,
        items: rec.items,
        general_indications: rec.generalIndications || null,
        next_appointment_date: rec.nextAppointmentDate || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("Aviso sync receta Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function deletePrescriptionFromSupabase(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }
    const targetId = ensureUuid(id);
    const { error } = await supabase.from("medical_prescriptions").delete().eq("id", targetId);
    if (error) {
      console.warn("Aviso delete receta Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function syncLabOrderToSupabase(order: LabOrder): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }

    const patientUuid = getPatientUuid(order.patientId);
    const orderUuid = ensureUuid(order.id);

    const { error } = await supabase.from("lab_orders").upsert(
      {
        id: orderUuid,
        patient_id: patientUuid,
        doctor_id: order.doctorId,
        doctor_name: order.doctorName,
        doctor_cmp: order.doctorCmp,
        doctor_rne: order.doctorRne || null,
        order_date: order.orderDate,
        diagnosis: order.diagnosis,
        cie10_code: order.cie10Code || null,
        urgency: order.urgency,
        items: order.items,
        custom_tests: order.customTests || null,
        patient_instructions: order.patientInstructions || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("Aviso sync orden laboratorio Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteLabOrderFromSupabase(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }
    const targetId = ensureUuid(id);
    const { error } = await supabase.from("lab_orders").delete().eq("id", targetId);
    if (error) {
      console.warn("Aviso delete lab order Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function syncPrenatalCardToSupabase(card: PrenatalCard): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }

    const patientUuid = getPatientUuid(card.patientId);
    const cardUuid = ensureUuid(card.id);

    const { error } = await supabase.from("prenatal_cards").upsert(
      {
        id: cardUuid,
        patient_id: patientUuid,
        clinic_establishment: card.clinicEstablishment,
        attending_doctor_id: card.attendingDoctorId,
        attending_doctor_name: card.attendingDoctorName,
        baseline: card.baseline,
        visits: card.visits,
        maternal_pathologies: card.maternalPathologies,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("Aviso sync carnet prenatal Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function deletePrenatalCardFromSupabase(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }
    const targetId = ensureUuid(id);
    const { error } = await supabase.from("prenatal_cards").delete().eq("id", targetId);
    if (error) {
      console.warn("Aviso delete carnet prenatal Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// ETAPA B: REPOSITORIO DE DOCUMENTOS Y EXÁMENES EXTERNOS (PDF)
// ============================================================================

export async function uploadDocumentFileToStorage(
  file: File | Blob,
  patientId: string,
  fileName: string
): Promise<{ publicUrl: string; filePath: string } | null> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return null;
    }

    const patientUuid = getPatientUuid(patientId);
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueSuffix = Date.now();
    const filePath = `${patientUuid}/${uniqueSuffix}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from("lab-reports")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || "application/pdf",
      });

    if (error) {
      console.warn("Aviso upload document to storage:", error.message);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("lab-reports")
      .getPublicUrl(data.path);

    return {
      publicUrl: publicData.publicUrl,
      filePath: data.path,
    };
  } catch (err) {
    console.warn("Excepción al subir archivo a storage:", err);
    return null;
  }
}

export async function syncDocumentToSupabase(doc: PatientDocument): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }

    const patientUuid = getPatientUuid(doc.patientId);
    const docUuid = ensureUuid(doc.id);

    const { error } = await supabase.from("patient_documents").upsert(
      {
        id: docUuid,
        patient_id: patientUuid,
        document_type: doc.documentType,
        title: doc.title,
        file_url: doc.fileUrl,
        file_name: doc.fileName,
        file_size: doc.fileSize || null,
        mime_type: doc.mimeType || "application/pdf",
        notes: doc.notes || null,
        created_at: doc.createdAt || new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("Aviso sync patient document Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteDocumentFromSupabase(
  id: string,
  filePath?: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }

    const targetId = ensureUuid(id);

    if (filePath) {
      await supabase.storage.from("lab-reports").remove([filePath]);
    }

    const { error } = await supabase.from("patient_documents").delete().eq("id", targetId);
    if (error) {
      console.warn("Aviso delete patient document Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// ETAPAS B & C: CONSULTAS, ECOGRAFÍAS, PROCEDIMIENTOS, CITAS, COTIZACIONES & WORD
// ============================================================================

export async function syncConsultationToSupabase(cons: MedicalConsultation): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const patientUuid = getPatientUuid(cons.patientId);
    const consUuid = ensureUuid(cons.id);

    const { error } = await supabase.from("medical_consultations").upsert({
      id: consUuid,
      patient_id: patientUuid,
      doctor_id: cons.doctorId,
      doctor_name: cons.doctorName,
      doctor_cmp: cons.doctorCmp,
      doctor_rne: cons.doctorRne || null,
      consultation_date: cons.consultationDate,
      reason_for_visit: cons.reasonForVisit,
      illness_time: cons.illnessTime || null,
      symptoms: cons.symptoms || null,
      vital_signs: cons.vitalSigns,
      physical_exam: cons.physicalExam,
      diagnosis: cons.diagnosis,
      cie10_code: cons.cie10Code || null,
      treatment_plan: cons.treatmentPlan,
      auxiliary_exams: cons.auxiliaryExams || null,
      prescription_notes: cons.prescriptionNotes || null,
      next_appointment_date: cons.nextAppointmentDate || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    if (error) console.warn("Aviso sync consulta Supabase:", error.message);
    return !error;
  } catch { return false; }
}

export async function deleteConsultationFromSupabase(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const targetId = ensureUuid(id);
    const { error } = await supabase.from("medical_consultations").delete().eq("id", targetId);
    return !error;
  } catch { return false; }
}

export async function syncUltrasoundToSupabase(rep: UltrasoundReport): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const patientUuid = getPatientUuid(rep.patientId);
    const repUuid = ensureUuid(rep.id);

    const { error } = await supabase.from("ultrasound_reports").upsert({
      id: repUuid,
      patient_id: patientUuid,
      doctor_id: rep.doctorId,
      doctor_name: rep.doctorName,
      doctor_cmp: rep.doctorCmp,
      doctor_rne: rep.doctorRne || null,
      report_date: rep.reportDate,
      ultrasound_type: rep.ultrasoundType,
      indication: rep.indication,
      findings: rep.findings,
      conclusion: rep.conclusion,
      recommendations: rep.recommendations || null,
      images: rep.images,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    if (error) console.warn("Aviso sync ecografia Supabase:", error.message);
    return !error;
  } catch { return false; }
}

export async function deleteUltrasoundFromSupabase(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const targetId = ensureUuid(id);
    const { error } = await supabase.from("ultrasound_reports").delete().eq("id", targetId);
    return !error;
  } catch { return false; }
}

export async function syncMinorProcedureToSupabase(proc: MinorProcedureReport): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const patientUuid = getPatientUuid(proc.patientId);
    const procUuid = ensureUuid(proc.id);

    const { error } = await supabase.from("minor_procedures").upsert({
      id: procUuid,
      patient_id: patientUuid,
      doctor_id: proc.doctorId,
      doctor_name: proc.doctorName,
      doctor_cmp: proc.doctorCmp,
      doctor_rne: proc.doctorRne || null,
      procedure_date: proc.procedureDate,
      procedure_type: proc.procedureType,
      pre_op_diagnosis: proc.preOpDiagnosis,
      post_op_diagnosis: proc.postOpDiagnosis,
      cie10_code: proc.cie10Code || null,
      anesthesia_type: proc.anesthesiaType,
      procedure_details: proc.procedureDetails,
      post_op_indications: proc.postOpIndications,
      medications_prescribed: proc.medicationsPrescribed || null,
      next_control_date: proc.nextControlDate || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    if (error) console.warn("Aviso sync procedimiento Supabase:", error.message);
    return !error;
  } catch { return false; }
}

export async function deleteMinorProcedureFromSupabase(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const targetId = ensureUuid(id);
    const { error } = await supabase.from("minor_procedures").delete().eq("id", targetId);
    return !error;
  } catch { return false; }
}

export async function syncAppointmentToSupabase(appt: MedicalAppointment): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const patientUuid = getPatientUuid(appt.patientId);
    const apptUuid = ensureUuid(appt.id);

    const { error } = await supabase.from("medical_appointments").upsert({
      id: apptUuid,
      patient_id: patientUuid,
      doctor_id: appt.doctorId,
      doctor_name: appt.doctorName,
      appointment_date: appt.appointmentDate,
      appointment_time: appt.appointmentTime,
      duration_minutes: appt.durationMinutes,
      appointment_type: appt.appointmentType,
      reason: appt.reason,
      status: appt.status,
      notes: appt.notes || null,
      reminder_sent: appt.reminderSent,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    if (error) console.warn("Aviso sync cita Supabase:", error.message);
    return !error;
  } catch { return false; }
}

export async function deleteAppointmentFromSupabase(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const targetId = ensureUuid(id);
    const { error } = await supabase.from("medical_appointments").delete().eq("id", targetId);
    return !error;
  } catch { return false; }
}

export async function syncQuoteToSupabase(q: ProcedureQuote): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const patientUuid = getPatientUuid(q.patientId);
    const qUuid = ensureUuid(q.id);

    const { error } = await supabase.from("procedure_quotes").upsert({
      id: qUuid,
      patient_id: patientUuid,
      doctor_id: q.doctorId,
      doctor_name: q.doctorName,
      quote_date: q.quoteDate,
      validity_days: q.validityDays,
      items: q.items,
      subtotal: q.subtotal,
      discount_total: q.discountTotal,
      total: q.total,
      payment_terms: q.paymentTerms,
      notes: q.notes || null,
    }, { onConflict: "id" });

    if (error) console.warn("Aviso sync cotizacion Supabase:", error.message);
    return !error;
  } catch { return false; }
}

export async function deleteQuoteFromSupabase(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const targetId = ensureUuid(id);
    const { error } = await supabase.from("procedure_quotes").delete().eq("id", targetId);
    return !error;
  } catch { return false; }
}

export async function syncWordHistoryToSupabase(doc: WordHistoryDocument): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const patientUuid = getPatientUuid(doc.patientId);
    const docUuid = ensureUuid(doc.id);

    const { error } = await supabase.from("word_history_documents").upsert({
      id: docUuid,
      patient_id: patientUuid,
      file_name: doc.fileName,
      file_size: doc.fileSize,
      file_url: doc.fileUrl,
      extracted_text: doc.extractedText || null,
      notes: doc.notes || null,
      created_at: doc.createdAt,
    }, { onConflict: "id" });

    if (error) console.warn("Aviso sync word doc Supabase:", error.message);
    return !error;
  } catch { return false; }
}

export async function deleteWordHistoryFromSupabase(id: string, filePath?: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const targetId = ensureUuid(id);
    if (filePath) {
      await supabase.storage.from("lab-reports").remove([filePath]);
    }
    const { error } = await supabase.from("word_history_documents").delete().eq("id", targetId);
    return !error;
  } catch { return false; }
}

// ============================================================================
// SINCRONIZACIÓN PROFESIONAL DE PERFILES MÉDICOS Y CONTRASEÑAS (PROFILES)
// ============================================================================

export function profileRowToDoctorProfile(row: any): DoctorProfile {
  return {
    id: row.id || ensureUuid(""),
    email: row.email,
    password: row.password || "Cendo123",
    fullName: row.full_name || "Médico Especialista",
    doctorTitle: row.doctor_title || "Dr.",
    specialty: row.specialty || "Ginecología y Obstetricia",
    cmp: row.cmp || "",
    rne: row.rne || "",
    clinicName: row.clinic_name || "CENDO - Centro de Endometriosis y Ginecología",
    clinicAddress: row.clinic_address || "Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima",
    phone: row.phone || "985 945 697",
    contactEmail: row.contact_email || row.email,
    avatarUrl: row.avatar_url || "",
    signatureUrl: row.signature_url || "",
    role: (row.role as DoctorRole) || "doctor",
    isActive: row.is_active !== false,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function doctorProfileToProfileRow(doc: DoctorProfile): any {
  return {
    email: doc.email.trim().toLowerCase(),
    full_name: doc.fullName,
    doctor_title: doc.doctorTitle || "Dr.",
    specialty: doc.specialty,
    cmp: doc.cmp,
    rne: doc.rne,
    clinic_name: doc.clinicName || "CENDO - Centro de Endometriosis y Ginecología",
    clinic_address: doc.clinicAddress || "Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima",
    phone: doc.phone || "985 945 697",
    contact_email: doc.contactEmail || doc.email,
    avatar_url: doc.avatarUrl || null,
    signature_url: doc.signatureUrl || null,
    role: doc.role || "doctor",
    password: doc.password || "Cendo123",
    is_active: doc.isActive !== false,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchDoctorsFromSupabase(): Promise<DoctorProfile[] | null> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return null;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return null;
    }
    return data.map(profileRowToDoctorProfile);
  } catch (err) {
    console.error("fetchDoctorsFromSupabase error:", err);
    return null;
  }
}

export async function syncDoctorProfileToSupabase(doc: DoctorProfile): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }
    const payload = doctorProfileToProfileRow(doc);
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doc.id)) {
      payload.id = doc.id;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "email" });

    if (error) {
      console.warn("Aviso sync doctor Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function syncDoctorPasswordToSupabase(emailOrId: string, newPassword: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }
    const clean = emailOrId.trim();
    const query = clean.includes("@")
      ? supabase.from("profiles").update({ password: newPassword.trim(), updated_at: new Date().toISOString() }).ilike("email", clean.toLowerCase())
      : supabase.from("profiles").update({ password: newPassword.trim(), updated_at: new Date().toISOString() }).eq("id", clean);

    const { error } = await query;
    if (error) {
      console.warn("Aviso sync password Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteDoctorFromSupabase(emailOrId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }
    const clean = emailOrId.trim();
    const query = clean.includes("@")
      ? supabase.from("profiles").delete().ilike("email", clean.toLowerCase())
      : supabase.from("profiles").delete().eq("id", clean);

    const { error } = await query;
    return !error;
  } catch {
    return false;
  }
}

export async function authenticateWithSupabase(
  email: string,
  password?: string
): Promise<{ success: boolean; doctor?: DoctorProfile; error?: string }> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return { success: false, error: "Base de datos no configurada." };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (error) {
      console.warn("Aviso authenticateWithSupabase:", error.message);
      return { success: false, error: `Error de conexión: ${error.message}` };
    }

    if (!data) {
      return {
        success: false,
        error: "El correo electrónico no se encuentra registrado en el sistema CENDO.",
      };
    }

    const doctor = profileRowToDoctorProfile(data);

    if (!doctor.isActive) {
      return {
        success: false,
        error: "Esta cuenta médica se encuentra inactiva. Contacte al Director Médico (Dr. Patrick Jacinto).",
      };
    }

    // Comparar contra la clave almacenada en la base de datos PostgreSQL
    const expectedPassword = (data.password || "Cendo123").trim();
    if (cleanPassword !== expectedPassword) {
      return {
        success: false,
        error: "Contraseña incorrecta. Verifique sus credenciales institucionales.",
      };
    }

    return { success: true, doctor };
  } catch (err: any) {
    console.error("authenticateWithSupabase catch:", err);
    return { success: false, error: err.message || "Error al autenticar." };
  }
}
