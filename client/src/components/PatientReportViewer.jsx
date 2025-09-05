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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  Flex,
  Spacer
} from '@chakra-ui/react'
import {
  FiFileText,
  FiDownload,
  FiEye,
  FiCalendar,
  FiActivity,
  FiUser,
  FiHeart,
  FiShield,
  FiTarget,
  FiStar,
  FiInfo,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle
} from 'react-icons/fi'
import { supabase } from '../supabaseClient'
import ReportRenderer from './ReportRenderer'
import ReportCard from './ReportCard'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const PatientReportViewer = ({ patientId, patientData }) => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const reportRef = useRef(null)
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    if (patientId) {
      loadReports()
    }
  }, [patientId])

  const loadReports = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ai_reports')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_visible_to_patient', true)
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

  const exportToPDF = async (report) => {
    // Abrir el modal primero para renderizar el contenido
    setSelectedReport(report)
    onOpen()
    
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

        pdf.save(`mi_informe_medico_${new Date().toISOString().split('T')[0]}.pdf`)
        
        toast({
          title: 'PDF generado',
          description: 'Tu informe se ha descargado exitosamente',
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

  const getReportTypeIcon = (type) => {
    const icons = {
      'comprehensive': FiFileText,
      'consultation': FiActivity,
      'diagnosis': FiTarget,
      'follow_up': FiClock
    }
    return icons[type] || FiFileText
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

  const getPriorityColor = (report) => {
    if (report.risk_factors && report.risk_factors.toLowerCase().includes('urgente')) {
      return 'red'
    }
    if (report.risk_factors && report.risk_factors.toLowerCase().includes('importante')) {
      return 'orange'
    }
    return 'green'
  }

  const getPriorityIcon = (report) => {
    if (report.risk_factors && report.risk_factors.toLowerCase().includes('urgente')) {
      return FiAlertTriangle
    }
    if (report.risk_factors && report.risk_factors.toLowerCase().includes('importante')) {
      return FiInfo
    }
    return FiCheckCircle
  }

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Cargando tus informes médicos...</Text>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header con estadísticas */}
      <Card bg={cardBg} mb={6} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <VStack align="start" spacing={2}>
            <Heading 
              size="lg"
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              bgClip='text'
              fontWeight='bold'
            >
              <HStack>
                <Icon as={FiFileText} />
                <Text>Mis Informes Médicos</Text>
              </HStack>
            </Heading>
            <Text color="gray.600">
              Aquí puedes ver todos tus informes médicos generados por tu dentista
            </Text>
          </VStack>
        </CardHeader>
        
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Stat>
              <StatLabel color="gray.600">Total Informes</StatLabel>
              <StatNumber color="blue.600">{reports.length}</StatNumber>
              <StatHelpText>
                <Icon as={FiFileText} mr={1} />
                Disponibles
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
              <StatLabel color="gray.600">Estado</StatLabel>
              <StatNumber color="purple.600">
                {reports.length > 0 ? 'Actualizado' : 'Sin informes'}
              </StatNumber>
              <StatHelpText>
                <Icon as={FiHeart} mr={1} />
                Salud
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Lista de informes */}
      {reports.length === 0 ? (
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody textAlign="center" py={12}>
            <Icon as={FiFileText} boxSize={16} color="gray.400" mb={4} />
            <Heading size="md" color="gray.500" mb={2}>
              No tienes informes médicos aún
            </Heading>
            <Text color="gray.400" mb={6}>
              Tu dentista generará informes médicos después de tus consultas
            </Text>
            <Alert status="info" borderRadius="md" maxW="md" mx="auto">
              <AlertIcon />
              <Box>
                <AlertTitle>¿Cuándo aparecerán los informes?</AlertTitle>
                <AlertDescription fontSize="sm">
                  Los informes aparecerán aquí después de que tu dentista los genere 
                  basándose en tus consultas y evaluaciones médicas.
                </AlertDescription>
              </Box>
            </Alert>
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
                onOpen()
              }}
              onDownload={() => exportToPDF(report)}
            />
          ))}
        </SimpleGrid>
      )}

      {/* Modal para ver informe completo */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent maxW="95vw" maxH="95vh" m={2}>
          <ModalHeader>
            <HStack>
              <Icon as={FiFileText} color="blue.500" />
              <Text>Mi Informe Médico - {selectedReport?.title}</Text>
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
    </Box>
  )
}

export default PatientReportViewer
