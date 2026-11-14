/**
 * CENDO - Inyector de Medicamentos Reales para el Vademécum
 * Inserta 5 fármacos ginecológicos oficiales en Supabase Cloud.
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

const REAL_MEDICATIONS = [
  {
    id: "c2000000-0000-0000-0000-000000000001",
    generic_name: "Dienogest 2 mg",
    atc_code: "G03DB08",
    therapeutic_group: "Progestágenos / Tratamiento de Endometriosis",
    commercial_brands: [
      {
        brandName: "Visannette",
        laboratory: "Bayer Healthcare",
        presentation: "Caja x 28 comprimidos",
        referencePricePen: 280,
      },
      {
        brandName: "Dienomed",
        laboratory: "Medifarma",
        presentation: "Caja x 30 comprimidos",
        referencePricePen: 195,
      },
    ],
    indications: "Tratamiento de la endometriosis ovárica y pélvica profunda, dismenorrea severa y dolor pélvico crónico.",
    contraindications: "Trastorno tromboembólico venoso activo, enfermedad hepática severa, embarazo.",
  },
  {
    id: "c2000000-0000-0000-0000-000000000002",
    generic_name: "Ácido Tranexámico 500 mg",
    atc_code: "B02AA02",
    therapeutic_group: "Antifibrinolíticos / Hemostáticos Ginecológicos",
    commercial_brands: [
      {
        brandName: "Transamin",
        laboratory: "Daiichi Sankyo",
        presentation: "Caja x 20 tabletas",
        referencePricePen: 85,
      },
      {
        brandName: "Hemostop",
        laboratory: "Laboratorios AC Farma",
        presentation: "Caja x 30 tabletas",
        referencePricePen: 52,
      },
    ],
    indications: "Hemorragia uterina anormal (HUA-O / HUA-A), hipermenorrea por adenomiosis o miomatosis.",
    contraindications: "Antecedente de trombosis arterial o venosa, insuficiencia renal severa.",
  },
  {
    id: "c2000000-0000-0000-0000-000000000003",
    generic_name: "Metronidazol 500 mg + Miconazol 100 mg",
    atc_code: "G01AF20",
    therapeutic_group: "Antiinfecciosos y Antisépticos Ginecológicos",
    commercial_brands: [
      {
        brandName: "Ginedazol",
        laboratory: "Laboratorios Roemmers",
        presentation: "Caja x 10 óvulos vaginales",
        referencePricePen: 48,
      },
    ],
    indications: "Tratamiento tópico de vulvovaginitis mixta (vaginosis bacteriana y candidiasis vulvovaginal).",
    contraindications: "Primer trimestre de gestación, hipersensibilidad a los derivados imidazólicos.",
  },
  {
    id: "c2000000-0000-0000-0000-000000000004",
    generic_name: "Ácido Mefenámico 500 mg",
    atc_code: "M01AG01",
    therapeutic_group: "Antiinflamatorios No Esteroides (AINES)",
    commercial_brands: [
      {
        brandName: "Ponstan",
        laboratory: "Pfizer",
        presentation: "Caja x 20 tabletas",
        referencePricePen: 65,
      },
    ],
    indications: "Manejo del dolor agudo en dismenorrea primaria y secundaria por endometriosis.",
    contraindications: "Úlcera péptica activa, hipersensibilidad al ácido acetilsalicílico u otros AINES.",
  },
  {
    id: "c2000000-0000-0000-0000-000000000005",
    generic_name: "Levonorgestrel 75 mg (Implante Subdérmico Jadelle x 2 varillas)",
    atc_code: "G03AC03",
    therapeutic_group: "Anticonceptivos de Larga Duración (LARC)",
    commercial_brands: [
      {
        brandName: "Jadelle",
        laboratory: "Bayer Healthcare",
        presentation: "Caja con 2 implantes subdérmicos + trocar",
        referencePricePen: 420,
      },
    ],
    indications: "Anticoncepción de larga duración hasta por 5 años continuos.",
    contraindications: "Embarazo conocido o sospechado, enfermedad arterial severa activa.",
  },
];

async function seed() {
  console.log("🌱 Insertando 5 fármacos oficiales de CENDO en Supabase...");
  for (const med of REAL_MEDICATIONS) {
    const { error } = await supabase
      .from("medications_vademecum")
      .upsert(med, { onConflict: "id" });
    if (error) {
      console.error(`❌ Error al insertar ${med.generic_name}:`, error.message);
    } else {
      console.log(`✔ Insertado: ${med.generic_name}`);
    }
  }
  console.log("✨ Finalizado con éxito.");
}

seed();
