/**
 * CENDO - Inyector de Consultas Clínicas Oficiales Estructuradas
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

const OFFICIAL_CONSULTATIONS = [
  {
    id: "c0000000-0000-0000-0000-000000000001",
    patient_id: "10000000-0000-0000-0000-000000000001", // Luciana Ramos
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    consultation_date: "2026-11-14",
    reason_for_visit: "Dolor pélvico crónico intenso y dismenorrea severa incapacitante",
    illness_time: "10 meses",
    symptoms: "Dismenorrea EVA 9/10 que no cede con AINEs habituales, dispareunia profunda",
    vital_signs: {
      bloodPressure: "110/70",
      heartRate: 74,
      respiratoryRate: 18,
      temperature: 36.5,
      oxygenSaturation: 99,
      weightKg: 54.0,
      heightCm: 160,
      bmi: 21.09,
    },
    physical_exam: {
      generalExam: "Paciente en regular estado general, lúcida y colaboradora, orientada en las 3 esferas.",
      breastsExam: "Mamas simétricas sin nódulos ni secreciones anómalas.",
      externalGenitalia: "Genitales externos normotróficos sin lesiones.",
      speculoscopy: "Vagina elástica, cérvix posterior con retracción leve hacia fórnix posterior.",
      bimanualPalpation: "Útero en RVF fijado, dolor exquisito a la palpación de ligamentos uterosacros engrosados.",
    },
    diagnosis: "Endometriosis pélvica profunda infiltrante (N80.3)",
    cie10_code: "N80.3",
    treatment_plan: "1. Dienogest 2mg VO c/24h continuo.\n2. Ecografía Doppler transvaginal de mapeo de endometriosis.\n3. Antiespasmódico con analgesia escalonada en crisis.",
    auxiliary_exams: "Ecografía especializada transvaginal con preparación intestinal, CA-125, Perfil hepático",
    prescription_notes: "Dienogest 2mg #28 comp, Ketorolaco 10mg SL condicional a dolor intenso",
    next_appointment_date: "2026-12-14",
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    patient_id: "10000000-0000-0000-0000-000000000002", // Fiorella Mendoza
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    consultation_date: "2026-11-14",
    reason_for_visit: "Evaluación especializada por endometrioma ovárico izquierdo en ecografía previa",
    illness_time: "6 meses",
    symptoms: "Dolor pélvico en fosa ilíaca izquierda cíclico y sensación de pesadez pélvica",
    vital_signs: {
      bloodPressure: "120/80",
      heartRate: 68,
      respiratoryRate: 16,
      temperature: 36.4,
      oxygenSaturation: 98,
      weightKg: 62.0,
      heightCm: 165,
      bmi: 22.77,
    },
    physical_exam: {
      generalExam: "Paciente en buen estado general, lúcida y hemodinámicamente estable.",
      breastsExam: "Mamas sin alteraciones al examen físico.",
      externalGenitalia: "Genitales externos normales.",
      speculoscopy: "Cérvix cerrado, no sangrante al contacto.",
      bimanualPalpation: "Útero AVF tamaño normal. Masa quística dolorosa en anexo izquierdo móvil.",
    },
    diagnosis: "Endometrioma ovárico izquierdo con dolor pélvico cíclico (N80.1)",
    cie10_code: "N80.1",
    treatment_plan: "1. Programar ecografía de control ginecológica para medir volumen del endometrioma.\n2. Considerar abordaje laparoscópico si persiste sintomatología.",
    auxiliary_exams: "Ecografía Doppler ginecológica transvaginal, Hemograma completo",
    prescription_notes: "Ibuprofeno 400mg c/8h condicional a dolor menstrual",
    next_appointment_date: "2026-12-05",
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    patient_id: "10000000-0000-0000-0000-000000000003", // Gabriela Paredes
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    consultation_date: "2026-11-14",
    reason_for_visit: "Control Prenatal Oficial II Trimestre (Semana 22)",
    illness_time: "Gestación actual",
    symptoms: "Movimientos fetales percibidos claramente, sin cefalea ni edemas",
    vital_signs: {
      bloodPressure: "105/65",
      heartRate: 78,
      respiratoryRate: 18,
      temperature: 36.6,
      oxygenSaturation: 99,
      weightKg: 64.0,
      heightCm: 158,
      bmi: 25.64,
    },
    physical_exam: {
      generalExam: "Gestante en excelente estado general, eutrófica y con adecuada ganancia de peso.",
      breastsExam: "Mamas con areolas hiperpigmentadas, calostro presente a la expresión suave.",
      externalGenitalia: "Genitales externos sanos.",
      speculoscopy: "Cérvix epitelizado sin pérdidas hemáticas ni de líquido amniótico.",
      bimanualPalpation: "Altura uterina 21 cm acorde a edad gestacional. LCF 144 lpm audibles.",
    },
    diagnosis: "Supervisión de primer embarazo normal de curso favorable (Z34.0)",
    cie10_code: "Z34.0",
    treatment_plan: "1. Continuar con suplementación de hierro elemental + ácido fólico + calcio.\n2. Ecografía morfológica del segundo trimestre.",
    auxiliary_exams: "Ecografía morfológica fetal avanzada, Test de O'Sullivan para diabetes gestacional",
    prescription_notes: "Sulfato ferroso + Ácido fólico 1 tableta diaria en ayunas, Calcio 500mg c/12h",
    next_appointment_date: "2026-12-12",
  },
  {
    id: "c0000000-0000-0000-0000-000000000004",
    patient_id: "10000000-0000-0000-0000-000000000004", // Daniela Castro
    doctor_id: "doc-carlos-mendoza",
    doctor_name: "Dr. Carlos Mendoza",
    doctor_cmp: "55432",
    doctor_rne: "29871",
    consultation_date: "2026-11-13",
    reason_for_visit: "Evaluación colposcópica por resultado de citología cervical anormal",
    illness_time: "1 mes",
    symptoms: "Asintomática, detección en chequeo de tamizaje preventivo",
    vital_signs: {
      bloodPressure: "115/70",
      heartRate: 72,
      respiratoryRate: 16,
      temperature: 36.5,
      oxygenSaturation: 98,
      weightKg: 58.0,
      heightCm: 163,
      bmi: 21.83,
    },
    physical_exam: {
      generalExam: "Paciente lúcida, orientada, tranquila.",
      breastsExam: "Mamas simétricas sin nódulos.",
      externalGenitalia: "Sin lesiones dérmicas en vulva y periné.",
      speculoscopy: "Epitelio acetoblanco denso en labio anterior a horas 12 con orificios glandulares rodeados de borde neto.",
      bimanualPalpation: "Útero AVF regular, móvil y no doloroso.",
    },
    diagnosis: "Neoplasia Intraepitelial Cervical Grado 2 (NIC 2 / LIE-AG) (N87.1)",
    cie10_code: "N87.1",
    treatment_plan: "1. Colposcopía con biopsia dirigida de la zona de transformación.\n2. Genotipificación de VPH de alto riesgo.",
    auxiliary_exams: "Biopsia de cérvix, Genotipificación VPH ARN/ADN",
    prescription_notes: "Óvulos de cicatrización y regeneración post-biopsia",
    next_appointment_date: "2026-11-27",
  },
  {
    id: "c0000000-0000-0000-0000-000000000005",
    patient_id: "10000000-0000-0000-0000-000000000005", // Carmen Huamán
    doctor_id: "doc-andrea-morales",
    doctor_name: "Dra. Andrea Morales",
    doctor_cmp: "67890",
    doctor_rne: "31245",
    consultation_date: "2026-11-12",
    reason_for_visit: "Sangrado menstrual abundante con coágulos y anemia leve",
    illness_time: "1 año",
    symptoms: "Hipermenorrea y menorragia de 8 días de duración, astenia y fatiga diurna",
    vital_signs: {
      bloodPressure: "125/80",
      heartRate: 80,
      respiratoryRate: 18,
      temperature: 36.7,
      oxygenSaturation: 97,
      weightKg: 68.0,
      heightCm: 155,
      bmi: 28.3,
    },
    physical_exam: {
      generalExam: "Palidez cutáneo-mucosa leve (+/+++), orientada.",
      breastsExam: "Mamas sin alteraciones patológicas palpables.",
      externalGenitalia: "Genitales normales.",
      speculoscopy: "Cérvix eutrófico, escaso sangrado residual oscuro.",
      bimanualPalpation: "Útero aumentado de tamaño equivalente a 12 semanas de gestación, irregular y firme.",
    },
    diagnosis: "Leiomiomatosis uterina intramural sintomática (D25.9)",
    cie10_code: "D25.9",
    treatment_plan: "1. Ácido tranexámico en días de sangrado abundante.\n2. Suplemento hematínico con hierro sacarato o polimaltosado.\n3. Ecografía pélvica mapeo de miomas.",
    auxiliary_exams: "Hemograma completo, Ferritina sérica, Ecografía pélvica con transductor de alta resolución",
    prescription_notes: "Ácido tranexámico 500mg c/8h por 3 días durante el flujo, Hierro polimaltosado 100mg diario",
    next_appointment_date: "2026-12-10",
  },
];

async function seedConsultas() {
  console.log("\n=======================================================");
  console.log("🌱 CENDO - INYECTANDO CONSULTAS CLÍNICAS OFICIALES EN LA NUBE");
  console.log("=======================================================\n");

  for (const cons of OFFICIAL_CONSULTATIONS) {
    const { data, error } = await supabase
      .from("medical_consultations")
      .upsert(cons, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error al inyectar consulta ${cons.id}:`, error.message);
    } else {
      console.log(`✔ Consulta registrada: ${cons.consultation_date} - ${cons.doctor_name}`);
      console.log(`   Diagnóstico: ${cons.diagnosis} [${cons.cie10_code}]`);
      console.log(`   Signos vitales: PA ${cons.vital_signs.bloodPressure} | IMC ${cons.vital_signs.bmi}`);
    }
  }

  console.log("\n=======================================================");
  console.log("🎉 INYECCIÓN DE CONSULTAS COMPLETADA EXITOSAMENTE");
  console.log("=======================================================\n");
}

seedConsultas();
