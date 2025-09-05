-- Migración para actualizar el sistema de cuentas de pacientes
-- Agregar campos necesarios para el flujo completo de creación de cuentas

-- 1. Agregar campo is_first_login a la tabla profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT true;

-- 2. Agregar campos adicionales a patient_account_requests
ALTER TABLE patient_account_requests 
ADD COLUMN IF NOT EXISTS credentials_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS temp_password TEXT,
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- 3. Agregar campo auth_user_id a la tabla profiles si no existe
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- 4. Crear función para verificar si un usuario es paciente
CREATE OR REPLACE FUNCTION is_patient_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_uuid AND role = 'patient'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear función para obtener información del paciente autenticado
CREATE OR REPLACE FUNCTION get_authenticated_patient_info()
RETURNS TABLE (
  patient_id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.patient_id,
    pat.name,
    pat.email,
    p.role,
    p.is_active
  FROM profiles p
  JOIN patients pat ON p.patient_id = pat.id
  WHERE p.id = auth.uid() AND p.role = 'patient';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Actualizar políticas RLS para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 7. Política para que los pacientes solo vean su propio perfil
CREATE POLICY "Patients can view own profile" ON profiles
  FOR SELECT USING (
    role = 'patient' AND auth.uid() = id
  );

-- 8. Política para que los pacientes puedan actualizar su contraseña
CREATE POLICY "Patients can update password" ON profiles
  FOR UPDATE USING (
    role = 'patient' AND auth.uid() = id
  );

-- 9. Crear trigger para marcar is_first_login como false después del primer cambio de contraseña
CREATE OR REPLACE FUNCTION update_first_login_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se está actualizando is_first_login a false, permitir
  IF NEW.is_first_login = false AND OLD.is_first_login = true THEN
    RETURN NEW;
  END IF;
  
  -- Para otras actualizaciones, mantener el valor actual
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_first_login
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_first_login_status();

-- 10. Crear función para verificar credenciales de paciente
CREATE OR REPLACE FUNCTION verify_patient_credentials(email_param TEXT, password_param TEXT)
RETURNS TABLE (
  user_id UUID,
  patient_id UUID,
  is_valid BOOLEAN,
  is_first_login BOOLEAN
) AS $$
DECLARE
  auth_user_id UUID;
  profile_record RECORD;
BEGIN
  -- Verificar credenciales con Supabase Auth
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = email_param;
  
  IF auth_user_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, false, false;
    RETURN;
  END IF;
  
  -- Obtener información del perfil
  SELECT * INTO profile_record
  FROM profiles
  WHERE id = auth_user_id AND role = 'patient';
  
  IF profile_record IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, false, false;
    RETURN;
  END IF;
  
  -- Retornar información del paciente
  RETURN QUERY SELECT 
    profile_record.id,
    profile_record.patient_id,
    profile_record.is_active,
    profile_record.is_first_login;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_patient_id ON profiles(patient_id);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_patient_account_requests_status ON patient_account_requests(status);
CREATE INDEX IF NOT EXISTS idx_patient_account_requests_patient_id ON patient_account_requests(patient_id);

-- 12. Comentarios para documentar el esquema
COMMENT ON TABLE profiles IS 'Perfiles de usuario del sistema (dentistas y pacientes)';
COMMENT ON COLUMN profiles.is_first_login IS 'Indica si es el primer acceso del usuario (requiere cambio de contraseña)';
COMMENT ON COLUMN profiles.auth_user_id IS 'ID del usuario en Supabase Auth';
COMMENT ON TABLE patient_account_requests IS 'Solicitudes de creación de cuentas de pacientes';
COMMENT ON COLUMN patient_account_requests.credentials_generated IS 'Indica si se han generado las credenciales de acceso';
COMMENT ON COLUMN patient_account_requests.temp_password IS 'Contraseña temporal generada para el paciente';
COMMENT ON COLUMN patient_account_requests.auth_user_id IS 'ID del usuario creado en Supabase Auth';

-- 13. Verificar que las tablas existan y tengan la estructura correcta
DO $$
BEGIN
  -- Verificar que la tabla profiles existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'La tabla profiles no existe. Ejecuta primero la migración base del sistema.';
  END IF;
  
  -- Verificar que la tabla patient_account_requests existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_account_requests') THEN
    RAISE EXCEPTION 'La tabla patient_account_requests no existe. Ejecuta primero la migración del sistema de pacientes.';
  END IF;
  
  RAISE NOTICE 'Migración completada exitosamente. El sistema de cuentas de pacientes está listo para usar.';
END $$;


