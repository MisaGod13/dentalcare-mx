-- Tabla de perfiles de usuario
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text, 
  role text check (role in ('dentist','patient')) default 'dentist', 
  created_at timestamptz default now()
);

-- Tabla principal de pacientes con todos los campos del formulario
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(), 
  dentist_id uuid references auth.users(id) on delete set null,
  
  -- Datos básicos del paciente
  name text not null, 
  age int, 
  birth_date date, 
  occupation text, 
  marital_status text, 
  address text, 
  neighborhood text, 
  zip_code text,
  phone text, 
  mobile text, 
  email text, 
  referred_by text, 
  consultation_reason text,
  
  -- Salud general
  current_treatment boolean default false,
  current_treatment_details text,
  flu_symptoms boolean default false,
  allergies boolean default false,
  allergy_details text,
  
  -- Antecedentes médicos
  rheumatic_fever boolean default false,
  rheumatic_fever_date text,
  high_blood_pressure boolean default false,
  high_blood_pressure_date text,
  low_blood_pressure boolean default false,
  low_blood_pressure_date text,
  heart_attack boolean default false,
  heart_attack_date text,
  asthma boolean default false,
  asthma_date text,
  arthritis boolean default false,
  arthritis_date text,
  epilepsy boolean default false,
  epilepsy_date text,
  anemia boolean default false,
  anemia_date text,
  hiv boolean default false,
  hiv_date text,
  hepatitis boolean default false,
  hepatitis_type text,
  diabetes boolean default false,
  diabetes_date text,
  tuberculosis boolean default false,
  tuberculosis_location text,
  cancer boolean default false,
  cancer_location text,
  std boolean default false,
  std_type text,
  kidney_disease boolean default false,
  kidney_disease_type text,
  liver_disease boolean default false,
  liver_disease_type text,
  covid19 boolean default false,
  covid19_date text,
  other_diseases boolean default false,
  other_diseases_details text,
  
  -- Enfermedades recientes
  serious_illness_3_years boolean default false,
  serious_illness_details text,
  hospitalization_5_years boolean default false,
  hospitalization_details text,
  bleeding_treatment boolean default false,
  bleeding_details text,
  nervous_problems boolean default false,
  nervous_problems_details text,
  fainting boolean default false,
  fainting_details text,
  seizures boolean default false,
  seizures_details text,
  frequent_herpes boolean default false,
  
  -- Hábitos
  smoking boolean default false,
  cigarettes_per_day text,
  alcohol boolean default false,
  alcohol_frequency text,
  drugs boolean default false,
  drugs_details text,
  
  -- Información específica para mujeres
  last_period date,
  menstrual_complications boolean default false,
  menstrual_complications_details text,
  birth_control boolean default false,
  pregnancy boolean default false,
  abortions text,
  breastfeeding boolean default false,
  
  -- Salud dental
  bruxism boolean default false,
  teeth_appearance boolean default false,
  bad_breath boolean default false,
  chewing_difficulty boolean default false,
  anesthesia_reaction boolean default false,
  anesthesia_reaction_details text,
  recent_pain boolean default false,
  gum_bleeding text,
  jaw_clicking text,
  loose_teeth boolean default false,
  food_between_teeth boolean default false,
  lip_biting boolean default false,
  object_biting boolean default false,
  object_biting_details text,
  mouth_breathing boolean default false,
  teeth_importance text,
  dentist_comfort text,
  dentist_comfort_other text,
  
  -- Entorno y hábitos
  education text,
  favorite_color text,
  physical_activity boolean default false,
  physical_activity_type text,
  brushings_per_day text,
  floss boolean default false,
  mouthwash boolean default false,
  other_hygiene boolean default false,
  other_hygiene_details text,
  vaccination text,
  
  -- Antecedentes familiares
  family_history text,
  
  -- Firmas
  patient_signature text,
  date date,
  
  created_at timestamptz default now()
);

-- Tabla de historias médicas (mantenida para compatibilidad)
create table if not exists public.medical_histories (
  id uuid primary key default gen_random_uuid(), 
  patient_id uuid references public.patients(id) on delete cascade, 
  data jsonb not null, 
  created_at timestamptz default now()
);

-- Tabla de odontogramas
create table if not exists public.odontograms (
  id uuid primary key default gen_random_uuid(), 
  patient_id uuid references public.patients(id) on delete cascade, 
  chart jsonb not null default '{}'::jsonb, 
  created_at timestamptz default now(), 
  updated_at timestamptz default now()
);

-- Tabla de archivos
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(), 
  patient_id uuid references public.patients(id) on delete cascade, 
  file_name text, 
  file_path text, 
  file_type text, 
  created_at timestamptz default now()
);

-- Tabla de informes de IA
create table if not exists public.ai_reports (
  id uuid primary key default gen_random_uuid(), 
  patient_id uuid references public.patients(id) on delete cascade, 
  content text, 
  model text, 
  created_at timestamptz default now()
);

-- Habilitar RLS en todas las tablas
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.medical_histories enable row level security;
alter table public.odontograms enable row level security;
alter table public.files enable row level security;
alter table public.ai_reports enable row level security;

-- Políticas de seguridad
create policy "perfil propio" on public.profiles for select using (auth.uid() = id);

create policy "mis pacientes: leer" on public.patients for select using (auth.uid() = dentist_id);
create policy "mis pacientes: insertar" on public.patients for insert with check (auth.uid() = dentist_id);
create policy "mis pacientes: actualizar" on public.patients for update using (auth.uid() = dentist_id);

create policy "historia por dueño" on public.medical_histories for all using (exists (select 1 from public.patients p where p.id = patient_id and p.dentist_id = auth.uid())) with check (exists (select 1 from public.patients p where p.id = patient_id and p.dentist_id = auth.uid()));
create policy "odontograma por dueño" on public.odontograms for all using (exists (select 1 from public.patients p where p.id = patient_id and p.dentist_id = auth.uid())) with check (exists (select 1 from public.patients p where p.id = patient_id and p.dentist_id = auth.uid()));
create policy "archivos por dueño" on public.files for all using (exists (select 1 from public.patients p where p.id = patient_id and p.dentist_id = auth.uid())) with check (exists (select 1 from public.patients p where p.id = patient_id and p.dentist_id = auth.uid()));
create policy "informes por dueño" on public.ai_reports for all using (exists (select 1 from public.patients p where p.id = patient_id and p.dentist_id = auth.uid())) with check (exists (select 1 from public.patients p where p.id = patient_id and p.dentist_id = auth.uid()));
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ai_assistant_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  session_id uuid NOT NULL,
  user_message text NOT NULL,
  ai_response text NOT NULL,
  context_data jsonb,
  response_quality_rating integer CHECK (response_quality_rating >= 1 AND response_quality_rating <= 5),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_assistant_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT ai_assistant_interactions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.ai_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  content text,
  model text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_reports_pkey PRIMARY KEY (id),
  CONSTRAINT ai_reports_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.appointment_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT appointment_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  doctor_id uuid,
  appointment_date date NOT NULL,
  appointment_time time without time zone NOT NULL,
  duration_minutes integer DEFAULT 60,
  appointment_type text NOT NULL,
  status text DEFAULT 'programada'::text CHECK (status = ANY (ARRAY['programada'::text, 'confirmada'::text, 'en_proceso'::text, 'completada'::text, 'cancelada'::text, 'no_show'::text])),
  reason text,
  notes text,
  reminder_sent boolean DEFAULT false,
  reminder_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.consultation_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL,
  image_url text NOT NULL,
  image_type text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT consultation_images_pkey PRIMARY KEY (id),
  CONSTRAINT consultation_images_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id)
);
CREATE TABLE public.consultation_treatments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL,
  treatment_type text NOT NULL,
  tooth_number text,
  treatment_details text,
  materials_used text,
  cost numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT consultation_treatments_pkey PRIMARY KEY (id),
  CONSTRAINT consultation_treatments_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id)
);
CREATE TABLE public.consultations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  consultation_date date NOT NULL DEFAULT CURRENT_DATE,
  consultation_time time without time zone DEFAULT CURRENT_TIME,
  consultation_type text NOT NULL,
  symptoms text,
  examination_findings text,
  diagnosis text,
  treatment_plan text,
  treatment_performed text,
  prescriptions text,
  recommendations text,
  next_appointment date,
  notes text,
  doctor_notes text,
  status text DEFAULT 'completed'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT consultations_pkey PRIMARY KEY (id),
  CONSTRAINT consultations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  file_name text,
  file_path text,
  file_type text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT files_pkey PRIMARY KEY (id),
  CONSTRAINT files_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.medical_histories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT medical_histories_pkey PRIMARY KEY (id),
  CONSTRAINT medical_histories_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.odontograms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  chart jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT odontograms_pkey PRIMARY KEY (id)
);
CREATE TABLE public.patient_account_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  dentist_id uuid NOT NULL,
  request_date timestamp with time zone DEFAULT now(),
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'expired'::text])),
  approval_date timestamp with time zone,
  rejection_reason text,
  expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
  created_at timestamp with time zone DEFAULT now(),
  credentials_generated boolean DEFAULT false,
  temp_password text,
  auth_user_id uuid,
  CONSTRAINT patient_account_requests_pkey PRIMARY KEY (id),
  CONSTRAINT patient_account_requests_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT patient_account_requests_dentist_id_fkey FOREIGN KEY (dentist_id) REFERENCES auth.users(id),
  CONSTRAINT patient_account_requests_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.patient_diagnoses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  consultation_id uuid,
  diagnosis_type text NOT NULL CHECK (diagnosis_type = ANY (ARRAY['preliminar'::text, 'definitivo'::text, 'diferencial'::text])),
  diagnosis_text text NOT NULL,
  icd10_code text,
  severity_level text CHECK (severity_level = ANY (ARRAY['leve'::text, 'moderado'::text, 'grave'::text, 'crítico'::text])),
  is_visible_to_patient boolean DEFAULT true,
  dentist_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patient_diagnoses_pkey PRIMARY KEY (id),
  CONSTRAINT patient_diagnoses_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT patient_diagnoses_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id)
);
CREATE TABLE public.patient_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  notification_type text NOT NULL CHECK (notification_type = ANY (ARRAY['appointment_reminder'::text, 'diagnosis_update'::text, 'consultation_scheduled'::text, 'general'::text])),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patient_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT patient_notifications_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.patient_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  permission_type text NOT NULL CHECK (permission_type = ANY (ARRAY['view_medical_history'::text, 'view_diagnoses'::text, 'schedule_appointments'::text, 'view_consultations'::text, 'chat_with_ai'::text])),
  is_granted boolean DEFAULT true,
  granted_by uuid,
  granted_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patient_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT patient_permissions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT patient_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id)
);
CREATE TABLE public.patient_recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  recommendation_type text NOT NULL CHECK (recommendation_type = ANY (ARRAY['higiene'::text, 'dieta'::text, 'estilo_vida'::text, 'seguimiento'::text, 'emergencia'::text])),
  title text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'normal'::text CHECK (priority = ANY (ARRAY['baja'::text, 'normal'::text, 'alta'::text, 'urgente'::text])),
  is_active boolean DEFAULT true,
  valid_until date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patient_recommendations_pkey PRIMARY KEY (id),
  CONSTRAINT patient_recommendations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.patients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dentist_id uuid,
  name text NOT NULL,
  age integer,
  birth_date date,
  occupation text,
  marital_status text,
  address text,
  neighborhood text,
  zip_code text,
  phone text,
  mobile text,
  email text,
  referred_by text,
  consultation_reason text,
  created_at timestamp with time zone DEFAULT now(),
  current_treatment boolean DEFAULT false,
  current_treatment_details text,
  flu_symptoms boolean DEFAULT false,
  allergies boolean DEFAULT false,
  allergy_details text,
  rheumatic_fever boolean DEFAULT false,
  rheumatic_fever_date text,
  high_blood_pressure boolean DEFAULT false,
  high_blood_pressure_date text,
  low_blood_pressure boolean DEFAULT false,
  low_blood_pressure_date text,
  heart_attack boolean DEFAULT false,
  heart_attack_date text,
  asthma boolean DEFAULT false,
  asthma_date text,
  arthritis boolean DEFAULT false,
  arthritis_date text,
  epilepsy boolean DEFAULT false,
  epilepsy_date text,
  anemia boolean DEFAULT false,
  anemia_date text,
  hiv boolean DEFAULT false,
  hiv_date text,
  hepatitis boolean DEFAULT false,
  hepatitis_type text,
  diabetes boolean DEFAULT false,
  diabetes_date text,
  tuberculosis boolean DEFAULT false,
  tuberculosis_location text,
  cancer boolean DEFAULT false,
  cancer_location text,
  std boolean DEFAULT false,
  std_type text,
  kidney_disease boolean DEFAULT false,
  kidney_disease_type text,
  liver_disease boolean DEFAULT false,
  liver_disease_type text,
  covid19 boolean DEFAULT false,
  covid19_date text,
  other_diseases boolean DEFAULT false,
  other_diseases_details text,
  serious_illness_3_years boolean DEFAULT false,
  serious_illness_details text,
  hospitalization_5_years boolean DEFAULT false,
  hospitalization_details text,
  bleeding_treatment boolean DEFAULT false,
  bleeding_details text,
  nervous_problems boolean DEFAULT false,
  nervous_problems_details text,
  fainting boolean DEFAULT false,
  fainting_details text,
  seizures boolean DEFAULT false,
  seizures_details text,
  frequent_herpes boolean DEFAULT false,
  smoking boolean DEFAULT false,
  cigarettes_per_day text,
  alcohol boolean DEFAULT false,
  alcohol_frequency text,
  drugs boolean DEFAULT false,
  drugs_details text,
  last_period date,
  menstrual_complications boolean DEFAULT false,
  menstrual_complications_details text,
  birth_control boolean DEFAULT false,
  pregnancy boolean DEFAULT false,
  abortions text,
  breastfeeding boolean DEFAULT false,
  bruxism boolean DEFAULT false,
  teeth_appearance boolean DEFAULT false,
  bad_breath boolean DEFAULT false,
  chewing_difficulty boolean DEFAULT false,
  anesthesia_reaction boolean DEFAULT false,
  anesthesia_reaction_details text,
  recent_pain boolean DEFAULT false,
  gum_bleeding text,
  jaw_clicking text,
  loose_teeth boolean DEFAULT false,
  food_between_teeth boolean DEFAULT false,
  lip_biting boolean DEFAULT false,
  object_biting boolean DEFAULT false,
  object_biting_details text,
  mouth_breathing boolean DEFAULT false,
  teeth_importance text,
  dentist_comfort text,
  dentist_comfort_other text,
  education text,
  favorite_color text,
  physical_activity boolean DEFAULT false,
  physical_activity_type text,
  brushings_per_day text,
  floss boolean DEFAULT false,
  mouthwash boolean DEFAULT false,
  other_hygiene boolean DEFAULT false,
  other_hygiene_details text,
  vaccination text,
  family_history text,
  patient_signature text,
  date date,
  CONSTRAINT patients_pkey PRIMARY KEY (id),
  CONSTRAINT patients_dentist_id_fkey FOREIGN KEY (dentist_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  role text DEFAULT 'dentist'::text CHECK (role = ANY (ARRAY['dentist'::text, 'patient'::text])),
  created_at timestamp with time zone DEFAULT now(),
  patient_id uuid,
  is_active boolean DEFAULT true,
  last_login timestamp with time zone,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.schedule_exceptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exception_date date NOT NULL,
  start_time time without time zone,
  end_time time without time zone,
  is_working_day boolean DEFAULT false,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT schedule_exceptions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.working_hours (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  is_working_day boolean DEFAULT true,
  break_start_time time without time zone,
  break_end_time time without time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT working_hours_pkey PRIMARY KEY (id)
);