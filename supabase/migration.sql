-- Script de migración para asegurar que todas las columnas del formulario estén presentes
-- Ejecutar este script en Supabase SQL Editor

-- Verificar si las columnas existen y agregarlas si no están
DO $$ 
BEGIN
    -- Agregar columnas si no existen
    
    -- Datos básicos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'zip_code') THEN
        ALTER TABLE public.patients ADD COLUMN zip_code text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'consultation_reason') THEN
        ALTER TABLE public.patients ADD COLUMN consultation_reason text;
    END IF;
    
    -- Salud general
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'current_treatment') THEN
        ALTER TABLE public.patients ADD COLUMN current_treatment boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'current_treatment_details') THEN
        ALTER TABLE public.patients ADD COLUMN current_treatment_details text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'flu_symptoms') THEN
        ALTER TABLE public.patients ADD COLUMN flu_symptoms boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'allergies') THEN
        ALTER TABLE public.patients ADD COLUMN allergies boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'allergy_details') THEN
        ALTER TABLE public.patients ADD COLUMN allergy_details text;
    END IF;
    
    -- Antecedentes médicos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'rheumatic_fever') THEN
        ALTER TABLE public.patients ADD COLUMN rheumatic_fever boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'rheumatic_fever_date') THEN
        ALTER TABLE public.patients ADD COLUMN rheumatic_fever_date text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'high_blood_pressure') THEN
        ALTER TABLE public.patients ADD COLUMN high_blood_pressure boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'high_blood_pressure_date') THEN
        ALTER TABLE public.patients ADD COLUMN high_blood_pressure_date text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'low_blood_pressure') THEN
        ALTER TABLE public.patients ADD COLUMN low_blood_pressure boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'low_blood_pressure_date') THEN
        ALTER TABLE public.patients ADD COLUMN low_blood_pressure_date text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'heart_attack') THEN
        ALTER TABLE public.patients ADD COLUMN heart_attack boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'heart_attack_date') THEN
        ALTER TABLE public.patients ADD COLUMN heart_attack_date text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'asthma') THEN
        ALTER TABLE public.patients ADD COLUMN asthma boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'asthma_date') THEN
        ALTER TABLE public.patients ADD COLUMN asthma_date text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'arthritis') THEN
        ALTER TABLE public.patients ADD COLUMN arthritis boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'arthritis_date') THEN
        ALTER TABLE public.patients ADD COLUMN arthritis_date text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'epilepsy') THEN
        ALTER TABLE public.patients ADD COLUMN epilepsy boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'epilepsy_date') THEN
        ALTER TABLE public.patients ADD COLUMN epilepsy_date text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'anemia') THEN
        ALTER TABLE public.patients ADD COLUMN anemia boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'anemia_date') THEN
        ALTER TABLE public.patients ADD COLUMN anemia_date text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'hiv') THEN
        ALTER TABLE public.patients ADD COLUMN hiv boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'hiv_date') THEN
        ALTER TABLE public.patients ADD COLUMN hiv_date text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'hepatitis') THEN
        ALTER TABLE public.patients ADD COLUMN hepatitis boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'hepatitis_type') THEN
        ALTER TABLE public.patients ADD COLUMN hepatitis_type text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'diabetes') THEN
        ALTER TABLE public.patients ADD COLUMN diabetes boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'diabetes_date') THEN
        ALTER TABLE public.patients ADD COLUMN diabetes_date text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'tuberculosis') THEN
        ALTER TABLE public.patients ADD COLUMN tuberculosis boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'tuberculosis_location') THEN
        ALTER TABLE public.patients ADD COLUMN tuberculosis_location text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'cancer') THEN
        ALTER TABLE public.patients ADD COLUMN cancer boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'cancer_location') THEN
        ALTER TABLE public.patients ADD COLUMN cancer_location text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'std') THEN
        ALTER TABLE public.patients ADD COLUMN std boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'std_type') THEN
        ALTER TABLE public.patients ADD COLUMN std_type text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'kidney_disease') THEN
        ALTER TABLE public.patients ADD COLUMN kidney_disease boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'kidney_disease_type') THEN
        ALTER TABLE public.patients ADD COLUMN kidney_disease_type text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'liver_disease') THEN
        ALTER TABLE public.patients ADD COLUMN liver_disease boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'liver_disease_type') THEN
        ALTER TABLE public.patients ADD COLUMN liver_disease_type text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'covid19') THEN
        ALTER TABLE public.patients ADD COLUMN covid19 boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'covid19_date') THEN
        ALTER TABLE public.patients ADD COLUMN covid19_date text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'other_diseases') THEN
        ALTER TABLE public.patients ADD COLUMN other_diseases boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'other_diseases_details') THEN
        ALTER TABLE public.patients ADD COLUMN other_diseases_details text;
    END IF;
    
    -- Enfermedades recientes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'serious_illness_3_years') THEN
        ALTER TABLE public.patients ADD COLUMN serious_illness_3_years boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'serious_illness_details') THEN
        ALTER TABLE public.patients ADD COLUMN serious_illness_details text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'hospitalization_5_years') THEN
        ALTER TABLE public.patients ADD COLUMN hospitalization_5_years boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'hospitalization_details') THEN
        ALTER TABLE public.patients ADD COLUMN hospitalization_details text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'bleeding_treatment') THEN
        ALTER TABLE public.patients ADD COLUMN bleeding_treatment boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'bleeding_details') THEN
        ALTER TABLE public.patients ADD COLUMN bleeding_details text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'nervous_problems') THEN
        ALTER TABLE public.patients ADD COLUMN nervous_problems boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'nervous_problems_details') THEN
        ALTER TABLE public.patients ADD COLUMN nervous_problems_details text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'fainting') THEN
        ALTER TABLE public.patients ADD COLUMN fainting boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'fainting_details') THEN
        ALTER TABLE public.patients ADD COLUMN fainting_details text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'seizures') THEN
        ALTER TABLE public.patients ADD COLUMN seizures boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'seizures_details') THEN
        ALTER TABLE public.patients ADD COLUMN seizures_details text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'frequent_herpes') THEN
        ALTER TABLE public.patients ADD COLUMN frequent_herpes boolean DEFAULT false;
    END IF;
    
    -- Hábitos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'smoking') THEN
        ALTER TABLE public.patients ADD COLUMN smoking boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'cigarettes_per_day') THEN
        ALTER TABLE public.patients ADD COLUMN cigarettes_per_day text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'alcohol') THEN
        ALTER TABLE public.patients ADD COLUMN alcohol boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'alcohol_frequency') THEN
        ALTER TABLE public.patients ADD COLUMN alcohol_frequency text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'drugs') THEN
        ALTER TABLE public.patients ADD COLUMN drugs boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'drugs_details') THEN
        ALTER TABLE public.patients ADD COLUMN drugs_details text;
    END IF;
    
    -- Información específica para mujeres
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'last_period') THEN
        ALTER TABLE public.patients ADD COLUMN last_period date;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'menstrual_complications') THEN
        ALTER TABLE public.patients ADD COLUMN menstrual_complications boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'menstrual_complications_details') THEN
        ALTER TABLE public.patients ADD COLUMN menstrual_complications_details text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'birth_control') THEN
        ALTER TABLE public.patients ADD COLUMN birth_control boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'pregnancy') THEN
        ALTER TABLE public.patients ADD COLUMN pregnancy boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'abortions') THEN
        ALTER TABLE public.patients ADD COLUMN abortions text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'breastfeeding') THEN
        ALTER TABLE public.patients ADD COLUMN breastfeeding boolean DEFAULT false;
    END IF;
    
    -- Salud dental
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'bruxism') THEN
        ALTER TABLE public.patients ADD COLUMN bruxism boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'teeth_appearance') THEN
        ALTER TABLE public.patients ADD COLUMN teeth_appearance boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'bad_breath') THEN
        ALTER TABLE public.patients ADD COLUMN bad_breath boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'chewing_difficulty') THEN
        ALTER TABLE public.patients ADD COLUMN chewing_difficulty boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'anesthesia_reaction') THEN
        ALTER TABLE public.patients ADD COLUMN anesthesia_reaction boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'anesthesia_reaction_details') THEN
        ALTER TABLE public.patients ADD COLUMN anesthesia_reaction_details text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'recent_pain') THEN
        ALTER TABLE public.patients ADD COLUMN recent_pain boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'gum_bleeding') THEN
        ALTER TABLE public.patients ADD COLUMN gum_bleeding text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'jaw_clicking') THEN
        ALTER TABLE public.patients ADD COLUMN jaw_clicking text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'loose_teeth') THEN
        ALTER TABLE public.patients ADD COLUMN loose_teeth boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'food_between_teeth') THEN
        ALTER TABLE public.patients ADD COLUMN food_between_teeth boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'lip_biting') THEN
        ALTER TABLE public.patients ADD COLUMN lip_biting boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'object_biting') THEN
        ALTER TABLE public.patients ADD COLUMN object_biting boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'object_biting_details') THEN
        ALTER TABLE public.patients ADD COLUMN object_biting_details text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'mouth_breathing') THEN
        ALTER TABLE public.patients ADD COLUMN mouth_breathing boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'teeth_importance') THEN
        ALTER TABLE public.patients ADD COLUMN teeth_importance text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'dentist_comfort') THEN
        ALTER TABLE public.patients ADD COLUMN dentist_comfort text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'dentist_comfort_other') THEN
        ALTER TABLE public.patients ADD COLUMN dentist_comfort_other text;
    END IF;
    
    -- Entorno y hábitos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'education') THEN
        ALTER TABLE public.patients ADD COLUMN education text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'favorite_color') THEN
        ALTER TABLE public.patients ADD COLUMN favorite_color text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'physical_activity') THEN
        ALTER TABLE public.patients ADD COLUMN physical_activity boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'physical_activity_type') THEN
        ALTER TABLE public.patients ADD COLUMN physical_activity_type text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'brushings_per_day') THEN
        ALTER TABLE public.patients ADD COLUMN brushings_per_day text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'floss') THEN
        ALTER TABLE public.patients ADD COLUMN floss boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'mouthwash') THEN
        ALTER TABLE public.patients ADD COLUMN mouthwash boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'other_hygiene') THEN
        ALTER TABLE public.patients ADD COLUMN other_hygiene boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'other_hygiene_details') THEN
        ALTER TABLE public.patients ADD COLUMN other_hygiene_details text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'vaccination') THEN
        ALTER TABLE public.patients ADD COLUMN vaccination text;
    END IF;
    
    -- Antecedentes familiares
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'family_history') THEN
        ALTER TABLE public.patients ADD COLUMN family_history text;
    END IF;
    
    -- Firmas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'patient_signature') THEN
        ALTER TABLE public.patients ADD COLUMN patient_signature text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'date') THEN
        ALTER TABLE public.patients ADD COLUMN date date;
    END IF;
    
END $$;

-- Verificar que todas las columnas estén presentes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;
