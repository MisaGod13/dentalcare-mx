import { 
  Box, 
  Grid, 
  Heading, 
  Card, 
  CardBody, 
  Stat, 
  StatLabel, 
  StatNumber, 
  Button, 
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  Badge,
  Flex,
  Progress
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { 
  FiUsers, 
  FiFileText, 
  FiMessageSquare, 
  FiTrendingUp, 
  FiActivity,
  FiPlus,
  FiCalendar,
  FiClock,
  FiShield
} from 'react-icons/fi'

const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`

export default function Dashboard(){
  console.log('Dashboard - Component rendered')
  
  const [counts, setCounts] = useState({patients: 0, files: 0, reports: 0, patientAccounts: 0, pendingRequests: 0})
  const [loading, setLoading] = useState(true)
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  useEffect(()=>{
    console.log('Dashboard - useEffect running')
    const fetchData = async () => {
      try {
        setLoading(true)
    const { count: pc } = await supabase.from('patients').select('*', { count: 'exact', head: true })
    const { count: fc } = await supabase.from('files').select('*', { count: 'exact', head: true })
    const { count: rc } = await supabase.from('ai_reports').select('*', { count: 'exact', head: true })
    
    // Obtener conteo de cuentas de pacientes activas
    const { count: pac } = await supabase
      .from('patient_account_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
    
    // Obtener conteo de solicitudes pendientes
    const { count: pr } = await supabase
      .from('patient_account_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    setCounts({ 
      patients: pc||0, 
      files: fc||0, 
      reports: rc||0, 
      patientAccounts: pac||0,
      pendingRequests: pr||0
    })
      } catch (error) {
        console.error('Dashboard - Error fetching counts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  },[])
  
  const StatCard = ({ icon, label, value, color, gradient, delay }) => (
    <Card
      bg={cardBg}
      border='1px solid'
      borderColor={borderColor}
      borderRadius='2xl'
      shadow='lg'
      _hover={{
        transform: 'translateY(-5px)',
        shadow: '2xl',
        transition: 'all 0.3s ease'
      }}
      transition='all 0.3s ease'
      animation={`${fadeInUp} 0.6s ease-out ${delay}s both`}
    >
      <CardBody p={6}>
        <VStack spacing={4} align='stretch'>
          <HStack justify='space-between'>
            <Box
              w='50px'
              h='50px'
              borderRadius='xl'
              bg={gradient}
              display='grid'
              placeItems='center'
              boxShadow='0 5px 15px rgba(0,0,0,0.1)'
            >
              <Icon as={icon} color='white' boxSize={6} />
            </Box>
            <Badge 
              colorScheme={color} 
              variant='subtle'
              fontSize='sm'
              px={3}
              py={1}
              borderRadius='full'
            >
              {loading ? '...' : 'Activo'}
            </Badge>
          </HStack>
          
          <Stat>
            <StatLabel 
              color='gray.600' 
              fontSize='sm' 
              fontWeight='500'
            >
              {label}
            </StatLabel>
            <StatNumber 
              fontSize='3xl' 
              fontWeight='bold'
              color={color}
            >
              {loading ? '...' : value}
            </StatNumber>
          </Stat>
          
          <Progress 
            value={loading ? 0 : Math.min((value / 10) * 100, 100)} 
            colorScheme={color} 
            size='sm' 
            borderRadius='full'
            bg='gray.100'
          />
        </VStack>
      </CardBody>
    </Card>
  )

  return (
    <Box animation={`${fadeInUp} 0.6s ease-out both`}>
      {/* Header del Dashboard */}
      <VStack spacing={6} align='stretch' mb={8}>
        <VStack spacing={3} align='stretch'>
          <Heading 
            size='2xl'
            bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
            bgClip='text'
            fontWeight='bold'
          >
            Panel del Dentista
          </Heading>
          <Text 
            color='gray.600' 
            fontSize='lg'
            maxW='600px'
          >
            Bienvenido a tu centro de control dental. Aquí puedes gestionar pacientes, 
            revisar archivos y acceder a informes de IA.
          </Text>
        </VStack>
        
        <HStack spacing={4} wrap="wrap">
          <Link to='/patients/new'>
            <Button
              leftIcon={<FiPlus />}
              size='lg'
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              color='white'
              borderRadius='xl'
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
              }}
              _active={{
                transform: 'translateY(0)'
              }}
              transition='all 0.3s ease'
            >
              Registrar nuevo paciente
            </Button>
          </Link>
          
          <Link to='/medical-reports'>
            <Button
              leftIcon={<FiFileText />}
              size='lg'
              bg='linear-gradient(135deg, #7DC4A5 0%, #00B4D8 100%)'
              color='white'
              borderRadius='xl'
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(125, 196, 165, 0.4)'
              }}
              _active={{
                transform: 'translateY(0)'
              }}
              transition='all 0.3s ease'
            >
              Generar Informes IA
            </Button>
          </Link>
          
          <Link to='/agenda'>
          <Button
            leftIcon={<FiCalendar />}
            size='lg'
            variant='outline'
            borderColor='#00B4D8'
            color='#00B4D8'
            borderRadius='xl'
            _hover={{
              bg: 'rgba(0, 180, 216, 0.1)',
              transform: 'translateY(-2px)'
            }}
            transition='all 0.3s ease'
          >
            Ver agenda
          </Button>
          </Link>
        </HStack>
      </VStack>

      {/* Estadísticas principales */}
      <Grid 
        templateColumns={{base:'1fr', md:'repeat(2, 1fr)', lg:'repeat(4, 1fr)'}} 
        gap={6} 
        mb={8}
      >
        <StatCard
          icon={FiUsers}
          label="Pacientes"
          value={counts.patients}
          color="blue"
          gradient="linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)"
          delay={0.1}
        />
        <StatCard
          icon={FiFileText}
          label="Archivos"
          value={counts.files}
          color="green"
          gradient="linear-gradient(135deg, #7DC4A5 0%, #A8E6CF 100%)"
          delay={0.2}
        />
        <StatCard
          icon={FiMessageSquare}
          label="Informes IA"
          value={counts.reports}
          color="cyan"
          gradient="linear-gradient(135deg, #90E0EF 0%, #CAF0F8 100%)"
          delay={0.3}
        />
        <StatCard
          icon={FiShield}
          label="Cuentas Activas"
          value={counts.patientAccounts}
          color="orange"
          gradient="linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)"
          delay={0.4}
        />
        {counts.pendingRequests > 0 && (
          <Box
            position="absolute"
            top="4"
            right="4"
            bg="red.500"
            color="white"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="sm"
            fontWeight="bold"
            zIndex={1}
          >
            {counts.pendingRequests} pendiente{counts.pendingRequests > 1 ? 's' : ''}
          </Box>
        )}
      </Grid>

      {/* Sección de acciones rápidas */}
      <Card
        bg={cardBg}
        border='1px solid'
        borderColor={borderColor}
        borderRadius='2xl'
        shadow='lg'
        animation={`${fadeInUp} 0.6s ease-out 0.4s both`}
      >
        <CardBody p={6}>
          <VStack spacing={6} align='stretch'>
            <Heading size='md' color='gray.700'>
              Acciones rápidas
            </Heading>
            
            <Grid templateColumns={{base:'1fr', md:'repeat(3, 1fr)'}} gap={4}>
              <Link to='/patients'>
                <Button
                  leftIcon={<FiUsers />}
                  variant='ghost'
                  size='lg'
                  justifyContent='flex-start'
                  p={4}
                  borderRadius='xl'
                  w='full'
                  _hover={{
                    bg: 'blue.50',
                    transform: 'translateX(5px)'
                  }}
                  transition='all 0.3s ease'
                >
                  Ver todos los pacientes
                </Button>
              </Link>
              
              <Link to='/chat-assistant'>
                <Button
                  leftIcon={<FiMessageSquare />}
                  variant='ghost'
                  size='lg'
                  justifyContent='flex-start'
                  p={4}
                  borderRadius='xl'
                  w='full'
                  _hover={{
                    bg: 'purple.50',
                    transform: 'translateX(5px)'
                  }}
                  transition='all 0.3s ease'
                >
                  Chat con asistente IA
                </Button>
              </Link>
              
              <Link to='/medical-reports'>
                <Button
                  leftIcon={<FiFileText />}
                  variant='ghost'
                  size='lg'
                  justifyContent='flex-start'
                  p={4}
                  borderRadius='xl'
                  w='full'
                  _hover={{
                    bg: 'green.50',
                    transform: 'translateX(5px)'
                  }}
                  transition='all 0.3s ease'
                >
                  Informes Médicos IA
                </Button>
              </Link>
              
              
              <Link to='/patient-accounts'>
                <Button
                  leftIcon={<FiShield />}
                  variant='ghost'
                  size='lg'
                  justifyContent='flex-start'
                  p={4}
                  borderRadius='xl'
                  w='full'
                  _hover={{
                    bg: 'orange.50',
                    transform: 'translateX(5px)'
                  }}
                  transition='all 0.3s ease'
                  position="relative"
                >
                  Gestionar cuentas de pacientes
                  {counts.pendingRequests > 0 && (
                    <Badge
                      colorScheme="red"
                      variant="solid"
                      position="absolute"
                      top="2"
                      right="2"
                      borderRadius="full"
                      fontSize="xs"
                      px={2}
                      py={1}
                    >
                      {counts.pendingRequests}
                    </Badge>
                  )}
                </Button>
              </Link>
            </Grid>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}