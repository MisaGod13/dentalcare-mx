-- =====================================================
-- SISTEMA DE CUENTAS DE PACIENTES
-- =====================================================

-- 1. EXTENDER LA TABLA PROFILES PARA PACIENTES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- 2. TABLA DE SOLICITUDES DE CUENTA DE PACIENTE
CREATE TABLE IF NOT EXISTS public.patient_account_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    dentist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    approval_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE NOTIFICACIONES PARA PACIENTES
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

-- 4. TABLA DE DIAGNÓSTICOS (EXTENDIDA PARA PACIENTES)
CREATE TABLE IF NOT EXISTS public.patient_diagnoses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    diagnosis_type TEXT NOT NULL CHECK (diagnosis_type IN ('preliminar', 'definitivo', 'diferencial')),
    diagnosis_text TEXT NOT NULL,
    icd10_code TEXT, -- Código de clasificación internacional
    severity_level TEXT CHECK (severity_level IN ('leve', 'moderado', 'grave', 'crítico')),
    is_visible_to_patient BOOLEAN DEFAULT TRUE,
    dentist_notes TEXT, -- Notas privadas del dentista
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE RECOMENDACIONES PERSONALIZADAS
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

-- 6. TABLA DE INTERACCIONES CON ASISTENTE VIRTUAL
CREATE TABLE IF NOT EXISTS public.ai_assistant_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    context_data JSONB, -- Datos del contexto del paciente
    response_quality_rating INTEGER CHECK (response_quality_rating >= 1 AND response_quality_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA DE PERMISOS DE PACIENTE
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

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

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

-- =====================================================
-- FUNCIONES RPC PARA EL SISTEMA DE PACIENTES
-- =====================================================

-- Función para crear cuenta de paciente
CREATE OR REPLACE FUNCTION create_patient_account(
    patient_uuid UUID,
    email_address TEXT,
    password_hash TEXT
)
RETURNS JSONB AS $$
DECLARE
    new_user_id UUID;
    result JSONB;
BEGIN
    -- Verificar que el paciente existe y pertenece al dentista
    IF NOT EXISTS (
        SELECT 1 FROM public.patients 
        WHERE id = patient_uuid 
        AND dentist_id = auth.uid()
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Paciente no encontrado o no autorizado'
        );
    END IF;

    -- Crear usuario en auth.users (esto se hace desde el cliente)
    -- Aquí solo creamos el perfil
    INSERT INTO public.profiles (id, role, patient_id, full_name)
    SELECT new_user_id, 'patient', patient_uuid, name
    FROM public.patients
    WHERE id = patient_uuid;

    -- Crear permisos por defecto
    INSERT INTO public.patient_permissions (patient_id, permission_type, granted_by)
    VALUES 
        (patient_uuid, 'view_medical_history', auth.uid()),
        (patient_uuid, 'view_diagnoses', auth.uid()),
        (patient_uuid, 'schedule_appointments', auth.uid()),
        (patient_uuid, 'view_consultations', auth.uid()),
        (patient_uuid, 'chat_with_ai', auth.uid());

    -- Marcar solicitud como aprobada
    UPDATE public.patient_account_requests 
    SET status = 'approved', approval_date = NOW()
    WHERE patient_id = patient_uuid AND status = 'pending';

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Cuenta de paciente creada exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener historial médico del paciente (según normas mexicanas)
CREATE OR REPLACE FUNCTION get_patient_medical_history_for_patient(patient_uuid UUID)
RETURNS TABLE (
    consultation_date DATE,
    consultation_type TEXT,
    symptoms TEXT,
    examination_findings TEXT,
    diagnosis TEXT,
    treatment_performed TEXT,
    prescriptions TEXT,
    recommendations TEXT,
    next_appointment DATE,
    doctor_notes TEXT
) AS $$
BEGIN
    -- Verificar que el usuario es el paciente o su dentista
    IF NOT EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = patient_uuid 
        AND (p.dentist_id = auth.uid() OR p.id IN (
            SELECT patient_id FROM public.profiles WHERE id = auth.uid()
        ))
    ) THEN
        RAISE EXCEPTION 'No autorizado para ver este historial';
    END IF;

    RETURN QUERY
    SELECT 
        c.consultation_date,
        c.consultation_type,
        c.symptoms,
        c.examination_findings,
        c.diagnosis,
        c.treatment_performed,
        c.prescriptions,
        c.recommendations,
        c.next_appointment,
        CASE 
            WHEN p.dentist_id = auth.uid() THEN c.doctor_notes
            ELSE NULL -- Los pacientes no ven notas privadas del doctor
        END as doctor_notes
    FROM public.consultations c
    JOIN public.patients p ON c.patient_id = p.id
    WHERE c.patient_id = patient_uuid
    ORDER BY c.consultation_date DESC, c.consultation_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener diagnósticos visibles para el paciente
CREATE OR REPLACE FUNCTION get_patient_diagnoses_for_patient(patient_uuid UUID)
RETURNS TABLE (
    diagnosis_date DATE,
    diagnosis_type TEXT,
    diagnosis_text TEXT,
    severity_level TEXT,
    consultation_type TEXT
) AS $$
BEGIN
    -- Verificar permisos
    IF NOT EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = patient_uuid 
        AND (p.dentist_id = auth.uid() OR p.id IN (
            SELECT patient_id FROM public.profiles WHERE id = auth.uid()
        ))
    ) THEN
        RAISE EXCEPTION 'No autorizado para ver estos diagnósticos';
    END IF;

    RETURN QUERY
    SELECT 
        pd.created_at::DATE as diagnosis_date,
        pd.diagnosis_type,
        pd.diagnosis_text,
        pd.severity_level,
        COALESCE(c.consultation_type, 'General') as consultation_type
    FROM public.patient_diagnoses pd
    LEFT JOIN public.consultations c ON pd.consultation_id = c.id
    WHERE pd.patient_id = patient_uuid
    AND pd.is_visible_to_patient = TRUE
    ORDER BY pd.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener recomendaciones personalizadas
CREATE OR REPLACE FUNCTION get_patient_recommendations(patient_uuid UUID)
RETURNS TABLE (
    recommendation_type TEXT,
    title TEXT,
    description TEXT,
    priority TEXT,
    valid_until DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.recommendation_type,
        pr.title,
        pr.description,
        pr.priority,
        pr.valid_until
    FROM public.patient_recommendations pr
    WHERE pr.patient_id = patient_uuid
    AND pr.is_active = TRUE
    AND (pr.valid_until IS NULL OR pr.valid_until >= CURRENT_DATE)
    ORDER BY 
        CASE pr.priority
            WHEN 'urgente' THEN 1
            WHEN 'alta' THEN 2
            WHEN 'normal' THEN 3
            WHEN 'baja' THEN 4
        END,
        pr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para el asistente virtual personalizado
CREATE OR REPLACE FUNCTION get_ai_assistant_context(patient_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    context_data JSONB;
BEGIN
    -- Obtener contexto del paciente para el asistente virtual
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

-- Función para registrar interacción con asistente virtual
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

-- =====================================================
-- TRIGGERS Y FUNCIONES AUTOMÁTICAS
-- =====================================================

-- Trigger para actualizar updated_at en diagnósticos
CREATE OR REPLACE FUNCTION update_patient_diagnoses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patient_diagnoses_updated_at
    BEFORE UPDATE ON public.patient_diagnoses
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_diagnoses_updated_at();

-- Función para crear notificaciones automáticas
CREATE OR REPLACE FUNCTION create_patient_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Notificar cuando se crea un nuevo diagnóstico
    IF TG_TABLE_NAME = 'patient_diagnoses' THEN
        INSERT INTO public.patient_notifications (
            patient_id, notification_type, title, message
        ) VALUES (
            NEW.patient_id,
            'diagnosis_update',
            'Nuevo diagnóstico disponible',
            'Se ha registrado un nuevo diagnóstico en tu historial médico.'
        );
    END IF;

    -- Notificar cuando se programa una consulta
    IF TG_TABLE_NAME = 'consultations' AND NEW.status = 'scheduled' THEN
        INSERT INTO public.patient_notifications (
            patient_id, notification_type, title, message
        ) VALUES (
            NEW.patient_id,
            'consultation_scheduled',
            'Nueva consulta programada',
            'Se ha programado una nueva consulta para el ' || NEW.consultation_date || '.'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para notificaciones automáticas
CREATE TRIGGER trigger_patient_diagnosis_notification
    AFTER INSERT ON public.patient_diagnoses
    FOR EACH ROW
    EXECUTE FUNCTION create_patient_notification();

CREATE TRIGGER trigger_consultation_notification
    AFTER INSERT OR UPDATE ON public.consultations
    FOR EACH ROW
    EXECUTE FUNCTION create_patient_notification();

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.patient_account_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assistant_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas para patient_account_requests
CREATE POLICY "Dentists can manage patient account requests" ON public.patient_account_requests
    FOR ALL USING (dentist_id = auth.uid());

-- Políticas para patient_notifications
CREATE POLICY "Patients can view their own notifications" ON public.patient_notifications
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Dentists can view patient notifications" ON public.patient_notifications
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE dentist_id = auth.uid()
        )
    );

-- Políticas para patient_diagnoses
CREATE POLICY "Patients can view their own visible diagnoses" ON public.patient_diagnoses
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM public.profiles WHERE id = auth.uid()
        )
        AND is_visible_to_patient = TRUE
    );

CREATE POLICY "Dentists can manage patient diagnoses" ON public.patient_diagnoses
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE dentist_id = auth.uid()
        )
    );

-- Políticas para patient_recommendations
CREATE POLICY "Patients can view their own recommendations" ON public.patient_recommendations
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Dentists can manage patient recommendations" ON public.patient_recommendations
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE dentist_id = auth.uid()
        )
    );

-- Políticas para ai_assistant_interactions
CREATE POLICY "Patients can view their own AI interactions" ON public.ai_assistant_interactions
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Dentists can view patient AI interactions" ON public.ai_assistant_interactions
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE dentist_id = auth.uid()
        )
    );

-- Políticas para patient_permissions
CREATE POLICY "Patients can view their own permissions" ON public.patient_permissions
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Dentists can manage patient permissions" ON public.patient_permissions
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM public.patients WHERE dentist_id = auth.uid()
        )
    );

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE public.patient_account_requests IS 'Solicitudes de creación de cuentas para pacientes';
COMMENT ON TABLE public.patient_notifications IS 'Notificaciones del sistema para pacientes';
COMMENT ON TABLE public.patient_diagnoses IS 'Diagnósticos médicos de pacientes con control de visibilidad';
COMMENT ON TABLE public.patient_recommendations IS 'Recomendaciones personalizadas para pacientes';
COMMENT ON TABLE public.ai_assistant_interactions IS 'Registro de interacciones con el asistente virtual';
COMMENT ON TABLE public.patient_permissions IS 'Sistema de permisos granulares para pacientes';

COMMENT ON FUNCTION create_patient_account IS 'Crea una cuenta de paciente con permisos por defecto';
COMMENT ON FUNCTION get_patient_medical_history_for_patient IS 'Obtiene historial médico según normas mexicanas';
COMMENT ON FUNCTION get_patient_diagnoses_for_patient IS 'Obtiene diagnósticos visibles para el paciente';
COMMENT ON FUNCTION get_patient_recommendations IS 'Obtiene recomendaciones personalizadas activas';
COMMENT ON FUNCTION get_ai_assistant_context IS 'Obtiene contexto del paciente para el asistente virtual';
COMMENT ON FUNCTION record_ai_interaction IS 'Registra interacción con el asistente virtual';

