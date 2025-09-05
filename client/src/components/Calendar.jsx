

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  GridItem,
  Text,
  VStack,
  HStack,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Tooltip,
  Icon,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { 
  FiCalendar, 
  FiClock, 
  FiEdit3, 
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiPlus
} from 'react-icons/fi'
import WeekView from './WeekView'
import DayView from './DayView'

export default function Calendar({ 
  appointments, 
  onAppointmentUpdate, 
  onAppointmentDelete,
  onAppointmentCreate,
  patients,
  appointmentTypes,
  isPatientView = false,
  patientId = null
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [viewMode, setViewMode] = useState('month') // 'month', 'week', 'day'
  
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  
  const toast = useToast()
  
  // Estado para editar cita
  const [editAppointment, setEditAppointment] = useState({
    patient_id: '',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 60,
    appointment_type: '',
    reason: '',
    notes: '',
    status: ''
  })
  
  // Estado para nueva cita
  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 60,
    appointment_type: '',
    reason: '',
    notes: ''
  })
  
  // Estados de citas
  const appointmentStatuses = [
    'programada',
    'confirmada',
    'en_proceso',
    'completada',
    'cancelada',
    'no_show'
  ]
  
  useEffect(() => {
    if (selectedDate) {
      setNewAppointment(prev => ({
        ...prev,
        appointment_date: selectedDate.toISOString().split('T')[0]
      }))
    }
  }, [selectedDate])
  
  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay())
    
    const days = []
    const currentDay = new Date(startDate)
    
    while (currentDay <= lastDay || currentDay.getDay() !== 0) {
      days.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }
    
    return days
  }
  
  const getAppointmentsForDate = (date) => {
    // Crear una fecha local sin zona horaria para comparar
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    let filteredAppointments = appointments.filter(apt => apt.appointment_date === dateStr)
    
    // Si es vista de paciente, solo mostrar sus citas
    if (isPatientView && patientId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.patient_id === patientId)
    }
    
    return filteredAppointments
  }
  
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth()
  }
  
  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString()
  }
  
  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }
  
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }
  
  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }
  
  const navigateDay = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + direction)
    setCurrentDate(newDate)
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }
  
  const handleDateClick = (date) => {
    setSelectedDate(date)
    onCreateOpen()
  }
  
  const handleAppointmentClick = (appointment, e) => {
    e.stopPropagation()
    setSelectedAppointment(appointment)
    setEditAppointment({
      patient_id: appointment.patient_id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      duration_minutes: appointment.duration_minutes,
      appointment_type: appointment.appointment_type,
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      status: appointment.status
    })
    onEditOpen()
  }
  
  const handleAppointmentEdit = (appointment) => {
    setSelectedAppointment(appointment)
    setEditAppointment({
      patient_id: appointment.patient_id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      duration_minutes: appointment.duration_minutes,
      appointment_type: appointment.appointment_type,
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      status: appointment.status
    })
    onEditOpen()
  }
  
  const handleAppointmentDelete = (appointment) => {
    setSelectedAppointment(appointment)
    onDeleteOpen()
  }
  
  const handleAppointmentCreate = (date, timeSlot = null) => {
    setSelectedDate(date)
    if (timeSlot) {
      setNewAppointment(prev => ({
        ...prev,
        appointment_date: date.toISOString().split('T')[0],
        appointment_time: timeSlot
      }))
    }
    onCreateOpen()
  }
  
  // Función para verificar conflictos de horario
  const checkTimeConflict = (date, time, duration, excludeAppointmentId = null) => {
    try {
      console.log('checkTimeConflict llamada con:', { date, time, duration, excludeAppointmentId });
      
      // Asegurar que date sea una fecha válida
      let dateStr;
      if (date instanceof Date) {
        // Crear una fecha local sin zona horaria para comparar
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        dateStr = `${year}-${month}-${day}`
        console.log('Fecha convertida desde Date:', dateStr);
      } else if (typeof date === 'string') {
        dateStr = date; // date ya es un string en formato YYYY-MM-DD
        console.log('Fecha usada como string:', dateStr);
      } else {
        console.error('Fecha inválida en checkTimeConflict:', date, 'Tipo:', typeof date);
        return false;
      }
      
      const startTime = new Date(`2000-01-01T${time}`);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      console.log('Rango de tiempo a verificar:', startTime.toTimeString(), 'a', endTime.toTimeString());
      
      const conflictingAppointments = appointments.filter(apt => {
        if (apt.appointment_date !== dateStr) return false;
        if (excludeAppointmentId && apt.id === excludeAppointmentId) return false;
        if (apt.status === 'cancelada' || apt.status === 'no_show') return false;
        
        const aptStartTime = new Date(`2000-01-01T${apt.appointment_time}`);
        const aptEndTime = new Date(aptStartTime.getTime() + apt.duration_minutes * 60000);
        
        // Verificar si hay solapamiento
        return (startTime < aptEndTime && endTime > aptStartTime);
      });
      
      console.log('Citas conflictivas encontradas:', conflictingAppointments.length);
      return conflictingAppointments.length > 0;
    } catch (error) {
      console.error('Error en checkTimeConflict:', error);
      return false;
    }
  }
  
  const handleEditAppointment = async () => {
    try {
      // Modo paciente: no se permiten cambios ni cancelaciones desde el calendario
      if (isPatientView) {
        toast({
          title: 'Solo lectura',
          description: 'Para cambios o cancelaciones, contacta a tu dentista. Puedes registrar nuevas citas desde Agendar.',
          status: 'info',
          duration: 4000,
          isClosable: true
        })
        onEditClose()
        return
      }
      
      // En modo paciente, solo permitir cambios de fecha/hora o cancelación
      if (isPatientView) {
        const changes = {
          appointment_date: editAppointment.appointment_date,
          appointment_time: editAppointment.appointment_time,
          notes: editAppointment.notes
        }
        
        // Si el status cambió a 'cancelada', incluir el cambio
        if (editAppointment.status === 'cancelada') {
          changes.status = 'cancelada'
        }
        
        // Verificar conflicto de horario solo si se cambió la fecha/hora
        if (editAppointment.appointment_date !== selectedAppointment.appointment_date || 
            editAppointment.appointment_time !== selectedAppointment.appointment_time) {
          if (checkTimeConflict(
            editAppointment.appointment_date, 
            editAppointment.appointment_time, 
            selectedAppointment.duration_minutes || 60,
            selectedAppointment.id
          )) {
            toast({
              title: 'Conflicto de horario',
              description: 'Ya existe una cita en ese horario. Por favor selecciona otro horario.',
              status: 'error',
              duration: 5000,
              isClosable: true
            })
            return
          }
        }
        
        await onAppointmentUpdate(selectedAppointment.id, changes)
        toast({
          title: editAppointment.status === 'cancelada' ? 'Cita cancelada' : 'Solicitud enviada',
          description: editAppointment.status === 'cancelada' 
            ? 'Tu cita ha sido cancelada exitosamente'
            : 'Tu solicitud de cambio ha sido enviada. El dentista la revisará.',
          status: 'success',
          duration: 5000,
          isClosable: true
        })
        onEditClose()
        return
      }
      
      // Verificar conflicto de horario para dentistas
      if (checkTimeConflict(
        editAppointment.appointment_date, 
        editAppointment.appointment_time, 
        editAppointment.duration_minutes,
        selectedAppointment.id
      )) {
        toast({
          title: 'Conflicto de horario',
          description: 'Ya existe una cita en ese horario. Por favor selecciona otro horario.',
          status: 'error',
          duration: 5000,
          isClosable: true
        })
        return
      }
      
      await onAppointmentUpdate(selectedAppointment.id, editAppointment)
      toast({
        title: 'Cita actualizada',
        description: 'La cita ha sido actualizada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      onEditClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al actualizar la cita',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }
  
  const handleDeleteAppointment = async () => {
    try {
      await onAppointmentDelete(selectedAppointment.id)
      toast({
        title: 'Cita eliminada',
        description: 'La cita ha sido eliminada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      onDeleteClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar la cita',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }
  
  const handleCreateAppointment = async () => {
    try {
      console.log('Validando datos de la cita...')
      
      if (!newAppointment.patient_id || !newAppointment.appointment_date || !newAppointment.appointment_time) {
        toast({
          title: 'Campos requeridos',
          description: 'Por favor completa todos los campos obligatorios',
          status: 'warning',
          duration: 3000,
          isClosable: true
        })
        return
      }
      
      console.log('Datos validados, verificando conflictos de horario...')
      console.log('Fecha a verificar:', newAppointment.appointment_date, 'Tipo:', typeof newAppointment.appointment_date)
      console.log('Hora a verificar:', newAppointment.appointment_time, 'Tipo:', typeof newAppointment.appointment_time)
      console.log('Duración a verificar:', newAppointment.duration_minutes, 'Tipo:', typeof newAppointment.duration_minutes)
      
      // Verificar conflicto de horario
      if (checkTimeConflict(
        newAppointment.appointment_date, 
        newAppointment.appointment_time, 
        newAppointment.duration_minutes
      )) {
        toast({
          title: 'Conflicto de horario',
          description: 'Ya existe una cita en ese horario. Por favor selecciona otro horario.',
          status: 'error',
          duration: 5000,
          isClosable: true
        })
        return
      }
      
      console.log('Sin conflictos, creando cita...')
      
      await onAppointmentCreate(newAppointment)
      toast({
        title: 'Cita creada',
        description: 'La cita ha sido programada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      
      onCreateClose()
      setNewAppointment({
        patient_id: '',
        appointment_date: '',
        appointment_time: '',
        duration_minutes: 60,
        appointment_type: '',
        reason: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error en handleCreateAppointment:', error)
      toast({
        title: 'Error al crear la cita',
        description: error.message || 'Error desconocido al crear la cita',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }
  
  const getStatusColor = (status) => {
    const colors = {
      'programada': 'blue',
      'confirmada': 'green',
      'en_proceso': 'orange',
      'completada': 'teal',
      'cancelada': 'red',
      'no_show': 'gray'
    }
    return colors[status] || 'gray'
  }
  
  const getStatusText = (status) => {
    const texts = {
      'programada': 'Programada',
      'confirmada': 'Confirmada',
      'en_proceso': 'En Proceso',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_show': 'No Asistió'
    }
    return texts[status] || status
  }
  
  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    })
  }
  
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  
  const renderView = () => {
    switch (viewMode) {
      case 'week':
        return (
          <WeekView
            appointments={appointments}
            currentDate={currentDate}
            onAppointmentClick={handleAppointmentClick}
            onAppointmentEdit={handleAppointmentEdit}
            onAppointmentDelete={handleAppointmentDelete}
            onAppointmentCreate={handleAppointmentCreate}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            formatTime={formatTime}
          />
        )
      case 'day':
        return (
          <DayView
            appointments={appointments}
            currentDate={currentDate}
            onAppointmentClick={handleAppointmentClick}
            onAppointmentEdit={handleAppointmentEdit}
            onAppointmentDelete={handleAppointmentDelete}
            onAppointmentCreate={handleAppointmentCreate}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            formatTime={formatTime}
          />
        )
      default:
        return renderMonthView()
    }
  }
  
  const renderMonthView = () => (
    <>
      {/* Días de la semana */}
      <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
        {weekDays.map((day) => (
          <GridItem key={day}>
            <Box
              p={3}
              textAlign="center"
              fontWeight="bold"
              color="gray.600"
              bg="gray.50"
              borderRadius="md"
            >
              {day}
            </Box>
          </GridItem>
        ))}
      </Grid>
      
      {/* Calendario */}
      <Grid templateColumns="repeat(7, 1fr)" gap={1}>
        {getMonthDays().map((date, index) => {
          const dayAppointments = getAppointmentsForDate(date)
          const isCurrentMonthDay = isCurrentMonth(date)
          const isTodayDay = isToday(date)
          const isSelectedDay = isSelected(date)
          
          return (
            <GridItem key={index}>
              <Box
                minH="120px"
                p={2}
                bg={isTodayDay ? 'blue.50' : isSelectedDay ? 'blue.100' : 'white'}
                border={isTodayDay ? '2px solid' : isSelectedDay ? '2px solid' : '1px solid'}
                borderColor={isTodayDay ? 'blue.300' : isSelectedDay ? 'blue.400' : 'gray.200'}
                borderRadius="md"
                cursor="pointer"
                onClick={() => handleDateClick(date)}
                _hover={{
                  bg: isTodayDay ? 'blue.100' : isSelectedDay ? 'blue.200' : 'gray.50',
                  transform: 'scale(1.02)',
                  transition: 'all 0.2s ease'
                }}
                position="relative"
              >
                {/* Número del día */}
                <Text
                  fontSize="sm"
                  fontWeight={isTodayDay ? 'bold' : 'normal'}
                  color={isCurrentMonthDay ? 'gray.800' : 'gray.400'}
                  mb={2}
                  textAlign="center"
                >
                  {date.getDate()}
                </Text>
                
                {/* Citas del día */}
                <VStack spacing={1} align="stretch">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <Box
                      key={appointment.id}
                      data-appointment-id={appointment.id}
                      p={1}
                      bg="white"
                      borderRadius="sm"
                      borderLeft="3px solid"
                      borderLeftColor={`${getStatusColor(appointment.status)}.500`}
                      cursor={isPatientView ? "default" : "pointer"}
                      onClick={(e) => {
                        if (!isPatientView) handleAppointmentClick(appointment, e)
                      }}
                      _hover={{
                        bg: isPatientView ? undefined : "gray.50",
                        transform: isPatientView ? undefined : "translateX(2px)"
                      }}
                      position="relative"
                    >
                      <VStack spacing={0} align="start">
                        <HStack spacing={1} w="full">
                          <Icon as={FiClock} color="gray.500" boxSize={2} />
                          <Text fontSize="xs" fontWeight="bold">
                            {formatTime(appointment.appointment_time)}
                          </Text>
                        </HStack>
                        
                        <Text fontSize="xs" fontWeight="bold" noOfLines={1} color="gray.700">
                          {isPatientView ? 'Mi cita' : (appointment.patients?.name || 'Paciente')}
                        </Text>
                        
                        <Text fontSize="xs" color="gray.600" noOfLines={1}>
                          {appointment.appointment_type}
                        </Text>
                        
                        <Badge
                          size="xs"
                          colorScheme={getStatusColor(appointment.status)}
                          variant="subtle"
                        >
                          {getStatusText(appointment.status)}
                        </Badge>
                      </VStack>
                      
                      {/* Botones de acción - Solo visibles para dentistas */}
                      {!isPatientView && (
                        <HStack 
                          spacing={1} 
                          position="absolute" 
                          top={1} 
                          right={1}
                          transition="opacity 0.2s ease"
                        >
                          <Tooltip label="Editar">
                            <IconButton
                              size="xs"
                              icon={<FiEdit3 />}
                              variant="ghost"
                              colorScheme="blue"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAppointmentClick(appointment, e)
                              }}
                            />
                          </Tooltip>
                          <Tooltip label="Eliminar">
                            <IconButton
                              size="xs"
                              icon={<FiTrash2 />}
                              variant="ghost"
                              colorScheme="red"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedAppointment(appointment)
                                onDeleteOpen()
                              }}
                            />
                          </Tooltip>
                        </HStack>
                      )}
                    </Box>
                  ))}
                  
                  {/* Indicador de más citas */}
                  {dayAppointments.length > 3 && (
                    <Text fontSize="xs" color="blue.500" textAlign="center" fontWeight="bold">
                      +{dayAppointments.length - 3} más
                    </Text>
                  )}
                  
                  {/* Botón para agregar cita - Solo visible para dentistas */}
                  {!isPatientView && (
                    <IconButton
                      size="xs"
                      icon={<FiPlus />}
                      variant="ghost"
                      colorScheme="green"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedDate(date)
                        onCreateOpen()
                      }}
                      _hover={{
                        bg: "green.50",
                        transform: "scale(1.1)"
                      }}
                    />
                  )}
                </VStack>
              </Box>
            </GridItem>
          )
        })}
      </Grid>
    </>
  )
  
  return (
    <Box>
      {/* Header del calendario */}
      <HStack justify='space-between' align='center' mb={6}>
        <HStack spacing={4}>
          <IconButton
            icon={<FiChevronLeft />}
            onClick={() => {
              if (viewMode === 'month') navigateMonth(-1)
              else if (viewMode === 'week') navigateWeek(-1)
              else navigateDay(-1)
            }}
            variant='outline'
            borderColor='#00B4D8'
            color='#00B4D8'
            _hover={{
              bg: 'rgba(0, 180, 216, 0.1)'
            }}
          />
          
          <Button
            variant='ghost'
            onClick={goToToday}
            color='#00B4D8'
            fontWeight='bold'
          >
            Hoy
          </Button>
          
          <IconButton
            icon={<FiChevronRight />}
            onClick={() => {
              if (viewMode === 'month') navigateMonth(1)
              else if (viewMode === 'week') navigateWeek(1)
              else navigateDay(1)
            }}
            variant='outline'
            borderColor='#00B4D8'
            color='#00B4D8'
            _hover={{
              bg: 'rgba(0, 180, 216, 0.1)'
            }}
          />
        </HStack>
        
        <Text fontSize="2xl" fontWeight="bold" color="gray.700" textTransform="capitalize">
          {formatMonthYear()}
        </Text>
        
        <HStack spacing={2}>
          <Button
            size="sm"
            variant={viewMode === 'month' ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => setViewMode('month')}
          >
            Mes
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'week' ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => setViewMode('week')}
          >
            Semana
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'day' ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => setViewMode('day')}
          >
            Día
          </Button>
        </HStack>
      </HStack>
      
      {/* Contenido del calendario */}
      {renderView()}
      
      {/* Modal para editar cita */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isPatientView ? 'Gestionar Mi Cita' : 'Editar Cita'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              {/* Mensaje informativo para pacientes */}
              {isPatientView && (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">Información importante:</Text>
                    <Text fontSize="sm">
                      • Solo puedes cambiar la fecha y hora de tu cita
                      • Para cancelar, usa el botón "Cancelar Cita"
                      • El dentista revisará tu solicitud de cambio
                      • Los demás campos no se pueden modificar
                    </Text>
                  </VStack>
                </Alert>
              )}
              
              {/* Solo mostrar selector de paciente si NO es vista de paciente */}
              {!isPatientView && (
                <FormControl isRequired>
                  <FormLabel>Paciente</FormLabel>
                  <Select
                    value={editAppointment.patient_id}
                    onChange={(e) => setEditAppointment(prev => ({
                      ...prev,
                      patient_id: e.target.value
                    }))}
                  >
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - {patient.email}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Fecha</FormLabel>
                  <Input
                    type="date"
                    value={editAppointment.appointment_date}
                    onChange={(e) => setEditAppointment(prev => ({
                      ...prev,
                      appointment_date: e.target.value
                    }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Hora</FormLabel>
                  <Input
                    type="time"
                    value={editAppointment.appointment_time}
                    onChange={(e) => setEditAppointment(prev => ({
                      ...prev,
                      appointment_time: e.target.value
                    }))}
                  />
                </FormControl>
              </HStack>
              
              <HStack spacing={4} w="full">
                {/* Solo mostrar duración si NO es vista de paciente */}
                {!isPatientView && (
                  <FormControl>
                    <FormLabel>Duración (minutos)</FormLabel>
                    <Select
                      value={editAppointment.duration_minutes}
                      onChange={(e) => setEditAppointment(prev => ({
                        ...prev,
                        duration_minutes: parseInt(e.target.value)
                      }))}
                    >
                      <option value={30}>30 min</option>
                      <option value={60}>1 hora</option>
                      <option value={90}>1.5 horas</option>
                      <option value={120}>2 horas</option>
                    </Select>
                  </FormControl>
                )}
                
                <FormControl>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    value={editAppointment.status}
                    onChange={(e) => setEditAppointment(prev => ({
                      ...prev,
                      status: e.target.value
                    }))}
                    isDisabled={isPatientView}
                  >
                    {isPatientView ? (
                      // En modo paciente, solo mostrar estados básicos
                      <>
                        <option value="programada">Programada</option>
                        <option value="cancelada">Cancelada</option>
                      </>
                    ) : (
                      // En modo dentista, mostrar todos los estados
                      appointmentStatuses.map(status => (
                        <option key={status} value={status}>
                          {getStatusText(status)}
                        </option>
                      ))
                    )}
                  </Select>
                </FormControl>
              </HStack>
              
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>Tipo de cita</FormLabel>
                  <Select
                    value={editAppointment.appointment_type}
                    onChange={(e) => setEditAppointment(prev => ({
                      ...prev,
                      appointment_type: e.target.value
                    }))}
                    isDisabled={isPatientView}
                  >
                    {appointmentTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
              
              <FormControl>
                <FormLabel>Motivo</FormLabel>
                <Input
                  placeholder="Motivo de la cita"
                  value={editAppointment.reason}
                  onChange={(e) => setEditAppointment(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                  isDisabled={isPatientView}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>
                  {isPatientView ? 'Motivo de cambio' : 'Notas adicionales'}
                </FormLabel>
                <Textarea
                  placeholder={
                    isPatientView 
                      ? "Explica brevemente por qué quieres cambiar o cancelar tu cita..." 
                      : "Notas adicionales"
                  }
                  value={editAppointment.notes}
                  onChange={(e) => setEditAppointment(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                />
              </FormControl>
              
              <HStack spacing={4} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onEditClose}>
                  Cancelar
                </Button>
                {/* Paciente no puede cancelar desde el calendario */}
                <Button
                  bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                  color='white'
                  onClick={handleEditAppointment}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
                  }}
                >
                  {isPatientView ? 'Actualizar Mi Cita' : 'Actualizar Cita'}
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Modal para nueva cita */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nueva Cita</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Paciente</FormLabel>
                <Select
                  placeholder="Seleccionar paciente"
                  value={newAppointment.patient_id}
                  onChange={(e) => setNewAppointment(prev => ({
                    ...prev,
                    patient_id: e.target.value
                  }))}
                >
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.email}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Fecha</FormLabel>
                  <Input
                    type="date"
                    value={newAppointment.appointment_date}
                    onChange={(e) => setNewAppointment(prev => ({
                      ...prev,
                      appointment_date: e.target.value
                    }))}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Hora</FormLabel>
                  <Input
                    type="time"
                    value={newAppointment.appointment_time}
                    onChange={(e) => setNewAppointment(prev => ({
                      ...prev,
                      appointment_time: e.target.value
                    }))}
                  />
                </FormControl>
              </HStack>
              
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>Duración (minutos)</FormLabel>
                  <Select
                    value={newAppointment.duration_minutes}
                    onChange={(e) => setNewAppointment(prev => ({
                      ...prev,
                      duration_minutes: parseInt(e.target.value)
                    }))}
                  >
                    <option value={30}>30 min</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1.5 horas</option>
                    <option value={120}>2 horas</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Tipo de cita</FormLabel>
                  <Select
                    placeholder="Seleccionar tipo"
                    value={newAppointment.appointment_type}
                    onChange={(e) => setNewAppointment(prev => ({
                      ...prev,
                      appointment_type: e.target.value
                    }))}
                  >
                    {appointmentTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
              
              <FormControl>
                <FormLabel>Motivo</FormLabel>
                <Input
                  placeholder="Motivo de la cita"
                  value={newAppointment.reason}
                  onChange={(e) => setNewAppointment(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Notas adicionales</FormLabel>
                <Textarea
                  placeholder="Notas adicionales"
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                />
              </FormControl>
              
              <HStack spacing={4} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onCreateClose}>
                  Cancelar
                </Button>
                <Button
                  bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                  color='white'
                  onClick={handleCreateAppointment}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
                  }}
                >
                  Crear Cita
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Modal de confirmación para eliminar */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={undefined}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar Cita
            </AlertDialogHeader>
            
            <AlertDialogBody>
              ¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.
            </AlertDialogBody>
            
            <AlertDialogFooter>
              <Button onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDeleteAppointment} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}
