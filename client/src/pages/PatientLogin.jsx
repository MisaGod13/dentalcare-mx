import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
  Container,
  Image,
  Divider
} from '@chakra-ui/react'
import { FiEye, FiEyeOff, FiLock, FiUser, FiShield } from 'react-icons/fi'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function PatientLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  
  const toast = useToast()
  const navigate = useNavigate()
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    // Verificar si el usuario ya está autenticado
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Verificar si es paciente
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role === 'patient') {
          navigate('/patient-dashboard')
        }
      }
    }
    
    checkAuth()
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Verificar si es paciente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, patient_id')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.error('Error al obtener perfil:', profileError)
        // Si hay error, intentar obtener solo el rol básico
        const { data: basicProfile, error: basicError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        
        if (basicError || basicProfile?.role !== 'patient') {
          await supabase.auth.signOut()
          throw new Error('Acceso denegado. Solo los pacientes pueden usar esta página.')
        }
      } else if (profile?.role !== 'patient') {
        await supabase.auth.signOut()
        throw new Error('Acceso denegado. Solo los pacientes pueden usar esta página.')
      }

      // Por ahora, siempre mostrar el formulario de cambio de contraseña
      // para pacientes que usan credenciales temporales
      setIsFirstLogin(true)
      setIsLoading(false)

    } catch (error) {
      console.error('Error en login:', error)
      toast({
        title: 'Error de acceso',
        description: error.message || 'No se pudo iniciar sesión',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
      setIsLoading(false)
    }
  }

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres'
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'La contraseña debe contener al menos una letra minúscula'
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'La contraseña debe contener al menos una letra mayúscula'
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'La contraseña debe contener al menos un número'
    }
    return ''
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setNewPassword(value)
    setPasswordError(validatePassword(value))
  }

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value
    setConfirmPassword(value)
    setConfirmPasswordError(value !== newPassword ? 'Las contraseñas no coinciden' : '')
  }

  const handleChangePassword = async () => {
    if (passwordError || confirmPasswordError || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Por favor corrige los errores en el formulario',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    setIsLoading(true)

    try {
      // Cambiar contraseña
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      // Actualizar el perfil del paciente (opcional)
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            last_login: new Date().toISOString(),
            is_active: true
          })
          .eq('id', (await supabase.auth.getUser()).data.user.id)

        if (profileError) {
          console.warn('No se pudo actualizar el perfil:', profileError)
          // No es crítico, continuar
        }
      } catch (profileError) {
        console.warn('Error al actualizar perfil:', profileError)
        // No es crítico, continuar
      }

      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido actualizada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      // Redirigir al dashboard
      navigate('/patient-dashboard')

    } catch (error) {
      console.error('Error cambiando contraseña:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cambiar la contraseña: ' + error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      })
      setIsLoading(false)
    }
  }

  if (isFirstLogin) {
    return (
      <Container maxW="md" py={10}>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody p={8}>
            <VStack spacing={6}>
              <Box textAlign="center">
                <FiShield size={48} color="#7DC4A5" />
                <Heading size="lg" mt={4} color="gray.700">
                  Cambio de Contraseña
                </Heading>
                <Text color="gray.600" mt={2}>
                  Por seguridad, debes cambiar tu contraseña temporal
                </Text>
              </Box>

              <Alert status="info">
                <AlertIcon />
                <Text fontSize="sm">
                  Crea una contraseña segura que puedas recordar fácilmente
                </Text>
              </Alert>

              <VStack spacing={4} w="100%">
                <FormControl isInvalid={!!passwordError}>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <InputGroup>
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Ingresa tu nueva contraseña"
                      pr="4.5rem"
                    />
                    <InputRightElement>
                      <IconButton
                        h="1.75rem"
                        size="sm"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        icon={showNewPassword ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{passwordError}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!confirmPasswordError}>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <InputGroup>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      placeholder="Confirma tu nueva contraseña"
                      pr="4.5rem"
                    />
                    <InputRightElement>
                      <IconButton
                        h="1.75rem"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{confirmPasswordError}</FormErrorMessage>
                </FormControl>

                <Button
                  colorScheme="blue"
                  w="100%"
                  size="lg"
                  onClick={handleChangePassword}
                  isLoading={isLoading}
                  loadingText="Actualizando..."
                >
                  Cambiar contraseña
                </Button>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    )
  }

  return (
    <Container maxW="md" py={10}>
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody p={8}>
          <VStack spacing={6}>
            <Box textAlign="center">
              <FiShield size={48} color="#7DC4A5" />
              <Heading size="lg" mt={4} color="gray.700">
                Acceso Pacientes
              </Heading>
              <Text color="gray.600" mt={2}>
                Inicia sesión para acceder a tu información médica
              </Text>
            </Box>

            <Alert status="info">
              <AlertIcon />
              <Text fontSize="sm">
                Usa las credenciales que te proporcionó tu dentista
              </Text>
            </Alert>

            <form onSubmit={handleLogin} style={{ width: '100%' }}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <InputGroup>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      leftIcon={<FiUser />}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>Contraseña</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu contraseña"
                      pr="4.5rem"
                    />
                    <InputRightElement>
                      <IconButton
                        h="1.75rem"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  w="100%"
                  size="lg"
                  isLoading={isLoading}
                  loadingText="Iniciando sesión..."
                >
                  Iniciar sesión
                </Button>
              </VStack>
            </form>

            <Divider />

            <Box textAlign="center">
              <Text fontSize="sm" color="gray.500">
                ¿No tienes cuenta? Contacta a tu dentista
              </Text>
              <Text fontSize="sm" color="gray.500">
                ¿Problemas para acceder? Solicita ayuda
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  )
}


