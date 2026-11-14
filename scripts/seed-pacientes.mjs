/**
 * CENDO - Inyector de Pacientes Oficiales para Demostración Clínica
 * Inserta las 5 pacientes oficiales de CENDO en Supabase Cloud.
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

const REAL_PATIENTS = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    document_number: "73819204",
    document_type: "DNI",
    dni: "73819204",
    first_name: "LUCIANA MARÍA",
    last_name: "RAMOS FIGUEROA",
    full_name: "RAMOS FIGUEROA, LUCIANA MARÍA",
    birth_date: "2001-03-15",
    age: 25,
    phone: "984 125 639",
    email: "luciana.ramos@email.com",
    address: "Av. Pardo y Aliaga 640, Dpto 302, San Isidro",
    district: "San Isidro",
    civil_status: "Soltera",
    occupation: "Licenciada en Comunicaciones",
    education_level: "Superior Universitaria Completa",
    birth_place: "Lima, Perú",
    religion: "Católica",
    insurance_info: "PACIFICO EPS",
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    document_number: "75294816",
    document_type: "DNI",
    dni: "75294816",
    first_name: "FIORELLA BEATRÍZ",
    last_name: "MENDOZA CHÁVEZ",
    full_name: "MENDOZA CHÁVEZ, FIORELLA BEATRÍZ",
    birth_date: "1996-08-22",
    age: 30,
    phone: "976 543 218",
    email: "fiorella.mendoza@email.com",
    address: "Calle Coronel Inclán 320, Dpto 402, Miraflores",
    district: "Miraflores",
    civil_status: "Casada",
    occupation: "Contadora Pública Colegiada",
    education_level: "Superior Universitaria Completa",
    birth_place: "Lima, Perú",
    religion: "Católica",
    insurance_info: "RIMAC EPS",
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    document_number: "71628493",
    document_type: "DNI",
    dni: "71628493",
    first_name: "GABRIELA ALEJANDRA",
    last_name: "PAREDES VÍLCHEZ",
    full_name: "PAREDES VÍLCHEZ, GABRIELA ALEJANDRA",
    birth_date: "1994-06-18",
    age: 32,
    phone: "992 847 163",
    email: "gabriela.paredes@email.com",
    address: "Av. Reducto 1250, Dpto 801, Miraflores",
    district: "Miraflores",
    civil_status: "Soltera",
    occupation: "Abogada Corporativa Senior",
    education_level: "Superior Universitaria Completa",
    birth_place: "Arequipa, Perú",
    religion: "Católica",
    insurance_info: "Particular / SANITAS EPS",
  },
  {
    id: "10000000-0000-0000-0000-000000000004",
    document_number: "74195820",
    document_type: "DNI",
    dni: "74195820",
    first_name: "DANIELA FERNANDA",
    last_name: "CASTRO MORALES",
    full_name: "CASTRO MORALES, DANIELA FERNANDA",
    birth_date: "1992-11-05",
    age: 34,
    phone: "987 456 123",
    email: "daniela.castro@email.com",
    address: "Malecón Balta 890, Dpto 502, Miraflores",
    district: "Miraflores",
    civil_status: "Conviviente",
    occupation: "Diseñadora Gráfica & UX",
    education_level: "Superior Técnica Completa",
    birth_place: "Lima, Perú",
    religion: "Cristiana",
    insurance_info: "Particular",
  },
  {
    id: "10000000-0000-0000-0000-000000000005",
    document_number: "09482715",
    document_type: "DNI",
    dni: "09482715",
    first_name: "CARMEN ROSA",
    last_name: "HUAMÁN QUISPE",
    full_name: "HUAMÁN QUISPE, CARMEN ROSA",
    birth_date: "1974-04-10",
    age: 52,
    phone: "981 234 567",
    email: "carmen.huaman@email.com",
    address: "Jr. Salaverry 450, Magdalena del Mar",
    district: "Magdalena del Mar",
    civil_status: "Casada",
    occupation: "Docente de Educación Primaria",
    education_level: "Superior Pedagógica Completa",
    birth_place: "Cusco, Perú",
    religion: "Católica",
    insurance_info: "ESSALUD / Particular",
  },
];

async function seedPacientes() {
  console.log("🌱 Insertando 5 pacientes oficiales de CENDO en Supabase...");
  for (const item of REAL_PATIENTS) {
    const { error } = await supabase.from("patients").upsert(item, { onConflict: "id" });
    if (error) {
      console.error(`❌ Error en ${item.full_name}:`, error.message);
    } else {
      console.log(`✔ Insertado: [DNI ${item.dni}] ${item.full_name} (${item.age} años)`);
    }
  }
  console.log("✨ Finalizado con éxito.");
}

seedPacientes();
