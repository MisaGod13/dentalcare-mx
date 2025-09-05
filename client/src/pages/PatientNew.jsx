import React, { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { supabase } from '../supabaseClient'
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
  Select,
  Textarea,
  Checkbox,
  Radio,
  RadioGroup,
  Grid,
  GridItem,
  Icon,
  useDisclosure,
  Progress,
  Flex,
  IconButton,
  Badge,
  CardHeader,
  SimpleGrid
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import {
  FiUser,
  FiHeart,
  FiSmile,
  FiHome,
  FiUsers,
  FiEdit3,
  FiChevronLeft,
  FiChevronRight,
  FiSave,
  FiCheck,
  FiActivity,
  FiFileText
} from 'react-icons/fi'

// Animaciones
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-20px);
  }
`

// Componentes movidos FUERA del componente principal para evitar pérdida de foco

// Componente de indicadores de pasos
const StepIndicator = ({ currentStep, steps, progress, goToStep }) => (
  <Box>
    {/* Barra de progreso */}
    <Box 
      w="full" 
      h={2} 
      bg="gray.200" 
      borderRadius="full" 
      overflow="hidden"
      mb={6}
    >
      <Box
        h="full"
        bg="linear-gradient(90deg, #00B4D8 0%, #7DC4A5 100%)"
        borderRadius="full"
        transition="width 0.3s ease"
        width={`${progress}%`}
      />
    </Box>
    
    {/* Indicadores de pasos */}
    <HStack justify="space-between" spacing={4}>
      {steps.map((step, index) => (
        <VStack 
          key={step.id} 
          spacing={2} 
          align="center"
          cursor="pointer"
          onClick={() => goToStep(index)}
          opacity={index <= currentStep ? 1 : 0.5}
          transition="all 0.3s ease"
        >
          <Box
            w={12}
            h={12}
            borderRadius="full"
            bg={index <= currentStep ? "brand.500" : "gray.300"}
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            transition="all 0.3s ease"
            _hover={{
              transform: "scale(1.1)",
              boxShadow: "lg"
            }}
          >
            <Icon 
              as={step.icon} 
              boxSize={6} 
              display="block" 
              m="auto"
            />
          </Box>
          <Text 
            fontSize="sm" 
            fontWeight="medium" 
            textAlign="center"
            color={index <= currentStep ? "gray.700" : "gray.500"}
          >
            {step.title}
          </Text>
        </VStack>
      ))}
    </HStack>
  </Box>
)

// Componente de navegación entre pasos
const StepNavigation = ({ currentStep, steps, prevStep, nextStep, canProceed, handleSubmit, isLoading }) => (
  <HStack justify="space-between" pt={6}>
    <Button
      leftIcon={<FiChevronLeft />}
      variant="outline"
      onClick={prevStep}
      isDisabled={currentStep === 0}
      _hover={{
        bg: "gray.50",
        borderColor: "brand.500"
      }}
    >
      Anterior
    </Button>
    
    <HStack spacing={4}>
      <Text fontSize="sm" color="gray.600">
        Paso {currentStep + 1} de {steps.length}
      </Text>
      
      {currentStep < steps.length - 1 ? (
        <Button
          rightIcon={<FiChevronRight />}
          colorScheme="brand"
          onClick={nextStep}
          isDisabled={!canProceed()}
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "lg"
          }}
        >
          Siguiente
        </Button>
      ) : (
        <Button
          leftIcon={<FiSave />}
          colorScheme="green"
          onClick={handleSubmit}
          isLoading={isLoading}
          loadingText="Guardando..."
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "lg"
          }}
        >
          Guardar Paciente
        </Button>
      )}
    </HStack>
  </HStack>
)

// Componente de contenido del paso actual
const StepContent = ({ currentStep, formData, handleInputChange }) => {
  switch (currentStep) {
    case 0: // Datos Personales
      return (
        <Card>
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={FiUser} color="brand.500" boxSize={6} />
              <VStack align="start" spacing={1}>
                <Heading size="md" color="gray.700">
                  Datos Personales
                </Heading>
                <Text color="gray.600">
                  Información básica del paciente
                </Text>
              </VStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Nombre completo *</FormLabel>
                  <Input
                    placeholder="Nombre y apellidos"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.400" }}
                    _focus={{ borderColor: "brand.500", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Edad</FormLabel>
                  <Input
                    type="number"
                    placeholder="Edad en años"
                    value={formData.age || ''}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.400" }}
                    _focus={{ borderColor: "brand.500", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Fecha de nacimiento</FormLabel>
                  <Input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.400" }}
                    _focus={{ borderColor: "brand.500", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Ocupación</FormLabel>
                  <Input
                    placeholder="Profesión o trabajo"
                    value={formData.occupation || ''}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.400" }}
                    _focus={{ borderColor: "brand.500", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Estado civil</FormLabel>
                  <Select
                    placeholder="Seleccionar estado civil"
                    value={formData.maritalStatus || ''}
                    onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.400" }}
                    _focus={{ borderColor: "brand.500", boxShadow: "outline" }}
                  >
                    <option value="soltero">Soltero/a</option>
                    <option value="casado">Casado/a</option>
                    <option value="divorciado">Divorciado/a</option>
                    <option value="viudo">Viudo/a</option>
                    <option value="union_libre">Unión libre</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Teléfono fijo</FormLabel>
                  <Input
                    placeholder="Teléfono de casa"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.400" }}
                    _focus={{ borderColor: "brand.500", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Teléfono celular</FormLabel>
                  <Input
                    placeholder="Número de celular"
                    value={formData.mobile || ''}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.400" }}
                    _focus={{ borderColor: "brand.500", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="Correo electrónico"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.400" }}
                    _focus={{ borderColor: "brand.500", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Recomendado por</FormLabel>
                  <Input
                    placeholder="Quién lo recomendó"
                    value={formData.referredBy || ''}
                    onChange={(e) => handleInputChange('referredBy', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.400" }}
                    _focus={{ borderColor: "brand.500", boxShadow: "outline" }}
                  />
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel>Dirección completa</FormLabel>
                <Input
                  placeholder="Calle, número, colonia"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  borderColor="gray.300"
                  _hover={{ borderColor: "brand.400" }}
                  _focus={{ borderColor: "brand.500", boxShadow: "outline" }}
                />
              </FormControl>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Colonia</FormLabel>
                  <Input
                    placeholder="Colonia o fraccionamiento"
                    value={formData.neighborhood || ''}
                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.400" }}
                    _focus={{ borderColor: "brand.500", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Código Postal</FormLabel>
                  <Input
                    placeholder="C.P."
                    value={formData.zipCode || ''}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.400" }}
                    _focus={{ borderColor: "brand.500", boxShadow: "outline" }}
                  />
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel>Motivo de la consulta</FormLabel>
                <Textarea
                  placeholder="Describa el motivo de su visita"
                  value={formData.consultationReason || ''}
                  onChange={(e) => handleInputChange('consultationReason', e.target.value)}
                  rows={3}
                  borderColor="gray.300"
                  _hover={{ borderColor: "brand.400" }}
                  _focus={{ borderColor: "brand.500", boxShadow: "outline" }}
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      )

    case 1: // Salud General
      return (
        <Card>
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={FiHeart} color="brand.500" boxSize={6} />
              <VStack align="start" spacing={1}>
                <Heading size="md" color="gray.700">
                  Salud General
                </Heading>
                <Text color="gray.600">
                  Historia médica y tratamientos actuales
                </Text>
              </VStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6}>
              {/* Tratamiento médico actual */}
              <FormControl>
                <FormLabel>¿Está recibiendo tratamiento médico actual?</FormLabel>
                <RadioGroup value={formData.currentTreatment ? 'si' : 'no'} onChange={(value) => handleInputChange('currentTreatment', value === 'si')}>
                  <HStack spacing={6}>
                    <Radio value="si">Sí</Radio>
                    <Radio value="no">No</Radio>
                  </HStack>
                </RadioGroup>
                {formData.currentTreatment && (
                  <FormControl mt={3}>
                    <FormLabel>Detalles del tratamiento</FormLabel>
                    <Textarea
                      placeholder="Describa el tratamiento y por qué lo está recibiendo"
                      value={formData.currentTreatmentDetails || ''}
                      onChange={(e) => handleInputChange('currentTreatmentDetails', e.target.value)}
                      rows={3}
                    />
                  </FormControl>
                )}
              </FormControl>

              {/* Síntomas gripales */}
              <FormControl>
                <FormLabel>¿Síntomas gripales en el último mes?</FormLabel>
                <RadioGroup value={formData.fluSymptoms ? 'si' : 'no'} onChange={(value) => handleInputChange('fluSymptoms', value === 'si')}>
                  <HStack spacing={6}>
                    <Radio value="si">Sí</Radio>
                    <Radio value="no">No</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              {/* Alergias */}
              <FormControl>
                <FormLabel>¿Alergia a medicamentos, alimentos o anestésicos?</FormLabel>
                <RadioGroup value={formData.allergies ? 'si' : 'no'} onChange={(value) => handleInputChange('allergies', value === 'si')}>
                  <HStack spacing={6}>
                    <Radio value="si">Sí</Radio>
                    <Radio value="no">No</Radio>
                  </HStack>
                </RadioGroup>
                {formData.allergies && (
                  <FormControl mt={3}>
                    <FormLabel>Detalles de la alergia</FormLabel>
                    <Input
                      placeholder="¿A qué es alérgico?"
                      value={formData.allergyDetails || ''}
                      onChange={(e) => handleInputChange('allergyDetails', e.target.value)}
                    />
                  </FormControl>
                )}
              </FormControl>

              {/* Antecedentes médicos */}
              <VStack align="start" spacing={4} w="full">
                <Text fontWeight="semibold" color="gray.700">Antecedentes médicos:</Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Fiebre reumática</FormLabel>
                    <RadioGroup value={formData.rheumaticFever ? 'si' : 'no'} onChange={(value) => handleInputChange('rheumaticFever', value === 'si')}>
                      <HStack spacing={4}>
                        <Radio value="si">Sí</Radio>
                        <Radio value="no">No</Radio>
                      </HStack>
                    </RadioGroup>
                    {formData.rheumaticFever && (
                      <Input
                        mt={2}
                        placeholder="¿Desde cuándo?"
                        value={formData.rheumaticFeverDate || ''}
                        onChange={(e) => handleInputChange('rheumaticFeverDate', e.target.value)}
                      />
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Presión arterial alta</FormLabel>
                    <RadioGroup value={formData.highBloodPressure ? 'si' : 'no'} onChange={(value) => handleInputChange('highBloodPressure', value === 'si')}>
                      <HStack spacing={4}>
                        <Radio value="si">Sí</Radio>
                        <Radio value="no">No</Radio>
                      </HStack>
                    </RadioGroup>
                    {formData.highBloodPressure && (
                      <Input
                        mt={2}
                        placeholder="¿Desde cuándo?"
                        value={formData.highBloodPressureDate || ''}
                        onChange={(e) => handleInputChange('highBloodPressureDate', e.target.value)}
                      />
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Diabetes</FormLabel>
                    <RadioGroup value={formData.diabetes ? 'si' : 'no'} onChange={(value) => handleInputChange('diabetes', value === 'si')}>
                      <HStack spacing={4}>
                        <Radio value="si">Sí</Radio>
                        <Radio value="no">No</Radio>
                      </HStack>
                    </RadioGroup>
                    {formData.diabetes && (
                      <Input
                        mt={2}
                        placeholder="¿Desde cuándo?"
                        value={formData.diabetesDate || ''}
                        onChange={(e) => handleInputChange('diabetesDate', e.target.value)}
                      />
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Asma</FormLabel>
                    <RadioGroup value={formData.asthma ? 'si' : 'no'} onChange={(value) => handleInputChange('asthma', value === 'si')}>
                      <HStack spacing={4}>
                        <Radio value="si">Sí</Radio>
                        <Radio value="no">No</Radio>
                      </HStack>
                    </RadioGroup>
                    {formData.asthma && (
                      <Input
                        mt={2}
                        placeholder="¿Desde cuándo?"
                        value={formData.asthmaDate || ''}
                        onChange={(e) => handleInputChange('asthmaDate', e.target.value)}
                      />
                    )}
                  </FormControl>
                </SimpleGrid>
              </VStack>

              {/* Hábitos */}
              <VStack align="start" spacing={4} w="full">
                <Text fontWeight="semibold" color="gray.700">Hábitos:</Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Tabaquismo</FormLabel>
                    <RadioGroup value={formData.smoking ? 'si' : 'no'} onChange={(value) => handleInputChange('smoking', value === 'si')}>
                      <HStack spacing={4}>
                        <Radio value="si">Sí</Radio>
                        <Radio value="no">No</Radio>
                      </HStack>
                    </RadioGroup>
                    {formData.smoking && (
                      <Input
                        mt={2}
                        placeholder="¿Cuántos cigarrillos por día?"
                        value={formData.cigarettesPerDay || ''}
                        onChange={(e) => handleInputChange('cigarettesPerDay', e.target.value)}
                      />
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Consumo de alcohol</FormLabel>
                    <RadioGroup value={formData.alcohol ? 'si' : 'no'} onChange={(value) => handleInputChange('alcohol', value === 'si')}>
                      <HStack spacing={4}>
                        <Radio value="si">Sí</Radio>
                        <Radio value="no">No</Radio>
                      </HStack>
                    </RadioGroup>
                    {formData.alcohol && (
                      <Input
                        mt={2}
                        placeholder="Frecuencia"
                        value={formData.alcoholFrequency || ''}
                        onChange={(e) => handleInputChange('alcoholFrequency', e.target.value)}
                      />
                    )}
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      )

    case 2: // Salud de la Mujer
      return (
        <Card>
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={FiHeart} color="brand.500" boxSize={6} />
              <VStack align="start" spacing={1}>
                <Heading size="md" color="gray.700">
                  Salud de la Mujer
                </Heading>
                <Text color="gray.600">
                  Información específica para pacientes femeninas
                </Text>
              </VStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Fecha del último período menstrual</FormLabel>
                <Input
                  type="date"
                  value={formData.lastPeriod || ''}
                  onChange={(e) => handleInputChange('lastPeriod', e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>¿Complicaciones menstruales?</FormLabel>
                <RadioGroup value={formData.menstrualComplications ? 'si' : 'no'} onChange={(value) => handleInputChange('menstrualComplications', value === 'si')}>
                  <HStack spacing={6}>
                    <Radio value="si">Sí</Radio>
                    <Radio value="no">No</Radio>
                  </HStack>
                </RadioGroup>
                {formData.menstrualComplications && (
                  <Input
                    mt={2}
                    placeholder="¿Cuáles?"
                    value={formData.menstrualComplicationsDetails || ''}
                    onChange={(e) => handleInputChange('menstrualComplicationsDetails', e.target.value)}
                  />
                )}
              </FormControl>

              <FormControl>
                <FormLabel>¿Uso de pastillas anticonceptivas?</FormLabel>
                <RadioGroup value={formData.birthControl ? 'si' : 'no'} onChange={(value) => handleInputChange('birthControl', value === 'si')}>
                  <HStack spacing={6}>
                    <Radio value="si">Sí</Radio>
                    <Radio value="no">No</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              <FormControl>
                <FormLabel>¿Probabilidad de embarazo actual?</FormLabel>
                <RadioGroup value={formData.pregnancy ? 'si' : 'no'} onChange={(value) => handleInputChange('pregnancy', value === 'si')}>
                  <HStack spacing={6}>
                    <Radio value="si">Sí</Radio>
                    <Radio value="no">No</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Número de abortos</FormLabel>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.abortions || ''}
                  onChange={(e) => handleInputChange('abortions', e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>¿Lacta actualmente?</FormLabel>
                <RadioGroup value={formData.breastfeeding ? 'si' : 'no'} onChange={(value) => handleInputChange('breastfeeding', value === 'si')}>
                  <HStack spacing={6}>
                    <Radio value="si">Sí</Radio>
                    <Radio value="no">No</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      )

    case 3: // Salud Dental
      return (
        <Card>
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={FiSmile} color="brand.500" boxSize={6} />
              <VStack align="start" spacing={1}>
                <Heading size="md" color="gray.700">
                  Salud Dental
                </Heading>
                <Text color="gray.600">
                  Problemas bucales y hábitos dentales
                </Text>
              </VStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>¿Aprieta o rechina los dientes (bruxismo)?</FormLabel>
                  <RadioGroup value={formData.bruxism ? 'si' : 'no'} onChange={(value) => handleInputChange('bruxism', value === 'si')}>
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>¿Está inconforme con la apariencia de sus dientes?</FormLabel>
                  <RadioGroup value={formData.teethAppearance ? 'si' : 'no'} onChange={(value) => handleInputChange('teethAppearance', value === 'si')}>
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>¿Siente mal aliento?</FormLabel>
                  <RadioGroup value={formData.badBreath ? 'si' : 'no'} onChange={(value) => handleInputChange('badBreath', value === 'si')}>
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>¿Dificultad para masticar?</FormLabel>
                  <RadioGroup value={formData.chewingDifficulty ? 'si' : 'no'} onChange={(value) => handleInputChange('chewingDifficulty', value === 'si')}>
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>¿Reacción a anestésicos?</FormLabel>
                  <RadioGroup value={formData.anesthesiaReaction ? 'si' : 'no'} onChange={(value) => handleInputChange('anesthesiaReaction', value === 'si')}>
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                  {formData.anesthesiaReaction && (
                    <Input
                      mt={2}
                      placeholder="¿Cuál?"
                      value={formData.anesthesiaReactionDetails || ''}
                      onChange={(e) => handleInputChange('anesthesiaReactionDetails', e.target.value)}
                    />
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>¿Dolor de dientes reciente?</FormLabel>
                  <RadioGroup value={formData.recentPain ? 'si' : 'no'} onChange={(value) => handleInputChange('recentPain', value === 'si')}>
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>Sangrado de encías</FormLabel>
                  <Select
                    placeholder="Seleccionar"
                    value={formData.gumBleeding || ''}
                    onChange={(e) => handleInputChange('gumBleeding', e.target.value)}
                  >
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                    <option value="a_veces">A veces</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>¿Chasquea o se desvía la mandíbula?</FormLabel>
                  <Select
                    placeholder="Seleccionar"
                    value={formData.jawClicking || ''}
                    onChange={(e) => handleInputChange('jawClicking', e.target.value)}
                  >
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                    <option value="a_veces">A veces</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>¿Cómo se siente en el dentista?</FormLabel>
                <Select
                  placeholder="Seleccionar"
                  value={formData.dentistComfort || ''}
                  onChange={(e) => handleInputChange('dentistComfort', e.target.value)}
                >
                  <option value="incomodo">Incómodo</option>
                  <option value="indiferente">Indiferente</option>
                  <option value="comodo">Cómodo</option>
                  <option value="otro">Otro</option>
                </Select>
                {formData.dentistComfort === 'otro' && (
                  <Input
                    mt={2}
                    placeholder="Especifique"
                    value={formData.dentistComfortOther || ''}
                    onChange={(e) => handleInputChange('dentistComfortOther', e.target.value)}
                  />
                )}
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      )

    case 4: // Estilo de Vida
      return (
        <Card>
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={FiActivity} color="brand.500" boxSize={6} />
              <VStack align="start" spacing={1}>
                <Heading size="md" color="gray.700">
                  Estilo de Vida
                </Heading>
                <Text color="gray.600">
                  Hábitos, entorno y actividades diarias
                </Text>
              </VStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Escolaridad</FormLabel>
                  <Input
                    placeholder="Nivel de estudios"
                    value={formData.education || ''}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Color favorito</FormLabel>
                  <Input
                    placeholder="Color preferido"
                    value={formData.favoriteColor || ''}
                    onChange={(e) => handleInputChange('favoriteColor', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>¿Actividad física o deporte?</FormLabel>
                  <RadioGroup value={formData.physicalActivity ? 'si' : 'no'} onChange={(value) => handleInputChange('physicalActivity', value === 'si')}>
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                  {formData.physicalActivity && (
                    <Input
                      mt={2}
                      placeholder="¿Cuál?"
                      value={formData.physicalActivityType || ''}
                      onChange={(e) => handleInputChange('physicalActivityType', e.target.value)}
                    />
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Cepillados por día</FormLabel>
                  <Input
                    type="number"
                    placeholder="Número de veces"
                    value={formData.brushingsPerDay || ''}
                    onChange={(e) => handleInputChange('brushingsPerDay', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>¿Uso de hilo dental?</FormLabel>
                  <RadioGroup value={formData.floss ? 'si' : 'no'} onChange={(value) => handleInputChange('floss', value === 'si')}>
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>¿Uso de enjuague bucal?</FormLabel>
                  <RadioGroup value={formData.mouthwash ? 'si' : 'no'} onChange={(value) => handleInputChange('mouthwash', value === 'si')}>
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Esquema de vacunación</FormLabel>
                <Select
                  placeholder="Seleccionar"
                  value={formData.vaccination || ''}
                  onChange={(e) => handleInputChange('vaccination', e.target.value)}
                >
                  <option value="completo">Completo</option>
                  <option value="incompleto">Incompleto</option>
                  <option value="sin_vacunas">Sin vacunas</option>
                </Select>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      )

    case 5: // Antecedentes Familiares
      return (
        <Card>
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={FiUsers} color="brand.500" boxSize={6} />
              <VStack align="start" spacing={1}>
                <Heading size="md" color="gray.700">
                  Antecedentes Familiares
                </Heading>
                <Text color="gray.600">
                  Historia médica hereditaria familiar
                </Text>
              </VStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <FormControl>
              <FormLabel>Enfermedades heredofamiliares</FormLabel>
              <Textarea
                placeholder="Describa enfermedades de padres, hermanos, hijos, abuelos (diabetes, tuberculosis, obesidad, neoplasias, cardiopatías, hipertensión, artritis, hemofilia, alergias, trastornos mentales, epilepsia, alcoholismo, adicción a drogas, malformaciones congénitas, etc.)"
                value={formData.familyHistory || ''}
                onChange={(e) => handleInputChange('familyHistory', e.target.value)}
                rows={6}
              />
            </FormControl>
          </CardBody>
        </Card>
      )

    case 6: // Documentación
      return (
        <Card>
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={FiFileText} color="brand.500" boxSize={6} />
              <VStack align="start" spacing={1}>
                <Heading size="md" color="gray.700">
                  Documentación
                </Heading>
                <Text color="gray.600">
                  Firmas y finalización del formulario
                </Text>
              </VStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Firma del paciente o tutor</FormLabel>
                <Input
                  placeholder="Nombre completo y relación (ej: Juan Pérez - Padre)"
                  value={formData.patientSignature || ''}
                  onChange={(e) => handleInputChange('patientSignature', e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Fecha</FormLabel>
                <Input
                  type="date"
                  value={formData.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </FormControl>

              <Box 
                p={4} 
                bg="blue.50" 
                borderRadius="md" 
                border="1px solid" 
                borderColor="blue.200"
                w="full"
              >
                <Text fontSize="sm" color="blue.800" textAlign="center">
                  Al completar este formulario, confirma que toda la información proporcionada es verdadera y completa.
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      )

    default:
      return (
        <Card>
          <CardBody>
            <Text>Paso no válido</Text>
          </CardBody>
        </Card>
      )
  }
}

const PatientNew = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  
  // Definir los pasos del formulario
  const steps = [
    {
      id: 0,
      title: 'Datos Personales',
      icon: FiUser,
      description: 'Información básica del paciente'
    },
    {
      id: 1,
      title: 'Salud General',
      icon: FiHeart,
      description: 'Historia médica y tratamientos'
    },
    {
      id: 2,
      title: 'Salud de la Mujer',
      icon: FiUser,
      description: 'Información específica femenina'
    },
    {
      id: 3,
      title: 'Salud Dental',
      icon: FiSmile,
      description: 'Problemas bucales y hábitos'
    },
    {
      id: 4,
      title: 'Estilo de Vida',
      icon: FiHome,
      description: 'Hábitos y entorno'
    },
    {
      id: 5,
      title: 'Antecedentes',
      icon: FiUsers,
      description: 'Historia familiar'
    },
    {
      id: 6,
      title: 'Documentación',
      icon: FiEdit3,
      description: 'Firmas y finalización'
    }
  ]

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Datos básicos
    name: '',
    age: '',
    birthDate: '',
    occupation: '',
    maritalStatus: '',
    address: '',
    neighborhood: '',
    zipCode: '',
    phone: '',
    mobile: '',
    email: '',
    referredBy: '',
    consultationReason: '',
    
    // Salud general
    currentTreatment: false,
    currentTreatmentDetails: '',
    fluSymptoms: false,
    allergies: false,
    allergyDetails: '',
    
    // Antecedentes médicos
    rheumaticFever: false,
    rheumaticFeverDate: '',
    highBloodPressure: false,
    highBloodPressureDate: '',
    lowBloodPressure: false,
    lowBloodPressureDate: '',
    heartAttack: false,
    heartAttackDate: '',
    asthma: false,
    asthmaDate: '',
    arthritis: false,
    arthritisDate: '',
    epilepsy: false,
    epilepsyDate: '',
    anemia: false,
    anemiaDate: '',
    hiv: false,
    hivDate: '',
    hepatitis: false,
    hepatitisType: '',
    diabetes: false,
    diabetesDate: '',
    tuberculosis: false,
    tuberculosisLocation: '',
    cancer: false,
    cancerLocation: '',
    std: false,
    stdType: '',
    kidneyDisease: false,
    kidneyDiseaseType: '',
    liverDisease: false,
    liverDiseaseType: '',
    covid19: false,
    covid19Date: '',
    otherDiseases: false,
    otherDiseasesDetails: '',
    
    // Enfermedades recientes
    seriousIllness3Years: false,
    seriousIllnessDetails: '',
    hospitalization5Years: false,
    hospitalizationDetails: '',
    bleedingTreatment: false,
    bleedingDetails: '',
    nervousProblems: false,
    nervousProblemsDetails: '',
    fainting: false,
    faintingDetails: '',
    seizures: false,
    seizuresDetails: '',
    frequentHerpes: false,
    
    // Hábitos
    smoking: false,
    cigarettesPerDay: '',
    alcohol: false,
    alcoholFrequency: '',
    drugs: false,
    drugsDetails: '',
    
    // Información específica para mujeres
    lastPeriod: '',
    menstrualComplications: false,
    menstrualComplicationsDetails: '',
    birthControl: false,
    pregnancy: false,
    abortions: '',
    breastfeeding: false,
    
    // Salud dental
    bruxism: false,
    teethAppearance: false,
    badBreath: false,
    chewingDifficulty: false,
    anesthesiaReaction: false,
    anesthesiaReactionDetails: '',
    recentPain: false,
    gumBleeding: '',
    jawClicking: '',
    looseTeeth: false,
    foodBetweenTeeth: false,
    lipBiting: false,
    objectBiting: false,
    objectBitingDetails: '',
    mouthBreathing: false,
    teethImportance: '',
    dentistComfort: '',
    dentistComfortOther: '',
    
    // Entorno y hábitos
    education: '',
    favoriteColor: '',
    physicalActivity: false,
    physicalActivityType: '',
    brushingsPerDay: '',
    floss: false,
    mouthwash: false,
    otherHygiene: false,
    otherHygieneDetails: '',
    vaccination: '',
    
    // Antecedentes familiares
    familyHistory: '',
    
    // Firmas
    patientSignature: '',
    date: new Date().toISOString().split('T')[0]
  })

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  // Funciones de navegación entre pasos
  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, steps.length])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((stepIndex) => {
    setCurrentStep(stepIndex)
  }, [])

  // Validar si se puede avanzar al siguiente paso
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: // Datos personales
        return formData.name.trim().length > 0
      case 1: // Salud general
        return true // Opcional
      case 2: // Salud de la mujer
        return true // Opcional
      case 3: // Salud dental
        return true // Opcional
      case 4: // Estilo de vida
        return true // Opcional
      case 5: // Antecedentes
        return true // Opcional
      case 6: // Documentación
        return true // Opcional
      default:
        return false
    }
  }, [currentStep, formData.name])

  // Calcular progreso del formulario
  const progress = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep, steps.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Iniciando proceso de guardado...')
    console.log('Evento submit disparado')
    
    // Validación básica
    if (!formData.name.trim()) {
      console.log('Nombre vacío, no se puede guardar')
      toast({
        title: 'Campo requerido',
        description: 'El nombre del paciente es obligatorio',
        status: 'warning',
        duration: 3000
      })
      return
    }
    
    console.log('Validación pasada, nombre:', formData.name)
    setIsLoading(true)
    
    try {
      console.log('Datos del formulario:', formData)
      
      // Obtener el usuario actual para asignar el dentist_id
      console.log('Obteniendo usuario autenticado...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error al obtener usuario:', userError)
        throw new Error(`Error de autenticación: ${userError.message}`)
      }
      
      if (!user) {
        console.error('No hay usuario autenticado')
        throw new Error('No hay usuario autenticado. Por favor, inicia sesión nuevamente.')
      }
      
      console.log('Usuario autenticado:', user.id)
      
      // Preparar los datos completos para enviar
      const patientData = {
        name: formData.name.trim(),
        age: formData.age || null,
        birth_date: formData.birthDate || null,
        occupation: formData.occupation || null,
        marital_status: formData.maritalStatus || null,
        address: formData.address || null,
        neighborhood: formData.neighborhood || null,
        zip_code: formData.zipCode || null,
        phone: formData.phone || null,
        mobile: formData.mobile || null,
        email: formData.email || null,
        referred_by: formData.referredBy || null,
        consultation_reason: formData.consultationReason || null,
        dentist_id: user.id,
        
        // Salud general
        current_treatment: formData.currentTreatment || false,
        current_treatment_details: formData.currentTreatmentDetails || null,
        flu_symptoms: formData.fluSymptoms || false,
        allergies: formData.allergies || false,
        allergy_details: formData.allergyDetails || null,
        
        // Antecedentes médicos
        rheumatic_fever: formData.rheumaticFever || false,
        rheumatic_fever_date: formData.rheumaticFeverDate || null,
        high_blood_pressure: formData.highBloodPressure || false,
        high_blood_pressure_date: formData.highBloodPressureDate || null,
        low_blood_pressure: formData.lowBloodPressure || false,
        low_blood_pressure_date: formData.lowBloodPressureDate || null,
        heart_attack: formData.heartAttack || false,
        heart_attack_date: formData.heartAttackDate || null,
        asthma: formData.asthma || false,
        asthma_date: formData.asthmaDate || null,
        arthritis: formData.arthritis || false,
        arthritis_date: formData.arthritisDate || null,
        epilepsy: formData.epilepsy || false,
        epilepsy_date: formData.epilepsyDate || null,
        anemia: formData.anemia || false,
        anemia_date: formData.anemiaDate || null,
        hiv: formData.hiv || false,
        hiv_date: formData.hivDate || null,
        hepatitis: formData.hepatitis || false,
        hepatitis_type: formData.hepatitisType || null,
        diabetes: formData.diabetes || false,
        diabetes_date: formData.diabetesDate || null,
        tuberculosis: formData.tuberculosis || false,
        tuberculosis_location: formData.tuberculosisLocation || null,
        cancer: formData.cancer || false,
        cancer_location: formData.cancerLocation || null,
        std: formData.std || false,
        std_type: formData.stdType || null,
        kidney_disease: formData.kidneyDisease || false,
        kidney_disease_type: formData.kidneyDiseaseType || null,
        liver_disease: formData.liverDisease || false,
        liver_disease_type: formData.liverDiseaseType || null,
        covid19: formData.covid19 || false,
        covid19_date: formData.covid19Date || null,
        other_diseases: formData.otherDiseases || false,
        other_diseases_details: formData.otherDiseasesDetails || null,
        
        // Enfermedades recientes
        serious_illness_3_years: formData.seriousIllness3Years || false,
        serious_illness_details: formData.seriousIllnessDetails || null,
        hospitalization_5_years: formData.hospitalization5Years || false,
        hospitalization_details: formData.hospitalizationDetails || null,
        bleeding_treatment: formData.bleedingTreatment || false,
        bleeding_details: formData.bleedingDetails || null,
        nervous_problems: formData.nervousProblems || false,
        nervous_problems_details: formData.nervousProblemsDetails || null,
        fainting: formData.fainting || false,
        fainting_details: formData.faintingDetails || null,
        seizures: formData.seizures || false,
        seizures_details: formData.seizuresDetails || null,
        frequent_herpes: formData.frequentHerpes || false,
        
        // Hábitos
        smoking: formData.smoking || false,
        cigarettes_per_day: formData.cigarettesPerDay || null,
        alcohol: formData.alcohol || false,
        alcohol_frequency: formData.alcoholFrequency || null,
        drugs: formData.drugs || false,
        drugs_details: formData.drugsDetails || null,
        
        // Información específica para mujeres
        last_period: formData.lastPeriod || null,
        menstrual_complications: formData.menstrualComplications || false,
        menstrual_complications_details: formData.menstrualComplicationsDetails || null,
        birth_control: formData.birthControl || false,
        pregnancy: formData.pregnancy || false,
        abortions: formData.abortions || null,
        breastfeeding: formData.breastfeeding || false,
        
        // Salud dental
        bruxism: formData.bruxism || false,
        teeth_appearance: formData.teethAppearance || false,
        bad_breath: formData.badBreath || false,
        chewing_difficulty: formData.chewingDifficulty || false,
        anesthesia_reaction: formData.anesthesiaReaction || false,
        anesthesia_reaction_details: formData.anesthesiaReactionDetails || null,
        recent_pain: formData.recentPain || false,
        gum_bleeding: formData.gumBleeding || null,
        jaw_clicking: formData.jawClicking || null,
        loose_teeth: formData.looseTeeth || false,
        food_between_teeth: formData.foodBetweenTeeth || false,
        lip_biting: formData.lipBiting || false,
        object_biting: formData.objectBiting || false,
        object_biting_details: formData.objectBitingDetails || null,
        mouth_breathing: formData.mouthBreathing || false,
        teeth_importance: formData.teethImportance || null,
        dentist_comfort: formData.dentistComfort || null,
        dentist_comfort_other: formData.dentistComfortOther || null,
        
        // Entorno y hábitos
        education: formData.education || null,
        favorite_color: formData.favoriteColor || null,
        physical_activity: formData.physicalActivity || false,
        physical_activity_type: formData.physicalActivityType || null,
        brushings_per_day: formData.brushingsPerDay || null,
        floss: formData.floss || false,
        mouthwash: formData.mouthwash || false,
        other_hygiene: formData.otherHygiene || false,
        other_hygiene_details: formData.otherHygieneDetails || null,
        vaccination: formData.vaccination || null,
        
        // Antecedentes familiares
        family_history: formData.familyHistory || null,
        
        // Firmas
        patient_signature: formData.patientSignature || null,
        date: formData.date || new Date().toISOString().split('T')[0]
      }
      
      console.log('📤 Datos del paciente preparados para enviar:', patientData)
      
      // Intentar insertar en la base de datos
      console.log('🚀 Enviando datos a Supabase...')
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
      
      if (error) {
        console.error('Error de Supabase:', error)
        console.error('Código de error:', error.code)
        console.error('Mensaje de error:', error.message)
        console.error('Detalles:', error.details)
        console.error('Hint:', error.hint)
        throw error
      }
      
      console.log('✅ Paciente guardado exitosamente:', data)
      
      toast({
        title: 'Paciente registrado',
        description: 'El paciente ha sido registrado exitosamente',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
      
      // Redirigir a la lista de pacientes
      console.log('🔄 Redirigiendo a la lista de pacientes...')
      navigate('/patients')
      
    } catch (error) {
      console.error('💥 Error completo:', error)
      console.error('💥 Tipo de error:', typeof error)
      console.error('💥 Stack trace:', error.stack)
      
      let errorMessage = 'Error al guardar el paciente'
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.details) {
        errorMessage = error.details
      } else if (error.hint) {
        errorMessage = error.hint
      } else if (error.code) {
        errorMessage = `Error ${error.code}: ${error.message || 'Error desconocido'}`
      }
      
      console.error('💥 Mensaje de error final:', errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 8000,
        isClosable: true
      })
    } finally {
      console.log('🏁 Finalizando proceso de guardado...')
      setIsLoading(false)
    }
  }

  return (
    <Box p={6} animation={`${fadeInUp} 0.6s ease-out both`}>
      <VStack spacing={6} align='stretch'>
        {/* Header */}
        <HStack justify='space-between' align='center'>
          <VStack align='start' spacing={2}>
            <Heading 
              size='xl'
              bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
              bgClip='text'
              fontWeight='bold'
            >
              Nuevo Paciente
            </Heading>
            <Text color='gray.600'>
              Formulario completo de registro del paciente
            </Text>
            <Text fontSize='sm' color='orange.500' fontWeight='500'>
              * Los campos marcados son obligatorios
            </Text>
          </VStack>
          
          <Button
            leftIcon={<FiChevronLeft />}
            variant='outline'
            onClick={() => navigate('/patients')}
          >
            Volver
          </Button>
        </HStack>
        
        {/* Indicadores de pasos */}
        <StepIndicator 
          currentStep={currentStep}
          steps={steps}
          progress={progress}
          goToStep={goToStep}
        />
        
        {/* Contenido del paso actual */}
        <StepContent 
          currentStep={currentStep}
          formData={formData}
          handleInputChange={handleInputChange}
        />
        
        {/* Navegación entre pasos */}
        <StepNavigation 
          currentStep={currentStep}
          steps={steps}
          prevStep={prevStep}
          nextStep={nextStep}
          canProceed={canProceed}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </VStack>
    </Box>
  )
}

export default PatientNew