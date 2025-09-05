-- =====================================================
-- INSERTAR DATOS DE PRUEBA PARA PACIENTES
-- =====================================================
-- Ejecutar este archivo en Supabase SQL Editor después de crear las tablas

-- 1. VERIFICAR QUE EXISTEN LAS TABLAS
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medical_history') THEN
        RAISE EXCEPTION 'La tabla medical_history no existe. Ejecuta primero fix_tables_final.sql';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patient_recommendations') THEN
        RAISE EXCEPTION 'La tabla patient_recommendations no existe. Ejecuta primero fix_tables_final.sql';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patient_diagnoses') THEN
        RAISE EXCEPTION 'La tabla patient_diagnoses no existe. Ejecuta primero fix_tables_final.sql';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patient_notifications') THEN
        RAISE EXCEPTION 'La tabla patient_notifications no existe. Ejecuta primero fix_tables_final.sql';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN
        RAISE EXCEPTION 'La tabla appointments no existe. Ejecuta primero fix_tables_final.sql';
    END IF;
    
    RAISE NOTICE 'Todas las tablas existen. Procediendo a insertar datos de prueba...';
END $$;

-- 2. OBTENER UN PACIENTE EXISTENTE PARA INSERTAR DATOS
DO $$
DECLARE
    patient_uuid UUID;
    profile_uuid UUID;
BEGIN
    -- Obtener el primer paciente disponible
    SELECT id INTO patient_uuid FROM public.patients LIMIT 1;
    
    IF patient_uuid IS NULL THEN
        RAISE NOTICE 'No hay pacientes en la tabla. Crea un paciente primero.';
        RETURN;
    END IF;
    
    -- Obtener el perfil del paciente
    SELECT id INTO profile_uuid FROM public.profiles WHERE patient_id = patient_uuid LIMIT 1;
    
    IF profile_uuid IS NULL THEN
        RAISE NOTICE 'No hay perfil para el paciente. Crea un perfil primero.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Insertando datos de prueba para el paciente: %', patient_uuid;
    
    -- 3. INSERTAR HISTORIAL MÉDICO DE PRUEBA
    INSERT INTO public.medical_history (patient_id, consultation_date, diagnosis, treatment, notes)
    VALUES 
        (patient_uuid, NOW() - INTERVAL '30 days', 'Revisión general dental', 'Limpieza dental profesional', 'Paciente en buen estado general, se recomienda mantener buena higiene'),
        (patient_uuid, NOW() - INTERVAL '60 days', 'Caries en molar inferior', 'Empaste dental', 'Se detectó caries pequeña, se realizó empaste exitosamente'),
        (patient_uuid, NOW() - INTERVAL '90 days', 'Dolor en muela del juicio', 'Extracción de muela del juicio', 'Muela impactada causando dolor, extracción exitosa')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Historial médico insertado';
    
    -- 4. INSERTAR DIAGNÓSTICOS DE PRUEBA
    INSERT INTO public.patient_diagnoses (patient_id, condition_name, description, severity, diagnosis_date, treatment_plan)
    VALUES 
        (patient_uuid, 'Caries dental', 'Caries pequeña en molar inferior derecho', 'moderate', NOW() - INTERVAL '60 days', 'Empaste dental y revisión en 6 meses'),
        (patient_uuid, 'Muela del juicio impactada', 'Muela del juicio inferior izquierda impactada', 'high', NOW() - INTERVAL '90 days', 'Extracción quirúrgica y antibióticos'),
        (patient_uuid, 'Gingivitis leve', 'Inflamación leve de encías', 'low', NOW() - INTERVAL '30 days', 'Mejorar técnica de cepillado y uso de hilo dental')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Diagnósticos insertados';
    
    -- 5. INSERTAR RECOMENDACIONES DE PRUEBA
    INSERT INTO public.patient_recommendations (patient_id, title, description, type, priority, status, instructions)
    VALUES 
        (patient_uuid, 'Mantener buena higiene dental', 'Cepillarse los dientes al menos 2 veces al día', 'hygiene', 'high', 'active', 'Usar cepillo suave y pasta dental con flúor. Cepillar durante 2 minutos'),
        (patient_uuid, 'Usar hilo dental diariamente', 'El hilo dental es esencial para prevenir caries interdentales', 'hygiene', 'medium', 'active', 'Usar hilo dental al menos una vez al día, preferiblemente antes de dormir'),
        (patient_uuid, 'Visitar al dentista regularmente', 'Revisiones cada 6 meses para mantener salud dental', 'prevention', 'high', 'active', 'Programar cita de revisión cada 6 meses'),
        (patient_uuid, 'Evitar alimentos azucarados', 'Reducir consumo de azúcares para prevenir caries', 'diet', 'medium', 'active', 'Limitar dulces y bebidas azucaradas. Cepillar después de consumirlos')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Recomendaciones insertadas';
    
    -- 6. INSERTAR NOTIFICACIONES DE PRUEBA
    INSERT INTO public.patient_notifications (patient_id, title, message, notification_type, is_read)
    VALUES 
        (patient_uuid, 'Recordatorio de cita', 'Tienes una cita programada para mañana a las 10:00 AM', 'appointment', false),
        (patient_uuid, 'Nuevo diagnóstico disponible', 'Tu dentista ha agregado un nuevo diagnóstico a tu historial', 'medical', false),
        (patient_uuid, 'Recomendación actualizada', 'Se ha actualizado una de tus recomendaciones de salud', 'health', true),
        (patient_uuid, 'Bienvenida al sistema', '¡Bienvenido a tu panel de control de salud dental!', 'system', true)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Notificaciones insertadas';
    
    -- 7. INSERTAR CITAS DE PRUEBA
    INSERT INTO public.appointments (patient_id, appointment_date, status, notes)
    VALUES 
        (patient_uuid, NOW() + INTERVAL '7 days', 'confirmed', 'Revisión de rutina y limpieza dental'),
        (patient_uuid, NOW() + INTERVAL '30 days', 'pending', 'Seguimiento del tratamiento de caries'),
        (patient_uuid, NOW() - INTERVAL '15 days', 'completed', 'Consulta de emergencia por dolor dental'),
        (patient_uuid, NOW() + INTERVAL '90 days', 'pending', 'Revisión general y plan de tratamiento')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Citas insertadas';
    
    RAISE NOTICE '¡Datos de prueba insertados exitosamente para el paciente: %!', patient_uuid;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error al insertar datos de prueba: %', SQLERRM;
END $$;

-- 8. VERIFICAR DATOS INSERTADOS
SELECT 
    'VERIFICACIÓN DE DATOS' as info,
    'medical_history' as tabla,
    COUNT(*) as registros
FROM public.medical_history
UNION ALL
SELECT 
    'VERIFICACIÓN DE DATOS' as info,
    'patient_diagnoses' as tabla,
    COUNT(*) as registros
FROM public.patient_diagnoses
UNION ALL
SELECT 
    'VERIFICACIÓN DE DATOS' as info,
    'patient_recommendations' as tabla,
    COUNT(*) as registros
FROM public.patient_recommendations
UNION ALL
SELECT 
    'VERIFICACIÓN DE DATOS' as info,
    'patient_notifications' as tabla,
    COUNT(*) as registros
FROM public.patient_notifications
UNION ALL
SELECT 
    'VERIFICACIÓN DE DATOS' as info,
    'appointments' as tabla,
    COUNT(*) as registros
FROM public.appointments
ORDER BY tabla;

-- 9. MOSTRAR EJEMPLO DE DATOS INSERTADOS
SELECT 
    'EJEMPLO HISTORIAL MÉDICO' as tipo,
    diagnosis,
    treatment,
    consultation_date
FROM public.medical_history
LIMIT 3;

SELECT 
    'EJEMPLO RECOMENDACIONES' as tipo,
    title,
    description,
    priority
FROM public.patient_recommendations
LIMIT 3;

SELECT 
    'EJEMPLO CITAS' as tipo,
    appointment_date,
    status,
    notes
FROM public.appointments
LIMIT 3;

-- =====================================================
-- DATOS DE PRUEBA INSERTADOS
-- =====================================================
-- Ahora el dashboard del paciente debería mostrar información real
-- en lugar de mensajes de "funciones no configuradas"
