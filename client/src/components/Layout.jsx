import { Box, Flex, Heading, VStack, HStack, Text, Icon, Avatar, Button, useColorModeValue } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiUsers, FiMessageSquare, FiHome, FiLogOut, FiPlusCircle, FiUser, FiCalendar, FiFileText } from 'react-icons/fi'
import { supabase } from '../supabaseClient'
import { useSession } from '../hooks/useSupabase'

const slideIn = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`

const NavItem = ({to, icon: Icon, children, isActive}) => (
  <Link to={to}>
    <Flex 
      align='center' 
      gap={3} 
      p={4} 
      rounded='xl' 
              bg={isActive ? 'rgba(0, 180, 216, 0.1)' : 'transparent'}
        color={isActive ? '#00B4D8' : 'gray.600'}
        border={isActive ? '2px solid' : '2px solid transparent'}
        borderColor={isActive ? '#00B4D8' : 'transparent'}
        _hover={{
          bg: isActive ? 'rgba(0, 180, 216, 0.15)' : 'rgba(0, 180, 216, 0.05)',
        transform: 'translateX(5px)',
        transition: 'all 0.3s ease'
      }}
      transition='all 0.3s ease'
      cursor='pointer'
    >
              <Icon 
          boxSize={5} 
          color={isActive ? '#00B4D8' : 'gray.500'}
        />
      <Text 
        fontWeight={isActive ? '600' : '500'}
        display={{base:'none', md:'block'}}
      >
        {children}
      </Text>
    </Flex>
  </Link>
)

export default function Layout({ children }){
  const navigate = useNavigate()
  const location = useLocation()
  const { session } = useSession()
  
  const sidebarBg = useColorModeValue('white', 'gray.800')
  const mainBg = useColorModeValue('gray.50', 'gray.900')
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <Flex minH='100vh' bg={mainBg}>
      {/* Sidebar */}
      <Box 
        w={{base:'90px', md: '300px'}} 
        bg={sidebarBg}
        p={5} 
        shadow='2xl'
        borderRight='1px solid'
        borderColor='gray.200'
        position='relative'
        animation={`${slideIn} 0.5s ease-out`}
        zIndex={10}
      >
        {/* Header del sidebar */}
        <VStack spacing={4} mb={8}>
          <Box
            w='60px'
            h='60px'
            borderRadius='50%'
            bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
            display='grid'
            placeItems='center'
            boxShadow='0 10px 25px rgba(0, 180, 216, 0.3)'
            animation={`${fadeIn} 0.6s ease-out 0.2s both`}
          >
            <Icon as={FiUser} color='white' boxSize={6} />
          </Box>
          
          <VStack spacing={1} display={{base:'none', md:'block'}}>
            <Heading 
              size='md' 
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              bgClip='text'
              fontWeight='bold'
            >
              Dental Care
            </Heading>
            <Text 
              fontSize='sm' 
              color='gray.500'
              textAlign='center'
            >
              México
            </Text>
          </VStack>
        </VStack>

        {/* Navegación */}
        <VStack spacing={2} align='stretch'>
          <NavItem to='/' icon={FiHome} isActive={isActive('/')}>
            Inicio
          </NavItem>
          <NavItem to='/patients' icon={FiUsers} isActive={isActive('/patients')}>
            Pacientes
          </NavItem>
          <NavItem to='/patients/new' icon={FiPlusCircle} isActive={isActive('/patients/new')}>
            Nuevo paciente
          </NavItem>
          <NavItem to='/agenda' icon={FiCalendar} isActive={isActive('/agenda')}>
            Agenda
          </NavItem>
          <NavItem to='/medical-reports' icon={FiFileText} isActive={isActive('/medical-reports')}>
            Informes Médicos
          </NavItem>
          <NavItem to='/chat' icon={FiMessageSquare} isActive={isActive('/chat')}>
            Asistente
          </NavItem>
        </VStack>

        {/* Información del usuario y logout */}
        <VStack 
          spacing={4} 
          mt={10} 
          p={4} 
          bg='gray.50' 
          rounded='xl'
          border='1px solid'
          borderColor='gray.200'
        >
          {session?.user && (
            <VStack spacing={2} display={{base:'none', md:'block'}}>
              <Avatar 
                size='sm' 
                name={session.user.email}
                bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              />
              <Text fontSize='sm' color='gray.600' textAlign='center' fontWeight='600'>
                Dr. {session.user.email?.split('@')[0] || 'Dentista'}
              </Text>
              <Text fontSize='xs' color='gray.500' textAlign='center'>
                Profesional
              </Text>
            </VStack>
          )}
          
          <Button
            leftIcon={<Icon as={FiLogOut} />}
            variant='outline'
            size='sm'
            w='full'
            colorScheme='red'
            onClick={handleLogout}
            _hover={{
              bg: 'red.50',
              transform: 'translateY(-2px)',
              boxShadow: '0 5px 15px rgba(239, 68, 68, 0.2)'
            }}
            transition='all 0.3s ease'
          >
            <Text display={{base:'none', md:'block'}}>
              Cerrar Sesión
            </Text>
          </Button>
        </VStack>
      </Box>

      {/* Contenido principal */}
      <Box 
        flex='1' 
        p={{base:4, md:8}}
        animation={`${fadeIn} 0.6s ease-out 0.4s both`}
        bg={mainBg}
      >
        {children}
      </Box>
    </Flex>
  )
}