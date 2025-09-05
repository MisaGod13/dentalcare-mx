import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Tooltip,
  Icon,
  Divider,
  Grid,
  GridItem
} from '@chakra-ui/react'
import { FiClock, FiEdit3, FiTrash2, FiPlus, FiUser, FiCalendar } from 'react-icons/fi'

export default function DayView({ 
  appointments, 
  currentDate, 
  onAppointmentClick,
  onAppointmentEdit,
  onAppointmentDelete,
  onAppointmentCreate,
  getStatusColor,
  getStatusText,
  formatTime
}) {
  const getAppointmentsForDate = (date) => {
    // Crear una fecha local sin zona horaria para comparar
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    console.log('DayView - Buscando citas para fecha:', dateStr, 'en día:', date.toDateString())
    
    return appointments.filter(apt => apt.appointment_date === dateStr)
  }
  
  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString()
  }
  
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const dayAppointments = getAppointmentsForDate(currentDate)
  const isTodayDay = isToday(currentDate)
  
  // Generar slots de tiempo de 30 minutos
  const timeSlots = []
  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(time)
    }
  }
  
  const getAppointmentForTimeSlot = (timeSlot) => {
    return dayAppointments.find(apt => apt.appointment_time === timeSlot)
  }
  
  return (
    <Box>
      {/* Header del día */}
      <Box
        p={4}
        bg={isTodayDay ? 'blue.50' : 'gray.50'}
        border={isTodayDay ? '2px solid' : '1px solid'}
        borderColor={isTodayDay ? 'blue.300' : 'gray.200'}
        borderRadius="lg"
        mb={6}
      >
        <HStack spacing={4} align="center">
          <Icon as={FiCalendar} color={isTodayDay ? 'blue.500' : 'gray.500'} boxSize={6} />
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color={isTodayDay ? 'blue.700' : 'gray.700'}>
              {formatDate(currentDate)}
            </Text>
            <Text fontSize="sm" color={isTodayDay ? 'blue.600' : 'gray.600'}>
              {dayAppointments.length} cita{dayAppointments.length !== 1 ? 's' : ''} programada{dayAppointments.length !== 1 ? 's' : ''}
            </Text>
          </VStack>
        </HStack>
      </Box>
      
      {/* Vista del día por horas */}
      <Grid templateColumns="100px 1fr" gap={4}>
        {/* Columna de horas */}
        <GridItem>
          <VStack spacing={0} align="stretch">
            {timeSlots.map((timeSlot) => (
              <Box
                key={timeSlot}
                h="60px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderBottom="1px solid"
                borderColor="gray.200"
                fontSize="sm"
                color="gray.600"
                fontWeight="500"
              >
                {timeSlot}
              </Box>
            ))}
          </VStack>
        </GridItem>
        
        {/* Columna de citas */}
        <GridItem>
          <VStack spacing={0} align="stretch">
            {timeSlots.map((timeSlot) => {
              const appointment = getAppointmentForTimeSlot(timeSlot)
              
              return (
                <Box
                  key={timeSlot}
                  h="60px"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  position="relative"
                  _hover={{
                    bg: "gray.50"
                  }}
                >
                  {appointment ? (
                    <Box
                      p={2}
                      h="full"
                      bg="white"
                      borderRadius="md"
                      borderLeft="4px solid"
                      borderLeftColor={`${getStatusColor(appointment.status)}.500`}
                      cursor="pointer"
                      _hover={{
                        bg: "gray.50",
                        transform: "translateX(2px)",
                        boxShadow: "sm"
                      }}
                                             position="relative"
                     >
                      <VStack spacing={1} align="start" h="full" justify="center">
                        <HStack spacing={2} w="full">
                          <Icon as={FiUser} color="gray.500" boxSize={3} />
                          <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                            {appointment.patients?.name || 'Paciente'}
                          </Text>
                        </HStack>
                        
                        <HStack spacing={2} w="full">
                          <Icon as={FiClock} color="gray.500" boxSize={3} />
                          <Text fontSize="xs" color="gray.600" noOfLines={1}>
                            {appointment.appointment_type} - {appointment.duration_minutes} min
                          </Text>
                        </HStack>
                        
                        <Badge
                          size="sm"
                          colorScheme={getStatusColor(appointment.status)}
                          variant="subtle"
                        >
                          {getStatusText(appointment.status)}
                        </Badge>
                      </VStack>
                      
                      {/* Botones de acción */}
                      <HStack 
                        spacing={1} 
                        position="absolute" 
                        top={2} 
                        right={2}
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
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
                              onAppointmentEdit(appointment)
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
                              onAppointmentDelete(appointment)
                            }}
                          />
                        </Tooltip>
                      </HStack>
                    </Box>
                  ) : (
                    <Box
                      h="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      cursor="pointer"
                      _hover={{
                        bg: "green.50"
                      }}
                      onClick={() => onAppointmentCreate(currentDate, timeSlot)}
                    >
                      <Icon as={FiPlus} color="green.400" boxSize={4} />
                    </Box>
                  )}
                </Box>
              )
            })}
          </VStack>
        </GridItem>
      </Grid>
      
      {/* Resumen del día */}
      {dayAppointments.length > 0 && (
        <Box mt={6} p={4} bg="gray.50" borderRadius="lg">
          <Text fontSize="lg" fontWeight="bold" mb={3} color="gray.700">
            Resumen del Día
          </Text>
          
          <VStack spacing={3} align="stretch">
            {dayAppointments.map((appointment) => (
              <Box
                key={appointment.id}
                p={3}
                bg="white"
                borderRadius="md"
                borderLeft="4px solid"
                borderLeftColor={`${getStatusColor(appointment.status)}.500`}
              >
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1}>
                    <HStack spacing={2}>
                      <Icon as={FiClock} color="gray.500" boxSize={4} />
                      <Text fontWeight="bold">
                        {formatTime(appointment.appointment_time)}
                      </Text>
                    </HStack>
                    
                    <Text fontSize="sm" fontWeight="bold" color="gray.700">
                      {appointment.patients?.name || 'Paciente'}
                    </Text>
                    
                    <Text fontSize="xs" color="gray.600">
                      {appointment.appointment_type} - {appointment.duration_minutes} min
                    </Text>
                    
                    {appointment.reason && (
                      <Text fontSize="xs" color="gray.600" fontStyle="italic">
                        Motivo: {appointment.reason}
                      </Text>
                    )}
                  </VStack>
                  
                  <VStack spacing={2} align="end">
                    <Badge
                      size="sm"
                      colorScheme={getStatusColor(appointment.status)}
                      variant="subtle"
                    >
                      {getStatusText(appointment.status)}
                    </Badge>
                    
                    <HStack spacing={1}>
                      <Tooltip label="Editar">
                        <IconButton
                          size="xs"
                          icon={<FiEdit3 />}
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => onAppointmentEdit(appointment)}
                        />
                      </Tooltip>
                      <Tooltip label="Eliminar">
                        <IconButton
                          size="xs"
                          icon={<FiTrash2 />}
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => onAppointmentDelete(appointment)}
                        />
                      </Tooltip>
                    </HStack>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  )
}
