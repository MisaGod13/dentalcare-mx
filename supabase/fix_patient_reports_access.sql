-- Corregir políticas RLS para acceso de pacientes a informes médicos
-- Este archivo asegura que los pacientes puedan ver sus informes médicos

-- Primero, eliminar políticas existentes que puedan estar causando conflictos
DROP POLICY IF EXISTS "pacientes pueden ver sus informes" ON public.ai_reports;
DROP POLICY IF EXISTS "informes por dueño" ON public.ai_reports;

-- Crear política para dentistas: pueden ver/editar informes de sus pacientes
CREATE POLICY "dentistas pueden gestionar informes de sus pacientes" ON public.ai_reports
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

-- Crear política para pacientes: pueden ver solo sus informes marcados como visibles
CREATE POLICY "pacientes pueden ver sus informes" ON public.ai_reports
FOR SELECT USING (
  is_visible_to_patient = true 
  AND EXISTS (
    SELECT 1 FROM public.profiles pr
    WHERE pr.id = auth.uid()
    AND pr.patient_id = ai_reports.patient_id
  )
);

-- Asegurar que la tabla tenga el campo is_visible_to_patient
ALTER TABLE public.ai_reports 
ADD COLUMN IF NOT EXISTS is_visible_to_patient boolean DEFAULT true;

-- Crear índice para mejorar el rendimiento de las consultas de pacientes
CREATE INDEX IF NOT EXISTS idx_ai_reports_patient_visible 
ON public.ai_reports(patient_id, is_visible_to_patient) 
WHERE is_visible_to_patient = true;

-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'ai_reports'
ORDER BY policyname;
