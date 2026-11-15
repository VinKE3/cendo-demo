/**
 * CENDO - Inyector de Procedimientos Menores & Biopsias Oficiales
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

const OFFICIAL_PROCEDURES = [
  {
    id: "60000000-0000-0000-0000-000000000001",
    patient_id: "10000000-0000-0000-0000-000000000001", // Luciana Ramos
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick José Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    procedure_date: "2026-11-04",
    procedure_type: "INSERCION_IMPLANTE",
    pre_op_diagnosis: "Deseo de anticoncepción reversible de larga duración (LARC)",
    post_op_diagnosis: "Inserción exitosa de implante subdérmico Jadelle (2 varillas)",
    cie10_code: "Z30.0",
    anesthesia_type: "Local (Lidocaína 2%)",
    procedure_details: {
      asepsisTechnique: "Antisepsia estricta con Clorhexidina al 2% en cara anterointerna de brazo no dominante.",
      specimenSentToPathology: false,
      bleedingAmount: "Mínimo (< 10 ml)",
      hemostasisMethod: "Compresión",
      complications: "Sin complicaciones inmediatas. Adecuada palpación subdérmica de ambas varillas en V.",
    },
    post_op_indications: "Mantener vendaje compresivo durante 24 horas. Evitar mojar la zona por 48 horas. Signos de alarma explicados.",
    medications_prescribed: "Paracetamol 500 mg condicional a dolor local.",
    next_control_date: "2026-12-08",
  },
  {
    id: "60000000-0000-0000-0000-000000000002",
    patient_id: "10000000-0000-0000-0000-000000000004", // Daniela Castro
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick José Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    procedure_date: "2026-11-01",
    procedure_type: "BIOPSIA_CERVICAL",
    pre_op_diagnosis: "Sospecha colposcópica de LIE-AG / NIC 2 en labio anterior",
    post_op_diagnosis: "Biopsia de cuello uterino dirigida Tischler a horas 11 y 1",
    cie10_code: "N87.1",
    anesthesia_type: "Tópica",
    procedure_details: {
      asepsisTechnique: "Colocación de espéculo bivalvo estéril, lavado cervical con SSF y solución de ác. acético al 5%.",
      biopsySites: "Horas 11:00 y 1:00 sobre epitelio acetoblanco denso",
      specimenSentToPathology: true,
      specimenDescription: "Dos fragmentos tisulares blanquecino-rosáceos de 3x2 mm fijados en formol tamponado al 10%.",
      bleedingAmount: "Escaso",
      hemostasisMethod: "Solución de Monsel",
      complications: "Ninguna. Excelente hemostasia con pasta de Monsel.",
    },
    post_op_indications: "Reposo relativo por 24 horas. No duchas vaginales ni relaciones sexuales por 7 días. Acudir con resultado de patología.",
    medications_prescribed: "Ibuprofeno 400 mg cada 8 horas por 2 días si cólico.",
    next_control_date: "2026-11-10",
  },
  {
    id: "60000000-0000-0000-0000-000000000003",
    patient_id: "10000000-0000-0000-0000-000000000005", // Rosa Elena Huamán
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick José Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    procedure_date: "2026-11-12",
    procedure_type: "BIOPSIA_ENDOMETRIAL",
    pre_op_diagnosis: "Síndrome climatérico en evaluación para TRH / Confirmación de atrofia endometrial",
    post_op_diagnosis: "Biopsia endometrial por aspiración tipo Pipelle ambulatoria",
    cie10_code: "N95.1",
    anesthesia_type: "Sin Anestesia",
    procedure_details: {
      asepsisTechnique: "Limpieza con povidona yodada en cérvix, pinzamiento suave con Pozzi, inserción de cánula Pipelle de 3.1 mm.",
      biopsySites: "Cavidad endometrial completa por aspiración circunferencial",
      specimenSentToPathology: true,
      specimenDescription: "Escasas hebras mucosas y tisulares endometriales fijadas en formol al 10%.",
      bleedingAmount: "Mínimo (< 10 ml)",
      hemostasisMethod: "Compresión",
      complications: "Molestia leve tipo dismenorrea tolerable de 3 minutos. Sin sangrado activo.",
    },
    post_op_indications: "Uso de toalla higiénica por 24 horas por manchado leve esperado. Reposo relativo el día del procedimiento.",
    medications_prescribed: "Paracetamol 500 mg en caso de cólico leve.",
    next_control_date: "2026-12-03",
  },
  {
    id: "60000000-0000-0000-0000-000000000004",
    patient_id: "10000000-0000-0000-0000-000000000003", // Camila Valdivia
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick José Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    procedure_date: "2026-10-28",
    procedure_type: "POLIPECTOMIA",
    pre_op_diagnosis: "Pólipo endocervical pediculado sintomático con sangrado intermenstrual",
    post_op_diagnosis: "Polipectomía endocervical por torsión y ligadura de pedículo",
    cie10_code: "N84.1",
    anesthesia_type: "Local (Lidocaína 2%)",
    procedure_details: {
      asepsisTechnique: "Espéculo de Collins, visualización de pólipo de 15x8 mm emergiendo de orificio cervical externo.",
      biopsySites: "Canal endocervical distal",
      specimenSentToPathology: true,
      specimenDescription: "Pieza polipoide rojiza única de 16x8 mm en formol al 10%.",
      bleedingAmount: "Mínimo (< 10 ml)",
      hemostasisMethod: "Solución de Monsel",
      complications: "Excelente tolerancia, lecho pedicular seco tras aplicación de Monsel.",
    },
    post_op_indications: "Abstinencia sexual 7 días. Acudir a recojo de informe anatomopatológico.",
    medications_prescribed: "Paracetamol 500 mg condicional a dolor.",
    next_control_date: "2026-11-08",
  },
];

async function seed() {
  console.log("🌱 Sembrando procedimientos menores oficiales CENDO en Supabase...");
  let count = 0;

  for (const proc of OFFICIAL_PROCEDURES) {
    const { error } = await supabase
      .from("minor_procedures")
      .upsert(proc, { onConflict: "id" });

    if (error) {
      console.error(`❌ Error en procedimiento ${proc.id}:`, error.message);
    } else {
      console.log(`✔ Sembrado procedimiento: [${proc.procedure_type}] ${proc.post_op_diagnosis.slice(0, 50)}...`);
      count++;
    }
  }

  console.log(`\n🎉 ${count}/${OFFICIAL_PROCEDURES.length} procedimientos menores oficiales activos en Supabase Cloud.`);
}

seed();
