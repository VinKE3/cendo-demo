/**
 * CENDO - Inyector de Informes Colposcópicos IFCPC 2011 Oficiales
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

const OFFICIAL_COLPOSCOPY_REPORTS = [
  {
    id: "a4000000-0000-0000-0000-000000000001",
    patient_id: "10000000-0000-0000-0000-000000000001", // Luciana Ramos
    report_date: "2026-11-04",
    adequate_colposcopy: true,
    squamocolumnar_junction_visible: "Visible",
    transformation_zone_type: "Tipo 1",
    mature_squamous_epithelium: true,
    ectopy: true,
    thin_acetowhite_epithelium: false,
    irregular_border: false,
    fine_mosaic: false,
    fine_punctation: false,
    dense_acetowhite_epithelium: false,
    coarse_mosaic: false,
    coarse_punctation: false,
    atypical_vessels: false,
    schiller_test: "Negativo (Lugol Caoba homogéneo)",
    cervical_biopsy_taken: false,
    biopsy_clock_hours: [],
    images: [
      {
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop",
        caption: "Cérvix con SSF: Ectopia periorificial fisiológica leve",
        timestamp: "2026-11-04 10:45",
      },
      {
        url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=500&auto=format&fit=crop",
        caption: "Ácido acético al 5%: Sin cambios acetoblancos patológicos",
        timestamp: "2026-11-04 10:48",
      },
      {
        url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=500&auto=format&fit=crop",
        caption: "Detalle de ZT Tipo 1 completamente visible",
        timestamp: "2026-11-04 10:51",
      },
      {
        url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=500&auto=format&fit=crop",
        caption: "Test de Schiller: Captación homogénea caoba (Negativo)",
        timestamp: "2026-11-04 10:54",
      },
    ],
    diagnosis: "Colposcopía adecuada satisfactoria. Zona de transformación Tipo 1. Ectopia periorificial fisiológica sin atipia colposcópica.",
    plan_recommendations: "Control citológico ginecológico preventivo en 1 año. Manejo hormonal de endometriosis con Dienogest 2mg.",
    cie10_code: "Z01.4",
    doctor_name: "Dr. Patrick José Jacinto Gomero",
  },
  {
    id: "a4000000-0000-0000-0000-000000000002",
    patient_id: "10000000-0000-0000-0000-000000000004", // Daniela Castro
    report_date: "2026-11-01",
    adequate_colposcopy: true,
    squamocolumnar_junction_visible: "Visible",
    transformation_zone_type: "Tipo 2",
    mature_squamous_epithelium: false,
    ectopy: true,
    thin_acetowhite_epithelium: false,
    irregular_border: false,
    fine_mosaic: false,
    fine_punctation: false,
    dense_acetowhite_epithelium: true,
    coarse_mosaic: true,
    coarse_punctation: true,
    atypical_vessels: false,
    schiller_test: "Positivo (Yodo negativo - Amarillo mostaza)",
    cervical_biopsy_taken: true,
    biopsy_clock_hours: ["11", "1"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop",
        caption: "Ácido acético al 5%: Epitelio acetoblanco denso en labio anterior con mosaico grueso",
        timestamp: "2026-11-01 11:15",
      },
      {
        url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=500&auto=format&fit=crop",
        caption: "Test de Schiller: Defecto de captación yodo-negativo mostaza a horas 11 a 1",
        timestamp: "2026-11-01 11:18",
      },
    ],
    diagnosis: "Hallazgos colposcópicos anormales Grado 2 (Mayores) IFCPC 2011 / Sospecha de LIE-AG (NIC 2).",
    plan_recommendations: "Biopsia cervical dirigida Tischler tomada a horas 11 y 1 enviada a patología. Plan de Conización LEEP ambulatoria según resultado.",
    cie10_code: "N87.1",
    doctor_name: "Dr. Patrick José Jacinto Gomero",
  },
  {
    id: "a4000000-0000-0000-0000-000000000003",
    patient_id: "10000000-0000-0000-0000-000000000003", // Camila Valdivia
    report_date: "2026-10-25",
    adequate_colposcopy: true,
    squamocolumnar_junction_visible: "Visible",
    transformation_zone_type: "Tipo 1",
    mature_squamous_epithelium: true,
    ectopy: true,
    thin_acetowhite_epithelium: true,
    irregular_border: true,
    fine_mosaic: true,
    fine_punctation: false,
    dense_acetowhite_epithelium: false,
    coarse_mosaic: false,
    coarse_punctation: false,
    atypical_vessels: false,
    schiller_test: "Parcial (Captación moteada heterogénea)",
    cervical_biopsy_taken: false,
    biopsy_clock_hours: [],
    images: [
      {
        url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=500&auto=format&fit=crop",
        caption: "ZT Tipo 1 con epitelio acetoblanco tenue periorificial y punteado fino",
        timestamp: "2026-10-25 16:30",
      },
    ],
    diagnosis: "Hallazgos colposcópicos anormales Grado 1 (Menores) IFCPC 2011 compatibles con Cervicitis reactiva / Cambios inflamatorios leves.",
    plan_recommendations: "Tratamiento tópico antiinflamatorio con óvulos vaginales por 7 noches. Reevaluación colposcópica y citológica en 6 meses.",
    cie10_code: "N72",
    doctor_name: "Dr. Patrick José Jacinto Gomero",
  },
];

async function seed() {
  console.log("🌱 Sembrando informes de colposcopía oficiales CENDO en Supabase...");
  let count = 0;

  for (const report of OFFICIAL_COLPOSCOPY_REPORTS) {
    const { error } = await supabase
      .from("colposcopy_reports")
      .upsert(report, { onConflict: "id" });

    if (error) {
      console.error(`❌ Error en colposcopía ${report.id}:`, error.message);
    } else {
      console.log(`✔ Sembrada colposcopía: ${report.diagnosis.slice(0, 55)}... (${report.cie10_code})`);
      count++;
    }
  }

  console.log(`\n🎉 ${count}/${OFFICIAL_COLPOSCOPY_REPORTS.length} informes de colposcopía oficiales activos en Supabase Cloud.`);
}

seed();
