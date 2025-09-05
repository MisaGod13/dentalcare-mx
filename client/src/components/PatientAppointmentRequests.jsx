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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  useToast,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  Divider,
  FormControl,
  FormLabel
} from '@chakra-ui/react'
import { 
  FiCheck, 
  FiX, 
  FiEye, 
  FiCalendar, 
  FiClock, 
  FiUser,
  FiMessageSquare,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi'
import { supabase } from '../supabaseClient'

export default function PatientAppointmentRequests() {
  const [patientRequests, setPatientRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    fetchPatientRequests()
  }, [])

  const fetchPatientRequests = async () => {
    try {
      setLoading(true)
      
      // Obtener solicitudes de citas de pacientes
      const { data: requests, error: requestsError } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(name, email, phone, mobile)
        `)
        .eq('status', 'solicitada')
        .order('created_at', { ascending: false })

      if (requestsError) throw requestsError

      setPatientRequests(requests || [])
    } catch (error) {
      console.error('Error fetching patient requests:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las solicitudes',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async (requestId) => {
    try {
      setIsProcessing(true)

      // Actualizar estado de la cita
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          status: 'confirmada',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      // Crear notificación para el paciente
      const request = patientRequests.find(r => r.id === requestId)
      if (request) {
        await supabase
          .from('patient_notifications')
          .insert({
            patient_id: request.patient_id,
            notification_type: 'consultation_scheduled',
            title: 'Cita confirmada',
            message: `Tu cita para el ${new Date(request.appointment_date).toLocaleDateString()} a las ${formatTime(request.appointment_time)} ha sido confirmada.`
          })
      }

      toast({
        title: 'Cita aprobada',
        description: 'La cita del paciente ha sido confirmada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      fetchPatientRequests()
    } catch (error) {
      console.error('Error approving request:', error)
      toast({
        title: 'Error',
        description: 'No se pudo aprobar la cita',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectRequest = async (requestId) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Razón requerida',
        description: 'Por favor proporciona una razón para rechazar la cita',
        status: 'warning',
        duration: 3000,
        isClosable: true
      })
      return
    }

    try {
      setIsProcessing(true)

      // Actualizar estado de la cita
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelada',
          notes: `Rechazada: ${rejectionReason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      // Crear notificación para el paciente
      const request = patientRequests.find(r => r.id === requestId)
      if (request) {
        await supabase
          .from('patient_notifications')
          .insert({
            patient_id: request.patient_id,
            notification_type: 'general',
            title: 'Cita rechazada',
            message: `Tu solicitud de cita para el ${new Date(request.appointment_date).toLocaleDateString()} ha sido rechazada. Razón: ${rejectionReason}`
          })
      }

      toast({
        title: 'Cita rechazada',
        description: 'La solicitud de cita ha sido rechazada',
        status: 'info',
        duration: 3000,
        isClosable: true
      })

      setRejectionReason('')
      onClose()
      fetchPatientRequests()
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast({
        title: 'Error',
        description: 'No se pudo rechazar la cita',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const openRejectionModal = (request) => {
    setSelectedRequest(request)
    onOpen()
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
      'urgencia': 'Urgencia',
      'seguimiento': 'Seguimiento'
    }
    return typeLabels[type] || type
  }

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityColor = (type) => {
    const priorityColors = {
      'urgencia': 'red',
      'consulta': 'blue',
      'limpieza': 'green',
      'revision': 'yellow',
      'seguimiento': 'purple'
    }
    return priorityColors[type] || 'gray'
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Solicitudes de Citas de Pacientes
          </Heading>
          <Text color="gray.600">
            Revisa y gestiona las solicitudes de citas enviadas por tus pacientes
          </Text>
        </Box>

        {/* Estadísticas */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Solicitudes pendientes</StatLabel>
                <StatNumber color="yellow.500">{patientRequests.length}</StatNumber>
                <StatHelpText>Por revisar</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Urgencias</StatLabel>
                <StatNumber color="red.500">
                  {patientRequests.filter(r => r.appointment_type === 'urgencia').length}
                </StatNumber>
                <StatHelpText>Requieren atención inmediata</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Consultas generales</StatLabel>
                <StatNumber color="blue.500">
                  {patientRequests.filter(r => r.appointment_type === 'consulta').length}
                </StatNumber>
                <StatHelpText>Evaluaciones rutinarias</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Lista de solicitudes */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="md">Solicitudes Pendientes</Heading>
                <Badge colorScheme="yellow" variant="subtle">
                  {patientRequests.length} solicitudes
                </Badge>
              </HStack>

              {patientRequests.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Icon as={FiCheckCircle} boxSize={12} color="green.500" mb={4} />
                  <Text color="gray.500" fontSize="lg">
                    No hay solicitudes pendientes
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Todas las solicitudes han sido procesadas
                  </Text>
                </Box>
              ) : (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Paciente</Th>
                      <Th>Fecha</Th>
                      <Th>Hora</Th>
                      <Th>Tipo</Th>
                      <Th>Motivo</Th>
                      <Th>Contacto</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {patientRequests.map((request) => (
                      <Tr key={request.id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <FiUser />
                              <Text fontWeight="medium">
                                {request.patients?.name || 'N/A'}
                              </Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                              {request.patients?.email || 'Sin email'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <HStack>
                            <FiCalendar />
                            <Text fontSize="sm">
                              {new Date(request.appointment_date).toLocaleDateString()}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack>
                            <FiClock />
                            <Text fontSize="sm">
                              {formatTime(request.appointment_time)}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={getPriorityColor(request.appointment_type)} 
                            variant="subtle"
                          >
                            {getAppointmentTypeLabel(request.appointment_type)}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" maxW="200px" noOfLines={2}>
                            {request.reason || 'No especificado'}
                          </Text>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="xs">
                              📱 {request.patients?.mobile || request.patients?.phone || 'No disponible'}
                            </Text>
                            <Text fontSize="xs">
                              📧 {request.patients?.email || 'No disponible'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="Aprobar cita">
                              <IconButton
                                icon={<FiCheck />}
                                colorScheme="green"
                                size="sm"
                                onClick={() => handleApproveRequest(request.id)}
                                isLoading={isProcessing}
                                disabled={isProcessing}
                              />
                            </Tooltip>
                            <Tooltip label="Rechazar cita">
                              <IconButton
                                icon={<FiX />}
                                colorScheme="red"
                                size="sm"
                                onClick={() => openRejectionModal(request)}
                                isLoading={isProcessing}
                                disabled={isProcessing}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Alertas importantes */}
        {patientRequests.filter(r => r.appointment_type === 'urgencia').length > 0 && (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">
                Atención: Tienes {patientRequests.filter(r => r.appointment_type === 'urgencia').length} solicitud(es) de urgencia
              </Text>
              <Text fontSize="sm">
                Estas solicitudes requieren revisión inmediata debido a su naturaleza urgente.
              </Text>
            </Box>
          </Alert>
        )}
      </VStack>

      {/* Modal para rechazar cita */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Rechazar solicitud de cita
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {selectedRequest && (
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Detalles de la solicitud:
                  </Text>
                  <Text>Paciente: {selectedRequest.patients?.name}</Text>
                  <Text>Fecha: {new Date(selectedRequest.appointment_date).toLocaleDateString()}</Text>
                  <Text>Hora: {formatTime(selectedRequest.appointment_time)}</Text>
                  <Text>Tipo: {getAppointmentTypeLabel(selectedRequest.appointment_type)}</Text>
                </Box>
              )}

              <Divider />

              <FormControl isRequired>
                <FormLabel>Razón del rechazo</FormLabel>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explica por qué rechazas esta solicitud..."
                  rows={3}
                />
              </FormControl>

              <Alert status="warning">
                <AlertIcon />
                <Text fontSize="sm">
                  El paciente recibirá una notificación con la razón del rechazo.
                </Text>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="red"
              onClick={() => handleRejectRequest(selectedRequest?.id)}
              isLoading={isProcessing}
              loadingText="Rechazando..."
              isDisabled={!rejectionReason.trim()}
            >
              Rechazar Cita
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}


