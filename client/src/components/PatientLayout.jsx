import React, { useState } from 'react'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
  useToast
} from '@chakra-ui/react'
import {
  FiMenu,
  FiHome,
  FiCalendar,
  FiFileText,
  FiHeart,
  FiShield,
  FiBell,
  FiUser,
  FiLogOut,
  FiSettings
} from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function PatientLayout({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [userProfile, setUserProfile] = useState(null)
  const [patientData, setPatientData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  React.useEffect(() => {
    fetchUserProfile()
    fetchNotifications()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Obtener el perfil del usuario
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setUserProfile(profile)
          
          // Si tiene patient_id, obtener la información del paciente
          if (profile.patient_id) {
            const { data: patient } = await supabase
              .from('patients')
              .select('*')
              .eq('id', profile.patient_id)
              .single()
            
            if (patient) {
              setPatientData(patient)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('patient_id')
          .eq('id', user.id)
          .single()
        
        if (profile?.patient_id) {
          const { data: notifs } = await supabase
            .from('patient_notifications')
            .select('*')
            .eq('patient_id', profile.patient_id)
            .eq('is_read', false)
            .order('created_at', { ascending: false })
          
          setNotifications(notifs || [])
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
      toast({
        title: 'Error',
        description: 'Error al cerrar sesión',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const navigationItems = [
    { name: 'Dashboard', icon: FiHome, path: '/patient-dashboard' },
    { name: 'Agenda', icon: FiCalendar, path: '/patient-agenda' },
    { name: 'Agendar', icon: FiCalendar, path: '/patient-schedule' },
    { name: 'Informes Médicos', icon: FiFileText, path: '/patient-reports' },
    { name: 'Chat IA', icon: FiBell, path: '/patient-chat' }
  ]

  const isActiveRoute = (path) => location.pathname === path

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header móvil */}
      <Box
        display={{ base: 'flex', lg: 'none' }}
        bg={bgColor}
        borderBottom="1px solid"
        borderColor={borderColor}
        p={4}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <HStack justify="space-between" w="full">
          <IconButton
            icon={<FiMenu />}
            variant="ghost"
            onClick={onOpen}
            aria-label="Abrir menú"
          />
          
          <Text fontSize="lg" fontWeight="bold" color="blue.600">
            Panel Paciente
          </Text>
          
          <HStack spacing={2}>
            {notifications.length > 0 && (
              <Badge colorScheme="red" variant="solid" borderRadius="full">
                {notifications.length}
              </Badge>
            )}
            <Avatar size="sm" name={patientData?.name || userProfile?.full_name} />
          </HStack>
        </HStack>
      </Box>

      {/* Sidebar para desktop */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        position="fixed"
        left={0}
        top={0}
        h="100vh"
        w="280px"
        bg={bgColor}
        borderRight="1px solid"
        borderColor={borderColor}
        zIndex={20}
      >
        <VStack h="full" spacing={0}>
          {/* Header del sidebar */}
          <Box
            w="full"
            p={6}
            borderBottom="1px solid"
            borderColor={borderColor}
            textAlign="center"
          >
            <Text fontSize="xl" fontWeight="bold" color="blue.600">
              Panel Paciente
            </Text>
            <Text fontSize="sm" color={textColor} mt={1} fontWeight="600">
              Bienvenido, {patientData?.name || userProfile?.full_name || 'Usuario'}
            </Text>
            <Badge colorScheme="blue" variant="subtle" fontSize="xs">
              Paciente
            </Badge>
          </Box>

          {/* Navegación */}
          <VStack spacing={2} w="full" p={4} flex={1}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                leftIcon={<item.icon />}
                variant={isActiveRoute(item.path) ? 'solid' : 'ghost'}
                colorScheme={isActiveRoute(item.path) ? 'blue' : 'gray'}
                w="full"
                justifyContent="flex-start"
                onClick={() => navigate(item.path)}
                h="50px"
              >
                {item.name}
              </Button>
            ))}
          </VStack>

          {/* Footer del sidebar */}
          <Box
            w="full"
            p={4}
            borderTop="1px solid"
            borderColor={borderColor}
          >
            <VStack spacing={2}>
              <Button
                leftIcon={<FiUser />}
                variant="ghost"
                w="full"
                justifyContent="flex-start"
                onClick={() => navigate('/patient-profile')}
              >
                Mi Perfil
              </Button>
              <Button
                leftIcon={<FiLogOut />}
                variant="outline"
                size="sm"
                w="full"
                colorScheme="red"
                onClick={handleLogout}
                _hover={{
                  bg: 'red.50',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(239, 68, 68, 0.2)'
                }}
                transition="all 0.3s ease"
              >
                Cerrar Sesión
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Contenido principal */}
      <Box
        ml={{ base: 0, lg: '280px' }}
        pt={{ base: '80px', lg: 0 }}
        minH="100vh"
      >
        {children}
      </Box>

      {/* Drawer móvil */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Panel Paciente
          </DrawerHeader>
          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  leftIcon={<item.icon />}
                  variant={isActiveRoute(item.path) ? 'solid' : 'ghost'}
                  colorScheme={isActiveRoute(item.path) ? 'blue' : 'gray'}
                  w="full"
                  justifyContent="flex-start"
                  onClick={() => {
                    navigate(item.path)
                    onClose()
                  }}
                  h="50px"
                  borderRadius={0}
                >
                  {item.name}
                </Button>
              ))}
              
              <Box p={4} borderTop="1px solid" borderColor={borderColor}>
                <VStack spacing={2}>
                  <Button
                    leftIcon={<FiUser />}
                    variant="ghost"
                    w="full"
                    justifyContent="flex-start"
                    onClick={() => {
                      navigate('/patient-profile')
                      onClose()
                    }}
                  >
                    Mi Perfil
                  </Button>
                  <Button
                    leftIcon={<FiLogOut />}
                    variant="outline"
                    size="sm"
                    w="full"
                    colorScheme="red"
                    onClick={() => {
                      handleLogout()
                      onClose()
                    }}
                    _hover={{
                      bg: 'red.50',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 5px 15px rgba(239, 68, 68, 0.2)'
                    }}
                    transition="all 0.3s ease"
                  >
                    Cerrar Sesión
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}
