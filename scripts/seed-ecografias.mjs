/**
 * CENDO - Inyector de Informes Ecográficos Especializados Oficiales
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

const OFFICIAL_ULTRASOUND_REPORTS = [
  {
    id: "50000000-0000-0000-0000-000000000001",
    patient_id: "10000000-0000-0000-0000-000000000001", // Luciana Ramos
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick José Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    report_date: "2026-11-14",
    ultrasound_type: "TRANSVAGINAL",
    indication: "Mapeo ginecológico y evaluación de dolor pélvico crónico por sospecha de endometriosis",
    findings: {
      uterusPosition: "AVF",
      uterusDimensions: "75 x 42 x 48 mm",
      uterusVolumeCc: 78.4,
      myometriumStatus: "Miometrio con textura ligeramente asimétrica en pared anterior, foco adenomiósico de 14 mm.",
      endometriumThicknessMm: 7.2,
      endometriumPattern: "Secretor",
      rightOvaryDimensions: "30 x 20 mm (Vol: 6.2 cc)",
      leftOvaryDimensions: "38 x 28 mm (Vol: 15.6 cc)",
      ovariesNotes: "Ovario izquierdo presenta imagen quística unilocular de 32 mm de contenido finamente ecogénico homogéneo (vidrio esmerilado) compatible con endometrioma ovárico.",
      douglasPouch: "Fondo de saco posterior libre. Signo de deslizamiento (sliding sign) POSITIVO bilateral.",
      endometriosisFoci: "Sin nódulos infiltrantes en ligamentos uterosacros ni tabique rectovaginal.",
    },
    conclusion: "1. Endometrioma ovárico izquierdo unilocular de 32 mm.\n2. Adenomiosis focal anterior leve.\n3. Movilidad uterina y ovárica conservada (Sliding sign positivo).",
    recommendations: "Continuar tratamiento hormonal con Dienogest 2mg diario continuo. Control ecográfico transvaginal en 6 meses para monitoreo de volumen quístico.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=500&auto=format&fit=crop",
        caption: "Endometrioma ovárico izquierdo de 32 mm con ecotextura en vidrio esmerilado",
      },
      {
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop",
        caption: "Útero en AVF con endometrio secretor regular de 7.2 mm",
      },
    ],
  },
  {
    id: "50000000-0000-0000-0000-000000000002",
    patient_id: "10000000-0000-0000-0000-000000000002", // María José Contreras (Gestante)
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick José Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    report_date: "2026-11-13",
    ultrasound_type: "OBSTETRICA_1T",
    indication: "Control prenatal primer trimestre (Semana 10) - Verificación de viabilidad fetal",
    findings: {
      gestationalSacsCount: 1,
      embryoCrownRumpLengthMm: 33.8,
      gestationalAgeByEcho: "10 semanas 1 día",
      fetalHeartRate: 168,
      placentaLocation: "Posterior en desarrollo normoinserta",
      amnioticFluidIndex: "Adecuado para la edad gestacional",
    },
    conclusion: "Gestación única activa intrauterina de 10 semanas. Vitalidad embrionaria y frecuencia cardíaca normal (168 lpm).",
    recommendations: "Programar ecografía genética (translucencia nucal y hueso nasal) entre las semanas 12 y 13.6. Continuar suplementación con ácido fólico y hierro.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=500&auto=format&fit=crop",
        caption: "Embrión único intrauterino con LCC de 33.8 mm correspondiente a 10 semanas",
      },
      {
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop",
        caption: "Doppler color con FCF regular de 168 latidos por minuto",
      },
    ],
  },
  {
    id: "50000000-0000-0000-0000-000000000003",
    patient_id: "10000000-0000-0000-0000-000000000003", // Camila Valdivia
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick José Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    report_date: "2026-11-09",
    ultrasound_type: "PELVICA",
    indication: "Mapeo ecográfico especializado de endometriosis profunda (Protocolo IDEA)",
    findings: {
      uterusPosition: "RVF",
      uterusDimensions: "78 x 46 x 42 mm",
      uterusVolumeCc: 79.0,
      myometriumStatus: "Heterogéneo, engrosamiento de pared posterior con estrías hipoecoicas (Adenomiosis focal).",
      endometriumThicknessMm: 8.4,
      endometriumPattern: "Secretor",
      rightOvaryDimensions: "38 x 30 x 28 mm (Vol: 16.6 cc)",
      leftOvaryDimensions: "42 x 34 x 36 mm (Vol: 26.8 cc)",
      ovariesNotes: "Endometrioma ovárico izquierdo de 42 mm y derecho de 38 mm con ecos en vidrio esmerilado. Kissing Ovaries positivo en línea media retrocervical.",
      douglasPouch: "Signo de deslizamiento (sliding sign) NEGATIVO en fondo de saco posterior. Nódulo hipoecoico de 12 mm en ligamento uterosacro izquierdo.",
      endometriosisFoci: "Compromiso de fondo de saco de Douglas con obliteración parcial y adherencias firmes.",
    },
    conclusion: "1. Endometriosis ovárica bilateral severa con Endometriomas y Kissing Ovaries.\n2. Endometriosis profunda en ligamento uterosacro izquierdo con adherencia peritoneal.\n3. Adenomiosis uterina focal posterior.",
    recommendations: "Valoración pre-quirúrgica para laparoscopía ginecológica avanzada de excisión de endometriosis profunda.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=500&auto=format&fit=crop",
        caption: "Endometrioma ovárico izquierdo de 42 mm con ecos homogéneos en vidrio esmerilado",
      },
      {
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop",
        caption: "Kissing Ovaries: Ambos ovarios adheridos retrocervicalmente en la línea media",
      },
    ],
  },
  {
    id: "50000000-0000-0000-0000-000000000004",
    patient_id: "10000000-0000-0000-0000-000000000005", // Rosa Elena Huamán
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick José Jacinto Gomero",
    doctor_cmp: "61693",
    doctor_rne: "38657",
    report_date: "2026-11-12",
    ultrasound_type: "MAMA_BILATERAL",
    indication: "Despistaje mamario ecográfico anual previo a inicio de TRH climatérica",
    findings: {
      breastPattern: "Predominio tejido adiposo con islotes fibroglandulares residuales homogéneos.",
      rightBreastFindings: "A hora 10 radio 3 se visualiza imagen anecoica de 7 x 5 mm, bordes netos, sin vascularización interna, compatible con quiste simple benigno.",
      leftBreastFindings: "Sin nódulos sólidos, quísticos ni distorsiones de la arquitectura.",
      biradsCategory: "BI-RADS 2",
    },
    conclusion: "Hallazgos ecográficos mamarios benignos. Quiste simple en mama derecha (BI-RADS 2).",
    recommendations: "Control mamario habitual en 1 año (Mamografía bilateral complementaria).",
    images: [
      {
        url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=500&auto=format&fit=crop",
        caption: "Mama derecha radio 10: Quiste simple anecoico de 7 x 5 mm BI-RADS 2",
      },
    ],
  },
];

async function seed() {
  console.log("🌱 Sembrando informes ecográficos especializados oficiales CENDO en Supabase...");
  let count = 0;

  for (const report of OFFICIAL_ULTRASOUND_REPORTS) {
    const { error } = await supabase
      .from("ultrasound_reports")
      .upsert(report, { onConflict: "id" });

    if (error) {
      console.error(`❌ Error en ecografía ${report.id}:`, error.message);
    } else {
      console.log(`✔ Sembrada ecografía: [${report.ultrasound_type}] ${report.indication.slice(0, 50)}...`);
      count++;
    }
  }

  console.log(`\n🎉 ${count}/${OFFICIAL_ULTRASOUND_REPORTS.length} informes ecográficos oficiales activos en Supabase Cloud.`);
}

seed();
