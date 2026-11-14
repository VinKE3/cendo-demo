/**
 * CENDO - Inyector de Tarifas Oficiales para el Tarifario Médico
 * Inserta 10 prestaciones ginecológicas oficiales en Supabase Cloud.
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

const REAL_TARIFFS = [
  {
    id: "c1000000-0000-0000-0000-000000000001",
    code: "CONS-ESP",
    name: "Consulta Médica Ginecológica Especializada",
    category: "Consulta",
    description: "Evaluación integral por especialista en ginecología, revisión de antecedentes y plan diagnóstico.",
    price: 180,
    active: true,
  },
  {
    id: "c1000000-0000-0000-0000-000000000002",
    code: "COLPO-DX",
    name: "Colposcopía Digital de Alta Resolución IFCPC con Test de Schiller",
    category: "Procedimiento",
    description: "Evaluación colposcópica completa con videocámara HD, captura fotográfica y reporte oficial.",
    price: 250,
    active: true,
  },
  {
    id: "c1000000-0000-0000-0000-000000000003",
    code: "ECO-TV",
    name: "Ecografía Ginecológica Transvaginal Doppler Color",
    category: "Ecografía",
    description: "Estudio ultrasonográfico de alta definición para útero, miometrio, endometrio y reserva ovárica.",
    price: 180,
    active: true,
  },
  {
    id: "c1000000-0000-0000-0000-000000000004",
    code: "ECO-MAMA",
    name: "Ecografía Mamaria Bilateral con Clasificación BI-RADS",
    category: "Ecografía",
    description: "Mapeo ecográfico de ambas mamas y huecos axilares por cuadrantes.",
    price: 200,
    active: true,
  },
  {
    id: "c1000000-0000-0000-0000-000000000005",
    code: "BIO-CX",
    name: "Biopsia de Cérvix Dirigida Tischler + Acondicionamiento de Muestra",
    category: "Procedimiento",
    description: "Toma de tejido cervical bajo visión colposcópica directa con hemostasia local.",
    price: 320,
    active: true,
  },
  {
    id: "c1000000-0000-0000-0000-000000000006",
    code: "PAP-CONV",
    name: "Papanicolaou Convencional en Base Líquida Bethesda",
    category: "Laboratorio",
    description: "Citología exfoliativa en medio líquido con tinción y lectura citopatológica.",
    price: 80,
    active: true,
  },
  {
    id: "c1000000-0000-0000-0000-000000000007",
    code: "LEEP-CONO",
    name: "Conización Cervical LEEP / Radiocirugía Bajo Anestesia Local",
    category: "Procedimiento",
    description: "Escisión electroquirúrgica con asa diatérmica de la zona de transformación atípica.",
    price: 1400,
    active: true,
  },
  {
    id: "c1000000-0000-0000-0000-000000000008",
    code: "HDA-ENDO",
    name: "Histeroscopía Diagnóstica Ambulatoria HD",
    category: "Procedimiento",
    description: "Inspección endoscópica del canal endocervical y cavidad endometrial sin anestesia general.",
    price: 950,
    active: true,
  },
  {
    id: "c1000000-0000-0000-0000-000000000009",
    code: "PAQ-PREV",
    name: "Chequeo Integral Ginecológico Anual CENDO",
    category: "Paquete",
    description: "Incluye: Consulta especializada + Colposcopía digital HD + Ecografía transvaginal + Papanicolaou.",
    price: 420,
    active: true,
  },
  {
    id: "c1000000-0000-0000-0000-000000000010",
    code: "IMPL-ETONO",
    name: "Inserción de Implante Anticonceptivo Subdérmico Implanon NXT",
    category: "Procedimiento",
    description: "Colocación estéril en cara interna del brazo no dominante con anestesia local.",
    price: 480,
    active: true,
  },
];

async function seedTarifario() {
  console.log("🌱 Insertando 10 tarifas médicas oficiales de CENDO en Supabase...");
  for (const item of REAL_TARIFFS) {
    const { error } = await supabase.from("procedures_tariff").upsert(item, { onConflict: "code" });
    if (error) {
      console.error(`❌ Error en ${item.code}:`, error.message);
    } else {
      console.log(`✔ Insertado: [${item.code}] ${item.name} (S/ ${item.price})`);
    }
  }
  console.log("✨ Finalizado con éxito.");
}

seedTarifario();
