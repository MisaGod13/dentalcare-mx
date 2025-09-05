-- =====================================================
-- CREACIÓN SIMPLE DE TABLAS PARA PACIENTES
-- =====================================================
-- Ejecutar este archivo en Supabase SQL Editor para crear las tablas faltantes

-- 1. VERIFICAR QUÉ TABLAS EXISTEN
SELECT 
    'TABLAS EXISTENTES' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
    'patients',
    'profiles',
    'appointments',
    'patient_recommendations',
    'patient_diagnoses',
    'patient_notifications',
    'medical_history'
)
ORDER BY table_name;

-- 2. CREAR TABLA medical_history (si no existe)
CREATE TABLE IF NOT EXISTS public.medical_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    consultation_date TIMESTAMPTZ DEFAULT NOW(),
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para medical_history
CREATE INDEX IF NOT EXISTS idx_medical_history_patient_id ON public.medical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_history_consultation_date ON public.medical_history(consultation_date);

-- Habilitar RLS para medical_history
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

-- 3. CREAR TABLA patient_recommendations (si no existe)
CREATE TABLE IF NOT EXISTS public.patient_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'general',
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'active',
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para patient_recommendations
CREATE INDEX IF NOT EXISTS idx_patient_recommendations_patient_id ON public.patient_recommendations(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_recommendations_status ON public.patient_recommendations(status);

-- Habilitar RLS para patient_recommendations
ALTER TABLE public.patient_recommendations ENABLE ROW LEVEL SECURITY;

-- 4. CREAR TABLA patient_diagnoses (si no existe)
CREATE TABLE IF NOT EXISTS public.patient_diagnoses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    condition_name TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'moderate',
    diagnosis_date TIMESTAMPTZ DEFAULT NOW(),
    treatment_plan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para patient_diagnoses
CREATE INDEX IF NOT EXISTS idx_patient_diagnoses_patient_id ON public.patient_diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_diagnoses_diagnosis_date ON public.patient_diagnoses(diagnosis_date);

-- Habilitar RLS para patient_diagnoses
ALTER TABLE public.patient_diagnoses ENABLE ROW LEVEL SECURITY;

-- 5. CREAR TABLA patient_notifications (si no existe)
CREATE TABLE IF NOT EXISTS public.patient_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para patient_notifications
CREATE INDEX IF NOT EXISTS idx_patient_notifications_patient_id ON public.patient_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_is_read ON public.patient_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_created_at ON public.patient_notifications(created_at);

-- Habilitar RLS para patient_notifications
ALTER TABLE public.patient_notifications ENABLE ROW LEVEL SECURITY;

-- 6. CREAR TABLA appointments (si no existe)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Habilitar RLS para appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 7. CREAR POLÍTICAS RLS PARA medical_history
DROP POLICY IF EXISTS "patients_can_view_own_medical_history" ON public.medical_history;
CREATE POLICY "patients_can_view_own_medical_history" ON public.medical_history
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id
            FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'patient'
        )
    );

DROP POLICY IF EXISTS "dentists_can_manage_medical_history" ON public.medical_history;
CREATE POLICY "dentists_can_manage_medical_history" ON public.medical_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'dentist'
        )
    );

-- 8. CREAR POLÍTICAS RLS PARA patient_recommendations
DROP POLICY IF EXISTS "patients_can_view_own_recommendations" ON public.patient_recommendations;
CREATE POLICY "patients_can_view_own_recommendations" ON public.patient_recommendations
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id
            FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'patient'
        )
    );

DROP POLICY IF EXISTS "dentists_can_manage_recommendations" ON public.patient_recommendations;
CREATE POLICY "dentists_can_manage_recommendations" ON public.patient_recommendations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'dentist'
        )
    );

-- 9. CREAR POLÍTICAS RLS PARA patient_diagnoses
DROP POLICY IF EXISTS "patients_can_view_own_diagnoses" ON public.patient_diagnoses;
CREATE POLICY "patients_can_view_own_diagnoses" ON public.patient_diagnoses
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id
            FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'patient'
        )
    );

DROP POLICY IF EXISTS "dentists_can_manage_diagnoses" ON public.patient_diagnoses;
CREATE POLICY "dentists_can_manage_diagnoses" ON public.patient_diagnoses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'dentist'
        )
    );

-- 10. CREAR POLÍTICAS RLS PARA patient_notifications
DROP POLICY IF EXISTS "patients_can_view_own_notifications" ON public.patient_notifications;
CREATE POLICY "patients_can_view_own_notifications" ON public.patient_notifications
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id
            FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'patient'
        )
    );

DROP POLICY IF EXISTS "patients_can_update_own_notifications" ON public.patient_notifications;
CREATE POLICY "patients_can_update_own_notifications" ON public.patient_notifications
    FOR UPDATE USING (
        patient_id IN (
            SELECT patient_id
            FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'patient'
        )
    );

DROP POLICY IF EXISTS "dentists_can_manage_notifications" ON public.patient_notifications;
CREATE POLICY "dentists_can_manage_notifications" ON public.patient_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'dentist'
        )
    );

-- 11. CREAR POLÍTICAS RLS PARA appointments
DROP POLICY IF EXISTS "patients_can_view_own_appointments" ON public.appointments;
CREATE POLICY "patients_can_view_own_appointments" ON public.appointments
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id
            FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'patient'
        )
    );

DROP POLICY IF EXISTS "dentists_can_manage_appointments" ON public.appointments;
CREATE POLICY "dentists_can_manage_appointments" ON public.appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'dentist'
        )
    );

-- 12. VERIFICAR QUE TODAS LAS TABLAS SE CREARON CORRECTAMENTE
SELECT 
    'VERIFICACIÓN FINAL' as info,
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as status
FROM (
    VALUES 
        ('patients'),
        ('profiles'),
        ('appointments'),
        ('patient_recommendations'),
        ('patient_diagnoses'),
        ('patient_notifications'),
        ('medical_history')
) AS t(table_name)
LEFT JOIN information_schema.tables it ON it.table_name = t.table_name AND it.table_schema = 'public'
ORDER BY table_name;

-- 13. VERIFICAR POLÍTICAS RLS
SELECT 
    'POLÍTICAS RLS' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'patients',
    'profiles',
    'appointments',
    'patient_recommendations',
    'patient_diagnoses',
    'patient_notifications',
    'medical_history'
)
ORDER BY tablename, policyname;

-- 14. INSERTAR DATOS DE PRUEBA (OPCIONAL)
INSERT INTO public.patient_recommendations (patient_id, title, description, type, priority, status, instructions)
SELECT 
    p.id,
    'Mantener buena higiene dental',
    'Cepillarse los dientes al menos 2 veces al día',
    'hygiene',
    'high',
    'active',
    'Usar cepillo suave y pasta dental con flúor'
FROM public.patients p
WHERE NOT EXISTS (
    SELECT 1 FROM public.patient_recommendations pr 
    WHERE pr.patient_id = p.id 
    AND pr.title = 'Mantener buena higiene dental'
)
LIMIT 1;

INSERT INTO public.medical_history (patient_id, consultation_date, diagnosis, treatment, notes)
SELECT 
    p.id,
    NOW() - INTERVAL '30 days',
    'Revisión general',
    'Limpieza dental',
    'Paciente en buen estado general'
FROM public.patients p
WHERE NOT EXISTS (
    SELECT 1 FROM public.medical_history mh 
    WHERE mh.patient_id = p.id 
    AND mh.diagnosis = 'Revisión general'
)
LIMIT 1;

-- =====================================================
-- CREACIÓN COMPLETADA
-- =====================================================
