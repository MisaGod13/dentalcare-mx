import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Spacer
} from '@chakra-ui/react'
import {
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiHeart,
  FiShield,
  FiTarget,
  FiZap,
  FiCheckCircle,
  FiAlertTriangle
} from 'react-icons/fi'

const SimpleCharts = ({ patientData, reportData }) => {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.700', 'gray.300')
  const headingColor = useColorModeValue('gray.800', 'white')

  // Calcular puntuación de salud general
  const getHealthScore = () => {
    let score = 100
    if (patientData?.diabetes) score -= 20
    if (patientData?.high_blood_pressure) score -= 15
    if (patientData?.bruxism) score -= 10
    if (patientData?.smoking) score -= 25
    if (patientData?.allergies) score -= 5
    return Math.max(score, 0)
  }

  const healthScore = getHealthScore()

  const getHealthStatus = (score) => {
    if (score >= 90) return { status: 'Excelente', color: 'green', icon: FiCheckCircle }
    if (score >= 80) return { status: 'Muy Bueno', color: 'green', icon: FiCheckCircle }
    if (score >= 70) return { status: 'Bueno', color: 'blue', icon: FiActivity }
    if (score >= 60) return { status: 'Regular', color: 'yellow', icon: FiAlertTriangle }
    return { status: 'Necesita Atención', color: 'red', icon: FiAlertTriangle }
  }

  const healthStatus = getHealthStatus(healthScore)
  const StatusIcon = healthStatus.icon

  // Datos para métricas de salud
  const healthMetrics = [
    {
      label: 'Salud General',
      value: healthScore,
      color: healthStatus.color,
      icon: FiHeart
    },
    {
      label: 'Higiene Bucal',
      value: patientData?.brushings_per_day ? Math.min(parseInt(patientData.brushings_per_day) * 20, 100) : 60,
      color: 'blue',
      icon: FiShield
    },
    {
      label: 'Síntomas',
      value: patientData?.recent_pain ? 30 : 80,
      color: 'orange',
      icon: FiActivity
    },
    {
      label: 'Hábitos',
      value: (patientData?.floss ? 1 : 0) * 50 + (patientData?.mouthwash ? 1 : 0) * 30 + 20,
      color: 'purple',
      icon: FiTarget
    }
  ]

  // Datos para evolución simulada
  const evolutionData = [
    { month: 'Ene', value: 65 },
    { month: 'Feb', value: 70 },
    { month: 'Mar', value: 75 },
    { month: 'Abr', value: 80 },
    { month: 'May', value: 85 },
    { month: 'Jun', value: healthScore },
    { month: 'Jul', value: healthScore + 5 },
    { month: 'Ago', value: healthScore + 10 },
    { month: 'Sep', value: healthScore + 15 },
    { month: 'Oct', value: healthScore + 20 },
    { month: 'Nov', value: healthScore + 25 },
    { month: 'Dic', value: healthScore + 30 }
  ]

  return (
    <VStack spacing={6} align="stretch">
      {/* Resumen de salud */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color={headingColor}>
            <HStack>
              <Icon as={FiHeart} color="red.500" />
              <Text>Resumen de Salud Dental</Text>
            </HStack>
          </Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Stat textAlign="center">
              <StatLabel color="gray.600">Puntuación General</StatLabel>
              <StatNumber fontSize="4xl" color={`${healthStatus.color}.500`}>
                {healthScore}
              </StatNumber>
              <StatHelpText>
                <HStack justify="center">
                  <Icon as={StatusIcon} color={`${healthStatus.color}.500`} />
                  <Text color={`${healthStatus.color}.500`}>{healthStatus.status}</Text>
                </HStack>
              </StatHelpText>
            </Stat>
            
            <Box>
              <Text fontSize="sm" fontWeight="bold" color={headingColor} mb={2}>
                Progreso de Salud
              </Text>
              <Progress
                value={healthScore}
                colorScheme={healthStatus.color}
                size="lg"
                borderRadius="full"
                mb={2}
              />
              <Text fontSize="xs" color="gray.500" textAlign="center">
                {healthScore}/100 puntos
              </Text>
            </Box>
            
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" fontWeight="bold" color={headingColor}>
                Indicadores Clave
              </Text>
              <HStack spacing={2} wrap="wrap">
                {patientData?.diabetes && <Badge colorScheme="red" variant="subtle">Diabetes</Badge>}
                {patientData?.high_blood_pressure && <Badge colorScheme="orange" variant="subtle">Hipertensión</Badge>}
                {patientData?.bruxism && <Badge colorScheme="yellow" variant="subtle">Bruxismo</Badge>}
                {patientData?.allergies && <Badge colorScheme="purple" variant="subtle">Alergias</Badge>}
                {!patientData?.diabetes && !patientData?.high_blood_pressure && !patientData?.bruxism && !patientData?.allergies && (
                  <Badge colorScheme="green" variant="subtle">Sin condiciones</Badge>
                )}
              </HStack>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Métricas de salud */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Heading size="sm" color={headingColor}>
            <HStack>
              <Icon as={FiActivity} color="blue.500" />
              <Text>Análisis de Salud Dental</Text>
            </HStack>
          </Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            {healthMetrics.map((metric, index) => (
              <Box key={index} textAlign="center">
                <VStack spacing={2}>
                  <Icon as={metric.icon} color={`${metric.color}.500`} boxSize={6} />
                  <Text fontSize="sm" fontWeight="bold" color={headingColor}>
                    {metric.label}
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color={`${metric.color}.500`}>
                    {metric.value}
                  </Text>
                  <Progress
                    value={metric.value}
                    colorScheme={metric.color}
                    size="sm"
                    borderRadius="full"
                    w="full"
                  />
                  <Text fontSize="xs" color="gray.500">
                    {metric.value}/100
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Evolución temporal */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Heading size="sm" color={headingColor}>
            <HStack>
              <Icon as={FiTrendingUp} color="green.500" />
              <Text>Evolución Temporal (Últimos 12 meses)</Text>
            </HStack>
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={2} w="full">
              {evolutionData.map((item, index) => (
                <Box key={index} textAlign="center">
                  <VStack spacing={1}>
                    <Text fontSize="xs" color="gray.500">
                      {item.month}
                    </Text>
                    <Box
                      w="full"
                      h={`${Math.max(item.value * 0.8, 10)}px`}
                      bg={`linear-gradient(to top, ${
                        item.value >= 80 ? '#48BB78' : item.value >= 60 ? '#ED8936' : '#F56565'
                      }, ${
                        item.value >= 80 ? '#68D391' : item.value >= 60 ? '#F6AD55' : '#FC8181'
                      })`}
                      borderRadius="md"
                      minH="20px"
                    />
                    <Text fontSize="xs" fontWeight="bold" color="gray.700">
                      {item.value}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
            
            <HStack spacing={4} fontSize="sm" color="gray.600">
              <HStack>
                <Box w={3} h={3} bg="green.400" borderRadius="sm" />
                <Text>Excelente (80+)</Text>
              </HStack>
              <HStack>
                <Box w={3} h={3} bg="orange.400" borderRadius="sm" />
                <Text>Bueno (60-79)</Text>
              </HStack>
              <HStack>
                <Box w={3} h={3} bg="red.400" borderRadius="sm" />
                <Text>Necesita atención (&lt;60)</Text>
              </HStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Análisis de problemas */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Heading size="sm" color={headingColor}>
            <HStack>
              <Icon as={FiShield} color="orange.500" />
              <Text>Distribución de Problemas Detectados</Text>
            </HStack>
          </Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <VStack align="start" spacing={3}>
              {[
                { label: 'Caries', value: patientData?.cavities ? 25 : 0, color: 'red' },
                { label: 'Gingivitis', value: patientData?.gingivitis ? 20 : 0, color: 'orange' },
                { label: 'Bruxismo', value: patientData?.bruxism ? 15 : 0, color: 'yellow' },
                { label: 'Sensibilidad', value: patientData?.sensitivity ? 10 : 0, color: 'blue' },
                { label: 'Otros', value: patientData?.other_issues ? 5 : 0, color: 'gray' }
              ].map((problem, index) => (
                <HStack key={index} w="full" justify="space-between">
                  <Text fontSize="sm" color={textColor}>
                    {problem.label}
                  </Text>
                  <HStack spacing={2}>
                    <Progress
                      value={problem.value}
                      colorScheme={problem.color}
                      size="sm"
                      w="100px"
                      borderRadius="full"
                    />
                    <Text fontSize="sm" fontWeight="bold" color={`${problem.color}.500`}>
                      {problem.value}%
                    </Text>
                  </HStack>
                </HStack>
              ))}
            </VStack>
            
            <VStack align="start" spacing={3}>
              <Text fontSize="sm" fontWeight="bold" color={headingColor}>
                Resumen de Problemas
              </Text>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={FiCheckCircle} color="green.500" />
                  <Text fontSize="sm" color="green.500">
                    Problemas detectados: {[
                      patientData?.cavities,
                      patientData?.gingivitis,
                      patientData?.bruxism,
                      patientData?.sensitivity,
                      patientData?.other_issues
                    ].filter(Boolean).length}
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={FiActivity} color="blue.500" />
                  <Text fontSize="sm" color="blue.500">
                    Tratamientos activos: {patientData?.active_treatments ? 'Sí' : 'No'}
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={FiTarget} color="purple.500" />
                  <Text fontSize="sm" color="purple.500">
                    Seguimiento requerido: {reportData?.follow_up_required ? 'Sí' : 'No'}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Recomendaciones basadas en datos */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color={headingColor}>
            <HStack>
              <Icon as={FiZap} color="yellow.500" />
              <Text>Recomendaciones Inteligentes</Text>
            </HStack>
          </Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <VStack align="start" spacing={3}>
              <Text fontSize="sm" fontWeight="bold" color={headingColor}>
                Acciones Inmediatas
              </Text>
              {healthScore < 70 && (
                <HStack>
                  <Icon as={FiAlertTriangle} color="red.500" />
                  <Text fontSize="sm" color="red.500">
                    Programar consulta de seguimiento
                  </Text>
                </HStack>
              )}
              {patientData?.brushings_per_day < 2 && (
                <HStack>
                  <Icon as={FiActivity} color="orange.500" />
                  <Text fontSize="sm" color="orange.500">
                    Mejorar frecuencia de cepillado
                  </Text>
                </HStack>
              )}
              {!patientData?.floss && (
                <HStack>
                  <Icon as={FiCheckCircle} color="blue.500" />
                  <Text fontSize="sm" color="blue.500">
                    Incorporar uso de hilo dental
                  </Text>
                </HStack>
              )}
            </VStack>
            
            <VStack align="start" spacing={3}>
              <Text fontSize="sm" fontWeight="bold" color={headingColor}>
                Objetivos a Largo Plazo
              </Text>
              <HStack>
                <Icon as={FiTarget} color="green.500" />
                <Text fontSize="sm" color="green.500">
                  Mantener puntuación &gt; 80
                </Text>
              </HStack>
              <HStack>
                <Icon as={FiHeart} color="green.500" />
                <Text fontSize="sm" color="green.500">
                  Visitas preventivas regulares
                </Text>
              </HStack>
              <HStack>
                <Icon as={FiShield} color="green.500" />
                <Text fontSize="sm" color="green.500">
                  Prevención de problemas futuros
                </Text>
              </HStack>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default SimpleCharts
