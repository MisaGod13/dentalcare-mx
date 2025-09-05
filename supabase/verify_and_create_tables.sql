-- =====================================================
-- VERIFICACIÓN Y CREACIÓN DE TABLAS PARA PACIENTES
-- =====================================================
-- Ejecutar este archivo en Supabase SQL Editor para verificar y crear tablas faltantes

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
    'medical_history',
    'consultations'
)
ORDER BY table_name;

-- 2. VERIFICAR ESTRUCTURA DE TABLAS EXISTENTES
DO $$
DECLARE
    current_table_name text;
    table_exists boolean;
BEGIN
    -- Verificar si existe la tabla medical_history
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'medical_history'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Creando tabla medical_history...';
        
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
        
        -- Crear índices
        CREATE INDEX idx_medical_history_patient_id ON public.medical_history(patient_id);
        CREATE INDEX idx_medical_history_consultation_date ON public.medical_history(consultation_date);
        
        -- Habilitar RLS
        ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
        
        -- Crear políticas RLS
        CREATE POLICY "patients_can_view_own_medical_history" ON public.medical_history
            FOR SELECT USING (
                patient_id IN (
                    SELECT patient_id
                    FROM public.profiles
                    WHERE id = auth.uid()
                    AND role = 'patient'
                )
            );
            
        CREATE POLICY "dentists_can_manage_medical_history" ON public.medical_history
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid()
                    AND role = 'dentist'
                )
            );
            
        RAISE NOTICE 'Tabla medical_history creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla medical_history ya existe';
    END IF;
    
    -- Verificar si existe la tabla patient_recommendations
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'patient_recommendations'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Creando tabla patient_recommendations...';
        
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
        
        -- Crear índices
        CREATE INDEX idx_patient_recommendations_patient_id ON public.patient_recommendations(patient_id);
        CREATE INDEX idx_patient_recommendations_status ON public.patient_recommendations(status);
        
        -- Habilitar RLS
        ALTER TABLE public.patient_recommendations ENABLE ROW LEVEL SECURITY;
        
        -- Crear políticas RLS
        CREATE POLICY "patients_can_view_own_recommendations" ON public.patient_recommendations
            FOR SELECT USING (
                patient_id IN (
                    SELECT patient_id
                    FROM public.profiles
                    WHERE id = auth.uid()
                    AND role = 'patient'
                )
            );
            
        CREATE POLICY "dentists_can_manage_recommendations" ON public.patient_recommendations
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid()
                    AND role = 'dentist'
                )
            );
            
        RAISE NOTICE 'Tabla patient_recommendations creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla patient_recommendations ya existe';
    END IF;
    
    -- Verificar si existe la tabla patient_diagnoses
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'patient_diagnoses'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Creando tabla patient_diagnoses...';
        
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
        
        -- Crear índices
        CREATE INDEX idx_patient_diagnoses_patient_id ON public.patient_diagnoses(patient_id);
        CREATE INDEX idx_patient_diagnoses_diagnosis_date ON public.patient_diagnoses(diagnosis_date);
        
        -- Habilitar RLS
        ALTER TABLE public.patient_diagnoses ENABLE ROW LEVEL SECURITY;
        
        -- Crear políticas RLS
        CREATE POLICY "patients_can_view_own_diagnoses" ON public.patient_diagnoses
            FOR SELECT USING (
                patient_id IN (
                    SELECT patient_id
                    FROM public.profiles
                    WHERE id = auth.uid()
                    AND role = 'patient'
                )
            );
            
        CREATE POLICY "dentists_can_manage_diagnoses" ON public.patient_diagnoses
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid()
                    AND role = 'dentist'
                )
            );
            
        RAISE NOTICE 'Tabla patient_diagnoses creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla patient_diagnoses ya existe';
    END IF;
    
    -- Verificar si existe la tabla patient_notifications
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'patient_notifications'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Creando tabla patient_notifications...';
        
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
        
        -- Crear índices
        CREATE INDEX idx_patient_notifications_patient_id ON public.patient_notifications(patient_id);
        CREATE INDEX idx_patient_notifications_is_read ON public.patient_notifications(is_read);
        CREATE INDEX idx_patient_notifications_created_at ON public.patient_notifications(created_at);
        
        -- Habilitar RLS
        ALTER TABLE public.patient_notifications ENABLE ROW LEVEL SECURITY;
        
        -- Crear políticas RLS
        CREATE POLICY "patients_can_view_own_notifications" ON public.patient_notifications
            FOR SELECT USING (
                patient_id IN (
                    SELECT patient_id
                    FROM public.profiles
                    WHERE id = auth.uid()
                    AND role = 'patient'
                )
            );
            
        CREATE POLICY "patients_can_update_own_notifications" ON public.patient_notifications
            FOR UPDATE USING (
                patient_id IN (
                    SELECT patient_id
                    FROM public.profiles
                    WHERE id = auth.uid()
                    AND role = 'patient'
                )
            );
            
        CREATE POLICY "dentists_can_manage_notifications" ON public.patient_notifications
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid()
                    AND role = 'dentist'
                )
            );
            
        RAISE NOTICE 'Tabla patient_notifications creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla patient_notifications ya existe';
    END IF;
    
    -- Verificar si existe la tabla appointments
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'appointments'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Creando tabla appointments...';
        
        CREATE TABLE public.appointments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
            appointment_date TIMESTAMPTZ NOT NULL,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Crear índices
        CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
        CREATE INDEX idx_appointments_appointment_date ON public.appointments(appointment_date);
        CREATE INDEX idx_appointments_status ON public.appointments(status);
        
        -- Habilitar RLS
        ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
        
        -- Crear políticas RLS
        CREATE POLICY "patients_can_view_own_appointments" ON public.appointments
            FOR SELECT USING (
                patient_id IN (
                    SELECT patient_id
                    FROM public.profiles
                    WHERE id = auth.uid()
                    AND role = 'patient'
                )
            );
            
        CREATE POLICY "dentists_can_manage_appointments" ON public.appointments
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid()
                    AND role = 'dentist'
                )
            );
            
        RAISE NOTICE 'Tabla appointments creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla appointments ya existe';
    END IF;
END $$;

-- 3. VERIFICAR QUE TODAS LAS TABLAS SE CREARON CORRECTAMENTE
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

-- 4. VERIFICAR POLÍTICAS RLS
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

-- 5. INSERTAR DATOS DE PRUEBA (OPCIONAL)
DO $$
BEGIN
    -- Solo insertar si no hay datos
    IF NOT EXISTS (SELECT 1 FROM public.patient_recommendations LIMIT 1) THEN
        RAISE NOTICE 'Insertando datos de prueba...';
        
        -- Insertar recomendaciones de prueba
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
        LIMIT 1;
        
        -- Insertar historial médico de prueba
        INSERT INTO public.medical_history (patient_id, consultation_date, diagnosis, treatment, notes)
        SELECT 
            p.id,
            NOW() - INTERVAL '30 days',
            'Revisión general',
            'Limpieza dental',
            'Paciente en buen estado general'
        FROM public.patients p
        LIMIT 1;
        
        RAISE NOTICE 'Datos de prueba insertados exitosamente';
    ELSE
        RAISE NOTICE 'Ya existen datos, no se insertan datos de prueba';
    END IF;
END $$;

-- =====================================================
-- VERIFICACIÓN COMPLETADA
-- =====================================================
