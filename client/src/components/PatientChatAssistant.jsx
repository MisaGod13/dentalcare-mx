import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useToast,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
  Divider,
  Badge
} from '@chakra-ui/react'
import { 
  FiSend, 
  FiMessageCircle, 
  FiUser, 
  FiMessageSquare,
  FiZap,
  FiHeart,
  FiShield,
  FiClock,
  FiCalendar,
  FiUserCheck
} from 'react-icons/fi'
import { supabase } from '../supabaseClient'
import ReactMarkdown from 'react-markdown'

export default function PatientChatAssistant({ patientId }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [patientData, setPatientData] = useState(null)
  const [patientContext, setPatientContext] = useState('')
  
  const messagesEndRef = useRef(null)
  const toast = useToast()
  
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  useEffect(() => {
    fetchPatientData()
    initializeChat()
    scrollToBottom()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchPatientData = async () => {
    try {
      if (!patientId) return

      const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()
      
      if (error) throw error
      setPatientData(patient)

      // Construir contexto del paciente para OpenAI
      await buildPatientContext(patient)
      
    } catch (error) {
      console.error('Error fetching patient data:', error)
    }
  }

  const buildPatientContext = async (patient) => {
    try {
      let context = `Paciente: ${patient.name}
Email: ${patient.email || 'No especificado'}
Edad: ${patient.age || 'No especificada'}
Ocupación: ${patient.occupation || 'No especificada'}

Antecedentes Médicos:`

      // Agregar antecedentes médicos
      if (patient.allergies) context += `\n- Alergias: ${patient.allergy_details || 'Sí, sin detalles específicos'}`
      if (patient.diabetes) context += `\n- Diabetes: Sí (desde ${patient.diabetes_date || 'fecha no especificada'})`
      if (patient.high_blood_pressure) context += `\n- Presión alta: Sí (desde ${patient.high_blood_pressure_date || 'fecha no especificada'})`
      if (patient.heart_attack) context += `\n- Infarto previo: Sí (desde ${patient.heart_attack_date || 'fecha no especificada'})`
      if (patient.asthma) context += `\n- Asma: Sí (desde ${patient.asthma_date || 'fecha no especificada'})`
      if (patient.covid19) context += `\n- COVID-19: Sí (desde ${patient.covid19_date || 'fecha no especificada'})`

      context += `\n\nSalud Dental:`
      if (patient.bruxism) context += `\n- Bruxismo: Sí`
      if (patient.bad_breath) context += `\n- Mal aliento: Sí`
      if (patient.chewing_difficulty) context += `\n- Dificultad para masticar: Sí`
      if (patient.anesthesia_reaction) context += `\n- Reacción a anestesia: Sí (${patient.anesthesia_reaction_details || 'sin detalles'})`
      if (patient.recent_pain) context += `\n- Dolor reciente: Sí`
      if (patient.gum_bleeding) context += `\n- Sangrado de encías: ${patient.gum_bleeding}`

      context += `\n\nHábitos:`
      if (patient.smoking) context += `\n- Fumar: Sí (${patient.cigarettes_per_day || 'cantidad no especificada'} cigarrillos por día)`
      if (patient.alcohol) context += `\n- Alcohol: Sí (${patient.alcohol_frequency || 'frecuencia no especificada'})`
      if (patient.physical_activity) context += `\n- Actividad física: Sí (${patient.physical_activity_type || 'tipo no especificado'})`
      if (patient.brushings_per_day) context += `\n- Cepillados por día: ${patient.brushings_per_day}`
      if (patient.floss) context += `\n- Uso de hilo dental: Sí`
      if (patient.mouthwash) context += `\n- Enjuague bucal: Sí`

      // Obtener citas del paciente
      try {
        const { data: appointments } = await supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', patientId)
          .order('appointment_date', { ascending: false })
          .limit(5)

        if (appointments && appointments.length > 0) {
          context += `\n\nCitas Recientes:`
          appointments.forEach((apt, index) => {
            context += `\n${index + 1}. ${new Date(apt.appointment_date).toLocaleDateString()} - ${apt.appointment_type || 'Tipo no especificado'} (${apt.status})`
          })
        }
      } catch (error) {
        console.warn('No se pudieron cargar las citas:', error)
      }

      // Obtener historial médico
      try {
        const { data: medicalHistory } = await supabase
          .from('medical_history')
          .select('*')
          .eq('patient_id', patientId)
          .order('consultation_date', { ascending: false })
          .limit(3)

        if (medicalHistory && medicalHistory.length > 0) {
          context += `\n\nHistorial Médico Reciente:`
          medicalHistory.forEach((record, index) => {
            context += `\n${index + 1}. ${new Date(record.consultation_date).toLocaleDateString()} - ${record.diagnosis || 'Sin diagnóstico'}`
            if (record.treatment) context += `\n   Tratamiento: ${record.treatment}`
          })
        }
      } catch (error) {
        console.warn('No se pudo cargar el historial médico:', error)
      }

      context += `\n\nInstrucciones para la IA: Eres un asistente virtual de salud dental personalizado. Usa el nombre del paciente cuando te dirijas a él. Proporciona respuestas amigables, profesionales y basadas en su información médica. Siempre recomienda consultar con el dentista para casos específicos.`

      setPatientContext(context)
      
    } catch (error) {
      console.error('Error building patient context:', error)
    }
  }

  const initializeChat = () => {
    const welcomeMessage = {
      role: 'assistant',
      content: `¡Hola! Soy tu asistente virtual de salud dental personalizado. 👨‍⚕️

Puedo ayudarte con:
• 📅 Información sobre tus citas
• 🦷 Consejos de salud dental personalizados
• 💊 Explicaciones sobre tratamientos
• 📋 Recordatorios importantes
• ❓ Cualquier duda médica

¿En qué puedo ayudarte hoy?`
    }
    setMessages([welcomeMessage])
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: inputMessage.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Preparar mensajes para OpenAI
      const messagesForAI = [
        {
          role: 'system',
          content: patientContext
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        userMessage
      ]

      // Llamar a la API de OpenAI
      const response = await fetch('http://localhost:3001/api/ai/patient-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messagesForAI,
          patientName: patientData?.name || 'Paciente'
        })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.text || 'No se pudo generar una respuesta.'
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Respuesta de fallback si la API falla
      const fallbackMessage = {
        role: 'assistant',
        content: `Lo siento, tuve un problema al procesar tu mensaje. Por favor, intenta de nuevo o contacta a tu dentista directamente.`
      }
      
      setMessages(prev => [...prev, fallbackMessage])
      
      toast({
        title: 'Error',
        description: 'No se pudo conectar con el asistente. Intenta de nuevo.',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getSuggestedQuestions = () => [
    {
      question: "¿Cómo debo cepillarme los dientes correctamente?",
      icon: FiShield
    },
    {
      question: "¿Cuándo debo cambiar mi cepillo de dientes?",
      icon: FiClock
    },
    {
      question: "¿Qué alimentos son buenos para mis dientes?",
      icon: FiHeart
    },
    {
      question: "¿Cómo puedo prevenir las caries?",
      icon: FiShield
    }
  ]

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `¡Hola! Soy tu asistente virtual de salud dental personalizado. 👨‍⚕️

Puedo ayudarte con:
• 📅 Información sobre tus citas
• 🦷 Consejos de salud dental personalizados
• 💊 Explicaciones sobre tratamientos
• 📋 Recordatorios importantes
• ❓ Cualquier duda médica

¿En qué puedo ayudarte hoy?`
    }])
  }

  return (
    <Box>
      <Text 
        mb={6}
        bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
        bgClip='text'
        fontWeight='bold'
        fontSize="2xl"
        display='flex'
        alignItems='center'
        gap={3}
      >
        <Icon as={FiZap} boxSize={8} />
        Asistente Virtual Personalizado
      </Text>

      <VStack align='stretch' spacing={4}>
        <Alert status="success" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">
              Asistente inteligente con acceso a tu información médica
            </Text>
            <Text fontSize="sm">
              {patientData ? `Conectado como: ${patientData.name}` : 'Cargando información del paciente...'}
            </Text>
          </VStack>
        </Alert>

        {/* Sugerencias rápidas */}
        <Box>
          <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.600">
            <span className="emoji-original">💡</span> Preguntas sugeridas:
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            {getSuggestedQuestions().map((suggestion, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                colorScheme="blue"
                leftIcon={<Icon as={suggestion.icon} />}
                onClick={() => setInputMessage(suggestion.question)}
                _hover={{ bg: 'blue.50' }}
              >
                {suggestion.question}
              </Button>
            ))}
          </HStack>
        </Box>

        <Divider />

        {/* Área de mensajes */}
        <VStack 
          align='stretch' 
          spacing={3} 
          p={6} 
          className="chat-container chat-messages" 
          maxH='60vh' 
          overflowY='auto'
        >
          {messages.map((message, index) => (
            <Box 
              key={index} 
              className={`chat-message ${message.role}`}
            >
              {message.role === 'assistant' ? (
                <Box>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </Box>
              ) : (
                <Text whiteSpace='pre-wrap'>{message.content}</Text>
              )}
            </Box>
          ))}
          
          {isLoading && (
            <Box alignSelf='flex-start' p={3} rounded='xl'>
              <HStack>
                <Spinner size="sm" />
                <Text>Asistente escribiendo...</Text>
              </HStack>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </VStack>
        
        {/* Área de entrada */}
        <HStack className="chat-input-container" spacing={3}>
          <Input 
            placeholder='Escribe tu pregunta sobre salud dental...' 
            value={inputMessage} 
            onChange={e => setInputMessage(e.target.value)} 
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            variant='unstyled'
            size="lg"
            px={4}
          />
          <Button 
            className="chat-send-button"
            onClick={sendMessage}
            disabled={isLoading}
            isLoading={isLoading}
          >
            <Icon as={FiSend} />
          </Button>
        </HStack>

        {/* Información del contexto */}
        {patientContext && (
          <Alert status="info" borderRadius="md" fontSize="sm">
            <AlertIcon />
            <Text>
              El asistente tiene acceso a tu historial médico, diagnósticos y recomendaciones para darte respuestas personalizadas.
            </Text>
          </Alert>
        )}
      </VStack>
    </Box>
  )
}

