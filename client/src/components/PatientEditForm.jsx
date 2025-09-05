import React from 'react'
import {
  Box,
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
  SimpleGrid,
  Icon
} from '@chakra-ui/react'
import { FiUser, FiHeart, FiSmile, FiActivity, FiFileText } from 'react-icons/fi'

// Componente del formulario de edición de pacientes
const PatientEditForm = ({ formData, handleInputChange, currentStep }) => {
  switch (currentStep) {
    case 0: // Datos Personales
      return (
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <HStack spacing={3} mb={4}>
                <Icon as={FiUser} color="blue.500" boxSize={6} />
                <Heading size="md" color="gray.700">
                  Datos Personales
                </Heading>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Nombre completo *</FormLabel>
                  <Input
                    placeholder="Nombre y apellidos"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
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
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Fecha de nacimiento</FormLabel>
                  <Input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Ocupación</FormLabel>
                  <Input
                    placeholder="Profesión o trabajo"
                    value={formData.occupation || ''}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Estado civil</FormLabel>
                  <Select
                    placeholder="Seleccionar estado civil"
                    value={formData.maritalStatus || ''}
                    onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
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
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Teléfono celular</FormLabel>
                  <Input
                    placeholder="Teléfono móvil"
                    value={formData.mobile || ''}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Correo electrónico</FormLabel>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Dirección</FormLabel>
                  <Input
                    placeholder="Dirección completa"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Colonia</FormLabel>
                  <Input
                    placeholder="Colonia o barrio"
                    value={formData.neighborhood || ''}
                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Código postal</FormLabel>
                  <Input
                    placeholder="Código postal"
                    value={formData.zipCode || ''}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Referido por</FormLabel>
                  <Input
                    placeholder="¿Quién lo refirió?"
                    value={formData.referredBy || ''}
                    onChange={(e) => handleInputChange('referredBy', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Motivo de consulta</FormLabel>
                  <Input
                    placeholder="Razón de la visita"
                    value={formData.consultationReason || ''}
                    onChange={(e) => handleInputChange('consultationReason', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      )
      
    case 1: // Salud General
      return (
        <Card>
          <CardBody>
            <VStack spacing={6}>
              <HStack spacing={3} mb={4}>
                <Icon as={FiHeart} color="red.500" boxSize={6} />
                <Heading size="md" color="gray.700">
                  Salud General
                </Heading>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>¿Está en tratamiento actualmente?</FormLabel>
                  <RadioGroup
                    value={formData.currentTreatment ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('currentTreatment', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                {formData.currentTreatment && (
                  <FormControl>
                    <FormLabel>Detalles del tratamiento</FormLabel>
                    <Textarea
                      placeholder="Describa el tratamiento actual"
                      value={formData.currentTreatmentDetails || ''}
                      onChange={(e) => handleInputChange('currentTreatmentDetails', e.target.value)}
                      borderColor="gray.300"
                      _hover={{ borderColor: "#00B4D8" }}
                      _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                    />
                  </FormControl>
                )}
                
                <FormControl>
                  <FormLabel>¿Tiene síntomas de gripe?</FormLabel>
                  <RadioGroup
                    value={formData.fluSymptoms ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('fluSymptoms', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel>¿Tiene alergias?</FormLabel>
                  <RadioGroup
                    value={formData.allergies ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('allergies', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                {formData.allergies && (
                  <FormControl>
                    <FormLabel>Detalles de alergias</FormLabel>
                    <Textarea
                      placeholder="Describa las alergias"
                      value={formData.allergyDetails || ''}
                      onChange={(e) => handleInputChange('allergyDetails', e.target.value)}
                      borderColor="gray.300"
                      _hover={{ borderColor: "#00B4D8" }}
                      _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                    />
                  </FormControl>
                )}
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      )
      
    case 2: // Salud de la Mujer
      return (
        <Card>
          <CardBody>
            <VStack spacing={6}>
              <HStack spacing={3} mb={4}>
                <Icon as={FiHeart} color="pink.500" boxSize={6} />
                <Heading size="md" color="gray.700">
                  Salud de la Mujer
                </Heading>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Última menstruación</FormLabel>
                  <Input
                    type="date"
                    value={formData.lastPeriod || ''}
                    onChange={(e) => handleInputChange('lastPeriod', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>¿Tiene complicaciones menstruales?</FormLabel>
                  <RadioGroup
                    value={formData.menstrualComplications ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('menstrualComplications', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                {formData.menstrualComplications && (
                  <FormControl>
                    <FormLabel>Detalles de complicaciones</FormLabel>
                    <Textarea
                      placeholder="Describa las complicaciones"
                      value={formData.menstrualComplicationsDetails || ''}
                      onChange={(e) => handleInputChange('menstrualComplicationsDetails', e.target.value)}
                      borderColor="gray.300"
                      _hover={{ borderColor: "#00B4D8" }}
                      _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                    />
                  </FormControl>
                )}
                
                <FormControl>
                  <FormLabel>¿Usa anticonceptivos?</FormLabel>
                  <RadioGroup
                    value={formData.birthControl ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('birthControl', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel>¿Está embarazada?</FormLabel>
                  <RadioGroup
                    value={formData.pregnancy ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('pregnancy', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Número de abortos</FormLabel>
                  <Input
                    type="number"
                    placeholder="Número de abortos"
                    value={formData.abortions || ''}
                    onChange={(e) => handleInputChange('abortions', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>¿Está amamantando?</FormLabel>
                  <RadioGroup
                    value={formData.breastfeeding ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('breastfeeding', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      )
      
    case 3: // Salud Dental
      return (
        <Card>
          <CardBody>
            <VStack spacing={6}>
              <HStack spacing={3} mb={4}>
                <Icon as={FiSmile} color="teal.500" boxSize={6} />
                <Heading size="md" color="gray.700">
                  Salud Dental
                </Heading>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>¿Tiene bruxismo?</FormLabel>
                  <RadioGroup
                    value={formData.bruxism ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('bruxism', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel>¿Tiene dolor dental reciente?</FormLabel>
                  <RadioGroup
                    value={formData.recentPain ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('recentPain', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel>¿Sangran las encías?</FormLabel>
                  <Input
                    placeholder="Describa el sangrado"
                    value={formData.gumBleeding || ''}
                    onChange={(e) => handleInputChange('gumBleeding', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>¿Tiene chasquido de mandíbula?</FormLabel>
                  <Input
                    placeholder="Describa el chasquido"
                    value={formData.jawClicking || ''}
                    onChange={(e) => handleInputChange('jawClicking', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>¿Tiene dientes flojos?</FormLabel>
                  <RadioGroup
                    value={formData.looseTeeth ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('looseTeeth', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel>¿Tiene reacción a la anestesia?</FormLabel>
                  <RadioGroup
                    value={formData.anesthesiaReaction ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('anesthesiaReaction', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                {formData.anesthesiaReaction && (
                  <FormControl>
                    <FormLabel>Detalles de reacción a anestesia</FormLabel>
                    <Textarea
                      placeholder="Describa la reacción"
                      value={formData.anesthesiaReactionDetails || ''}
                      onChange={(e) => handleInputChange('anesthesiaReactionDetails', e.target.value)}
                      borderColor="gray.300"
                      _hover={{ borderColor: "#00B4D8" }}
                      _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                    />
                  </FormControl>
                )}
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      )
      
    case 4: // Estilo de Vida
      return (
        <Card>
          <CardBody>
            <VStack spacing={6}>
              <HStack spacing={3} mb={4}>
                <Icon as={FiActivity} color="green.500" boxSize={6} />
                <Heading size="md" color="gray.700">
                  Estilo de Vida
                </Heading>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>¿Fuma?</FormLabel>
                  <RadioGroup
                    value={formData.smoking ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('smoking', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                {formData.smoking && (
                  <FormControl>
                    <FormLabel>Cigarrillos por día</FormLabel>
                    <Input
                      type="number"
                      placeholder="Número de cigarrillos"
                      value={formData.cigarettesPerDay || ''}
                      onChange={(e) => handleInputChange('cigarettesPerDay', e.target.value)}
                      borderColor="gray.300"
                      _hover={{ borderColor: "#00B4D8" }}
                      _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                    />
                  </FormControl>
                )}
                
                <FormControl>
                  <FormLabel>¿Consume alcohol?</FormLabel>
                  <RadioGroup
                    value={formData.alcohol ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('alcohol', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                {formData.alcohol && (
                  <FormControl>
                    <FormLabel>Frecuencia de consumo</FormLabel>
                    <Input
                      placeholder="Frecuencia de consumo"
                      value={formData.alcoholFrequency || ''}
                      onChange={(e) => handleInputChange('alcoholFrequency', e.target.value)}
                      borderColor="gray.300"
                      _hover={{ borderColor: "#00B4D8" }}
                      _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                    />
                  </FormControl>
                )}
                
                <FormControl>
                  <FormLabel>¿Hace actividad física?</FormLabel>
                  <RadioGroup
                    value={formData.physicalActivity ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('physicalActivity', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                {formData.physicalActivity && (
                  <FormControl>
                    <FormLabel>Tipo de actividad física</FormLabel>
                    <Input
                      placeholder="Tipo de ejercicio"
                      value={formData.physicalActivityType || ''}
                      onChange={(e) => handleInputChange('physicalActivityType', e.target.value)}
                      borderColor="gray.300"
                      _hover={{ borderColor: "#00B4D8" }}
                      _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                    />
                  </FormControl>
                )}
                
                <FormControl>
                  <FormLabel>Veces que se cepilla al día</FormLabel>
                  <Select
                    value={formData.brushingsPerDay || ''}
                    onChange={(e) => handleInputChange('brushingsPerDay', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  >
                    <option value="">Seleccionar</option>
                    <option value="1">1 vez</option>
                    <option value="2">2 veces</option>
                    <option value="3">3 veces</option>
                    <option value="4">4 o más veces</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>¿Usa hilo dental?</FormLabel>
                  <RadioGroup
                    value={formData.floss ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('floss', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel>¿Usa enjuague bucal?</FormLabel>
                  <RadioGroup
                    value={formData.mouthwash ? 'si' : 'no'}
                    onChange={(value) => handleInputChange('mouthwash', value === 'si')}
                  >
                    <HStack spacing={4}>
                      <Radio value="si">Sí</Radio>
                      <Radio value="no">No</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      )
      
    case 5: // Antecedentes
      return (
        <Card>
          <CardBody>
            <VStack spacing={6}>
              <HStack spacing={3} mb={4}>
                <Icon as={FiFileText} color="purple.500" boxSize={6} />
                <Heading size="md" color="gray.700">
                  Antecedentes
                </Heading>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Nivel de educación</FormLabel>
                  <Input
                    placeholder="Nivel educativo"
                    value={formData.education || ''}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Color favorito</FormLabel>
                  <Input
                    placeholder="Color favorito"
                    value={formData.favoriteColor || ''}
                    onChange={(e) => handleInputChange('favoriteColor', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Vacunación</FormLabel>
                  <Input
                    placeholder="Estado de vacunación"
                    value={formData.vaccination || ''}
                    onChange={(e) => handleInputChange('vaccination', e.target.value)}
                    borderColor="gray.300"
                    _hover={{ borderColor: "#00B4D8" }}
                    _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                  />
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel>Antecedentes familiares</FormLabel>
                <Textarea
                  placeholder="Describa antecedentes familiares relevantes"
                  value={formData.familyHistory || ''}
                  onChange={(e) => handleInputChange('familyHistory', e.target.value)}
                  borderColor="gray.300"
                  _hover={{ borderColor: "#00B4D8" }}
                  _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      )
      
    case 6: // Documentación
      return (
        <Card>
          <CardBody>
            <VStack spacing={6}>
              <HStack spacing={3} mb={4}>
                <Icon as={FiFileText} color="orange.500" boxSize={6} />
                <Heading size="md" color="gray.700">
                  Documentación
                </Heading>
              </HStack>
              
              <FormControl>
                <FormLabel>Firma del paciente</FormLabel>
                <Textarea
                  placeholder="Firma del paciente (puede escribir su nombre)"
                  value={formData.patientSignature || ''}
                  onChange={(e) => handleInputChange('patientSignature', e.target.value)}
                  borderColor="gray.300"
                  _hover={{ borderColor: "#00B4D8" }}
                  _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Fecha</FormLabel>
                <Input
                  type="date"
                  value={formData.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  borderColor="gray.300"
                  _hover={{ borderColor: "#00B4D8" }}
                  _focus={{ borderColor: "#00B4D8", boxShadow: "outline" }}
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      )
      
    default:
      return null
  }
}

export default PatientEditForm
