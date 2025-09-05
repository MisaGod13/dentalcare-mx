import { useState } from 'react'
import { 
  Box, 
  Heading, 
  Input, 
  Button, 
  VStack, 
  HStack, 
  Text, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Badge,
  Icon,
  useToast,
  Spinner,
  Divider,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { 
  FiMessageCircle, 
  FiUsers, 
  FiCalendar, 
  FiBarChart2, 
  FiHelpCircle,
  FiSend,
  FiZap
} from 'react-icons/fi'
import ReactMarkdown from 'react-markdown'

export default function ChatAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hola, soy tu asistente dental. ¿En qué puedo ayudarte hoy?' }
  ])
  const [intelligentMessages, setIntelligentMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu asistente virtual inteligente. Puedo ayudarte con:\n\n• Información de pacientes\n• Consultas sobre agenda y citas\n• Estadísticas de la clínica\n• Procedimientos dentales\n• Recordatorios y seguimientos\n\n¿Qué te gustaría saber?' }
  ])
  const [text, setText] = useState('')
  const [intelligentText, setIntelligentText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isIntelligentLoading, setIsIntelligentLoading] = useState(false)
  const toast = useToast()

  // Función para el chat de pacientes (original)
  async function send() {
    if (!text.trim()) return
    
    const userMsg = { role: 'user', content: text }
    setIsLoading(true)
    
    try {
      const res = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      })
      const data = await res.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: data.text || '(sin respuesta)' }])
      setText('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje: ' + error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para el asistente inteligente
  async function sendIntelligent() {
    if (!intelligentText.trim()) return
    
    const userMsg = { role: 'user', content: intelligentText }
    setIsIntelligentLoading(true)
    
    try {
      const res = await fetch('http://localhost:3001/api/ai/intelligent-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: intelligentText })
      })
    const data = await res.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setIntelligentMessages(prev => [...prev, userMsg, { role: 'assistant', content: data.text || '(sin respuesta)' }])
      setIntelligentText('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje: ' + error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setIsIntelligentLoading(false)
    }
  }

  // Sugerencias para el asistente inteligente
  const suggestions = [
    '¿Cuántos pacientes tenemos registrados?',
    'Muéstrame las citas de hoy',
    '¿Cuáles son las estadísticas del mes?',
    'Necesito información sobre un paciente',
    '¿Qué procedimientos dentales realizamos?'
  ]

  return (
    <Box>
      <Heading 
        mb={6}
        bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
        bgClip='text'
        fontWeight='bold'
        display='flex'
        alignItems='center'
        gap={3}
      >
        <Icon as={FiZap} boxSize={8} />
        Asistente Virtual Inteligente
      </Heading>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>
            <Icon as={FiMessageCircle} mr={2} />
            Chat General
          </Tab>
                      <Tab>
              <Icon as={FiZap} mr={2} />
              Asistente Inteligente
            </Tab>
        </TabList>

        <TabPanels>
          {/* Tab 1: Chat General para Pacientes */}
          <TabPanel>
            <VStack align='stretch' spacing={4}>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                Chat general para comunicación con pacientes
              </Alert>
              
              <VStack 
                align='stretch' 
                spacing={3} 
                p={6} 
                className="chat-container chat-messages" 
                maxH='60vh' 
                overflowY='auto'
              >
                {messages.map((m, i) => (
                  <Box 
                    key={i} 
                    className={`chat-message ${m.role}`}
                  >
                    {m.role === 'assistant' ? (
                      <Box>
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </Box>
                    ) : (
                      <Text whiteSpace='pre-wrap'>{m.content}</Text>
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
              </VStack>
              
              <HStack className="chat-input-container" spacing={3}>
                <Input 
                  placeholder='Escribe tu mensaje...' 
                  value={text} 
                  onChange={e => setText(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && send()}
                  disabled={isLoading}
                  variant='unstyled'
                  size='lg'
                  px={4}
                />
                <Button 
                  className="chat-send-button"
                  onClick={send}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  <Icon as={FiSend} />
                </Button>
              </HStack>
            </VStack>
          </TabPanel>

          {/* Tab 2: Asistente Inteligente */}
          <TabPanel>
            <VStack align='stretch' spacing={4}>
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                Asistente inteligente con acceso a información de la clínica
              </Alert>

              {/* Sugerencias rápidas */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.600">
                  Sugerencias rápidas:
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => setIntelligentText(suggestion)}
                      _hover={{ bg: 'blue.50' }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </HStack>
              </Box>

              <Divider />

              <VStack 
                align='stretch' 
                spacing={3} 
                p={6} 
                className="chat-container chat-messages" 
                maxH='60vh' 
                overflowY='auto'
              >
                {intelligentMessages.map((m, i) => (
                  <Box 
                    key={i} 
                    className={`chat-message ${m.role}`}
                  >
                    {m.role === 'assistant' ? (
                      <Box>
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </Box>
                    ) : (
                      <Text whiteSpace='pre-wrap'>{m.content}</Text>
                    )}
                  </Box>
                ))}
                {isIntelligentLoading && (
                  <Box alignSelf='flex-start' p={3} rounded='xl'>
                    <HStack>
                      <Spinner size="sm" />
                      <Text>Asistente inteligente procesando...</Text>
                    </HStack>
                  </Box>
                )}
              </VStack>
              
              <HStack className="chat-input-container" spacing={3}>
                <Input 
                  placeholder='Pregunta sobre pacientes, agenda, estadísticas...' 
                  value={intelligentText} 
                  onChange={e => setIntelligentText(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && sendIntelligent()}
                  disabled={isIntelligentLoading}
                  variant='unstyled'
                  size='lg'
                  px={4}
                />
                <Button 
                  className="chat-send-button"
                  onClick={sendIntelligent}
                  disabled={isIntelligentLoading}
                  isLoading={isIntelligentLoading}
                >
                  <Icon as={FiSend} />
                </Button>
              </HStack>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}