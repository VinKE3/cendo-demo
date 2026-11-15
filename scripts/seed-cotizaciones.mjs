/**
 * CENDO - Inyector de Cotizaciones y Presupuestos Oficiales
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

const OFFICIAL_QUOTES = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    patient_id: "10000000-0000-0000-0000-000000000001", // Luciana Ramos
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    quote_date: "2026-11-14",
    validity_days: 30,
    items: [
      {
        procedureId: "proc-eco-doppler",
        code: "ECO-001",
        name: "Ecografía Doppler Ginecológica y Mapeo de Endometriosis",
        category: "Ecografía Especializada",
        regularPrice: 280,
        discountPercent: 10,
        finalPrice: 252,
      },
      {
        procedureId: "proc-consulta-esp",
        code: "CONS-001",
        name: "Consulta Médica Ginecológica Especializada",
        category: "Consultas Médicas",
        regularPrice: 150,
        discountPercent: 0,
        finalPrice: 150,
      },
    ],
    subtotal: 430,
    discount_total: 28,
    total: 402,
    payment_terms: "50% al reservar turno, 50% el día del examen. Aceptamos efectivo, transferencias y tarjetas.",
    notes: "Presupuesto especial por paquete de diagnóstico integral de endometriosis profunda.",
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    patient_id: "10000000-0000-0000-0000-000000000002", // Fiorella Mendoza
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    quote_date: "2026-11-14",
    validity_days: 30,
    items: [
      {
        procedureId: "proc-eco-tv",
        code: "ECO-002",
        name: "Ecografía Transvaginal de Alta Resolución con Mapeo Ovárico",
        category: "Ecografía Especializada",
        regularPrice: 180,
        discountPercent: 0,
        finalPrice: 180,
      },
      {
        procedureId: "proc-control-postop",
        code: "CONS-002",
        name: "Control Médico Ginecológico Periódico",
        category: "Consultas Médicas",
        regularPrice: 120,
        discountPercent: 15,
        finalPrice: 102,
      },
    ],
    subtotal: 300,
    discount_total: 18,
    total: 282,
    payment_terms: "Pago único en recepción. Aceptamos tarjetas Visa / Mastercard sin recargo.",
    notes: "Válido por 30 días calendario para seguimiento de quiste endometriósico.",
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    patient_id: "10000000-0000-0000-0000-000000000003", // Gabriela Paredes
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    quote_date: "2026-11-14",
    validity_days: 45,
    items: [
      {
        procedureId: "proc-eco-morfo",
        code: "ECO-003",
        name: "Ecografía Morfológica Fetal Avanzada (20-24 Semanas)",
        category: "Ecografía Obstétrica",
        regularPrice: 320,
        discountPercent: 10,
        finalPrice: 288,
      },
      {
        procedureId: "proc-control-prenatal",
        code: "CONS-003",
        name: "Control Prenatal Oficial Especializado",
        category: "Consultas Médicas",
        regularPrice: 130,
        discountPercent: 0,
        finalPrice: 130,
      },
    ],
    subtotal: 450,
    discount_total: 32,
    total: 418,
    payment_terms: "Efectivo, transferencia BCP o Yape/Plin corporativo.",
    notes: "Incluye entrega de reporte ecográfico a color y grabación digital para los padres.",
  },
  {
    id: "d0000000-0000-0000-0000-000000000004",
    patient_id: "10000000-0000-0000-0000-000000000004", // Daniela Castro
    doctor_id: "doc-carlos-mendoza",
    doctor_name: "Dr. Carlos Mendoza",
    quote_date: "2026-11-13",
    validity_days: 30,
    items: [
      {
        procedureId: "proc-colpo",
        code: "PROC-001",
        name: "Colposcopía Digital de Alta Resolución con Biopsia Cervical",
        category: "Procedimientos Menores",
        regularPrice: 350,
        discountPercent: 0,
        finalPrice: 350,
      },
      {
        procedureId: "proc-patol",
        code: "LAB-001",
        name: "Estudio Anatomopatológico de Biopsia de Cérvix",
        category: "Patología",
        regularPrice: 180,
        discountPercent: 10,
        finalPrice: 162,
      },
    ],
    subtotal: 530,
    discount_total: 18,
    total: 512,
    payment_terms: "50% al iniciar el procedimiento, saldo a la entrega del informe patológico.",
    notes: "Incluye consulta post-biopsia de revisión de resultados y conducta terapéutica.",
  },
  {
    id: "d0000000-0000-0000-0000-000000000005",
    patient_id: "10000000-0000-0000-0000-000000000005", // Carmen Huamán
    doctor_id: "doc-andrea-morales",
    doctor_name: "Dra. Andrea Morales",
    quote_date: "2026-11-12",
    validity_days: 30,
    items: [
      {
        procedureId: "proc-eco-pelv",
        code: "ECO-004",
        name: "Ecografía Pélvica Transabdominal y Mapeo Miomatoso",
        category: "Ecografía Especializada",
        regularPrice: 160,
        discountPercent: 10,
        finalPrice: 144,
      },
      {
        procedureId: "proc-chequeo-int",
        code: "PAQ-001",
        name: "Paquete Chequeo Ginecológico Preventivo Integral CENDO",
        category: "Paquetes Preventivos",
        regularPrice: 290,
        discountPercent: 15,
        finalPrice: 246.5,
      },
    ],
    subtotal: 450,
    discount_total: 59.5,
    total: 390.5,
    payment_terms: "Pago al contado o hasta 3 cuotas sin intereses con tarjetas BBVA/BCP.",
    notes: "Promoción integral para evaluación de miomatosis uterina y despistaje anual.",
  },
];

async function seedCotizaciones() {
  console.log("\n=======================================================");
  console.log("🌱 CENDO - INYECTANDO COTIZACIONES Y PRESUPUESTOS OFICIALES");
  console.log("=======================================================\n");

  for (const quote of OFFICIAL_QUOTES) {
    const { data, error } = await supabase
      .from("procedure_quotes")
      .upsert(quote, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error al inyectar cotización ${quote.id}:`, error.message);
    } else {
      console.log(`✔ Cotización registrada: ${quote.quote_date} - ${quote.doctor_name}`);
      console.log(`   Procedimientos: ${quote.items.map((i) => i.name).join(" + ")}`);
      console.log(`   Subtotal: S/ ${quote.subtotal} | Descuento: S/ ${quote.discount_total} | Total: S/ ${quote.total}`);
    }
  }

  console.log("\n=======================================================");
  console.log("🎉 INYECCIÓN DE COTIZACIONES COMPLETADA EXITOSAMENTE");
  console.log("=======================================================\n");
}

seedCotizaciones();
