-- =====================================================
-- MIGRACIÓN PARA SISTEMA DE AGENDA Y CITAS
-- =====================================================

-- 1. TABLA DE CITAS (APPOINTMENTS)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID, -- Para futuras expansiones multi-doctor
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60, -- Duración en minutos
    appointment_type TEXT NOT NULL, -- 'consulta', 'limpieza', 'extraccion', 'ortodoncia', etc.
    status TEXT DEFAULT 'programada' CHECK (status IN ('programada', 'confirmada', 'en_proceso', 'completada', 'cancelada', 'no_show')),
    reason TEXT, -- Motivo de la cita
    notes TEXT, -- Notas adicionales
    reminder_sent BOOLEAN DEFAULT FALSE, -- Si se envió recordatorio
    reminder_date DATE, -- Fecha del recordatorio
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE HORARIOS DE TRABAJO (WORKING_HOURS)
CREATE TABLE IF NOT EXISTS public.working_hours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Domingo, 1=Lunes, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_working_day BOOLEAN DEFAULT TRUE,
    break_start_time TIME, -- Inicio del descanso
    break_end_time TIME, -- Fin del descanso
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE EXCEPCIONES DE HORARIO (SCHEDULE_EXCEPTIONS)
CREATE TABLE IF NOT EXISTS public.schedule_exceptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exception_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_working_day BOOLEAN DEFAULT FALSE, -- FALSE = día no laboral
    reason TEXT, -- Motivo de la excepción (vacaciones, feriado, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE CONFIGURACIÓN DE CITAS (APPOINTMENT_SETTINGS)
CREATE TABLE IF NOT EXISTS public.appointment_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

-- Índices para appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON public.appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);

-- Índices para working_hours
CREATE INDEX IF NOT EXISTS idx_working_hours_day ON public.working_hours(day_of_week);

-- Índices para schedule_exceptions
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_date ON public.schedule_exceptions(exception_date);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas las tablas
DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_working_hours_updated_at ON public.working_hours;
CREATE TRIGGER update_working_hours_updated_at
    BEFORE UPDATE ON public.working_hours
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedule_exceptions_updated_at ON public.schedule_exceptions;
CREATE TRIGGER update_schedule_exceptions_updated_at
    BEFORE UPDATE ON public.schedule_exceptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointment_settings_updated_at ON public.appointment_settings;
CREATE TRIGGER update_appointment_settings_updated_at
    BEFORE UPDATE ON public.appointment_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIONES RPC PARA LA AGENDA
-- =====================================================

-- Función para obtener citas de un paciente
CREATE OR REPLACE FUNCTION get_patient_appointments(patient_uuid UUID)
RETURNS TABLE (
    appointment_id UUID,
    appointment_date DATE,
    appointment_time TIME,
    duration_minutes INTEGER,
    appointment_type TEXT,
    status TEXT,
    reason TEXT
) AS $$
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
$$ LANGUAGE plpgsql;

-- Función para obtener disponibilidad en una fecha específica
CREATE OR REPLACE FUNCTION get_availability_for_date(check_date DATE)
RETURNS TABLE (
    time_slot TIME,
    is_available BOOLEAN,
    appointment_id UUID,
    patient_name TEXT
) AS $$
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
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de la agenda
CREATE OR REPLACE FUNCTION get_appointment_stats(start_date DATE, end_date DATE)
RETURNS TABLE (
    total_appointments BIGINT,
    completed_appointments BIGINT,
    cancelled_appointments BIGINT,
    no_show_appointments BIGINT,
    average_duration_minutes NUMERIC
) AS $$
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
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar horarios de trabajo por defecto (Lunes a Viernes, 9:00 AM - 6:00 PM)
INSERT INTO public.working_hours (day_of_week, start_time, end_time, is_working_day) VALUES
(1, '09:00', '18:00', TRUE),  -- Lunes
(2, '09:00', '18:00', TRUE),  -- Martes
(3, '09:00', '18:00', TRUE),  -- Miércoles
(4, '09:00', '18:00', TRUE),  -- Jueves
(5, '09:00', '18:00', TRUE),  -- Viernes
(6, '09:00', '14:00', TRUE),  -- Sábado (medio día)
(0, '00:00', '00:00', FALSE) -- Domingo (cerrado)
ON CONFLICT DO NOTHING;

-- Insertar configuración por defecto
INSERT INTO public.appointment_settings (setting_key, setting_value, description) VALUES
('default_duration', '60', 'Duración por defecto de las citas en minutos'),
('advance_booking_days', '30', 'Días de anticipación para reservar citas'),
('reminder_days_before', '1', 'Días antes de la cita para enviar recordatorio'),
('max_appointments_per_day', '16', 'Máximo número de citas por día'),
('working_hours_start', '09:00', 'Hora de inicio del horario laboral'),
('working_hours_end', '18:00', 'Hora de fin del horario laboral')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para appointments
CREATE POLICY "Users can view all appointments" ON public.appointments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert appointments" ON public.appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update appointments" ON public.appointments
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete appointments" ON public.appointments
    FOR DELETE USING (true);

-- Políticas para working_hours
CREATE POLICY "Users can view working hours" ON public.working_hours
    FOR SELECT USING (true);

CREATE POLICY "Users can manage working hours" ON public.working_hours
    FOR ALL USING (true);

-- Políticas para schedule_exceptions
CREATE POLICY "Users can view schedule exceptions" ON public.schedule_exceptions
    FOR SELECT USING (true);

CREATE POLICY "Users can manage schedule exceptions" ON public.schedule_exceptions
    FOR ALL USING (true);

-- Políticas para appointment_settings
CREATE POLICY "Users can view appointment settings" ON public.appointment_settings
    FOR SELECT USING (true);

CREATE POLICY "Users can manage appointment settings" ON public.appointment_settings
    FOR ALL USING (true);

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE public.appointments IS 'Tabla principal para gestionar las citas de los pacientes';
COMMENT ON TABLE public.working_hours IS 'Horarios de trabajo regulares de la clínica';
COMMENT ON TABLE public.schedule_exceptions IS 'Excepciones al horario regular (vacaciones, feriados, etc.)';
COMMENT ON TABLE public.appointment_settings IS 'Configuración general del sistema de citas';

COMMENT ON COLUMN public.appointments.status IS 'Estado de la cita: programada, confirmada, en_proceso, completada, cancelada, no_show';
COMMENT ON COLUMN public.appointments.appointment_type IS 'Tipo de cita: consulta, limpieza, extraccion, ortodoncia, etc.';
COMMENT ON COLUMN public.working_hours.day_of_week IS 'Día de la semana: 0=Domingo, 1=Lunes, ..., 6=Sábado';
