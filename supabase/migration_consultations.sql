-- =====================================================
-- MIGRACIÓN PARA SISTEMA DE CONSULTAS
-- =====================================================

-- TABLA CONSULTATIONS (Consultas/Visitas del Paciente)
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    consultation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    consultation_time TIME DEFAULT CURRENT_TIME,
    consultation_type TEXT NOT NULL, -- 'primera_vez', 'control', 'urgencia', 'limpieza', 'tratamiento'
    symptoms TEXT, -- Síntomas reportados por el paciente
    examination_findings TEXT, -- Hallazgos del examen clínico
    diagnosis TEXT, -- Diagnóstico preliminar
    treatment_plan TEXT, -- Plan de tratamiento
    treatment_performed TEXT, -- Tratamiento realizado
    prescriptions TEXT, -- Medicamentos recetados
    recommendations TEXT, -- Recomendaciones para el paciente
    next_appointment DATE, -- Próxima cita
    notes TEXT, -- Notas adicionales
    doctor_notes TEXT, -- Notas privadas del doctor
    status TEXT DEFAULT 'completed', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA CONSULTATION_TREATMENTS (Tratamientos específicos por consulta)
CREATE TABLE IF NOT EXISTS public.consultation_treatments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    treatment_type TEXT NOT NULL, -- 'limpieza', 'empaste', 'extraccion', 'endodoncia', 'ortodoncia', etc.
    tooth_number TEXT, -- Número del diente tratado
    treatment_details TEXT, -- Detalles del tratamiento
    materials_used TEXT, -- Materiales utilizados
    cost DECIMAL(10,2), -- Costo del tratamiento
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA CONSULTATION_IMAGES (Imágenes de la consulta)
CREATE TABLE IF NOT EXISTS public.consultation_images (
    id UUID DEFAULT gen_random_uUID() PRIMARY KEY,
    consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT, -- 'radiografia', 'foto_clinica', 'antes_despues', etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

-- Índices para consultations
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON public.consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_consultations_type ON public.consultations(consultation_type);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);

-- Índices para consultation_treatments
CREATE INDEX IF NOT EXISTS idx_consultation_treatments_consultation_id ON public.consultation_treatments(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_treatments_type ON public.consultation_treatments(treatment_type);

-- Índices para consultation_images
CREATE INDEX IF NOT EXISTS idx_consultation_images_consultation_id ON public.consultation_images(consultation_id);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en consultations
DROP TRIGGER IF EXISTS update_consultations_updated_at ON public.consultations;
CREATE TRIGGER update_consultations_updated_at
    BEFORE UPDATE ON public.consultations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para obtener el historial completo de un paciente
CREATE OR REPLACE FUNCTION get_patient_consultation_history(patient_uuid UUID)
RETURNS TABLE (
    consultation_id UUID,
    consultation_date DATE,
    consultation_type TEXT,
    diagnosis TEXT,
    treatment_performed TEXT,
    next_appointment DATE,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.consultation_date,
        c.consultation_type,
        c.diagnosis,
        c.treatment_performed,
        c.next_appointment,
        c.status
    FROM public.consultations c
    WHERE c.patient_id = patient_uuid
    ORDER BY c.consultation_date DESC, c.consultation_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de consultas por paciente
CREATE OR REPLACE FUNCTION get_patient_consultation_stats(patient_uuid UUID)
RETURNS TABLE (
    total_consultations BIGINT,
    last_consultation_date DATE,
    consultation_types TEXT[],
    total_treatments BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(c.id)::BIGINT as total_consultations,
        MAX(c.consultation_date) as last_consultation_date,
        ARRAY_AGG(DISTINCT c.consultation_type) as consultation_types,
        COUNT(ct.id)::BIGINT as total_treatments
    FROM public.consultations c
    LEFT JOIN public.consultation_treatments ct ON c.id = ct.consultation_id
    WHERE c.patient_id = patient_uuid
    GROUP BY c.patient_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_images ENABLE ROW LEVEL SECURITY;

-- Políticas para consultations
CREATE POLICY "Users can view consultations" ON public.consultations
    FOR SELECT USING (true);

CREATE POLICY "Users can insert consultations" ON public.consultations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update consultations" ON public.consultations
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete consultations" ON public.consultations
    FOR DELETE USING (true);

-- Políticas para consultation_treatments
CREATE POLICY "Users can view consultation treatments" ON public.consultation_treatments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert consultation treatments" ON public.consultation_treatments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update consultation treatments" ON public.consultation_treatments
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete consultation treatments" ON public.consultation_treatments
    FOR DELETE USING (true);

-- Políticas para consultation_images
CREATE POLICY "Users can view consultation images" ON public.consultation_images
    FOR SELECT USING (true);

CREATE POLICY "Users can insert consultation images" ON public.consultation_images
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update consultation images" ON public.consultation_images
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete consultation images" ON public.consultation_images
    FOR DELETE USING (true);
