const fs = require('fs');

let code = fs.readFileSync('src/store/useMedicalStore.ts', 'utf8');

// 1. Add PatientDocument to import from @/types/medical
if (!code.includes('PatientDocument,')) {
  code = code.replace(
    '  PrenatalBaselineData,\n} from "@/types/medical";',
    '  PrenatalBaselineData,\n  PatientDocument,\n} from "@/types/medical";'
  );
}

// 2. Add syncDocumentToSupabase, deleteDocumentFromSupabase to import from @/lib/supabaseSync
if (!code.includes('syncDocumentToSupabase,')) {
  code = code.replace(
    '  syncPrenatalCardToSupabase,\n  deletePrenatalCardFromSupabase,\n} from "@/lib/supabaseSync";',
    '  syncPrenatalCardToSupabase,\n  deletePrenatalCardFromSupabase,\n  syncDocumentToSupabase,\n  deleteDocumentFromSupabase,\n} from "@/lib/supabaseSync";'
  );
}

// 3. Define INITIAL_DOCUMENTS before MedicalStoreState interface
const initialDocsCode = `
// Documentos y Exámenes Externos Iniciales (Demo en Supabase)
export const INITIAL_DOCUMENTS: PatientDocument[] = [
  {
    id: "30000000-0000-0000-0000-000000000001",
    patientId: "pat-daniela-castro",
    documentType: "PATOLOGIA",
    title: "Informe de Biopsia de Cérvix - Anatomía Patológica",
    fileName: "biopsia-cervical-daniela-castro.pdf",
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/10000000-0000-0000-0000-000000000004/biopsia-cervical-daniela-castro.pdf",
    filePath: "10000000-0000-0000-0000-000000000004/biopsia-cervical-daniela-castro.pdf",
    fileSize: 2048,
    mimeType: "application/pdf",
    notes: "Biopsia a horas 1:00 y 7:00. Diagnóstico: Neoplasia Intraepitelial Cervical Grado 2 (NIC 2 / LIE-AG) con focos de NIC 3. Márgenes endocervicales libres de neoplasia.",
    createdAt: "2026-11-10T14:30:00Z",
  },
  {
    id: "30000000-0000-0000-0000-000000000002",
    patientId: "pat-luciana-ramos",
    documentType: "PAP",
    title: "Citología Cervico-Vaginal PAP ThinPrep - Biolaq",
    fileName: "pap-thinprep-luciana-ramos.pdf",
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/10000000-0000-0000-0000-000000000001/pap-thinprep-luciana-ramos.pdf",
    filePath: "10000000-0000-0000-0000-000000000001/pap-thinprep-luciana-ramos.pdf",
    fileSize: 2048,
    mimeType: "application/pdf",
    notes: "Frotis citológico satisfactorio. Negativo para lesión intraepitelial o malignidad (NILM). Flora bacilar Döderlein habitual.",
    createdAt: "2026-11-04T10:15:00Z",
  },
  {
    id: "30000000-0000-0000-0000-000000000003",
    patientId: "pat-luciana-ramos",
    documentType: "VPH",
    title: "Panel Molecular VPH 23 Genotipos PCR - Biolaq",
    fileName: "vph-pcr-luciana-ramos.pdf",
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/10000000-0000-0000-0000-000000000001/vph-pcr-luciana-ramos.pdf",
    filePath: "10000000-0000-0000-0000-000000000001/vph-pcr-luciana-ramos.pdf",
    fileSize: 2048,
    mimeType: "application/pdf",
    notes: "Prueba molecular de Reacción en Cadena de la Polimerasa (PCR) tiempo real: NEGATIVO para los 23 genotipos evaluados.",
    createdAt: "2026-11-04T10:20:00Z",
  },
  {
    id: "30000000-0000-0000-0000-000000000004",
    patientId: "pat-fiorella-mendoza",
    documentType: "LABORATORIO",
    title: "Batería Gestacional 1er Trimestre - Suiza Lab",
    fileName: "bateria-gestacional-fiorella-mendoza.pdf",
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/10000000-0000-0000-0000-000000000002/bateria-gestacional-fiorella-mendoza.pdf",
    filePath: "10000000-0000-0000-0000-000000000002/bateria-gestacional-fiorella-mendoza.pdf",
    fileSize: 2048,
    mimeType: "application/pdf",
    notes: "Hemograma: Hb 12.8 g/dL. Glucosa: 84 mg/dL. Grupo O Rh (+). VDRL: No Reactivo. VIH: Negativo. Urocultivo: Sin desarrollo bacteriano.",
    createdAt: "2026-10-25T11:00:00Z",
  },
  {
    id: "30000000-0000-0000-0000-000000000005",
    patientId: "pat-gabriela-paredes",
    documentType: "LABORATORIO",
    title: "Marcador Tumoral CA-125 & Perfil Inflamatorio - Laboratorios Roe",
    fileName: "ca125-gabriela-paredes.pdf",
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/10000000-0000-0000-0000-000000000003/ca125-gabriela-paredes.pdf",
    filePath: "10000000-0000-0000-0000-000000000003/ca125-gabriela-paredes.pdf",
    fileSize: 2048,
    mimeType: "application/pdf",
    notes: "Antígeno Carbohidrato CA-125: 68.4 U/mL (Normal < 35 U/mL). Compatible con endometriosis ovárica bilateral severa.",
    createdAt: "2026-11-08T16:45:00Z",
  },
  {
    id: "30000000-0000-0000-0000-000000000006",
    patientId: "pat-carmen-huaman",
    documentType: "ECOGRAFIA",
    title: "Densitometría Ósea Dual (DEXA) - Columna Lumbar y Fémur",
    fileName: "densitometria-carmen-huaman.pdf",
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/10000000-0000-0000-0000-000000000005/densitometria-carmen-huaman.pdf",
    filePath: "10000000-0000-0000-0000-000000000005/densitometria-carmen-huaman.pdf",
    fileSize: 2048,
    mimeType: "application/pdf",
    notes: "T-Score L1-L4: -1.8 (Osteopenia leve). Cuello Femoral T-score: -1.4. Sin signos de osteoporosis fracturaria.",
    createdAt: "2026-11-06T09:30:00Z",
  },
];
`;

if (!code.includes('INITIAL_DOCUMENTS')) {
  code = code.replace(
    'interface MedicalStoreState {',
    initialDocsCode + '\ninterface MedicalStoreState {'
  );
}

// 4. Add to MedicalStoreState interface
if (!code.includes('patientDocuments: PatientDocument[];')) {
  code = code.replace(
    '  getPrenatalCardByPatientId: (patientId: string) => PrenatalCard | undefined;\n}',
    `  getPrenatalCardByPatientId: (patientId: string) => PrenatalCard | undefined;

  // Repositorio de Documentos y Exámenes Externos en PDF
  patientDocuments: PatientDocument[];
  addPatientDocument: (doc: PatientDocument) => void;
  deletePatientDocument: (id: string) => Promise<void>;
  getDocumentsByPatientId: (patientId: string) => PatientDocument[];
}`
  );
}

// 5. In deletePatient: also filter patientDocuments
if (!code.includes('patientDocuments: state.patientDocuments.filter')) {
  code = code.replace(
    'prenatalCards: state.prenatalCards.filter((card) => card.patientId !== id),',
    `prenatalCards: state.prenatalCards.filter((card) => card.patientId !== id),
            patientDocuments: state.patientDocuments.filter((doc) => doc.patientId !== id),`
  );
}

// 6. In store implementation: add methods and state
const storeMethods = `
      // REPOSITORIO DE DOCUMENTOS Y EXÁMENES EXTERNOS (PDF)
      patientDocuments: INITIAL_DOCUMENTS,
      addPatientDocument: (doc) => {
        set((state) => ({
          patientDocuments: [doc, ...state.patientDocuments],
        }));
        syncDocumentToSupabase(doc);
      },
      deletePatientDocument: async (id) => {
        const doc = get().patientDocuments.find((d) => d.id === id);
        set((state) => ({
          patientDocuments: state.patientDocuments.filter((d) => d.id !== id),
        }));
        await deleteDocumentFromSupabase(id, doc?.filePath);
      },
      getDocumentsByPatientId: (patientId) => {
        return get().patientDocuments.filter((d) => d.patientId === patientId);
      },
`;

if (!code.includes('addPatientDocument: (doc) =>')) {
  code = code.replace(
    '      getPrenatalCardByPatientId: (patientId) => {\n        return get().prenatalCards.find((card) => card.patientId === patientId);\n      },',
    `      getPrenatalCardByPatientId: (patientId) => {
        return get().prenatalCards.find((card) => card.patientId === patientId);
      },
${storeMethods}`
  );
}

// 7. Update resetAllToSeeds
if (!code.includes('patientDocuments: INITIAL_DOCUMENTS,')) {
  code = code.replace(
    'prenatalCards: INITIAL_PRENATAL_CARDS,\n        });\n      },',
    'prenatalCards: INITIAL_PRENATAL_CARDS,\n          patientDocuments: INITIAL_DOCUMENTS,\n        });\n      },'
  );
}

// 8. Update migrate and version to 4
code = code.replace('version: 3,', 'version: 4,');
code = code.replace(
    'prenatalCards: INITIAL_PRENATAL_CARDS,\n          };',
    'prenatalCards: INITIAL_PRENATAL_CARDS,\n            patientDocuments: INITIAL_DOCUMENTS,\n          };'
);

fs.writeFileSync('src/store/useMedicalStore.ts', code, 'utf8');
console.log('✓ useMedicalStore.ts successfully updated with INITIAL_DOCUMENTS! Version: 4');
