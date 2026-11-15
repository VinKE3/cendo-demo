/**
 * CENDO - Inyector de Recetas Médicas Inteligentes Oficiales
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

const OFFICIAL_PRESCRIPTIONS = [
  {
    id: "f0000000-0000-0000-0000-000000000001",
    patient_id: "10000000-0000-0000-0000-000000000001", // Luciana Ramos
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    prescription_date: "2026-11-14",
    diagnosis: "Endometriosis pélvica profunda infiltrante (N80.3)",
    cie10_code: "N80.3",
    items: [
      {
        id: "rec-item-101",
        medicationName: "Dienogest 2mg (Visannette)",
        presentation: "Caja x 28 comprimidos recubiertos",
        route: "Vía Oral",
        dosage: "1 comprimido (2 mg)",
        frequency: "Cada 24 horas por las noches (21:00 hrs)",
        duration: "Por 6 meses continuos sin pausa",
        instructions: "Tomar todos los días a la misma hora sin interrupción, incluso durante sangrado.",
        quantity: "6 cajas",
      },
      {
        id: "rec-item-102",
        medicationName: "Ketorolaco Trometamol 10mg",
        presentation: "Caja x 10 tabletas sublinguales",
        route: "Vía Oral",
        dosage: "1 tableta sublingual",
        frequency: "Cada 8 horas condicional al dolor agudo",
        duration: "Máximo por 3 días continuos",
        instructions: "Colocar debajo de la lengua ante crisis de dolor pélvico no controlable.",
        quantity: "1 caja",
      },
    ],
    general_indications: "Mantener reposo relativo en crisis agudas. Acudir a ecografía Doppler de mapeo.",
    next_appointment_date: "2026-12-14",
  },
  {
    id: "f0000000-0000-0000-0000-000000000002",
    patient_id: "10000000-0000-0000-0000-000000000002", // Fiorella Mendoza
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    prescription_date: "2026-11-14",
    diagnosis: "Endometrioma ovárico izquierdo con dolor pélvico (N80.1)",
    cie10_code: "N80.1",
    items: [
      {
        id: "rec-item-201",
        medicationName: "Dienogest 2mg",
        presentation: "Caja x 28 comprimidos",
        route: "Vía Oral",
        dosage: "1 comprimido",
        frequency: "Cada 24 horas a la misma hora",
        duration: "Por 3 meses iniciales",
        instructions: "Tomar sin interrupción. Control ecográfico de tamaño del endometrioma al término.",
        quantity: "3 cajas",
      },
      {
        id: "rec-item-202",
        medicationName: "Ibuprofeno 400mg",
        presentation: "Caja x 20 tabletas recubiertas",
        route: "Vía Oral",
        dosage: "1 tableta",
        frequency: "Cada 8 horas con los alimentos",
        duration: "Por 3 días condicional a dolor menstrual",
        instructions: "Tomar siempre después de las comidas para evitar irritación gástrica.",
        quantity: "1 caja",
      },
    ],
    general_indications: "Evitar esfuerzos físicos intensos durante los episodios de dolor pélvico agudo.",
    next_appointment_date: "2026-12-05",
  },
  {
    id: "f0000000-0000-0000-0000-000000000003",
    patient_id: "10000000-0000-0000-0000-000000000003", // Gabriela Paredes
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    prescription_date: "2026-11-14",
    diagnosis: "Supervisión de embarazo normal de curso favorable (Z34.0)",
    cie10_code: "Z34.0",
    items: [
      {
        id: "rec-item-301",
        medicationName: "Sulfato Ferroso 300mg + Ácido Fólico 400mcg",
        presentation: "Caja x 30 tabletas",
        route: "Vía Oral",
        dosage: "1 tableta diaria",
        frequency: "Cada 24 horas en ayunas con jugo de naranja o agua",
        duration: "Hasta el término de la gestación",
        instructions: "No ingerir junto con leche, té o café para no inhibir la absorción del hierro.",
        quantity: "3 cajas",
      },
      {
        id: "rec-item-302",
        medicationName: "Calcio Elemental 500mg + Vitamina D3 400 UI",
        presentation: "Frasco x 60 tabletas masticables",
        route: "Vía Oral",
        dosage: "1 tableta",
        frequency: "Cada 12 horas con almuerzo y cena",
        duration: "Por 60 días",
        instructions: "Masticar bien antes de tragar. Separar al menos 2 horas de la toma de hierro.",
        quantity: "1 frasco",
      },
    ],
    general_indications: "Dieta rica en fibra y agua (2L diarios). Realizar caminatas suaves de 30 minutos.",
    next_appointment_date: "2026-12-12",
  },
  {
    id: "f0000000-0000-0000-0000-000000000004",
    patient_id: "10000000-0000-0000-0000-000000000004", // Daniela Castro
    doctor_id: "doc-carlos-mendoza",
    doctor_name: "Dr. Carlos Mendoza",
    doctor_cmp: "55432",
    doctor_rne: "29871",
    prescription_date: "2026-11-13",
    diagnosis: "Cervicovaginitis / Preparación Colposcópica (N76.0)",
    cie10_code: "N76.0",
    items: [
      {
        id: "rec-item-401",
        medicationName: "Ginedazol Óvulos (Metronidazol 500mg + Miconazol 100mg)",
        presentation: "Caja x 10 óvulos vaginales",
        route: "Vía Vaginal",
        dosage: "1 óvulo profundo",
        frequency: "Cada 24 horas por las noches antes de acostarse",
        duration: "Por 10 noches continuas",
        instructions: "Introducir profundamente en posición decúbito. Abstinencia sexual durante el tratamiento.",
        quantity: "1 caja",
      },
    ],
    general_indications: "Uso de ropa interior de algodón. No duchas vaginales. No consumir alcohol.",
    next_appointment_date: "2026-11-27",
  },
  {
    id: "f0000000-0000-0000-0000-000000000005",
    patient_id: "10000000-0000-0000-0000-000000000005", // Carmen Huamán
    doctor_id: "doc-andrea-morales",
    doctor_name: "Dra. Andrea Morales",
    doctor_cmp: "67890",
    doctor_rne: "31245",
    prescription_date: "2026-11-12",
    diagnosis: "Leiomiomatosis Uterina con Menorragia (D25.9)",
    cie10_code: "D25.9",
    items: [
      {
        id: "rec-item-501",
        medicationName: "Ácido Tranexámico 500mg",
        presentation: "Caja x 20 tabletas",
        route: "Vía Oral",
        dosage: "1 tableta (500 mg)",
        frequency: "Cada 8 horas durante los días de sangrado abundante",
        duration: "Máximo 4 días por ciclo menstrual",
        instructions: "Tomar únicamente los días de sangrado profuso para disminuir el flujo.",
        quantity: "1 caja",
      },
      {
        id: "rec-item-502",
        medicationName: "Hierro Polimaltosado 100mg",
        presentation: "Caja x 30 tabletas masticables",
        route: "Vía Oral",
        dosage: "1 tableta diaria",
        frequency: "Cada 24 horas después del almuerzo",
        duration: "Por 3 meses continuos",
        instructions: "Tratamiento de soporte para corregir la anemia ferropénica secundaria.",
        quantity: "3 cajas",
      },
    ],
    general_indications: "Control de hemograma a los 60 días. Evitar antiinflamatorios que alteren la coagulación.",
    next_appointment_date: "2026-12-10",
  },
];

async function seedRecetas() {
  console.log("\n=======================================================");
  console.log("🌱 CENDO - INYECTANDO RECETAS MÉDICAS OFICIALES EN LA NUBE");
  console.log("=======================================================\n");

  for (const rec of OFFICIAL_PRESCRIPTIONS) {
    const { data, error } = await supabase
      .from("medical_prescriptions")
      .upsert(rec, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error al inyectar receta ${rec.id}:`, error.message);
    } else {
      console.log(`✔ Receta registrada: ${rec.prescription_date} - ${rec.doctor_name}`);
      console.log(`   Diagnóstico: ${rec.diagnosis} [${rec.cie10_code}]`);
      console.log(`   Fármacos: ${rec.items.map((i) => i.medicationName).join(" | ")}`);
    }
  }

  console.log("\n=======================================================");
  console.log("🎉 INYECCIÓN DE RECETAS MÉDICAS COMPLETADA EXITOSAMENTE");
  console.log("=======================================================\n");
}

seedRecetas();
