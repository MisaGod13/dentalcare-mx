-- =====================================================
-- CORRECCIÓN DE RELACIÓN ENTRE PERFILES Y PACIENTES
-- =====================================================
-- Ejecutar este archivo en Supabase SQL Editor para corregir la relación

-- 1. VERIFICAR LA ESTRUCTURA ACTUAL
SELECT 
    'ESTRUCTURA ACTUAL' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR PERFILES EXISTENTES
SELECT 
    'PERFILES EXISTENTES' as info,
    id,
    role,
    patient_id,
    is_active,
    created_at
FROM public.profiles 
ORDER BY created_at;

-- 3. VERIFICAR PACIENTES EXISTENTES
SELECT 
    'PACIENTES EXISTENTES' as info,
    id,
    name,
    email,
    created_at
FROM public.patients 
ORDER BY created_at;

-- 4. CORREGIR PERFILES DE PACIENTES QUE NO TIENEN patient_id
UPDATE public.profiles 
SET patient_id = (
    SELECT p.id 
    FROM public.patients p 
    WHERE p.email = (
        SELECT au.email 
        FROM auth.users au 
        WHERE au.id = profiles.id
    )
    LIMIT 1
)
WHERE profiles.role = 'patient' 
AND profiles.patient_id IS NULL;

-- 5. VERIFICAR QUE NO HAYA PERFILES DE PACIENTES SIN patient_id
SELECT 
    'PERFILES SIN patient_id' as info,
    id,
    role,
    patient_id,
    created_at
FROM public.profiles 
WHERE role = 'patient' 
AND patient_id IS NULL;

-- 6. CREAR PERFILES PARA PACIENTES QUE NO LOS TIENEN
INSERT INTO public.profiles (id, role, patient_id, is_active, created_at)
SELECT 
    au.id,
    'patient',
    p.id,
    true,
    au.created_at
FROM auth.users au
JOIN public.patients p ON p.email = au.email
WHERE au.id NOT IN (SELECT id FROM public.profiles)
AND au.raw_user_meta_data->>'role' = 'patient';

-- 7. VERIFICAR RELACIONES CORREGIDAS
SELECT 
    'RELACIONES CORREGIDAS' as info,
    p.id as profile_id,
    p.role,
    p.patient_id,
    pat.name as patient_name,
    pat.email as patient_email
FROM public.profiles p
LEFT JOIN public.patients pat ON p.patient_id = pat.id
WHERE p.role = 'patient'
ORDER BY p.created_at;

-- 8. VERIFICAR QUE TODOS LOS PACIENTES TENGAN PERFILES
SELECT 
    'PACIENTES SIN PERFIL' as info,
    p.id,
    p.name,
    p.email
FROM public.patients p
WHERE p.id NOT IN (
    SELECT patient_id 
    FROM public.profiles 
    WHERE patient_id IS NOT NULL
);

-- 9. VERIFICAR POLÍTICAS RLS PARA LA TABLA PATIENTS
SELECT 
    'POLÍTICAS RLS PATIENTS' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'patients' 
AND schemaname = 'public';

-- 10. CREAR POLÍTICA RLS PARA PACIENTES SI NO EXISTE
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'patients' 
        AND policyname = 'patients_can_view_own_data'
    ) THEN
        CREATE POLICY "patients_can_view_own_data" ON public.patients
        FOR SELECT USING (
            id IN (
                SELECT patient_id 
                FROM public.profiles 
                WHERE id = auth.uid() 
                AND role = 'patient'
            )
        );
        RAISE NOTICE 'Política RLS creada para pacientes';
    ELSE
        RAISE NOTICE 'Política RLS ya existe para pacientes';
    END IF;
END $$;

-- 11. VERIFICAR ESTADO FINAL
SELECT 
    'ESTADO FINAL' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN role = 'patient' THEN 1 END) as patient_profiles,
    COUNT(CASE WHEN role = 'dentist' THEN 1 END) as dentist_profiles,
    COUNT(CASE WHEN role = 'patient' AND patient_id IS NOT NULL THEN 1 END) as patient_profiles_with_id
FROM public.profiles;

-- =====================================================
-- RELACIÓN ENTRE PERFILES Y PACIENTES CORREGIDA
-- =====================================================
