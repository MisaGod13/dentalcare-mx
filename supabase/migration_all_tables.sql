-- =====================================================
-- MIGRACIÓN COMPLETA PARA SISTEMA DE HISTORIAS CLÍNICAS
-- =====================================================

-- 1. TABLA ODONTOGRAMS
CREATE TABLE IF NOT EXISTS public.odontograms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    chart JSONB NOT NULL DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA MEDICAL_HISTORIES
CREATE TABLE IF NOT EXISTS public.medical_histories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA FILES
CREATE TABLE IF NOT EXISTS public.files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_url TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA AI_REPORTS
CREATE TABLE IF NOT EXISTS public.ai_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    model TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

-- Índices para odontograms
CREATE INDEX IF NOT EXISTS idx_odontograms_patient_id ON public.odontograms(patient_id);
CREATE INDEX IF NOT EXISTS idx_odontograms_created_at ON public.odontograms(created_at);

-- Índices para medical_histories
CREATE INDEX IF NOT EXISTS idx_medical_histories_patient_id ON public.medical_histories(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_histories_created_at ON public.medical_histories(created_at);

-- Índices para files
CREATE INDEX IF NOT EXISTS idx_files_patient_id ON public.files(patient_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON public.files(created_at);

-- Índices para ai_reports
CREATE INDEX IF NOT EXISTS idx_ai_reports_patient_id ON public.ai_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_created_at ON public.ai_reports(created_at);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas las tablas
DROP TRIGGER IF EXISTS update_odontograms_updated_at ON public.odontograms;
CREATE TRIGGER update_odontograms_updated_at
    BEFORE UPDATE ON public.odontograms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_histories_updated_at ON public.medical_histories;
CREATE TRIGGER update_medical_histories_updated_at
    BEFORE UPDATE ON public.medical_histories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_files_updated_at ON public.files;
CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON public.files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_reports_updated_at ON public.ai_reports;
CREATE TRIGGER update_ai_reports_updated_at
    BEFORE UPDATE ON public.ai_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

-- Comentarios para odontograms
COMMENT ON TABLE public.odontograms IS 'Tabla para almacenar odontogramas de pacientes';
COMMENT ON COLUMN public.odontograms.chart IS 'JSON con el estado de cada diente (1-32) y sus condiciones';
COMMENT ON COLUMN public.odontograms.notes IS 'Notas adicionales del odontograma';
COMMENT ON COLUMN public.odontograms.patient_id IS 'ID del paciente al que pertenece el odontograma';

-- Comentarios para medical_histories
COMMENT ON TABLE public.medical_histories IS 'Tabla para almacenar historial médico de pacientes';
COMMENT ON COLUMN public.medical_histories.data IS 'JSON con datos de la visita médica';
COMMENT ON COLUMN public.medical_histories.patient_id IS 'ID del paciente';

-- Comentarios para files
COMMENT ON TABLE public.files IS 'Tabla para almacenar archivos adjuntos de pacientes';
COMMENT ON COLUMN public.files.file_name IS 'Nombre del archivo';
COMMENT ON COLUMN public.files.file_type IS 'Tipo de archivo (PDF, imagen, etc.)';
COMMENT ON COLUMN public.files.file_url IS 'URL del archivo almacenado';
COMMENT ON COLUMN public.files.file_size IS 'Tamaño del archivo en bytes';

-- Comentarios para ai_reports
COMMENT ON TABLE public.ai_reports IS 'Tabla para almacenar reportes generados por IA';
COMMENT ON COLUMN public.ai_reports.content IS 'Contenido del reporte de IA';
COMMENT ON COLUMN public.ai_reports.model IS 'Modelo de IA utilizado';

-- =====================================================
-- PERMISOS Y SEGURIDAD
-- =====================================================

-- Otorgar permisos a usuarios autenticados
GRANT ALL ON public.odontograms TO authenticated;
GRANT ALL ON public.medical_histories TO authenticated;
GRANT ALL ON public.files TO authenticated;
GRANT ALL ON public.ai_reports TO authenticated;

-- Otorgar permisos al servicio
GRANT ALL ON public.odontograms TO service_role;
GRANT ALL ON public.medical_histories TO service_role;
GRANT ALL ON public.files TO service_role;
GRANT ALL ON public.ai_reports TO service_role;

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.odontograms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;

-- Política para odontograms: usuarios solo pueden ver/editar odontogramas de sus pacientes
CREATE POLICY "Users can view own patients odontograms" ON public.odontograms
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM public.patients 
            WHERE dentist_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own patients odontograms" ON public.odontograms
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM public.patients 
            WHERE dentist_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own patients odontograms" ON public.odontograms
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM public.patients 
            WHERE dentist_id = auth.uid()
        )
    );

-- Política para medical_histories
CREATE POLICY "Users can view own patients medical histories" ON public.medical_histories
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM public.patients 
            WHERE dentist_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own patients medical histories" ON public.medical_histories
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM public.patients 
            WHERE dentist_id = auth.uid()
        )
    );

-- Política para files
CREATE POLICY "Users can view own patients files" ON public.files
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM public.patients 
            WHERE dentist_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own patients files" ON public.files
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM public.patients 
            WHERE dentist_id = auth.uid()
        )
    );

-- Política para ai_reports
CREATE POLICY "Users can view own patients ai reports" ON public.ai_reports
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM public.patients 
            WHERE dentist_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own patients ai reports" ON public.ai_reports
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM public.patients 
            WHERE dentist_id = auth.uid()
        )
    );

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que las tablas se crearon correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('odontograms', 'medical_histories', 'files', 'ai_reports')
ORDER BY table_name, ordinal_position;



