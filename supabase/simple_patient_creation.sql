-- Función RPC simple para crear pacientes
-- Esta función debe ejecutarse desde el SQL Editor de Supabase

-- Función simple que solo crea el perfil del paciente
CREATE OR REPLACE FUNCTION create_simple_patient_profile(
  patient_email TEXT,
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

  -- Crear un usuario en auth.users primero
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
    crypt('temp_password_123', gen_salt('bf')), -- Contraseña temporal
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

  -- Crear el perfil en la tabla profiles usando el ID del usuario creado
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION create_simple_patient_profile(TEXT, TEXT, UUID, UUID) TO authenticated;

-- Comentario de la función
COMMENT ON FUNCTION create_simple_patient_profile IS 'Crea un perfil de paciente simple en el sistema';

-- Función para verificar si un usuario es dentista
CREATE OR REPLACE FUNCTION is_dentist_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_uuid AND role = 'dentist'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION is_dentist_user(UUID) TO authenticated;

-- Comentario de la función
COMMENT ON FUNCTION is_dentist_user IS 'Verifica si un usuario es dentista';
