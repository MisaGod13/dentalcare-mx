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
  Progress,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Spacer,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
  Button,
  SimpleGrid
} from '@chakra-ui/react'
import {
  FiFileText,
  FiCalendar,
  FiUser,
  FiHeart,
  FiActivity,
  FiTarget,
  FiCheckCircle,
  FiAlertTriangle,
  FiTrendingUp,
  FiEye,
  FiDownload
} from 'react-icons/fi'

const ReportCard = ({ report, patientData, onView, onDownload, isCompact = false }) => {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.700', 'gray.300')
  const headingColor = useColorModeValue('gray.800', 'white')

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

  const getHealthScore = () => {
    // Si tenemos datos específicos del paciente, usarlos
    if (patientData) {
      let score = 100
      if (patientData?.diabetes) score -= 20
      if (patientData?.high_blood_pressure) score -= 15
      if (patientData?.bruxism) score -= 10
      if (patientData?.smoking) score -= 25
      if (patientData?.allergies) score -= 5
      return Math.max(score, 0)
    }
    
    // Si no hay datos del paciente, usar datos del informe o valor por defecto
    if (report?.data_used?.patient) {
      const patient = report.data_used.patient
      let score = 100
      if (patient?.diabetes) score -= 20
      if (patient?.high_blood_pressure) score -= 15
      if (patient?.bruxism) score -= 10
      if (patient?.smoking) score -= 25
      if (patient?.allergies) score -= 5
      return Math.max(score, 0)
    }
    
    // Valor por defecto basado en el tipo de informe
    const defaultScores = {
      'comprehensive': 85,
      'consultation': 75,
      'diagnosis': 65,
      'follow_up': 80
    }
    return defaultScores[report?.report_type] || 75
  }

  const healthScore = getHealthScore()

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPriorityColor = (report) => {
    if (report?.risk_factors && report.risk_factors.toLowerCase().includes('urgente')) {
      return 'red'
    }
    if (report?.risk_factors && report.risk_factors.toLowerCase().includes('importante')) {
      return 'orange'
    }
    return 'green'
  }

  const getPriorityIcon = (report) => {
    if (report?.risk_factors && report.risk_factors.toLowerCase().includes('urgente')) {
      return FiAlertTriangle
    }
    if (report?.risk_factors && report.risk_factors.toLowerCase().includes('importante')) {
      return FiInfo
    }
    return FiCheckCircle
  }

  if (isCompact) {
    return (
      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
          transition: 'all 0.2s'
        }}
        transition="all 0.2s"
        cursor="pointer"
        onClick={onView}
      >
        <CardBody p={4}>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={1}>
                <HStack>
                  <Icon as={FiFileText} color={`${getReportTypeColor(report?.report_type)}.500`} />
                  <Text fontWeight="bold" color={headingColor} fontSize="sm">
                    {report?.title || `Informe ${getReportTypeLabel(report?.report_type)}`}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {formatDate(report?.created_at)}
                </Text>
              </VStack>
              
              <Badge colorScheme={getReportTypeColor(report?.report_type)} variant="subtle" fontSize="xs">
                {getReportTypeLabel(report?.report_type)}
              </Badge>
            </HStack>

            <HStack justify="space-between">
              <HStack spacing={2}>
                <Icon as={getPriorityIcon(report)} color={`${getPriorityColor(report)}.500`} boxSize={3} />
                <Text fontSize="xs" color={`${getPriorityColor(report)}.500`}>
                  {report?.risk_factors && report.risk_factors.toLowerCase().includes('urgente') ? 'Urgente' :
                   report?.risk_factors && report.risk_factors.toLowerCase().includes('importante') ? 'Importante' : 'Normal'}
                </Text>
              </HStack>
              
              <HStack spacing={1}>
                <Tooltip label="Ver informe">
                  <Button size="xs" variant="ghost" onClick={(e) => { e.stopPropagation(); onView(); }}>
                    <Icon as={FiEye} />
                  </Button>
                </Tooltip>
                <Tooltip label="Descargar PDF">
                  <Button size="xs" variant="ghost" onClick={(e) => { e.stopPropagation(); onDownload(); }}>
                    <Icon as={FiDownload} />
                  </Button>
                </Tooltip>
              </HStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '2xl',
        transition: 'all 0.3s ease'
      }}
      transition="all 0.3s ease"
    >
      {/* Header con gradiente */}
      <Box
        bg="linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)"
        color="white"
        p={4}
        position="relative"
        overflow="hidden"
      >
        {/* Elementos decorativos */}
        <Box
          position="absolute"
          top="-20px"
          right="-20px"
          w="100px"
          h="100px"
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.1)"
        />
        
        <VStack spacing={2} align="stretch" position="relative" zIndex={1}>
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1}>
              <HStack>
                <Icon as={FiFileText} />
                <Heading size="md" fontWeight="bold">
                  {report?.title || `Informe ${getReportTypeLabel(report?.report_type)}`}
                </Heading>
              </HStack>
              <Text fontSize="sm" opacity={0.9}>
                {patientData?.name} - {formatDate(report?.created_at)}
              </Text>
            </VStack>
            
            <Badge
              bg="rgba(255, 255, 255, 0.2)"
              color="white"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              {getReportTypeLabel(report?.report_type)}
            </Badge>
          </HStack>
        </VStack>
      </Box>

      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          {/* Puntuación de salud */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="bold" color={headingColor}>
                Puntuación de Salud
              </Text>
              <Text fontSize="sm" color={textColor}>
                {healthScore}/100
              </Text>
            </HStack>
            <Progress
              value={healthScore}
              colorScheme={healthScore > 80 ? 'green' : healthScore > 60 ? 'yellow' : 'red'}
              size="sm"
              borderRadius="full"
            />
          </Box>

          {/* Resumen del informe */}
          {report?.summary && (
            <Box>
              <Text fontSize="sm" fontWeight="bold" color={headingColor} mb={2}>
                Resumen
              </Text>
              <Text fontSize="sm" color={textColor} noOfLines={3}>
                {report.summary}
              </Text>
            </Box>
          )}

          {/* Información médica relevante */}
          <SimpleGrid columns={2} spacing={4}>
            <Stat>
              <StatLabel fontSize="xs" color="gray.500">Estado</StatLabel>
              <StatNumber fontSize="sm" color={healthScore > 80 ? 'green.500' : healthScore > 60 ? 'yellow.500' : 'red.500'}>
                {healthScore > 80 ? 'Saludable' : healthScore > 60 ? 'Atención' : 'Urgente'}
              </StatNumber>
            </Stat>
            
            <Stat>
              <StatLabel fontSize="xs" color="gray.500">Prioridad</StatLabel>
              <StatNumber fontSize="sm" color={`${getPriorityColor(report)}.500`}>
                <HStack>
                  <Icon as={getPriorityIcon(report)} boxSize={3} />
                  <Text>
                    {report?.risk_factors && report.risk_factors.toLowerCase().includes('urgente') ? 'Urgente' :
                     report?.risk_factors && report.risk_factors.toLowerCase().includes('importante') ? 'Importante' : 'Normal'}
                  </Text>
                </HStack>
              </StatNumber>
            </Stat>
          </SimpleGrid>

          {/* Condiciones médicas */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" color={headingColor} mb={2}>
              Condiciones Relevantes
            </Text>
            <HStack spacing={2} wrap="wrap">
              {patientData?.diabetes && <Badge colorScheme="red" variant="subtle" fontSize="xs">Diabetes</Badge>}
              {patientData?.high_blood_pressure && <Badge colorScheme="orange" variant="subtle" fontSize="xs">Hipertensión</Badge>}
              {patientData?.bruxism && <Badge colorScheme="yellow" variant="subtle" fontSize="xs">Bruxismo</Badge>}
              {patientData?.allergies && <Badge colorScheme="purple" variant="subtle" fontSize="xs">Alergias</Badge>}
              {!patientData?.diabetes && !patientData?.high_blood_pressure && !patientData?.bruxism && !patientData?.allergies && (
                <Badge colorScheme="green" variant="subtle" fontSize="xs">Sin condiciones</Badge>
              )}
            </HStack>
          </Box>

          {/* Acciones */}
          <HStack justify="space-between" pt={2}>
            <HStack spacing={2}>
              <Tooltip label="Ver informe completo">
                <Button
                  size="sm"
                  leftIcon={<FiEye />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={onView}
                >
                  Ver
                </Button>
              </Tooltip>
              
              <Tooltip label="Descargar PDF">
                <Button
                  size="sm"
                  leftIcon={<FiDownload />}
                  colorScheme="green"
                  variant="outline"
                  onClick={onDownload}
                >
                  PDF
                </Button>
              </Tooltip>
            </HStack>
            
            <Text fontSize="xs" color="gray.400">
              <Icon as={FiCalendar} mr={1} />
              {formatDate(report?.created_at)}
            </Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

export default ReportCard
