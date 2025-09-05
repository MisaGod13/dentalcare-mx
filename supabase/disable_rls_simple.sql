-- SOLUCIÓN SIMPLE: Deshabilitar RLS completamente
-- Ejecuta este script en el SQL Editor de Supabase

-- Deshabilitar RLS en la tabla odontograms
ALTER TABLE public.odontograms DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view own patients odontograms" ON public.odontograms;
DROP POLICY IF EXISTS "Users can insert own patients odontograms" ON public.odontograms;
DROP POLICY IF EXISTS "Users can update own patients odontograms" ON public.odontograms;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.odontograms;

-- Verificar que RLS está deshabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'odontograms';

-- Comentario: Al deshabilitar RLS, cualquier usuario autenticado
-- podrá acceder a la tabla sin restricciones de seguridad.
-- Esto resuelve el problema inmediatamente.



