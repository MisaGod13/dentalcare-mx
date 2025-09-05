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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Spacer
} from '@chakra-ui/react'
import {
  FiFileText,
  FiDownload,
  FiEye,
  FiTrash2,
  FiCalendar,
  FiActivity,
  FiUser,
  FiHeart,
  FiZap,
  FiSearch,
  FiPlus,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import MedicalReportGenerator from '../components/MedicalReportGenerator'
import ReportCard from '../components/ReportCard'

const MedicalReports = () => {
  const [patients, setPatients] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const navigate = useNavigate()
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    loadPatients()
    loadAllReports()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error('Error loading patients:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar los pacientes',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAllReports = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_reports')
        .select(`
          *,
          patients (
            id,
            name,
            email,
            age,
            phone,
            diabetes,
            high_blood_pressure,
            bruxism,
            allergies,
            smoking,
            brushings_per_day,
            floss,
            mouthwash,
            recent_pain,
            gum_bleeding,
            loose_teeth,
            food_between_teeth,
            mouth_breathing,
            current_treatment,
            current_treatment_details
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error loading reports:', error)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.patients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || report.report_type === filterType
    return matchesSearch && matchesFilter
  })

  const getReportTypeLabel = (type) => {
    const labels = {
      'comprehensive': 'Completo',
      'consultation': 'Consulta',
      'diagnosis': 'Diagnóstico',
      'follow_up': 'Seguimiento'
    }
    return labels[type] || type
  }

  const getReportTypeColor = (type) => {
    const colors = {
      'comprehensive': 'blue',
      'consultation': 'green',
      'diagnosis': 'orange',
      'follow_up': 'purple'
    }
    return colors[type] || 'gray'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleGenerateReport = (patient) => {
    setSelectedPatient(patient)
    onOpen()
  }

  const handleReportGenerated = (report) => {
    toast({
      title: 'Informe generado',
      description: `Informe creado exitosamente para ${selectedPatient?.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })
    loadAllReports()
    onClose()
  }

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Cargando informes médicos...</Text>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <VStack spacing={6} align="stretch" mb={8}>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={2}>
            <Heading 
              size="xl"
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              bgClip='text'
              fontWeight='bold'
            >
              <HStack>
                <Icon as={FiFileText} />
                <Text>Informes Médicos</Text>
              </HStack>
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Genera y gestiona informes médicos inteligentes con IA
            </Text>
          </VStack>
        </HStack>

        {/* Estadísticas */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Stat>
            <StatLabel color="gray.600">Total Pacientes</StatLabel>
            <StatNumber color="blue.600">{patients.length}</StatNumber>
            <StatHelpText>
              <Icon as={FiUser} mr={1} />
              Registrados
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel color="gray.600">Informes Generados</StatLabel>
            <StatNumber color="green.600">{reports.length}</StatNumber>
            <StatHelpText>
              <Icon as={FiFileText} mr={1} />
              Total
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel color="gray.600">Este Mes</StatLabel>
            <StatNumber color="purple.600">
              {reports.filter(r => {
                const reportDate = new Date(r.created_at)
                const now = new Date()
                return reportDate.getMonth() === now.getMonth() && 
                       reportDate.getFullYear() === now.getFullYear()
              }).length}
            </StatNumber>
            <StatHelpText>
              <Icon as={FiCalendar} mr={1} />
              Generados
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel color="gray.600">Último Informe</StatLabel>
            <StatNumber color="orange.600">
              {reports.length > 0 ? 
                new Date(reports[0].created_at).toLocaleDateString('es-ES') : 
                'N/A'
              }
            </StatNumber>
            <StatHelpText>
              <Icon as={FiActivity} mr={1} />
              Fecha
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      </VStack>

      {/* Filtros y búsqueda */}
      <Card bg={cardBg} mb={6} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <HStack spacing={4} mb={4}>
            <InputGroup maxW="400px">
              <InputLeftElement>
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Buscar pacientes o informes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              maxW="200px"
            >
              <option value="all">Todos los tipos</option>
              <option value="comprehensive">Completo</option>
              <option value="consultation">Consulta</option>
              <option value="diagnosis">Diagnóstico</option>
              <option value="follow_up">Seguimiento</option>
            </Select>
            
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              onClick={() => {
                loadPatients()
                loadAllReports()
              }}
            >
              Actualizar
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Lista de pacientes */}
      <Card bg={cardBg} mb={6} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md" color="gray.700">
              Pacientes para Generar Informes
            </Heading>
            <Text fontSize="sm" color="gray.500">
              {filteredPatients.length} pacientes encontrados
            </Text>
          </HStack>
        </CardHeader>
        <CardBody>
          {filteredPatients.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Icon as={FiUser} boxSize={12} color="gray.400" mb={4} />
              <Text color="gray.500" fontSize="lg" mb={2}>
                No se encontraron pacientes
              </Text>
              <Text color="gray.400" mb={4}>
                {searchTerm ? 'Intenta con otro término de búsqueda' : 'No hay pacientes registrados'}
              </Text>
              <Link to="/patients/new">
                <Button
                  leftIcon={<FiPlus />}
                  bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                  color='white'
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
                  }}
                >
                  Registrar Paciente
                </Button>
              </Link>
            </Box>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Paciente</Th>
                  <Th>Contacto</Th>
                  <Th>Última Consulta</Th>
                  <Th>Informes</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPatients.map((patient) => {
                  const patientReports = reports.filter(r => r.patient_id === patient.id)
                  const lastReport = patientReports[0]
                  
                  return (
                    <Tr key={patient.id} _hover={{ bg: 'gray.50' }}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" color="gray.700">
                            {patient.name}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {patient.age} años
                          </Text>
                        </VStack>
                      </Td>
                      
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm">{patient.email || 'Sin email'}</Text>
                          <Text fontSize="sm">{patient.phone || 'Sin teléfono'}</Text>
                        </VStack>
                      </Td>
                      
                      <Td>
                        <Text fontSize="sm" color="gray.600">
                          {lastReport ? formatDate(lastReport.created_at) : 'Sin informes'}
                        </Text>
                      </Td>
                      
                      <Td>
                        <HStack spacing={2}>
                          <Badge colorScheme="blue" variant="subtle">
                            {patientReports.length} informes
                          </Badge>
                          {lastReport && (
                            <Badge colorScheme={getReportTypeColor(lastReport.report_type)} variant="outline">
                              {getReportTypeLabel(lastReport.report_type)}
                            </Badge>
                          )}
                        </HStack>
                      </Td>
                      
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="Generar informe">
                            <Button
                              size="sm"
                              leftIcon={<FiZap />}
                              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                              color='white'
                              onClick={() => handleGenerateReport(patient)}
                              _hover={{
                                transform: 'translateY(-2px)',
                                boxShadow: '0 5px 15px rgba(0, 180, 216, 0.4)'
                              }}
                            >
                              Generar
                            </Button>
                          </Tooltip>
                          
                          <Tooltip label="Ver paciente">
                            <IconButton
                              size="sm"
                              icon={<FiEye />}
                              variant="outline"
                              colorScheme="blue"
                              onClick={() => navigate(`/patients/${patient.id}`)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Lista de informes recientes */}
      {reports.length > 0 && (
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md" color="gray.700">
                Informes Recientes
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {filteredReports.length} informes encontrados
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {filteredReports.slice(0, 6).map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  patientData={report.patients}
                  onView={() => navigate(`/ai-report/${report.patient_id}`)}
                  onDownload={() => {
                    // Función de descarga se puede implementar aquí
                    console.log('Descargar informe:', report.id)
                  }}
                />
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

      {/* Modal para generar informe */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={FiZap} color="blue.500" />
              <Text>Generar Informe Médico - {selectedPatient?.name}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedPatient && (
              <MedicalReportGenerator 
                patientId={selectedPatient.id} 
                patientData={selectedPatient}
                onReportGenerated={handleReportGenerated}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default MedicalReports
