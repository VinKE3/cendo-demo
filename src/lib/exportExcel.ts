import * as XLSX from "xlsx";
import {
  Patient,
  PatientBackground,
  ColposcopyReport,
  ClinicalCheckup,
} from "@/types/medical";

export interface ExportFilterOptions {
  startDate?: string;
  endDate?: string;
  patientId?: string;
}

export interface ClinicalExportRow {
  // 1-9: Filiación de Paciente
  "DNI": string;
  "Apellidos": string;
  "Nombres": string;
  "Edad": number;
  "Fecha Nacimiento": string;
  "Teléfono": string;
  "Email": string;
  "Dirección": string;
  "Estado Civil": string;
  "Ocupación": string;

  // 10-21: Antecedentes Gineco-Obstétricos
  "Menarquia": string;
  "Inicio Relaciones (IRS)": string;
  "N° Parejas Sexuales": string;
  "Fórmula Obstétrica": string;
  "Método Anticonceptivo (MAC)": string;
  "FUR": string;
  "Historial PAP": string;
  "Historial VPH": string;
  "Alergias Medicamentosas": string;
  "Cirugías Previas": string;
  "Antecedentes Familiares": string;
  "Notas Antecedentes": string;

  // 22-35: Chequeo Integral & Ecografías
  "Fecha Chequeo": string;
  "Motivo Consulta": string;
  "Eco Mama Hallazgos": string;
  "Mama BI-RADS": string;
  "Lesiones Mamarias Medidas": string;
  "Eco Transvaginal Hallazgos": string;
  "Medidas Útero": string;
  "Grosor Endometrial (mm)": number | string;
  "Hallazgos Ovarios": string;
  "PAP Resultado": string;
  "VPH PCR Resultado": string;
  "Conclusiones Chequeo": string;
  "Prescripción Médica": string;

  // 36-57: Colposcopía IFCPC Río de Janeiro
  "Fecha Colposcopía": string;
  "Colposcopía Adecuada": string;
  "Unión Escamocolumnar (UEC)": string;
  "Zona de Transformación (ZT)": string;
  "Epitelio Escamoso Maduro": string;
  "Ectopia Cervical": string;
  "Acetoblanco Tenue (Grado 1)": string;
  "Acetoblanco Denso (Grado 2)": string;
  "Borde Irregular": string;
  "Mosaico Fino": string;
  "Mosaico Grueso": string;
  "Punteado Fino": string;
  "Punteado Grueso": string;
  "Vasos Atípicos": string;
  "Test de Schiller": string;
  "Biopsia Cervical Tomada": string;
  "Horas de Biopsia (Reloj)": string;
  "Diagnóstico Colposcópico": string;
  "Código CIE-10": string;
  "Conducta / Recomendaciones": string;
  "Médico Colposcopista": string;

  // 58-59: Metadatos y Auditoría
  "ID Ficha Paciente": string;
  "Fecha Registro Sistema": string;
}

export function buildClinicalExportRows(
  patients: Patient[],
  backgrounds: Record<string, PatientBackground>,
  colposcopyReports: ColposcopyReport[],
  clinicalCheckups: ClinicalCheckup[],
  filters: ExportFilterOptions = {}
): ClinicalExportRow[] {
  let targetPatients = patients;

  if (filters.patientId && filters.patientId !== "all") {
    targetPatients = targetPatients.filter((p) => p.id === filters.patientId);
  }

  const rows: ClinicalExportRow[] = [];

  for (const p of targetPatients) {
    const bg = backgrounds[p.id];
    let pColpos = colposcopyReports.filter((c) => c.patientId === p.id);
    let pCheckups = clinicalCheckups.filter((chk) => chk.patientId === p.id);

    // Filtrar por fechas si se especificaron
    if (filters.startDate) {
      pColpos = pColpos.filter((c) => c.reportDate >= filters.startDate!);
      pCheckups = pCheckups.filter((chk) => chk.checkupDate >= filters.startDate!);
    }
    if (filters.endDate) {
      pColpos = pColpos.filter((c) => c.reportDate <= filters.endDate!);
      pCheckups = pCheckups.filter((chk) => chk.checkupDate <= filters.endDate!);
    }

    const maxRecords = Math.max(pColpos.length, pCheckups.length, 1);

    for (let i = 0; i < maxRecords; i++) {
      const colpo = pColpos[i] || null;
      const checkup = pCheckups[i] || null;

      rows.push({
        // 1-10: Filiación
        "DNI": p.dni,
        "Apellidos": p.lastName,
        "Nombres": p.firstName,
        "Edad": p.age,
        "Fecha Nacimiento": p.birthDate,
        "Teléfono": p.phone,
        "Email": p.email || "No registra",
        "Dirección": p.address || "Miraflores",
        "Estado Civil": p.civilStatus,
        "Ocupación": p.occupation || "No refiere",

        // 11-22: Antecedentes
        "Menarquia": bg?.menarche ? `${bg.menarche} años` : "No precisa",
        "Inicio Relaciones (IRS)": bg?.sexualDebutAge ? `${bg.sexualDebutAge} años` : "No precisa",
        "N° Parejas Sexuales": bg?.sexualPartnersCount !== undefined ? String(bg.sexualPartnersCount) : "No precisa",
        "Fórmula Obstétrica": bg?.obstetricFormula || "G0 P0000",
        "Método Anticonceptivo (MAC)": bg?.contraceptiveMethod || "Ninguno",
        "FUR": bg?.lastMenstrualPeriod || "No precisa",
        "Historial PAP": bg?.papHistory || "Sin antecedentes",
        "Historial VPH": bg?.vphTestHistory || "No realizado",
        "Alergias Medicamentosas": bg?.medicalAllergies || "Niega",
        "Cirugías Previas": bg?.surgeriesHistory || "Niega",
        "Antecedentes Familiares": bg?.familyHistory || "Sin antecedentes",
        "Notas Antecedentes": bg?.notes || "",

        // 23-35: Chequeo & Ecografías
        "Fecha Chequeo": checkup?.checkupDate || "---",
        "Motivo Consulta": checkup?.reasonForConsultation || "---",
        "Eco Mama Hallazgos": checkup?.breastUltrasoundFindings || "---",
        "Mama BI-RADS": checkup?.breastUltrasoundBirads || "---",
        "Lesiones Mamarias Medidas": checkup?.breastLesionMeasurements || "---",
        "Eco Transvaginal Hallazgos": checkup?.transvaginalUltrasoundFindings || "---",
        "Medidas Útero": checkup?.uterusMeasurements || "---",
        "Grosor Endometrial (mm)": checkup?.endometriumThicknessMm !== undefined ? checkup.endometriumThicknessMm : "---",
        "Hallazgos Ovarios": checkup?.ovariesFindings || "---",
        "PAP Resultado": checkup?.papResult || "---",
        "VPH PCR Resultado": checkup?.vphResult || "---",
        "Conclusiones Chequeo": checkup?.conclusions || "---",
        "Prescripción Médica": checkup?.medicalPrescription || "---",

        // 36-57: Colposcopía IFCPC
        "Fecha Colposcopía": colpo?.reportDate || "---",
        "Colposcopía Adecuada": colpo ? (colpo.adequateColposcopy ? "Sí (Adecuada)" : "No (Inadecuada)") : "---",
        "Unión Escamocolumnar (UEC)": colpo?.squamocolumnarJunctionVisible || "---",
        "Zona de Transformación (ZT)": colpo?.transformationZoneType || "---",
        "Epitelio Escamoso Maduro": colpo ? (colpo.matureSquamousEpithelium ? "Presente" : "No") : "---",
        "Ectopia Cervical": colpo ? (colpo.ectopy ? "Presente" : "Ausente") : "---",
        "Acetoblanco Tenue (Grado 1)": colpo ? (colpo.thinAcetowhiteEpithelium ? "Positivo" : "No") : "---",
        "Acetoblanco Denso (Grado 2)": colpo ? (colpo.denseAcetowhiteEpithelium ? "Positivo" : "No") : "---",
        "Borde Irregular": colpo ? (colpo.irregularBorder ? "Sí" : "No") : "---",
        "Mosaico Fino": colpo ? (colpo.fineMosaic ? "Presente" : "No") : "---",
        "Mosaico Grueso": colpo ? (colpo.coarseMosaic ? "Presente" : "No") : "---",
        "Punteado Fino": colpo ? (colpo.finePunctation ? "Presente" : "No") : "---",
        "Punteado Grueso": colpo ? (colpo.coarsePunctation ? "Presente" : "No") : "---",
        "Vasos Atípicos": colpo ? (colpo.atypicalVessels ? "Sospechosos" : "No") : "---",
        "Test de Schiller": colpo?.schillerTest || "---",
        "Biopsia Cervical Tomada": colpo ? (colpo.cervicalBiopsyTaken ? "Sí" : "No") : "---",
        "Horas de Biopsia (Reloj)": colpo?.biopsyClockHours && colpo.biopsyClockHours.length > 0
          ? colpo.biopsyClockHours.map((h) => `${h}:00 hrs`).join(", ")
          : "Sin toma de biopsia",
        "Diagnóstico Colposcópico": colpo?.diagnosis || "---",
        "Código CIE-10": colpo?.cie10Code || "---",
        "Conducta / Recomendaciones": colpo?.planRecommendations || "---",
        "Médico Colposcopista": colpo?.doctorName || "Dr. Patrick José Jacinto Gomero",

        // 58-59: Metadatos
        "ID Ficha Paciente": p.id,
        "Fecha Registro Sistema": p.createdAt,
      });
    }
  }

  return rows;
}

export function exportClinicalMatrixToExcel(
  patients: Patient[],
  backgrounds: Record<string, PatientBackground>,
  colposcopyReports: ColposcopyReport[],
  clinicalCheckups: ClinicalCheckup[],
  filters: ExportFilterOptions = {}
) {
  const rows = buildClinicalExportRows(
    patients,
    backgrounds,
    colposcopyReports,
    clinicalCheckups,
    filters
  );

  // Crear Libro y Hoja de Cálculo
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Ajuste automático de anchos de columnas
  const columnKeys = Object.keys(rows[0] || {});
  const colWidths = columnKeys.map((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.map((row) => String((row as any)[key] ?? "").length)
    );
    return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
  });

  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "CENDO_Matriz_Clinica");

  const todayStr = new Date().toISOString().split("T")[0];
  const fileName = `CENDO_Matriz_Ginecologica_${todayStr}.xlsx`;

  XLSX.writeFile(workbook, fileName);

  return {
    rowCount: rows.length,
    fileName,
  };
}

