import { 
  Box, 
  Button, 
  Card, 
  CardBody, 
  Heading, 
  Input, 
  Stack, 
  Text, 
  useToast,
  VStack,
  HStack,
  Icon,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { FiMail, FiLock, FiUser, FiShield, FiPlus } from 'react-icons/fi'

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.5); }
  50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.8); }
`

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Primero crear el usuario
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) {
        toast({
          title: 'Error al crear cuenta',
          description: error.message,
          status: 'error'
        })
        return
      }

      // Si el usuario se creó exitosamente, crear el perfil
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            role: 'dentist'
          })

        if (profileError) {
          console.error('Error al crear perfil:', profileError)
          // El usuario se creó pero no el perfil, esto se puede manejar después
        }
      }

      toast({
        title: 'Cuenta creada exitosamente',
        description: 'Revisa tu correo para confirmar tu cuenta',
        status: 'success'
      })
      
      navigate('/login')
    } catch (error) {
      toast({
        title: 'Error inesperado',
        description: error.message,
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box 
      minH='100vh' 
      bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
      display='grid' 
      placeItems='center'
      position='relative'
      overflow='hidden'
    >
      {/* Elementos decorativos de fondo */}
      <Box
        position='absolute'
        top='10%'
        left='5%'
        w='150px'
        h='150px'
        borderRadius='50%'
        bg='rgba(255,255,255,0.1)'
        animation={`${float} 4s ease-in-out infinite`}
      />
      <Box
        position='absolute'
        bottom='10%'
        right='5%'
        w='100px'
        h='100px'
        borderRadius='50%'
        bg='rgba(255,255,255,0.1)'
        animation={`${float} 4s ease-in-out infinite 2s`}
      />
      <Box
        position='absolute'
        top='50%'
        left='50%'
        transform='translate(-50%, -50%)'
        w='300px'
        h='300px'
        borderRadius='50%'
        bg='rgba(255,255,255,0.05)'
        animation={`${float} 6s ease-in-out infinite 1s`}
      />

      <Card 
        w='full' 
        maxW='450px' 
        shadow='2xl'
        bg='rgba(255, 255, 255, 0.95)'
        backdropFilter='blur(10px)'
        border='1px solid rgba(255, 255, 255, 0.2)'
        borderRadius='2xl'
        position='relative'
        zIndex={1}
        _hover={{
          transform: 'translateY(-5px)',
          transition: 'all 0.3s ease'
        }}
      >
        <CardBody p={8}>
          <VStack spacing={6}>
            {/* Logo y título */}
            <VStack spacing={4}>
              <Box
                position='relative'
                animation={`${glow} 3s ease-in-out infinite`}
              >
                <Box
                  w='80px'
                  h='80px'
                  borderRadius='50%'
                  bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                  display='grid'
                  placeItems='center'
                  boxShadow='0 10px 30px rgba(0, 180, 216, 0.3)'
                >
                  <Icon as={FiPlus} color='white' boxSize={8} />
                </Box>
              </Box>
              
              <VStack spacing={2}>
                <Heading 
                  size='lg' 
                  textAlign='center'
                  bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                  bgClip='text'
                  fontWeight='bold'
                >
                  Crear cuenta
                </Heading>
                <Text 
                  color='gray.600' 
                  textAlign='center'
                  fontSize='sm'
                >
                  Únete a nuestro sistema dental profesional
                </Text>
              </VStack>
            </VStack>

            {/* Formulario */}
            <form onSubmit={onSubmit} style={{ width: '100%' }}>
              <VStack spacing={4}>
                <InputGroup>
                  <InputLeftElement pointerEvents='none'>
                    <Icon as={FiUser} color='gray.400' />
                  </InputLeftElement>
                  <Input 
                    placeholder='Nombre completo' 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    required
                    size='lg'
                    borderRadius='xl'
                    border='2px solid'
                    borderColor='gray.200'
                    _focus={{
                      borderColor: '#00B4D8',
                      boxShadow: '0 0 0 1px #00B4D8'
                    }}
                    _hover={{
                      borderColor: 'gray.300'
                    }}
                  />
                </InputGroup>
                
                <InputGroup>
                  <InputLeftElement pointerEvents='none'>
                    <Icon as={FiMail} color='gray.400' />
                  </InputLeftElement>
                  <Input 
                    type='email' 
                    placeholder='Correo electrónico' 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required
                    size='lg'
                    borderRadius='xl'
                    border='2px solid'
                    borderColor='gray.200'
                    _focus={{
                      borderColor: '#00B4D8',
                      boxShadow: '0 0 0 1px #00B4D8'
                    }}
                    _hover={{
                      borderColor: 'gray.300'
                    }}
                  />
                </InputGroup>
                
                <InputGroup>
                  <InputLeftElement pointerEvents='none'>
                    <Icon as={FiLock} color='gray.400' />
                  </InputLeftElement>
                  <Input 
                    type='password' 
                    placeholder='Contraseña' 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required
                    size='lg'
                    borderRadius='xl'
                    border='2px solid'
                    borderColor='gray.200'
                    _focus={{
                      borderColor: '#00B4D8',
                      boxShadow: '0 0 0 1px #00B4D8'
                    }}
                    _hover={{
                      borderColor: 'gray.300'
                    }}
                  />
                </InputGroup>
                
                <Button 
                  type='submit' 
                  w='full'
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
                  isLoading={isLoading}
                  loadingText="Creando cuenta..."
                  transition='all 0.3s ease'
                >
                  Crear cuenta
                </Button>
              </VStack>
            </form>

            {/* Enlaces */}
            <VStack spacing={3}>
              <Text 
                fontSize='sm' 
                textAlign='center'
                color='gray.600'
              >
                ¿Ya tienes cuenta?{' '}
                <Link 
                  to='/login' 
                  style={{
                    color: '#00B4D8',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  Iniciar sesión
                </Link>
              </Text>
              
              <Text 
                fontSize='xs' 
                color='gray.500'
                textAlign='center'
              >
                Sistema de gestión dental profesional
              </Text>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}