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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Spacer,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react'
import {
  FiCpu,
  FiTarget,
  FiTrendingUp,
  FiStar,
  FiHeart,
  FiAlertTriangle,
  FiCheckCircle,
  FiActivity,
  FiUser,
  FiCalendar
} from 'react-icons/fi'

const IntelligentSummary = ({ intelligentSummary, patientData, reportType }) => {
  console.log('IntelligentSummary renderizado con:', { intelligentSummary, patientData, reportType })
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.700', 'gray.300')
  const headingColor = useColorModeValue('gray.800', 'white')
  const accentColor = useColorModeValue('indigo.500', 'indigo.300')
  const bgGradient = useColorModeValue(
    'linear(to-r, indigo.50, purple.50)',
    'linear(to-r, indigo.900, purple.900)'
  )

  if (!intelligentSummary) {
    console.log('No hay resumen inteligente, no renderizando')
    return null
  }

  // Extraer información del resumen para mostrar en cards
  const extractSummaryInfo = (summary) => {
    const info = {
      riskLevel: 'bajo',
      hygieneScore: 75,
      activeSymptoms: [],
      recommendations: [],
      prognosis: 'favorable'
    }

    // Extraer nivel de riesgo
    if (summary.includes('perfil de riesgo elevado')) {
      info.riskLevel = 'elevado'
    } else if (summary.includes('perfil de riesgo moderado')) {
      info.riskLevel = 'moderado'
    }

    // Extraer puntuación de higiene
    const hygieneMatch = summary.match(/puntuación: (\d+)\/100/)
    if (hygieneMatch) {
      info.hygieneScore = parseInt(hygieneMatch[1])
    }

    // Extraer síntomas activos
    if (summary.includes('dolor dental')) info.activeSymptoms.push('Dolor dental')
    if (summary.includes('sangrado gingival')) info.activeSymptoms.push('Sangrado gingival')
    if (summary.includes('sensibilidad dental')) info.activeSymptoms.push('Sensibilidad dental')
    if (summary.includes('halitosis')) info.activeSymptoms.push('Halitosis')

    // Extraer recomendaciones
    if (summary.includes('control glucémico')) info.recommendations.push('Control glucémico')
    if (summary.includes('mejora de hábitos')) info.recommendations.push('Mejora de higiene')
    if (summary.includes('tratamiento periodontal')) info.recommendations.push('Tratamiento periodontal')
    if (summary.includes('evaluación inmediata')) info.recommendations.push('Evaluación urgente')

    // Extraer pronóstico
    if (summary.includes('pronóstico a corto plazo')) {
      if (summary.includes('excelente')) info.prognosis = 'excelente'
      else if (summary.includes('favorable')) info.prognosis = 'favorable'
      else if (summary.includes('cauteloso')) info.prognosis = 'cauteloso'
    }

    return info
  }

  const summaryInfo = extractSummaryInfo(intelligentSummary)

  const getRiskColor = (level) => {
    switch (level) {
      case 'elevado': return 'red'
      case 'moderado': return 'orange'
      case 'bajo': return 'green'
      default: return 'gray'
    }
  }

  const getHygieneColor = (score) => {
    if (score >= 80) return 'green'
    if (score >= 60) return 'blue'
    if (score >= 40) return 'orange'
    return 'red'
  }

  const getPrognosisColor = (prognosis) => {
    switch (prognosis) {
      case 'excelente': return 'green'
      case 'favorable': return 'blue'
      case 'cauteloso': return 'orange'
      default: return 'gray'
    }
  }

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl" overflow="hidden">
      <CardHeader bgGradient={bgGradient} pb={4}>
        <VStack align="stretch" spacing={4}>
          <HStack>
            <Icon as={FiCpu} color={accentColor} boxSize={6} />
            <Heading size="lg" color={headingColor}>
              Resumen Inteligente
            </Heading>
            <Spacer />
            <Badge colorScheme={getRiskColor(summaryInfo.riskLevel)} fontSize="sm" px={3} py={1}>
              {summaryInfo.riskLevel.toUpperCase()}
            </Badge>
          </HStack>
          
          <Text color={textColor} fontSize="sm" fontStyle="italic">
            Análisis personalizado generado por IA basado en los datos específicos del paciente
          </Text>
        </VStack>
      </CardHeader>

      <CardBody p={6}>
        <VStack align="stretch" spacing={6}>
          {/* Métricas clave */}
          <Box>
            <Heading size="md" color={headingColor} mb={4}>
              Métricas Clave
            </Heading>
            <Flex gap={4} wrap="wrap">
              <Stat minW="120px">
                <StatLabel>Higiene Oral</StatLabel>
                <StatNumber color={getHygieneColor(summaryInfo.hygieneScore)}>
                  {summaryInfo.hygieneScore}/100
                </StatNumber>
                <Progress 
                  value={summaryInfo.hygieneScore} 
                  colorScheme={getHygieneColor(summaryInfo.hygieneScore)}
                  size="sm"
                  mt={2}
                />
              </Stat>
              
              <Stat minW="120px">
                <StatLabel>Pronóstico</StatLabel>
                <StatNumber color={getPrognosisColor(summaryInfo.prognosis)}>
                  {summaryInfo.prognosis.charAt(0).toUpperCase() + summaryInfo.prognosis.slice(1)}
                </StatNumber>
                <StatHelpText>
                  {summaryInfo.prognosis === 'excelente' ? 'Muy favorable' : 
                   summaryInfo.prognosis === 'favorable' ? 'Positivo' : 
                   summaryInfo.prognosis === 'cauteloso' ? 'Requiere atención' : 'Por evaluar'}
                </StatHelpText>
              </Stat>
            </Flex>
          </Box>

          <Divider />

          {/* Síntomas activos */}
          {summaryInfo.activeSymptoms.length > 0 && (
            <Box>
              <HStack mb={3}>
                <Icon as={FiAlertTriangle} color="orange.500" />
                <Heading size="sm" color={headingColor}>
                  Síntomas Activos
                </Heading>
              </HStack>
              <List spacing={2}>
                {summaryInfo.activeSymptoms.map((symptom, index) => (
                  <ListItem key={index}>
                    <HStack>
                      <ListIcon as={FiCheckCircle} color="orange.500" />
                      <Text color={textColor}>{symptom}</Text>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Recomendaciones prioritarias */}
          {summaryInfo.recommendations.length > 0 && (
            <Box>
              <HStack mb={3}>
                <Icon as={FiTarget} color="blue.500" />
                <Heading size="sm" color={headingColor}>
                  Recomendaciones Prioritarias
                </Heading>
              </HStack>
              <List spacing={2}>
                {summaryInfo.recommendations.map((rec, index) => (
                  <ListItem key={index}>
                    <HStack>
                      <ListIcon as={FiStar} color="blue.500" />
                      <Text color={textColor}>{rec}</Text>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Divider />

          {/* Resumen completo */}
          <Box>
            <HStack mb={3}>
              <Icon as={FiActivity} color="purple.500" />
              <Heading size="sm" color={headingColor}>
                Análisis Completo
              </Heading>
            </HStack>
            
            <Box
              bg="gray.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.200"
            >
              <Text 
                color={textColor} 
                lineHeight="1.6" 
                fontSize="sm"
                whiteSpace="pre-line"
              >
                {intelligentSummary.replace(/\*\*([^*]+)\*\*/g, '$1')}
              </Text>
            </Box>
          </Box>

          {/* Footer */}
          <Box textAlign="center" pt={2}>
            <HStack justify="center" spacing={4} fontSize="xs" color="gray.500">
              <HStack>
                <Icon as={FiCpu} />
                <Text>Generado por IA</Text>
              </HStack>
              <HStack>
                <Icon as={FiUser} />
                <Text>Personalizado</Text>
              </HStack>
              <HStack>
                <Icon as={FiCalendar} />
                <Text>{new Date().toLocaleDateString('es-ES')}</Text>
              </HStack>
            </HStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  )
}

export default IntelligentSummary
