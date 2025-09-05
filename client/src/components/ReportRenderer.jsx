import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Icon,
  useColorModeValue,
  Badge,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Spacer,
  Image,
  AspectRatio,
  useBreakpointValue
} from '@chakra-ui/react'
import SimpleCharts from './SimpleCharts'
import {
  FiUser,
  FiCalendar,
  FiHeart,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiTarget,
  FiTrendingUp,
  FiShield,
  FiActivity,
  FiClock,
  FiFileText,
  FiStar,
  FiZap
} from 'react-icons/fi'

const ReportRenderer = ({ report, patientData, isPreview = false }) => {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.700', 'gray.300')
  const headingColor = useColorModeValue('gray.800', 'white')
  
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Función para extraer secciones del contenido
  const extractSections = (content) => {
    const sections = {
      summary: '',
      diagnosis: '',
      clinicalAnalysis: '',
      recommendations: '',
      treatmentPlan: '',
      riskFactors: '',
      nextSteps: '',
      clinicalNotes: '',
      diagnosisSummary: ''
    }

    if (!content) return sections

    // Extraer resumen ejecutivo
    const summaryMatch = content.match(/\*\*RESUMEN EJECUTIVO\*\*([\s\S]*?)(?=\*\*|$)/i)
    if (summaryMatch) sections.summary = summaryMatch[1].trim()

    // Extraer diagnóstico
    const diagnosisMatch = content.match(/\*\*DIAGNÓSTICO PRELIMINAR\*\*([\s\S]*?)(?=\*\*|$)/i)
    if (diagnosisMatch) sections.diagnosis = diagnosisMatch[1].trim()

    // Extraer análisis clínico detallado
    const clinicalAnalysisMatch = content.match(/\*\*ANÁLISIS CLÍNICO DETALLADO\*\*([\s\S]*?)(?=\*\*|$)/i)
    if (clinicalAnalysisMatch) sections.clinicalAnalysis = clinicalAnalysisMatch[1].trim()

    // Extraer recomendaciones
    const recommendationsMatch = content.match(/\*\*RECOMENDACIONES\*\*([\s\S]*?)(?=\*\*|$)/i)
    if (recommendationsMatch) sections.recommendations = recommendationsMatch[1].trim()

    // Extraer plan de tratamiento
    const treatmentMatch = content.match(/\*\*PLAN DE TRATAMIENTO\*\*([\s\S]*?)(?=\*\*|$)/i)
    if (treatmentMatch) sections.treatmentPlan = treatmentMatch[1].trim()

    // Extraer factores de riesgo
    const riskMatch = content.match(/\*\*FACTORES DE RIESGO\*\*([\s\S]*?)(?=\*\*|$)/i)
    if (riskMatch) sections.riskFactors = riskMatch[1].trim()

    // Extraer próximos pasos
    const nextStepsMatch = content.match(/\*\*PRÓXIMOS PASOS\*\*([\s\S]*?)(?=\*\*|$)/i)
    if (nextStepsMatch) sections.nextSteps = nextStepsMatch[1].trim()

    // Extraer observaciones clínicas
    const clinicalNotesMatch = content.match(/\*\*OBSERVACIONES CLÍNICAS\*\*([\s\S]*?)(?=\*\*|$)/i)
    if (clinicalNotesMatch) sections.clinicalNotes = clinicalNotesMatch[1].trim()

    // Extraer resumen de diagnóstico
    const diagnosisSummaryMatch = content.match(/\*\*RESUMEN DE DIAGNÓSTICO\*\*([\s\S]*?)(?=\*\*|$)/i)
    if (diagnosisSummaryMatch) sections.diagnosisSummary = diagnosisSummaryMatch[1].trim()

    return sections
  }

  const sections = extractSections(report?.content)


  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgente': return 'red'
      case 'importante': return 'orange'
      case 'normal': return 'green'
      default: return 'blue'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgente': return FiAlertTriangle
      case 'importante': return FiInfo
      case 'normal': return FiCheckCircle
      default: return FiInfo
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Box
      maxW="800px"
      mx="auto"
      bg={cardBg}
      borderRadius="xl"
      overflow="hidden"
      boxShadow="2xl"
      border="1px solid"
      borderColor={borderColor}
    >
      {/* Header del informe */}
      <Box
        bg="linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)"
        color="white"
        p={8}
        textAlign="center"
        position="relative"
        overflow="hidden"
      >
        {/* Elementos decorativos de fondo */}
        <Box
          position="absolute"
          top="-50px"
          right="-50px"
          w="200px"
          h="200px"
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.1)"
        />
        <Box
          position="absolute"
          bottom="-30px"
          left="-30px"
          w="150px"
          h="150px"
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.05)"
        />
        
        <VStack spacing={4} position="relative" zIndex={1}>
          <HStack>
            <Icon as={FiFileText} boxSize={8} />
            <Heading size="xl" fontWeight="bold">
              Informe Médico Dental
            </Heading>
          </HStack>
          
          <Text fontSize="lg" opacity={0.9}>
            {patientData?.name} - {formatDate(report?.created_at)}
          </Text>
          
          <HStack spacing={4}>
            <Badge
              bg="rgba(255, 255, 255, 0.2)"
              color="white"
              px={4}
              py={2}
              borderRadius="full"
              fontSize="sm"
            >
              <Icon as={FiZap} mr={2} />
              Generado por IA
            </Badge>
            
            <Badge
              bg="rgba(255, 255, 255, 0.2)"
              color="white"
              px={4}
              py={2}
              borderRadius="full"
              fontSize="sm"
            >
              <Icon as={FiShield} mr={2} />
              Confidencial
            </Badge>
          </HStack>
        </VStack>
      </Box>

      {/* Información del paciente */}
      <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <VStack align="start" spacing={3}>
            <HStack>
              <Icon as={FiUser} color="blue.500" />
              <Text fontWeight="bold" color={headingColor}>
                Información del Paciente
              </Text>
            </HStack>
            
            <VStack align="start" spacing={2} fontSize="sm">
              <Text><strong>Nombre:</strong> {patientData?.name}</Text>
              <Text><strong>Edad:</strong> {patientData?.age} años</Text>
              <Text><strong>Email:</strong> {patientData?.email || 'No especificado'}</Text>
              <Text><strong>Teléfono:</strong> {patientData?.phone || 'No especificado'}</Text>
            </VStack>
          </VStack>

          <VStack align="start" spacing={3}>
            <HStack>
              <Icon as={FiHeart} color="red.500" />
              <Text fontWeight="bold" color={headingColor}>
                Estado de Salud
              </Text>
            </HStack>
            
            <VStack align="start" spacing={2} fontSize="sm">
              <HStack>
                <Text>Estado de Salud:</Text>
                <Badge colorScheme={patientData?.diabetes || patientData?.high_blood_pressure ? 'red' : 'green'}>
                  {patientData?.diabetes || patientData?.high_blood_pressure ? 'Atención' : 'Estable'}
                </Badge>
              </HStack>
              
              <HStack spacing={4} wrap="wrap">
                {patientData?.diabetes && <Badge colorScheme="red" variant="subtle">Diabetes</Badge>}
                {patientData?.high_blood_pressure && <Badge colorScheme="orange" variant="subtle">Hipertensión</Badge>}
                {patientData?.bruxism && <Badge colorScheme="yellow" variant="subtle">Bruxismo</Badge>}
                {patientData?.allergies && <Badge colorScheme="purple" variant="subtle">Alergias</Badge>}
              </HStack>
            </VStack>
          </VStack>
        </SimpleGrid>
      </Box>

      {/* Resumen ejecutivo con gráfico */}
      {sections.summary && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Icon as={FiTarget} color="blue.500" />
              <Heading size="md" color={headingColor}>
                Resumen Ejecutivo
              </Heading>
            </HStack>
            
            <Box>
              <Text color={textColor} lineHeight="1.6">
                {sections.summary}
              </Text>
            </Box>
          </VStack>
        </Box>
      )}

      {/* Diagnóstico con alertas visuales */}
      {sections.diagnosis && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Icon as={FiActivity} color="orange.500" />
              <Heading size="md" color={headingColor}>
                Diagnóstico Preliminar
              </Heading>
            </HStack>
            
            <Alert
              status={healthScore > 80 ? 'success' : healthScore > 60 ? 'warning' : 'error'}
              borderRadius="lg"
              variant="left-accent"
            >
              <AlertIcon />
              <Box>
                <AlertTitle>
                  {healthScore > 80 ? 'Estado Saludable' : healthScore > 60 ? 'Atención Requerida' : 'Atención Urgente'}
                </AlertTitle>
                <AlertDescription>
                  {sections.diagnosis}
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        </Box>
      )}

      {/* Recomendaciones con lista visual */}
      {sections.recommendations && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Icon as={FiCheckCircle} color="green.500" />
              <Heading size="md" color={headingColor}>
                Recomendaciones
              </Heading>
            </HStack>
            
            <Box
              bg="green.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="green.200"
            >
              <List spacing={3}>
                {sections.recommendations.split('\n').filter(item => item.trim()).map((item, index) => (
                  <ListItem key={index}>
                    <HStack align="start">
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      <Text color={textColor}>{item.replace(/^[-•*]\s*/, '')}</Text>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </Box>
          </VStack>
        </Box>
      )}

      {/* Plan de tratamiento con timeline */}
      {sections.treatmentPlan && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Icon as={FiClock} color="purple.500" />
              <Heading size="md" color={headingColor}>
                Plan de Tratamiento
              </Heading>
            </HStack>
            
            <Box
              bg="purple.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="purple.200"
            >
              <Text color={textColor} lineHeight="1.6">
                {sections.treatmentPlan}
              </Text>
            </Box>
          </VStack>
        </Box>
      )}

      {/* Factores de riesgo con indicadores */}
      {sections.riskFactors && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Icon as={FiAlertTriangle} color="red.500" />
              <Heading size="md" color={headingColor}>
                Factores de Riesgo
              </Heading>
            </HStack>
            
            <Box
              bg="red.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="red.200"
            >
              <Text color={textColor} lineHeight="1.6">
                {sections.riskFactors}
              </Text>
            </Box>
          </VStack>
        </Box>
      )}

      {/* Análisis clínico detallado */}
      {sections.clinicalAnalysis && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Icon as={FiActivity} color="purple.500" />
              <Heading size="md" color={headingColor}>
                Análisis Clínico Detallado
              </Heading>
            </HStack>
            
            <Box
              bg="purple.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="purple.200"
            >
              <Text color={textColor} lineHeight="1.6">
                {sections.clinicalAnalysis}
              </Text>
            </Box>
          </VStack>
        </Box>
      )}

      {/* Próximos pasos */}
      {sections.nextSteps && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Icon as={FiTrendingUp} color="blue.500" />
              <Heading size="md" color={headingColor}>
                Próximos Pasos
              </Heading>
            </HStack>
            
            <Box
              bg="blue.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="blue.200"
            >
              <Text color={textColor} lineHeight="1.6">
                {sections.nextSteps}
              </Text>
            </Box>
          </VStack>
        </Box>
      )}

      {/* Observaciones clínicas */}
      {sections.clinicalNotes && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Icon as={FiFileText} color="teal.500" />
              <Heading size="md" color={headingColor}>
                Observaciones Clínicas
              </Heading>
            </HStack>
            
            <Box
              bg="teal.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="teal.200"
            >
              <Text color={textColor} lineHeight="1.6">
                {sections.clinicalNotes}
              </Text>
            </Box>
          </VStack>
        </Box>
      )}

      {/* Resumen de diagnóstico */}
      {sections.diagnosisSummary && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Icon as={FiTarget} color="orange.500" />
              <Heading size="md" color={headingColor}>
                Resumen de Diagnóstico
              </Heading>
            </HStack>
            
            <Box
              bg="orange.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="orange.200"
            >
              <Text color={textColor} lineHeight="1.6">
                {sections.diagnosisSummary}
              </Text>
            </Box>
          </VStack>
        </Box>
      )}

      {/* Análisis de salud con gráficos avanzados */}
      <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
        <VStack align="stretch" spacing={4}>
          <HStack>
            <Icon as={FiTrendingUp} color="teal.500" />
            <Heading size="md" color={headingColor}>
              Análisis Visual de Salud Dental
            </Heading>
          </HStack>
          
          <SimpleCharts patientData={patientData} reportData={report} />
        </VStack>
      </Box>

      {/* Notas del dentista */}
      {report?.dentist_notes && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Icon as={FiFileText} color="purple.500" />
              <Heading size="md" color={headingColor}>
                Notas del Dentista
              </Heading>
            </HStack>
            
            <Box
              bg="purple.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="purple.200"
            >
              <Text color={textColor} lineHeight="1.6" fontStyle="italic">
                "{report.dentist_notes}"
              </Text>
            </Box>
          </VStack>
        </Box>
      )}

      {/* Footer del informe */}
      <Box p={6} bg="gray.50" textAlign="center">
        <VStack spacing={3}>
          <HStack spacing={6} fontSize="sm" color="gray.500">
            <HStack>
              <Icon as={FiCalendar} />
              <Text>Generado el {formatDate(report?.created_at)}</Text>
            </HStack>
            <HStack>
              <Icon as={FiShield} />
              <Text>Información confidencial</Text>
            </HStack>
            <HStack>
              <Icon as={FiStar} />
              <Text>Generado con IA asistida</Text>
            </HStack>
          </HStack>
          
          <Divider />
          
          <Text fontSize="xs" color="gray.400" maxW="600px">
            Este informe fue generado por inteligencia artificial y debe ser revisado por un profesional de la salud. 
            No sustituye la evaluación clínica directa del dentista.
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}

export default ReportRenderer
