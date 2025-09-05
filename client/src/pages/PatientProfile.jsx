import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  useColorModeValue,
  Container,
  Alert,
  AlertIcon,
  Spinner,
  Grid,
  GridItem,
  Badge,
  Divider,
  Card,
  CardBody,
  CardHeader,
  Icon,
  useToast
} from '@chakra-ui/react'
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiHeart,
  FiShield,
  FiActivity,
  FiSmile
} from 'react-icons/fi'
import { supabase } from '../supabaseClient'

export default function PatientProfile() {
  const [patientData, setPatientData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const toast = useToast()

  useEffect(() => {
    fetchPatientData()
  }, [])

  const fetchPatientData = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Usuario no autenticado')
        return
      }

      // Obtener el perfil del usuario
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

      // Obtener la información completa del paciente
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', profile.patient_id)
        .single()

      if (patientError) {
        setError('No se pudo obtener la información del paciente')
        return
      }

      setPatientData(patient)
      
    } catch (error) {
      console.error('Error fetching patient data:', error)
      setError('Error al cargar la información del paciente')
    } finally {
      setLoading(false)
    }
  }

  const getHealthStatus = () => {
    if (!patientData) return 'Desconocido'
    
    const conditions = [
      patientData.diabetes,
      patientData.high_blood_pressure,
      patientData.heart_attack,
      patientData.asthma,
      patientData.covid19
    ].filter(Boolean)
    
    if (conditions.length === 0) return 'Excelente'
    if (conditions.length <= 2) return 'Buena'
    return 'Requiere atención'
  }

  const getDentalHealth = () => {
    if (!patientData) return 'Desconocido'
    
    const conditions = [
      patientData.bruxism,
      patientData.bad_breath,
      patientData.chewing_difficulty,
      patientData.recent_pain,
      patientData.gum_bleeding
    ].filter(Boolean)
    
    if (conditions.length === 0) return 'Excelente'
    if (conditions.length <= 2) return 'Buena'
    return 'Requiere atención'
  }

  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando perfil del paciente...</Text>
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
              <Heading size="md">Error al cargar el perfil</Heading>
              <Text>{error}</Text>
            </VStack>
          </Alert>
        </Container>
      </Box>
    )
  }

  if (!patientData) {
    return (
      <Box bg={bgColor} minH="100vh" p={6}>
        <Container maxW="4xl">
          <Alert status="warning">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <Heading size="md">Perfil no encontrado</Heading>
              <Text>No se pudo cargar la información del paciente.</Text>
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
          {/* Header */}
          <Box textAlign="center">
            <Heading size="xl" color="gray.700" mb={2}>
              <Icon as={FiUser} mr={3} />
              Mi Perfil de Paciente
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Información personal y médica
            </Text>
          </Box>

          {/* Información Personal */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardHeader>
              <HStack>
                <Icon as={FiUser} color="blue.500" />
                <Heading size="md">Información Personal</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <GridItem>
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Icon as={FiUser} color="gray.500" />
                      <Text fontWeight="bold">Nombre:</Text>
                      <Text>{patientData.name}</Text>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FiMail} color="gray.500" />
                      <Text fontWeight="bold">Email:</Text>
                      <Text>{patientData.email || 'No especificado'}</Text>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FiPhone} color="gray.500" />
                      <Text fontWeight="bold">Teléfono:</Text>
                      <Text>{patientData.phone || 'No especificado'}</Text>
                    </HStack>
                  </VStack>
                </GridItem>
                
                <GridItem>
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Icon as={FiCalendar} color="gray.500" />
                      <Text fontWeight="bold">Edad:</Text>
                      <Text>{patientData.age || 'No especificada'} años</Text>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FiMapPin} color="gray.500" />
                      <Text fontWeight="bold">Ocupación:</Text>
                      <Text>{patientData.occupation || 'No especificada'}</Text>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FiActivity} color="gray.500" />
                      <Text fontWeight="bold">Estado Civil:</Text>
                      <Text>{patientData.marital_status || 'No especificado'}</Text>
                    </HStack>
                  </VStack>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          {/* Estado de Salud General */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardHeader>
              <HStack>
                <Icon as={FiHeart} color="red.500" />
                <Heading size="md">Estado de Salud General</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Text fontWeight="bold">Estado General:</Text>
                  <Badge 
                    colorScheme={getHealthStatus() === 'Excelente' ? 'green' : getHealthStatus() === 'Buena' ? 'blue' : 'orange'}
                    variant="subtle"
                  >
                    {getHealthStatus()}
                  </Badge>
                </HStack>
                
                <Divider />
                
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="full">
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" color="gray.700">Condiciones Médicas:</Text>
                    <VStack align="start" spacing={1}>
                      {patientData.diabetes && (
                        <HStack>
                          <Icon as={FiShield} color="orange.500" />
                          <Text fontSize="sm">Diabetes</Text>
                        </HStack>
                      )}
                      {patientData.high_blood_pressure && (
                        <HStack>
                          <Icon as={FiShield} color="red.500" />
                          <Text fontSize="sm">Presión Alta</Text>
                        </HStack>
                      )}
                      {patientData.heart_attack && (
                        <HStack>
                          <Icon as={FiHeart} color="red.500" />
                          <Text fontSize="sm">Infarto Previo</Text>
                        </HStack>
                      )}
                      {patientData.asthma && (
                        <HStack>
                          <Icon as={FiActivity} color="blue.500" />
                          <Text fontSize="sm">Asma</Text>
                        </HStack>
                      )}
                      {patientData.covid19 && (
                        <HStack>
                          <Icon as={FiShield} color="purple.500" />
                          <Text fontSize="sm">COVID-19</Text>
                        </HStack>
                      )}
                      {!patientData.diabetes && !patientData.high_blood_pressure && 
                       !patientData.heart_attack && !patientData.asthma && !patientData.covid19 && (
                        <Text fontSize="sm" color="gray.500">Ninguna condición reportada</Text>
                      )}
                    </VStack>
                  </VStack>
                  
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" color="gray.700">Alergias:</Text>
                    <Text fontSize="sm">
                      {patientData.allergies ? (patientData.allergy_details || 'Sí, sin detalles específicos') : 'Ninguna reportada'}
                    </Text>
                  </VStack>
                </Grid>
              </VStack>
            </CardBody>
          </Card>

          {/* Salud Dental */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardHeader>
              <HStack>
                <Icon as={FiSmile} color="teal.500" />
                <Heading size="md">Salud Dental</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Text fontWeight="bold">Estado Dental:</Text>
                  <Badge 
                    colorScheme={getDentalHealth() === 'Excelente' ? 'green' : getDentalHealth() === 'Buena' ? 'blue' : 'orange'}
                    variant="subtle"
                  >
                    {getDentalHealth()}
                  </Badge>
                </HStack>
                
                <Divider />
                
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="full">
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" color="gray.700">Condiciones Dentales:</Text>
                    <VStack align="start" spacing={1}>
                      {patientData.bruxism && (
                        <HStack>
                          <Icon as={FiShield} color="orange.500" />
                          <Text fontSize="sm">Bruxismo</Text>
                        </HStack>
                      )}
                      {patientData.bad_breath && (
                        <HStack>
                          <Icon as={FiShield} color="yellow.500" />
                          <Text fontSize="sm">Mal Aliento</Text>
                        </HStack>
                      )}
                      {patientData.chewing_difficulty && (
                        <HStack>
                          <Icon as={FiShield} color="red.500" />
                          <Text fontSize="sm">Dificultad para Masticar</Text>
                        </HStack>
                      )}
                      {patientData.recent_pain && (
                        <HStack>
                          <Icon as={FiHeart} color="red.500" />
                          <Text fontSize="sm">Dolor Reciente</Text>
                        </HStack>
                      )}
                      {patientData.gum_bleeding && (
                        <HStack>
                          <Icon as={FiShield} color="red.500" />
                          <Text fontSize="sm">Sangrado de Encías</Text>
                        </HStack>
                      )}
                      {!patientData.bruxism && !patientData.bad_breath && 
                       !patientData.chewing_difficulty && !patientData.recent_pain && !patientData.gum_bleeding && (
                        <Text fontSize="sm" color="gray.500">Ninguna condición reportada</Text>
                      )}
                    </VStack>
                  </VStack>
                  
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" color="gray.700">Hábitos de Higiene:</Text>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm">Cepillados por día: {patientData.brushings_per_day || 'No especificado'}</Text>
                      {patientData.floss && (
                        <HStack>
                          <Icon as={FiShield} color="green.500" />
                          <Text fontSize="sm">Usa Hilo Dental</Text>
                        </HStack>
                      )}
                      {patientData.mouthwash && (
                        <HStack>
                          <Icon as={FiShield} color="green.500" />
                          <Text fontSize="sm">Usa Enjuague Bucal</Text>
                        </HStack>
                      )}
                    </VStack>
                  </VStack>
                </Grid>
              </VStack>
            </CardBody>
          </Card>

          {/* Información Adicional */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Información Adicional</Heading>
            </CardHeader>
            <CardBody>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <VStack align="start" spacing={3}>
                  <Text fontWeight="bold" color="gray.700">Hábitos:</Text>
                  <VStack align="start" spacing={1}>
                    {patientData.smoking && (
                      <Text fontSize="sm">
                        Fumar: {patientData.cigarettes_per_day || 'cantidad no especificada'} cigarrillos por día
                      </Text>
                    )}
                    {patientData.alcohol && (
                      <Text fontSize="sm">
                        Alcohol: {patientData.alcohol_frequency || 'frecuencia no especificada'}
                      </Text>
                    )}
                    {patientData.physical_activity && (
                      <Text fontSize="sm">
                        Actividad Física: {patientData.physical_activity_type || 'tipo no especificado'}
                      </Text>
                    )}
                    {!patientData.smoking && !patientData.alcohol && !patientData.physical_activity && (
                      <Text fontSize="sm" color="gray.500">Ningún hábito reportado</Text>
                    )}
                  </VStack>
                </VStack>
                
                <VStack align="start" spacing={3}>
                  <Text fontWeight="bold" color="gray.700">Reacciones:</Text>
                  <VStack align="start" spacing={1}>
                    {patientData.anesthesia_reaction && (
                      <Text fontSize="sm">
                        Reacción a Anestesia: {patientData.anesthesia_reaction_details || 'sin detalles'}
                      </Text>
                    )}
                    {!patientData.anesthesia_reaction && (
                      <Text fontSize="sm" color="gray.500">Ninguna reacción reportada</Text>
                    )}
                  </VStack>
                </VStack>
              </Grid>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}
