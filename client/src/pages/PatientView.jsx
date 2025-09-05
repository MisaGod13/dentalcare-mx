import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Spacer,
  Badge,
  Icon,
  Heading,
  Divider
} from '@chakra-ui/react';
import { FiArrowLeft, FiEdit3, FiEye, FiActivity, FiFileText, FiUser, FiHeart, FiCalendar } from 'react-icons/fi';
// Import for consultation management
import { supabase } from '../supabaseClient';
import Odontogram from '../components/Odontogram';
import PatientHistory from '../components/PatientHistory';
import ConsultationManager from '../components/ConsultationManager';

const PatientView = () => {
  console.log('PatientView component rendering, FiCalendar:', FiCalendar);
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditingOdontogram, setIsEditingOdontogram] = useState(false);
  const [searchParams] = useSearchParams();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (id) {
      loadPatient();
    }
  }, [id]);

  useEffect(() => {
    // Verificar si hay un parámetro de tab en la URL
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(parseInt(tabParam));
    }
  }, [searchParams]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setPatient(data);
    } catch (error) {
      console.error('Error loading patient:', error);
      setError(error.message);
      toast({
        title: 'Error al cargar paciente',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPatient = () => {
    navigate(`/patients/${id}/edit`);
  };

  const handleOdontogramSave = (odontogramData) => {
    toast({
      title: 'Odontograma guardado',
      description: 'Los cambios se han guardado correctamente',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Recargar los datos del paciente para mostrar el odontograma actualizado
    loadPatient();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
        bg={bgColor}
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando información del paciente...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8} bg={bgColor} minH="100vh">
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <AlertTitle>Error al cargar paciente</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          leftIcon={<FiArrowLeft />}
          mt={4}
          onClick={() => navigate('/patients')}
        >
          Volver a la lista
        </Button>
      </Box>
    );
  }

  if (!patient) {
    return (
      <Box p={8} bg={bgColor} minH="100vh">
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          <AlertTitle>Paciente no encontrado</AlertTitle>
          <AlertDescription>
            El paciente con ID {id} no existe en la base de datos.
          </AlertDescription>
        </Alert>
        <Button
          leftIcon={<FiArrowLeft />}
          mt={4}
          onClick={() => navigate('/patients')}
        >
          Volver a la lista
        </Button>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box bg={cardBg} borderRadius="xl" p={6} boxShadow="lg">
          <Flex align="center" justify="space-between" mb={4}>
            <HStack spacing={4}>
              <Button
                leftIcon={<FiArrowLeft />}
                variant="ghost"
                onClick={() => navigate('/patients')}
              >
                Volver
              </Button>
              <Divider orientation="vertical" h="40px" />
              <VStack align="start" spacing={1}>
                <Heading 
                  size="lg" 
                  bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                  bgClip='text'
                  fontWeight='bold'
                >
                  {patient.name}
                </Heading>
                <HStack spacing={4}>
                  <Badge 
                    bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                    color='white'
                    variant="solid"
                  >
                    ID: {patient.id}
                  </Badge>
                  <Badge 
                    bg='linear-gradient(135deg, #7DC4A5 0%, #A8E6CF 100%)'
                    color='white'
                    variant="solid"
                  >
                    Edad: {patient.age} años
                  </Badge>
                  {patient.email && (
                                      <Badge 
                    bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                    color='white'
                    variant="solid"
                  >
                    {patient.email}
                  </Badge>
                  )}
                </HStack>
              </VStack>
            </HStack>
            
            <HStack spacing={3}>
              <Button
                leftIcon={<FiEdit3 />}
                colorScheme="blue"
                variant="outline"
                onClick={handleEditPatient}
              >
                Editar Paciente
              </Button>
                             <Button
                 leftIcon={<FiActivity />}
                 bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                color='white'
                 variant="outline"
                 onClick={() => setIsEditingOdontogram(!isEditingOdontogram)}
               >
                 {isEditingOdontogram ? 'Ver Odontograma' : 'Editar Odontograma'}
               </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Tabs principales */}
        <Tabs 
          variant="enclosed" 
          colorScheme="blue" 
          index={activeTab}
          onChange={setActiveTab}
        >
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiUser} />
                <Text>Historia Clínica</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiActivity} />
                <Text>Odontograma</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiActivity} />
                <Text>Consultas del Paciente</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiHeart} />
                <Text>Resumen de Salud</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Historia Clínica */}
            <TabPanel>
              <PatientHistory
                patientId={patient.id}
                patientData={patient}
                onEdit={handleEditPatient}
              />
            </TabPanel>

            {/* Odontograma */}
            <TabPanel>
              <Odontogram
                patientId={patient.id}
                isEditing={isEditingOdontogram}
                onSave={handleOdontogramSave}
              />
            </TabPanel>

            {/* Consultas */}
            <TabPanel>
              <ConsultationManager
                patientId={patient.id}
                patientData={patient}
              />
            </TabPanel>

            {/* Resumen de Salud */}
            <TabPanel>
              <Box bg={cardBg} borderRadius="xl" p={6} boxShadow="lg">
                <VStack spacing={6} align="stretch">
                  <Heading size="lg" color="green.600">
                    🏥 Resumen de Salud del Paciente
                  </Heading>
                  
                  {/* Condiciones médicas */}
                  <Box>
                    <Text fontWeight="bold" mb={3} color="gray.700">
                      Condiciones Médicas Principales
                    </Text>
                    <VStack spacing={3} align="stretch">
                      {patient.diabetes && (
                        <Alert status="warning" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Diabetes</AlertTitle>
                            <AlertDescription>
                              Paciente diagnosticado con diabetes. Requiere seguimiento especial.
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                      
                      {patient.hypertension && (
                        <Alert status="warning" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Hipertensión</AlertTitle>
                            <AlertDescription>
                              Paciente con hipertensión arterial. Monitorear presión en cada visita.
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                      
                      {patient.asthma && (
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Asma</AlertTitle>
                            <AlertDescription>
                              Paciente con asma. Considerar en el plan de tratamiento.
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                      
                      {patient.allergies && (
                        <Alert status="error" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Alergias</AlertTitle>
                            <AlertDescription>
                              Paciente con alergias: {patient.allergy_details || 'Especificar tipo'}
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                      
                      {!patient.diabetes && !patient.hypertension && !patient.asthma && !patient.allergies && (
                        <Alert status="success" borderRadius="md">
                          <AlertIcon />
                          <AlertTitle>Sin condiciones médicas especiales</AlertTitle>
                          <AlertDescription>
                            El paciente no presenta condiciones médicas que requieran atención especial.
                          </AlertDescription>
                        </Alert>
                      )}
                    </VStack>
                  </Box>

                  {/* Hábitos */}
                  <Box>
                    <Text fontWeight="bold" mb={3} color="gray.700">
                      Hábitos y Estilo de Vida
                    </Text>
                    <VStack spacing={3} align="stretch">
                      {patient.smoking && (
                        <Alert status="warning" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Fumador</AlertTitle>
                            <AlertDescription>
                              {patient.cigarettes_per_day ? `${patient.cigarettes_per_day} cigarrillos por día` : 'Fumador activo'}
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                      
                      {patient.alcohol && (
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Consumo de Alcohol</AlertTitle>
                            <AlertDescription>
                              Frecuencia: {patient.alcohol_frequency || 'No especificada'}
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                      
                      {patient.physical_activity && (
                        <Alert status="success" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Actividad Física</AlertTitle>
                            <AlertDescription>
                              Tipo: {patient.physical_activity_type || 'No especificado'}
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                    </VStack>
                  </Box>

                  {/* Salud dental */}
                  <Box>
                    <Text fontWeight="bold" mb={3} color="gray.700">
                      Estado de Salud Dental
                    </Text>
                    <VStack spacing={3} align="stretch">
                      {patient.bruxism && (
                        <Alert status="warning" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Bruxismo</AlertTitle>
                            <AlertDescription>
                              Paciente presenta bruxismo. Considerar guarda nocturna.
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                      
                      {patient.gum_bleeding && (
                        <Alert status="warning" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Sangrado de Encías</AlertTitle>
                            <AlertDescription>
                              Frecuencia: {patient.gum_bleeding}
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                      
                      {patient.loose_teeth && (
                        <Alert status="error" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Dientes Flojos</AlertTitle>
                            <AlertDescription>
                              Requiere evaluación periodontal urgente.
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                    </VStack>
                  </Box>

                  {/* Recomendaciones */}
                  <Box>
                    <Text fontWeight="bold" mb={3} color="gray.700">
                      💡 Recomendaciones Generales
                    </Text>
                    <VStack spacing={2} align="stretch">
                      <Text fontSize="sm" color="gray.600">
                        • Cepillado: {patient.brushings_per_day || 'N/A'} veces por día
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        • Hilo dental: {patient.floss ? 'Sí' : 'No'}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        • Enjuague bucal: {patient.mouthwash ? 'Sí' : 'No'}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        • Importancia dental: {patient.teeth_importance || 'No especificada'}
                      </Text>
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default PatientView;
