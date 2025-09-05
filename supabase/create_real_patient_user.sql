-- Función RPC para crear usuarios reales de pacientes
-- Esta función debe ejecutarse desde el SQL Editor de Supabase

-- Función que crea un usuario real en auth.users
CREATE OR REPLACE FUNCTION create_real_patient_user(
  patient_email TEXT,
  patient_password TEXT,
  patient_name TEXT,
  patient_id UUID,
  dentist_id UUID
)
RETURNS JSON AS $$
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
    new_user_id,
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
    jsonb_build_object(
      'role', 'patient',
      'patient_id', patient_id,
      'name', patient_name
    ),
    false,
    now()
  );

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION create_real_patient_user(TEXT, TEXT, TEXT, UUID, UUID) TO authenticated;

-- Comentario de la función
COMMENT ON FUNCTION create_real_patient_user IS 'Crea un usuario real de paciente en auth.users y profiles';


