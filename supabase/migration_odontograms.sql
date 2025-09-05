-- Crear tabla odontograms si no existe
CREATE TABLE IF NOT EXISTS public.odontograms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    chart JSONB NOT NULL DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_odontograms_patient_id ON public.odontograms(patient_id);
CREATE INDEX IF NOT EXISTS idx_odontograms_created_at ON public.odontograms(created_at);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_odontograms_updated_at ON public.odontograms;
CREATE TRIGGER update_odontograms_updated_at
    BEFORE UPDATE ON public.odontograms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Agregar comentarios a la tabla
COMMENT ON TABLE public.odontograms IS 'Tabla para almacenar odontogramas de pacientes';
COMMENT ON COLUMN public.odontograms.chart IS 'JSON con el estado de cada diente (1-32)';
COMMENT ON COLUMN public.odontograms.notes IS 'Notas adicionales del odontograma';
COMMENT ON COLUMN public.odontograms.patient_id IS 'ID del paciente al que pertenece el odontograma';

-- Otorgar permisos
GRANT ALL ON public.odontograms TO authenticated;
GRANT ALL ON public.odontograms TO service_role;



