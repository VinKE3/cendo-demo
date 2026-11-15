/**
 * Módulo de Colposcopía IFCPC 2011 - Servicio Supabase CRUD
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { createClient } from "@/lib/supabase/client";
import { ensureUuid, getPatientUuid } from "@/lib/supabaseSync";
import { CreateColposcopyInput, ColposcopyReport } from "./colposcopia.types";
import { validateColposcopyInput } from "./colposcopia.validator";

function mapRow(row: any): ColposcopyReport {
  return {
    id: row.id,
    patientId: row.patient_id,
    reportDate: row.report_date ? String(row.report_date).slice(0, 10) : "",
    adequateColposcopy: row.adequate_colposcopy !== false,
    squamocolumnarJunctionVisible: row.squamocolumnar_junction_visible || "Visible",
    transformationZoneType: row.transformation_zone_type || "Tipo 1",
    matureSquamousEpithelium: !!row.mature_squamous_epithelium,
    ectopy: !!row.ectopy,
    thinAcetowhiteEpithelium: !!row.thin_acetowhite_epithelium,
    irregularBorder: !!row.irregular_border,
    fineMosaic: !!row.fine_mosaic,
    finePunctation: !!row.fine_punctation,
    denseAcetowhiteEpithelium: !!row.dense_acetowhite_epithelium,
    coarseMosaic: !!row.coarse_mosaic,
    coarsePunctation: !!row.coarse_punctation,
    atypicalVessels: !!row.atypical_vessels,
    schillerTest: row.schiller_test || "Negativo (Lugol Caoba)",
    cervicalBiopsyTaken: !!row.cervical_biopsy_taken,
    biopsyClockHours: Array.isArray(row.biopsy_clock_hours) ? row.biopsy_clock_hours : [],
    images: Array.isArray(row.images) ? row.images : [],
    diagnosis: row.diagnosis,
    planRecommendations: row.plan_recommendations,
    cie10Code: row.cie10_code || "Z01.4",
    doctorName: row.doctor_name || "Dr. Patrick José Jacinto Gomero",
    createdAt: row.created_at,
  };
}

export async function fetchColposcopyReportsFromSupabase(patientId?: string): Promise<ColposcopyReport[]> {
  const supabase = createClient();
  let query = supabase.from("colposcopy_reports").select("*").order("report_date", { ascending: false });
  if (patientId) query = query.eq("patient_id", getPatientUuid(patientId));
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function saveColposcopyReportToSupabase(
  input: CreateColposcopyInput
): Promise<{ success: boolean; data?: ColposcopyReport; error?: string }> {
  const validation = validateColposcopyInput(input);
  if (!validation.success) return { success: false, error: validation.error };

  const v = validation.data;
  const colpoId = v.id ? ensureUuid(v.id) : (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "00000000-0000-0000-0000-000000000000");
  const payload = {
    id: colpoId,
    patient_id: getPatientUuid(v.patientId),
    report_date: v.reportDate,
    adequate_colposcopy: v.adequateColposcopy,
    squamocolumnar_junction_visible: v.squamocolumnarJunctionVisible,
    transformation_zone_type: v.transformationZoneType,
    mature_squamous_epithelium: v.matureSquamousEpithelium,
    ectopy: v.ectopy,
    thin_acetowhite_epithelium: v.thinAcetowhiteEpithelium,
    irregular_border: v.irregularBorder,
    fine_mosaic: v.fineMosaic,
    fine_punctation: v.finePunctation,
    dense_acetowhite_epithelium: v.denseAcetowhiteEpithelium,
    coarse_mosaic: v.coarseMosaic,
    coarse_punctation: v.coarsePunctation,
    atypical_vessels: v.atypicalVessels,
    schiller_test: v.schillerTest,
    cervical_biopsy_taken: v.cervicalBiopsyTaken,
    biopsy_clock_hours: v.biopsyClockHours,
    images: v.images,
    diagnosis: v.diagnosis,
    plan_recommendations: v.planRecommendations,
    cie10_code: v.cie10Code,
    doctor_name: v.doctorName,
  };

  const { data, error } = await createClient()
    .from("colposcopy_reports")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error || !data) return { success: false, error: error?.message || "Error al persistir colposcopía" };
  return { success: true, data: mapRow(data) };
}

export async function deleteColposcopyReportFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await createClient().from("colposcopy_reports").delete().eq("id", ensureUuid(id));
  return error ? { success: false, error: error.message } : { success: true };
}
