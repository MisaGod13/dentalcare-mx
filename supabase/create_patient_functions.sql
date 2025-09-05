-- =====================================================
-- FUNCIONES RPC PARA EL DASHBOARD DE PACIENTES
-- =====================================================
-- Ejecutar este archivo en Supabase SQL Editor para crear las funciones necesarias

-- 1. FUNCIÓN PARA OBTENER HISTORIAL MÉDICO DEL PACIENTE
CREATE OR REPLACE FUNCTION get_patient_medical_history_for_patient(patient_uuid UUID)
RETURNS TABLE (
    id UUID,
    consultation_date TIMESTAMPTZ,
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que el usuario autenticado sea el paciente
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'patient' 
        AND patient_id = patient_uuid
    ) THEN
        RAISE EXCEPTION 'Acceso denegado';
    END IF;

    RETURN QUERY
    SELECT 
        mh.id,
        mh.consultation_date,
        mh.diagnosis,
        mh.treatment,
        mh.notes,
        mh.created_at
    FROM public.medical_history mh
    WHERE mh.patient_id = patient_uuid
    ORDER BY mh.consultation_date DESC;
END;
$$;

-- 2. FUNCIÓN PARA OBTENER DIAGNÓSTICOS DEL PACIENTE
CREATE OR REPLACE FUNCTION get_patient_diagnoses_for_patient(patient_uuid UUID)
RETURNS TABLE (
    id UUID,
    condition_name TEXT,
    description TEXT,
    severity TEXT,
    diagnosis_date TIMESTAMPTZ,
    treatment_plan TEXT,
    created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que el usuario autenticado sea el paciente
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'patient' 
        AND patient_id = patient_uuid
    ) THEN
        RAISE EXCEPTION 'Acceso denegado';
    END IF;

    RETURN QUERY
    SELECT 
        pd.id,
        pd.condition_name,
        pd.description,
        pd.severity,
        pd.diagnosis_date,
        pd.treatment_plan,
        pd.created_at
    FROM public.patient_diagnoses pd
    WHERE pd.patient_id = patient_uuid
    ORDER BY pd.diagnosis_date DESC;
END;
$$;

-- 3. FUNCIÓN PARA OBTENER RECOMENDACIONES DEL PACIENTE
CREATE OR REPLACE FUNCTION get_patient_recommendations(patient_uuid UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    type TEXT,
    priority TEXT,
    status TEXT,
    instructions TEXT,
    created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que el usuario autenticado sea el paciente
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'patient' 
        AND patient_id = patient_uuid
    ) THEN
        RAISE EXCEPTION 'Acceso denegado';
    END IF;

    RETURN QUERY
    SELECT 
        pr.id,
        pr.title,
        pr.description,
        pr.type,
        pr.priority,
        pr.status,
        pr.instructions,
        pr.created_at
    FROM public.patient_recommendations pr
    WHERE pr.patient_id = patient_uuid
    AND pr.status = 'active'
    ORDER BY pr.created_at DESC;
END;
$$;

-- 4. FUNCIÓN PARA OBTENER NOTIFICACIONES DEL PACIENTE
CREATE OR REPLACE FUNCTION get_patient_notifications(patient_uuid UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    message TEXT,
    notification_type TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que el usuario autenticado sea el paciente
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'patient' 
        AND patient_id = patient_uuid
    ) THEN
        RAISE EXCEPTION 'Acceso denegado';
    END IF;

    RETURN QUERY
    SELECT 
        pn.id,
        pn.title,
        pn.message,
        pn.notification_type,
        pn.is_read,
        pn.created_at
    FROM public.patient_notifications pn
    WHERE pn.patient_id = patient_uuid
    ORDER BY pn.created_at DESC;
END;
$$;

-- 5. FUNCIÓN PARA OBTENER CITAS DEL PACIENTE
CREATE OR REPLACE FUNCTION get_patient_appointments(patient_uuid UUID)
RETURNS TABLE (
    id UUID,
    appointment_date TIMESTAMPTZ,
    status TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que el usuario autenticado sea el paciente
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'patient' 
        AND patient_id = patient_uuid
    ) THEN
        RAISE EXCEPTION 'Acceso denegado';
    END IF;

    RETURN QUERY
    SELECT 
        a.id,
        a.appointment_date,
        a.status,
        a.notes,
        a.created_at
    FROM public.appointments a
    WHERE a.patient_id = patient_uuid
    AND a.appointment_date >= NOW()
    ORDER BY a.appointment_date ASC;
END;
$$;

-- 6. FUNCIÓN PARA OBTENER ESTADÍSTICAS DEL PACIENTE
CREATE OR REPLACE FUNCTION get_patient_stats(patient_uuid UUID)
RETURNS TABLE (
    total_consultations BIGINT,
    pending_appointments BIGINT,
    unread_notifications BIGINT,
    active_recommendations BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que el usuario autenticado sea el paciente
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'patient' 
        AND patient_id = patient_uuid
    ) THEN
        RAISE EXCEPTION 'Acceso denegado';
    END IF;

    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.medical_history WHERE patient_id = patient_uuid) as total_consultations,
        (SELECT COUNT(*) FROM public.appointments WHERE patient_id = patient_uuid AND status = 'pending' AND appointment_date >= NOW()) as pending_appointments,
        (SELECT COUNT(*) FROM public.patient_notifications WHERE patient_id = patient_uuid AND is_read = false) as unread_notifications,
        (SELECT COUNT(*) FROM public.patient_recommendations WHERE patient_id = patient_uuid AND status = 'active') as active_recommendations;
END;
$$;

-- =====================================================
-- VERIFICAR QUE LAS FUNCIONES SE CREARON CORRECTAMENTE
-- =====================================================

-- Listar todas las funciones creadas
SELECT 
    'FUNCIONES CREADAS' as info,
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname IN (
    'get_patient_medical_history_for_patient',
    'get_patient_diagnoses_for_patient',
    'get_patient_recommendations',
    'get_patient_notifications',
    'get_patient_appointments',
    'get_patient_stats'
)
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- =====================================================
-- FUNCIONES RPC PARA PACIENTES CREADAS EXITOSAMENTE
-- =====================================================
