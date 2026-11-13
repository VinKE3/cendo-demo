/**
 * CENDO - Calculadoras Obstétricas & Regla de Naegele
 * Algoritmos para Fecha Probable de Parto (FPP), Edad Gestacional y Alertas MINSA
 */

import { PrenatalBaselineData, PrenatalVisitItem } from "@/types/medical";

/**
 * Regla de Naegele: FPP = FUM + 7 días - 3 meses + 1 año (280 días)
 * @param fumStr Fecha de Última Menstruación en formato YYYY-MM-DD
 */
export function calculateNaegeleFPP(fumStr: string): string {
  if (!fumStr || fumStr.length < 10) return "";
  const parts = fumStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);

  const fumDate = new Date(year, month, day);
  if (isNaN(fumDate.getTime())) return "";

  // Sumar 280 días (40 semanas)
  const fppDate = new Date(fumDate.getTime() + 280 * 24 * 60 * 60 * 1000);

  const fYear = fppDate.getFullYear();
  const fMonth = String(fppDate.getMonth() + 1).padStart(2, "0");
  const fDay = String(fppDate.getDate()).padStart(2, "0");

  return `${fYear}-${fMonth}-${fDay}`;
}

/**
 * Calcula la Edad Gestacional a una fecha determinada en Semanas + Días
 */
export function calculateGestationalAge(
  fumStr: string,
  targetDateStr?: string
): { weeks: number; days: number; totalDays: number; formatted: string } {
  if (!fumStr || fumStr.length < 10) {
    return { weeks: 0, days: 0, totalDays: 0, formatted: "0 sem 0 d" };
  }

  const partsFum = fumStr.split("-");
  const fumDate = new Date(
    parseInt(partsFum[0], 10),
    parseInt(partsFum[1], 10) - 1,
    parseInt(partsFum[2], 10)
  );

  let targetDate = new Date();
  if (targetDateStr && targetDateStr.length >= 10) {
    const partsTarget = targetDateStr.split("-");
    targetDate = new Date(
      parseInt(partsTarget[0], 10),
      parseInt(partsTarget[1], 10) - 1,
      parseInt(partsTarget[2], 10)
    );
  }

  const diffMs = targetDate.getTime() - fumDate.getTime();
  if (diffMs < 0) {
    return { weeks: 0, days: 0, totalDays: 0, formatted: "0 sem 0 d" };
  }

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  return {
    weeks,
    days: remainingDays,
    totalDays,
    formatted: `${weeks} sem ${remainingDays} d`,
  };
}

export interface PrenatalRiskReport {
  isHighRisk: boolean;
  riskCategory: "Bajo Riesgo Obstétrico" | "Alto Riesgo Obstétrico (ARO)";
  warningFlags: string[];
}

/**
 * Evalúa los factores de riesgo del Carnet de Control Prenatal oficial MINSA/CLAP
 */
export function evaluatePrenatalRisks(
  baseline: PrenatalBaselineData,
  maternalAge: number,
  visits: PrenatalVisitItem[] = []
): PrenatalRiskReport {
  const flags: string[] = [];

  // Edad materna extrema
  if (maternalAge < 15) {
    flags.push("Edad materna de muy alto riesgo (< 15 años)");
  } else if (maternalAge > 35) {
    flags.push("Edad materna avanzada (> 35 años)");
  }

  // Paridad
  if (baseline.gestas === 0) {
    flags.push("Primigesta");
  } else if (baseline.gestas >= 4) {
    flags.push("Gran multípara (>= 4 gestaciones)");
  }

  // Cesáreas previas
  if (baseline.cesareas >= 2) {
    flags.push("Cesárea iterativa (>= 2 cesáreas)");
  } else if (baseline.cesareas === 1) {
    flags.push("Cesárea previa única");
  }

  // Antecedente de abortos recurrentes
  if (baseline.abortos >= 2) {
    flags.push("Antecedente de abortos recurrentes (>= 2)");
  }

  // Antecedente de prematuridad o bajo peso
  if (baseline.pretermHistory) {
    flags.push("Antecedente de parto pretérmino (< 37 semanas)");
  }
  if (baseline.rnMayorPesoGramos && baseline.rnMayorPesoGramos < 2500) {
    flags.push("Antecedente de recién nacido con bajo peso (< 2500g)");
  }

  // Factor Rh sensibilizada
  if (baseline.rhFactor === "Rh (-) Sensibilizada") {
    flags.push("Incompatibilidad Rh con Sensibilización Materna");
  }

  // Antecedentes médicos crónicos
  if (baseline.personalHistory && baseline.personalHistory.length > 0) {
    baseline.personalHistory.forEach((item) => {
      if (item !== "Ninguno") {
        flags.push(`Antecedente personal: ${item}`);
      }
    });
  }

  // Fuma o drogas
  if (baseline.smokerCigarettesDay && baseline.smokerCigarettesDay > 0) {
    flags.push(`Tabaquismo activo (${baseline.smokerCigarettesDay} cig/día)`);
  }
  if (baseline.drugsUse) {
    flags.push("Uso de sustancias psicoactivas");
  }

  // Laboratorios basales patológicos
  if (baseline.hemoglobin1 && baseline.hemoglobin1 < 11) {
    flags.push(`Anemia en el embarazo (Hb ${baseline.hemoglobin1} g/dL)`);
  }
  if (baseline.hivScreening1 === "Positivo") {
    flags.push("Reactividad para VIH");
  }
  if (baseline.vdrlRpr1 === "Reactivo") {
    flags.push("Reactividad para Sífilis (VDRL/RPR)");
  }

  // Signos de alarma en visitas
  visits.forEach((v) => {
    // Presión arterial >= 140/90
    if (v.bloodPressure) {
      const parts = v.bloodPressure.split("/");
      if (parts.length === 2) {
        const sys = parseInt(parts[0], 10);
        const dia = parseInt(parts[1], 10);
        if (sys >= 140 || dia >= 90) {
          flags.push(`Hipertensión en Atención ${v.visitNumber} (${v.bloodPressure} mmHg)`);
        }
      }
    }
    // Proteinuria
    if (v.proteinuria && v.proteinuria !== "-" && v.proteinuria !== "NSH") {
      flags.push(`Proteinuria positiva en Atención ${v.visitNumber} (${v.proteinuria})`);
    }
    // FCF
    if (v.fetalHeartRate && (v.fetalHeartRate < 120 || v.fetalHeartRate > 160)) {
      flags.push(`FCF anormal en Atención ${v.visitNumber} (${v.fetalHeartRate} lpm)`);
    }
  });

  const uniqueFlags = Array.from(new Set(flags));
  const isHighRisk = uniqueFlags.length > 0;

  return {
    isHighRisk,
    riskCategory: isHighRisk ? "Alto Riesgo Obstétrico (ARO)" : "Bajo Riesgo Obstétrico",
    warningFlags: uniqueFlags,
  };
}

