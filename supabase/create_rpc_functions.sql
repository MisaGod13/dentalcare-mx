-- Función RPC para obtener resumen de pacientes (bypass RLS)
CREATE OR REPLACE FUNCTION get_all_patients_summary()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  phone text,
  created_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Función RPC para obtener estadísticas de la clínica
CREATE OR REPLACE FUNCTION get_clinic_statistics()
RETURNS TABLE (
  total_patients bigint,
  monthly_appointments bigint,
  status_summary jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.patients) as total_patients,
    (SELECT COUNT(*) FROM public.appointments 
     WHERE appointment_date >= date_trunc('month', CURRENT_DATE)::date
     AND appointment_date < (date_trunc('month', CURRENT_DATE) + interval '1 month')::date) as monthly_appointments,
    (SELECT jsonb_object_agg(status, count) 
     FROM (SELECT status, COUNT(*) as count 
           FROM public.appointments 
           GROUP BY status) as status_counts) as status_summary;
END;
$$;

-- Función RPC para obtener próximas citas
CREATE OR REPLACE FUNCTION get_upcoming_appointments()
RETURNS TABLE (
  id uuid,
  appointment_date date,
  appointment_time time,
  appointment_type text,
  status text,
  patient_name text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.appointment_type,
    a.status,
    p.name as patient_name
  FROM public.appointments a
  LEFT JOIN public.patients p ON a.patient_id = p.id
  WHERE a.appointment_date >= CURRENT_DATE
  ORDER BY a.appointment_date ASC, a.appointment_time ASC
  LIMIT 10;
END;
$$;

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION get_all_patients_summary() TO anon;
GRANT EXECUTE ON FUNCTION get_clinic_statistics() TO anon;
GRANT EXECUTE ON FUNCTION get_upcoming_appointments() TO anon;
