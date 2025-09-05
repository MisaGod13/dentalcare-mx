import React from 'react'
import { Navigate } from 'react-router-dom'
import { Box, VStack, Text, Spinner } from '@chakra-ui/react'
import { useSession } from '../hooks/useSupabase'
import { useRoleRedirect } from '../hooks/useRoleRedirect'
import Layout from './Layout'
import PatientLayout from './PatientLayout'

export default function RouteGuard({ children, requireRole = null }) {
  const { session, loading } = useSession()
  const { userRole, loading: roleLoading } = useRoleRedirect()

  // Si está cargando, mostrar loading
  if (loading || roleLoading) {
    return (
      <Box 
        minH='100vh' 
        bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
        display='grid' 
        placeItems='center'
      >
        <VStack spacing={6}>
          <Spinner size="xl" color="white" thickness="4px" />
          <Text color="white" fontSize="xl" fontWeight="bold">
            Verificando permisos...
          </Text>
        </VStack>
      </Box>
    )
  }

  // Si no hay sesión, redirigir al login
  if (!session) {
    return <Navigate to="/login" replace />
  }

  // Si se requiere un rol específico, verificar
  if (requireRole && userRole !== requireRole) {
    // Redirigir basado en el rol actual
    if (userRole === 'patient') {
      return <Navigate to="/patient-dashboard" replace />
    } else if (userRole === 'dentist') {
      return <Navigate to="/dashboard" replace />
    }
  }

  // Renderizar con el layout correcto
  if (userRole === 'patient') {
    console.log('Renderizando PatientLayout para paciente')
    return <PatientLayout>{children}</PatientLayout>
  } else if (userRole === 'dentist') {
    console.log('Renderizando Layout para dentista')
    return <Layout>{children}</Layout>
  }

  // Rol no reconocido, redirigir al login
  return <Navigate to="/login" replace />
}
