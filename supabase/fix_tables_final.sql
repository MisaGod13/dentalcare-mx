-- =====================================================
-- CORRECCIÓN FINAL DE ESTRUCTURA DE TABLAS PARA PACIENTES
-- =====================================================
-- Ejecutar este archivo en Supabase SQL Editor para corregir la estructura de las tablas

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

-- 2. VERIFICAR ESTRUCTURA DE TABLAS EXISTENTES
SELECT 
    'ESTRUCTURA ACTUAL' as info,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN (
    'patient_recommendations',
    'patient_diagnoses',
    'patient_notifications',
    'medical_history',
    'appointments'
)
ORDER BY table_name, ordinal_position;

-- 3. CORREGIR TABLA medical_history
-- Verificar si existe la tabla
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medical_history') THEN
        CREATE TABLE public.medical_history (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
            consultation_date TIMESTAMPTZ DEFAULT NOW(),
            diagnosis TEXT,
            treatment TEXT,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla medical_history creada';
    END IF;
END $$;

-- Agregar columnas faltantes si la tabla existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medical_history') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'medical_history' AND column_name = 'consultation_date') THEN
            ALTER TABLE public.medical_history ADD COLUMN consultation_date TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Columna consultation_date agregada a medical_history';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'medical_history' AND column_name = 'diagnosis') THEN
            ALTER TABLE public.medical_history ADD COLUMN diagnosis TEXT;
            RAISE NOTICE 'Columna diagnosis agregada a medical_history';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'medical_history' AND column_name = 'treatment') THEN
            ALTER TABLE public.medical_history ADD COLUMN treatment TEXT;
            RAISE NOTICE 'Columna treatment agregada a medical_history';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'medical_history' AND column_name = 'notes') THEN
            ALTER TABLE public.medical_history ADD COLUMN notes TEXT;
            RAISE NOTICE 'Columna notes agregada a medical_history';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'medical_history' AND column_name = 'created_at') THEN
            ALTER TABLE public.medical_history ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Columna created_at agregada a medical_history';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'medical_history' AND column_name = 'updated_at') THEN
            ALTER TABLE public.medical_history ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Columna updated_at agregada a medical_history';
        END IF;
    END IF;
END $$;

-- 4. CORREGIR TABLA patient_recommendations
-- Verificar si existe la tabla
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patient_recommendations') THEN
        CREATE TABLE public.patient_recommendations (
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
        RAISE NOTICE 'Tabla patient_recommendations creada';
    END IF;
END $$;

-- Agregar columnas faltantes si la tabla existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patient_recommendations') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_recommendations' AND column_name = 'title') THEN
            ALTER TABLE public.patient_recommendations ADD COLUMN title TEXT NOT NULL DEFAULT 'Recomendación';
            RAISE NOTICE 'Columna title agregada a patient_recommendations';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_recommendations' AND column_name = 'description') THEN
            ALTER TABLE public.patient_recommendations ADD COLUMN description TEXT;
            RAISE NOTICE 'Columna description agregada a patient_recommendations';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_recommendations' AND column_name = 'type') THEN
            ALTER TABLE public.patient_recommendations ADD COLUMN type TEXT DEFAULT 'general';
            RAISE NOTICE 'Columna type agregada a patient_recommendations';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_recommendations' AND column_name = 'priority') THEN
            ALTER TABLE public.patient_recommendations ADD COLUMN priority TEXT DEFAULT 'medium';
            RAISE NOTICE 'Columna priority agregada a patient_recommendations';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_recommendations' AND column_name = 'status') THEN
            ALTER TABLE public.patient_recommendations ADD COLUMN status TEXT DEFAULT 'active';
            RAISE NOTICE 'Columna status agregada a patient_recommendations';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_recommendations' AND column_name = 'instructions') THEN
            ALTER TABLE public.patient_recommendations ADD COLUMN instructions TEXT;
            RAISE NOTICE 'Columna instructions agregada a patient_recommendations';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_recommendations' AND column_name = 'created_at') THEN
            ALTER TABLE public.patient_recommendations ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Columna created_at agregada a patient_recommendations';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_recommendations' AND column_name = 'updated_at') THEN
            ALTER TABLE public.patient_recommendations ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Columna updated_at agregada a patient_recommendations';
        END IF;
    END IF;
END $$;

-- 5. CORREGIR TABLA patient_diagnoses
-- Verificar si existe la tabla
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patient_diagnoses') THEN
        CREATE TABLE public.patient_diagnoses (
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
        RAISE NOTICE 'Tabla patient_diagnoses creada';
    END IF;
END $$;

-- Agregar columnas faltantes si la tabla existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patient_diagnoses') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_diagnoses' AND column_name = 'condition_name') THEN
            ALTER TABLE public.patient_diagnoses ADD COLUMN condition_name TEXT NOT NULL DEFAULT 'Condición';
            RAISE NOTICE 'Columna condition_name agregada a patient_diagnoses';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_diagnoses' AND column_name = 'description') THEN
            ALTER TABLE public.patient_diagnoses ADD COLUMN description TEXT;
            RAISE NOTICE 'Columna description agregada a patient_diagnoses';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_diagnoses' AND column_name = 'severity') THEN
            ALTER TABLE public.patient_diagnoses ADD COLUMN severity TEXT DEFAULT 'moderate';
            RAISE NOTICE 'Columna severity agregada a patient_diagnoses';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_diagnoses' AND column_name = 'diagnosis_date') THEN
            ALTER TABLE public.patient_diagnoses ADD COLUMN diagnosis_date TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Columna diagnosis_date agregada a patient_diagnoses';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_diagnoses' AND column_name = 'treatment_plan') THEN
            ALTER TABLE public.patient_diagnoses ADD COLUMN treatment_plan TEXT;
            RAISE NOTICE 'Columna treatment_plan agregada a patient_diagnoses';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_diagnoses' AND column_name = 'created_at') THEN
            ALTER TABLE public.patient_diagnoses ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Columna created_at agregada a patient_diagnoses';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_diagnoses' AND column_name = 'updated_at') THEN
            ALTER TABLE public.patient_diagnoses ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Columna updated_at agregada a patient_diagnoses';
        END IF;
    END IF;
END $$;

-- 6. CORREGIR TABLA patient_notifications
-- Verificar si existe la tabla
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patient_notifications') THEN
        CREATE TABLE public.patient_notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            notification_type TEXT DEFAULT 'general',
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla patient_notifications creada';
    END IF;
END $$;

-- Agregar columnas faltantes si la tabla existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patient_notifications') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_notifications' AND column_name = 'title') THEN
            ALTER TABLE public.patient_notifications ADD COLUMN title TEXT NOT NULL DEFAULT 'Notificación';
            RAISE NOTICE 'Columna title agregada a patient_notifications';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_notifications' AND column_name = 'message') THEN
            ALTER TABLE public.patient_notifications ADD COLUMN message TEXT NOT NULL DEFAULT 'Mensaje';
            RAISE NOTICE 'Columna message agregada a patient_notifications';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_notifications' AND column_name = 'notification_type') THEN
            ALTER TABLE public.patient_notifications ADD COLUMN notification_type TEXT DEFAULT 'general';
            RAISE NOTICE 'Columna notification_type agregada a patient_notifications';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_notifications' AND column_name = 'is_read') THEN
            ALTER TABLE public.patient_notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Columna is_read agregada a patient_notifications';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_notifications' AND column_name = 'created_at') THEN
            ALTER TABLE public.patient_notifications ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Columna created_at agregada a patient_notifications';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_notifications' AND column_name = 'updated_at') THEN
            ALTER TABLE public.patient_notifications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Columna updated_at agregada a patient_notifications';
        END IF;
    END IF;
END $$;

-- 7. CORREGIR TABLA appointments
-- Verificar si existe la tabla
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN
        CREATE TABLE public.appointments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
            appointment_date TIMESTAMPTZ NOT NULL,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla appointments creada';
    END IF;
END $$;

-- Agregar columnas faltantes si la tabla existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'appointment_date') THEN
            ALTER TABLE public.appointments ADD COLUMN appointment_date TIMESTAMPTZ NOT NULL DEFAULT NOW();
            RAISE NOTICE 'Columna appointment_date agregada a appointments';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'status') THEN
            ALTER TABLE public.appointments ADD COLUMN status TEXT DEFAULT 'pending';
            RAISE NOTICE 'Columna status agregada a appointments';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'notes') THEN
            ALTER TABLE public.appointments ADD COLUMN notes TEXT;
            RAISE NOTICE 'Columna notes agregada a appointments';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'created_at') THEN
            ALTER TABLE public.appointments ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Columna created_at agregada a appointments';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'updated_at') THEN
            ALTER TABLE public.appointments ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Columna updated_at agregada a appointments';
        END IF;
    END IF;
END $$;

-- 8. HABILITAR RLS Y CREAR ÍNDICES
-- medical_history
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_medical_history_patient_id ON public.medical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_history_consultation_date ON public.medical_history(consultation_date);

-- patient_recommendations
ALTER TABLE public.patient_recommendations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_patient_recommendations_patient_id ON public.patient_recommendations(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_recommendations_status ON public.patient_recommendations(status);

-- patient_diagnoses
ALTER TABLE public.patient_diagnoses ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_patient_diagnoses_patient_id ON public.patient_diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_diagnoses_diagnosis_date ON public.patient_diagnoses(diagnosis_date);

-- patient_notifications
ALTER TABLE public.patient_notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_patient_notifications_patient_id ON public.patient_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_is_read ON public.patient_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_created_at ON public.patient_notifications(created_at);

-- appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- 9. CREAR POLÍTICAS RLS
-- Políticas para medical_history
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

-- Políticas para patient_recommendations
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

-- Políticas para patient_diagnoses
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

-- Políticas para patient_notifications
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

-- Políticas para appointments
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

-- 10. VERIFICAR ESTRUCTURA FINAL
SELECT 
    'ESTRUCTURA FINAL' as info,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN (
    'patient_recommendations',
    'patient_diagnoses',
    'patient_notifications',
    'medical_history',
    'appointments'
)
ORDER BY table_name, ordinal_position;

-- 11. VERIFICAR QUE TODAS LAS TABLAS SE CREARON CORRECTAMENTE
SELECT 
    'VERIFICACIÓN FINAL' as info,
    t.table_name,
    CASE 
        WHEN it.table_name IS NOT NULL THEN '✅ EXISTE'
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
ORDER BY t.table_name;

-- 12. VERIFICAR POLÍTICAS RLS
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

-- =====================================================
-- CORRECCIÓN COMPLETADA
-- =====================================================
