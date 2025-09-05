-- Trigger para crear perfiles automáticamente
-- Esta función debe ejecutarse desde el SQL Editor de Supabase

-- Función que se ejecutará cuando se cree un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para crear perfil manualmente si ya tienes cuenta
CREATE OR REPLACE FUNCTION create_dentist_profile(
  user_email TEXT,
  full_name TEXT
)
RETURNS JSON AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION create_dentist_profile(TEXT, TEXT) TO authenticated;

-- Comentario de la función
COMMENT ON FUNCTION create_dentist_profile IS 'Crea un perfil de dentista para un usuario existente';


