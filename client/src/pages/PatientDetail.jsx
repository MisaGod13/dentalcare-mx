import { useEffect, useState } from 'react'
import { Box, Heading, Text, Button, HStack, Divider, SimpleGrid, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import FileUploader from '../components/FileUploader'
import Odontogram from '../components/Odontogram'
import ConsultationManager from '../components/ConsultationManager'
import MedicalReportGenerator from '../components/MedicalReportGenerator'
export default function PatientDetail(){
  const { id } = useParams(); const [patient, setPatient] = useState(null)
  useEffect(()=>{(async()=>{ const { data } = await supabase.from('patients').select('*').eq('id', id).single(); setPatient(data) })()},[id])
  if(!patient) return null
  return (
    <Box>
      <HStack justify='space-between' mb={6}>
        <Heading size="xl" bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)' bgClip='text'>
          {patient.name}
        </Heading>
        <HStack spacing={3}>
          <Link to={`/patients/${id}/history`}>
            <Button 
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              color='white'
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
              }}
            >
              Historia clínica
            </Button>
          </Link>
          <Link to={`/ai-report/${id}`}>
            <Button 
              bg='linear-gradient(135deg, #7DC4A5 0%, #00B4D8 100%)'
              color='white'
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(125, 196, 165, 0.4)'
              }}
            >
              Informes IA
            </Button>
          </Link>
        </HStack>
      </HStack>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Información General</Tab>
          <Tab>Consultas</Tab>
          <Tab>Informes Médicos</Tab>
          <Tab>Odontograma</Tab>
          <Tab>Archivos</Tab>
        </TabList>

        <TabPanels>
          {/* Pestaña de Información General */}
          <TabPanel px={0} py={6}>
            <SimpleGrid columns={{base:1, md:2}} spacing={6}>
              <Box>
                <Heading size='md' mb={4} color="gray.700">Datos Personales</Heading>
                <Text mb={2}><strong>Edad:</strong> {patient.age}</Text>
                <Text mb={2}><strong>Fecha de nacimiento:</strong> {patient.birth_date||'-'}</Text>
                <Text mb={2}><strong>Ocupación:</strong> {patient.occupation||'-'}</Text>
                <Text mb={2}><strong>Estado civil:</strong> {patient.marital_status||'-'}</Text>
                <Text mb={2}><strong>Teléfono:</strong> {patient.phone||'-'} / {patient.mobile||'-'}</Text>
                <Text mb={2}><strong>Email:</strong> {patient.email||'-'}</Text>
                <Text mb={2}><strong>Dirección:</strong> {patient.address||'-'}, {patient.neighborhood||''} {patient.zip_code||''}</Text>
                <Text mb={2}><strong>Motivo de consulta:</strong> {patient.consultation_reason||'-'}</Text>
              </Box>
              <Box>
                <Heading size='md' mb={4} color="gray.700">Información Médica</Heading>
                <Text mb={2}><strong>Alergias:</strong> {patient.allergies ? patient.allergy_details : 'No reportadas'}</Text>
                <Text mb={2}><strong>Diabetes:</strong> {patient.diabetes ? 'Sí' : 'No'}</Text>
                <Text mb={2}><strong>Presión alta:</strong> {patient.high_blood_pressure ? 'Sí' : 'No'}</Text>
                <Text mb={2}><strong>Bruxismo:</strong> {patient.bruxism ? 'Sí' : 'No'}</Text>
                <Text mb={2}><strong>Hábitos de higiene:</strong> {patient.brushings_per_day || 'No especificado'} cepillados/día</Text>
                <Text mb={2}><strong>Usa hilo dental:</strong> {patient.floss ? 'Sí' : 'No'}</Text>
                <Text mb={2}><strong>Usa enjuague:</strong> {patient.mouthwash ? 'Sí' : 'No'}</Text>
              </Box>
            </SimpleGrid>
          </TabPanel>

          {/* Pestaña de Consultas */}
          <TabPanel px={0} py={6}>
            <ConsultationManager patientId={id} patientData={patient} />
          </TabPanel>

          {/* Pestaña de Informes Médicos */}
          <TabPanel px={0} py={6}>
            <MedicalReportGenerator patientId={id} patientData={patient} />
          </TabPanel>

          {/* Pestaña de Odontograma */}
          <TabPanel px={0} py={6}>
            <Heading size='md' mb={4} color="gray.700">Odontograma</Heading>
            <Odontogram patientId={id}/>
          </TabPanel>

          {/* Pestaña de Archivos */}
          <TabPanel px={0} py={6}>
            <Heading size='md' mb={4} color="gray.700">Archivos</Heading>
            <FileUploader patientId={id}/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}