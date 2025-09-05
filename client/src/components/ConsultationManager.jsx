import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Icon,
  useColorModeValue,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  Tooltip,
  Divider,
  Flex,
  Spacer,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Wrap,
  WrapItem
} from '@chakra-ui/react'
import {
  FiPlus,
  FiEdit3,
  FiEye,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiUser,
  FiActivity,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiDownload
} from 'react-icons/fi'
import { supabase } from '../supabaseClient'

// Componente para mostrar estadísticas de consultas
const ConsultationStats = ({ patientId }) => {
  const [stats, setStats] = useState({
    totalConsultations: 0,
    lastConsultationDate: null,
    consultationTypes: [],
    totalTreatments: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (patientId) {
      loadStats()
    }
  }, [patientId])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Obtener estadísticas usando la función de la base de datos
      const { data, error } = await supabase
        .rpc('get_patient_consultation_stats', { patient_uuid: patientId })
      
      if (error) throw error
      
      if (data && data.length > 0) {
        setStats({
          totalConsultations: data[0].total_consultations || 0,
          lastConsultationDate: data[0].last_consultation_date,
          consultationTypes: data[0].consultation_types || [],
          totalTreatments: data[0].total_treatments || 0
        })
      }
    } catch (error) {
      console.error('Error loading consultation stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="sm" />
      </Box>
    )
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
      <Stat>
        <StatLabel color="gray.600">Total Consultas</StatLabel>
        <StatNumber color="blue.600">{stats.totalConsultations}</StatNumber>
        <StatHelpText>
          <Icon as={FiTrendingUp} mr={1} />
          Historial completo
        </StatHelpText>
      </Stat>
      
      <Stat>
        <StatLabel color="gray.600">Última Consulta</StatLabel>
        <StatNumber color="green.600">
          {stats.lastConsultationDate ? 
            new Date(stats.lastConsultationDate).toLocaleDateString('es-ES') : 
            'N/A'
          }
        </StatNumber>
        <StatHelpText>
          <Icon as={FiCalendar} mr={1} />
          Fecha más reciente
        </StatHelpText>
      </Stat>
      
      <Stat>
        <StatLabel color="gray.600">Tipos de Consulta</StatLabel>
        <StatNumber color="purple.600">{stats.consultationTypes.length}</StatNumber>
        <StatHelpText>
          <Icon as={FiActivity} mr={1} />
          Variedad de servicios
        </StatHelpText>
      </Stat>
      
      <Stat>
        <StatLabel color="gray.600">Total Tratamientos</StatLabel>
        <StatNumber color="orange.600">{stats.totalTreatments}</StatNumber>
        <StatHelpText>
          <Icon as={FiFileText} mr={1} />
          Procedimientos realizados
        </StatHelpText>
      </Stat>
    </SimpleGrid>
  )
}

// Modal para crear/editar consulta
const ConsultationModal = ({ isOpen, onClose, consultation, patientId, onSave }) => {
  const [formData, setFormData] = useState({
    consultation_date: new Date().toISOString().split('T')[0],
    consultation_time: new Date().toTimeString().slice(0, 5),
    consultation_type: '',
    symptoms: '',
    examination_findings: '',
    diagnosis: '',
    treatment_plan: '',
    treatment_performed: '',
    prescriptions: '',
    recommendations: '',
    next_appointment: '',
    notes: '',
    doctor_notes: '',
    status: 'completed'
  })
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (consultation) {
      setIsEditing(true)
      setFormData({
        consultation_date: consultation.consultation_date || new Date().toISOString().split('T')[0],
        consultation_time: consultation.consultation_time || new Date().toTimeString().slice(0, 5),
        consultation_type: consultation.consultation_type || '',
        symptoms: consultation.symptoms || '',
        examination_findings: consultation.examination_findings || '',
        diagnosis: consultation.diagnosis || '',
        treatment_plan: consultation.treatment_plan || '',
        treatment_performed: consultation.treatment_performed || '',
        prescriptions: consultation.prescriptions || '',
        recommendations: consultation.recommendations || '',
        next_appointment: consultation.next_appointment || '',
        notes: consultation.notes || '',
        doctor_notes: consultation.doctor_notes || '',
        status: consultation.status || 'completed'
      })
    } else {
      setIsEditing(false)
      setFormData({
        consultation_date: new Date().toISOString().split('T')[0],
        consultation_time: new Date().toTimeString().slice(0, 5),
        consultation_type: '',
        symptoms: '',
        examination_findings: '',
        diagnosis: '',
        treatment_plan: '',
        treatment_performed: '',
        prescriptions: '',
        recommendations: '',
        next_appointment: '',
        notes: '',
        doctor_notes: '',
        status: 'completed'
      })
    }
  }, [consultation])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      const consultationData = {
        patient_id: patientId,
        ...formData,
        updated_at: new Date().toISOString()
      }

      let result
      if (isEditing) {
        // Actualizar consulta existente
        result = await supabase
          .from('consultations')
          .update(consultationData)
          .eq('id', consultation.id)
          .select()
      } else {
        // Crear nueva consulta
        result = await supabase
          .from('consultations')
          .insert([consultationData])
          .select()
      }

      if (result.error) throw result.error

      onSave(result.data[0])
      onClose()
    } catch (error) {
      console.error('Error saving consultation:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiCalendar} color="blue.500" />
            <Text>
              {isEditing ? 'Editar Consulta' : 'Nueva Consulta'}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Información básica de la consulta */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Fecha de consulta</FormLabel>
                <Input
                  type="date"
                  value={formData.consultation_date}
                  onChange={(e) => handleInputChange('consultation_date', e.target.value)}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Hora</FormLabel>
                <Input
                  type="time"
                  value={formData.consultation_time}
                  onChange={(e) => handleInputChange('consultation_time', e.target.value)}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Tipo de consulta</FormLabel>
                <Select
                  value={formData.consultation_type}
                  onChange={(e) => handleInputChange('consultation_type', e.target.value)}
                  placeholder="Seleccionar tipo"
                >
                  <option value="primera_vez">Primera vez</option>
                  <option value="control">Control</option>
                  <option value="urgencia">Urgencia</option>
                  <option value="limpieza">Limpieza</option>
                  <option value="tratamiento">Tratamiento</option>
                  <option value="seguimiento">Seguimiento</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            {/* Síntomas y hallazgos */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Síntomas reportados</FormLabel>
                <Textarea
                  placeholder="Describa los síntomas que reporta el paciente"
                  value={formData.symptoms}
                  onChange={(e) => handleInputChange('symptoms', e.target.value)}
                  rows={4}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Hallazgos del examen</FormLabel>
                <Textarea
                  placeholder="Describa los hallazgos del examen clínico"
                  value={formData.examination_findings}
                  onChange={(e) => handleInputChange('examination_findings', e.target.value)}
                  rows={4}
                />
              </FormControl>
            </SimpleGrid>

            {/* Diagnóstico y plan de tratamiento */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Diagnóstico preliminar</FormLabel>
                <Textarea
                  placeholder="Diagnóstico de la consulta"
                  value={formData.diagnosis}
                  onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Plan de tratamiento</FormLabel>
                <Textarea
                  placeholder="Plan de tratamiento propuesto"
                  value={formData.treatment_plan}
                  onChange={(e) => handleInputChange('treatment_plan', e.target.value)}
                  rows={3}
                />
              </FormControl>
            </SimpleGrid>

            {/* Tratamiento realizado y prescripciones */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Tratamiento realizado</FormLabel>
                <Textarea
                  placeholder="Describa el tratamiento realizado"
                  value={formData.treatment_performed}
                  onChange={(e) => handleInputChange('treatment_performed', e.target.value)}
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Medicamentos recetados</FormLabel>
                <Textarea
                  placeholder="Liste los medicamentos recetados"
                  value={formData.prescriptions}
                  onChange={(e) => handleInputChange('prescriptions', e.target.value)}
                  rows={3}
                />
              </FormControl>
            </SimpleGrid>

            {/* Recomendaciones y próxima cita */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Recomendaciones</FormLabel>
                <Textarea
                  placeholder="Recomendaciones para el paciente"
                  value={formData.recommendations}
                  onChange={(e) => handleInputChange('recommendations', e.target.value)}
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Próxima cita</FormLabel>
                <Input
                  type="date"
                  value={formData.next_appointment}
                  onChange={(e) => handleInputChange('next_appointment', e.target.value)}
                />
              </FormControl>
            </SimpleGrid>

            {/* Notas adicionales */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Notas generales</FormLabel>
                <Textarea
                  placeholder="Notas adicionales de la consulta"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Notas del doctor</FormLabel>
                <Textarea
                  placeholder="Notas privadas del doctor"
                  value={formData.doctor_notes}
                  onChange={(e) => handleInputChange('doctor_notes', e.target.value)}
                  rows={3}
                />
              </FormControl>
            </SimpleGrid>

            {/* Estado de la consulta */}
            <FormControl>
              <FormLabel>Estado de la consulta</FormLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="scheduled">Programada</option>
                <option value="in_progress">En progreso</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </Select>
            </FormControl>

            {/* Botones de acción */}
            <HStack justify="flex-end" spacing={4} pt={4}>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                color='white'
                onClick={handleSubmit}
                isLoading={loading}
                loadingText="Guardando..."
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
                }}
              >
                {isEditing ? 'Actualizar Consulta' : 'Crear Consulta'}
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

// Componente principal del gestor de consultas
const ConsultationManager = ({ patientId, patientData }) => {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    if (patientId) {
      loadConsultations()
    }
  }, [patientId])

  const loadConsultations = async () => {
    try {
      setLoading(true)
      
      // Obtener consultas del paciente usando la función de la base de datos
      const { data, error } = await supabase
        .rpc('get_patient_consultation_history', { patient_uuid: patientId })
      
      if (error) throw error
      
      setConsultations(data || [])
    } catch (error) {
      console.error('Error loading consultations:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar las consultas',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNewConsultation = () => {
    setSelectedConsultation(null)
    onOpen()
  }

  const handleEditConsultation = (consultation) => {
    setSelectedConsultation(consultation)
    onOpen()
  }

  const handleDeleteConsultation = async (consultationId) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta consulta?')) {
      try {
        const { error } = await supabase
          .from('consultations')
          .delete()
          .eq('id', consultationId)
        
        if (error) throw error
        
        toast({
          title: 'Consulta eliminada',
          description: 'La consulta ha sido eliminada exitosamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
        
        loadConsultations()
      } catch (error) {
        console.error('Error deleting consultation:', error)
        toast({
          title: 'Error',
          description: 'Error al eliminar la consulta',
          status: 'error',
          duration: 3000,
          isClosable: true
        })
      }
    }
  }

  const handleSaveConsultation = (consultation) => {
    if (selectedConsultation) {
      // Actualizar consulta existente
      setConsultations(prev => 
        prev.map(c => c.consultation_id === consultation.id ? consultation : c)
      )
      toast({
        title: 'Consulta actualizada',
        description: 'La consulta ha sido actualizada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } else {
      // Agregar nueva consulta
      setConsultations(prev => [consultation, ...prev])
      toast({
        title: 'Consulta creada',
        description: 'La consulta ha sido creada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green'
      case 'in_progress':
        return 'blue'
      case 'scheduled':
        return 'yellow'
      case 'cancelled':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return FiCheckCircle
      case 'in_progress':
        return FiActivity
      case 'scheduled':
        return FiCalendar
      case 'cancelled':
        return FiAlertCircle
      default:
        return FiClock
    }
  }

  const getTypeLabel = (type) => {
    const typeLabels = {
      'primera_vez': 'Primera vez',
      'control': 'Control',
      'urgencia': 'Urgencia',
      'limpieza': 'Limpieza',
      'tratamiento': 'Tratamiento',
      'seguimiento': 'Seguimiento'
    }
    return typeLabels[type] || type
  }

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Cargando consultas...</Text>
      </Box>
    )
  }

  return (
    <Box>
      {/* Estadísticas */}
      <ConsultationStats patientId={patientId} />
      
      {/* Header con botón de nueva consulta */}
      <Card bg={cardBg} mb={6}>
        <CardBody>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading 
                size="md"
                bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                bgClip='text'
                fontWeight='bold'
              >
                Historial de Consultas
              </Heading>
              <Text color="gray.600">
                Gestiona todas las consultas del paciente
              </Text>
            </VStack>
            
            <Button
              leftIcon={<FiPlus />}
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              color='white'
              onClick={handleNewConsultation}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
              }}
            >
              Nueva Consulta
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Lista de consultas */}
      {consultations.length === 0 ? (
        <Card bg={cardBg}>
          <CardBody textAlign="center" py={12}>
            <Icon as={FiCalendar} boxSize={12} color="gray.400" mb={4} />
            <Text color="gray.500" fontSize="lg">
              No hay consultas registradas
            </Text>
            <Text color="gray.400" fontSize="sm">
              Comienza registrando la primera consulta del paciente
            </Text>
            <Button
              mt={4}
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              color='white'
              onClick={handleNewConsultation}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
              }}
            >
              Registrar Primera Consulta
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Card bg={cardBg}>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Fecha</Th>
                  <Th>Tipo</Th>
                  <Th>Diagnóstico</Th>
                  <Th>Tratamiento</Th>
                  <Th>Estado</Th>
                  <Th>Próxima Cita</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {consultations.map((consultation) => (
                  <Tr key={consultation.consultation_id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">
                          {new Date(consultation.consultation_date).toLocaleDateString('es-ES')}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {consultation.consultation_time}
                        </Text>
                      </VStack>
                    </Td>
                    
                    <Td>
                      <Badge colorScheme="blue" variant="subtle">
                        {getTypeLabel(consultation.consultation_type)}
                      </Badge>
                    </Td>
                    
                    <Td>
                      <Text noOfLines={2} maxW="200px">
                        {consultation.diagnosis || 'Sin diagnóstico'}
                      </Text>
                    </Td>
                    
                    <Td>
                      <Text noOfLines={2} maxW="200px">
                        {consultation.treatment_performed || 'Sin tratamiento'}
                      </Text>
                    </Td>
                    
                    <Td>
                      <Badge
                        colorScheme={getStatusColor(consultation.status)}
                        variant="solid"
                      >
                        <HStack spacing={1}>
                          <Icon as={getStatusIcon(consultation.status)} />
                          <Text>
                            {consultation.status === 'completed' && 'Completada'}
                            {consultation.status === 'in_progress' && 'En progreso'}
                            {consultation.status === 'scheduled' && 'Programada'}
                            {consultation.status === 'cancelled' && 'Cancelada'}
                          </Text>
                        </HStack>
                      </Badge>
                    </Td>
                    
                    <Td>
                      {consultation.next_appointment ? (
                        <Text color="green.600" fontWeight="bold">
                          {new Date(consultation.next_appointment).toLocaleDateString('es-ES')}
                        </Text>
                      ) : (
                        <Text color="gray.400">Sin programar</Text>
                      )}
                    </Td>
                    
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label="Ver detalles">
                          <IconButton
                            size="sm"
                            icon={<FiEye />}
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleEditConsultation(consultation)}
                          />
                        </Tooltip>
                        
                        <Tooltip label="Editar consulta">
                          <IconButton
                            size="sm"
                            icon={<FiEdit3 />}
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => handleEditConsultation(consultation)}
                          />
                        </Tooltip>
                        
                        <Tooltip label="Eliminar consulta">
                          <IconButton
                            size="sm"
                            icon={<FiTrash2 />}
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDeleteConsultation(consultation.consultation_id)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Modal para crear/editar consulta */}
      <ConsultationModal
        isOpen={isOpen}
        onClose={onClose}
        consultation={selectedConsultation}
        patientId={patientId}
        onSave={handleSaveConsultation}
      />
    </Box>
  )
}

export default ConsultationManager
