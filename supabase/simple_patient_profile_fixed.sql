-- Función RPC simple que solo crea el perfil del paciente
-- Esta función debe ejecutarse desde el SQL Editor de Supabase

-- Función que solo crea el perfil (sin usuario de auth)
CREATE OR REPLACE FUNCTION create_patient_profile_simple(
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

  -- Generar un UUID para el perfil
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION create_patient_profile_simple(TEXT, TEXT, UUID, UUID) TO authenticated;

-- Comentario de la función
COMMENT ON FUNCTION create_patient_profile_simple IS 'Crea un perfil de paciente simple sin usuario de auth';


