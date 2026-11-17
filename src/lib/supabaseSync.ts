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
  ProcedureTariff,
  MedicationVademecum,
} from "@/types/medical";
import {
  saveColposcopyReportToSupabase,
  deleteColposcopyReportFromSupabase,
} from "@/modules/colposcopia";
import {
  saveUltrasoundReportToSupabase,
  deleteUltrasoundReportFromSupabase,
} from "@/modules/ecografias";
import {
  saveMinorProcedureToSupabase,
  deleteMinorProcedureFromSupabase as deleteMinorProcedureService,
} from "@/modules/procedimientos";
import {
  savePrenatalCard,
  deletePrenatalCard as deletePrenatalCardService,
} from "@/modules/prenatal";
import {
  saveDocumentToSupabase as saveDocumentService,
  deleteDocumentFromSupabase as deleteDocumentService,
  saveWordHistoryToSupabase as saveWordHistoryService,
  deleteWordHistoryFromSupabase as deleteWordHistoryService,
} from "@/modules/documentos";
import { calculateAge } from "@/lib/utils";

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

    const cleanBirthDate = patient.birthDate
      ? (patient.birthDate.match(/\d{4}-\d{2}-\d{2}/)?.[0] || null)
      : null;

    const { error } = await supabase.from("patients").upsert(
      {
        id: uuid,
        dni: patient.dni,
        document_type: "DNI",
        document_number: patient.dni,
        first_name: patient.firstName,
        last_name: patient.lastName,
        full_name: `${(patient.lastName || "").trim().toUpperCase()}, ${(patient.firstName || "").trim().toUpperCase()}`,
        birth_date: cleanBirthDate,
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
      { onConflict: "id" }
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

    const patientUuid = getPatientUuid(bg.patientId);
    const bgUuid = ensureUuid(bg.id);
    const cleanLmp = bg.lastMenstrualPeriod ? (bg.lastMenstrualPeriod.match(/\d{4}-\d{2}-\d{2}/)?.[0] || null) : null;

    const { error } = await supabase.from("patient_backgrounds").upsert(
      {
        id: bgUuid,
        patient_id: patientUuid,
        menarche: bg.menarche,
        sexual_debut_age: bg.sexualDebutAge,
        sexual_partners_count: bg.sexualPartnersCount,
        catamenial_regimen: bg.catamenialRegimen || null,
        sti_history: bg.stiHistory || null,
        obstetric_formula: bg.obstetricFormula,
        contraceptive_method: bg.contraceptiveMethod,
        last_menstrual_period: cleanLmp,
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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }
    const res = await saveColposcopyReportToSupabase(report);
    return res.success;
  } catch (err) {
    console.warn("Aviso sync colposcopía Supabase:", err);
    return false;
  }
}

export async function deleteColposcopyFromSupabase(id: string): Promise<boolean> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }
    const res = await deleteColposcopyReportFromSupabase(id);
    return res.success;
  } catch {
    return false;
  }
}

export async function syncCheckupToSupabase(checkup: ClinicalCheckup): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const patientUuid = getPatientUuid(checkup.patientId);
    const checkupUuid = ensureUuid(checkup.id);
    const cleanDate = checkup.checkupDate ? (checkup.checkupDate.match(/\d{4}-\d{2}-\d{2}/)?.[0] || new Date().toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from("clinical_checkups").upsert({
      id: checkupUuid,
      patient_id: patientUuid,
      checkup_date: cleanDate,
      reason_for_consultation: checkup.reasonForConsultation,
      breast_ultrasound_findings: checkup.breastUltrasoundFindings,
      breast_ultrasound_birads: checkup.breastUltrasoundBirads,
      breast_lesion_measurements: checkup.breastLesionMeasurements,
      transvaginal_ultrasound_findings: checkup.transvaginalUltrasoundFindings,
      uterus_measurements: checkup.uterusMeasurements,
      endometrium_thickness_mm: checkup.endometriumThicknessMm,
      ovaries_findings: checkup.ovariesFindings,
      pap_result: checkup.papResult,
      vph_result: checkup.vphResult,
      conclusions: checkup.conclusions,
      medical_prescription: checkup.medicalPrescription,
    }, { onConflict: "id" });

    if (error) console.warn("Aviso sync chequeo Supabase:", error.message);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteCheckupFromSupabase(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const targetId = ensureUuid(id);
    const { error } = await supabase.from("clinical_checkups").delete().eq("id", targetId);
    return !error;
  } catch {
    return false;
  }
}

export async function syncTariffToSupabase(tariff: ProcedureTariff): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const tariffUuid = ensureUuid(tariff.id);

    const { error } = await supabase.from("procedures_tariff").upsert({
      id: tariffUuid,
      code: tariff.code,
      name: tariff.name,
      category: tariff.category,
      description: tariff.description,
      price: tariff.price,
      active: tariff.active,
    }, { onConflict: "code" });

    if (error) console.warn("Aviso sync tarifario Supabase:", error.message);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteTariffFromSupabase(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const targetId = ensureUuid(id);
    const { error } = await supabase.from("procedures_tariff").delete().eq("id", targetId);
    return !error;
  } catch {
    return false;
  }
}

export async function syncVademecumToSupabase(item: MedicationVademecum): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const itemUuid = ensureUuid(item.id);

    const { error } = await supabase.from("medications_vademecum").upsert({
      id: itemUuid,
      generic_name: item.genericName,
      atc_code: item.atcCode || null,
      therapeutic_group: item.therapeuticGroup,
      commercial_brands: item.commercialBrands || [],
      indications: item.indications,
      contraindications: item.contraindications,
    }, { onConflict: "id" });

    if (error) console.warn("Aviso sync vademecum Supabase:", error.message);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteVademecumFromSupabase(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const targetId = ensureUuid(id);
    const { error } = await supabase.from("medications_vademecum").delete().eq("id", targetId);
    return !error;
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

    let customTestsString = order.customTests || null;
    if (order.templateType || order.specimenDetails || order.templateTitle) {
      const meta = {
        templateType: order.templateType,
        templateTitle: order.templateTitle,
        specimenDetails: order.specimenDetails,
        originalCustomTests: order.customTests || null,
      };
      customTestsString = `__METADATA__:${JSON.stringify(meta)}`;
    }

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
        custom_tests: customTestsString,
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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }
    const patientUuid = getPatientUuid(card.patientId);
    await savePrenatalCard({
      ...card,
      patientId: patientUuid,
    });
    return true;
  } catch (error: any) {
    console.warn("Aviso sync carnet prenatal Supabase:", error?.message);
    return false;
  }
}

export async function deletePrenatalCardFromSupabase(id: string): Promise<boolean> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }
    return await deletePrenatalCardService(id);
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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }
    const patientUuid = getPatientUuid(doc.patientId);
    await saveDocumentService({
      ...doc,
      patientId: patientUuid,
    });
    return true;
  } catch (error: any) {
    console.warn("Aviso sync patient document Supabase:", error?.message);
    return false;
  }
}

export async function deleteDocumentFromSupabase(
  id: string,
  filePath?: string
): Promise<boolean> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }
    return await deleteDocumentService(id, filePath);
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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const res = await saveUltrasoundReportToSupabase(rep);
    return res.success;
  } catch (err) {
    console.warn("Aviso sync ecografia Supabase:", err);
    return false;
  }
}

export async function deleteUltrasoundFromSupabase(id: string): Promise<boolean> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const res = await deleteUltrasoundReportFromSupabase(id);
    return res.success;
  } catch {
    return false;
  }
}

export async function syncMinorProcedureToSupabase(proc: MinorProcedureReport): Promise<boolean> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const res = await saveMinorProcedureToSupabase(proc);
    return res.success;
  } catch (err) {
    console.warn("Aviso sync procedimiento Supabase:", err);
    return false;
  }
}

export async function deleteMinorProcedureFromSupabase(id: string): Promise<boolean> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const res = await deleteMinorProcedureService(id);
    return res.success;
  } catch {
    return false;
  }
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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    const patientUuid = getPatientUuid(doc.patientId);
    await saveWordHistoryService({
      ...doc,
      patientId: patientUuid,
    });
    return true;
  } catch (error: any) {
    console.warn("Aviso sync word doc Supabase:", error?.message);
    return false;
  }
}

export async function deleteWordHistoryFromSupabase(id: string, filePath?: string): Promise<boolean> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") return false;
    return await deleteWordHistoryService(id, filePath);
  } catch {
    return false;
  }
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

// ============================================================================
// CARGA Y SINCRONIZACIÓN COMPLETA DESDE LA NUBE (17 TABLAS EN SUPABASE)
// ============================================================================

export interface AllSupabaseData {
  doctors?: DoctorProfile[];
  patients?: Patient[];
  patientBackgrounds?: Record<string, PatientBackground>;
  consultations?: MedicalConsultation[];
  ultrasoundReports?: UltrasoundReport[];
  colposcopyReports?: ColposcopyReport[];
  clinicalCheckups?: ClinicalCheckup[];
  minorProcedures?: MinorProcedureReport[];
  prescriptions?: MedicalPrescription[];
  labOrders?: LabOrder[];
  prenatalCards?: PrenatalCard[];
  patientDocuments?: PatientDocument[];
  procedureQuotes?: ProcedureQuote[];
  appointments?: MedicalAppointment[];
  wordHistories?: WordHistoryDocument[];
  proceduresTariff?: ProcedureTariff[];
  medicationsVademecum?: MedicationVademecum[];
}

export async function fetchAllDataFromSupabase(): Promise<AllSupabaseData | null> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return null;
    }

    const [
      doctorsRes,
      patientsRes,
      backgroundsRes,
      consultationsRes,
      ultrasoundsRes,
      colposcopyRes,
      checkupsRes,
      prescriptionsRes,
      labOrdersRes,
      prenatalCardsRes,
      documentsRes,
      minorProceduresRes,
      quotesRes,
      appointmentsRes,
      wordHistoriesRes,
      tariffsRes,
      vademecumRes,
    ] = await Promise.allSettled([
      supabase.from("profiles").select("*").order("created_at", { ascending: true }),
      supabase.from("patients").select("*").order("created_at", { ascending: false }),
      supabase.from("patient_backgrounds").select("*"),
      supabase.from("medical_consultations").select("*").order("consultation_date", { ascending: false }),
      supabase.from("ultrasound_reports").select("*").order("report_date", { ascending: false }),
      supabase.from("colposcopy_reports").select("*").order("report_date", { ascending: false }),
      supabase.from("clinical_checkups").select("*").order("checkup_date", { ascending: false }),
      supabase.from("medical_prescriptions").select("*").order("prescription_date", { ascending: false }),
      supabase.from("lab_orders").select("*").order("order_date", { ascending: false }),
      supabase.from("prenatal_cards").select("*").order("created_at", { ascending: false }),
      supabase.from("patient_documents").select("*").order("created_at", { ascending: false }),
      supabase.from("minor_procedures").select("*").order("procedure_date", { ascending: false }),
      supabase.from("procedure_quotes").select("*").order("quote_date", { ascending: false }),
      supabase.from("medical_appointments").select("*").order("appointment_date", { ascending: false }),
      supabase.from("word_history_documents").select("*").order("created_at", { ascending: false }),
      supabase.from("procedures_tariff").select("*").order("code", { ascending: true }),
      supabase.from("medications_vademecum").select("*").order("generic_name", { ascending: true }),
    ]);

    const result: AllSupabaseData = {};

    // 1. Doctors
    if (doctorsRes.status === "fulfilled" && doctorsRes.value.data && doctorsRes.value.data.length > 0) {
      result.doctors = doctorsRes.value.data.map(profileRowToDoctorProfile);
    }

    // 2. Patients
    const patientLookup = new Map<string, { fullName: string; dni: string; phone: string }>();
    if (patientsRes.status === "fulfilled" && patientsRes.value.data) {
      result.patients = patientsRes.value.data.map((row: any) => {
        const birthDate = row.birth_date ? String(row.birth_date).slice(0, 10) : "";
        const rawAge = Number(row.age);
        const computedAge = (rawAge && rawAge > 0) ? rawAge : (birthDate ? calculateAge(birthDate) : 25);

        const p: Patient = {
          id: row.id,
          dni: row.dni || row.document_number || "",
          firstName: row.first_name || (row.full_name ? row.full_name.split(",")[1]?.trim() : "") || "",
          lastName: row.last_name || (row.full_name ? row.full_name.split(",")[0]?.trim() : "") || "",
          birthDate,
          age: computedAge,
          phone: row.phone || "",
          email: row.email || "",
          address: row.address || "",
          civilStatus: row.civil_status || "Soltera",
          occupation: row.occupation || "Profesional independiente",
          educationLevel: row.education_level || "Superior Universitaria Completa",
          birthPlace: row.birth_place || "Lima, Perú",
          religion: row.religion || "Católica",
          insuranceInfo: row.insurance_info || "Particular",
          createdAt: row.created_at || new Date().toISOString(),
          updatedAt: row.updated_at || new Date().toISOString(),
        };
        const fullName = `${p.lastName}, ${p.firstName}`.trim();
        patientLookup.set(p.id, { fullName, dni: p.dni, phone: p.phone });
        if (p.dni) {
          patientLookup.set(p.dni, { fullName, dni: p.dni, phone: p.phone });
        }
        return p;
      });
    }

    // 3. Backgrounds
    if (backgroundsRes.status === "fulfilled" && backgroundsRes.value.data) {
      const bgs: Record<string, PatientBackground> = {};
      backgroundsRes.value.data.forEach((row: any) => {
        const bg: PatientBackground = {
          id: row.id,
          patientId: row.patient_id,
          menarche: row.menarche != null ? Number(row.menarche) : undefined,
          sexualDebutAge: row.sexual_debut_age != null ? Number(row.sexual_debut_age) : undefined,
          sexualPartnersCount: row.sexual_partners_count != null ? Number(row.sexual_partners_count) : undefined,
          catamenialRegimen: row.catamenial_regimen || "28/4",
          stiHistory: row.sti_history || "Niega ITS",
          obstetricFormula: row.obstetric_formula || "G0 P0000",
          contraceptiveMethod: row.contraceptive_method || "Ninguno",
          lastMenstrualPeriod: row.last_menstrual_period ? String(row.last_menstrual_period).slice(0, 10) : "",
          papHistory: row.pap_history || "Sin antecedentes",
          vphTestHistory: row.vph_test_history || "Sin antecedentes",
          hasDiabetes: row.has_diabetes || "Niega",
          hasHypertension: row.has_hypertension || "Niega",
          hasAsthma: row.has_asthma || "Niega",
          medicalAllergies: row.medical_allergies || "Niega alergias medicamentosas",
          surgeriesHistory: row.surgeries_history || "Niega cirugías previas",
          familyHistory: row.family_history || "Sin antecedentes familiares de relevancia",
          otherPathologies: row.other_pathologies || undefined,
          notes: row.notes || undefined,
          updatedAt: row.updated_at || new Date().toISOString(),
        };
        bgs[row.patient_id] = bg;
      });
      result.patientBackgrounds = bgs;
    }

    // 4. Consultations
    if (consultationsRes.status === "fulfilled" && consultationsRes.value.data) {
      result.consultations = consultationsRes.value.data.map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        doctorId: row.doctor_id || "doc-patrick-jacinto",
        doctorName: row.doctor_name || "Dr. Patrick Jacinto Gomero",
        doctorCmp: row.doctor_cmp || "61693",
        doctorRne: row.doctor_rne || undefined,
        consultationDate: row.consultation_date ? String(row.consultation_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
        reasonForVisit: row.reason_for_visit || "",
        illnessTime: row.illness_time || undefined,
        symptoms: row.symptoms || undefined,
        vitalSigns: typeof row.vital_signs === "string" ? JSON.parse(row.vital_signs) : (row.vital_signs || {
          bloodPressure: "110/70",
          heartRate: 72,
          temperature: 36.5,
          weightKg: 60,
          heightCm: 160,
          bmi: 23.4,
        }),
        physicalExam: typeof row.physical_exam === "string" ? JSON.parse(row.physical_exam) : (row.physical_exam || {
          generalExam: "Buen estado general.",
          breastsExam: "Sin nódulos palpables.",
          externalGenitalia: "Normal.",
          speculoscopy: "Cérvix eutrófico.",
          bimanualPalpation: "Útero de tamaño conservado.",
        }),
        diagnosis: row.diagnosis || "",
        cie10Code: row.cie10_code || undefined,
        treatmentPlan: row.treatment_plan || "",
        auxiliaryExams: row.auxiliary_exams || undefined,
        prescriptionNotes: row.prescription_notes || undefined,
        nextAppointmentDate: row.next_appointment_date ? String(row.next_appointment_date).slice(0, 10) : undefined,
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));
    }

    // 5. Ultrasounds
    if (ultrasoundsRes.status === "fulfilled" && ultrasoundsRes.value.data) {
      result.ultrasoundReports = ultrasoundsRes.value.data.map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        doctorId: row.doctor_id || "doc-patrick-jacinto",
        doctorName: row.doctor_name || "Dr. Patrick Jacinto Gomero",
        doctorCmp: row.doctor_cmp || "61693",
        doctorRne: row.doctor_rne || undefined,
        reportDate: row.report_date ? String(row.report_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
        ultrasoundType: row.ultrasound_type || "TRANSVAGINAL",
        indication: row.indication || "",
        findings: typeof row.findings === "string" ? JSON.parse(row.findings) : (row.findings || {}),
        conclusion: row.conclusion || "",
        recommendations: row.recommendations || undefined,
        images: Array.isArray(row.images) ? row.images : (typeof row.images === "string" ? JSON.parse(row.images) : []),
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));
    }

    // 6. Colposcopy
    if (colposcopyRes.status === "fulfilled" && colposcopyRes.value.data) {
      result.colposcopyReports = colposcopyRes.value.data.map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        reportDate: row.report_date ? String(row.report_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
        adequateColposcopy: row.adequate_colposcopy !== false,
        inadequateReason: row.inadequate_reason || undefined,
        squamocolumnarJunctionVisible: row.squamocolumnar_junction_visible || "Visible",
        transformationZoneType: row.transformation_zone_type || "Tipo 1",
        matureSquamousEpithelium: !!row.mature_squamous_epithelium,
        ectopy: !!row.ectopy,
        nabothCyst: !!row.naboth_cyst,
        cryptOpenings: !!row.crypt_openings,
        deciduosis: !!row.deciduosis,
        thinAcetowhiteEpithelium: !!row.thin_acetowhite_epithelium,
        denseAcetowhiteEpithelium: !!row.dense_acetowhite_epithelium,
        rapidAcetowhite: !!row.rapid_acetowhite,
        thickenedGlands: !!row.thickened_glands,
        irregularBorder: !!row.irregular_border,
        fineMosaic: !!row.fine_mosaic,
        coarseMosaic: !!row.coarse_mosaic,
        finePunctation: !!row.fine_punctation,
        coarsePunctation: !!row.coarse_punctation,
        sharpBorders: !!row.sharp_borders,
        innerBorderSign: !!row.inner_border_sign,
        ridgeSign: !!row.ridge_sign,
        leukoplakia: !!row.leukoplakia,
        erosion: !!row.erosion,
        atypicalVessels: !!row.atypical_vessels,
        fragileVessels: !!row.fragile_vessels,
        irregularSurface: !!row.irregular_surface,
        exophyticLesion: !!row.exophytic_lesion,
        necrosis: !!row.necrosis,
        nodularTumor: !!row.nodular_tumor,
        congenitalTZ: !!row.congenital_tz,
        condyloma: !!row.condyloma,
        polyp: !!row.polyp,
        inflammation: !!row.inflammation,
        stenosis: !!row.stenosis,
        postTreatmentAnomaly: !!row.post_treatment_anomaly,
        endometriosisFoci: !!row.endometriosis_foci,
        otherFindings: row.other_findings || undefined,
        schillerTest: row.schiller_test || "Negativo (Lugol Caoba)",
        cervicalBiopsyTaken: !!row.cervical_biopsy_taken,
        biopsyClockHours: Array.isArray(row.biopsy_clock_hours) ? row.biopsy_clock_hours : (typeof row.biopsy_clock_hours === "string" ? JSON.parse(row.biopsy_clock_hours) : []),
        images: Array.isArray(row.images) ? row.images : (typeof row.images === "string" ? JSON.parse(row.images) : []),
        diagnosis: row.diagnosis || "",
        planRecommendations: row.plan_recommendations || "",
        cie10Code: row.cie10_code || "N87.9",
        doctorName: row.doctor_name || "Dr. Patrick Jacinto Gomero",
        createdAt: row.created_at || new Date().toISOString(),
      }));
    }

    // 7. Clinical Checkups
    if (checkupsRes.status === "fulfilled" && checkupsRes.value.data) {
      result.clinicalCheckups = checkupsRes.value.data.map((row: any) => {
        const tv = typeof row.tv_ultrasound === "object" ? row.tv_ultrasound : {};
        const breast = typeof row.breast_ultrasound === "object" ? row.breast_ultrasound : {};
        const exam = typeof row.clinical_exam === "object" ? row.clinical_exam : {};

        return {
          id: row.id,
          patientId: row.patient_id,
          checkupDate: row.checkup_date ? String(row.checkup_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
          reasonForConsultation: row.reason_for_consultation || row.motive || row.referred_symptoms || "Chequeo ginecológico y mamario preventivo anual",
          breastUltrasoundFindings: row.breast_ultrasound_findings || (Array.isArray(breast.conclusions) ? breast.conclusions.join(". ") : "") || "Parénquima mamario homogéneo sin nódulos sólidos ni quísticos sospechosos.",
          breastUltrasoundBirads: row.breast_ultrasound_birads || (breast.birads ? `BI-RADS ${breast.birads}` : "BI-RADS 1 (Normal)"),
          breastLesionMeasurements: row.breast_lesion_measurements || "Sin lesiones focales",
          transvaginalUltrasoundFindings: row.transvaginal_ultrasound_findings || (Array.isArray(tv.conclusions) ? tv.conclusions.join(". ") : "") || "Útero y anexos de características ecográficas conservadas.",
          uterusMeasurements: row.uterus_measurements || tv.uterus_dimensions || "65 x 35 x 42 mm (Vol: 50 cc)",
          endometriumThicknessMm: Number(row.endometrium_thickness_mm) || Number(tv.endometrium_mm) || 5.0,
          ovariesFindings: row.ovaries_findings || (tv.right_ovary_dim ? `Ovario derecho ${tv.right_ovary_dim}. Ovario izquierdo ${tv.left_ovary_dim || "normal"}.` : "Ovarios con folículos antrales fisiológicos normales."),
          colposcopyFindings: row.colposcopy_findings || (exam.colposcopia ? (typeof exam.colposcopia === "string" ? exam.colposcopia : JSON.stringify(exam.colposcopia)) : "Colposcopía satisfactoria adecuada. Zona de transformación Tipo 1. Test de Schiller negativo (Lugol caoba homogéneo)."),
          colposcopyResult: row.colposcopy_result || "Normal / Sin lesión intraepitelial",
          papResult: row.pap_result || "Normal (Negativo para lesión intraepitelial o malignidad)",
          vphResult: row.vph_result || "Negativo para 23 genotipos de alto y bajo riesgo",
          conclusions: row.conclusions || row.recommendations || "Chequeo ginecológico y mamario preventivo dentro de límites normales. Control anual rutinario.",
          medicalPrescription: row.medical_prescription || "1. Control preventivo anual.\n2. Estilo de vida saludable.",
          createdAt: row.created_at || new Date().toISOString(),
        };
      });
    }

    // 8. Minor Procedures
    if (minorProceduresRes.status === "fulfilled" && minorProceduresRes.value.data) {
      result.minorProcedures = minorProceduresRes.value.data.map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        doctorId: row.doctor_id || "doc-patrick-jacinto",
        doctorName: row.doctor_name || "Dr. Patrick Jacinto Gomero",
        doctorCmp: row.doctor_cmp || "61693",
        doctorRne: row.doctor_rne || undefined,
        procedureDate: row.procedure_date ? String(row.procedure_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
        procedureType: row.procedure_type || "BIOPSIA_CERVICAL",
        preOpDiagnosis: row.pre_op_diagnosis || "",
        postOpDiagnosis: row.post_op_diagnosis || "",
        cie10Code: row.cie10_code || undefined,
        anesthesiaType: row.anesthesia_type || "Local (Lidocaína 2%)",
        procedureDetails: typeof row.procedure_details === "string" ? JSON.parse(row.procedure_details) : (row.procedure_details || {
          asepsisTechnique: "Asepsia y antisepsia con povidona yodada.",
          specimenSentToPathology: true,
          bleedingAmount: "Mínimo (< 10 ml)",
          hemostasisMethod: "Solución de Monsel",
          complications: "Sin complicaciones.",
        }),
        postOpIndications: row.post_op_indications || "",
        medicationsPrescribed: row.medications_prescribed || undefined,
        nextControlDate: row.next_control_date ? String(row.next_control_date).slice(0, 10) : undefined,
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));
    }

    // 9. Prescriptions
    if (prescriptionsRes.status === "fulfilled" && prescriptionsRes.value.data) {
      result.prescriptions = prescriptionsRes.value.data.map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        doctorId: row.doctor_id || "doc-patrick-jacinto",
        doctorName: row.doctor_name || "Dr. Patrick Jacinto Gomero",
        doctorCmp: row.doctor_cmp || "61693",
        doctorRne: row.doctor_rne || "",
        prescriptionDate: row.prescription_date ? String(row.prescription_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
        diagnosis: row.diagnosis || "",
        cie10Code: row.cie10_code || undefined,
        items: Array.isArray(row.items) ? row.items : (typeof row.items === "string" ? JSON.parse(row.items) : []),
        generalIndications: row.general_indications || undefined,
        nextAppointmentDate: row.next_appointment_date ? String(row.next_appointment_date).slice(0, 10) : undefined,
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));
    }

    // 10. Lab Orders
    if (labOrdersRes.status === "fulfilled" && labOrdersRes.value.data) {
      result.labOrders = labOrdersRes.value.data.map((row: any) => {
        let templateType = undefined;
        let templateTitle = undefined;
        let specimenDetails = undefined;
        let customTests = row.custom_tests || undefined;

        if (row.custom_tests && String(row.custom_tests).startsWith("__METADATA__:")) {
          try {
            const parsed = JSON.parse(String(row.custom_tests).slice(13));
            templateType = parsed.templateType;
            templateTitle = parsed.templateTitle;
            specimenDetails = parsed.specimenDetails;
            customTests = parsed.originalCustomTests || undefined;
          } catch {
            // fallback
          }
        }

        return {
          id: row.id,
          patientId: row.patient_id,
          doctorId: row.doctor_id || "doc-patrick-jacinto",
          doctorName: row.doctor_name || "Dr. Patrick Jacinto Gomero",
          doctorCmp: row.doctor_cmp || "61693",
          doctorRne: row.doctor_rne || "",
          orderDate: row.order_date ? String(row.order_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
          diagnosis: row.diagnosis || "",
          cie10Code: row.cie10_code || undefined,
          items: Array.isArray(row.items) ? row.items : (typeof row.items === "string" ? JSON.parse(row.items) : []),
          customTests,
          urgency: row.urgency || "Rutina",
          patientInstructions: row.patient_instructions || undefined,
          templateType,
          templateTitle,
          specimenDetails,
          createdAt: row.created_at || new Date().toISOString(),
          updatedAt: row.updated_at || new Date().toISOString(),
        };
      });
    }

    // 11. Prenatal Cards
    if (prenatalCardsRes.status === "fulfilled" && prenatalCardsRes.value.data) {
      result.prenatalCards = prenatalCardsRes.value.data.map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        clinicEstablishment: row.clinic_establishment || "CENDO - Centro de Endometriosis",
        attendingDoctorId: row.attending_doctor_id || "doc-patrick-jacinto",
        attendingDoctorName: row.attending_doctor_name || "Dr. Patrick Jacinto Gomero",
        baseline: typeof row.baseline === "string" ? JSON.parse(row.baseline) : (row.baseline || {}),
        visits: Array.isArray(row.visits) ? row.visits : (typeof row.visits === "string" ? JSON.parse(row.visits) : []),
        maternalPathologies: Array.isArray(row.maternal_pathologies) ? row.maternal_pathologies : (typeof row.maternal_pathologies === "string" ? JSON.parse(row.maternal_pathologies) : []),
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));
    }

    // 12. Documents
    if (documentsRes.status === "fulfilled" && documentsRes.value.data) {
      result.patientDocuments = documentsRes.value.data.map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        documentType: row.document_type || "OTRO",
        title: row.title || "Documento Clínico",
        fileName: row.file_name || "documento.pdf",
        fileUrl: row.file_url || "",
        filePath: row.file_path || undefined,
        fileSize: row.file_size != null ? Number(row.file_size) : undefined,
        mimeType: row.mime_type || "application/pdf",
        notes: row.notes || undefined,
        uploadedBy: row.uploaded_by || undefined,
        createdAt: row.created_at || new Date().toISOString(),
      }));
    }

    // 13. Procedure Quotes
    if (quotesRes.status === "fulfilled" && quotesRes.value.data) {
      result.procedureQuotes = quotesRes.value.data.map((row: any) => {
        const pat = patientLookup.get(row.patient_id);
        return {
          id: row.id,
          patientId: row.patient_id,
          patientName: pat?.fullName || "Paciente CENDO",
          patientPhone: pat?.phone || "",
          doctorId: row.doctor_id || "doc-patrick-jacinto",
          doctorName: row.doctor_name || "Dr. Patrick Jacinto Gomero",
          quoteDate: row.quote_date ? String(row.quote_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
          validityDays: Number(row.validity_days) || 15,
          items: Array.isArray(row.items) ? row.items : (typeof row.items === "string" ? JSON.parse(row.items) : []),
          subtotal: Number(row.subtotal) || 0,
          discountTotal: Number(row.discount_total) || 0,
          total: Number(row.total) || 0,
          paymentTerms: row.payment_terms || "Al contado o transferencia.",
          notes: row.notes || undefined,
          createdAt: row.created_at || new Date().toISOString(),
        };
      });
    }

    // 14. Appointments
    if (appointmentsRes.status === "fulfilled" && appointmentsRes.value.data) {
      result.appointments = appointmentsRes.value.data.map((row: any) => {
        const pat = patientLookup.get(row.patient_id);
        return {
          id: row.id,
          patientId: row.patient_id,
          patientName: pat?.fullName || "Paciente CENDO",
          patientDni: pat?.dni || "",
          patientPhone: pat?.phone || "",
          doctorId: row.doctor_id || "doc-patrick-jacinto",
          doctorName: row.doctor_name || "Dr. Patrick Jacinto Gomero",
          appointmentDate: row.appointment_date ? String(row.appointment_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
          appointmentTime: row.appointment_time || "10:00",
          durationMinutes: Number(row.duration_minutes) || 30,
          appointmentType: row.appointment_type || "CONSULTA_PRIMERA_VEZ",
          reason: row.reason || "",
          status: row.status || "CONFIRMADA",
          notes: row.notes || undefined,
          reminderSent: !!row.reminder_sent,
          createdAt: row.created_at || new Date().toISOString(),
          updatedAt: row.updated_at || new Date().toISOString(),
        };
      });
    }

    // 15. Word Histories
    if (wordHistoriesRes.status === "fulfilled" && wordHistoriesRes.value.data) {
      result.wordHistories = wordHistoriesRes.value.data.map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        fileName: row.file_name || "historia.docx",
        fileSize: Number(row.file_size) || 0,
        fileUrl: row.file_url || "",
        extractedText: row.extracted_text || undefined,
        notes: row.notes || undefined,
        createdAt: row.created_at || new Date().toISOString(),
      }));
    }

    // 16. Tariff
    if (tariffsRes.status === "fulfilled" && tariffsRes.value.data) {
      result.proceduresTariff = tariffsRes.value.data.map((row: any) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        category: row.category || "Procedimiento",
        description: row.description || "",
        price: Number(row.price) || 0,
        active: row.active !== false,
        createdAt: row.created_at || new Date().toISOString(),
      }));
    }

    // 17. Vademecum
    if (vademecumRes.status === "fulfilled" && vademecumRes.value.data) {
      result.medicationsVademecum = vademecumRes.value.data.map((row: any) => ({
        id: row.id,
        genericName: row.generic_name,
        atcCode: row.atc_code || "",
        therapeuticGroup: row.therapeutic_group || "",
        commercialBrands: Array.isArray(row.commercial_brands) ? row.commercial_brands : (typeof row.commercial_brands === "string" ? JSON.parse(row.commercial_brands) : []),
        indications: row.indications || "",
        contraindications: row.contraindications || "",
        createdAt: row.created_at || new Date().toISOString(),
      }));
    }

    return result;
  } catch (err) {
    console.error("fetchAllDataFromSupabase critical error:", err);
    return null;
  }
}
