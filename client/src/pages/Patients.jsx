import { useEffect, useState } from 'react'
import { 
  Box, 
  Heading, 
  Button, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Input, 
  HStack, 
  VStack,
  Badge,
  Text,
  useColorModeValue,
  Spinner
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEdit3, FiActivity, FiUser, FiSearch } from 'react-icons/fi'
import { supabase } from '../supabaseClient'

export default function Patients(){
  const [patients, setPatients] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  
  useEffect(() => { 
    load() 
  }, [])
  
  async function load(){ 
    try {
      setLoading(true)
      const { data } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
      setPatients(data || [])
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const filtered = patients.filter(p => 
    (p.name || '').toLowerCase().includes(q.toLowerCase()) || 
    (p.email || '').toLowerCase().includes(q.toLowerCase())
  )
  
  const handleOdontogramClick = (patientId) => {
    navigate(`/patients/${patientId}/view?tab=1`)
  }
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh" bg={bgColor}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando pacientes...</Text>
        </VStack>
      </Box>
    )
  }
  
  return (
    <Box bg={bgColor} minH="100vh" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box bg={cardBg} borderRadius="xl" p={6} boxShadow="lg">
          <HStack justify='space-between' mb={4}>
            <VStack align="start" spacing={1}>
              <Heading 
                size='lg' 
                bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                bgClip='text'
                fontWeight='bold'
              >
                👥 Pacientes
              </Heading>
              <Text color="gray.600">
                Gestiona la información de todos tus pacientes
              </Text>
            </VStack>
            <Link to='/patients/new'>
              <Button 
                size="lg"
                leftIcon={<FiUser />}
                bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                color='white'
                _hover={{ 
                  transform: 'translateY(-2px)', 
                  boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)',
                  bg: 'linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                }}
                transition="all 0.2s"
              >
                Nuevo Paciente
              </Button>
            </Link>
          </HStack>
          
          <HStack spacing={4}>
            <Box position="relative" flex={1}>
              <Input 
                placeholder='🔍 Buscar por nombre o correo...' 
                value={q} 
                onChange={e => setQ(e.target.value)}
                size="lg"
                borderRadius="lg"
                bg="white"
                _focus={{ boxShadow: 'outline' }}
                pl={12}
              />
              <Box position="absolute" left={4} top="50%" transform="translateY(-50%)">
                <FiSearch color="gray.400" />
              </Box>
            </Box>
            <Text color="gray.500" fontSize="sm">
              {filtered.length} de {patients.length} pacientes
            </Text>
          </HStack>
        </Box>

        {/* Tabla de pacientes */}
        <Box bg={cardBg} borderRadius="xl" p={6} boxShadow="lg" overflow="hidden">
          <Table size='md' variant='simple'>
            <Thead>
              <Tr bg="gray.50">
                <Th>👤 Paciente</Th>
                <Th>📅 Edad</Th>
                <Th>📞 Contacto</Th>
                <Th>🏥 Estado</Th>
                <Th>⚡ Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map(p => (
                <Tr key={p.id} _hover={{ bg: 'gray.50' }} transition="all 0.2s">
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" color="gray.800">
                        {p.name}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        ID: {p.id.slice(0, 8)}...
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue" variant="subtle">
                      {p.age || 'N/A'} años
                    </Badge>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm">
                        📱 {p.mobile || p.phone || 'No especificado'}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        📧 {p.email || 'No especificado'}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      {p.diabetes && (
                        <Badge colorScheme="red" size="sm">Diabetes</Badge>
                      )}
                      {p.hypertension && (
                        <Badge colorScheme="orange" size="sm">Hipertensión</Badge>
                      )}
                      {p.bruxism && (
                        <Badge 
                  bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                  color='white'
                  size="sm"
                >
                  Bruxismo
                </Badge>
                      )}
                      {!p.diabetes && !p.hypertension && !p.bruxism && (
                        <Badge colorScheme="green" size="sm">Saludable</Badge>
                      )}
                    </VStack>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Link to={`/patients/${p.id}/view`}>
                        <Button 
                          size='sm' 
                          colorScheme='blue' 
                          variant="outline"
                          leftIcon={<FiEye />}
                        >
                          Ver
                        </Button>
                      </Link>
                      <Link to={`/patients/${p.id}`}>
                        <Button 
                          size='sm' 
                          colorScheme='green' 
                          variant="outline"
                          leftIcon={<FiEdit3 />}
                        >
                          Editar
                        </Button>
                      </Link>
                                              <Button 
                          size='sm' 
                          bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                color='white' 
                          variant="outline"
                          leftIcon={<FiActivity />}
                          onClick={() => handleOdontogramClick(p.id)}
                        >
                          Odontograma
                        </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          
          {filtered.length === 0 && (
            <Box textAlign="center" py={10}>
              <Text color="gray.500" fontSize="lg">
                {q ? 'No se encontraron pacientes con esa búsqueda' : 'No hay pacientes registrados'}
              </Text>
            </Box>
          )}
        </Box>
      </VStack>
    </Box>
  )
}