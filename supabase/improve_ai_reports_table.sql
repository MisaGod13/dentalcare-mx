-- Mejorar la tabla de informes de IA con campos adicionales
ALTER TABLE public.ai_reports 
ADD COLUMN IF NOT EXISTS report_type text DEFAULT 'comprehensive' CHECK (report_type IN ('comprehensive', 'consultation', 'diagnosis', 'follow_up')),
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS diagnosis text,
ADD COLUMN IF NOT EXISTS recommendations text,
ADD COLUMN IF NOT EXISTS treatment_plan text,
ADD COLUMN IF NOT EXISTS next_steps text,
ADD COLUMN IF NOT EXISTS risk_factors text,
ADD COLUMN IF NOT EXISTS consultation_id uuid REFERENCES public.consultations(id),
ADD COLUMN IF NOT EXISTS is_visible_to_patient boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS dentist_notes text,
ADD COLUMN IF NOT EXISTS generated_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ai_reports_patient_id ON public.ai_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_created_at ON public.ai_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reports_type ON public.ai_reports(report_type);

-- Actualizar políticas RLS para incluir los nuevos campos
DROP POLICY IF EXISTS "informes por dueño" ON public.ai_reports;
CREATE POLICY "informes por dueño" ON public.ai_reports 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.patients p 
    WHERE p.id = patient_id 
    AND p.dentist_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.patients p 
    WHERE p.id = patient_id 
    AND p.dentist_id = auth.uid()
  )
);

-- Política para que los pacientes puedan ver sus informes
CREATE POLICY "pacientes pueden ver sus informes" ON public.ai_reports
FOR SELECT USING (
  is_visible_to_patient = true 
  AND EXISTS (
    SELECT 1 FROM public.patients p 
    WHERE p.id = patient_id 
    AND p.id IN (
      SELECT patient_id FROM public.patient_account_requests 
      WHERE auth_user_id = auth.uid() 
      AND status = 'approved'
    )
  )
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_ai_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_ai_reports_updated_at ON public.ai_reports;
CREATE TRIGGER update_ai_reports_updated_at
  BEFORE UPDATE ON public.ai_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_reports_updated_at();
