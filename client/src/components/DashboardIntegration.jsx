import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  Badge,
  useColorModeValue,
  useToast,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Divider
} from '@chakra-ui/react'
import { 
  FiUsers, 
  FiUserPlus, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle,
  FiMessageSquare,
  FiCalendar
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function DashboardIntegration() {
  const [patientStats, setPatientStats] = useState({
    totalPatients: 0,
    activeAccounts: 0,
    pendingRequests: 0,
    pendingAppointments: 0
  })
  const [loading, setLoading] = useState(true)
  
  const toast = useToast()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    fetchPatientStats()
  }, [])

  const fetchPatientStats = async () => {
    try {
      setLoading(true)
      
      // Obtener estadísticas de pacientes
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })

      // Obtener cuentas activas
      const { count: activeAccounts } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'patient')
        .eq('is_active', true)

      // Obtener solicitudes pendientes de cuenta
      const { count: pendingRequests } = await supabase
        .from('patient_account_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Obtener citas solicitadas por pacientes
      const { count: pendingAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'solicitada')

      setPatientStats({
        totalPatients: totalPatients || 0,
        activeAccounts: activeAccounts || 0,
        pendingRequests: pendingRequests || 0,
        pendingAppointments: pendingAppointments || 0
      })
    } catch (error) {
      console.error('Error fetching patient stats:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las estadísticas',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header de integración */}
        <Box>
          <Heading size="lg" mb={2}>
            Sistema de Pacientes Integrado
          </Heading>
          <Text color="gray.600">
            Gestión completa de cuentas de pacientes y sus funcionalidades
          </Text>
        </Box>

        {/* Estadísticas principales */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Total Pacientes</StatLabel>
                <StatNumber color="blue.500">{patientStats.totalPatients}</StatNumber>
                <StatHelpText>Registrados en el sistema</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Cuentas Activas</StatLabel>
                <StatNumber color="green.500">{patientStats.activeAccounts}</StatNumber>
                <StatHelpText>Con acceso al dashboard</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Solicitudes Pendientes</StatLabel>
                <StatNumber color="yellow.500">{patientStats.pendingRequests}</StatNumber>
                <StatHelpText>Cuentas por aprobar</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Citas Solicitadas</StatLabel>
                <StatNumber color="orange.500">{patientStats.pendingAppointments}</StatNumber>
                <StatHelpText>Por revisar</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Acciones rápidas */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Acciones Rápidas</Heading>
              
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <Link to="/patient-accounts">
                  <Button
                    leftIcon={<FiUsers />}
                    variant="ghost"
                    size="lg"
                    justifyContent="flex-start"
                    p={4}
                    borderRadius="xl"
                    w="100%"
                    _hover={{
                      bg: 'blue.50',
                      transform: 'translateX(5px)'
                    }}
                    transition="all 0.3s ease"
                  >
                    Gestionar Cuentas de Pacientes
                  </Button>
                </Link>

                <Link to="/patients/new">
                  <Button
                    leftIcon={<FiUserPlus />}
                    variant="ghost"
                    size="lg"
                    justifyContent="flex-start"
                    p={4}
                    borderRadius="xl"
                    w="100%"
                    _hover={{
                      bg: 'green.50',
                      transform: 'translateX(5px)'
                    }}
                    transition="all 0.3s ease"
                  >
                    Registrar Nuevo Paciente
                  </Button>
                </Link>

                <Link to="/agenda">
                  <Button
                    leftIcon={<FiCalendar />}
                    variant="ghost"
                    size="lg"
                    justifyContent="flex-start"
                    p={4}
                    borderRadius="xl"
                    w="100%"
                    _hover={{
                      bg: 'purple.50',
                      transform: 'translateX(5px)'
                    }}
                    transition="all 0.3s ease"
                  >
                    Revisar Solicitudes de Citas
                  </Button>
                </Link>

                <Link to="/patients">
                  <Button
                    leftIcon={<FiMessageSquare />}
                    variant="ghost"
                    size="lg"
                    justifyContent="flex-start"
                    p={4}
                    borderRadius="xl"
                    w="100%"
                    _hover={{
                      bg: 'orange.50',
                      transform: 'translateX(5px)'
                    }}
                    transition="all 0.3s ease"
                  >
                    Ver Todos los Pacientes
                  </Button>
                </Link>
              </Grid>
            </VStack>
          </CardBody>
        </Card>

        {/* Alertas y notificaciones */}
        {(patientStats.pendingRequests > 0 || patientStats.pendingAppointments > 0) && (
          <Card bg="yellow.50" borderColor="yellow.200">
            <CardBody>
              <VStack spacing={3} align="stretch">
                <HStack>
                  <Icon as={FiAlertCircle} color="yellow.500" />
                  <Text fontWeight="bold" color="yellow.700">
                    Acciones Requeridas
                  </Text>
                </HStack>
                
                <VStack spacing={2} align="stretch">
                  {patientStats.pendingRequests > 0 && (
                    <HStack justify="space-between" p={3} bg="white" borderRadius="md">
                      <HStack>
                        <Icon as={FiUserPlus} color="blue.500" />
                        <Text>
                          {patientStats.pendingRequests} solicitud{patientStats.pendingRequests > 1 ? 'es' : ''} de cuenta pendiente{patientStats.pendingRequests > 1 ? 's' : ''}
                        </Text>
                      </HStack>
                      <Link to="/patient-accounts">
                        <Button size="sm" colorScheme="blue">
                          Revisar
                        </Button>
                      </Link>
                    </HStack>
                  )}

                  {patientStats.pendingAppointments > 0 && (
                    <HStack justify="space-between" p={3} bg="white" borderRadius="md">
                      <HStack>
                        <Icon as={FiClock} color="orange.500" />
                        <Text>
                          {patientStats.pendingAppointments} cita{patientStats.pendingAppointments > 1 ? 's' : ''} solicitada{patientStats.pendingAppointments > 1 ? 's' : ''} por paciente{patientStats.pendingAppointments > 1 ? 's' : ''}
                        </Text>
                      </HStack>
                      <Link to="/agenda">
                        <Button size="sm" colorScheme="orange">
                          Revisar
                        </Button>
                      </Link>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Información del sistema */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Información del Sistema</Heading>
              
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <Box>
                  <Text fontWeight="bold" mb={3}>Funcionalidades para Pacientes</Text>
                  <VStack spacing={2} align="stretch">
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontSize="sm">Dashboard personalizado</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontSize="sm">Historial médico completo</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontSize="sm">Asistente virtual personalizado</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontSize="sm">Solicitud de citas</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontSize="sm">Notificaciones automáticas</Text>
                    </HStack>
                  </VStack>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={3}>Herramientas para Dentistas</Text>
                  <VStack spacing={2} align="stretch">
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontSize="sm">Gestión de cuentas de pacientes</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontSize="sm">Control de permisos granulares</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontSize="sm">Revisión de solicitudes de citas</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontSize="sm">Sistema de notificaciones</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontSize="sm">Auditoría completa</Text>
                    </HStack>
                  </VStack>
                </Box>
              </Grid>

              <Divider />

              <Box textAlign="center">
                <Text fontSize="sm" color="gray.600">
                  El sistema está completamente integrado y listo para usar. 
                  Los pacientes pueden acceder a su información médica de forma segura 
                  y los dentistas tienen control total sobre las cuentas y permisos.
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}


