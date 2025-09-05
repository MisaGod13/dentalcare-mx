import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Grid,
  GridItem,
  Badge,
  IconButton,
  Tooltip,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  Divider,
  Flex,
  Spacer,
  Heading,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { FiEdit3, FiSave, FiEye, FiTrash2, FiPlus, FiX, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { supabase } from '../supabaseClient';

// Colores para diferentes condiciones (definidos a nivel global)
const conditionColors = {
  caries: '#FF6B6B',
  restoration: '#4ECDC4',
  extraction: '#95A5A6',
  crown: '#F39C12',
  bridge: '#7DC4A5',
  implant: '#2ECC71',
  root_canal: '#E74C3C',
  periodontal: '#E67E22',
  healthy: '#2ECC71'
};

// Mapeo de condiciones en inglés a español
const conditionTranslations = {
  caries: 'Caries',
  restoration: 'Restauración',
  extraction: 'Extracción',
  crown: 'Corona',
  bridge: 'Puente',
  implant: 'Implante',
  root_canal: 'Endodoncia',
  periodontal: 'Periodontal',
  healthy: 'Sano'
};

// Componente de diente individual
const Tooth = ({ 
  toothNumber, 
  position, 
  conditions = {}, 
  onConditionChange, 
  isEditing,
  patientId 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  
  const getToothColor = () => {
    if (conditions.healthy) return conditionColors.healthy;
    if (conditions.extraction) return conditionColors.extraction;
    if (conditions.caries) return conditionColors.caries;
    if (conditions.restoration) return conditionColors.restoration;
    if (conditions.crown) return conditionColors.crown;
    if (conditions.bridge) return conditionColors.bridge;
    if (conditions.implant) return conditionColors.implant;
    if (conditions.root_canal) return conditionColors.root_canal;
    if (conditions.periodontal) return conditionColors.periodontal;
    return bgColor;
  };

  const getToothIcon = () => {
    if (conditions.extraction) return '🦷';
    if (conditions.implant) return '🦿';
    if (conditions.crown) return '👑';
    if (conditions.bridge) return '🌉';
    return '🦷';
  };

  const handleConditionToggle = (condition) => {
    if (onConditionChange && isEditing) {
      const newConditions = { ...conditions };
      if (newConditions[condition]) {
        delete newConditions[condition];
      } else {
        // Si se selecciona "healthy", remover otras condiciones
        if (condition === 'healthy') {
          newConditions.healthy = true;
          Object.keys(newConditions).forEach(key => {
            if (key !== 'healthy') delete newConditions[key];
          });
        } else {
          // Si se selecciona otra condición, remover "healthy"
          delete newConditions.healthy;
          newConditions[condition] = true;
        }
      }
      onConditionChange(toothNumber, newConditions);
    }
  };

  const getConditionCount = () => {
    return Object.keys(conditions).filter(key => conditions[key]).length;
  };

  return (
    <Box
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      cursor={isEditing ? 'pointer' : 'default'}
    >
      <Box
        w="full"
        h="full"
        minH="40px"
        bg={getToothColor()}
        border="2px solid"
        borderColor={borderColor}
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="lg"
        fontWeight="bold"
        color="white"
        textShadow="1px 1px 2px rgba(0,0,0,0.5)"
        transition="all 0.2s"
        _hover={isEditing ? {
          transform: 'scale(1.1)',
          boxShadow: 'lg',
          zIndex: 10
        } : {}}
        onClick={() => isEditing && setShowDetails(true)}
      >
        {getToothIcon()}
        {getConditionCount() > 0 && (
          <Badge
            position="absolute"
            top="-2"
            right="-2"
            colorScheme="red"
            borderRadius="full"
            fontSize="xs"
            minW="20px"
            h="20px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {getConditionCount()}
          </Badge>
        )}
      </Box>
      
      {/* Número del diente */}
      <Text
        position="absolute"
        bottom="-20px"
        left="50%"
        transform="translateX(-50%)"
        fontSize="xs"
        color="gray.600"
        fontWeight="bold"
      >
        {toothNumber}
      </Text>

      {/* Modal de detalles del diente */}
      <Modal isOpen={showDetails} onClose={() => setShowDetails(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Diente {toothNumber} - {position === 'upper' ? 'Superior' : 'Inferior'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold" color="gray.700">
                Condiciones actuales:
              </Text>
              <Box>
                {Object.entries(conditions).map(([condition, value]) => (
                  value && (
                    <Badge key={condition} colorScheme="blue" mr={2} mb={2}>
                      {conditionTranslations[condition] || condition.replace('_', ' ')}
                    </Badge>
                  )
                ))}
                {Object.keys(conditions).filter(key => conditions[key]).length === 0 && (
                  <Text color="gray.500">Sin condiciones registradas</Text>
                )}
              </Box>
              
              {isEditing && (
                <>
                  <Divider />
                  <Text fontWeight="bold" color="gray.700">
                    Seleccionar condiciones:
                  </Text>
                  <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                    {Object.entries(conditionColors).map(([condition, color]) => (
                      <Button
                        key={condition}
                        size="sm"
                        variant={conditions[condition] ? 'solid' : 'outline'}
                        colorScheme={conditions[condition] ? 'blue' : 'gray'}
                        onClick={() => handleConditionToggle(condition)}
                        leftIcon={<Box w="3" h="3" bg={color} borderRadius="sm" />}
                      >
                        {conditionTranslations[condition] || condition.replace('_', ' ')}
                      </Button>
                    ))}
                  </Grid>
                </>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const Odontogram = ({ patientId, isEditing = false, onSave }) => {
  const [teethData, setTeethData] = useState({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const toast = useToast();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Dientes superiores (1-16) e inferiores (17-32)
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => i + 17);

  useEffect(() => {
    if (patientId) {
      loadOdontogram();
    }
  }, [patientId]);

  const loadOdontogram = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('odontograms')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const latest = data[0];
        setTeethData(latest.chart || {});
        setNotes(latest.notes || '');
        setLastSaved(new Date(latest.updated_at || latest.created_at));
      } else {
        // Inicializar con dientes sanos por defecto
        const defaultTeeth = {};
        [...upperTeeth, ...lowerTeeth].forEach(tooth => {
          defaultTeeth[tooth] = { healthy: true };
        });
        setTeethData(defaultTeeth);
        setNotes('');
        setLastSaved(null);
      }
    } catch (error) {
      console.error('Error loading odontogram:', error);
      toast({
        title: 'Error al cargar odontograma',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConditionChange = (toothNumber, conditions) => {
    setTeethData(prev => ({
      ...prev,
      [toothNumber]: conditions
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const odontogramData = {
        patient_id: patientId,
        chart: teethData,
        notes: notes,
        updated_at: new Date().toISOString()
      };

      // Verificar si ya existe un odontograma
      const { data: existing } = await supabase
        .from('odontograms')
        .select('id')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1);

      let result;
      if (existing && existing.length > 0) {
        // Actualizar existente
        result = await supabase
          .from('odontograms')
          .update(odontogramData)
          .eq('id', existing[0].id);
      } else {
        // Crear nuevo
        result = await supabase
          .from('odontograms')
          .insert([odontogramData]);
      }

      if (result.error) throw result.error;

      setLastSaved(new Date());
      toast({
        title: 'Odontograma guardado',
        description: 'Los cambios se han guardado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onSave) {
        onSave(odontogramData);
      }
    } catch (error) {
      console.error('Error saving odontogram:', error);
      toast({
        title: 'Error al guardar',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear el odontograma? Se perderán todos los cambios no guardados.')) {
      loadOdontogram();
    }
  };

  const downloadOdontogram = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 800;
    
    // Fondo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Título
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ODONTOGRAMA DEL PACIENTE', canvas.width / 2, 40);
    
    // Información del paciente
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Paciente ID: ${patientId}`, 50, 80);
    ctx.fillText(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 50, 100);
    
    // Dibujar dientes superiores
    ctx.fillText('ARCADA SUPERIOR', 50, 140);
    let x = 100;
    let y = 180;
    upperTeeth.forEach((tooth, index) => {
      const conditions = teethData[tooth] || {};
      const color = getToothColor(conditions);
      
      ctx.fillStyle = color;
      ctx.fillRect(x + index * 60, y, 50, 50);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(x + index * 60, y, 50, 50);
      
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(tooth.toString(), x + index * 60 + 25, y + 30);
    });
    
    // Dibujar dientes inferiores
    ctx.fillText('ARCADA INFERIOR', 50, 280);
    y = 320;
    lowerTeeth.forEach((tooth, index) => {
      const conditions = teethData[tooth] || {};
      const color = getToothColor(conditions);
      
      ctx.fillStyle = color;
      ctx.fillRect(x + index * 60, y, 50, 50);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(x + index * 60, y, 50, 50);
      
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(tooth.toString(), x + index * 60 + 25, y + 30);
    });
    
    // Leyenda
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('LEYENDA:', 50, 420);
    
    let legendY = 450;
    Object.entries(conditionColors).forEach(([condition, color]) => {
      ctx.fillStyle = color;
      ctx.fillRect(50, legendY, 20, 20);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(50, legendY, 20, 20);
      
      ctx.fillStyle = '#000000';
      ctx.font = '14px Arial';
      ctx.fillText(conditionTranslations[condition] || condition.replace('_', ' '), 80, legendY + 15);
      legendY += 30;
    });
    
    // Notas
    if (notes) {
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('NOTAS:', 50, 600);
      ctx.font = '14px Arial';
      
      const words = notes.split(' ');
      let line = '';
      let lineY = 630;
      words.forEach(word => {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > canvas.width - 100) {
          ctx.fillText(line, 50, lineY);
          line = word + ' ';
          lineY += 20;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, 50, lineY);
    }
    
    // Descargar
    const link = document.createElement('a');
    link.download = `odontograma_paciente_${patientId}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const getToothColor = (conditions) => {
    if (conditions.healthy) return conditionColors.healthy;
    if (conditions.extraction) return conditionColors.extraction;
    if (conditions.caries) return conditionColors.caries;
    if (conditions.restoration) return conditionColors.restoration;
    if (conditions.crown) return conditionColors.crown;
    if (conditions.bridge) return conditionColors.bridge;
    if (conditions.implant) return conditionColors.implant;
    if (conditions.root_canal) return conditionColors.root_canal;
    if (conditions.periodontal) return conditionColors.periodontal;
    return '#ffffff';
  };

  const getStatistics = () => {
    const stats = {
      total: upperTeeth.length + lowerTeeth.length,
      healthy: 0,
      caries: 0,
      restoration: 0,
      extraction: 0,
      crown: 0,
      bridge: 0,
      implant: 0,
      root_canal: 0,
      periodontal: 0
    };

    Object.values(teethData).forEach(conditions => {
      Object.entries(conditions).forEach(([condition, value]) => {
        if (value && stats.hasOwnProperty(condition)) {
          stats[condition]++;
        }
      });
    });

    return stats;
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Cargando odontograma...</Text>
      </Box>
    );
  }

  const stats = getStatistics();

  return (
    <Box bg={cardBg} borderRadius="xl" p={6} boxShadow="lg" border="1px solid" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex align="center" justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="blue.600">
              <span className="emoji-original">🦷</span> Odontograma del Paciente
            </Heading>
            <Text color="gray.600">
              Visualización y edición del estado dental
            </Text>
            {lastSaved && (
              <Text fontSize="sm" color="green.600">
                Última actualización: {lastSaved.toLocaleString('es-MX')}
              </Text>
            )}
          </VStack>
          
          <HStack spacing={3}>
            {isEditing && (
              <>
                <Button
                  leftIcon={<FiRefreshCw />}
                  variant="outline"
                  onClick={handleReset}
                  size="sm"
                >
                  Resetear
                </Button>
                <Button
                  leftIcon={<FiSave />}
                  colorScheme="blue"
                  onClick={handleSave}
                  isLoading={saving}
                  loadingText="Guardando..."
                  size="sm"
                >
                  Guardar Cambios
                </Button>
              </>
            )}
            <Button
              leftIcon={<FiDownload />}
              variant="outline"
              onClick={downloadOdontogram}
              size="sm"
            >
              Descargar
            </Button>
          </HStack>
        </Flex>

        {/* Estadísticas rápidas */}
        <Box bg={bgColor} p={4} borderRadius="lg">
          <Text fontWeight="bold" mb={3} color="gray.700">
            📊 Estadísticas del Odontograma
          </Text>
          <Grid templateColumns="repeat(5, 1fr)" gap={3}>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">{stats.total}</Text>
              <Text fontSize="sm" color="gray.600">Total</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.500">{stats.healthy}</Text>
              <Text fontSize="sm" color="gray.600">Sanos</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="red.500">{stats.caries}</Text>
              <Text fontSize="sm" color="gray.600">Caries</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="teal.500">{stats.restoration}</Text>
              <Text fontSize="sm" color="gray.600">Restauraciones</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="orange.500">{stats.extraction}</Text>
              <Text fontSize="sm" color="gray.600">Extracciones</Text>
            </Box>
          </Grid>
        </Box>

        {/* Odontograma Superior */}
        <Box>
          <Text fontWeight="bold" mb={3} color="gray.700" textAlign="center">
            <span className="emoji-original">🦷</span> Arcada Superior
          </Text>
          <Box
                            bg="linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)"
            p={4}
            borderRadius="xl"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '60%',
              bg: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              zIndex: 0
            }}
          >
            <Grid templateColumns="repeat(16, 1fr)" gap={1} position="relative" zIndex={1}>
              {upperTeeth.map((toothNumber) => (
                <GridItem key={toothNumber}>
                  <Tooth
                    toothNumber={toothNumber}
                    position="upper"
                    conditions={teethData[toothNumber] || {}}
                    onConditionChange={handleConditionChange}
                    isEditing={isEditing}
                    patientId={patientId}
                  />
                </GridItem>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Odontograma Inferior */}
        <Box>
          <Text fontWeight="bold" mb={3} color="gray.700" textAlign="center">
            <span className="emoji-original">🦷</span> Arcada Inferior
          </Text>
          <Box
            bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            p={4}
            borderRadius="xl"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '60%',
              bg: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              zIndex: 0
            }}
          >
            <Grid templateColumns="repeat(16, 1fr)" gap={1} position="relative" zIndex={1}>
              {lowerTeeth.map((toothNumber) => (
                <GridItem key={toothNumber}>
                  <Tooth
                    toothNumber={toothNumber}
                    position="lower"
                    conditions={teethData[toothNumber] || {}}
                    onConditionChange={handleConditionChange}
                    isEditing={isEditing}
                    patientId={patientId}
                  />
                </GridItem>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Leyenda */}
        <Box bg={bgColor} p={4} borderRadius="lg">
          <Text fontWeight="bold" mb={3} color="gray.700">
            🎨 Leyenda de Colores
          </Text>
          <Grid templateColumns="repeat(4, 1fr)" gap={3}>
            {Object.entries(conditionColors).map(([condition, color]) => (
              <HStack key={condition} spacing={2}>
                <Box w="4" h="4" bg={color} borderRadius="sm" />
                <Text fontSize="sm" color="gray.600">
                  {conditionTranslations[condition] || condition.replace('_', ' ')}
                </Text>
              </HStack>
            ))}
          </Grid>
        </Box>

        {/* Notas */}
        {isEditing && (
          <Box>
            <FormControl>
              <FormLabel fontWeight="bold" color="gray.700">
                📝 Notas del Odontograma
              </FormLabel>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar notas sobre el estado dental del paciente..."
                rows={4}
                resize="vertical"
              />
            </FormControl>
          </Box>
        )}

        {!isEditing && notes && (
          <Box bg={bgColor} p={4} borderRadius="lg">
            <Text fontWeight="bold" mb={2} color="gray.700">
              📝 Notas del Odontograma
            </Text>
            <Text color="gray.600">{notes}</Text>
          </Box>
        )}

        {/* Instrucciones */}
        {isEditing && (
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Instrucciones de Edición</AlertTitle>
              <AlertDescription>
                Haz clic en cualquier diente para editar sus condiciones. Puedes seleccionar múltiples condiciones por diente.
                Los cambios se guardan automáticamente cuando presiones "Guardar Cambios".
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default Odontogram;