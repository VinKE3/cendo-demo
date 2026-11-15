/**
 * Módulo de Órdenes de Laboratorio Clínico - Validaciones & Catálogo
 * Centro de Endometriosis y Ginecología (CENDO)
 */

import { z } from "zod";
import {
  CatalogLabTest,
  CreateLabOrderInput,
  LabOrderItem,
} from "./laboratorio.types";

export const LAB_TESTS_CATALOG: CatalogLabTest[] = [
  { id: "cat-ca125", name: "CA-125 (Marcador Ovárico / Endometriosis)", category: "Ginecología & Marcadores", sampleType: "Sangre venosa", notes: "Ayuno 8 horas" },
  { id: "cat-pap", name: "Papanicolaou en Base Líquida (ThinPrep)", category: "Ginecología & Marcadores", sampleType: "Muestra cervical", notes: "Abstinencia sexual 48h previas" },
  { id: "cat-vph", name: "Panel Tipificación VPH 23 Genotipos (PCR)", category: "Ginecología & Marcadores", sampleType: "Muestra endocervical", notes: "Sin óvulos 48h previas" },
  { id: "cat-he4", name: "HE-4 + Índice ROMA (Riesgo Ovárico)", category: "Ginecología & Marcadores", sampleType: "Sangre venosa", notes: "Ayuno 8 horas" },
  { id: "cat-amh", name: "Hormona Antimülleriana (AMH - Reserva Ovárica)", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa" },
  { id: "cat-fsh", name: "FSH (Hormona Folículo Estimulante)", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa", notes: "Día 2-4 del ciclo" },
  { id: "cat-e2", name: "Estradiol Sérico (E2)", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa", notes: "Día 2-4 del ciclo" },
  { id: "cat-prl", name: "Prolactina Sérica", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa", notes: "Reposo 30 min previo a punción" },
  { id: "cat-hemo", name: "Hemograma Completo Automatizado + Plaquetas", category: "Hematología & Bioquímica", sampleType: "Sangre con EDTA", notes: "Ayuno 8 horas" },
  { id: "cat-glu", name: "Glucosa en Ayunas + Perfil Lipídico", category: "Hematología & Bioquímica", sampleType: "Sangre venosa", notes: "Ayuno de 10-12 horas" },
  { id: "cat-bhcg", name: "Subunidad Beta hCG Cuantitativa", category: "Perfil Prenatal / Gestacional", sampleType: "Sangre venosa" },
  { id: "cat-torch", name: "Perfil TORCH (Toxoplasma, Rubeola, CMV, Herpes)", category: "Perfil Prenatal / Gestacional", sampleType: "Sangre venosa" },
];

export const labOrderItemSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(2, "La categoría es obligatoria"),
  testName: z.string().min(2, "El nombre del examen es obligatorio"),
  sampleType: z.string().optional(),
  notes: z.string().optional(),
});

export const labOrderInputSchema = z.object({
  patientId: z.string().min(1, "El ID de paciente es obligatorio"),
  doctorId: z.string().min(1, "El especialista es obligatorio"),
  doctorName: z.string().min(2, "El nombre del médico es obligatorio"),
  doctorCmp: z.string().min(3, "El CMP del médico es obligatorio"),
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  diagnosis: z.string().min(3, "El diagnóstico presuntivo es obligatorio"),
  urgency: z.enum(["Rutina", "Prioritario", "Urgente"]).default("Rutina"),
  items: z.array(labOrderItemSchema).min(1, "Debe solicitar al menos un examen de laboratorio"),
});

export function checkDuplicateTestInOrder(
  items: LabOrderItem[],
  candidateTestName: string
): boolean {
  const norm = candidateTestName.trim().toLowerCase();
  return items.some((item) => item.testName.trim().toLowerCase() === norm);
}

export function validateLabOrderInput(
  input: CreateLabOrderInput
): { success: boolean; error?: string } {
  const result = labOrderInputSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Datos de orden de laboratorio inválidos" };
  }
  return { success: true };
}
