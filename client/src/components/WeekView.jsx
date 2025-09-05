import React from 'react'
import {
  Box,
  Grid,
  GridItem,
  Text,
  VStack,
  HStack,
  Badge,
  IconButton,
  Tooltip,
  Icon
} from '@chakra-ui/react'
import { FiClock, FiEdit3, FiTrash2, FiPlus } from 'react-icons/fi'

export default function WeekView({ 
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
  const getWeekDays = () => {
    const days = []
    const startOfWeek = new Date(currentDate)
    
    // Ajustar para que la semana comience el domingo (0) como en la vista mensual
    const dayOfWeek = currentDate.getDay()
    const daysToSubtract = dayOfWeek
    
    startOfWeek.setDate(currentDate.getDate() - daysToSubtract)
    startOfWeek.setHours(0, 0, 0, 0) // Resetear la hora para evitar problemas de zona horaria
    
    console.log('WeekView - Fecha actual:', currentDate.toDateString())
    console.log('WeekView - Día de la semana:', dayOfWeek)
    console.log('WeekView - Días a restar:', daysToSubtract)
    console.log('WeekView - Inicio de semana:', startOfWeek.toDateString())
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
      console.log(`WeekView - Día ${i}:`, day.toDateString())
    }
    
    return days
  }
  
  const getAppointmentsForDate = (date) => {
    // Crear una fecha local sin zona horaria para comparar
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    console.log('Buscando citas para fecha:', dateStr, 'en día:', date.toDateString())
    
    return appointments.filter(apt => apt.appointment_date === dateStr)
  }
  
  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString()
  }
  
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  
  return (
    <Box>
      {/* Header de la semana */}
      <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={4}>
        {weekDays.map((day, index) => {
          const currentDay = getWeekDays()[index]
          const isTodayDay = isToday(currentDay)
          
          return (
            <GridItem key={day}>
              <Box
                p={3}
                textAlign="center"
                fontWeight="bold"
                color={isTodayDay ? "white" : "gray.600"}
                bg={isTodayDay ? "blue.500" : "gray.50"}
                borderRadius="md"
              >
                <Text fontSize="sm" textTransform="uppercase">
                  {day.slice(0, 3)}
                </Text>
                <Text fontSize="lg">
                  {currentDay.getDate()}
                </Text>
              </Box>
            </GridItem>
          )
        })}
      </Grid>
      
      {/* Vista de la semana */}
      <Grid templateColumns="repeat(7, 1fr)" gap={1}>
        {getWeekDays().map((day, index) => {
          const dayAppointments = getAppointmentsForDate(day)
          const isTodayDay = isToday(day)
          
          return (
            <GridItem key={index}>
              <Box
                minH="200px"
                p={2}
                bg={isTodayDay ? 'blue.50' : 'white'}
                border={isTodayDay ? '2px solid' : '1px solid'}
                borderColor={isTodayDay ? 'blue.300' : 'gray.200'}
                borderRadius="md"
                position="relative"
              >
                {/* Citas del día */}
                <VStack spacing={2} align="stretch">
                  {dayAppointments.length === 0 ? (
                    <Text fontSize="xs" color="gray.400" textAlign="center" py={4}>
                      Sin citas
                    </Text>
                  ) : (
                    dayAppointments.map((appointment) => (
                      <Box
                        key={appointment.id}
                        p={2}
                        bg="white"
                        borderRadius="md"
                        borderLeft="4px solid"
                        borderLeftColor={`${getStatusColor(appointment.status)}.500`}
                        cursor="pointer"
                        _hover={{
                          bg: "gray.50",
                          transform: "translateY(-1px)",
                          boxShadow: "sm"
                        }}
                                                 position="relative"
                       >
                        <VStack spacing={1} align="start">
                          <HStack spacing={2} w="full">
                            <Icon as={FiClock} color="gray.500" boxSize={3} />
                            <Text fontSize="xs" fontWeight="bold">
                              {formatTime(appointment.appointment_time)}
                            </Text>
                          </HStack>
                          
                          <Text fontSize="xs" fontWeight="bold" noOfLines={1} color="gray.700">
                            {appointment.patients?.name || 'Paciente'}
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
                        
                                                 {/* Botones de acción */}
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
                    ))
                  )}
                  
                  {/* Botón para agregar cita */}
                  <IconButton
                    size="sm"
                    icon={<FiPlus />}
                    variant="ghost"
                    colorScheme="green"
                    onClick={() => onAppointmentCreate(day)}
                    _hover={{
                      bg: "green.50",
                      transform: "scale(1.05)"
                    }}
                    w="full"
                  />
                </VStack>
              </Box>
            </GridItem>
          )
        })}
      </Grid>
    </Box>
  )
}
