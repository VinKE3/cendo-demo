/**
 * Módulo de Órdenes de Laboratorio Clínico - Servicio Supabase CRUD
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { createClient } from "@/lib/supabase/client";
import { ensureUuid, getPatientUuid } from "@/lib/supabaseSync";
import {
  CreateLabOrderInput,
  LabOrder,
  LabOrderTemplate,
} from "./laboratorio.types";
import { validateLabOrderInput } from "./laboratorio.validator";
import { INITIAL_LAB_TEMPLATES } from "./labTemplatesCatalog";

export async function fetchLabOrdersFromSupabase(
  patientId?: string
): Promise<LabOrder[]> {
  const supabase = createClient();
  let query = supabase
    .from("lab_orders")
    .select("*")
    .order("order_date", { ascending: false });

  if (patientId) {
    const pUuid = getPatientUuid(patientId);
    query = query.eq("patient_id", pUuid);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("Error al obtener órdenes de laboratorio de Supabase:", error?.message);
    return [];
  }

  return data.map((row: any) => {
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
      } catch (e) {
        // fallback
      }
    }

    return {
      id: row.id,
      patientId: row.patient_id,
      doctorId: row.doctor_id || "doc-patrick-jacinto",
      doctorName: row.doctor_name,
      doctorCmp: row.doctor_cmp,
      doctorRne: row.doctor_rne || undefined,
      orderDate: row.order_date ? String(row.order_date).slice(0, 10) : "",
      diagnosis: row.diagnosis,
      cie10Code: row.cie10_code || undefined,
      urgency: row.urgency || "Rutina",
      items: Array.isArray(row.items) ? row.items : [],
      customTests,
      patientInstructions: row.patient_instructions || undefined,
      templateType,
      templateTitle,
      specimenDetails,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export async function saveLabOrderToSupabase(
  input: CreateLabOrderInput
): Promise<{ success: boolean; data?: LabOrder; error?: string }> {
  const validation = validateLabOrderInput(input);
  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  const supabase = createClient();
  const orderId = input.id
    ? ensureUuid(input.id)
    : typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "00000000-0000-0000-0000-000000000000";
  const patientUuid = getPatientUuid(input.patientId);

  let customTestsString = input.customTests || null;
  if (input.templateType || input.specimenDetails || input.templateTitle) {
    const meta = {
      templateType: input.templateType,
      templateTitle: input.templateTitle,
      specimenDetails: input.specimenDetails,
      originalCustomTests: input.customTests || null,
    };
    customTestsString = `__METADATA__:${JSON.stringify(meta)}`;
  }

  const payload = {
    id: orderId,
    patient_id: patientUuid,
    doctor_id: input.doctorId,
    doctor_name: input.doctorName,
    doctor_cmp: input.doctorCmp,
    doctor_rne: input.doctorRne || null,
    order_date: input.orderDate,
    diagnosis: input.diagnosis,
    cie10_code: input.cie10Code || null,
    urgency: input.urgency || "Rutina",
    items: input.items,
    custom_tests: customTestsString,
    patient_instructions: input.patientInstructions || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("lab_orders")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || "Error al persistir orden de laboratorio en Supabase" };
  }

  return {
    success: true,
    data: {
      id: data.id,
      patientId: data.patient_id,
      doctorId: data.doctor_id,
      doctorName: data.doctor_name,
      doctorCmp: data.doctor_cmp,
      doctorRne: data.doctor_rne || undefined,
      orderDate: String(data.order_date).slice(0, 10),
      diagnosis: data.diagnosis,
      cie10Code: data.cie10_code || undefined,
      urgency: data.urgency,
      items: Array.isArray(data.items) ? data.items : [],
      customTests: input.customTests,
      patientInstructions: data.patient_instructions || undefined,
      templateType: input.templateType,
      templateTitle: input.templateTitle,
      specimenDetails: input.specimenDetails,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

export async function deleteLabOrderFromSupabase(id: string): Promise<boolean> {
  const supabase = createClient();
  const targetId = ensureUuid(id);
  const { error } = await supabase.from("lab_orders").delete().eq("id", targetId);
  return !error;
}

// ============================================================================
// SERVICIOS CRUD DE PLANTILLAS Y FORMATOS DE LABORATORIO
// ============================================================================

export async function fetchLabTemplatesFromSupabase(): Promise<LabOrderTemplate[]> {
  const supabase = createClient();
  try {
    // 1. Intentar leer de lab_order_templates si existe la tabla
    const { data: dedicatedData, error: dedicatedErr } = await supabase
      .from("lab_order_templates")
      .select("*");

    if (!dedicatedErr && dedicatedData && dedicatedData.length > 0) {
      return dedicatedData.map((row: any) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        templateType: row.template_type,
        sampleType: row.sample_type,
        fixativeTransport: row.fixative_transport,
        suggestedDiagnosis: row.suggested_diagnosis,
        cie10Code: row.cie10_code || "",
        defaultTests: Array.isArray(row.default_tests) ? row.default_tests : [],
        clinicalNotes: row.clinical_notes || "",
        isOfficial: row.is_official ?? false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }

    // 2. Fallback: leer de procedures_tariff con código TMPL-
    const { data, error } = await supabase
      .from("procedures_tariff")
      .select("*")
      .like("code", "TMPL-%");

    if (!error && data && data.length > 0) {
      const dbTemplates: LabOrderTemplate[] = data.map((row: any) => {
        try {
          const parsed = JSON.parse(row.description);
          return {
            id: row.id,
            title: row.name,
            category: row.category || "Laboratorio",
            templateType: parsed.templateType || "CUSTOM",
            sampleType: parsed.sampleType || "",
            fixativeTransport: parsed.fixativeTransport || "",
            suggestedDiagnosis: parsed.suggestedDiagnosis || "",
            cie10Code: parsed.cie10Code || "",
            defaultTests: Array.isArray(parsed.defaultTests) ? parsed.defaultTests : [],
            clinicalNotes: parsed.clinicalNotes || "",
            isOfficial: parsed.isOfficial || false,
            createdAt: row.created_at,
          };
        } catch {
          return {
            id: row.id,
            title: row.name,
            category: "Laboratorio",
            templateType: "CUSTOM",
            sampleType: "",
            fixativeTransport: "",
            suggestedDiagnosis: "",
            defaultTests: [],
            clinicalNotes: row.description || "",
          };
        }
      });

      const existingIds = new Set(dbTemplates.map((t) => t.id));
      const missingOfficials = INITIAL_LAB_TEMPLATES.filter((t) => !existingIds.has(t.id));
      return [...dbTemplates, ...missingOfficials];
    }
  } catch (err) {
    console.error("Error al obtener plantillas de laboratorio de Supabase:", err);
  }
  return INITIAL_LAB_TEMPLATES;
}

export async function saveLabTemplateToSupabase(
  template: LabOrderTemplate
): Promise<{ success: boolean; data?: LabOrderTemplate; error?: string }> {
  const supabase = createClient();
  try {
    // 1. Intentar guardar en lab_order_templates si existe
    try {
      await supabase.from("lab_order_templates").upsert({
        id: template.id,
        title: template.title,
        category: template.category,
        template_type: template.templateType,
        sample_type: template.sampleType,
        fixative_transport: template.fixativeTransport,
        suggested_diagnosis: template.suggestedDiagnosis,
        cie10_code: template.cie10Code || null,
        default_tests: template.defaultTests,
        clinical_notes: template.clinicalNotes,
        is_official: template.isOfficial || false,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
    } catch {
      // Ignorar si no existe tabla aún
    }

    // 2. Persistir siempre en procedures_tariff para compatibilidad total
    const tariffPayload = {
      id: template.id.startsWith("tmpl-")
        ? ensureUuid(template.id.replace("tmpl-", "d0000000-0000-0000-0000-"))
        : ensureUuid(template.id),
      code: `TMPL-${template.templateType}-${template.id.slice(0, 6)}`,
      name: template.title,
      category: "Laboratorio",
      description: JSON.stringify({
        templateType: template.templateType,
        sampleType: template.sampleType,
        fixativeTransport: template.fixativeTransport,
        suggestedDiagnosis: template.suggestedDiagnosis,
        cie10Code: template.cie10Code,
        defaultTests: template.defaultTests,
        clinicalNotes: template.clinicalNotes,
        isOfficial: template.isOfficial || false,
      }),
      price: 0,
      active: true,
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from("procedures_tariff")
      .upsert(tariffPayload, { onConflict: "id" });

    return { success: true, data: template };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function deleteLabTemplateFromSupabase(id: string): Promise<boolean> {
  const supabase = createClient();
  try {
    const targetId = id.startsWith("tmpl-")
      ? ensureUuid(id.replace("tmpl-", "d0000000-0000-0000-0000-"))
      : ensureUuid(id);
    
    // Eliminar de procedures_tariff
    await supabase.from("procedures_tariff").delete().eq("id", targetId);
    
    // Intentar eliminar de lab_order_templates si existe
    try {
      await supabase.from("lab_order_templates").delete().eq("id", id);
    } catch {
      // Ignore
    }

    return true;
  } catch {
    return false;
  }
}
