import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Verificar configuración
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL no está configurada')
  throw new Error('VITE_SUPABASE_URL no está configurada en las variables de entorno')
}

if (!supabaseServiceKey) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY no está configurada')
  throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY no está configurada en las variables de entorno')
}

// Cliente con permisos de administrador para crear usuarios
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Función para crear usuario de paciente
export const createPatientUser = async (email, password, userData) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        role: 'patient',
        patient_id: userData.patient_id,
        name: userData.name,
        dentist_id: userData.dentist_id
      }
    })

    if (error) throw error

    return { success: true, user: data.user }
  } catch (error) {
    console.error('Error creating patient user:', error)
    return { success: false, error: error.message }
  }
}

// Función para actualizar perfil de paciente
export const updatePatientProfile = async (userId, patientId) => {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        role: 'patient',
        patient_id: patientId,
        is_active: true,
        created_at: new Date().toISOString()
      })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error updating patient profile:', error)
    return { success: false, error: error.message }
  }
}
