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
import { Patient, ColposcopyReport, ClinicalCheckup, PatientBackground } from "@/types/medical";

export async function syncPatientToSupabase(patient: Patient): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }

    const { error } = await supabase.from("patients").upsert(
      {
        id: patient.id,
        dni: patient.dni,
        first_name: patient.firstName,
        last_name: patient.lastName,
        birth_date: patient.birthDate,
        age: patient.age,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        civil_status: patient.civilStatus,
        occupation: patient.occupation,
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

export async function deletePatientFromSupabase(patientId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }

    const { error } = await supabase.from("patients").delete().eq("id", patientId);
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

