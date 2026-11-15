/**
 * CENDO - Inyector de Órdenes de Laboratorio Clínico Oficiales
 * Centro de Endometriosis y Ginecología (CENDO)
 * Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)
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

const OFFICIAL_LAB_ORDERS = [
  {
    id: "e0000000-0000-0000-0000-000000000001",
    patient_id: "10000000-0000-0000-0000-000000000001", // Luciana Ramos
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    order_date: "2026-11-14",
    diagnosis: "Endometriosis pélvica profunda infiltrante (N80.3)",
    cie10_code: "N80.3",
    urgency: "Rutina",
    items: [
      {
        id: "lab-item-101",
        category: "Ginecología & Marcadores",
        testName: "CA-125 (Marcador Ovárico / Endometriosis)",
        sampleType: "Sangre venosa",
        notes: "Ayuno de 8 horas",
      },
      {
        id: "lab-item-102",
        category: "Ginecología & Marcadores",
        testName: "HE-4 + Índice ROMA (Riesgo Ovárico)",
        sampleType: "Sangre venosa",
        notes: "Ayuno de 8 horas",
      },
      {
        id: "lab-item-103",
        category: "Hematología & Bioquímica",
        testName: "Hemograma Completo Automatizado + Plaquetas + VSG",
        sampleType: "Sangre con EDTA",
        notes: "Evaluación basal inflamatoria",
      },
    ],
    custom_tests: "Proteína C Reactiva ultrasensible (PCR-us)",
    patient_instructions: "Acudir en ayunas estrictas de 8 horas. No realizar actividad física intensa 24h antes.",
  },
  {
    id: "e0000000-0000-0000-0000-000000000002",
    patient_id: "10000000-0000-0000-0000-000000000002", // Fiorella Mendoza
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    order_date: "2026-11-14",
    diagnosis: "Endometrioma ovárico izquierdo (N80.1)",
    cie10_code: "N80.1",
    urgency: "Rutina",
    items: [
      {
        id: "lab-item-201",
        category: "Ginecología & Marcadores",
        testName: "CA-125 (Marcador Ovárico / Endometriosis)",
        sampleType: "Sangre venosa",
        notes: "Control de niveles séricos",
      },
      {
        id: "lab-item-202",
        category: "Perfil Hormonal & Ovárico",
        testName: "Hormona Antimülleriana (AMH - Reserva Ovárica)",
        sampleType: "Sangre venosa",
        notes: "Cualquier día del ciclo",
      },
    ],
    custom_tests: "Estradiol (E2) y FSH",
    patient_instructions: "Ayuno matutino de 8 horas. Muestra válida en cualquier fase del ciclo para AMH.",
  },
  {
    id: "e0000000-0000-0000-0000-000000000003",
    patient_id: "10000000-0000-0000-0000-000000000003", // Gabriela Paredes
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    order_date: "2026-11-14",
    diagnosis: "Control Prenatal II Trimestre (Semana 22) (Z34.0)",
    cie10_code: "Z34.0",
    urgency: "Rutina",
    items: [
      {
        id: "lab-item-301",
        category: "Perfil Prenatal / Gestacional",
        testName: "Test de Tolerancia Oral a la Glucosa 75g (24-28 sem)",
        sampleType: "Sangre venosa",
        notes: "Descarte diabetes gestacional",
      },
      {
        id: "lab-item-302",
        category: "Hematología & Bioquímica",
        testName: "Hemograma Completo Automatizado + Plaquetas",
        sampleType: "Sangre con EDTA",
        notes: "Control de hemoglobina y anemia",
      },
      {
        id: "lab-item-303",
        category: "Perfil Prenatal / Gestacional",
        testName: "Urocultivo + Antibiograma (Tamizaje Bacteriuria Asintomática)",
        sampleType: "Orina chorro medio",
        notes: "Primer chorro descartado",
      },
    ],
    custom_tests: "Ferritina sérica",
    patient_instructions: "Ayuno de 8 a 10 horas. Disponer de 2 horas en el laboratorio para el test de glucosa oral.",
  },
  {
    id: "e0000000-0000-0000-0000-000000000004",
    patient_id: "10000000-0000-0000-0000-000000000004", // Daniela Castro
    doctor_id: "doc-carlos-mendoza",
    doctor_name: "Dr. Carlos Mendoza",
    doctor_cmp: "55432",
    doctor_rne: "29871",
    order_date: "2026-11-13",
    diagnosis: "Displasia Cervical NIC 2 / LIE-AG (N87.1)",
    cie10_code: "N87.1",
    urgency: "Prioritario",
    items: [
      {
        id: "lab-item-401",
        category: "Ginecología & Marcadores",
        testName: "Panel Tipificación VPH 23 Genotipos (PCR)",
        sampleType: "Muestra endocervical",
        notes: "Identificación de tipos 16, 18 y otros de alto riesgo",
      },
      {
        id: "lab-item-402",
        category: "Ginecología & Marcadores",
        testName: "Papanicolaou en Base Líquida (ThinPrep)",
        sampleType: "Muestra cervical",
        notes: "Control citológico especializado",
      },
    ],
    custom_tests: "Biopsia de cuello uterino para estudio anatomopatológico",
    patient_instructions: "Abstinencia sexual 48 horas previas. No aplicarse cremas ni óvulos vaginales.",
  },
  {
    id: "e0000000-0000-0000-0000-000000000005",
    patient_id: "10000000-0000-0000-0000-000000000005", // Carmen Huamán
    doctor_id: "doc-andrea-morales",
    doctor_name: "Dra. Andrea Morales",
    doctor_cmp: "67890",
    doctor_rne: "31245",
    order_date: "2026-11-12",
    diagnosis: "Leiomiomatosis Uterina con Anemia (D25.9)",
    cie10_code: "D25.9",
    urgency: "Prioritario",
    items: [
      {
        id: "lab-item-501",
        category: "Hematología & Bioquímica",
        testName: "Hemograma Completo Automatizado + Plaquetas",
        sampleType: "Sangre con EDTA",
        notes: "Dosaje estricto de Hb y hematocrito",
      },
      {
        id: "lab-item-502",
        category: "Hematología & Bioquímica",
        testName: "Ferritina Sérica y Hierro Sérico",
        sampleType: "Sangre venosa",
        notes: "Cinética del hierro",
      },
      {
        id: "lab-item-503",
        category: "Hematología & Bioquímica",
        testName: "Perfil de Coagulación (TP, TTPA, Fibrinógeno, INR)",
        sampleType: "Sangre con Citrato",
        notes: "Evaluación hemostática por menorragia",
      },
    ],
    custom_tests: "Grupo sanguíneo y factor Rh",
    patient_instructions: "Ayuno de 8 horas. No tomar suplementos de hierro las 24 horas previas al examen de sangre.",
  },
];

async function seedLaboratorio() {
  console.log("\n=======================================================");
  console.log("🌱 CENDO - INYECTANDO ÓRDENES DE LABORATORIO OFICIALES");
  console.log("=======================================================\n");

  for (const order of OFFICIAL_LAB_ORDERS) {
    const { data, error } = await supabase
      .from("lab_orders")
      .upsert(order, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error al inyectar orden ${order.id}:`, error.message);
    } else {
      console.log(`✔ Orden registrada: ${order.order_date} [${order.urgency}] - ${order.doctor_name}`);
      console.log(`   Diagnóstico: ${order.diagnosis}`);
      console.log(`   Exámenes: ${order.items.map((i) => i.testName).join(" | ")}`);
    }
  }

  console.log("\n=======================================================");
  console.log("🎉 INYECCIÓN DE ÓRDENES DE LABORATORIO COMPLETADA");
  console.log("=======================================================\n");
}

seedLaboratorio();
