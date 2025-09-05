import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Alert,
  AlertIcon,
  useToast,
  IconButton,
  Tooltip,
  Switch,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react'
import { 
  FiUserPlus, 
  FiUsers, 
  FiCheck, 
  FiX, 
  FiEye, 
  FiEdit3, 
  FiTrash2,
  FiShield,
  FiMail,
  FiClock
} from 'react-icons/fi'
import { supabase } from '../supabaseClient'
import { createPatientUser, updatePatientProfile } from '../supabaseAdminClient'

export default function PatientAccountManager() {
  const [patients, setPatients] = useState([])
  const [accountRequests, setAccountRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    permissions: {
      view_medical_history: true,
      view_diagnoses: true,
      schedule_appointments: true,
      view_consultations: true,
      chat_with_ai: true
    }
  })
  const [showInstructions, setShowInstructions] = useState(false)
  const [selectedCredentials, setSelectedCredentials] = useState(null)
  // Estado para almacenar credenciales generadas
  const [generatedCredentials, setGeneratedCredentials] = useState({})
  const toast = useToast()

  // Función para generar contraseñas temporales
  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Obtener pacientes del dentista
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .order('name')

      if (patientsError) throw patientsError

      // Obtener solicitudes de cuenta
      const { data: requestsData, error: requestsError } = await supabase
        .from('patient_account_requests')
        .select(`
          *,
          patients(name, email)
        `)
        .order('created_at', { ascending: false })

      if (requestsError) throw requestsError

      setPatients(patientsData || [])
      setAccountRequests(requestsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccountRequest = async (patientId) => {
    try {
      const { error } = await supabase
        .from('patient_account_requests')
        .insert({
          patient_id: patientId,
          dentist_id: (await supabase.auth.getUser()).data.user.id
        })

      if (error) throw error

      toast({
        title: 'Solicitud creada',
        description: 'Se ha enviado la solicitud para crear la cuenta del paciente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      fetchData()
    } catch (error) {
      console.error('Error creating account request:', error)
      toast({
        title: 'Error',
        description: 'No se pudo crear la solicitud',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }

  const handleApproveRequest = async (requestId, patientId) => {
    try {
      // Obtener información del paciente
      const patient = patients.find(p => p.id === patientId)
      if (!patient) throw new Error('Paciente no encontrado')

      // Generar credenciales temporales
      const tempPassword = generateTempPassword()
      const patientEmail = patient.email || `${patient.name.toLowerCase().replace(/\s+/g, '.')}@dentalcare.com`

      // Obtener ID del dentista actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Crear usuario real en Supabase Auth usando el cliente admin
      const createUserResult = await createPatientUser(patientEmail, tempPassword, {
        patient_id: patientId,
        name: patient.name,
        dentist_id: user.id
      })

      if (!createUserResult.success) {
        throw new Error(createUserResult.error || 'Error al crear usuario')
      }

      const newUserId = createUserResult.user.id

      // Actualizar perfil del paciente
      const profileResult = await updatePatientProfile(newUserId, patientId)
      if (!profileResult.success) {
        throw new Error('Error al actualizar perfil del paciente')
      }

      // Crear permisos por defecto para el paciente
      const { error: permissionsError } = await supabase
        .from('patient_permissions')
        .insert([
          { patient_id: patientId, permission_type: 'view_medical_history', granted_by: user.id },
          { patient_id: patientId, permission_type: 'view_diagnoses', granted_by: user.id },
          { patient_id: patientId, permission_type: 'schedule_appointments', granted_by: user.id },
          { patient_id: patientId, permission_type: 'view_consultations', granted_by: user.id },
          { patient_id: patientId, permission_type: 'chat_with_ai', granted_by: user.id }
        ])

      if (permissionsError) throw permissionsError

      // Actualizar estado de la solicitud con las credenciales
      const { error: updateError } = await supabase
        .from('patient_account_requests')
        .update({ 
          status: 'approved', 
          approval_date: new Date().toISOString(),
          credentials_generated: true,
          temp_password: tempPassword,
          auth_user_id: newUserId
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      // Almacenar credenciales en el estado local
      setGeneratedCredentials(prev => ({
        ...prev,
        [requestId]: {
          email: patientEmail,
          password: tempPassword,
          patientName: patient.name
        }
      }))

      // Crear notificación para el paciente
      await supabase
        .from('patient_notifications')
        .insert({
          patient_id: patientId,
          notification_type: 'general',
          title: 'Cuenta de acceso creada',
          message: `Tu cuenta de acceso ha sido creada exitosamente. Email: ${patientEmail}, Contraseña temporal: ${tempPassword}. Por favor, cambia tu contraseña en tu primer acceso.`,
          is_read: false
        })

      toast({
        title: 'Cuenta aprobada',
        description: `¡Usuario real creado exitosamente! Email: ${patientEmail}, Contraseña: ${tempPassword}. El paciente puede loguearse en /patient-login.`,
        status: 'success',
        duration: 8000,
        isClosable: true
      })

      fetchData()
    } catch (error) {
      console.error('Error approving request:', error)
      toast({
        title: 'Error',
        description: 'No se pudo aprobar la solicitud: ' + error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }

  const handleRejectRequest = async (requestId, reason) => {
    try {
      const { error } = await supabase
        .from('patient_account_requests')
        .update({ 
          status: 'rejected', 
          rejection_reason: reason 
        })
        .eq('id', requestId)

      if (error) throw error

      toast({
        title: 'Solicitud rechazada',
        description: 'La solicitud ha sido rechazada',
        status: 'info',
        duration: 3000,
        isClosable: true
      })

      fetchData()
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast({
        title: 'Error',
        description: 'No se pudo rechazar la solicitud',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', text: 'Pendiente' },
      approved: { color: 'green', text: 'Aprobada' },
      rejected: { color: 'red', text: 'Rechazada' },
      expired: { color: 'gray', text: 'Expirada' }
    }

    const config = statusConfig[status] || statusConfig.pending
    return <Badge colorScheme={config.color}>{config.text}</Badge>
  }

  const getPermissionIcon = (permission) => {
    const permissionIcons = {
      view_medical_history: '📋',
      view_diagnoses: '🔍',
      schedule_appointments: '📅',
      view_consultations: '👨‍⚕️',
      chat_with_ai: '🤖'
    }
    return permissionIcons[permission] || '❓'
  }

  const getPermissionLabel = (permission) => {
    const permissionLabels = {
      view_medical_history: 'Ver historial médico',
      view_diagnoses: 'Ver diagnósticos',
      schedule_appointments: 'Agendar citas',
      view_consultations: 'Ver consultas',
      chat_with_ai: 'Chat con IA'
    }
    return permissionLabels[permission] || permission
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Gestión de Cuentas de Pacientes
          </Heading>
          <Text color="gray.600">
            Administra las cuentas de acceso de tus pacientes y sus permisos
          </Text>
        </Box>

        {/* Estadísticas rápidas */}
        <HStack spacing={4}>
          <Card flex={1}>
            <CardBody>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {patients.length}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Pacientes totales
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card flex={1}>
            <CardBody>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                  {accountRequests.filter(r => r.status === 'pending').length}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Solicitudes pendientes
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card flex={1}>
            <CardBody>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {accountRequests.filter(r => r.status === 'approved').length}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Cuentas activas
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </HStack>

        {/* Solicitudes de cuenta */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="md">Solicitudes de Cuenta</Heading>
                <Badge colorScheme="blue" variant="subtle">
                  {accountRequests.length} solicitudes
                </Badge>
              </HStack>

              {accountRequests.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>
                  No hay solicitudes de cuenta pendientes
                </Text>
              ) : (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Paciente</Th>
                      <Th>Email</Th>
                      <Th>Fecha</Th>
                      <Th>Estado</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {accountRequests.map((request) => (
                      <Tr key={request.id}>
                        <Td>{request.patients?.name || 'N/A'}</Td>
                        <Td>{request.patients?.email || 'N/A'}</Td>
                        <Td>
                          <HStack>
                            <FiClock />
                            <Text fontSize="sm">
                              {new Date(request.created_at).toLocaleDateString()}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>{getStatusBadge(request.status)}</Td>
                        <Td>
                          <HStack spacing={2}>
                            {request.status === 'pending' && (
                              <>
                                <Tooltip label="Aprobar solicitud">
                                  <IconButton
                                    icon={<FiCheck />}
                                    colorScheme="green"
                                    size="sm"
                                    onClick={() => handleApproveRequest(request.id, request.patient_id)}
                                  />
                                </Tooltip>
                                <Tooltip label="Rechazar solicitud">
                                  <IconButton
                                    icon={<FiX />}
                                    colorScheme="red"
                                    size="sm"
                                    onClick={() => handleRejectRequest(request.id, 'Rechazada por el dentista')}
                                  />
                                </Tooltip>
                              </>
                            )}
                            {request.status === 'rejected' && (
                              <Text fontSize="sm" color="gray.500">
                                {request.rejection_reason}
                              </Text>
                            )}
                                                         {request.status === 'approved' && (
                               <VStack spacing={1} align="start">
                                 {request.credentials_generated && request.temp_password ? (
                                   <>
                                     <Text fontSize="xs" fontWeight="bold" color="green.600">✅ Credenciales generadas:</Text>
                                     <Text fontSize="xs" fontFamily="mono" bg="green.100" p={1} borderRadius="sm">
                                       Email: {request.patients?.email || `${request.patients?.name?.toLowerCase().replace(/\s+/g, '.')}@dentalcare.com`}
                                     </Text>
                                     <Text fontSize="xs" fontFamily="mono" bg="green.100" p={1} borderRadius="sm">
                                       Contraseña: {request.temp_password}
                                     </Text>
                                     <Button
                                       size="xs"
                                       colorScheme="blue"
                                       onClick={() => {
                                         const credentials = `Email: ${request.patients?.email || `${request.patients?.name?.toLowerCase().replace(/\s+/g, '.')}@dentalcare.com`}\nContraseña: ${request.temp_password}`
                                         navigator.clipboard.writeText(credentials)
                                         toast({
                                           title: 'Credenciales copiadas',
                                           description: 'Las credenciales han sido copiadas al portapapeles',
                                           status: 'success',
                                           duration: 2000,
                                           isClosable: true
                                         })
                                       }}
                                     >
                                       Copiar credenciales
                                     </Button>
                                   </>
                                 ) : (
                                   <Text fontSize="xs" color="orange.600">⏳ Generando credenciales...</Text>
                                 )}
                               </VStack>
                             )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Lista de pacientes */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Pacientes y Cuentas</Heading>
              
              {patients.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>
                  No hay pacientes registrados
                </Text>
              ) : (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Nombre</Th>
                      <Th>Email</Th>
                      <Th>Estado de cuenta</Th>
                      <Th>Credenciales</Th>
                      <Th>Permisos</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {patients.map((patient) => {
                      const hasAccount = accountRequests.some(
                        req => req.patient_id === patient.id && req.status === 'approved'
                      )
                      const pendingRequest = accountRequests.find(
                        req => req.patient_id === patient.id && req.status === 'pending'
                      )

                      return (
                        <Tr key={patient.id}>
                          <Td>{patient.name}</Td>
                          <Td>{patient.email || 'No registrado'}</Td>
                          <Td>
                            {hasAccount ? (
                              <Badge colorScheme="green">Cuenta activa</Badge>
                            ) : pendingRequest ? (
                              <Badge colorScheme="yellow">Solicitud pendiente</Badge>
                            ) : (
                              <Badge colorScheme="gray">Sin cuenta</Badge>
                            )}
                          </Td>
                          <Td>
                            {hasAccount ? (
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" fontWeight="bold">Email:</Text>
                                <Text fontSize="xs" fontFamily="mono" bg="gray.100" p={1} borderRadius="sm">
                                  {(() => {
                                    const approvedRequest = accountRequests.find(req => req.patient_id === patient.id && req.status === 'approved')
                                    return approvedRequest?.patients?.email || `${patient.name.toLowerCase().replace(/\s+/g, '.')}@dentalcare.com`
                                  })()}
                                </Text>
                                <Text fontSize="xs" fontWeight="bold">Contraseña:</Text>
                                <Text fontSize="xs" fontFamily="mono" bg="gray.100" p={1} borderRadius="sm">
                                  {(() => {
                                    const approvedRequest = accountRequests.find(req => req.patient_id === patient.id && req.status === 'approved')
                                    return approvedRequest?.temp_password || 'Generada'
                                  })()}
                                </Text>
                                <HStack spacing={1}>
                                  <Button
                                    size="xs"
                                    colorScheme="blue"
                                    onClick={() => {
                                      const approvedRequest = accountRequests.find(req => req.patient_id === patient.id && req.status === 'approved')
                                      if (approvedRequest?.temp_password) {
                                        const email = approvedRequest.patients?.email || `${patient.name.toLowerCase().replace(/\s+/g, '.')}@dentalcare.com`
                                        const credentials = `Email: ${email}\nContraseña: ${approvedRequest.temp_password}`
                                        navigator.clipboard.writeText(credentials)
                                        toast({
                                          title: 'Credenciales copiadas',
                                          description: 'Las credenciales han sido copiadas al portapapeles',
                                          status: 'success',
                                          duration: 2000,
                                          isClosable: true
                                        })
                                      }
                                    }}
                                  >
                                    Copiar credenciales
                                  </Button>
                                  <Button
                                    size="xs"
                                    colorScheme="green"
                                    onClick={() => {
                                      const approvedRequest = accountRequests.find(req => req.patient_id === patient.id && req.status === 'approved')
                                      if (approvedRequest?.temp_password) {
                                        const email = approvedRequest.patients?.email || `${patient.name.toLowerCase().replace(/\s+/g, '.')}@dentalcare.com`
                                        setSelectedCredentials({
                                          email: email,
                                          password: approvedRequest.temp_password,
                                          patientName: patient.name
                                        })
                                        setShowInstructions(true)
                                      }
                                    }}
                                  >
                                    Ver instrucciones
                                  </Button>
                                </HStack>
                              </VStack>
                            ) : pendingRequest ? (
                              <Text fontSize="sm" color="gray.500">
                                Pendiente de aprobación
                              </Text>
                            ) : (
                              <Text fontSize="sm" color="gray.500">
                                Sin credenciales
                              </Text>
                            )}
                          </Td>
                          <Td>
                            {hasAccount ? (
                              <HStack spacing={1}>
                                <FiShield color="green" />
                                <Text fontSize="sm">Permisos activos</Text>
                              </HStack>
                            ) : (
                              <Text fontSize="sm" color="gray.500">
                                Sin permisos
                              </Text>
                            )}
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              {!hasAccount && !pendingRequest && (
                                <Tooltip label="Crear solicitud de cuenta">
                                  <IconButton
                                    icon={<FiUserPlus />}
                                    colorScheme="blue"
                                    size="sm"
                                    onClick={() => handleCreateAccountRequest(patient.id)}
                                  />
                                </Tooltip>
                              )}
                              {hasAccount && (
                                <Tooltip label="Ver permisos">
                                  <IconButton
                                    icon={<FiEye />}
                                    colorScheme="blue"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPatient(patient)
                                      onOpen()
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </HStack>
                          </Td>
                        </Tr>
                      )
                    })}
                  </Tbody>
                </Table>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Modal para ver detalles del paciente */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Detalles de la cuenta de {selectedPatient?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPatient && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Información del paciente:
                  </Text>
                  <Text>Nombre: {selectedPatient.name}</Text>
                  <Text>Email: {selectedPatient.email || 'No registrado'}</Text>
                  <Text>Edad: {selectedPatient.age || 'No especificada'}</Text>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Permisos activos:
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {Object.entries(formData.permissions).map(([permission, isGranted]) => (
                      <HStack key={permission} justify="space-between">
                        <HStack>
                          <Text>{getPermissionIcon(permission)}</Text>
                          <Text fontSize="sm">
                            {getPermissionLabel(permission)}
                          </Text>
                        </HStack>
                        <Badge colorScheme={isGranted ? 'green' : 'gray'}>
                          {isGranted ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Actividad reciente:
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Último acceso: {new Date().toLocaleDateString()}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Estado: Activo
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de instrucciones para el paciente */}
      <Modal isOpen={showInstructions} onClose={() => setShowInstructions(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Instrucciones de acceso para {selectedCredentials?.patientName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Credenciales de acceso:</Text>
                  <Text fontSize="sm" fontFamily="mono" bg="blue.50" p={2} borderRadius="sm" mt={2}>
                    Email: {selectedCredentials?.email}
                  </Text>
                  <Text fontSize="sm" fontFamily="mono" bg="blue.50" p={2} borderRadius="sm">
                    Contraseña temporal: {selectedCredentials?.password}
                  </Text>
                </Box>
              </Alert>

              <Box>
                <Text fontWeight="bold" mb={3}>Instrucciones para el paciente:</Text>
                <VStack spacing={3} align="stretch">
                  <Box>
                    <Text fontWeight="semibold" color="blue.600">1. Acceso inicial:</Text>
                    <Text fontSize="sm" color="gray.600">
                      • Ve a la página de login de DentalCareMX
                      • Usa el email y contraseña mostrados arriba
                      • Haz clic en "Iniciar sesión"
                    </Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold" color="blue.600">2. Cambio de contraseña (obligatorio):</Text>
                    <Text fontSize="sm" color="gray.600">
                      • En tu primer acceso, el sistema te pedirá cambiar la contraseña
                      • Crea una contraseña segura que puedas recordar
                      • La contraseña debe tener al menos 8 caracteres
                    </Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold" color="blue.600">3. Funcionalidades disponibles:</Text>
                    <Text fontSize="sm" color="gray.600">
                      • Ver tu historial médico
                      • Consultar diagnósticos
                      • Agendar citas
                      • Ver consultas previas
                      • Chat con asistente virtual personalizado
                    </Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold" color="blue.600">4. Soporte:</Text>
                    <Text fontSize="sm" color="gray.600">
                      • Si tienes problemas para acceder, contacta a tu dentista
                      • Las credenciales son personales e intransferibles
                      • Mantén tu contraseña en un lugar seguro
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => setShowInstructions(false)}>
              Entendido
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
