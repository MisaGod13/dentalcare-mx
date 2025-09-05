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
  Spinner,
  Button,
  HStack,
  Icon,
  Card,
  CardBody,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  SimpleGrid
} from '@chakra-ui/react'
import { FiCalendar, FiPlus, FiClock, FiUser, FiFileText, FiCheckCircle, FiEdit3 } from 'react-icons/fi'
import { supabase } from '../supabaseClient'
import Calendar from '../components/Calendar'
import { Link } from 'react-router-dom'

export default function PatientAgenda() {
  const [patientId, setPatientId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [patientData, setPatientData] = useState(null)
  
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

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
      await fetchPatientData(profile.patient_id)
      await fetchAppointments(profile.patient_id)
      
    } catch (error) {
      console.error('Error fetching patient ID:', error)
      setError('Error al cargar la información del paciente')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientData = async (patientId) => {
    try {
      const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()
      
      if (error) throw error
      setPatientData(patient)
    } catch (error) {
      console.error('Error fetching patient data:', error)
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
    } catch (error) {
      console.error('Error fetching appointments:', error)
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

  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando agenda...</Text>
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
              <Heading size="md">Error al cargar la agenda</Heading>
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
      <Container maxW="7xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading 
              size="xl" 
              color="gray.700" 
              mb={2}
              bg='linear-gradient(135deg, #3182CE 0%, #63B3ED 100%)'
              bgClip='text'
              fontWeight='bold'
            >
              <span className="emoji-original">📅</span> Mi Agenda Dental
            </Heading>
            <Text color="gray.600" fontSize="lg">
              {patientData ? `Agenda de ${patientData.name}` : 'Tu agenda personal'}
            </Text>
          </Box>

          {/* Botones de acción */}
          <HStack spacing={4} justify="center">
            <Link to="/patient-schedule">
              <Button
                leftIcon={<FiPlus />}
                size="lg"
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
                Agendar Nueva Cita
              </Button>
            </Link>
          </HStack>

          {/* Calendario */}
          <Card bg={cardBg} borderRadius="2xl" shadow="lg">
            <CardBody p={6}>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color="gray.700">
                  <Icon as={FiCalendar} mr={2} />
                  Calendario de Citas
                </Heading>
                
                <Calendar 
                  appointments={appointments}
                  isPatientView={true}
                  patientId={patientId}
                  onAppointmentUpdate={() => {}}
                  onAppointmentDelete={() => {}}
                  onAppointmentCreate={() => {}}
                  patients={[]}
                  appointmentTypes={[]}
                />
              </VStack>
            </CardBody>
          </Card>

          {/* Lista de próximas citas */}
          <Card bg={cardBg} borderRadius="2xl" shadow="lg">
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                                                 <Heading size="md" color="gray.700">
                  <Icon as={FiClock} mr={2} />
                  Próximas Citas
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
                            // Debug: mostrar información de cada cita
                            const appointmentDate = new Date(apt.appointment_date)
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            
                            const isFuture = appointmentDate >= today
                            const isActiveStatus = ['programada', 'confirmada'].includes(apt.status)
                            
                            
                            
                            return isFuture && isActiveStatus
                          })
                          .slice(0, 10)
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
              </VStack>
            </CardBody>
          </Card>

                     

           {/* Estadísticas rápidas */}
           <VStack spacing={6} align="stretch">
             <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                             <Card bg={cardBg} borderRadius="xl" shadow="md">
                 <CardBody p={4} textAlign="center">
                   <VStack spacing={2}>
                     <Icon as={FiCalendar} boxSize={8} color="blue.500" />
                     <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                                               {appointments.filter(apt => {
                          const appointmentDate = new Date(apt.appointment_date)
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          
                          const isFuture = appointmentDate >= today
                          const isActiveStatus = ['programada', 'confirmada'].includes(apt.status)
                          
                          return isFuture && isActiveStatus
                        }).length}
                     </Text>
                     <Text fontSize="sm" color="gray.600">Citas Futuras</Text>
                   </VStack>
                 </CardBody>
               </Card>

              <Card bg={cardBg} borderRadius="xl" shadow="md">
                <CardBody p={4} textAlign="center">
                  <VStack spacing={2}>
                    <Icon as={FiCheckCircle} boxSize={8} color="green.500" />
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                      {appointments.filter(apt => apt.status === 'completada').length}
                    </Text>
                    <Text fontSize="sm" color="gray.600">Citas Completadas</Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderRadius="xl" shadow="md">
                <CardBody p={4} textAlign="center">
                  <VStack spacing={2}>
                    <Icon as={FiClock} boxSize={8} color="orange.500" />
                    <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                      {appointments.filter(apt => apt.status === 'reprogramada').length}
                    </Text>
                    <Text fontSize="sm" color="gray.600">Citas Reprogramadas</Text>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
}
