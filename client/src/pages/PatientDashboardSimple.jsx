import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Grid, 
  Heading, 
  Card, 
  CardBody, 
  Stat, 
  StatLabel, 
  StatNumber, 
  Button, 
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  Badge,
  Flex,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  Spinner,
  SimpleGrid,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { 
  FiCalendar, 
  FiClock, 
  FiHeart, 
  FiShield, 
  FiMessageSquare,
  FiFileText,
  FiUser,
  FiBell,
  FiPlus,
  FiTrendingUp,
  FiActivity,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi'

const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`

export default function PatientDashboardSimple() {
  const [patientData, setPatientData] = useState(null)
  const [medicalHistory, setMedicalHistory] = useState([])
  const [diagnoses, setDiagnoses] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [appointments, setAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    activeRecommendations: 0
  })
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  useEffect(() => {
    fetchPatientData()
  }, [])

  const fetchPatientData = async () => {
    try {
      setLoading(true)
      
      // Obtener usuario autenticado
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Obtener perfil del paciente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('patient_id')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      if (!profile?.patient_id) throw new Error('Perfil de paciente incompleto')

      // Obtener datos del paciente
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', profile.patient_id)
        .single()

      if (patientError) throw patientError
      setPatientData(patient)

      // Obtener citas del paciente
      await fetchAppointments(profile.patient_id)
      
      // Obtener historial médico
      await fetchMedicalHistory(profile.patient_id)
      
      // Obtener diagnósticos
      await fetchDiagnoses(profile.patient_id)
      
      // Obtener recomendaciones
      await fetchRecommendations(profile.patient_id)
      
      // Obtener notificaciones
      await fetchNotifications(profile.patient_id)

    } catch (error) {
      console.error('Error fetching patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointments = async (patientId) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: true })

      if (error) throw error
      setAppointments(data || [])
      
      // Calcular estadísticas
      const total = data?.length || 0
      const upcoming = data?.filter(apt => {
        const appointmentDate = new Date(apt.appointment_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const isFuture = appointmentDate >= today
        const isActiveStatus = ['programada', 'confirmada'].includes(apt.status)
        
        return isFuture && isActiveStatus
      }).length || 0
      const completed = data?.filter(apt => apt.status === 'completada').length || 0
      
      setStats(prev => ({
        ...prev,
        totalAppointments: total,
        upcomingAppointments: upcoming,
        completedAppointments: completed
      }))
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const fetchMedicalHistory = async (patientId) => {
    try {
      const { data, error } = await supabase
        .from('medical_history')
        .select('*')
        .eq('patient_id', patientId)
        .order('consultation_date', { ascending: false })

      if (error) throw error
      setMedicalHistory(data || [])
    } catch (error) {
      console.error('Error fetching medical history:', error)
    }
  }

  const fetchDiagnoses = async (patientId) => {
    try {
      const { data, error } = await supabase
        .from('patient_diagnoses')
        .select('*')
        .eq('patient_id', patientId)
        .order('diagnosis_date', { ascending: false })

      if (error) throw error
      setDiagnoses(data || [])
    } catch (error) {
      console.error('Error fetching diagnoses:', error)
    }
  }

  const fetchRecommendations = async (patientId) => {
    try {
      const { data, error } = await supabase
        .from('patient_recommendations')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecommendations(data || [])
      
      setStats(prev => ({
        ...prev,
        activeRecommendations: data?.length || 0
      }))
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
  }

  const fetchNotifications = async (patientId) => {
    try {
      const { data, error } = await supabase
        .from('patient_notifications')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // Función para obtener el color del estado de la cita
  const getStatusColor = (status) => {
    const colors = {
      'programada': 'blue',
      'confirmada': 'green',
      'en_proceso': 'orange',
      'completada': 'teal',
      'cancelada': 'red',
      'no_show': 'gray'
    }
    return colors[status] || 'gray'
  }

  // Función para obtener el texto del estado de la cita
  const getStatusText = (status) => {
    const texts = {
      'programada': 'Programada',
      'confirmada': 'Confirmada',
      'en_proceso': 'En Proceso',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_show': 'No Asistió'
    }
    return texts[status] || status
  }

  const StatCard = ({ icon, label, value, color, gradient, delay }) => (
    <Card
      bg={cardBg}
      border='1px solid'
      borderColor={borderColor}
      borderRadius='2xl'
      shadow='lg'
      _hover={{
        transform: 'translateY(-5px)',
        shadow: '2xl',
        transition: 'all 0.3s ease'
      }}
      transition='all 0.3s ease'
      animation={`${fadeInUp} 0.6s ease-out ${delay}s both`}
    >
      <CardBody p={8}>
        <VStack spacing={4} align='stretch'>
          <HStack justify='space-between'>
            <Box
              w='50px'
              h='50px'
              borderRadius='xl'
              bg={gradient}
              display='grid'
              placeItems='center'
              boxShadow='0 5px 15px rgba(0,0,0,0.1)'
            >
              <Icon as={icon} color='white' boxSize={6} />
            </Box>
            <Badge 
              colorScheme={color} 
              variant='subtle'
              fontSize='sm'
              px={3}
              py={1}
              borderRadius='full'
            >
              {loading ? '...' : 'Activo'}
            </Badge>
          </HStack>
          
          <Stat>
            <StatLabel 
              color='gray.600' 
              fontSize='sm' 
              fontWeight='500'
            >
              {label}
            </StatLabel>
            <StatNumber 
              fontSize='3xl' 
              fontWeight='bold'
              color={color}
            >
              {loading ? '...' : value}
            </StatNumber>
          </Stat>
          
          <Progress 
            value={loading ? 0 : Math.min((value / 10) * 100, 100)} 
            colorScheme={color} 
            size='sm' 
            borderRadius='full'
            bg='gray.100'
          />
        </VStack>
      </CardBody>
    </Card>
  )

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando tu información médica...</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box 
      animation={`${fadeInUp} 0.6s ease-out both`}
      p={6}
      maxW="7xl"
      mx="auto"
    >
      {/* Header del Dashboard */}
      <VStack spacing={6} align='stretch' mb={8}>
        <VStack spacing={3} align='stretch'>
          <Heading 
            size='2xl'
            bg='linear-gradient(135deg, #3182CE 0%, #63B3ED 100%)'
            bgClip='text'
            fontWeight='bold'
          >
            Panel del Paciente
          </Heading>
          <Text 
            color='gray.600' 
            fontSize='lg'
            maxW='600px'
          >
            Bienvenido a tu centro de salud dental personal. Aquí puedes revisar tus citas, 
            historial médico y recibir recomendaciones personalizadas.
          </Text>
        </VStack>
        
        <HStack spacing={4} flexWrap="wrap">
          <Link to='/patient-schedule'>
            <Button
              leftIcon={<FiPlus />}
              size='lg'
              bg='linear-gradient(135deg, #3182CE 0%, #63B3ED 100%)'
              color='white'
              borderRadius='xl'
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(49, 130, 206, 0.4)'
              }}
              _active={{
                transform: 'translateY(0)'
              }}
              transition='all 0.3s ease'
            >
              Agendar nueva cita
            </Button>
          </Link>
          
          <Link to='/patient-reports'>
            <Button
              leftIcon={<FiFileText />}
              size='lg'
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              color='white'
              borderRadius='xl'
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
              }}
              _active={{
                transform: 'translateY(0)'
              }}
              transition='all 0.3s ease'
            >
              Ver Mis Informes
            </Button>
          </Link>
          
          <Link to='/patient-agenda'>
            <Button
              leftIcon={<FiCalendar />}
              size='lg'
              variant='outline'
              borderColor='#3182CE'
              color='#3182CE'
              borderRadius='xl'
              _hover={{
                bg: 'rgba(49, 130, 206, 0.1)',
                transform: 'translateY(-2px)'
              }}
              transition='all 0.3s ease'
            >
              Ver mi agenda
            </Button>
          </Link>
        </HStack>
      </VStack>

      {/* Estadísticas principales */}
      <Grid 
        templateColumns={{base:'1fr', md:'repeat(2, 1fr)', lg:'repeat(4, 1fr)'}} 
        gap={6} 
        mb={8}
      >
        <StatCard
          icon={FiCalendar}
          label="Total de Citas"
          value={stats.totalAppointments}
          color="blue"
          gradient="linear-gradient(135deg, #3182CE 0%, #63B3ED 100%)"
          delay={0.1}
        />
        <StatCard
          icon={FiClock}
          label="Próximas Citas"
          value={stats.upcomingAppointments}
          color="cyan"
          gradient="linear-gradient(135deg, #63B3ED 0%, #90CDF4 100%)"
          delay={0.2}
        />
        <StatCard
          icon={FiCheckCircle}
          label="Citas Completadas"
          value={stats.completedAppointments}
          color="green"
          gradient="linear-gradient(135deg, #48BB78 0%, #68D391 100%)"
          delay={0.3}
        />
        <StatCard
          icon={FiShield}
          label="Recomendaciones"
          value={stats.activeRecommendations}
          color="purple"
          gradient="linear-gradient(135deg, #805AD5 0%, #B794F4 100%)"
          delay={0.4}
        />
      </Grid>

      {/* Contenido principal con tabs */}
      <Card
        bg={cardBg}
        border='1px solid'
        borderColor={borderColor}
        borderRadius='2xl'
        shadow='lg'
        animation={`${fadeInUp} 0.6s ease-out 0.5s both`}
      >
        <CardBody p={8}>
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>
                <Icon as={FiCalendar} mr={2} />
                Próximas Citas
              </Tab>
              <Tab>
                <Icon as={FiFileText} mr={2} />
                Historial Médico
              </Tab>
              <Tab>
                <Icon as={FiShield} mr={2} />
                Diagnósticos
              </Tab>
              <Tab>
                <Icon as={FiHeart} mr={2} />
                Recomendaciones
              </Tab>
              <Tab>
                <Icon as={FiBell} mr={2} />
                Notificaciones
              </Tab>
              <Tab>
                <Icon as={FiUser} mr={2} />
                Información Personal
              </Tab>
            </TabList>

            <TabPanels>
              {/* Tab 1: Próximas Citas */}
              <TabPanel p={6}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="gray.700">
                    📅 Próximas Citas
                  </Heading>
                  
                  {appointments.length > 0 ? (
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Fecha</Th>
                            <Th>Hora</Th>
                            <Th>Tipo</Th>
                            <Th>Estado</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {appointments
                            .filter(apt => {
                              const appointmentDate = new Date(apt.appointment_date)
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              
                              const isFuture = appointmentDate >= today
                              const isActiveStatus = ['programada', 'confirmada'].includes(apt.status)
                              
                              return isFuture && isActiveStatus
                            })
                            .slice(0, 5)
                            .map((appointment) => (
                            <Tr key={appointment.id}>
                              <Td>{new Date(appointment.appointment_date).toLocaleDateString()}</Td>
                              <Td>{appointment.appointment_time}</Td>
                              <Td>{appointment.appointment_type}</Td>
                              <Td>
                                <Badge 
                                  colorScheme={getStatusColor(appointment.status)} 
                                  variant="subtle"
                                >
                                  {getStatusText(appointment.status)}
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      No tienes citas programadas en este momento.
                    </Alert>
                  )}
                  
                  <Link to="/patient-agenda">
                    <Button
                      leftIcon={<FiCalendar />}
                      variant="outline"
                      colorScheme="blue"
                      size="sm"
                    >
                      Ver agenda completa
                    </Button>
                  </Link>
                </VStack>
              </TabPanel>

              {/* Tab 2: Historial Médico */}
              <TabPanel p={6}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="gray.700">
                    📋 Historial Médico
                  </Heading>
                  
                  {medicalHistory.length > 0 ? (
                    <VStack spacing={3} align="stretch">
                      {medicalHistory.slice(0, 5).map((record) => (
                        <Card key={record.id} variant="outline">
                          <CardBody p={4}>
                            <VStack align="start" spacing={2}>
                              <HStack justify="space-between" w="100%">
                                <Text fontWeight="bold">
                                  {new Date(record.consultation_date).toLocaleDateString()}
                                </Text>
                                <Badge colorScheme="green" variant="subtle">
                                  Consulta
                                </Badge>
                              </HStack>
                              {record.diagnosis && (
                                <Text fontSize="sm" color="gray.600">
                                  <strong>Diagnóstico:</strong> {record.diagnosis}
                                </Text>
                              )}
                              {record.treatment && (
                                <Text fontSize="sm" color="gray.600">
                                  <strong>Tratamiento:</strong> {record.treatment}
                                </Text>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      Tu historial médico se cargará aquí una vez que tengas consultas registradas.
                    </Alert>
                  )}
                </VStack>
              </TabPanel>

              {/* Tab 3: Diagnósticos */}
              <TabPanel p={6}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="gray.700">
                    🏥 Diagnósticos
                  </Heading>
                  
                  {diagnoses.length > 0 ? (
                    <VStack spacing={3} align="stretch">
                      {diagnoses.slice(0, 5).map((diagnosis) => (
                        <Card key={diagnosis.id} variant="outline">
                          <CardBody p={4}>
                            <VStack align="start" spacing={2}>
                              <HStack justify="space-between" w="100%">
                                <Text fontWeight="bold">
                                  {new Date(diagnosis.diagnosis_date).toLocaleDateString()}
                                </Text>
                                <Badge colorScheme="purple" variant="subtle">
                                  Diagnóstico
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" color="gray.600">
                                <strong>Condición:</strong> {diagnosis.condition}
                              </Text>
                              {diagnosis.description && (
                                <Text fontSize="sm" color="gray.600">
                                  <strong>Descripción:</strong> {diagnosis.description}
                                </Text>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      Tus diagnósticos se cargarán aquí una vez que sean registrados por tu dentista.
                    </Alert>
                  )}
                </VStack>
              </TabPanel>

              {/* Tab 4: Recomendaciones */}
              <TabPanel p={6}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="gray.700">
                    💡 Recomendaciones
                  </Heading>
                  
                  {recommendations.length > 0 ? (
                    <VStack spacing={3} align="stretch">
                      {recommendations.slice(0, 5).map((rec) => (
                        <Card key={rec.id} variant="outline">
                          <CardBody p={4}>
                            <VStack align="start" spacing={2}>
                              <HStack justify="space-between" w="100%">
                                <Text fontWeight="bold">
                                  {rec.category}
                                </Text>
                                <Badge colorScheme="green" variant="subtle">
                                  Activa
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" color="gray.600">
                                {rec.recommendation}
                              </Text>
                              {rec.duration && (
                                <Text fontSize="xs" color="gray.500">
                                  Duración: {rec.duration}
                                </Text>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      Tus recomendaciones se cargarán aquí una vez que tu dentista las registre.
                    </Alert>
                  )}
                </VStack>
              </TabPanel>

              {/* Tab 5: Notificaciones */}
              <TabPanel p={6}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="gray.700">
                    🔔 Notificaciones
                  </Heading>
                  
                  {notifications.length > 0 ? (
                    <VStack spacing={3} align="stretch">
                      {notifications.slice(0, 5).map((notification) => (
                        <Card key={notification.id} variant="outline">
                          <CardBody p={4}>
                            <VStack align="start" spacing={2}>
                              <HStack justify="space-between" w="100%">
                                <Text fontWeight="bold">
                                  {notification.title}
                                </Text>
                                <Badge colorScheme="blue" variant="subtle">
                                  {notification.type}
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" color="gray.600">
                                {notification.message}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      No tienes notificaciones pendientes.
                    </Alert>
                  )}
                </VStack>
              </TabPanel>

              {/* Tab 6: Información Personal */}
              <TabPanel p={6}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="gray.700">
                    👤 Información Personal
                  </Heading>
                  
                  {patientData && (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <VStack align="start" spacing={3}>
                        <Heading size="sm" color="gray.600">Datos Básicos</Heading>
                        <List spacing={2}>
                          <ListItem>
                            <ListIcon as={FiUser} color="blue.500" />
                            <strong>Nombre:</strong> {patientData.name}
                          </ListItem>
                          <ListItem>
                            <ListIcon as={FiUser} color="blue.500" />
                            <strong>Edad:</strong> {patientData.age || 'No especificada'}
                          </ListItem>
                          <ListItem>
                            <ListIcon as={FiUser} color="blue.500" />
                            <strong>Email:</strong> {patientData.email || 'No especificado'}
                          </ListItem>
                          <ListItem>
                            <ListIcon as={FiUser} color="blue.500" />
                            <strong>Teléfono:</strong> {patientData.phone || 'No especificado'}
                          </ListItem>
                          <ListItem>
                            <ListIcon as={FiUser} color="blue.500" />
                            <strong>Ocupación:</strong> {patientData.occupation || 'No especificada'}
                          </ListItem>
                        </List>
                      </VStack>

                      <VStack align="start" spacing={3}>
                        <Heading size="sm" color="gray.600">Hábitos de Higiene</Heading>
                        <List spacing={2}>
                          <ListItem>
                            <ListIcon as={FiShield} color="green.500" />
                            <strong>Cepillados por día:</strong> {patientData.brushings_per_day || 'No especificado'}
                          </ListItem>
                          <ListItem>
                            <ListIcon as={FiShield} color="green.500" />
                            <strong>Usa hilo dental:</strong> {patientData.floss ? 'Sí' : 'No'}
                          </ListItem>
                          <ListItem>
                            <ListIcon as={FiShield} color="green.500" />
                            <strong>Usa enjuague:</strong> {patientData.mouthwash ? 'Sí' : 'No'}
                          </ListItem>
                        </List>
                      </VStack>
                    </SimpleGrid>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* Sección de acciones rápidas */}
      <Card
        bg={cardBg}
        border='1px solid'
        borderColor={borderColor}
        borderRadius='2xl'
        shadow='lg'
        animation={`${fadeInUp} 0.6s ease-out 0.6s both`}
        mt={8}
      >
        <CardBody p={8}>
          <VStack spacing={6} align='stretch'>
            <Heading size='md' color='gray.700'>
              Acciones rápidas
            </Heading>
            
            <Grid templateColumns={{base:'1fr', md:'repeat(2, 1fr)', lg:'repeat(4, 1fr)'}} gap={4}>
              <Link to='/patient-agenda'>
                <Button
                  leftIcon={<FiCalendar />}
                  variant='ghost'
                  size='lg'
                  justifyContent='flex-start'
                  p={4}
                  borderRadius='xl'
                  w='full'
                  _hover={{
                    bg: 'blue.50',
                    transform: 'translateX(5px)'
                  }}
                  transition='all 0.3s ease'
                >
                  Ver mi agenda
                </Button>
              </Link>
              
              <Link to='/patient-chat'>
                <Button
                  leftIcon={<FiMessageSquare />}
                  variant='ghost'
                  size='lg'
                  justifyContent='flex-start'
                  p={4}
                  borderRadius='xl'
                  w='full'
                  _hover={{
                    bg: 'purple.50',
                    transform: 'translateX(5px)'
                  }}
                  transition='all 0.3s ease'
                >
                  Chat con asistente IA
                </Button>
              </Link>
              
              <Link to='/patient-schedule'>
                <Button
                  leftIcon={<FiPlus />}
                  variant='ghost'
                  size='lg'
                  justifyContent='flex-start'
                  p={4}
                  borderRadius='xl'
                  w='full'
                  _hover={{
                    bg: 'green.50',
                    transform: 'translateX(5px)'
                  }}
                  transition='all 0.3s ease'
                >
                  Agendar cita
                </Button>
              </Link>
              
              <Link to='/patient-reports'>
                <Button
                  leftIcon={<FiFileText />}
                  variant='ghost'
                  size='lg'
                  justifyContent='flex-start'
                  p={4}
                  borderRadius='xl'
                  w='full'
                  _hover={{
                    bg: 'blue.50',
                    transform: 'translateX(5px)'
                  }}
                  transition='all 0.3s ease'
                >
                  Mis Informes Médicos
                </Button>
              </Link>
              
              <Link to='/patient-history'>
                <Button
                  leftIcon={<FiActivity />}
                  variant='ghost'
                  size='lg'
                  justifyContent='flex-start'
                  p={4}
                  borderRadius='xl'
                  w='full'
                  _hover={{
                    bg: 'orange.50',
                    transform: 'translateX(5px)'
                  }}
                  transition='all 0.3s ease'
                >
                  Historial completo
                </Button>
              </Link>
            </Grid>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}
