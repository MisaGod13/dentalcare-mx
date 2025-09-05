create_dentist_profile
DECLARE
  user_id UUID;
  result JSON;
BEGIN
  -- Buscar el usuario por email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado con ese email';
  END IF;
  
  -- Verificar si ya existe un perfil
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    RAISE EXCEPTION 'Ya existe un perfil para este usuario';
  END IF;
  
  -- Crear el perfil
  INSERT INTO profiles (id, full_name, role, created_at)
  VALUES (user_id, full_name, 'dentist', NOW());
  
  result := jsonb_build_object(
    'success', true,
    'user_id', user_id,
    'message', 'Perfil de dentista creado exitosamente'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Error al crear perfil'
    );
    
    RETURN result;
END;

create_patient_account
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


create_patient_notification

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


create_patient_profile

DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Verificar que el dentista existe y tiene permisos
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = dentist_id AND role = 'dentist' AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Dentista no autorizado';
  END IF;

  -- Verificar que el paciente existe
  IF NOT EXISTS (
    SELECT 1 FROM patients 
    WHERE id = patient_id
  ) THEN
    RAISE EXCEPTION 'Paciente no encontrado';
  END IF;

  -- Generar un UUID para el usuario
  new_user_id := gen_random_uuid();

  -- Crear el perfil en la tabla profiles
  INSERT INTO profiles (
    id,
    role,
    patient_id,
    is_active,
    is_first_login,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'patient',
    patient_id,
    true,
    true,
    now(),
    now()
  );

  -- Retornar información del perfil creado
  result := jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', patient_email,
    'message', 'Perfil de paciente creado exitosamente'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Error al crear perfil de paciente'
    );
    
    RETURN result;
END;


create_patient_profile_only

DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Verificar que el dentista existe y tiene permisos
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = dentist_id AND role = 'dentist'
  ) THEN
    RAISE EXCEPTION 'Dentista no autorizado';
  END IF;

  -- Verificar que el paciente existe
  IF NOT EXISTS (
    SELECT 1 FROM patients 
    WHERE id = patient_id
  ) THEN
    RAISE EXCEPTION 'Paciente no encontrado';
  END IF;

  -- Generar un UUID para el usuario
  new_user_id := gen_random_uuid();

  -- Crear el perfil en la tabla profiles
  INSERT INTO profiles (
    id,
    role,
    patient_id,
    created_at
  ) VALUES (
    new_user_id,
    'patient',
    patient_id,
    now()
  );

  -- Retornar información del perfil creado
  result := jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', patient_email,
    'message', 'Perfil de paciente creado exitosamente'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Error al crear perfil de paciente'
    );
    
    RETURN result;
END;


create_patient_user

DECLARE
  new_user_id UUID;
  profile_record RECORD;
  result JSON;
BEGIN
  -- Verificar que el dentista existe y tiene permisos
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = dentist_id AND role = 'dentist' AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Dentista no autorizado';
  END IF;

  -- Verificar que el paciente existe
  IF NOT EXISTS (
    SELECT 1 FROM patients 
    WHERE id = patient_id
  ) THEN
    RAISE EXCEPTION 'Paciente no encontrado';
  END IF;

  -- Verificar que no existe ya un usuario con ese email
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = patient_email
  ) THEN
    RAISE EXCEPTION 'Ya existe un usuario con ese email';
  END IF;

  -- Crear el usuario en auth.users (esto requiere permisos de service_role)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    encrypted_password_updated_at
  ) VALUES (
    (SELECT id FROM auth.instances LIMIT 1),
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    patient_email,
    crypt(patient_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    '',
    jsonb_build_object(
      'role', 'patient',
      'patient_id', patient_id,
      'name', patient_name
    ),
    false,
    now()
  ) RETURNING id INTO new_user_id;

  -- Crear o actualizar el perfil en la tabla profiles
  INSERT INTO profiles (
    id,
    role,
    patient_id,
    is_active,
    is_first_login,
    auth_user_id,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'patient',
    patient_id,
    true,
    true,
    new_user_id,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'patient',
    patient_id = EXCLUDED.patient_id,
    is_active = true,
    is_first_login = true,
    auth_user_id = EXCLUDED.auth_user_id,
    updated_at = now();

  -- Retornar información del usuario creado
  result := jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', patient_email,
    'message', 'Usuario de paciente creado exitosamente'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, hacer rollback y retornar error
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Error al crear usuario de paciente'
    );
    
    RETURN result;
END;


create_real_patient_auth

DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Verificar que el paciente existe
  IF NOT EXISTS (
    SELECT 1 FROM patients 
    WHERE id = patient_id
  ) THEN
    RAISE EXCEPTION 'Paciente no encontrado';
  END IF;

  -- Generar un UUID para el usuario
  new_user_id := gen_random_uuid();

  -- Crear el usuario en auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    (SELECT id FROM auth.instances LIMIT 1),
    new_user_id,
    'authenticated',
    'authenticated',
    patient_email,
    crypt(patient_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'role', 'patient',
      'patient_id', patient_id,
      'name', patient_name
    ),
    jsonb_build_object(
      'role', 'patient',
      'patient_id', patient_id,
      'name', patient_name
    )
  );

  -- Crear el perfil en la tabla profiles usando el MISMO UUID
  INSERT INTO profiles (
    id,
    role,
    patient_id,
    created_at
  ) VALUES (
    new_user_id,
    'patient',
    patient_id,
    now()
  );

  -- Retornar información del usuario creado
  result := jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', patient_email,
    'message', 'Usuario de paciente creado exitosamente en Supabase Auth'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Error al crear usuario de paciente'
    );
    
    RETURN result;
END;


create_real_patient_user

DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Verificar que el dentista existe y tiene permisos
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = dentist_id AND role = 'dentist'
  ) THEN
    RAISE EXCEPTION 'Dentista no autorizado';
  END IF;

  -- Verificar que el paciente existe
  IF NOT EXISTS (
    SELECT 1 FROM patients 
    WHERE id = patient_id
  ) THEN
    RAISE EXCEPTION 'Paciente no encontrado';
  END IF;

  -- Generar un UUID para el usuario
  new_user_id := gen_random_uuid();

  -- Crear el usuario en auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    (SELECT id FROM auth.instances LIMIT 1),
    new_user_id,
    'authenticated',
    'authenticated',
    patient_email,
    crypt(patient_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'role', 'patient',
      'patient_id', patient_id,
      'name', patient_name
    ),
    jsonb_build_object(
      'role', 'patient',
      'patient_id', patient_id,
      'name', patient_name
    )
  );

  -- Crear el perfil en la tabla profiles usando el MISMO UUID
  INSERT INTO profiles (
    id,  -- Usar el mismo UUID que auth.users
    role,
    patient_id,
    created_at
  ) VALUES (
    new_user_id,  -- Mismo UUID que se usó en auth.users
    'patient',
    patient_id,
    now()
  );

  -- Retornar información del usuario creado
  result := jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', patient_email,
    'message', 'Usuario de paciente creado exitosamente'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Error al crear usuario de paciente'
    );
    
    RETURN result;
END;


create_simple_patient_profile

DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Verificar que el dentista existe y tiene permisos
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = dentist_id AND role = 'dentist'
  ) THEN
    RAISE EXCEPTION 'Dentista no autorizado';
  END IF;

  -- Verificar que el paciente existe
  IF NOT EXISTS (
    SELECT 1 FROM patients 
    WHERE id = patient_id
  ) THEN
    RAISE EXCEPTION 'Paciente no encontrado';
  END IF;

  -- Generar un UUID para el usuario
  new_user_id := gen_random_uuid();

  -- Crear el perfil en la tabla profiles
  INSERT INTO profiles (
    id,
    role,
    patient_id,
    created_at
  ) VALUES (
    new_user_id,
    'patient',
    patient_id,
    now()
  );

  -- Retornar información del perfil creado
  result := jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', patient_email,
    'message', 'Perfil de paciente creado exitosamente'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Error al crear perfil de paciente'
    );
    
    RETURN result;
END;


get_ai_assistant_context

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


get_all_patients_summary

BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    p.created_at
  FROM public.patients p
  ORDER BY p.created_at DESC
  LIMIT 10;
END;


get_appointment_stats

BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_appointments,
        COUNT(CASE WHEN status = 'completada' THEN 1 END)::BIGINT as completed_appointments,
        COUNT(CASE WHEN status = 'cancelada' THEN 1 END)::BIGINT as cancelled_appointments,
        COUNT(CASE WHEN status = 'no_show' THEN 1 END)::BIGINT as no_show_appointments,
        ROUND(AVG(duration_minutes), 2) as average_duration_minutes
    FROM public.appointments
    WHERE appointment_date BETWEEN start_date AND end_date;
END;


get_availability_for_date

BEGIN
    RETURN QUERY
    WITH time_slots AS (
        SELECT generate_series(
            '09:00'::time, 
            '18:00'::time, 
            '00:30'::interval
        )::time AS slot_time
    ),
    working_hours AS (
        SELECT 
            wh.start_time,
            wh.end_time,
            wh.break_start_time,
            wh.break_end_time
        FROM public.working_hours wh
        WHERE wh.day_of_week = EXTRACT(DOW FROM check_date)
        AND wh.is_working_day = TRUE
        LIMIT 1
    ),
    existing_appointments AS (
        SELECT 
            a.appointment_time,
            a.duration_minutes,
            a.id,
            p.name as patient_name
        FROM public.appointments a
        JOIN public.patients p ON a.patient_id = p.id
        WHERE a.appointment_date = check_date
        AND a.status NOT IN ('cancelada', 'no_show')
    )
    SELECT 
        ts.slot_time,
        CASE 
            WHEN wh.start_time IS NULL THEN FALSE
            WHEN ts.slot_time < wh.start_time OR ts.slot_time >= wh.end_time THEN FALSE
            WHEN wh.break_start_time IS NOT NULL AND 
                 ts.slot_time >= wh.break_start_time AND 
                 ts.slot_time < wh.break_end_time THEN FALSE
            WHEN EXISTS (
                SELECT 1 FROM existing_appointments ea 
                WHERE ts.slot_time >= ea.appointment_time 
                AND ts.slot_time < (ea.appointment_time + (ea.duration_minutes || ' minutes')::interval)
            ) THEN FALSE
            ELSE TRUE
        END as is_available,
        COALESCE(
            (SELECT ea.appointment_id 
             FROM existing_appointments ea 
             WHERE ts.slot_time >= ea.appointment_time 
             AND ts.slot_time < (ea.appointment_time + (ea.duration_minutes || ' minutes')::interval)
             LIMIT 1), 
            NULL
        ) as appointment_id,
        COALESCE(
            (SELECT ea.patient_name 
             FROM existing_appointments ea 
             WHERE ts.slot_time >= ea.appointment_time 
             AND ts.slot_time < (ea.appointment_time + (ea.duration_minutes || ' minutes')::interval)
             LIMIT 1), 
            NULL
        ) as patient_name
    FROM time_slots ts
    CROSS JOIN working_hours wh
    ORDER BY ts.slot_time;
END;


get_complete_patient_history

BEGIN
  RETURN QUERY
  SELECT 
    -- Información básica del paciente
    p.id as patient_id,
    p.name as patient_name,
    p.age as patient_age,
    p.birth_date as patient_birth_date,
    p.occupation as patient_occupation,
    p.marital_status as patient_marital_status,
    p.address as patient_address,
    p.neighborhood as patient_neighborhood,
    p.zip_code as patient_zip_code,
    p.phone as patient_phone,
    p.mobile as patient_mobile,
    p.email as patient_email,
    p.referred_by as patient_referred_by,
    p.consultation_reason as patient_consultation_reason,
    p.created_at as patient_created_at,
    
    -- Salud general
    p.current_treatment,
    p.current_treatment_details,
    p.flu_symptoms,
    p.allergies,
    p.allergy_details,
    
    -- Antecedentes médicos
    p.rheumatic_fever,
    p.rheumatic_fever_date,
    p.high_blood_pressure,
    p.high_blood_pressure_date,
    p.low_blood_pressure,
    p.low_blood_pressure_date,
    p.heart_attack,
    p.heart_attack_date,
    p.asthma,
    p.asthma_date,
    p.arthritis,
    p.arthritis_date,
    p.epilepsy,
    p.epilepsy_date,
    p.anemia,
    p.anemia_date,
    p.hiv,
    p.hiv_date,
    p.hepatitis,
    p.hepatitis_type,
    p.diabetes,
    p.diabetes_date,
    p.tuberculosis,
    p.tuberculosis_location,
    p.cancer,
    p.cancer_location,
    p.std,
    p.std_type,
    p.kidney_disease,
    p.kidney_disease_type,
    p.liver_disease,
    p.liver_disease_type,
    p.covid19,
    p.covid19_date,
    p.other_diseases,
    p.other_diseases_details,
    
    -- Enfermedades recientes
    p.serious_illness_3_years,
    p.serious_illness_details,
    p.hospitalization_5_years,
    p.hospitalization_details,
    p.bleeding_treatment,
    p.bleeding_details,
    p.nervous_problems,
    p.nervous_problems_details,
    p.fainting,
    p.fainting_details,
    p.seizures,
    p.seizures_details,
    p.frequent_herpes,
    
    -- Hábitos
    p.smoking,
    p.cigarettes_per_day,
    p.alcohol,
    p.alcohol_frequency,
    p.drugs,
    p.drugs_details,
    
    -- Información específica para mujeres
    p.last_period,
    p.menstrual_complications,
    p.menstrual_complications_details,
    p.birth_control,
    p.pregnancy,
    p.abortions,
    p.breastfeeding,
    
    -- Salud dental
    p.bruxism,
    p.teeth_appearance,
    p.bad_breath,
    p.chewing_difficulty,
    p.anesthesia_reaction,
    p.anesthesia_reaction_details,
    p.recent_pain,
    p.gum_bleeding,
    p.jaw_clicking,
    p.loose_teeth,
    p.food_between_teeth,
    p.lip_biting,
    p.object_biting,
    p.object_biting_details,
    p.mouth_breathing,
    p.teeth_importance,
    p.dentist_comfort,
    p.dentist_comfort_other,
    
    -- Entorno y hábitos
    p.education,
    p.favorite_color,
    p.physical_activity,
    p.physical_activity_type,
    p.brushings_per_day,
    p.floss,
    p.mouthwash,
    p.other_hygiene,
    p.other_hygiene_details,
    p.vaccination,
    
    -- Antecedentes familiares
    p.family_history,
    
    -- Firmas
    p.patient_signature,
    p.date,
    
    -- Historial de citas
    COALESCE(apt_stats.total_appointments, 0) as total_appointments,
    COALESCE(apt_stats.completed_appointments, 0) as completed_appointments,
    COALESCE(apt_stats.upcoming_appointments, 0) as upcoming_appointments,
    apt_stats.last_appointment_date,
    apt_stats.next_appointment_date,
    
    -- Odontograma
    COALESCE(o.id IS NOT NULL, FALSE) as has_odontogram,
    o.updated_at as odontogram_updated_at,
    
    -- Archivos
    COALESCE(f_stats.total_files, 0) as total_files,
    f_stats.file_types,
    
    -- Informes de IA
    COALESCE(ai_stats.total_ai_reports, 0) as total_ai_reports,
    ai_stats.last_ai_report_date
    
  FROM public.patients p
  LEFT JOIN (
    -- Estadísticas de citas
    SELECT 
      a.patient_id as apt_patient_id,
      COUNT(*) as total_appointments,
      COUNT(CASE WHEN a.status = 'completada' THEN 1 END) as completed_appointments,
      COUNT(CASE WHEN a.status IN ('programada', 'confirmada') AND a.appointment_date >= CURRENT_DATE THEN 1 END) as upcoming_appointments,
      MAX(CASE WHEN a.status = 'completada' THEN a.appointment_date END) as last_appointment_date,
      MIN(CASE WHEN a.status IN ('programada', 'confirmada') AND a.appointment_date >= CURRENT_DATE THEN a.appointment_date END) as next_appointment_date
    FROM public.appointments a
    GROUP BY a.patient_id
  ) apt_stats ON p.id = apt_stats.apt_patient_id
  LEFT JOIN (
    -- Información del odontograma
    SELECT DISTINCT ON (patient_id) 
      patient_id as od_patient_id,
      updated_at
    FROM public.odontograms
    ORDER BY patient_id, updated_at DESC
  ) o ON p.id = o.od_patient_id
  LEFT JOIN (
    -- Estadísticas de archivos
    SELECT 
      patient_id as file_patient_id,
      COUNT(*) as total_files,
      ARRAY_AGG(DISTINCT file_type) FILTER (WHERE file_type IS NOT NULL) as file_types
    FROM public.files
    GROUP BY patient_id
  ) f_stats ON p.id = f_stats.file_patient_id
  LEFT JOIN (
    -- Estadísticas de informes de IA
    SELECT 
      patient_id as ai_patient_id,
      COUNT(*) as total_ai_reports,
      MAX(created_at) as last_ai_report_date
    FROM public.ai_reports
    GROUP BY patient_id
  ) ai_stats ON p.id = ai_stats.ai_patient_id
  WHERE 
    (patient_uuid IS NULL OR p.id = patient_uuid)
  ORDER BY p.created_at DESC;
END;


get_patient_appointments

BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.duration_minutes,
        a.appointment_type,
        a.status,
        a.reason
    FROM public.appointments a
    WHERE a.patient_id = patient_uuid
    ORDER BY a.appointment_date DESC, a.appointment_time DESC;
END;


get_patient_clinical_history

BEGIN
  RETURN QUERY
  SELECT 
    -- Información básica del paciente
    p.id as patient_id,
    p.name as patient_name,
    p.age as patient_age,
    p.email as patient_email,
    p.phone as patient_phone,
    p.occupation as patient_occupation,
    p.address as patient_address,
    p.consultation_reason as patient_consultation_reason,
    p.created_at as patient_created_at,
    
    -- Información médica básica
    p.allergies,
    p.allergy_details,
    p.diabetes,
    p.diabetes_date,
    p.high_blood_pressure,
    p.high_blood_pressure_date,
    p.heart_attack,
    p.heart_attack_date,
    p.asthma,
    p.asthma_date,
    p.covid19,
    p.covid19_date,
    
    -- Salud dental básica
    p.bruxism,
    p.anesthesia_reaction,
    p.anesthesia_reaction_details,
    p.gum_bleeding,
    p.brushings_per_day,
    p.floss,
    p.mouthwash,
    
    -- Contar citas de forma simple
    COALESCE((
      SELECT COUNT(*) 
      FROM public.appointments a 
      WHERE a.patient_id = p.id
    ), 0) as total_appointments
    
  FROM public.patients p
  WHERE 
    (patient_uuid IS NULL OR p.id = patient_uuid)
  ORDER BY p.created_at DESC;
END;


get_patient_consultation_history

BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.consultation_date,
        c.consultation_type,
        c.diagnosis,
        c.treatment_performed,
        c.next_appointment,
        c.status
    FROM public.consultations c
    WHERE c.patient_id = patient_uuid
    ORDER BY c.consultation_date DESC, c.consultation_time DESC;
END;


get_patient_diagnoses_for_patient

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


get_patient_medical_history_for_patient

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


get_patient_recommendations

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


get_patients_with_clinical_info

BEGIN
  RETURN QUERY
  SELECT 
    p.id as patient_id,
    p.name as patient_name,
    p.age as patient_age,
    p.email as patient_email,
    p.phone as patient_phone,
    p.occupation as patient_occupation,
    p.address as patient_address,
    p.consultation_reason as patient_consultation_reason,
    p.created_at as patient_created_at,
    
    -- Información médica
    p.allergies,
    p.allergy_details,
    p.diabetes,
    p.diabetes_date,
    p.high_blood_pressure,
    p.high_blood_pressure_date,
    p.heart_attack,
    p.heart_attack_date,
    p.asthma,
    p.asthma_date,
    p.covid19,
    p.covid19_date,
    
    -- Salud dental
    p.bruxism,
    p.anesthesia_reaction,
    p.anesthesia_reaction_details,
    p.gum_bleeding,
    p.brushings_per_day,
    p.floss,
    p.mouthwash,
    
    -- Historial de citas
    COALESCE(apt_stats.total_appointments, 0) as total_appointments,
    apt_stats.last_appointment_date
    
  FROM public.patients p
  LEFT JOIN (
    SELECT 
      a.patient_id,
      COUNT(*) as total_appointments,
      MAX(a.appointment_date) as last_appointment_date
    FROM public.appointments a
    GROUP BY a.patient_id
  ) apt_stats ON p.id = apt_stats.patient_id
  ORDER BY p.created_at DESC;
END;


handle_new_user
BEGIN
  INSERT INTO public.profiles (id, full_name, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'dentist'),
    NOW()
  );
  RETURN NEW;
END;


is_dentist_user

BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_uuid AND role = 'dentist'
  );
END;


record_ai_interaction
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


search_patients

BEGIN
  RETURN QUERY
  SELECT 
    p.id as patient_id,
    p.name as patient_name,
    p.email as patient_email,
    p.phone as patient_phone,
    p.age as patient_age,
    p.created_at as patient_created_at,
    COALESCE(apt_stats.total_appointments, 0) as total_appointments,
    apt_stats.last_appointment_date
  FROM public.patients p
  LEFT JOIN (
    SELECT 
      patient_id,
      COUNT(*) as total_appointments,
      MAX(appointment_date) as last_appointment_date
    FROM public.appointments
    GROUP BY patient_id
  ) apt_stats ON p.id = apt_stats.patient_id
  WHERE 
    search_term = '' OR
    p.name ILIKE '%' || search_term || '%' OR
    p.email ILIKE '%' || search_term || '%' OR
    p.phone ILIKE '%' || search_term || '%'
  ORDER BY p.name ASC;
END;


update_patient_diagnoses_updated_at
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;


update_updated_at_column
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;