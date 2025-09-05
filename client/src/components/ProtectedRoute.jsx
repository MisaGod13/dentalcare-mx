import { Navigate } from 'react-router-dom'
import { Box, Spinner, Center, Text, VStack } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useSession } from '../hooks/useSupabase'
import { useRoleRedirect } from '../hooks/useRoleRedirect'
import Layout from './Layout'

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`

export default function ProtectedRoute({ children }){
  const { session, loading } = useSession()
  const { userRole, loading: roleLoading, redirecting } = useRoleRedirect()
  
  console.log('ProtectedRoute - Session:', session, 'Loading:', loading)
  console.log('ProtectedRoute - User Role:', userRole, 'Role Loading:', roleLoading, 'Redirecting:', redirecting)
  console.log('ProtectedRoute - Children:', children)
  
  // Si está cargando la sesión o el rol, mostrar loading
  if (loading || roleLoading || redirecting) {
    console.log('ProtectedRoute - Still loading, waiting...')
    return (
      <Box 
        minH='100vh' 
        bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
        display='grid' 
        placeItems='center'
        position='relative'
        overflow='hidden'
      >
        {/* Elementos decorativos de fondo */}
        <Box
          position='absolute'
          top='20%'
          left='10%'
          w='100px'
          h='100px'
          borderRadius='50%'
          bg='rgba(255,255,255,0.1)'
          animation={`${float} 3s ease-in-out infinite`}
        />
        <Box
          position='absolute'
          bottom='20%'
          right='10%'
          w='80px'
          h='80px'
          borderRadius='50%'
          bg='rgba(255,255,255,0.1)'
          animation={`${float} 3s ease-in-out infinite 1.5s`}
        />
        
        <VStack spacing={6} zIndex={1}>
          <Box
            position='relative'
            animation={`${pulse} 2s ease-in-out infinite`}
          >
            <Box
              w='120px'
              h='120px'
              borderRadius='50%'
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              display='grid'
              placeItems='center'
              boxShadow='0 20px 40px rgba(0,0,0,0.3)'
              border='4px solid rgba(255,255,255,0.2)'
            >
              <Spinner 
                size='xl' 
                color='white' 
                thickness='4px'
                speed='0.8s'
              />
            </Box>
          </Box>
          
          <VStack spacing={2}>
            <Text 
              color='white' 
              fontSize='2xl' 
              fontWeight='bold'
              textShadow='0 2px 4px rgba(0,0,0,0.3)'
            >
              Verificando sesión
            </Text>
            <Text 
              color='rgba(255,255,255,0.8)' 
              fontSize='md'
              textAlign='center'
            >
              Preparando tu panel de trabajo...
            </Text>
          </VStack>
        </VStack>
      </Box>
    )
  }
  
  if (session === null) {
    console.log('ProtectedRoute - Redirecting to login, session is null')
    return <Navigate to='/login'/>
  }
  
  console.log('ProtectedRoute - Rendering protected content')
  return <Layout>{children}</Layout>
}