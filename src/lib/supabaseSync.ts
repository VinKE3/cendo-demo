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
        document_type: "DNI",
        document_number: patient.dni,
        full_name: `${(patient.lastName || "").trim().toUpperCase()}, ${(patient.firstName || "").trim().toUpperCase()}`,
        birth_date: patient.birthDate,
        phone: patient.phone || null,
        email: patient.email || null,
        address: patient.address || null,
        district: "Miraflores",
        insurance_info: "Particular",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "document_number" }
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
        obstetric_formula: bg.obstetricFormula,
        contraceptive_method: bg.contraceptiveMethod,
        last_menstrual_period: bg.lastMenstrualPeriod || null,
        pap_history: bg.papHistory,
        vph_test_history: bg.vphTestHistory,
        medical_allergies: bg.medicalAllergies,
        surgeries_history: bg.surgeriesHistory,
        family_history: bg.familyHistory,
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

