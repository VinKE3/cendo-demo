import { z } from "zod";
import { PrenatalBaselineData, PrenatalVisitItem, PrenatalRiskReport } from "./prenatal.types";

export const prenatalCardSchema = z.object({
  patientId: z.string().min(1, "El ID de la paciente es obligatorio"),
  clinicEstablishment: z.string().default("CENDO - Centro de Endometriosis"),
  attendingDoctorId: z.string().min(1, "El ID del médico tratante es obligatorio"),
  attendingDoctorName: z.string().min(1, "El nombre del médico es obligatorio"),
  baseline: z.record(z.any()).refine((val) => typeof val === "object", "Datos basales inválidos"),
  visits: z.array(z.any()).default([]),
  maternalPathologies: z.array(z.any()).default([]),
});

export function calculateNaegeleFPP(fumStr: string): string {
  if (!fumStr || fumStr.length < 10) return "";
  const parts = fumStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const fumDate = new Date(year, month, day);
  if (isNaN(fumDate.getTime())) return "";

  const fppDate = new Date(fumDate.getTime() + 280 * 24 * 60 * 60 * 1000);
  const fYear = fppDate.getFullYear();
  const fMonth = String(fppDate.getMonth() + 1).padStart(2, "0");
  const fDay = String(fppDate.getDate()).padStart(2, "0");
  return `${fYear}-${fMonth}-${fDay}`;
}

export function calculateGestationalAge(fumStr: string, targetDateStr?: string) {
  if (!fumStr || fumStr.length < 10) {
    return { weeks: 0, days: 0, totalDays: 0, formatted: "0 sem 0 d" };
  }
  const partsFum = fumStr.split("-");
  const fumDate = new Date(parseInt(partsFum[0], 10), parseInt(partsFum[1], 10) - 1, parseInt(partsFum[2], 10));
  let targetDate = new Date();
  if (targetDateStr && targetDateStr.length >= 10) {
    const partsTarget = targetDateStr.split("-");
    targetDate = new Date(parseInt(partsTarget[0], 10), parseInt(partsTarget[1], 10) - 1, parseInt(partsTarget[2], 10));
  }
  const diffMs = targetDate.getTime() - fumDate.getTime();
  if (diffMs < 0) return { weeks: 0, days: 0, totalDays: 0, formatted: "0 sem 0 d" };

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  return { weeks, days, totalDays, formatted: `${weeks} sem ${days} d` };
}

export function evaluatePrenatalRisks(
  baseline: PrenatalBaselineData,
  maternalAge: number,
  visits: PrenatalVisitItem[] = []
): PrenatalRiskReport {
  const flags: string[] = [];
  if (maternalAge < 15) flags.push("Edad materna de muy alto riesgo (< 15 años)");
  else if (maternalAge > 35) flags.push("Edad materna avanzada (> 35 años)");

  if (baseline.gestas === 0) flags.push("Primigesta");
  else if (baseline.gestas >= 4) flags.push("Gran multípara (>= 4 gestaciones)");

  if (baseline.cesareas >= 2) flags.push("Cesárea iterativa (>= 2 cesáreas)");
  else if (baseline.cesareas === 1) flags.push("Cesárea previa única");

  if (baseline.abortos >= 2) flags.push("Antecedente de abortos recurrentes (>= 2)");
  if (baseline.pretermHistory) flags.push("Antecedente de parto pretérmino (< 37 semanas)");
  if (baseline.rnMayorPesoGramos && baseline.rnMayorPesoGramos < 2500) {
    flags.push("Antecedente de recién nacido con bajo peso (< 2500g)");
  }
  if (baseline.rhFactor === "Rh (-) Sensibilizada") flags.push("Incompatibilidad Rh con Sensibilización Materna");

  if (baseline.personalHistory?.length) {
    baseline.personalHistory.forEach((h) => h !== "Ninguno" && flags.push(`Antecedente personal: ${h}`));
  }
  if (baseline.smokerCigarettesDay && baseline.smokerCigarettesDay > 0) {
    flags.push(`Tabaquismo activo (${baseline.smokerCigarettesDay} cig/día)`);
  }
  if (baseline.drugsUse) flags.push("Uso de sustancias psicoactivas");
  if (baseline.hemoglobin1 && baseline.hemoglobin1 < 11) flags.push(`Anemia en el embarazo (Hb ${baseline.hemoglobin1} g/dL)`);
  if (baseline.hivScreening1 === "Positivo") flags.push("Reactividad para VIH");
  if (baseline.vdrlRpr1 === "Reactivo") flags.push("Reactividad para Sífilis (VDRL/RPR)");

  visits.forEach((v) => {
    if (v.bloodPressure) {
      const parts = v.bloodPressure.split("/");
      if (parts.length === 2) {
        const sys = parseInt(parts[0], 10);
        const dia = parseInt(parts[1], 10);
        if (sys >= 140 || dia >= 90) flags.push(`Hipertensión en Atención ${v.visitNumber} (${v.bloodPressure} mmHg)`);
      }
    }
    if (v.proteinuria && v.proteinuria !== "-" && v.proteinuria !== "NSH") {
      flags.push(`Proteinuria positiva en Atención ${v.visitNumber} (${v.proteinuria})`);
    }
    if (v.fetalHeartRate && (v.fetalHeartRate < 120 || v.fetalHeartRate > 160)) {
      flags.push(`FCF anormal en Atención ${v.visitNumber} (${v.fetalHeartRate} lpm)`);
    }
  });

  const uniqueFlags = Array.from(new Set(flags));
  return {
    isHighRisk: uniqueFlags.length > 0,
    riskCategory: uniqueFlags.length > 0 ? "Alto Riesgo Obstétrico (ARO)" : "Bajo Riesgo Obstétrico",
    warningFlags: uniqueFlags,
  };
}
