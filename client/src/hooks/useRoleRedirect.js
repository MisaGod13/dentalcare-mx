import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export function useRoleRedirect() {
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        setLoading(true)
        
        // Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          setLoading(false)
          return
        }

        // Obtener perfil del usuario
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, patient_id')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error al obtener perfil:', profileError)
          setLoading(false)
          return
        }

        if (profile) {
          setUserRole(profile.role)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error al verificar rol de usuario:', error)
        setLoading(false)
      }
    }

    checkUserRole()
  }, [])

  return { userRole, loading }
}
