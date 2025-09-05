-- =====================================================
-- ACTUALIZACIÓN DEL SISTEMA DE CUENTAS DE PACIENTES
-- =====================================================
-- Ejecutar este archivo en Supabase SQL Editor para actualizar el sistema

-- 1. EXTENDER LA TABLA PROFILES (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'patient_id') THEN
        ALTER TABLE public.profiles ADD COLUMN patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_login') THEN
        ALTER TABLE public.profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. CREAR TABLA DE SOLICITUDES DE CUENTA (si no existe)
CREATE TABLE IF NOT EXISTS public.patient_account_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    dentist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    approval_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    credentials_generated BOOLEAN DEFAULT FALSE,
    temp_password TEXT,
    auth_user_id UUID REFERENCES auth.users(id)
);

-- 3. CREAR TABLA DE PERMISOS DE PACIENTE (si no existe)
CREATE TABLE IF NOT EXISTS public.patient_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    permission_type TEXT NOT NULL CHECK (permission_type IN ('view_medical_history', 'view_diagnoses', 'schedule_appointments', 'view_consultations', 'chat_with_ai')),
    is_granted BOOLEAN DEFAULT TRUE,
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREAR TABLA DE NOTIFICACIONES PARA PACIENTES (si no existe)
CREATE TABLE IF NOT EXISTS public.patient_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('appointment_reminder', 'diagnosis_update', 'consultation_scheduled', 'general')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREAR TABLA DE DIAGNÓSTICOS (si no existe)
CREATE TABLE IF NOT EXISTS public.patient_diagnoses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    diagnosis_type TEXT NOT NULL CHECK (diagnosis_type IN ('preliminar', 'definitivo', 'diferencial')),
    diagnosis_text TEXT NOT NULL,
    icd10_code TEXT,
    severity_level TEXT CHECK (severity_level IN ('leve', 'moderado', 'grave', 'crítico')),
    is_visible_to_patient BOOLEAN DEFAULT TRUE,
    dentist_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREAR TABLA DE RECOMENDACIONES PERSONALIZADAS (si no existe)
CREATE TABLE IF NOT EXISTS public.patient_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('higiene', 'dieta', 'estilo_vida', 'seguimiento', 'emergencia')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('baja', 'normal', 'alta', 'urgente')),
    is_active BOOLEAN DEFAULT TRUE,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREAR TABLA DE INTERACCIONES CON ASISTENTE VIRTUAL (si no existe)
CREATE TABLE IF NOT EXISTS public.ai_assistant_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    context_data JSONB,
    response_quality_rating INTEGER CHECK (response_quality_rating >= 1 AND response_quality_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_patient_account_requests_patient_id ON public.patient_account_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_account_requests_status ON public.patient_account_requests(status);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_patient_id ON public.patient_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_is_read ON public.patient_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_patient_diagnoses_patient_id ON public.patient_diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_diagnoses_type ON public.patient_diagnoses(diagnosis_type);
CREATE INDEX IF NOT EXISTS idx_patient_recommendations_patient_id ON public.patient_recommendations(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_recommendations_type ON public.patient_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_interactions_patient_id ON public.ai_assistant_interactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_interactions_session_id ON public.ai_assistant_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_patient_permissions_patient_id ON public.patient_permissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_permissions_type ON public.patient_permissions(permission_type);

-- 9. HABILITAR RLS EN LAS NUEVAS TABLAS
ALTER TABLE public.patient_account_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assistant_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_permissions ENABLE ROW LEVEL SECURITY;

-- 10. CREAR POLÍTICAS RLS
-- Políticas para patient_account_requests
DROP POLICY IF EXISTS "Dentists can manage patient account requests" ON public.patient_account_requests;
CREATE POLICY "Dentists can manage patient account requests" ON public.patient_account_requests
    FOR ALL USING (dentist_id = auth.uid());

-- Políticas para patient_notifications
DROP POLICY IF EXISTS "Patients can view their own notifications" ON public.patient_notifications;
CREATE POLICY "Patients can view their own notifications" ON public.patient_notifications
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM public.profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Dentists can view patient notifications" ON public.patient_notifications;
CREATE POLICY "Dentists can view patient notifications" ON public.patient_notifications
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE dentist_id = auth.uid()
        )
    );

-- Políticas para patient_diagnoses
DROP POLICY IF EXISTS "Patients can view their own visible diagnoses" ON public.patient_diagnoses;
CREATE POLICY "Patients can view their own visible diagnoses" ON public.patient_diagnoses
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM public.profiles WHERE id = auth.uid()
        )
        AND is_visible_to_patient = TRUE
    );

DROP POLICY IF EXISTS "Dentists can manage patient diagnoses" ON public.patient_diagnoses;
CREATE POLICY "Dentists can manage patient diagnoses" ON public.patient_diagnoses
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE dentist_id = auth.uid()
        )
    );

-- Políticas para patient_recommendations
DROP POLICY IF EXISTS "Patients can view their own recommendations" ON public.patient_recommendations;
CREATE POLICY "Patients can view their own recommendations" ON public.patient_recommendations
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM public.profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Dentists can manage patient recommendations" ON public.patient_recommendations;
CREATE POLICY "Dentists can manage patient recommendations" ON public.patient_recommendations
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE dentist_id = auth.uid()
        )
    );

-- Políticas para ai_assistant_interactions
DROP POLICY IF EXISTS "Patients can view their own AI interactions" ON public.ai_assistant_interactions;
CREATE POLICY "Patients can view their own AI interactions" ON public.ai_assistant_interactions
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM public.profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Dentists can view patient AI interactions" ON public.ai_assistant_interactions;
CREATE POLICY "Dentists can view patient AI interactions" ON public.ai_assistant_interactions
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE dentist_id = auth.uid()
        )
    );

-- Políticas para patient_permissions
DROP POLICY IF EXISTS "Patients can view their own permissions" ON public.patient_permissions;
CREATE POLICY "Patients can view their own permissions" ON public.patient_permissions
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM public.profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Dentists can manage patient permissions" ON public.patient_permissions;
CREATE POLICY "Dentists can manage patient permissions" ON public.patient_permissions
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE dentist_id = auth.uid()
        )
    );

-- 11. CREAR FUNCIÓN PARA OBTENER CONTEXTO DEL ASISTENTE VIRTUAL
CREATE OR REPLACE FUNCTION get_ai_assistant_context(patient_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    context_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'patient_info', jsonb_build_object(
            'name', p.name,
            'age', p.age,
            'allergies', p.allergies,
            'allergy_details', p.allergy_details,
            'current_treatment', p.current_treatment,
            'current_treatment_details', p.current_treatment_details
        ),
        'recent_consultations', (
            SELECT jsonb_agg(jsonb_build_object(
                'date', c.consultation_date,
                'type', c.consultation_type,
                'diagnosis', c.diagnosis,
                'treatment', c.treatment_performed
            ))
            FROM public.consultations c
            WHERE c.patient_id = p.id
            ORDER BY c.consultation_date DESC
            LIMIT 5
        ),
        'active_diagnoses', (
            SELECT jsonb_agg(jsonb_build_object(
                'type', pd.diagnosis_type,
                'text', pd.diagnosis_text,
                'severity', pd.severity_level
            ))
            FROM public.patient_diagnoses pd
            WHERE pd.patient_id = p.id
            AND pd.is_visible_to_patient = TRUE
        ),
        'recommendations', (
            SELECT jsonb_agg(jsonb_build_object(
                'type', pr.recommendation_type,
                'title', pr.title,
                'description', pr.description,
                'priority', pr.priority
            ))
            FROM public.patient_recommendations pr
            WHERE pr.patient_id = p.id
            AND pr.is_active = TRUE
        )
    ) INTO context_data
    FROM public.patients p
    WHERE p.id = patient_uuid;

    RETURN context_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. CREAR FUNCIÓN PARA REGISTRAR INTERACCIONES CON IA
CREATE OR REPLACE FUNCTION record_ai_interaction(
    patient_uuid UUID,
    session_uuid UUID,
    user_message TEXT,
    ai_response TEXT,
    context_data JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
    INSERT INTO public.ai_assistant_interactions (
        patient_id, session_id, user_message, ai_response, context_data
    ) VALUES (
        patient_uuid, session_uuid, user_message, ai_response, context_data
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Interacción registrada'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. CREAR TRIGGER PARA ACTUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_patient_diagnoses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_patient_diagnoses_updated_at ON public.patient_diagnoses;
CREATE TRIGGER update_patient_diagnoses_updated_at
    BEFORE UPDATE ON public.patient_diagnoses
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_diagnoses_updated_at();

-- 14. VERIFICAR QUE TODO SE CREÓ CORRECTAMENTE
SELECT 
    'Tablas creadas:' as info,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'patient_account_requests',
    'patient_notifications', 
    'patient_diagnoses',
    'patient_recommendations',
    'ai_assistant_interactions',
    'patient_permissions'
);

SELECT 
    'Políticas RLS:' as info,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
    'patient_account_requests',
    'patient_notifications',
    'patient_diagnoses', 
    'patient_recommendations',
    'ai_assistant_interactions',
    'patient_permissions'
);

SELECT 
    'Funciones creadas:' as info,
    COUNT(*) as total_functions
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('get_ai_assistant_context', 'record_ai_interaction', 'update_patient_diagnoses_updated_at');

-- =====================================================
-- SISTEMA ACTUALIZADO EXITOSAMENTE
-- =====================================================
-- Ahora puedes usar el PatientAccountManager para crear cuentas de pacientes
-- Los usuarios se crearán automáticamente en Supabase Auth con rol de paciente
