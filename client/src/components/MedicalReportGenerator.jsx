import React, { useState, useEffect, useRef } from 'react'
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
  StatHelpText
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
  FiZap
} from 'react-icons/fi'
import { supabase } from '../supabaseClient'
import ReportRenderer from './ReportRenderer'
import ReportCard from './ReportCard'
import IntelligentSummary from './IntelligentSummary'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const MedicalReportGenerator = ({ patientId, patientData, onReportGenerated }) => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportType, setReportType] = useState('comprehensive')
  const [dentistNotes, setDentistNotes] = useState('')
  const [consultations, setConsultations] = useState([])
  const [medicalHistory, setMedicalHistory] = useState(null)
  const [intelligentSummary, setIntelligentSummary] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
  const toast = useToast()
  const reportRef = useRef(null)
  
  const cardBg = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    if (patientId) {
      loadReports()
      loadConsultations()
      loadMedicalHistory()
    }
  }, [patientId])

  const loadReports = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ai_reports')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error loading reports:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar los informes',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  const loadConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', patientId)
        .order('consultation_date', { ascending: false })
      
      if (error) throw error
      setConsultations(data || [])
    } catch (error) {
      console.error('Error loading consultations:', error)
    }
  }

  const loadMedicalHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_histories')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (error) throw error
      setMedicalHistory(data?.data || {})
    } catch (error) {
      console.error('Error loading medical history:', error)
    }
  }

  const generateReport = async () => {
    try {
      setGenerating(true)
      
      const reportData = {
        patient: patientData,
        history: medicalHistory,
        consultations: consultations,
        reportType,
        dentistNotes
      }

      const response = await fetch('http://localhost:3001/api/ai/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Guardar el resumen inteligente
      console.log('Datos recibidos del servidor:', data)
      console.log('Resumen inteligente recibido:', data.intelligentSummary)
      setIntelligentSummary(data.intelligentSummary)

      // Guardar el informe en la base de datos
      const { data: savedReport, error: saveError } = await supabase
        .from('ai_reports')
        .insert({
          patient_id: patientId,
          content: data.text,
          title: `Informe ${getReportTypeLabel(reportType)} - ${patientData?.name}`,
          summary: data.sections?.summary || '',
          diagnosis: data.sections?.diagnosis || '',
          recommendations: data.sections?.recommendations || '',
          treatment_plan: data.sections?.treatmentPlan || '',
          next_steps: data.sections?.nextSteps || '',
          risk_factors: data.sections?.riskFactors || '',
          report_type: reportType,
          model: data.model,
          generated_by: (await supabase.auth.getUser()).data.user?.id,
          dentist_notes: dentistNotes,
          is_visible_to_patient: true
        })
        .select()
        .single()

      if (saveError) throw saveError

      toast({
        title: 'Informe generado',
        description: 'El informe médico ha sido generado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      loadReports()
      onClose()
      
      if (onReportGenerated) {
        onReportGenerated(savedReport)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: 'Error',
        description: 'Error al generar el informe',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setGenerating(false)
    }
  }

  const exportToPDF = async (report) => {
    // Abrir el modal primero para renderizar el contenido
    setSelectedReport(report)
    onViewOpen()
    
    // Esperar un poco para que se renderice
    setTimeout(async () => {
      if (!reportRef.current) return
      
      try {
        const element = reportRef.current
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: element.scrollWidth,
          height: element.scrollHeight
        })
        
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const imgWidth = 210
        const pageHeight = 295
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight
        let position = 0

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
        }

        pdf.save(`informe_medico_${patientData?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
        
        toast({
          title: 'PDF generado',
          description: 'El informe se ha descargado exitosamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
      } catch (error) {
        console.error('Error generating PDF:', error)
        toast({
          title: 'Error',
          description: 'Error al generar el PDF',
          status: 'error',
          duration: 3000,
          isClosable: true
        })
      }
    }, 1000)
  }

  const deleteReport = async (reportId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este informe?')) {
      try {
        const { error } = await supabase
          .from('ai_reports')
          .delete()
          .eq('id', reportId)
        
        if (error) throw error
        
        toast({
          title: 'Informe eliminado',
          description: 'El informe ha sido eliminado exitosamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
        
        loadReports()
      } catch (error) {
        console.error('Error deleting report:', error)
        toast({
          title: 'Error',
          description: 'Error al eliminar el informe',
          status: 'error',
          duration: 3000,
          isClosable: true
        })
      }
    }
  }

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Cargando informes...</Text>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header con estadísticas */}
      <Card bg={cardBg} mb={6}>
        <CardHeader>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading 
                size="lg"
                bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                bgClip='text'
                fontWeight='bold'
              >
                <HStack>
                  <Icon as={FiFileText} />
                  <Text>Generador de Informes Médicos</Text>
                </HStack>
              </Heading>
              <Text color="gray.600">
                Genera informes médicos inteligentes con IA
              </Text>
            </VStack>
            
            <Button
              leftIcon={<FiZap />}
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              color='white'
              onClick={onOpen}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
              }}
            >
              Generar Nuevo Informe
            </Button>
          </HStack>
        </CardHeader>
        
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Stat>
              <StatLabel color="gray.600">Total Informes</StatLabel>
              <StatNumber color="blue.600">{reports.length}</StatNumber>
              <StatHelpText>
                <Icon as={FiFileText} mr={1} />
                Generados
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel color="gray.600">Último Informe</StatLabel>
              <StatNumber color="green.600">
                {reports.length > 0 ? 
                  new Date(reports[0].created_at).toLocaleDateString('es-ES') : 
                  'N/A'
                }
              </StatNumber>
              <StatHelpText>
                <Icon as={FiCalendar} mr={1} />
                Fecha
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel color="gray.600">Consultas</StatLabel>
              <StatNumber color="purple.600">{consultations.length}</StatNumber>
              <StatHelpText>
                <Icon as={FiActivity} mr={1} />
                Registradas
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel color="gray.600">Estado</StatLabel>
              <StatNumber color="orange.600">
                {patientData?.diabetes || patientData?.high_blood_pressure || patientData?.bruxism ? 
                  'Con condiciones' : 'Saludable'
                }
              </StatNumber>
              <StatHelpText>
                <Icon as={FiHeart} mr={1} />
                Paciente
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Lista de informes */}
      {reports.length === 0 ? (
        <Card bg={cardBg}>
          <CardBody textAlign="center" py={12}>
            <Icon as={FiFileText} boxSize={16} color="gray.400" mb={4} />
            <Heading size="md" color="gray.500" mb={2}>
              No hay informes generados
            </Heading>
            <Text color="gray.400" mb={6}>
              Comienza generando el primer informe médico del paciente
            </Text>
            <Button
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              color='white'
              onClick={onOpen}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
              }}
            >
              Generar Primer Informe
            </Button>
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              patientData={patientData}
              onView={() => {
                setSelectedReport(report)
                onViewOpen()
              }}
              onDownload={() => exportToPDF(report)}
            />
          ))}
        </SimpleGrid>
      )}

      {/* Modal para generar informe */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={FiZap} color="blue.500" />
              <Text>Generar Nuevo Informe Médico</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Tipo de Informe</FormLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="comprehensive">Completo - Análisis integral</option>
                  <option value="consultation">Consulta - Basado en consulta específica</option>
                  <option value="diagnosis">Diagnóstico - Evaluación clínica</option>
                  <option value="follow_up">Seguimiento - Evolución del paciente</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Notas del Dentista (Opcional)</FormLabel>
                <Textarea
                  placeholder="Agrega observaciones adicionales o contexto específico..."
                  value={dentistNotes}
                  onChange={(e) => setDentistNotes(e.target.value)}
                  rows={3}
                />
              </FormControl>
              
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Información del Informe</AlertTitle>
                  <AlertDescription>
                    El informe se generará usando los datos del paciente, historial médico, 
                    consultas previas y las notas que agregues. La IA analizará toda la 
                    información disponible para crear un informe médico profesional.
                  </AlertDescription>
                </Box>
              </Alert>
              
              <HStack justify="flex-end" spacing={4}>
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                  color='white'
                  onClick={generateReport}
                  isLoading={generating}
                  loadingText="Generando..."
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
                  }}
                >
                  <HStack>
                    <Icon as={FiZap} />
                    <Text>Generar Informe</Text>
                  </HStack>
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal para ver informe */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="full">
        <ModalOverlay />
        <ModalContent maxW="95vw" maxH="95vh" m={2}>
          <ModalHeader>
            <HStack>
              <Icon as={FiFileText} color="blue.500" />
              <Text>Informe Médico - {selectedReport?.title}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} overflowY="auto" maxH="85vh">
            <Box ref={reportRef}>
              <ReportRenderer 
                report={selectedReport} 
                patientData={patientData}
                isPreview={true}
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Resumen Inteligente */}
      {console.log('Verificando si mostrar resumen inteligente:', intelligentSummary)}
      {intelligentSummary && (
        <Box mt={6}>
          <Heading size="md" mb={4} color={headingColor}>
            <HStack>
              <Icon as={FiZap} color="indigo.500" />
              <Text>Resumen Inteligente del Paciente</Text>
            </HStack>
          </Heading>
          <Card bg={cardBg} p={4}>
            <Text color={textColor} whiteSpace="pre-line">
              {intelligentSummary}
            </Text>
          </Card>
        </Box>
      )}
    </Box>
  )
}

export default MedicalReportGenerator
