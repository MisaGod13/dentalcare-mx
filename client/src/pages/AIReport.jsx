import { useEffect, useState } from 'react'
import { Box, Heading, Text, VStack, HStack, Icon, useColorModeValue } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import MedicalReportGenerator from '../components/MedicalReportGenerator'
import { FiFileText, FiArrowLeft } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Button } from '@chakra-ui/react'
export default function AIReport(){
  const { id: patientId } = useParams()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const cardBg = useColorModeValue('white', 'gray.800')
  
  useEffect(() => {
    loadPatientData()
  }, [patientId])

  const loadPatientData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()
      
      if (error) throw error
      setPatient(data)
    } catch (error) {
      console.error('Error loading patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <Text>Cargando datos del paciente...</Text>
      </Box>
    )
  }

  if (!patient) {
    return (
      <Box p={6} textAlign="center">
        <Text color="red.500">No se encontró el paciente</Text>
      </Box>
    )
  }

  return (
    <Box p={6}>
      {/* Header */}
      <VStack spacing={4} align="stretch" mb={6}>
        <HStack justify="space-between" align="center">
          <HStack>
            <Link to={`/patients/${patientId}`}>
              <Button
                leftIcon={<FiArrowLeft />}
                variant="outline"
                size="sm"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
                }}
              >
                Volver al Paciente
              </Button>
            </Link>
          </HStack>
        </HStack>
        
        <Box textAlign="center">
          <HStack justify="center" mb={2}>
            <Icon as={FiFileText} boxSize={8} color="blue.500" />
            <Heading 
              size="xl"
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              bgClip='text'
              fontWeight='bold'
            >
              Informes Médicos
            </Heading>
          </HStack>
          <Text color="gray.600" fontSize="lg">
            Genera informes médicos inteligentes para {patient.name}
          </Text>
        </Box>
      </VStack>

      {/* Componente de generación de informes */}
      <MedicalReportGenerator 
        patientId={patientId} 
        patientData={patient}
        onReportGenerated={(report) => {
          console.log('Nuevo informe generado:', report)
        }}
      />
    </Box>
  )
}