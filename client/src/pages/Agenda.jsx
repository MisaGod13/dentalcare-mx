import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { supabase } from '../supabaseClient'
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Grid,
  Card,
  CardBody,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon
} from '@chakra-ui/react'
import { 
  FiCalendar, 
  FiPlus, 
  FiUsers,
  FiClock,
  FiTrendingUp
} from 'react-icons/fi'
import Calendar from '../components/Calendar'

export default function Agenda() {
  const navigate = useNavigate()
  const toast = useToast()
  
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [viewMode, setViewMode] = useState('month')
  
  // Función para verificar la estructura de la base de datos
  const checkDatabaseStructure = async () => {
    try {
      console.log('Verificando estructura de la base de datos...')
      
      // Verificar si la tabla appointments existe
      const { data: tableInfo, error: tableError } = await supabase
        .from('appointments')
        .select('*')
        .limit(1)
      
      if (tableError) {
        console.error('Error al verificar tabla appointments:', tableError)
        toast({
          title: 'Error de Base de Datos',
          description: 'La tabla de citas no está disponible. Verifica la migración.',
          status: 'error',
          duration: 10000,
          isClosable: true
        })
        return
      }
      
      console.log('Tabla appointments verificada correctamente')
      
      // Verificar si hay pacientes
      const { data: patientsCheck, error: patientsError } = await supabase
        .from('patients')
        .select('id, name')
        .limit(1)
      
      if (patientsError) {
        console.error('Error al verificar tabla patients:', patientsError)
      } else {
        console.log('Tabla patients verificada correctamente')
      }
      
    } catch (error) {
      console.error('Error al verificar estructura de BD:', error)
    }
  }
  
  // Lista de tipos de citas
  const appointmentTypes = [
    'consulta',
    'limpieza',
    'extraccion',
    'ortodoncia',
    'endodoncia',
    'cirugia',
    'revision',
    'emergencia'
  ]
  
  useEffect(() => {
    checkDatabaseStructure()
    loadAppointments()
    loadPatients()
    loadStats()
  }, [])
  
  const loadAppointments = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (
            id,
            name,
            email,
            phone
          )
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
      
      if (error) throw error
      
      setAppointments(data || [])
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar las citas',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }
  
  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, email')
        .order('name')
      
      if (error) throw error
      
      setPatients(data || [])
    } catch (error) {
      console.error('Error loading patients:', error)
    }
  }
  
  const loadStats = async () => {
    try {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const endOfMonth = new Date()
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      endOfMonth.setDate(0)
      endOfMonth.setHours(23, 59, 59, 999)
      
      const { data, error } = await supabase
        .rpc('get_appointment_stats', {
          start_date: startOfMonth.toISOString().split('T')[0],
          end_date: endOfMonth.toISOString().split('T')[0]
        })
      
      if (error) throw error
      
      setStats(data?.[0] || {})
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }
  
  const handleAppointmentCreate = async (appointmentData) => {
    try {
      console.log('Intentando crear cita con datos:', appointmentData)
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
      
      if (error) {
        console.error('Error de Supabase al crear cita:', error)
        throw error
      }
      
      console.log('Cita creada exitosamente:', data)
      
      await loadAppointments()
      await loadStats()
      
      return Promise.resolve()
    } catch (error) {
      console.error('Error completo al crear appointment:', error)
      return Promise.reject(error)
    }
  }
  
  const handleAppointmentUpdate = async (appointmentId, appointmentData) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', appointmentId)
      
      if (error) throw error
      
      await loadAppointments()
      await loadStats()
      
      return Promise.resolve()
    } catch (error) {
      console.error('Error updating appointment:', error)
      return Promise.reject(error)
    }
  }
  
  const handleAppointmentDelete = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)
      
      if (error) throw error
      
      await loadAppointments()
      await loadStats()
      
      return Promise.resolve()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      return Promise.reject(error)
    }
  }
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando agenda...</Text>
        </VStack>
      </Box>
    )
  }
  
  return (
    <Box p={6}>
      <VStack spacing={6} align='stretch'>
        {/* Header */}
        <HStack justify='space-between' align='center'>
          <VStack align='start' spacing={2}>
            <Heading 
              size='xl'
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              bgClip='text'
              fontWeight='bold'
            >
              <span className="emoji-original">📅</span> Agenda de Citas
            </Heading>
            <Text color='gray.600'>
              Gestiona las citas y horarios de la clínica
            </Text>
          </VStack>
          
          <HStack spacing={4}>
            
            <Button
              leftIcon={<FiPlus />}
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              color='white'
              onClick={() => {
                // Esto se maneja desde el calendario
                console.log('Nueva cita desde botón principal')
              }}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
              }}
            >
              Nueva Cita
            </Button>
          </HStack>
        </HStack>
        
        {/* Estadísticas */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Citas</StatLabel>
                <StatNumber>{stats.total_appointments || 0}</StatNumber>
                <StatHelpText>Este mes</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Completadas</StatLabel>
                <StatNumber color="green.500">{stats.completed_appointments || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {stats.total_appointments ? Math.round((stats.completed_appointments / stats.total_appointments) * 100) : 0}%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Canceladas</StatLabel>
                <StatNumber color="red.500">{stats.cancelled_appointments || 0}</StatNumber>
                <StatHelpText>Este mes</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>No Asistieron</StatLabel>
                <StatNumber color="gray.500">{stats.no_show_appointments || 0}</StatNumber>
                <StatHelpText>Este mes</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>
        
        {/* Tabs para diferentes vistas */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiCalendar} />
                <Text>Calendario</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiUsers} />
                <Text>Pacientes</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiTrendingUp} />
                <Text>Reportes</Text>
              </HStack>
            </Tab>
          </TabList>
          
          <TabPanels>
            {/* Tab del Calendario */}
            <TabPanel>
              <Calendar
                appointments={appointments}
                onAppointmentCreate={handleAppointmentCreate}
                onAppointmentUpdate={handleAppointmentUpdate}
                onAppointmentDelete={handleAppointmentDelete}
                patients={patients}
                appointmentTypes={appointmentTypes}
              />
            </TabPanel>
            
            {/* Tab de Pacientes */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="gray.700">
                  Pacientes con Citas Programadas
                </Heading>
                
                {patients.length === 0 ? (
                  <Text color="gray.500" textAlign="center">
                    No hay pacientes registrados
                  </Text>
                ) : (
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                    {patients.map(patient => {
                      const patientAppointments = appointments.filter(apt => apt.patient_id === patient.id)
                      const upcomingAppointments = patientAppointments.filter(apt => 
                        apt.status === 'programada' || apt.status === 'confirmada'
                      )
                      
                      return (
                        <Card key={patient.id} variant="outline">
                          <CardBody>
                            <VStack spacing={3} align="start">
                              <Text fontWeight="bold" fontSize="lg">
                                {patient.name}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {patient.email}
                              </Text>
                              
                              <HStack spacing={4}>
                                <HStack spacing={1}>
                                  <Icon as={FiCalendar} color="blue.500" />
                                  <Text fontSize="sm">
                                    {patientAppointments.length} citas total
                                  </Text>
                                </HStack>
                                
                                <HStack spacing={1}>
                                  <Icon as={FiClock} color="green.500" />
                                  <Text fontSize="sm">
                                    {upcomingAppointments.length} próximas
                                  </Text>
                                </HStack>
                              </HStack>
                              
                              {upcomingAppointments.length > 0 && (
                                <VStack spacing={1} align="start" w="full">
                                  <Text fontSize="xs" fontWeight="bold" color="gray.600">
                                    Próximas citas:
                                  </Text>
                                  {upcomingAppointments.slice(0, 2).map(appointment => (
                                    <Text key={appointment.id} fontSize="xs" color="gray.500">
                                      {new Date(appointment.appointment_date).toLocaleDateString('es-ES')} - {appointment.appointment_time}
                                    </Text>
                                  ))}
                                  {upcomingAppointments.length > 2 && (
                                    <Text fontSize="xs" color="blue.500">
                                      +{upcomingAppointments.length - 2} más...
                                    </Text>
                                  )}
                                </VStack>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      )
                    })}
                  </Grid>
                )}
              </VStack>
            </TabPanel>
            
            {/* Tab de Reportes */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color="gray.700">
                  Reportes y Estadísticas
                </Heading>
                
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <Card>
                    <CardBody>
                      <VStack spacing={4} align="start">
                        <Heading size="sm" color="gray.700">
                          Resumen Mensual
                        </Heading>
                        
                        <VStack spacing={2} align="start" w="full">
                          <HStack justify="space-between" w="full">
                            <Text>Total de citas:</Text>
                            <Text fontWeight="bold">{stats.total_appointments || 0}</Text>
                          </HStack>
                          
                          <HStack justify="space-between" w="full">
                            <Text>Completadas:</Text>
                            <Text fontWeight="bold" color="green.500">{stats.completed_appointments || 0}</Text>
                          </HStack>
                          
                          <HStack justify="space-between" w="full">
                            <Text>Canceladas:</Text>
                            <Text fontWeight="bold" color="red.500">{stats.cancelled_appointments || 0}</Text>
                          </HStack>
                          
                          <HStack justify="space-between" w="full">
                            <Text>No asistieron:</Text>
                            <Text fontWeight="bold" color="gray.500">{stats.no_show_appointments || 0}</Text>
                          </HStack>
                          
                          <HStack justify="space-between" w="full">
                            <Text>Duración promedio:</Text>
                            <Text fontWeight="bold">{stats.average_duration_minutes || 0} min</Text>
                          </HStack>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardBody>
                      <VStack spacing={4} align="start">
                        <Heading size="sm" color="gray.700">
                          Funcionalidades Futuras
                        </Heading>
                        
                        <VStack spacing={3} align="start" w="full">
                          <HStack spacing={3}>
                            <Icon as={FiCalendar} color="blue.500" />
                            <Text fontSize="sm">Vista semanal y diaria</Text>
                          </HStack>
                          
                          <HStack spacing={3}>
                            <Icon as={FiClock} color="green.500" />
                            <Text fontSize="sm">Recordatorios automáticos</Text>
                          </HStack>
                          
                          <HStack spacing={3}>
                            <Icon as={FiUsers} color="purple.500" />
                            <Text fontSize="sm">Múltiples doctores</Text>
                          </HStack>
                          
                          <HStack spacing={3}>
                            <Icon as={FiTrendingUp} color="orange.500" />
                            <Text fontSize="sm">Reportes avanzados</Text>
                          </HStack>
                          
                          <HStack spacing={3}>
                            <Icon as={FiCalendar} color="teal.500" />
                            <Text fontSize="sm">Sincronización con Google Calendar</Text>
                          </HStack>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}
