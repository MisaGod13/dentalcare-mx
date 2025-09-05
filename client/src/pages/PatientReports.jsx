import React, { useState, useEffect } from 'react'
import { Box, Heading, Text, VStack, HStack, Icon, useColorModeValue } from '@chakra-ui/react'
import { FiFileText, FiHeart, FiShield } from 'react-icons/fi'
import { supabase } from '../supabaseClient'
import PatientReportViewer from '../components/PatientReportViewer'
import PatientLayout from '../components/PatientLayout'

const PatientReports = () => {
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const cardBg = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    loadPatientData()
  }, [])

  const loadPatientData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('No user found')
        return
      }

      // Obtener el perfil del paciente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('patient_id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error loading profile:', profileError)
        return
      }

      if (!profile?.patient_id) {
        console.error('No patient ID found in profile')
        return
      }

      // Obtener datos del paciente
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', profile.patient_id)
        .single()

      if (patientError) {
        console.error('Error loading patient data:', patientError)
        return
      }

      setPatient(patientData)
    } catch (error) {
      console.error('Error loading patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PatientLayout>
        <Box textAlign="center" py={12}>
          <Icon as={FiFileText} boxSize={12} color="gray.400" mb={4} />
          <Text color="gray.500">Cargando tus informes médicos...</Text>
        </Box>
      </PatientLayout>
    )
  }

  if (!patient) {
    return (
      <PatientLayout>
        <Box textAlign="center" py={12}>
          <Icon as={FiFileText} boxSize={12} color="gray.400" mb={4} />
          <Heading size="md" color="gray.500" mb={2}>
            No se encontraron datos del paciente
          </Heading>
          <Text color="gray.400">
            Por favor, contacta con tu dentista para verificar tu cuenta
          </Text>
        </Box>
      </PatientLayout>
    )
  }

  return (
    <PatientLayout>
      <Box maxW="7xl" mx="auto" p={6}>
        <VStack spacing={8} align="stretch">
          {/* Header mejorado */}
          <Box textAlign="center" py={8}>
            <VStack spacing={4}>
              <HStack justify="center" spacing={4}>
                <Box
                  w="80px"
                  h="80px"
                  borderRadius="2xl"
                  bg="linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)"
                  display="grid"
                  placeItems="center"
                  boxShadow="0 10px 25px rgba(0, 180, 216, 0.3)"
                >
                  <Icon as={FiFileText} boxSize={10} color="white" />
                </Box>
                <VStack align="start" spacing={2}>
                  <Heading 
                    size="2xl" 
                    color="gray.800"
                    bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                    bgClip='text'
                    fontWeight='bold'
                  >
                    Mis Informes Médicos
                  </Heading>
                  <Text color="gray.600" fontSize="lg" maxW="2xl">
                    Accede a todos tus informes médicos generados por tu dentista
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Box>

          {/* Información de seguridad mejorada */}
          <Box 
            bg="linear-gradient(135deg, #EBF8FF 0%, #BEE3F8 100%)" 
            p={6} 
            borderRadius="2xl" 
            border="1px solid" 
            borderColor="blue.200"
            shadow="lg"
          >
            <HStack spacing={4}>
              <Box
                w="60px"
                h="60px"
                borderRadius="xl"
                bg="blue.500"
                display="grid"
                placeItems="center"
                boxShadow="0 5px 15px rgba(59, 130, 246, 0.3)"
              >
                <Icon as={FiShield} color="white" boxSize={6} />
              </Box>
              <VStack align="start" spacing={2} flex={1}>
                <Text fontWeight="bold" color="blue.800" fontSize="lg">
                  🔒 Información Confidencial y Segura
                </Text>
                <Text color="blue.700" fontSize="md">
                  Todos tus informes médicos están protegidos con encriptación de grado médico. 
                  Solo tú y tu dentista autorizado pueden acceder a esta información sensible.
                </Text>
                <HStack spacing={4} mt={2}>
                  <HStack spacing={1}>
                    <Icon as={FiShield} color="blue.600" boxSize={4} />
                    <Text fontSize="sm" color="blue.700" fontWeight="500">
                      Encriptación SSL
                    </Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Icon as={FiShield} color="blue.600" boxSize={4} />
                    <Text fontSize="sm" color="blue.700" fontWeight="500">
                      Acceso Restringido
                    </Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Icon as={FiShield} color="blue.600" boxSize={4} />
                    <Text fontSize="sm" color="blue.700" fontWeight="500">
                      Cumplimiento HIPAA
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </HStack>
          </Box>

          {/* Componente de visualización de informes */}
          <PatientReportViewer patientId={patient.id} patientData={patient} />

          {/* Footer informativo mejorado */}
          <Box 
            bg="linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%)" 
            p={8} 
            borderRadius="2xl" 
            textAlign="center"
            border="1px solid"
            borderColor="gray.200"
            shadow="lg"
          >
            <VStack spacing={4}>
              <HStack justify="center" spacing={3}>
                <Icon as={FiHeart} color="red.500" boxSize={6} />
                <Text fontWeight="bold" color="gray.700" fontSize="lg">
                  Tu salud dental es nuestra prioridad
                </Text>
              </HStack>
              <Text fontSize="md" color="gray.600" maxW="2xl" mx="auto">
                Si tienes preguntas sobre alguno de tus informes médicos, necesitas 
                aclaraciones sobre tu tratamiento, o quieres programar una consulta de seguimiento, 
                no dudes en contactar con tu dentista.
              </Text>
              <HStack spacing={6} mt={4}>
                <HStack spacing={2}>
                  <Icon as={FiFileText} color="blue.500" boxSize={4} />
                  <Text fontSize="sm" color="gray.600">
                    Informes actualizados regularmente
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FiShield} color="green.500" boxSize={4} />
                  <Text fontSize="sm" color="gray.600">
                    Información segura y privada
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FiHeart} color="red.500" boxSize={4} />
                  <Text fontSize="sm" color="gray.600">
                    Cuidado personalizado
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </PatientLayout>
  )
}

export default PatientReports
