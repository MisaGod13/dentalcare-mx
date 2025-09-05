import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useColorModeValue,
  useToast,
  Grid,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react'
import { 
  FiCalendar, 
  FiClock, 
  FiPlus, 
  FiCheck, 
  FiX, 
  FiAlertCircle,
  FiInfo,
  FiUser
} from 'react-icons/fi'
import { supabase } from '../supabaseClient'

export default function PatientAppointmentScheduler({ patientId }) {
  const [availableSlots, setAvailableSlots] = useState([])
  const [patientAppointments, setPatientAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentType, setAppointmentType] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    fetchPatientAppointments()
  }, [patientId])

  const fetchPatientAppointments = async () => {
    try {
      setLoading(true)
      
      // Obtener citas del paciente
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: false })

      if (appointmentsError) throw appointmentsError

      setPatientAppointments(appointments || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las citas',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  const checkAvailability = async (date) => {
    if (!date) return

    try {
      const { data: availability, error: availabilityError } = await supabase
        .rpc('get_availability_for_date', {
          check_date: date
        })

      if (availabilityError) throw availabilityError

      setAvailableSlots(availability || [])
    } catch (error) {
      console.error('Error checking availability:', error)
      toast({
        title: 'Error',
        description: 'No se pudo verificar la disponibilidad',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setSelectedTime('')
    if (date) {
      checkAvailability(date)
    }
  }

  const handleSubmitAppointment = async () => {
    if (!selectedDate || !selectedTime || !appointmentType || !reason.trim()) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor completa todos los campos requeridos',
        status: 'warning',
        duration: 3000,
        isClosable: true
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Crear la cita con estado "solicitada" para que el dentista la apruebe
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          appointment_type: appointmentType,
          reason: reason,
          status: 'solicitada', // Estado especial para citas solicitadas por pacientes
          duration_minutes: 60
        })

      if (appointmentError) throw appointmentError

      toast({
        title: 'Cita solicitada',
        description: 'Tu solicitud de cita ha sido enviada al dentista para su aprobación',
        status: 'success',
        duration: 5000,
        isClosable: true
      })

      // Limpiar formulario
      setSelectedDate('')
      setSelectedTime('')
      setAppointmentType('')
      setReason('')
      onClose()

      // Actualizar lista de citas
      fetchPatientAppointments()

    } catch (error) {
      console.error('Error submitting appointment:', error)
      toast({
        title: 'Error',
        description: 'No se pudo enviar la solicitud de cita',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'solicitada': { color: 'yellow', text: 'Solicitada' },
      'programada': { color: 'blue', text: 'Programada' },
      'confirmada': { color: 'green', text: 'Confirmada' },
      'en_proceso': { color: 'orange', text: 'En proceso' },
      'completada': { color: 'green', text: 'Completada' },
      'cancelada': { color: 'red', text: 'Cancelada' },
      'no_show': { color: 'gray', text: 'No asistió' }
    }

    const config = statusConfig[status] || statusConfig.solicitada
    return <Badge colorScheme={config.color}>{config.text}</Badge>
  }

  const getAppointmentTypeLabel = (type) => {
    const typeLabels = {
      'consulta': 'Consulta general',
      'limpieza': 'Limpieza dental',
      'extraccion': 'Extracción',
      'ortodoncia': 'Ortodoncia',
      'endodoncia': 'Endodoncia',
      'empaste': 'Empaste',
      'revision': 'Revisión',
      'urgencia': 'Urgencia'
    }
    return typeLabels[type] || type
  }

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUpcomingAppointments = () => {
    const today = new Date()
    return patientAppointments.filter(apt => 
      new Date(apt.appointment_date) >= today && 
      apt.status !== 'cancelada' && 
      apt.status !== 'completada'
    )
  }

  const upcomingAppointments = getUpcomingAppointments()

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Agenda de Citas
          </Heading>
          <Text color="gray.600">
            Solicita nuevas citas y revisa tu agenda personal
          </Text>
        </Box>

        {/* Estadísticas rápidas */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Citas totales</StatLabel>
                <StatNumber color="blue.500">{patientAppointments.length}</StatNumber>
                <StatHelpText>Historial completo</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Próximas citas</StatLabel>
                <StatNumber color="green.500">{upcomingAppointments.length}</StatNumber>
                <StatHelpText>Programadas</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Pendientes</StatLabel>
                <StatNumber color="yellow.500">
                  {patientAppointments.filter(apt => apt.status === 'solicitada').length}
                </StatNumber>
                <StatHelpText>Por confirmar</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Botón para solicitar nueva cita */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="md">Solicitar Nueva Cita</Heading>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  onClick={onOpen}
                >
                  Nueva Cita
                </Button>
              </HStack>
              
              <Alert status="info">
                <AlertIcon />
                <Text fontSize="sm">
                  Las citas solicitadas serán revisadas por tu dentista. Recibirás una notificación 
                  cuando sean confirmadas o si requieren cambios.
                </Text>
              </Alert>
            </VStack>
          </CardBody>
        </Card>

        {/* Próximas citas */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Próximas Citas</Heading>
              
              {upcomingAppointments.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>
                  No tienes citas programadas
                </Text>
              ) : (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Fecha</Th>
                      <Th>Hora</Th>
                      <Th>Tipo</Th>
                      <Th>Estado</Th>
                      <Th>Motivo</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {upcomingAppointments.map((appointment) => (
                      <Tr key={appointment.id}>
                        <Td>
                          <HStack>
                            <FiCalendar />
                            <Text fontSize="sm">
                              {new Date(appointment.appointment_date).toLocaleDateString()}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack>
                            <FiClock />
                            <Text fontSize="sm">
                              {formatTime(appointment.appointment_time)}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" variant="subtle">
                            {getAppointmentTypeLabel(appointment.appointment_type)}
                          </Badge>
                        </Td>
                        <Td>{getStatusBadge(appointment.status)}</Td>
                        <Td>
                          <Text fontSize="sm" maxW="200px" noOfLines={2}>
                            {appointment.reason || 'No especificado'}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Historial de citas */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Historial de Citas</Heading>
              
              {patientAppointments.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>
                  No hay citas registradas
                </Text>
              ) : (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Fecha</Th>
                      <Th>Hora</Th>
                      <Th>Tipo</Th>
                      <Th>Estado</Th>
                      <Th>Motivo</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {patientAppointments.map((appointment) => (
                      <Tr key={appointment.id}>
                        <Td>
                          <HStack>
                            <FiCalendar />
                            <Text fontSize="sm">
                              {new Date(appointment.appointment_date).toLocaleDateString()}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack>
                            <FiClock />
                            <Text fontSize="sm">
                              {formatTime(appointment.appointment_time)}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" variant="subtle">
                            {getAppointmentTypeLabel(appointment.appointment_type)}
                          </Badge>
                        </Td>
                        <Td>{getStatusBadge(appointment.status)}</Td>
                        <Td>
                          <Text fontSize="sm" maxW="200px" noOfLines={2}>
                            {appointment.reason || 'No especificado'}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Modal para solicitar nueva cita */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Solicitar Nueva Cita</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Fecha de la cita</FormLabel>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormControl>

              {selectedDate && (
                <FormControl isRequired>
                  <FormLabel>Hora disponible</FormLabel>
                  <Select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    placeholder="Selecciona una hora"
                  >
                    {availableSlots
                      .filter(slot => slot.is_available)
                      .map((slot, index) => (
                        <option key={index} value={slot.time_slot}>
                          {formatTime(slot.time_slot)}
                        </option>
                      ))}
                  </Select>
                  {availableSlots.filter(slot => slot.is_available).length === 0 && (
                    <Text fontSize="sm" color="red.500" mt={2}>
                      No hay horarios disponibles para esta fecha
                    </Text>
                  )}
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel>Tipo de cita</FormLabel>
                <Select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  placeholder="Selecciona el tipo de cita"
                >
                  <option value="consulta">Consulta general</option>
                  <option value="limpieza">Limpieza dental</option>
                  <option value="revision">Revisión</option>
                  <option value="urgencia">Urgencia</option>
                  <option value="seguimiento">Seguimiento de tratamiento</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Motivo de la cita</FormLabel>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe el motivo de tu consulta..."
                  rows={3}
                />
              </FormControl>

              <Alert status="info">
                <AlertIcon />
                <Text fontSize="sm">
                  Tu solicitud será revisada por el dentista. Recibirás una notificación 
                  cuando sea confirmada o si requiere cambios.
                </Text>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmitAppointment}
              isLoading={isSubmitting}
              loadingText="Enviando..."
              isDisabled={!selectedDate || !selectedTime || !appointmentType || !reason.trim()}
            >
              Solicitar Cita
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

