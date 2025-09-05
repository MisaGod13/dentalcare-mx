import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Container,
  Alert,
  AlertIcon,
  Spinner
} from '@chakra-ui/react'
import { supabase } from '../supabaseClient'
import PatientChatAssistant from '../components/PatientChatAssistant'

export default function PatientChat() {
  const [patientId, setPatientId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  useEffect(() => {
    fetchPatientId()
  }, [])

  const fetchPatientId = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Usuario no autenticado')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('patient_id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        setError('No se pudo obtener el perfil del usuario')
        return
      }

      if (!profile?.patient_id) {
        setError('Perfil de paciente incompleto')
        return
      }

      setPatientId(profile.patient_id)
      
    } catch (error) {
      console.error('Error fetching patient ID:', error)
      setError('Error al cargar la información del paciente')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando chat...</Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box bg={bgColor} minH="100vh" p={6}>
        <Container maxW="4xl">
          <Alert status="error">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <Heading size="md">Error al cargar el chat</Heading>
              <Text>{error}</Text>
            </VStack>
          </Alert>
        </Container>
      </Box>
    )
  }

  if (!patientId) {
    return (
      <Box bg={bgColor} minH="100vh" p={6}>
        <Container maxW="4xl">
          <Alert status="warning">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <Heading size="md">Perfil incompleto</Heading>
              <Text>No se pudo identificar tu perfil de paciente. Contacta a tu dentista.</Text>
            </VStack>
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Box bg={bgColor} minH="100vh" p={6}>
      <Container maxW="6xl">
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="xl" color="gray.700" mb={2}>
              <span className="emoji-original">💬</span> Chat con Asistente Virtual
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Tu asistente personalizado de salud dental está listo para ayudarte
            </Text>
          </Box>
          
          <PatientChatAssistant patientId={patientId} />
        </VStack>
      </Container>
    </Box>
  )
}
