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

/**
 * Matriz Histórica de 59 Columnas EXACTAS según el archivo maestro de Excel del Dr. Patrick Jacinto Gomero
 */
export interface DrPatrickMasterExportRow {
  // 1-8: Identificación & Filiación
  "CONCATENA": string;
  "Fecha de cita": string;
  "DNI:": string;
  "APELLIDOS Y NOMBRES:": string;
  "FECHA DE NACIMIENTO:": string;
  "EDAD:": number;
  "TELÉFONO:": string;
  "MÉDICO EVALUADOR:": string;

  // 9-17: Antecedentes Gineco-Obstétricos & Tamizaje
  "NÚMERO DE PAREJAS SEXUALES:": string;
  "IRS:": string;
  "FUR:": string;
  "FORMULA OBSTETRICA:": string;
  "MAC:": string;
  "RESULTADO DE PAP:": string;
  "OTROS": string;
  "RESULTADO DE TEST DE VPH:": string;
  "SEROTIPO:": string;

  // 18-26: Criterios IFCPC & Hallazgos Normales
  "Colposcopia": string;
  'Colposcopia "Motivo de inadecuada"': string;
  "Visibilidad de la unión escamocolumnar": string;
  "Tipo de zona de transformación": string;
  "Epitelio escamoso original": string;
  "Epitelio columnar": string;
  "Quiste de Naboth": string;
  "Aberturas y/o criptas glandulares": string;
  "Deciduosis en el embarazo": string;

  // 27-41: Hallazgos Anormales (Grado 1, Grado 2, No Específicos & Lugol)
  "Epitelio acetoblanco delgado": string;
  "Borde irregular": string;
  "Mosaico fino": string;
  "Puntillado fino": string;
  "Epitelio acetoblanco denso": string;
  "Aparición rápida de epitelio acetoblanco": string;
  "Orificios glandulares abiertos con bordes engrosados": string;
  "Mosaico grueso": string;
  "Puntillado grueso": string;
  "Bordes delimitados": string;
  "Signo del límite del borde interno": string;
  "Signo de cresta o sobreelevado": string;
  "Leucoplasia (queratosis o hiperqueratosis)": string;
  "Erosión": string;
  "Solución de Lugol (test de Schiller)": string;

  // 42-48: Sospecha de Invasión
  "Vasos atípicos": string;
  "Vasos delgados": string;
  "Superficie irregular": string;
  "Lesión exofítica": string;
  "Necrosis": string;
  "Ulceración necrótica": string;
  "Tumoración nodular": string;

  // 49-57: Hallazgos Varios
  "Zona de transformación congenita": string;
  "Condiloma": string;
  "Pólipo (exocervical / endocervical)": string;
  "Inflamación": string;
  "Estenosis": string;
  "Anomalía congénita": string;
  "Anomalías pos tratamiento": string;
  "Endometriosis": string;
  "OTROS_VARIOS": string;

  // 58-59: Biopsia y Diagnóstico
  "BIOPSIA": string;
  "DIAGNÓSTICO": string;
}

export function buildDrPatrickExportRows(
  patients: Patient[],
  backgrounds: Record<string, PatientBackground>,
  colposcopyReports: ColposcopyReport[],
  clinicalCheckups: ClinicalCheckup[],
  filters: ExportFilterOptions = {}
): DrPatrickMasterExportRow[] {
  let targetPatients = patients;

  if (filters.patientId && filters.patientId !== "all") {
    targetPatients = targetPatients.filter((p) => p.id === filters.patientId);
  }

  const rows: DrPatrickMasterExportRow[] = [];

  for (const p of targetPatients) {
    const bg = backgrounds[p.id];
    let pColpos = colposcopyReports.filter((c) => c.patientId === p.id);

    if (filters.startDate) {
      pColpos = pColpos.filter((c) => c.reportDate >= filters.startDate!);
    }
    if (filters.endDate) {
      pColpos = pColpos.filter((c) => c.reportDate <= filters.endDate!);
    }

    // Si la paciente no tiene colposcopía, generamos al menos una fila con sus antecedentes
    const recordsToExport = pColpos.length > 0 ? pColpos : [null];

    for (const colpo of recordsToExport) {
      const citaDate = colpo?.reportDate || new Date().toISOString().split("T")[0];
      const concatenaKey = `${p.dni}-${citaDate.split("-").reverse().join("/")}`;

      // Determinar si la visibilidad es completamente visible según UEC
      const uecVisibilidad = colpo?.squamocolumnarJunctionVisible || "Completamente visible";
      const uecFormatted =
        uecVisibilidad.toLowerCase().includes("no")
          ? "No visible"
          : uecVisibilidad.toLowerCase().includes("parcial")
          ? "Parcialmente visible"
          : "Completamente visible";

      // Schiller format
      const schillerFormatted = colpo
        ? colpo.schillerTest?.toLowerCase().includes("pos")
          ? "Positivo"
          : "Negativo"
        : "Negativo";

      rows.push({
        // 1-8: Identificación & Filiación
        "CONCATENA": concatenaKey,
        "Fecha de cita": citaDate,
        "DNI:": p.dni,
        "APELLIDOS Y NOMBRES:": `${p.lastName} ${p.firstName}`.toUpperCase(),
        "FECHA DE NACIMIENTO:": p.birthDate,
        "EDAD:": p.age,
        "TELÉFONO:": p.phone || "No registra",
        "MÉDICO EVALUADOR:": colpo?.doctorName?.toUpperCase() || "PATRICK JOSE JACINTO GOMERO",

        // 9-17: Antecedentes & Tamizaje
        "NÚMERO DE PAREJAS SEXUALES:": bg?.sexualPartnersCount !== undefined ? String(bg.sexualPartnersCount) : "2",
        "IRS:": bg?.sexualDebutAge ? `${bg.sexualDebutAge}` : "XXXXX",
        "FUR:": bg?.lastMenstrualPeriod || "No precisa",
        "FORMULA OBSTETRICA:": bg?.obstetricFormula || "G0 P0000",
        "MAC:": bg?.contraceptiveMethod || "Ninguno",
        "RESULTADO DE PAP:": bg?.papHistory?.includes("ASC-US")
          ? "ASC-US"
          : bg?.papHistory?.includes("LIE-BG")
          ? "LIE-BG"
          : bg?.papHistory || "OTROS",
        "OTROS": bg?.papHistory?.includes("ASC-US") || bg?.papHistory?.includes("LIE-BG") ? "" : (bg?.papHistory || ""),
        "RESULTADO DE TEST DE VPH:": bg?.vphTestHistory?.toLowerCase().includes("pos")
          ? "POSITIVO"
          : bg?.vphTestHistory?.toLowerCase().includes("no")
          ? "NO SE REALIZÓ"
          : "NEGATIVO",
        "SEROTIPO:": bg?.vphTestHistory?.includes("PCR") ? "23 Genotipos" : "",

        // 18-26: Criterios IFCPC
        "Colposcopia": colpo ? (colpo.adequateColposcopy ? "Adecuada" : "Inadecuada") : "Adecuada",
        'Colposcopia "Motivo de inadecuada"': colpo && !colpo.adequateColposcopy ? (colpo.inadequateReason || "Inflamación severa / Sangrado") : "",
        "Visibilidad de la unión escamocolumnar": uecFormatted,
        "Tipo de zona de transformación": colpo?.transformationZoneType || "Tipo 1",
        "Epitelio escamoso original": colpo?.matureSquamousEpithelium ? "Maduro" : "Atrófico",
        "Epitelio columnar": colpo?.ectopy ? "Ectopía" : "No",
        "Quiste de Naboth": colpo?.nabothCyst ? "Sí" : "No",
        "Aberturas y/o criptas glandulares": colpo?.cryptOpenings ? "Sí" : "No",
        "Deciduosis en el embarazo": colpo?.deciduosis ? "Sí" : "No",

        // 27-41: Hallazgos Anormales
        "Epitelio acetoblanco delgado": colpo?.thinAcetowhiteEpithelium ? "Sí" : "No",
        "Borde irregular": colpo?.irregularBorder ? "Sí" : "No",
        "Mosaico fino": colpo?.fineMosaic ? "Sí" : "No",
        "Puntillado fino": colpo?.finePunctation ? "Sí" : "No",
        "Epitelio acetoblanco denso": colpo?.denseAcetowhiteEpithelium ? "Sí" : "No",
        "Aparición rápida de epitelio acetoblanco": colpo?.rapidAcetowhite ? "Sí" : "No",
        "Orificios glandulares abiertos con bordes engrosados": colpo?.thickenedGlands ? "Sí" : "No",
        "Mosaico grueso": colpo?.coarseMosaic ? "Sí" : "No",
        "Puntillado grueso": colpo?.coarsePunctation ? "Sí" : "No",
        "Bordes delimitados": colpo?.sharpBorders ? "Sí" : "No",
        "Signo del límite del borde interno": colpo?.innerBorderSign ? "Sí" : "No",
        "Signo de cresta o sobreelevado": colpo?.ridgeSign ? "Sí" : "No",
        "Leucoplasia (queratosis o hiperqueratosis)": colpo?.leukoplakia ? "Sí" : "No",
        "Erosión": colpo?.erosion ? "Sí" : "No",
        "Solución de Lugol (test de Schiller)": schillerFormatted,

        // 42-48: Sospecha de Invasión
        "Vasos atípicos": colpo?.atypicalVessels ? "Sí" : "No",
        "Vasos delgados": colpo?.fragileVessels ? "Sí" : "No",
        "Superficie irregular": colpo?.irregularSurface ? "Sí" : "No",
        "Lesión exofítica": colpo?.exophyticLesion ? "Sí" : "No",
        "Necrosis": colpo?.necrosis ? "Sí" : "No",
        "Ulceración necrótica": colpo?.necrosis ? "Sí" : "No",
        "Tumoración nodular": colpo?.nodularTumor ? "Sí" : "No",

        // 49-57: Hallazgos Varios
        "Zona de transformación congenita": colpo?.congenitalTZ ? "Sí" : "No",
        "Condiloma": colpo?.condyloma ? "Sí" : "No",
        "Pólipo (exocervical / endocervical)": colpo?.polyp ? "Sí" : "No",
        "Inflamación": colpo?.inflammation ? "Sí" : "No",
        "Estenosis": colpo?.stenosis ? "Sí" : "No",
        "Anomalía congénita": "No",
        "Anomalías pos tratamiento": colpo?.postTreatmentAnomaly ? "Sí" : "No",
        "Endometriosis": colpo?.endometriosisFoci ? "Sí" : "No",
        "OTROS_VARIOS": colpo?.otherFindings || "Ninguno",

        // 58-59: Biopsia y Diagnóstico
        "BIOPSIA": colpo?.cervicalBiopsyTaken ? "Sí" : "No",
        "DIAGNÓSTICO": colpo?.diagnosis || "1. Colposcopía sin alteraciones",
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
  const rows = buildDrPatrickExportRows(
    patients,
    backgrounds,
    colposcopyReports,
    clinicalCheckups,
    filters
  );

  // Mapear el nombre de la columna "OTROS_VARIOS" a "OTROS" en el Excel final
  const cleanRows = rows.map((r) => {
    const { OTROS_VARIOS, ...rest } = r;
    return {
      ...rest,
      OTROS: OTROS_VARIOS,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(cleanRows);

  // Ajuste automático de anchos de columna
  const columnKeys = Object.keys(cleanRows[0] || {});
  const colWidths = columnKeys.map((key) => {
    const maxLen = Math.max(
      key.length,
      ...cleanRows.map((row) => String((row as any)[key] ?? "").length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 11), 50) };
  });

  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "BD_Colposcopia_CENDO");

  const todayStr = new Date().toISOString().split("T")[0];
  const fileName = `CENDO_Base_Colposcopia_${todayStr}.xlsx`;

  XLSX.writeFile(workbook, fileName);

  return {
    rowCount: cleanRows.length,
    fileName,
  };
}
