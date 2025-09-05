-- SOLUCIÓN RÁPIDA: Crear solo la tabla odontograms
-- Ejecuta este script en el SQL Editor de Supabase

-- Crear tabla odontograms
CREATE TABLE IF NOT EXISTS public.odontograms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    chart JSONB NOT NULL DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice básico
CREATE INDEX IF NOT EXISTS idx_odontograms_patient_id ON public.odontograms(patient_id);

-- Otorgar permisos básicos
GRANT ALL ON public.odontograms TO authenticated;
GRANT ALL ON public.odontograms TO service_role;

-- Verificar que se creó
SELECT 'Tabla odontograms creada exitosamente' as status;



