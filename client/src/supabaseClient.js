import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificar configuración
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL no está configurada')
  throw new Error('VITE_SUPABASE_URL no está configurada en las variables de entorno')
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY no está configurada')
  throw new Error('VITE_SUPABASE_ANON_KEY no está configurada en las variables de entorno')
}

console.log('✅ Configuración de Supabase detectada:')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? 'Configurada' : 'No configurada')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función de prueba de conexión
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Error de conexión:', error)
      return { success: false, error }
    }
    
    console.log('✅ Conexión exitosa')
    return { success: true, data }
  } catch (err) {
    console.error('💥 Error de conexión:', err)
    return { success: false, error: err }
  }
}
