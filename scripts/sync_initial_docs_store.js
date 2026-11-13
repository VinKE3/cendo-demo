const fs = require('fs');

let code = fs.readFileSync('src/store/useMedicalStore.ts', 'utf8');

const updatedInitialDocs = `export const INITIAL_DOCUMENTS: PatientDocument[] = [
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
];`;

const startIdx = code.indexOf('export const INITIAL_DOCUMENTS: PatientDocument[] = [');
const endIdx = code.indexOf('];', startIdx) + 2;

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + updatedInitialDocs + code.substring(endIdx);
  fs.writeFileSync('src/store/useMedicalStore.ts', code, 'utf8');
  console.log('✓ INITIAL_DOCUMENTS updated with verified Supabase Storage URLs!');
} else {
  console.error('Could not find INITIAL_DOCUMENTS in useMedicalStore.ts');
}

