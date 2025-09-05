-- =====================================================
-- CORRECCIÓN DE LA TABLA PROFILES
-- =====================================================
-- Ejecutar este archivo en Supabase SQL Editor para corregir la tabla profiles

-- 1. AGREGAR CAMPO is_first_login SI NO EXISTE
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_first_login') THEN
        ALTER TABLE public.profiles ADD COLUMN is_first_login BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Campo is_first_login agregado a la tabla profiles';
    ELSE
        RAISE NOTICE 'Campo is_first_login ya existe en la tabla profiles';
    END IF;
END $$;

-- 2. VERIFICAR QUE TODOS LOS CAMPOS NECESARIOS EXISTAN
DO $$ 
BEGIN
    -- Verificar campo patient_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'patient_id') THEN
        ALTER TABLE public.profiles ADD COLUMN patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL;
        RAISE NOTICE 'Campo patient_id agregado a la tabla profiles';
    END IF;
    
    -- Verificar campo is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Campo is_active agregado a la tabla profiles';
    END IF;
    
    -- Verificar campo last_login
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_login') THEN
        ALTER TABLE public.profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Campo last_login agregado a la tabla profiles';
    END IF;
END $$;

-- 3. ACTUALIZAR PERFILES EXISTENTES
UPDATE public.profiles 
SET is_first_login = TRUE 
WHERE is_first_login IS NULL;

-- 4. VERIFICAR LA ESTRUCTURA FINAL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. VERIFICAR QUE NO HAYA ERRORES EN LAS POLÍTICAS RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- 6. VERIFICAR QUE LA TABLA TENGA DATOS
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN role = 'patient' THEN 1 END) as patient_profiles,
    COUNT(CASE WHEN role = 'dentist' THEN 1 END) as dentist_profiles,
    COUNT(CASE WHEN is_first_login = TRUE THEN 1 END) as first_login_profiles
FROM public.profiles;

-- =====================================================
-- TABLA PROFILES CORREGIDA EXITOSAMENTE
-- =====================================================
