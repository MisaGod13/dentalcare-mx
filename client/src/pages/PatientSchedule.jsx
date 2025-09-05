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
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  SimpleGrid,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react'
import { 
  FiCalendar, 
  FiPlus, 
  FiClock, 
  FiUser, 
  FiFileText,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

export default function PatientSchedule() {
  const [patientId, setPatientId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [existingAppointments, setExistingAppointments] = useState([])
  const [patientData, setPatientData] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentType, setAppointmentType] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  // Horarios disponibles de la clínica
  const clinicHours = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ]

  // Tipos de citas disponibles
  const appointmentTypes = [
    'consulta',
    'limpieza',
    'extraccion',
    'ortodoncia',
    'endodoncia',
    'cirugia',
    'revision',
    'emergencia'
  ]

  useEffect(() => {
    fetchPatientId()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      generateAvailableSlots(selectedDate)
    }
  }, [selectedDate, existingAppointments])

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
      await fetchExistingAppointments(profile.patient_id)
      
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

  const fetchExistingAppointments = async (patientId) => {
    try {
      // Obtener todas las citas existentes (no solo del paciente)
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'scheduled')
        .order('appointment_date', { ascending: true })

      if (error) throw error
      setExistingAppointments(data || [])
    } catch (error) {
      console.error('Error fetching existing appointments:', error)
    }
  }

  const generateAvailableSlots = (date) => {
    const selectedDateObj = new Date(date)
    const dayOfWeek = selectedDateObj.getDay()
    
    // La clínica no trabaja los domingos (0)
    if (dayOfWeek === 0) {
      setAvailableSlots([])
      return
    }

    // Filtrar horarios ya ocupados para esa fecha
    const occupiedTimes = existingAppointments
      .filter(apt => apt.appointment_date === date)
      .map(apt => apt.appointment_time)

    const available = clinicHours.filter(time => !occupiedTimes.includes(time))
    setAvailableSlots(available)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime || !appointmentType) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios.',
        status: 'warning',
        duration: 3000,
        isClosable: true
      })
      return
    }

    try {
      setSubmitting(true)

      // Verificar que el horario aún esté disponible
      const isSlotAvailable = availableSlots.includes(selectedTime)
      if (!isSlotAvailable) {
        toast({
          title: 'Horario no disponible',
          description: 'Este horario ya no está disponible. Por favor selecciona otro.',
          status: 'error',
          duration: 5000,
          isClosable: true
        })
        return
      }

      // Crear la solicitud de cita
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            patient_id: patientId,
            appointment_date: selectedDate,
            appointment_time: selectedTime,
            appointment_type: appointmentType,
            notes: notes,
            status: 'programada', // Programada, el dentista la revisará y confirmará
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) throw error

      toast({
        title: 'Cita programada',
        description: 'Tu cita ha sido programada. El dentista la revisará y te confirmará.',
        status: 'success',
        duration: 5000,
        isClosable: true
      })

      // Limpiar formulario
      setSelectedDate('')
      setSelectedTime('')
      setAppointmentType('')
      setNotes('')
      
      // Recargar citas existentes
      await fetchExistingAppointments(patientId)
      
      // Cerrar modal
      onClose()

    } catch (error) {
      console.error('Error creating appointment:', error)
      toast({
        title: 'Error',
        description: 'No se pudo enviar la solicitud. Intenta de nuevo.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getNextAvailableDate = () => {
    const today = new Date()
    let nextDate = new Date(today)
    
    // Buscar el próximo día laboral
    while (nextDate.getDay() === 0) { // Domingo
      nextDate.setDate(nextDate.getDate() + 1)
    }
    
    return nextDate.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando formulario de agendado...</Text>
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
              <Heading size="md">Error al cargar el formulario</Heading>
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
              <span className="emoji-original">📅</span> Agendar Nueva Cita
            </Heading>
            <Text color="gray.600" fontSize="lg">
              {patientData ? `Programa tu cita, ${patientData.name}` : 'Programa tu próxima consulta dental'}
            </Text>
          </Box>

          {/* Información importante */}
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold">Información importante:</Text>
              <Text fontSize="sm">
                • Las citas se solicitan y requieren aprobación del dentista
                • Solo se muestran horarios disponibles
                • La clínica no trabaja los domingos
                • Recibirás confirmación por correo o teléfono
              </Text>
            </VStack>
          </Alert>

          {/* Formulario de agendado */}
          <Card bg={cardBg} borderRadius="2xl" shadow="lg">
            <CardBody p={6}>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color="gray.700">
                  <Icon as={FiPlus} mr={2} />
                  Solicitar Cita
                </Heading>
                
                <form onSubmit={handleSubmit}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired>
                      <FormLabel>Fecha de la cita</FormLabel>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={getNextAvailableDate()}
                        placeholder="Selecciona una fecha"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Tipo de cita</FormLabel>
                      <Select
                        value={appointmentType}
                        onChange={(e) => setAppointmentType(e.target.value)}
                        placeholder="Selecciona el tipo"
                      >
                        {appointmentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Horario disponible</FormLabel>
                      <Select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        placeholder="Selecciona un horario"
                        isDisabled={!selectedDate || availableSlots.length === 0}
                      >
                        {availableSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </Select>
                      {selectedDate && availableSlots.length === 0 && (
                        <Text fontSize="sm" color="red.500" mt={2}>
                          No hay horarios disponibles para esta fecha
                        </Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel>Notas adicionales</FormLabel>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Describe brevemente el motivo de tu consulta..."
                        rows={3}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <HStack spacing={4} justify="center" mt={6}>
                    <Button
                      type="submit"
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
                      isLoading={submitting}
                      loadingText="Enviando solicitud..."
                    >
                      <Icon as={FiCheckCircle} mr={2} />
                      Enviar Solicitud
                    </Button>

                    <Link to="/patient-agenda">
                      <Button
                        size="lg"
                        variant="outline"
                        borderColor="#3182CE"
                        color="#3182CE"
                        borderRadius="xl"
                        _hover={{
                          bg: 'rgba(49, 130, 206, 0.1)',
                          transform: 'translateY(-2px)'
                        }}
                        transition='all 0.3s ease'
                      >
                        <Icon as={FiCalendar} mr={2} />
                        Ver Mi Agenda
                      </Button>
                    </Link>
                  </HStack>
                </form>
              </VStack>
            </CardBody>
          </Card>

          {/* Horarios ocupados para la fecha seleccionada */}
          {selectedDate && (
            <Card bg={cardBg} borderRadius="2xl" shadow="lg">
              <CardBody p={6}>
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color="gray.700">
                    <Icon as={FiClock} mr={2} />
                    Horarios Ocupados - {new Date(selectedDate).toLocaleDateString()}
                  </Heading>
                  
                  {existingAppointments
                    .filter(apt => apt.appointment_date === selectedDate)
                    .length > 0 ? (
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Hora</Th>
                            <Th>Tipo</Th>
                            <Th>Estado</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {existingAppointments
                            .filter(apt => apt.appointment_date === selectedDate)
                            .map((appointment) => (
                            <Tr key={appointment.id}>
                              <Td>
                                <Badge colorScheme="red" variant="subtle">
                                  {appointment.appointment_time}
                                </Badge>
                              </Td>
                              <Td>{appointment.appointment_type}</Td>
                              <Td>
                                <Badge colorScheme="red" variant="subtle">
                                  Ocupado
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert status="success">
                      <AlertIcon />
                      No hay citas programadas para esta fecha. Todos los horarios están disponibles.
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Estadísticas rápidas */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg={cardBg} borderRadius="xl" shadow="md">
              <CardBody p={4} textAlign="center">
                <VStack spacing={2}>
                  <Icon as={FiCalendar} boxSize={8} color="blue.500" />
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                    {existingAppointments.filter(apt => apt.status === 'scheduled').length}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Citas Programadas</Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderRadius="xl" shadow="md">
              <CardBody p={4} textAlign="center">
                <VStack spacing={2}>
                  <Icon as={FiCheckCircle} boxSize={8} color="green.500" />
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {existingAppointments.filter(apt => apt.status === 'completed').length}
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
                    {clinicHours.length}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Horarios Disponibles</Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}
