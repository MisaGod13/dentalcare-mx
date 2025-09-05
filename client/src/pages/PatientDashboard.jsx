import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Badge,
  Button,
  useToast,
  Alert,
  AlertIcon,
  Icon,
  Flex,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  List,
  ListItem,
  ListIcon,
  Divider,
  useColorModeValue,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow
} from '@chakra-ui/react'
import { 
  FiUser, 
  FiCalendar,
  FiFileText, 
  FiBell,
  FiHeart,
  FiShield,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
  FiDroplet,
  FiThermometer
} from 'react-icons/fi'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function PatientDashboard() {
  const [patientData, setPatientData] = useState(null)
  const [medicalHistory, setMedicalHistory] = useState([])
  const [diagnoses, setDiagnoses] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [notifications, setNotifications] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalConsultations: 0,
    pendingAppointments: 0,
    unreadNotifications: 0,
    activeRecommendations: 0
  })
  
  const toast = useToast()
  const navigate = useNavigate()
  
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    fetchPatientData()
  }, [])

  const fetchPatientData = async () => {
    try {
      setLoading(true)
      
      // Obtener información del paciente actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Obtener perfil del paciente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error al obtener perfil:', profileError)
        throw new Error('No se pudo obtener el perfil del usuario')
      }

      if (!profile) {
        throw new Error('Perfil de usuario no encontrado')
      }

      if (profile.role !== 'patient') {
        throw new Error('Acceso denegado. Solo los pacientes pueden usar esta página.')
      }

      if (!profile.patient_id) {
        console.error('Perfil sin patient_id:', profile)
        throw new Error('Perfil de paciente incompleto. Contacta a tu dentista.')
      }

      // Obtener datos del paciente
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', profile.patient_id)
        .single()

      if (patientError) {
        console.error('Error al obtener datos del paciente:', patientError)
        if (patientError.code === 'PGRST116') {
          throw new Error('No se encontraron datos del paciente. Contacta a tu dentista.')
        }
        throw new Error('Error al cargar datos del paciente')
      }

      if (!patient) {
        throw new Error('Datos del paciente no encontrados')
      }

      setPatientData(patient)

      // Obtener historial médico
      try {
      const { data: history, error: historyError } = await supabase
        .rpc('get_patient_medical_history_for_patient', {
          patient_uuid: profile.patient_id
        })

        if (!historyError) {
      setMedicalHistory(history || [])
        }
      } catch (error) {
        console.warn('No se pudo cargar historial médico:', error)
      }

      // Obtener diagnósticos
      try {
      const { data: diagnosesData, error: diagnosesError } = await supabase
        .rpc('get_patient_diagnoses_for_patient', {
          patient_uuid: profile.patient_id
        })

        if (!diagnosesError) {
      setDiagnoses(diagnosesData || [])
        }
      } catch (error) {
        console.warn('No se pudo cargar diagnósticos:', error)
      }

      // Obtener recomendaciones
      try {
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .rpc('get_patient_recommendations', {
          patient_uuid: profile.patient_id
        })

        if (!recommendationsError) {
      setRecommendations(recommendationsData || [])
        }
      } catch (error) {
        console.warn('No se pudo cargar recomendaciones:', error)
      }

      // Obtener notificaciones
      try {
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('patient_notifications')
        .select('*')
        .eq('patient_id', profile.patient_id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })

        if (!notificationsError) {
      setNotifications(notificationsData || [])
        }
      } catch (error) {
        console.warn('No se pudo cargar notificaciones:', error)
      }

      // Obtener citas
      try {
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', profile.patient_id)
          .gte('appointment_date', new Date().toISOString())
          .order('appointment_date', { ascending: true })

        if (!appointmentsError) {
          setAppointments(appointmentsData || [])
        }
      } catch (error) {
        console.warn('No se pudo cargar citas:', error)
      }

      // Calcular estadísticas
      setStats({
        totalConsultations: medicalHistory.length || 0,
        pendingAppointments: appointments.filter(a => a.status === 'pending').length || 0,
        unreadNotifications: notifications.length || 0,
        activeRecommendations: recommendations.filter(r => r.status === 'active').length || 0
      })

    } catch (error) {
      console.error('Error fetching patient data:', error)
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar los datos del paciente',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    const severityColors = {
      'leve': 'green',
      'moderado': 'yellow',
      'grave': 'orange',
      'crítico': 'red'
    }
    return severityColors[severity] || 'gray'
  }

  const getPriorityColor = (priority) => {
    const priorityColors = {
      'baja': 'green',
      'normal': 'blue',
      'alta': 'orange',
      'urgente': 'red'
    }
    return priorityColors[priority] || 'gray'
  }

  const getRecommendationIcon = (type) => {
    const typeIcons = {
      'higiene': '🦷',
      'dieta': '🍎',
      'estilo_vida': '🏃‍♂️',
      'seguimiento': '📋',
      'emergencia': '🚨'
    }
    return typeIcons[type] || '📝'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando tu información médica...</Text>
        </VStack>
      </Box>
    )
  }

  if (!patientData) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          No se pudo cargar la información del paciente
        </Alert>
      </Box>
    )
  }

  return (
    <Box bg={bgColor} minH="100vh" p={6}>
      <Container maxW="7xl">
      <VStack spacing={6} align="stretch">
        {/* Header del paciente */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody p={8}>
              <HStack spacing={6} align="center">
            <Box
                  w="80px"
                  h="80px"
              borderRadius="full"
              bg="linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)"
              display="grid"
              placeItems="center"
            >
                  <Icon as={FiUser} color="white" boxSize={10} />
            </Box>
                <VStack align="start" spacing={2} flex={1}>
                  <Heading size="lg" color="gray.700">
                    ¡Hola, {patientData.name}!
              </Heading>
                  <Text color="gray.600" fontSize="lg">
                    Bienvenido a tu panel de control de salud dental
              </Text>
                  <HStack spacing={4}>
                    <Badge colorScheme="blue" variant="subtle">
                      Paciente Activo
                    </Badge>
                    <Badge colorScheme="green" variant="subtle">
                      {patientData.email}
                    </Badge>
                  </HStack>
            </VStack>
                <Button
                  leftIcon={<FiCalendar />}
                  colorScheme="blue"
                  onClick={() => navigate('/patient-appointments')}
                >
                  Agendar Cita
                </Button>
                </HStack>
            </CardBody>
          </Card>

        {/* Estadísticas rápidas */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardBody p={6}>
              <Stat>
                  <StatLabel color="gray.600">Consultas Totales</StatLabel>
                  <StatNumber color="blue.600">{stats.totalConsultations}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Historial completo
                  </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardBody p={6}>
              <Stat>
                  <StatLabel color="gray.600">Citas Pendientes</StatLabel>
                  <StatNumber color="orange.600">{stats.pendingAppointments}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    Próximas visitas
                  </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardBody p={6}>
              <Stat>
                  <StatLabel color="gray.600">Notificaciones</StatLabel>
                  <StatNumber color="red.600">{stats.unreadNotifications}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Sin leer
                  </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardBody p={6}>
              <Stat>
                  <StatLabel color="gray.600">Recomendaciones</StatLabel>
                  <StatNumber color="green.600">{stats.activeRecommendations}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Activas
                  </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          </SimpleGrid>

          {/* Contenido principal con tabs */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FiActivity} />
                    <Text>Resumen</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FiFileText} />
                    <Text>Historial Médico</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FiHeart} />
                    <Text>Diagnósticos</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FiShield} />
                    <Text>Recomendaciones</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FiCalendar} />
                    <Text>Citas</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FiBell} />
                    <Text>Notificaciones</Text>
                    {notifications.length > 0 && (
                      <Badge colorScheme="red" variant="solid" borderRadius="full">
                        {notifications.length}
                      </Badge>
                    )}
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Tab Resumen */}
                <TabPanel p={6}>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md" color="gray.700">
                      Resumen de tu Salud Dental
                    </Heading>
                    
                    {/* Próxima cita */}
                    {appointments.length > 0 && (
                      <Card bg="blue.50" borderColor="blue.200">
                        <CardBody p={6}>
                          <HStack spacing={4}>
                            <Icon as={FiCalendar} color="blue.500" boxSize={6} />
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight="bold" color="blue.700">
                                Próxima Cita
                              </Text>
                              <Text color="blue.600">
                                {formatDate(appointments[0].appointment_date)}
                              </Text>
                            </VStack>
                            <Badge colorScheme="blue" variant="solid">
                              {appointments[0].status}
                            </Badge>
                          </HStack>
                        </CardBody>
                      </Card>
                    )}

                    {/* Última consulta */}
                    {medicalHistory.length > 0 && (
                      <Card bg="green.50" borderColor="green.200">
                        <CardBody p={6}>
                          <HStack spacing={4}>
                            <Icon as={FiFileText} color="green.500" boxSize={6} />
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight="bold" color="green.700">
                                Última Consulta
                              </Text>
                              <Text color="green.600">
                                {formatDate(medicalHistory[0].consultation_date)}
                              </Text>
                            </VStack>
                            <Badge colorScheme="green" variant="solid">
                              Completada
                            </Badge>
                          </HStack>
                        </CardBody>
                      </Card>
                    )}

                    {/* Recomendaciones activas */}
                    {recommendations.filter(r => r.status === 'active').length > 0 && (
                      <Card bg="orange.50" borderColor="orange.200">
                        <CardBody p={6}>
                          <HStack spacing={4}>
                            <Icon as={FiShield} color="orange.500" boxSize={6} />
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight="bold" color="orange.700">
                                Recomendaciones Activas
                              </Text>
                              <Text color="orange.600">
                                {recommendations.filter(r => r.status === 'active').length} recomendaciones pendientes
                              </Text>
                            </VStack>
                            <Button
                              size="sm"
                              colorScheme="orange"
                              variant="outline"
                              onClick={() => document.querySelector('[data-tab="3"]').click()}
                            >
                              Ver Todas
                            </Button>
                          </HStack>
                        </CardBody>
                      </Card>
                    )}
                  </VStack>
                </TabPanel>

                {/* Tab Historial Médico */}
                <TabPanel p={6}>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color="gray.700">
                      Historial Médico
                    </Heading>
                    
                    {medicalHistory.length === 0 ? (
                      <Alert status="info">
                        <AlertIcon />
                        No hay consultas registradas en tu historial médico.
                      </Alert>
                    ) : (
                      <VStack spacing={4} align="stretch">
                          {medicalHistory.map((consultation, index) => (
                          <Card key={index} bg="gray.50" borderColor="gray.200">
                            <CardBody p={4}>
                              <VStack align="start" spacing={2}>
                                <HStack justify="space-between" w="100%">
                                  <Text fontWeight="bold" color="gray.700">
                                    Consulta #{consultation.id}
                                  </Text>
                                  <Badge colorScheme="green" variant="solid">
                                    Completada
                                  </Badge>
                                </HStack>
                                <Text color="gray.600">
                                  <strong>Fecha:</strong> {formatDate(consultation.consultation_date)}
                                </Text>
                                {consultation.diagnosis && (
                                  <Text color="gray.600">
                                    <strong>Diagnóstico:</strong> {consultation.diagnosis}
                                </Text>
                                )}
                                {consultation.treatment && (
                                  <Text color="gray.600">
                                    <strong>Tratamiento:</strong> {consultation.treatment}
                                  </Text>
                                )}
                              </VStack>
                            </CardBody>
                          </Card>
                          ))}
                      </VStack>
                    )}
                  </VStack>
                </TabPanel>

                {/* Tab Diagnósticos */}
                <TabPanel p={6}>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color="gray.700">
                      Diagnósticos Médicos
                    </Heading>
                    
                    {diagnoses.length === 0 ? (
                      <Alert status="info">
                        <AlertIcon />
                        No hay diagnósticos registrados.
                      </Alert>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        {diagnoses.map((diagnosis, index) => (
                          <Card key={index} bg="red.50" borderColor="red.200">
                            <CardBody p={4}>
                              <VStack align="start" spacing={2}>
                                <HStack justify="space-between" w="100%">
                                  <Text fontWeight="bold" color="red.700">
                                    {diagnosis.condition_name}
                                  </Text>
                                  <Badge colorScheme={getSeverityColor(diagnosis.severity)} variant="solid">
                                    {diagnosis.severity}
                                  </Badge>
                                </HStack>
                                <Text color="red.600">
                                  <strong>Fecha:</strong> {formatDate(diagnosis.diagnosis_date)}
                                </Text>
                                {diagnosis.description && (
                                  <Text color="red.600">
                                    <strong>Descripción:</strong> {diagnosis.description}
                                  </Text>
                                )}
                                {diagnosis.treatment_plan && (
                                  <Text color="red.600">
                                    <strong>Plan de Tratamiento:</strong> {diagnosis.treatment_plan}
                                  </Text>
                                )}
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    )}
                  </VStack>
                </TabPanel>

                {/* Tab Recomendaciones */}
                <TabPanel p={6}>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color="gray.700">
                      Recomendaciones de Salud
                    </Heading>
                    
                    {recommendations.length === 0 ? (
                      <Alert status="info">
                        <AlertIcon />
                        No hay recomendaciones activas.
                      </Alert>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        {recommendations.map((recommendation, index) => (
                          <Card key={index} bg="orange.50" borderColor="orange.200">
                            <CardBody p={4}>
                              <VStack align="start" spacing={2}>
                                <HStack justify="space-between" w="100%">
                                  <HStack spacing={2}>
                                    <Text fontSize="2xl">{getRecommendationIcon(recommendation.type)}</Text>
                                    <Text fontWeight="bold" color="orange.700">
                                      {recommendation.title}
                                    </Text>
                                  </HStack>
                                  <Badge colorScheme={getPriorityColor(recommendation.priority)} variant="solid">
                                    {recommendation.priority}
                                  </Badge>
                                </HStack>
                                <Text color="orange.600">
                                  <strong>Tipo:</strong> {recommendation.type}
                                </Text>
                                <Text color="orange.600">
                                  <strong>Descripción:</strong> {recommendation.description}
                                </Text>
                                {recommendation.instructions && (
                                  <Text color="orange.600">
                                    <strong>Instrucciones:</strong> {recommendation.instructions}
                                  </Text>
                                )}
                                <Text color="orange.600">
                                  <strong>Fecha:</strong> {formatDate(recommendation.created_at)}
                                </Text>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    )}
                  </VStack>
                </TabPanel>

                {/* Tab Citas */}
                <TabPanel p={6}>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between" w="100%">
                      <Heading size="md" color="gray.700">
                        Citas Programadas
                      </Heading>
                      <Button
                        leftIcon={<FiCalendar />}
                        colorScheme="blue"
                        size="sm"
                        onClick={() => navigate('/patient-appointments')}
                      >
                        Agendar Nueva Cita
                      </Button>
                    </HStack>
                    
                    {appointments.length === 0 ? (
                      <Alert status="info">
                        <AlertIcon />
                        No tienes citas programadas.
                      </Alert>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        {appointments.map((appointment, index) => (
                          <Card key={index} bg="blue.50" borderColor="blue.200">
                            <CardBody p={4}>
                              <VStack align="start" spacing={2}>
                                <HStack justify="space-between" w="100%">
                                  <Text fontWeight="bold" color="blue.700">
                                    Cita #{appointment.id}
                                  </Text>
                                  <Badge colorScheme="blue" variant="solid">
                                    {appointment.status}
                                  </Badge>
                                </HStack>
                                <Text color="blue.600">
                                  <strong>Fecha y Hora:</strong> {formatDate(appointment.appointment_date)}
                                  </Text>
                                {appointment.notes && (
                                  <Text color="blue.600">
                                    <strong>Notas:</strong> {appointment.notes}
                                    </Text>
                                  )}
                                <HStack spacing={4}>
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    variant="outline"
                                    leftIcon={<FiClock />}
                                  >
                                    Ver Detalles
                                  </Button>
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="outline"
                                  >
                                    Cancelar
                                  </Button>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    )}
                  </VStack>
                </TabPanel>

                {/* Tab Notificaciones */}
                <TabPanel p={6}>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color="gray.700">
                      Notificaciones
                    </Heading>
                    
                    {notifications.length === 0 ? (
                      <Alert status="info">
                        <AlertIcon />
                        No tienes notificaciones sin leer.
                      </Alert>
                    ) : (
                  <VStack spacing={4} align="stretch">
                        {notifications.map((notification, index) => (
                          <Card key={index} bg="red.50" borderColor="red.200">
                            <CardBody p={4}>
                              <VStack align="start" spacing={2}>
                                <HStack justify="space-between" w="100%">
                                  <Text fontWeight="bold" color="red.700">
                                    {notification.title}
                                  </Text>
                                  <Badge colorScheme="red" variant="solid">
                                    Nuevo
                                  </Badge>
                                </HStack>
                                <Text color="red.600">
                                  {notification.message}
                                </Text>
                                <Text color="red.500" fontSize="sm">
                                  {formatDate(notification.created_at)}
                    </Text>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="outline"
                                  leftIcon={<FiCheckCircle />}
                                >
                                  Marcar como Leída
                                </Button>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Card>

          {/* Acciones rápidas */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color="gray.700">
                Acciones Rápidas
              </Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Button
                  leftIcon={<FiCalendar />}
                  colorScheme="blue"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/patient-appointments')}
                  w="100%"
                >
                  Agendar Cita
                </Button>
                <Button
                  leftIcon={<FiFileText />}
                  colorScheme="green"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/patient-history')}
                  w="100%"
                >
                  Ver Historial Completo
                </Button>
                <Button
                  leftIcon={<FiBell />}
                  colorScheme="orange"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/patient-chat')}
                  w="100%"
                >
                  Chat con IA
                </Button>
              </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>
      </Container>
    </Box>
  )
}

