import React, { useState, useEffect } from 'react';
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
  Badge,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Icon,
  useColorModeValue,
  Divider,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Tag,
  Avatar,
  AvatarBadge,
  Wrap,
  WrapItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { 
  FiUser, 
  FiCalendar, 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiHeart, 
  FiActivity, 
  FiSmile, 
  FiDroplet, 
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiEye,
  FiFileText,
  FiLock,
  FiDownload
} from 'react-icons/fi';
import { supabase } from '../supabaseClient';

const PatientHistory = ({ patientId, patientData, onEdit }) => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [odontograms, setOdontograms] = useState([]);
  const [files, setFiles] = useState([]);
  const [aiReports, setAiReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const primaryColor = useColorModeValue('blue.500', 'blue.300');

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      // Cargar historias médicas
      const { data: records } = await supabase
        .from('medical_histories')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      // Cargar odontogramas
      const { data: odontos } = await supabase
        .from('odontograms')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      // Cargar archivos
      const { data: patientFiles } = await supabase
        .from('files')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      // Cargar reportes de IA
      const { data: reports } = await supabase
        .from('ai_reports')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      setMedicalRecords(records || []);
      setOdontograms(odontos || []);
      setFiles(patientFiles || []);
      setAiReports(reports || []);
    } catch (error) {
      console.error('Error loading patient data:', error);
      toast({
        title: 'Error al cargar datos',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getHealthStatus = () => {
    const conditions = [];
    if (patientData?.diabetes) conditions.push('Diabetes');
    if (patientData?.hypertension) conditions.push('Hipertensión');
    if (patientData?.asthma) conditions.push('Asma');
    if (patientData?.allergies) conditions.push('Alergias');
    
    return conditions.length > 0 ? conditions : ['Sin condiciones especiales'];
  };

  const getDentalStatus = () => {
    const conditions = [];
    if (patientData?.bruxism) conditions.push('Bruxismo');
    if (patientData?.gum_bleeding) conditions.push('Sangrado de encías');
    if (patientData?.loose_teeth) conditions.push('Dientes flojos');
    
    return conditions.length > 0 ? conditions : ['Estado dental normal'];
  };

  const getRiskLevel = () => {
    let riskScore = 0;
    if (patientData?.diabetes) riskScore += 3;
    if (patientData?.hypertension) riskScore += 2;
    if (patientData?.smoking) riskScore += 2;
    if (patientData?.age > 60) riskScore += 1;
    
    if (riskScore >= 5) return { level: 'Alto', color: 'red', icon: FiAlertTriangle };
    if (riskScore >= 3) return { level: 'Medio', color: 'orange', icon: FiActivity };
    return { level: 'Bajo', color: 'green', icon: FiCheckCircle };
  };

  const generateClinicalHistoryPDF = async () => {
    try {
      setGeneratingPDF(true);
      
      // Crear el contenido HTML de la historia clínica
      const htmlContent = generateClinicalHistoryHTML();
      
      // Crear un blob con el contenido HTML
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Crear un enlace de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `historia_clinica_${patientData?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar la URL
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Historia clínica generada',
        description: 'El archivo se ha descargado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error al generar historia clínica',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const generateClinicalHistoryHTML = () => {
    const currentDate = new Date().toLocaleDateString('es-MX');
    const currentTime = new Date().toLocaleTimeString('es-MX');
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historia Clínica - ${patientData?.name || 'Paciente'}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2c5aa0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .clinic-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .patient-info {
            background-color: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .section-title {
            background-color: #2c5aa0;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            color: #2c5aa0;
        }
        .medical-alert {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .dental-chart {
            border: 2px solid #333;
            padding: 20px;
            margin: 20px 0;
            background-color: #f8f9fa;
        }
        .tooth-grid {
            display: grid;
            grid-template-columns: repeat(16, 1fr);
            gap: 5px;
            margin: 20px 0;
        }
        .tooth {
            width: 30px;
            height: 30px;
            border: 1px solid #333;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            background-color: #fff;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            border-top: 1px solid #ccc;
            padding-top: 20px;
            font-size: 12px;
            color: #666;
        }
        @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>HISTORIA CLÍNICA DENTAL</h1>
        <h2>DENTAL CARE MEXICO</h2>
        <p>Fecha de generación: ${currentDate} - ${currentTime}</p>
    </div>

    <div class="clinic-info">
        <h3>Información de la Clínica</h3>
        <p><strong>Nombre:</strong> Dental Care Mexico</p>
        <p><strong>Dirección:</strong> [Dirección de la clínica]</p>
        <p><strong>Teléfono:</strong> [Teléfono de la clínica]</p>
        <p><strong>Responsable:</strong> [Nombre del dentista responsable]</p>
    </div>

    <div class="patient-info">
        <h3>Datos del Paciente</h3>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Nombre completo:</span> ${patientData?.name || 'No especificado'}
            </div>
            <div class="info-item">
                <span class="info-label">Edad:</span> ${patientData?.age || 'No especificado'} años
            </div>
            <div class="info-item">
                <span class="info-label">Fecha de nacimiento:</span> ${patientData?.birth_date || 'No especificada'}
            </div>
            <div class="info-item">
                <span class="info-label">Género:</span> ${patientData?.gender || 'No especificado'}
            </div>
            <div class="info-item">
                <span class="info-label">Dirección:</span> ${patientData?.address || 'No especificada'}
            </div>
            <div class="info-item">
                <span class="info-label">Teléfono:</span> ${patientData?.mobile || patientData?.phone || 'No especificado'}
            </div>
            <div class="info-item">
                <span class="info-label">Email:</span> ${patientData?.email || 'No especificado'}
            </div>
            <div class="info-item">
                <span class="info-label">Ocupación:</span> ${patientData?.occupation || 'No especificada'}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">1. ANTECEDENTES MÉDICOS</div>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Tratamiento médico actual:</span> ${patientData?.current_treatment ? 'Sí' : 'No'}
            </div>
            <div class="info-item">
                <span class="info-label">Detalles del tratamiento:</span> ${patientData?.current_treatment_details || 'No aplica'}
            </div>
            <div class="info-item">
                <span class="info-label">Alergias:</span> ${patientData?.allergies ? 'Sí' : 'No'}
            </div>
            <div class="info-item">
                <span class="info-label">Detalles de alergias:</span> ${patientData?.allergy_details || 'No aplica'}
            </div>
        </div>
        
        <h4>Condiciones Médicas Específicas:</h4>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Diabetes:</span> ${patientData?.diabetes ? 'Sí' : 'No'}
                ${patientData?.diabetes_date ? ` (desde ${patientData.diabetes_date})` : ''}
            </div>
            <div class="info-item">
                <span class="info-label">Hipertensión:</span> ${patientData?.high_blood_pressure ? 'Sí' : 'No'}
                ${patientData?.high_blood_pressure_date ? ` (desde ${patientData.high_blood_pressure_date})` : ''}
            </div>
            <div class="info-item">
                <span class="info-label">Asma:</span> ${patientData?.asthma ? 'Sí' : 'No'}
                ${patientData?.asthma_date ? ` (desde ${patientData.asthma_date})` : ''}
            </div>
            <div class="info-item">
                <span class="info-label">Fiebre reumática:</span> ${patientData?.rheumatic_fever ? 'Sí' : 'No'}
                ${patientData?.rheumatic_fever_date ? ` (desde ${patientData.rheumatic_fever_date})` : ''}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">2. ANTECEDENTES DENTALES</div>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Bruxismo:</span> ${patientData?.bruxism ? 'Sí' : 'No'}
            </div>
            <div class="info-item">
                <span class="info-label">Sangrado de encías:</span> ${patientData?.gum_bleeding || 'No'}
            </div>
            <div class="info-item">
                <span class="info-label">Dientes flojos:</span> ${patientData?.loose_teeth ? 'Sí' : 'No'}
            </div>
            <div class="info-item">
                <span class="info-label">Dificultad para masticar:</span> ${patientData?.chewing_difficulty ? 'Sí' : 'No'}
            </div>
        </div>
        
        <h4>Hábitos de Higiene:</h4>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Cepillados por día:</span> ${patientData?.brushings_per_day || 'No especificado'}
            </div>
            <div class="info-item">
                <span class="info-label">Uso de hilo dental:</span> ${patientData?.floss ? 'Sí' : 'No'}
            </div>
            <div class="info-item">
                <span class="info-label">Uso de enjuague bucal:</span> ${patientData?.mouthwash ? 'Sí' : 'No'}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">3. HÁBITOS Y ESTILO DE VIDA</div>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Tabaquismo:</span> ${patientData?.smoking ? 'Sí' : 'No'}
                ${patientData?.cigarettes_per_day ? ` (${patientData.cigarettes_per_day} cigarrillos/día)` : ''}
            </div>
            <div class="info-item">
                <span class="info-label">Consumo de alcohol:</span> ${patientData?.alcohol ? 'Sí' : 'No'}
                ${patientData?.alcohol_frequency ? ` (${patientData.alcohol_frequency})` : ''}
            </div>
            <div class="info-item">
                <span class="info-label">Actividad física:</span> ${patientData?.physical_activity ? 'Sí' : 'No'}
                ${patientData?.physical_activity_type ? ` (${patientData.physical_activity_type})` : ''}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">4. ODONTOGRAMA ACTUAL</div>
        ${generateOdontogramHTML()}
    </div>

    <div class="section">
        <div class="section-title">5. HISTORIAL DE VISITAS</div>
        ${medicalRecords.length > 0 ? 
          medicalRecords.map(record => `
            <div class="medical-alert">
              <strong>Fecha:</strong> ${formatDate(record.created_at)}<br>
              <strong>Observaciones:</strong> ${record.data ? JSON.stringify(record.data) : 'Sin observaciones'}
            </div>
          `).join('') : 
          '<p>No hay historial de visitas registrado</p>'
        }
    </div>

    <div class="section">
        <div class="section-title">6. PLAN DE TRATAMIENTO</div>
        <p><strong>Diagnóstico:</strong> [Diagnóstico del dentista]</p>
        <p><strong>Tratamiento recomendado:</strong> [Tratamiento recomendado]</p>
        <p><strong>Próxima cita:</strong> [Fecha de próxima cita]</p>
        <p><strong>Observaciones adicionales:</strong> [Observaciones del dentista]</p>
    </div>

    <div class="footer">
        <p>Este documento cumple con las normas mexicanas para historias clínicas dentales</p>
        <p>Generado el ${currentDate} a las ${currentTime}</p>
        <p>Firma del dentista: _________________________</p>
        <p>Firma del paciente: _________________________</p>
    </div>
</body>
</html>
    `;
  };

  const generateOdontogramHTML = () => {
    if (odontograms.length === 0) {
      return '<p>No hay odontograma registrado</p>';
    }

    const latestOdontogram = odontograms[0];
    const chart = latestOdontogram.chart || {};
    
    const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
    const lowerTeeth = Array.from({ length: 16 }, (_, i) => i + 17);

    let html = `
      <div class="dental-chart">
        <h4>Estado Dental Actual</h4>
        <p><strong>Fecha del odontograma:</strong> ${formatDate(latestOdontogram.created_at)}</p>
        
        <h5>Arcada Superior:</h5>
        <div class="tooth-grid">
    `;
    
    upperTeeth.forEach(tooth => {
      const conditions = chart[tooth] || {};
      const conditionNames = Object.keys(conditions).filter(key => conditions[key]);
      const conditionText = conditionNames.length > 0 ? conditionNames.join(', ') : 'Sano';
      
      html += `<div class="tooth" title="Diente ${tooth}: ${conditionText}">${tooth}</div>`;
    });
    
    html += `
        </div>
        
        <h5>Arcada Inferior:</h5>
        <div class="tooth-grid">
    `;
    
    lowerTeeth.forEach(tooth => {
      const conditions = chart[tooth] || {};
      const conditionNames = Object.keys(conditions).filter(key => conditions[key]);
      const conditionText = conditionNames.length > 0 ? conditionNames.join(', ') : 'Sano';
      
      html += `<div class="tooth" title="Diente ${tooth}: ${conditionText}">${tooth}</div>`;
    });
    
    html += `
        </div>
        
        ${latestOdontogram.notes ? `<p><strong>Notas:</strong> ${latestOdontogram.notes}</p>` : ''}
      </div>
    `;
    
    return html;
  };

  const riskLevel = getRiskLevel();

  return (
    <Box bg={cardBg} borderRadius="xl" p={6} boxShadow="lg" border="1px solid" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        {/* Header con información del paciente */}
                        <Card bg="linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)" color="white">
          <CardBody>
            <Flex align="center" justify="space-between">
              <HStack spacing={4}>
                <Avatar size="lg" bg="rgba(255,255,255,0.2)">
                  <AvatarBadge boxSize="1em" bg="green.400" />
                </Avatar>
                <VStack align="start" spacing={1}>
                  <Heading size="lg">{patientData?.name || 'Paciente'}</Heading>
                  <Text fontSize="sm" opacity={0.9}>
                    ID: {patientId} • Edad: {patientData?.age || 'N/A'} años
                  </Text>
                </VStack>
              </HStack>
              
              <VStack align="end" spacing={2}>
                <Badge colorScheme={riskLevel.color} variant="solid" p={2}>
                  <HStack spacing={1}>
                    <Icon as={riskLevel.icon} />
                    <Text>Riesgo {riskLevel.level}</Text>
                  </HStack>
                </Badge>
                <HStack spacing={2}>
                  <Button
                    leftIcon={<FiEdit3 />}
                    variant="outline"
                    color="white"
                    _hover={{ bg: 'rgba(255,255,255,0.1)' }}
                    onClick={() => onEdit && onEdit()}
                    size="sm"
                  >
                    Editar Paciente
                  </Button>
                  <Button
                    leftIcon={<FiDownload />}
                    variant="outline"
                    color="white"
                    _hover={{ bg: 'rgba(255,255,255,0.1)' }}
                    onClick={generateClinicalHistoryPDF}
                    isLoading={generatingPDF}
                    loadingText="Generando..."
                    size="sm"
                  >
                    Descargar Historia Clínica
                  </Button>
                </HStack>
              </VStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Estadísticas rápidas */}
        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          <Stat>
            <StatLabel color="gray.600">Visitas</StatLabel>
            <StatNumber color={primaryColor}>{medicalRecords.length}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              Historial médico
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel color="gray.600">Odontogramas</StatLabel>
            <StatNumber color={primaryColor}>{odontograms.length}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              Evaluaciones dentales
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel color="gray.600">Archivos</StatLabel>
            <StatNumber color={primaryColor}>{files.length}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              Documentos
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel color="gray.600">Reportes IA</StatLabel>
            <StatNumber color={primaryColor}>{aiReports.length}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              Análisis inteligente
            </StatHelpText>
          </Stat>
        </Grid>

        {/* Tabs principales */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiUser} />
                <Text>Información General</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiHeart} />
                <Text>Salud General</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiSmile} />
                <Text>Salud Dental</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiFileText} />
                <Text>Historial Médico</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiActivity} />
                <Text>Odontogramas</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiLock} />
                <Text>Archivos & Reportes</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Información General */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md" color="blue.600">
                      📋 Datos Personales
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <HStack>
                        <Icon as={FiUser} color="blue.500" />
                        <Text><strong>Nombre:</strong> {patientData?.name}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiCalendar} color="blue.500" />
                        <Text><strong>Edad:</strong> {patientData?.age} años</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiMapPin} color="blue.500" />
                        <Text><strong>Dirección:</strong> {patientData?.address}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiPhone} color="blue.500" />
                        <Text><strong>Teléfono:</strong> {patientData?.mobile || patientData?.phone}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiMail} color="blue.500" />
                        <Text><strong>Email:</strong> {patientData?.email}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiActivity} color="blue.500" />
                        <Text><strong>Ocupación:</strong> {patientData?.occupation}</Text>
                      </HStack>
                    </Grid>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Salud General */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md" color="green.600">
                      🏥 Estado de Salud General
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontWeight="bold" mb={2}>Condiciones Médicas:</Text>
                        <Wrap spacing={2}>
                          {getHealthStatus().map((condition, index) => (
                            <WrapItem key={index}>
                              <Tag colorScheme="blue" size="md">
                                {condition}
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="bold" mb={2}>Nivel de Riesgo:</Text>
                        <Progress 
                          value={riskLevel.level === 'Alto' ? 80 : riskLevel.level === 'Medio' ? 50 : 20} 
                          colorScheme={riskLevel.color} 
                          size="lg" 
                          borderRadius="md"
                        />
                        <Text fontSize="sm" color="gray.600" mt={1}>
                          {riskLevel.level} - Requiere seguimiento {riskLevel.level === 'Alto' ? 'frecuente' : 'regular'}
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Salud Dental */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md" color="purple.600">
                      🦷 Estado de Salud Dental
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontWeight="bold" mb={2}>Condiciones Dentales:</Text>
                        <Wrap spacing={2}>
                          {getDentalStatus().map((condition, index) => (
                            <WrapItem key={index}>
                              <Tag 
                  bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                  color='white'
                  size="md"
                >
                                {condition}
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="bold" mb={2}>Hábitos de Higiene:</Text>
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          <HStack>
                            <Icon as={FiDroplet} color="blue.500" />
                            <Text>Cepillados por día: {patientData?.brushings_per_day || 'N/A'}</Text>
                          </HStack>
                          <HStack>
                            <Icon as={FiCheckCircle} color="green.500" />
                            <Text>Hilo dental: {patientData?.floss ? 'Sí' : 'No'}</Text>
                          </HStack>
                          <HStack>
                            <Icon as={FiCheckCircle} color="green.500" />
                            <Text>Enjuague bucal: {patientData?.mouthwash ? 'Sí' : 'No'}</Text>
                          </HStack>
                          <HStack>
                            <Icon as={FiActivity} color="orange.500" />
                            <Text>Actividad física: {patientData?.physical_activity ? 'Sí' : 'No'}</Text>
                          </HStack>
                        </Grid>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Historial Médico */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {medicalRecords.length > 0 ? (
                  <Accordion allowMultiple>
                    {medicalRecords.map((record, index) => (
                      <AccordionItem key={record.id}>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <HStack spacing={3}>
                              <Icon as={FiClock} color="blue.500" />
                              <Text fontWeight="bold">
                                Visita del {formatDate(record.created_at)}
                              </Text>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <Text whiteSpace="pre-wrap">{JSON.stringify(record.data, null, 2)}</Text>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <Card>
                    <CardBody textAlign="center" py={10}>
                      <Icon as={FiFileText} w={10} h={10} color="gray.400" mb={4} />
                      <Text color="gray.500">No hay historial médico registrado</Text>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </TabPanel>

            {/* Odontogramas */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {odontograms.length > 0 ? (
                  <Accordion allowMultiple>
                    {odontograms.map((odontogram, index) => (
                      <AccordionItem key={odontogram.id}>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <HStack spacing={3}>
                              <Icon as={FiActivity} color="purple.500" />
                              <Text fontWeight="bold">
                                Odontograma del {formatDate(odontogram.created_at)}
                              </Text>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <VStack spacing={3} align="stretch">
                            <Text fontWeight="bold">Estado de los dientes:</Text>
                            <Wrap spacing={2}>
                              {Object.entries(odontogram.chart || {}).map(([tooth, conditions]) => (
                                <WrapItem key={tooth}>
                                  <Tag colorScheme="blue" size="sm">
                                    Diente {tooth}: {Object.keys(conditions).join(', ')}
                                  </Tag>
                                </WrapItem>
                              ))}
                            </Wrap>
                            {odontogram.notes && (
                              <>
                                <Text fontWeight="bold">Notas:</Text>
                                <Text>{odontogram.notes}</Text>
                              </>
                            )}
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <Card>
                    <CardBody textAlign="center" py={10}>
                      <Icon as={FiActivity} w={10} h={10} color="gray.400" mb={4} />
                      <Text color="gray.500">No hay odontogramas registrados</Text>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </TabPanel>

            {/* Archivos y Reportes */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md" color="teal.600">
                      📁 Archivos del Paciente
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    {files.length > 0 ? (
                      <List spacing={3}>
                        {files.map((file) => (
                          <ListItem key={file.id}>
                            <HStack spacing={3}>
                              <Icon as={FiFileText} color="teal.500" />
                              <Text>{file.file_name}</Text>
                              <Badge colorScheme="blue">{file.file_type}</Badge>
                              <Text fontSize="sm" color="gray.500">
                                {formatDate(file.created_at)}
                              </Text>
                            </HStack>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Text color="gray.500" textAlign="center">No hay archivos adjuntos</Text>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="md" color="orange.600">
                      🤖 Reportes de Inteligencia Artificial
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    {aiReports.length > 0 ? (
                      <Accordion allowMultiple>
                        {aiReports.map((report) => (
                          <AccordionItem key={report.id}>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <HStack spacing={3}>
                                  <Icon as={FiFileText} color="orange.500" />
                                  <Text fontWeight="bold">
                                    Reporte del {formatDate(report.created_at)}
                                  </Text>
                                  <Badge colorScheme="orange">{report.model}</Badge>
                                </HStack>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel pb={4}>
                              <Text whiteSpace="pre-wrap">{report.content}</Text>
                            </AccordionPanel>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <Text color="gray.500" textAlign="center">No hay reportes de IA</Text>
                    )}
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default PatientHistory;
