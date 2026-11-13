"use client";

import React from "react";
import { Patient, DoctorProfile, PatientBackground, MedicalConsultation } from "@/types/medical";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CendoFooterWave } from "@/components/export/CendoFooterWave";

interface CompleteHistoryPrintViewProps {
  patient: Patient;
  background?: PatientBackground;
  consultations: MedicalConsultation[];
  doctor: DoctorProfile;
}

export function CompleteHistoryPrintView({
  patient,
  background,
  consultations,
  doctor,
}: CompleteHistoryPrintViewProps) {
  const doctorDisplayName = (doctor.fullName || "Patrick José Jacinto Gomero")
    .replace(/^dr\.?\s+/i, "")
    .trim();

  const titlePrefix = doctor.doctorTitle || "Dr.";

  return (
    <div
      id="complete-history-print-sheet"
      className="max-w-[210mm] mx-auto text-slate-900 bg-white font-sans text-xs print:p-0"
    >
      <div className="page-sheet w-[210mm] min-h-[297mm] p-[10mm_14mm_10mm_14mm] flex flex-col justify-between border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:rounded-none box-border">
        <div className="space-y-4">
          {/* 1. Membrete Institucional CENDO */}
          <div className="border-b-2 border-primary pb-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandLogo size="lg" showText={false} />
              <div>
                <h1 className="text-xl font-heading font-extrabold text-primary tracking-tight">
                  CENDO &bull; CENTRO DE ENDOMETRIOSIS Y GINECOLOGÍA
                </h1>
                <p className="text-[11px] font-semibold text-slate-700">
                  Director Médico: {titlePrefix} {doctorDisplayName} &bull; CMP {doctor.cmp}
                  {doctor.rne ? ` &bull; RNE ${doctor.rne}` : ""}
                </p>
                <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                  {doctor.clinicAddress} &bull; Citas: {doctor.phone}
                </p>
              </div>
            </div>

            <div className="text-right border-l border-slate-200 pl-4 shrink-0">
              <div className="inline-block px-2.5 py-1 rounded-md bg-accent-soft text-primary font-heading font-extrabold text-xs tracking-wider uppercase border border-primary/20">
                HISTORIA CLÍNICA INTEGRAL
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                N° HC-{patient.dni}
              </p>
              <p className="text-[9.5px] text-slate-600 font-bold">
                Copia Clínica Oficial
              </p>
            </div>
          </div>

          {/* 2. DATOS DEL PACIENTE (Filiación Oficial - Modelo Dr. Patrick Jacinto) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <h2 className="text-[10px] uppercase font-bold text-primary tracking-wider border-b border-slate-200 pb-1 mb-2">
              DATOS DEL PACIENTE
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px]">
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Nombre:</span>
                <span className="font-bold text-slate-900">{patient.lastName}, {patient.firstName}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">DNI:</span>
                <span className="font-mono font-bold text-slate-900">{patient.dni}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Fecha de Nacimiento:</span>
                <span className="font-mono text-slate-800">{patient.birthDate}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Edad:</span>
                <span className="font-semibold text-slate-900">{patient.age} años</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Estado Civil:</span>
                <span className="text-slate-800">{patient.civilStatus}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Grado de Instrucción:</span>
                <span className="text-slate-800">{patient.educationLevel || "Superior"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Ocupación Actual:</span>
                <span className="text-slate-800">{patient.occupation || "No refiere"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Lugar de Nacimiento:</span>
                <span className="text-slate-800">{patient.birthPlace || "Lima, Perú"}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Dirección Actual:</span>
                <span className="text-slate-800">{patient.address || "No precisada"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Religión:</span>
                <span className="text-slate-800">{patient.religion || "No precisa"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Teléfono / WhatsApp:</span>
                <span className="font-mono text-slate-800">{patient.phone}</span>
              </div>
            </div>
          </div>

          {/* 3. ANTECEDENTES GINECO OBSTÉTRICOS */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <h2 className="text-[10px] uppercase font-bold text-primary tracking-wider border-b border-slate-200 pb-1 mb-2">
              ANTECEDENTES GINECO OBSTÉTRICOS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px]">
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Fórmula Obstétrica:</span>
                <span className="font-mono font-bold text-primary text-sm">{background?.obstetricFormula || "G0 P0000"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">FUR (Última Regla):</span>
                <span className="font-mono font-bold text-slate-800">{background?.lastMenstrualPeriod || "No precisa"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Menarquia:</span>
                <span className="font-semibold text-slate-800">{background?.menarche ? `${background.menarche} años` : "No precisa"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">R/C (Régimen Catamenial):</span>
                <span className="font-mono font-bold text-slate-800">{background?.catamenialRegimen || "28/4"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">IRS (Inicio Sex.):</span>
                <span className="font-semibold text-slate-800">{background?.sexualDebutAge ? `${background.sexualDebutAge} años` : "No precisa"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">NPS (N° Parejas Sex.):</span>
                <span className="font-semibold text-slate-800">{background?.sexualPartnersCount ?? "No precisa"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">ITS:</span>
                <span className="text-slate-800">{background?.stiHistory || "Niega ITS"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">MAC Actual:</span>
                <span className="font-semibold text-slate-900">{background?.contraceptiveMethod || "Ninguno"}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Historial PAP:</span>
                <span className="text-slate-800">{background?.papHistory || "No refiere"}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Historial Test VPH:</span>
                <span className="text-slate-800">{background?.vphTestHistory || "No realizado"}</span>
              </div>
            </div>
          </div>

          {/* 4. ANTECEDENTES GENERALES */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <h2 className="text-[10px] uppercase font-bold text-primary tracking-wider border-b border-slate-200 pb-1 mb-2">
              ANTECEDENTES GENERALES
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px]">
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Diabetes:</span>
                <span className="text-slate-800">{background?.hasDiabetes || "Niega"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Hipertensión:</span>
                <span className="text-slate-800">{background?.hasHypertension || "Niega"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Asma:</span>
                <span className="text-slate-800">{background?.hasAsthma || "Niega"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Alergias Medicamentosas:</span>
                <span className="font-semibold text-rose-700">{background?.medicalAllergies || "Niega alergias"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Cirugías Previas:</span>
                <span className="text-slate-800">{background?.surgeriesHistory || "Niega cirugías"}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Otros Antecedentes / Sistémicos:</span>
                <span className="text-slate-800">{background?.otherPathologies || "Niega"}</span>
              </div>
              <div className="md:col-span-3">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Antecedentes Familiares:</span>
                <span className="text-slate-800">{background?.familyHistory || "Sin antecedentes oncológicos o crónicos relevantes"}</span>
              </div>
            </div>
          </div>

          {/* 5. CONSULTAS Y CONTROLES SUCESIVOS (Modelo Dr. Patrick Jacinto) */}
          <div className="space-y-3">
            <h2 className="text-xs uppercase font-extrabold text-primary tracking-wider border-b-2 border-primary pb-1">
              CONSULTAS Y CONTROLES SUCESIVOS ({consultations.length})
            </h2>

            {consultations.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                No se registran consultas ginecológicas sucesivas para esta paciente.
              </p>
            ) : (
              consultations.map((cons, idx) => (
                <div
                  key={cons.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 page-break-inside-avoid"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-heading font-extrabold text-primary text-[11px] uppercase">
                      {idx === 0 ? "CONSULTA INICIAL" : `CONTROL N° ${idx}`} &bull; FECHA: {cons.consultationDate}
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-mono">
                      Médico: {cons.doctorName} (CMP {cons.doctorCmp})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-500 uppercase block">MOTIVO DE CONSULTA:</span>
                      <p className="text-slate-900 font-medium">{cons.reasonForVisit}</p>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-500 uppercase block">DATOS DE LA ENFERMEDAD:</span>
                      <p className="text-slate-800">
                        {cons.illnessTime ? `Tiempo: ${cons.illnessTime}. ` : ""}
                        {cons.symptoms || "Sin síntomas agudos adicionales."}
                      </p>
                    </div>
                  </div>

                  {/* Examen Físico */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10.5px]">
                    <span className="text-[9.5px] font-bold text-primary uppercase block mb-1">
                      EXAMEN FÍSICO Y FUNCIONES VITALES:
                    </span>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5 font-mono text-center">
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="text-[8.5px] text-slate-400 block">PA</span>
                        <strong>{cons.vitalSigns?.bloodPressure || "--"}</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="text-[8.5px] text-slate-400 block">FC</span>
                        <strong>{cons.vitalSigns?.heartRate ? `${cons.vitalSigns.heartRate} lpm` : "--"}</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="text-[8.5px] text-slate-400 block">FR</span>
                        <strong>{cons.vitalSigns?.respiratoryRate ? `${cons.vitalSigns.respiratoryRate} rpm` : "--"}</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="text-[8.5px] text-slate-400 block">TEMP</span>
                        <strong>{cons.vitalSigns?.temperature ? `${cons.vitalSigns.temperature}°C` : "--"}</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="text-[8.5px] text-slate-400 block">SatO2</span>
                        <strong>{cons.vitalSigns?.oxygenSaturation ? `${cons.vitalSigns.oxygenSaturation}%` : "--"}</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="text-[8.5px] text-slate-400 block">PESO</span>
                        <strong>{cons.vitalSigns?.weightKg ? `${cons.vitalSigns.weightKg} kg` : "--"}</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="text-[8.5px] text-slate-400 block">TALLA</span>
                        <strong>{cons.vitalSigns?.heightCm ? `${cons.vitalSigns.heightCm} cm` : "--"}</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="text-[8.5px] text-slate-400 block">IMC</span>
                        <strong className="text-primary">{cons.vitalSigns?.bmi || "--"}</strong>
                      </div>
                    </div>

                    {cons.physicalExam && (
                      <div className="mt-2 text-slate-700 text-[10px] space-y-0.5">
                        {cons.physicalExam.generalExam && (
                          <p><strong>Examen General:</strong> {cons.physicalExam.generalExam}</p>
                        )}
                        {cons.physicalExam.breastsExam && (
                          <p><strong>Mamas:</strong> {cons.physicalExam.breastsExam}</p>
                        )}
                        {cons.physicalExam.externalGenitalia && (
                          <p><strong>Genitales Externos:</strong> {cons.physicalExam.externalGenitalia}</p>
                        )}
                        {cons.physicalExam.speculoscopy && (
                          <p><strong>Especuloscopía:</strong> {cons.physicalExam.speculoscopy}</p>
                        )}
                        {cons.physicalExam.bimanualPalpation && (
                          <p><strong>Tacto Bimanual:</strong> {cons.physicalExam.bimanualPalpation}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-500 uppercase block">DIAGNÓSTICOS (CIE-10):</span>
                      <p className="font-semibold text-slate-900">
                        {cons.diagnosis} {cons.cie10Code ? `(CIE-10: ${cons.cie10Code})` : ""}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-500 uppercase block">PLAN DE TRABAJO:</span>
                      <p className="text-slate-800">{cons.treatmentPlan}</p>
                    </div>
                  </div>

                  {(cons.auxiliaryExams || cons.prescriptionNotes) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                      {cons.auxiliaryExams && (
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-500 uppercase block">EXÁMENES AUXILIARES:</span>
                          <p className="text-slate-800 whitespace-pre-line">{cons.auxiliaryExams}</p>
                        </div>
                      )}
                      {cons.prescriptionNotes && (
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-500 uppercase block">RECETA (RP/):</span>
                          <p className="text-slate-800 whitespace-pre-line">{cons.prescriptionNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 6. Pie de Página y Sello del Director Médico */}
        <div className="pt-6 mt-6 border-t border-slate-200">
          <div className="flex items-end justify-between">
            <div className="text-[9.5px] text-slate-500 space-y-0.5">
              <p>Centro de Endometriosis y Ginecología - CENDO</p>
              <p>Miraflores, Lima - Perú &bull; {doctor.clinicAddress}</p>
              <p className="font-mono text-[8.5px]">Generado electrónicamente bajo estándares del MINSA</p>
            </div>

            <div className="text-center shrink-0">
              <div className="w-48 border-b-2 border-slate-800 mb-1 mx-auto" />
              <p className="font-heading font-extrabold text-xs text-slate-900">
                {titlePrefix} {doctorDisplayName}
              </p>
              <p className="text-[10px] text-slate-600 font-medium">Director Médico &bull; CENDO</p>
              <p className="text-[9.5px] text-slate-500 font-mono">
                CMP: {doctor.cmp} {doctor.rne ? `| RNE: ${doctor.rne}` : ""}
              </p>
            </div>
          </div>
          <CendoFooterWave />
        </div>
      </div>
    </div>
  );
}
