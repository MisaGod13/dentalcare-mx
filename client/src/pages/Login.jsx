import { Box, Button, Card, CardBody, Heading, Input, Stack, Text, useToast } from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../supabaseClient'
export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const toast=useToast()
  const navigate=useNavigate()
  
  const onSubmit=async(e)=>{
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({email,password})
      
      if(error){
        toast({
          title:'Error de acceso',
          description:error.message,
          status:'error',
          duration:5000,
          isClosable:true
        })
        setLoading(false)
        return
      }
      
      if(data.user){
        // Verificar el rol del usuario
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, patient_id')
          .eq('id', data.user.id)
          .single()
        
        if(profileError){
          console.error('Error al obtener perfil:', profileError)
          toast({
            title:'Error',
            description:'No se pudo verificar tu rol de usuario',
            status:'error',
            duration:5000,
            isClosable:true
          })
          setLoading(false)
          return
        }
        
        if(profile){
          // Redirigir basado en el rol
          if(profile.role === 'patient'){
            console.log('Paciente detectado, redirigiendo a dashboard de paciente...')
            navigate('/patient-dashboard')
          } else if(profile.role === 'dentist'){
            console.log('Dentista detectado, redirigiendo a dashboard principal...')
            navigate('/dashboard')
          } else {
            // Rol no reconocido
            toast({
              title:'Error',
              description:'Rol de usuario no reconocido',
              status:'error',
              duration:5000,
              isClosable:true
            })
            setLoading(false)
          }
        } else {
          toast({
            title:'Error',
            description:'Perfil de usuario no encontrado',
            status:'error',
            duration:5000,
            isClosable:true
          })
          setLoading(false)
        }
      }
    } catch (error) {
      console.error('Error en login:', error)
      toast({
        title:'Error',
        description:'Error inesperado durante el login',
        status:'error',
        duration:5000,
        isClosable:true
      })
      setLoading(false)
    }
  }
  return(<Box minH='100vh' bg='gray.50' display='grid' placeItems='center'>
    <Card w='full' maxW='420px' shadow='xl'>
      <CardBody>
        <Stack spacing={4}>
          <img src='/logo.png' style={{height:64, alignSelf:'center'}}/>
          <Heading 
            size='md' 
            textAlign='center'
            bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
            bgClip='text'
            fontWeight='bold'
          >
            Iniciar sesión
          </Heading>
          <form onSubmit={onSubmit}>
            <Stack spacing={3}>
              <Input type='email' placeholder='Correo' value={email} onChange={e=>setEmail(e.target.value)} required/>
              <Input type='password' placeholder='Contraseña' value={password} onChange={e=>setPassword(e.target.value)} required/>
              <Button 
                type='submit' 
                bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                color='white'
                isLoading={loading}
                loadingText="Verificando..."
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
                }}
              >
                Entrar
              </Button>
            </Stack>
          </form>
          <Text fontSize='sm' textAlign='center'>
            ¿No tienes cuenta? <Link to='/register' style={{color:'#00B4D8'}}>Crear cuenta</Link>
          </Text>
        </Stack>
      </CardBody>
    </Card>
  </Box>) }