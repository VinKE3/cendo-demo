/**
 * CENDO - Inyector de Antecedentes Gineco-Obstétricos Oficiales
 * Inserta los antecedentes clínicos de las 5 pacientes de demostración en Supabase Cloud.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function getEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) throw new Error(".env.local no encontrado");
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
  return env;
}

const env = getEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const REAL_BACKGROUNDS = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    patient_id: "10000000-0000-0000-0000-000000000001",
    menarche: 12,
    sexual_debut_age: 18,
    sexual_partners_count: 2,
    catamenial_regimen: "28/4",
    sti_history: "Niega ITS",
    obstetric_formula: "G0 P0000",
    contraceptive_method: "Preservativo de barrera",
    last_menstrual_period: "2026-10-28",
    pap_history: "Normal (febrero 2025)",
    vph_test_history: "Negativo 23 genotipos PCR (2025)",
    has_diabetes: "Niega",
    has_hypertension: "Niega",
    has_asthma: "Niega",
    medical_allergies: "Niega alergias a medicamentos",
    surgeries_history: "Niega cirugías previas",
    family_history: "Tía materna con quistes ováricos benignos",
    other_pathologies: "Niega patologías sistémicas crónicas",
    notes: "Paciente acude a chequeo preventivo anual y asesoría para colocación de implante subdérmico LARC.",
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    patient_id: "10000000-0000-0000-0000-000000000002",
    menarche: 13,
    sexual_debut_age: 21,
    sexual_partners_count: 1,
    catamenial_regimen: "28/4",
    sti_history: "Niega ITS",
    obstetric_formula: "G1 P0000",
    contraceptive_method: "Ninguno (Embarazo deseado y planificado)",
    last_menstrual_period: "2026-09-04",
    pap_history: "Normal (febrero 2026)",
    vph_test_history: "Negativo (febrero 2026)",
    has_diabetes: "Niega antecedente propio / Familiar directo en madre (diabetes gestacional)",
    has_hypertension: "Niega",
    has_asthma: "Niega",
    medical_allergies: "Niega alergias medicamentosas",
    surgeries_history: "Niega cirugías previas",
    family_history: "Madre con antecedente de diabetes gestacional en último parto",
    other_pathologies: "Gestante primigesta de 10 semanas de gestación activa",
    notes: "Gestante de 10 semanas con control prenatal estructurado en carnet oficial MINSA/CLAP. FPP Naegele: 11/06/2027.",
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    patient_id: "10000000-0000-0000-0000-000000000003",
    menarche: 11,
    sexual_debut_age: 19,
    sexual_partners_count: 2,
    catamenial_regimen: "30/6 (Dismenorrea incapacitante EVA 9/10)",
    sti_history: "Niega ITS",
    obstetric_formula: "G0 P0000",
    contraceptive_method: "Dienogest 2mg diario continuo (Visannette)",
    last_menstrual_period: "2026-10-15",
    pap_history: "Normal (agosto 2026)",
    vph_test_history: "Negativo (agosto 2026)",
    has_diabetes: "Niega",
    has_hypertension: "Niega",
    has_asthma: "Niega",
    medical_allergies: "Alergia comprobada a Penicilina (erupción cutánea)",
    surgeries_history: "Apendicectomía abierta a los 16 años (2010)",
    family_history: "Madre y hermana mayor con endometriosis diagnosticada quirúrgicamente",
    other_pathologies: "Endometriosis pélvica profunda comprobada por ultrasonido de alta resolución y RMN pélvica. Disquecia y dispareunia profunda.",
    notes: "Caso de alta complejidad CENDO. Mapeo protocolizado IDEA positivo para endometrioma ovárico izquierdo de 42 mm y nódulo retrocervical de 12 mm en ligamento uterosacro izquierdo.",
  },
  {
    id: "20000000-0000-0000-0000-000000000004",
    patient_id: "10000000-0000-0000-0000-000000000004",
    menarche: 12,
    sexual_debut_age: 17,
    sexual_partners_count: 4,
    catamenial_regimen: "28/5",
    sti_history: "VPH positivo oncogénico detectado en octubre 2026",
    obstetric_formula: "G1 P0010 (1 aborto espontáneo en 2021)",
    contraceptive_method: "DIU de Cobre (T de Cobre 380A colocado en 2022)",
    last_menstrual_period: "2026-10-24",
    pap_history: "Anormal (Octubre 2026): LIE-AG / HSIL",
    vph_test_history: "Positivo Genotipo VPH 16 (Octubre 2026)",
    has_diabetes: "Niega",
    has_hypertension: "Niega",
    has_asthma: "Niega",
    medical_allergies: "Niega alergias",
    surgeries_history: "Legrado uterino hemostático post-aborto en 2021",
    family_history: "Abuela materna con cáncer de cuello uterino a los 62 años",
    other_pathologies: "Patología cervical premaligna NIC 2 confirmada por biopsia dirigida Tischler.",
    notes: "Paciente derivada con PAP anormal y prueba molecular VPH 16 positiva. Requiere conización cervical LEEP ambulatoria.",
  },
  {
    id: "20000000-0000-0000-0000-000000000005",
    patient_id: "10000000-0000-0000-0000-000000000005",
    menarche: 13,
    sexual_debut_age: 20,
    sexual_partners_count: 1,
    catamenial_regimen: "Menopausia establecida (FUM hace 14 meses)",
    sti_history: "Niega ITS",
    obstetric_formula: "G2 P2002 (2 partos vaginales a término)",
    contraceptive_method: "Quirúrgico (Salpingoclasia bilateral en 2006)",
    last_menstrual_period: "2025-09-12",
    pap_history: "Atrofia celular sin atipia (noviembre 2026)",
    vph_test_history: "Negativo (noviembre 2026)",
    has_diabetes: "Niega",
    has_hypertension: "Controlada con Enalapril 10 mg diario",
    has_asthma: "Niega",
    medical_allergies: "Alergia a AINEs tipo Sulfas",
    surgeries_history: "Salpingoclasia bilateral en 2006; Cesárea no refiere (ambos eutócicos)",
    family_history: "Madre con osteoporosis severa y fractura de cadera a los 74 años",
    other_pathologies: "Síndrome climatérico severo con bochornos vasomotores, insomnio y atrofia urogenital sintomática.",
    notes: "Paciente en fase climatérica. Evaluación endometrial y mamaria previa a inicio de terapia de reemplazo hormonal (TRH) y protección ósea.",
  },
];

async function seedAntecedentes() {
  console.log("🌱 Insertando antecedentes gineco-obstétricos de las 5 pacientes en Supabase...");
  for (const item of REAL_BACKGROUNDS) {
    const { error } = await supabase.from("patient_backgrounds").upsert(item, { onConflict: "patient_id" });
    if (error) {
      console.error(`❌ Error en paciente ${item.patient_id}:`, error.message);
    } else {
      console.log(`✔ Insertado: [Paciente ${item.patient_id}] Fórmula: ${item.obstetric_formula} | MAC: ${item.contraceptive_method}`);
    }
  }
  console.log("✨ Finalizado con éxito.");
}

seedAntecedentes();
