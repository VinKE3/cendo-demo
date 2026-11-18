"use client";

import React from "react";
import { X, Printer, MessageCircle } from "lucide-react";
import {
  Patient,
  PatientBackground,
  ColposcopyReport,
  ClinicalCheckup,
  MedicalPrescription,
  LabOrder,
  PrenatalCard,
  PatientDocument,
  MedicalConsultation,
  UltrasoundReport,
  MinorProcedureReport,
  ProcedureQuote,
  DoctorProfile,
} from "@/types/medical";
import { PatientModal } from "@/components/pacientes/PatientModal";
import { PatientBackgroundModal } from "@/components/pacientes/PatientBackgroundModal";
import { ColposcopyModal } from "@/components/colposcopia/ColposcopyModal";
import { ColposcopyPrintView } from "@/components/export/ColposcopyPrintView";
import { CheckupModal } from "@/components/chequeos/CheckupModal";
import { CheckupPrintView } from "@/components/export/CheckupPrintView";
import { PrescriptionModal } from "@/components/recetas/PrescriptionModal";
import { PrescriptionPrintView } from "@/components/export/PrescriptionPrintView";
import { LabOrderModal } from "@/components/laboratorio/LabOrderModal";
import { LabOrderPrintView } from "@/components/export/LabOrderPrintView";
import { PrenatalCardModal } from "@/components/prenatal/PrenatalCardModal";
import { PrenatalPrintView } from "@/components/export/PrenatalPrintView";
import { UploadDocumentModal } from "@/components/documentos/UploadDocumentModal";
import { DocumentViewerModal } from "@/components/documentos/DocumentViewerModal";
import { ConsultationModal } from "@/components/consultas/ConsultationModal";
import { ConsultationPrintView } from "@/components/export/ConsultationPrintView";
import { UltrasoundModal } from "@/components/ecografia/UltrasoundModal";
import { UltrasoundPrintView } from "@/components/export/UltrasoundPrintView";
import { MinorProcedureModal } from "@/components/procedimientos/MinorProcedureModal";
import { MinorProcedurePrintView } from "@/components/export/MinorProcedurePrintView";
import { QuoteModal } from "@/components/tarifario/QuoteModal";
import { QuotePrintView } from "@/components/export/QuotePrintView";
import { WordHistoryModal } from "@/components/documentos/WordHistoryModal";
import { CompleteHistoryPrintView } from "@/components/export/CompleteHistoryPrintView";
import { INITIAL_DOCTOR } from "@/store/useMedicalStore";
import { printHtmlElement } from "@/lib/pdfGenerator";
import {
  generatePrescriptionWhatsAppUrl,
  generateLabOrderWhatsAppUrl,
  generateConsultationWhatsAppUrl,
  generateUltrasoundWhatsAppUrl,
  generateMinorProcedureWhatsAppUrl,
  generateQuoteWhatsAppUrl,
  generateColposcopyWhatsAppUrl,
  generateCheckupWhatsAppUrl,
} from "@/lib/whatsappShare";

interface PatientDetailModalsProps {
  patient: Patient;
  bg?: PatientBackground;
  doctorProfile?: DoctorProfile | null;
  consultations: MedicalConsultation[];
  // Patient & Background Modals
  isPatientModalOpen: boolean;
  setIsPatientModalOpen: (open: boolean) => void;
  isBgModalOpen: boolean;
  setIsBgModalOpen: (open: boolean) => void;
  // Colpo & Checkup Modals
  isColpoModalOpen: boolean;
  setIsColpoModalOpen: (open: boolean) => void;
  editingColpo: ColposcopyReport | null;
  viewingColpo: ColposcopyReport | null;
  setViewingColpo: (colpo: ColposcopyReport | null) => void;
  isColpoPrintOpen: boolean;
  setIsColpoPrintOpen: (open: boolean) => void;
  isCheckupModalOpen: boolean;
  setIsCheckupModalOpen: (open: boolean) => void;
  editingCheckup: ClinicalCheckup | null;
  viewingCheckup: ClinicalCheckup | null;
  setViewingCheckup: (chk: ClinicalCheckup | null) => void;
  isCheckupPrintOpen: boolean;
  setIsCheckupPrintOpen: (open: boolean) => void;
  // Prescription Modals
  isPrescriptionModalOpen: boolean;
  setIsPrescriptionModalOpen: (open: boolean) => void;
  editingPrescription: MedicalPrescription | null;
  viewingPrescription: MedicalPrescription | null;
  setViewingPrescription: (rec: MedicalPrescription | null) => void;
  isPrintModalOpen: boolean;
  setIsPrintModalOpen: (open: boolean) => void;
  // Lab Modals
  isLabModalOpen: boolean;
  setIsLabModalOpen: (open: boolean) => void;
  editingLabOrder: LabOrder | null;
  viewingLabOrder: LabOrder | null;
  setViewingLabOrder: (ord: LabOrder | null) => void;
  isLabPrintModalOpen: boolean;
  setIsLabPrintModalOpen: (open: boolean) => void;
  // Prenatal Modals
  isPrenatalModalOpen: boolean;
  setIsPrenatalModalOpen: (open: boolean) => void;
  prenatalInitialTab?: "basal" | "consultas" | "aro";
  viewingPrenatalCard: PrenatalCard | null;
  setViewingPrenatalCard: (card: PrenatalCard | null) => void;
  isPrenatalPrintModalOpen: boolean;
  setIsPrenatalPrintModalOpen: (open: boolean) => void;
  // Document Modals
  isUploadDocModalOpen: boolean;
  setIsUploadDocModalOpen: (open: boolean) => void;
  isDocViewerOpen: boolean;
  setIsDocViewerOpen: (open: boolean) => void;
  selectedDocToView: PatientDocument | null;
  setSelectedDocToView: (doc: PatientDocument | null) => void;
  isWordHistoryModalOpen: boolean;
  setIsWordHistoryModalOpen: (open: boolean) => void;
  // Consultation Modals
  isConsultationModalOpen: boolean;
  setIsConsultationModalOpen: (open: boolean) => void;
  editingConsultation: MedicalConsultation | null;
  viewingConsultation: MedicalConsultation | null;
  setViewingConsultation: (cons: MedicalConsultation | null) => void;
  isConsultationPrintOpen: boolean;
  setIsConsultationPrintOpen: (open: boolean) => void;
  // Ultrasound Modals
  isUltrasoundModalOpen: boolean;
  setIsUltrasoundModalOpen: (open: boolean) => void;
  editingUltrasound: UltrasoundReport | null;
  viewingUltrasound: UltrasoundReport | null;
  setViewingUltrasound: (echo: UltrasoundReport | null) => void;
  isUltrasoundPrintOpen: boolean;
  setIsUltrasoundPrintOpen: (open: boolean) => void;
  // Minor Procedure Modals
  isMinorProcModalOpen: boolean;
  setIsMinorProcModalOpen: (open: boolean) => void;
  editingMinorProc: MinorProcedureReport | null;
  viewingMinorProc: MinorProcedureReport | null;
  setViewingMinorProc: (proc: MinorProcedureReport | null) => void;
  isMinorProcPrintOpen: boolean;
  setIsMinorProcPrintOpen: (open: boolean) => void;
  // Quote Modals
  isQuoteModalOpen: boolean;
  setIsQuoteModalOpen: (open: boolean) => void;
  viewingQuote: ProcedureQuote | null;
  setViewingQuote: (q: ProcedureQuote | null) => void;
  isQuotePrintOpen: boolean;
  setIsQuotePrintOpen: (open: boolean) => void;
  // Complete History Print Modal
  isCompleteHistoryPrintOpen: boolean;
  setIsCompleteHistoryPrintOpen: (open: boolean) => void;
}

export function PatientDetailModals(props: PatientDetailModalsProps) {
  const {
    patient,
    bg,
    doctorProfile,
    consultations,
    isPatientModalOpen,
    setIsPatientModalOpen,
    isBgModalOpen,
    setIsBgModalOpen,
    isColpoModalOpen,
    setIsColpoModalOpen,
    editingColpo,
    viewingColpo,
    setViewingColpo,
    isColpoPrintOpen,
    setIsColpoPrintOpen,
    isCheckupModalOpen,
    setIsCheckupModalOpen,
    editingCheckup,
    viewingCheckup,
    setViewingCheckup,
    isCheckupPrintOpen,
    setIsCheckupPrintOpen,
    isPrescriptionModalOpen,
    setIsPrescriptionModalOpen,
    editingPrescription,
    viewingPrescription,
    setViewingPrescription,
    isPrintModalOpen,
    setIsPrintModalOpen,
    isLabModalOpen,
    setIsLabModalOpen,
    editingLabOrder,
    viewingLabOrder,
    setViewingLabOrder,
    isLabPrintModalOpen,
    setIsLabPrintModalOpen,
    isPrenatalModalOpen,
    setIsPrenatalModalOpen,
    prenatalInitialTab = "basal",
    viewingPrenatalCard,
    setViewingPrenatalCard,
    isPrenatalPrintModalOpen,
    setIsPrenatalPrintModalOpen,
    isUploadDocModalOpen,
    setIsUploadDocModalOpen,
    isDocViewerOpen,
    setIsDocViewerOpen,
    selectedDocToView,
    setSelectedDocToView,
    isWordHistoryModalOpen,
    setIsWordHistoryModalOpen,
    isConsultationModalOpen,
    setIsConsultationModalOpen,
    editingConsultation,
    viewingConsultation,
    setViewingConsultation,
    isConsultationPrintOpen,
    setIsConsultationPrintOpen,
    isUltrasoundModalOpen,
    setIsUltrasoundModalOpen,
    editingUltrasound,
    viewingUltrasound,
    setViewingUltrasound,
    isUltrasoundPrintOpen,
    setIsUltrasoundPrintOpen,
    isMinorProcModalOpen,
    setIsMinorProcModalOpen,
    editingMinorProc,
    viewingMinorProc,
    setViewingMinorProc,
    isMinorProcPrintOpen,
    setIsMinorProcPrintOpen,
    isQuoteModalOpen,
    setIsQuoteModalOpen,
    viewingQuote,
    setViewingQuote,
    isQuotePrintOpen,
    setIsQuotePrintOpen,
    isCompleteHistoryPrintOpen,
    setIsCompleteHistoryPrintOpen,
  } = props;

  const patientFullName = `${patient.lastName}, ${patient.firstName}`;
  const activeDoctor = doctorProfile || INITIAL_DOCTOR;

  return (
    <>
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        initialData={patient}
      />

      <PatientBackgroundModal
        isOpen={isBgModalOpen}
        onClose={() => setIsBgModalOpen(false)}
        patientId={patient.id}
        patientName={patientFullName}
        initialData={bg}
      />

      <ColposcopyModal
        isOpen={isColpoModalOpen}
        onClose={() => setIsColpoModalOpen(false)}
        initialData={editingColpo}
        defaultPatientId={patient.id}
      />

      {isColpoPrintOpen && viewingColpo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-3.5 border-b border-border bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-accent" />
                <span className="font-heading font-bold text-sm">
                  Vista Previa &bull; Informe de Colposcopía Oficial CENDO (IFCPC 2011)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = generateColposcopyWhatsAppUrl(patient, viewingColpo, activeDoctor);
                    window.open(url, "_blank");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => printHtmlElement("colposcopy-print-sheet", "Colposcopia_" + patient.lastName + "_" + patient.firstName)}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsColpoPrintOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center flex-1">
              <ColposcopyPrintView
                report={viewingColpo}
                patient={patient}
                doctor={activeDoctor}
              />
            </div>
          </div>
        </div>
      )}

      <CheckupModal
        isOpen={isCheckupModalOpen}
        onClose={() => setIsCheckupModalOpen(false)}
        initialData={editingCheckup}
        defaultPatientId={patient.id}
      />

      {isCheckupPrintOpen && viewingCheckup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-3.5 border-b border-border bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-accent" />
                <span className="font-heading font-bold text-sm">
                  Vista Previa &bull; Informe de Chequeo Preventivo Integral CENDO
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = generateCheckupWhatsAppUrl(patient, viewingCheckup, activeDoctor);
                    window.open(url, "_blank");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => printHtmlElement("checkup-print-sheet", "Chequeo_" + patient.lastName + "_" + patient.firstName)}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCheckupPrintOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center flex-1">
              <CheckupPrintView
                checkup={viewingCheckup}
                patient={patient}
                doctor={activeDoctor}
              />
            </div>
          </div>
        </div>
      )}

      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        patient={patient}
        prescriptionToEdit={editingPrescription}
        onSavedAndPrint={(savedRec) => {
          setViewingPrescription(savedRec);
          setIsPrintModalOpen(true);
        }}
      />

      {isPrintModalOpen && viewingPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-primary px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-secondary" />
                <h3 className="text-base font-heading font-bold">
                  Previsualización de Receta Médica Oficial (RP/)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = generatePrescriptionWhatsAppUrl(patient, viewingPrescription, activeDoctor);
                    window.open(url, "_blank");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => printHtmlElement("prescription-print-sheet", `Receta_${patient.lastName}_${patient.firstName}`)}
                  className="px-4 py-1.5 rounded-lg bg-secondary hover:bg-secondary-hover text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center flex-1">
              <PrescriptionPrintView
                prescription={viewingPrescription}
                patient={patient}
                doctor={activeDoctor}
              />
            </div>
          </div>
        </div>
      )}

      <LabOrderModal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        initialData={editingLabOrder}
        defaultPatientId={patient.id}
        onOrderSaved={(savedOrd) => {
          setViewingLabOrder(savedOrd);
          setIsLabPrintModalOpen(true);
        }}
      />

      {isLabPrintModalOpen && viewingLabOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-primary px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-secondary" />
                <h3 className="text-base font-heading font-bold">
                  Previsualización de Orden de Laboratorio Oficial
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = generateLabOrderWhatsAppUrl(patient, viewingLabOrder, activeDoctor);
                    window.open(url, "_blank");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => printHtmlElement("lab-order-print-sheet", `OrdenLab_${patient.lastName}_${patient.firstName}`)}
                  className="px-4 py-1.5 rounded-lg bg-secondary hover:bg-secondary-hover text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLabPrintModalOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center flex-1">
              <LabOrderPrintView
                labOrder={viewingLabOrder}
                patient={patient}
                doctor={activeDoctor}
              />
            </div>
          </div>
        </div>
      )}

      <PrenatalCardModal
        isOpen={isPrenatalModalOpen}
        onClose={() => setIsPrenatalModalOpen(false)}
        patient={patient}
        initialTab={prenatalInitialTab}
        onPrintRequested={(savedCard) => {
          setViewingPrenatalCard(savedCard);
          setIsPrenatalPrintModalOpen(true);
        }}
      />

      {isPrenatalPrintModalOpen && viewingPrenatalCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-primary px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-secondary" />
                <div>
                  <h3 className="text-base font-heading font-bold">
                    Carnet de Atención Prenatal Oficial (2 Páginas A4)
                  </h3>
                  <p className="text-[11px] text-white/80">
                    Formato Oficial MINSA / CLAP &bull; Anverso y Reverso
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printHtmlElement("prenatal-print-sheet", `Carnet_Prenatal_${patient.lastName}_${patient.firstName}`)}
                  className="px-4 py-1.5 rounded-lg bg-secondary hover:bg-secondary-hover text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrenatalPrintModalOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center flex-1">
              <PrenatalPrintView
                card={viewingPrenatalCard}
                patient={patient}
                doctor={activeDoctor}
              />
            </div>
          </div>
        </div>
      )}

      <UploadDocumentModal
        isOpen={isUploadDocModalOpen}
        onClose={() => setIsUploadDocModalOpen(false)}
        patientId={patient.id}
        patientName={patientFullName}
      />

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        patient={patient}
        consultationToEdit={editingConsultation}
        onSavedAndPrint={(cons) => {
          setViewingConsultation(cons);
          setIsConsultationPrintOpen(true);
        }}
      />

      {isConsultationPrintOpen && viewingConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-3.5 border-b border-border bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-accent" />
                <span className="font-heading font-bold text-sm">
                  Vista Previa &bull; Consulta Médica Ginecológica CENDO
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = generateConsultationWhatsAppUrl(patient, viewingConsultation, activeDoctor);
                    window.open(url, "_blank");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => printHtmlElement("consultation-print-sheet", "Consulta_" + patient.lastName + "_" + patient.firstName)}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsConsultationPrintOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center flex-1">
              <ConsultationPrintView
                consultation={viewingConsultation}
                patient={patient}
                doctor={activeDoctor}
              />
            </div>
          </div>
        </div>
      )}

      <UltrasoundModal
        isOpen={isUltrasoundModalOpen}
        onClose={() => setIsUltrasoundModalOpen(false)}
        patient={patient}
        reportToEdit={editingUltrasound}
        onSavedAndPrint={(echo) => {
          setViewingUltrasound(echo);
          setIsUltrasoundPrintOpen(true);
        }}
      />

      {isUltrasoundPrintOpen && viewingUltrasound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-3.5 border-b border-border bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-accent" />
                <span className="font-heading font-bold text-sm">
                  Vista Previa &bull; Informe Ecográfico CENDO
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = generateUltrasoundWhatsAppUrl(patient, viewingUltrasound, activeDoctor);
                    window.open(url, "_blank");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => printHtmlElement("ultrasound-print-sheet", "Ecografia_" + patient.lastName + "_" + patient.firstName)}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsUltrasoundPrintOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center flex-1">
              <UltrasoundPrintView
                report={viewingUltrasound}
                patient={patient}
                doctor={activeDoctor}
              />
            </div>
          </div>
        </div>
      )}

      <MinorProcedureModal
        isOpen={isMinorProcModalOpen}
        onClose={() => setIsMinorProcModalOpen(false)}
        patient={patient}
        procedureToEdit={editingMinorProc}
        onSavedAndPrint={(proc) => {
          setViewingMinorProc(proc);
          setIsMinorProcPrintOpen(true);
        }}
      />

      {isMinorProcPrintOpen && viewingMinorProc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-3.5 border-b border-border bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-accent" />
                <span className="font-heading font-bold text-sm">
                  Vista Previa &bull; Reporte de Procedimiento Quirúrgico Ambulatorio CENDO
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = generateMinorProcedureWhatsAppUrl(patient, viewingMinorProc, activeDoctor);
                    window.open(url, "_blank");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => printHtmlElement("minor-proc-print-sheet", "Procedimiento_" + patient.lastName + "_" + patient.firstName)}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMinorProcPrintOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center flex-1">
              <MinorProcedurePrintView
                procedure={viewingMinorProc}
                patient={patient}
                doctor={activeDoctor}
              />
            </div>
          </div>
        </div>
      )}

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        patient={patient}
        onSavedAndPrint={(q) => {
          setViewingQuote(q);
          setIsQuotePrintOpen(true);
        }}
      />

      {isQuotePrintOpen && viewingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-3.5 border-b border-border bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-accent" />
                <span className="font-heading font-bold text-sm">
                  Vista Previa &bull; Cotización / Presupuesto Médico CENDO
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = generateQuoteWhatsAppUrl(viewingQuote, activeDoctor);
                    window.open(url, "_blank");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => printHtmlElement("quote-print-sheet", "Presupuesto_" + patient.lastName + "_" + patient.firstName)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuotePrintOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center flex-1">
              <QuotePrintView
                quote={viewingQuote}
                doctor={activeDoctor}
              />
            </div>
          </div>
        </div>
      )}

      {isCompleteHistoryPrintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-3.5 border-b border-border bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-accent" />
                <span className="font-heading font-bold text-sm">
                  Vista Previa &bull; Historia Clínica Integral CENDO (Modelo Dr. Patrick Jacinto)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printHtmlElement("complete-history-print-sheet", "Historia_Clinica_" + patient.lastName + "_" + patient.firstName)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCompleteHistoryPrintOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center flex-1">
              <CompleteHistoryPrintView
                patient={patient}
                background={bg}
                consultations={consultations}
                doctor={activeDoctor}
              />
            </div>
          </div>
        </div>
      )}

      <WordHistoryModal
        isOpen={isWordHistoryModalOpen}
        onClose={() => setIsWordHistoryModalOpen(false)}
        patient={patient}
      />

      <DocumentViewerModal
        isOpen={isDocViewerOpen}
        onClose={() => {
          setIsDocViewerOpen(false);
          setSelectedDocToView(null);
        }}
        document={selectedDocToView}
        patient={patient}
        doctor={activeDoctor}
      />
    </>
  );
}
