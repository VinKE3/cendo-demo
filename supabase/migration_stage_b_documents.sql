-- =========================================================================
-- CENDO MEDICAL SUITE - ETAPA B: REPOSITORIO DE DOCUMENTOS Y POLÍTICAS STORAGE
-- =========================================================================

-- 1. Tabla para registrar los documentos y PDFs externos vinculados a cada paciente
CREATE TABLE IF NOT EXISTS patient_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL DEFAULT 'LABORATORIO', -- 'PAP', 'VPH', 'PATOLOGIA', 'LABORATORIO', 'ECOGRAFIA', 'OTRO'
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT,
  mime_type TEXT DEFAULT 'application/pdf',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deshabilitar RLS en desarrollo para sincronización directa
ALTER TABLE patient_documents DISABLE ROW LEVEL SECURITY;

-- 2. Políticas de permisos en storage.objects para lab-reports y clinical-images
DROP POLICY IF EXISTS "Allow public all on lab-reports" ON storage.objects;
CREATE POLICY "Allow public all on lab-reports" 
ON storage.objects FOR ALL 
USING (bucket_id = 'lab-reports') 
WITH CHECK (bucket_id = 'lab-reports');

DROP POLICY IF EXISTS "Allow public all on clinical-images" ON storage.objects;
CREATE POLICY "Allow public all on clinical-images" 
ON storage.objects FOR ALL 
USING (bucket_id = 'clinical-images') 
WITH CHECK (bucket_id = 'clinical-images');

