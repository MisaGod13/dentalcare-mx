import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { supabase } from '../supabaseClient'
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import PatientEditForm from '../components/PatientEditForm'

export default function PatientEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  
  const steps = ['Datos Personales', 'Salud General', 'Salud de la Mujer', 'Salud Dental', 'Estilo de Vida', 'Antecedentes', 'Documentación']
  const progress = ((currentStep + 1) / steps.length) * 100
  
  // Estado del formulario completo con todos los campos
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
  
  useEffect(() => {
    if (id) {
      loadPatient()
    }
  }, [id])
  
  const loadPatient = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      setPatient(data)
      
      // Mapear datos del paciente al formulario
      setFormData({
        name: data.name || '',
        age: data.age || '',
        birthDate: data.birth_date || '',
        occupation: data.occupation || '',
        maritalStatus: data.marital_status || '',
        address: data.address || '',
        neighborhood: data.neighborhood || '',
        zipCode: data.zip_code || '',
        phone: data.phone || '',
        mobile: data.mobile || '',
        email: data.email || '',
        referredBy: data.referred_by || '',
        consultationReason: data.consultation_reason || '',
        
        // Salud general
        currentTreatment: data.current_treatment || false,
        currentTreatmentDetails: data.current_treatment_details || '',
        fluSymptoms: data.flu_symptoms || false,
        allergies: data.allergies || false,
        allergyDetails: data.allergy_details || '',
        
        // Antecedentes médicos
        rheumaticFever: data.rheumatic_fever || false,
        rheumaticFeverDate: data.rheumatic_fever_date || '',
        highBloodPressure: data.high_blood_pressure || false,
        highBloodPressureDate: data.high_blood_pressure_date || '',
        lowBloodPressure: data.low_blood_pressure || false,
        lowBloodPressureDate: data.low_blood_pressure_date || '',
        heartAttack: data.heart_attack || false,
        heartAttackDate: data.heart_attack_date || '',
        asthma: data.asthma || false,
        asthmaDate: data.asthma_date || '',
        arthritis: data.arthritis || false,
        arthritisDate: data.arthritis_date || '',
        epilepsy: data.epilepsy || false,
        epilepsyDate: data.epilepsy_date || '',
        anemia: data.anemia || false,
        anemiaDate: data.anemia_date || '',
        hiv: data.hiv || false,
        hivDate: data.hiv_date || '',
        hepatitis: data.hepatitis || false,
        hepatitisType: data.hepatitis_type || '',
        diabetes: data.diabetes || false,
        diabetesDate: data.diabetes_date || '',
        tuberculosis: data.tuberculosis || false,
        tuberculosisLocation: data.tuberculosis_location || '',
        cancer: data.cancer || false,
        cancerLocation: data.cancer_location || '',
        std: data.std || false,
        stdType: data.std_type || '',
        kidneyDisease: data.kidney_disease || false,
        kidneyDiseaseType: data.kidney_disease_type || '',
        liverDisease: data.liver_disease || false,
        liverDiseaseType: data.liver_disease_type || '',
        covid19: data.covid19 || false,
        covid19Date: data.covid19_date || '',
        otherDiseases: data.other_diseases || false,
        otherDiseasesDetails: data.other_diseases_details || '',
        
        // Enfermedades recientes
        seriousIllness3Years: data.serious_illness_3_years || false,
        seriousIllnessDetails: data.serious_illness_details || '',
        hospitalization5Years: data.hospitalization_5_years || false,
        hospitalizationDetails: data.hospitalization_details || '',
        bleedingTreatment: data.bleeding_treatment || false,
        bleedingDetails: data.bleeding_details || '',
        nervousProblems: data.nervous_problems || false,
        nervousProblemsDetails: data.nervous_problems_details || '',
        fainting: data.fainting || false,
        faintingDetails: data.fainting_details || '',
        seizures: data.seizures || false,
        seizuresDetails: data.seizures_details || '',
        frequentHerpes: data.frequent_herpes || false,
        
        // Hábitos
        smoking: data.smoking || false,
        cigarettesPerDay: data.cigarettes_per_day || '',
        alcohol: data.alcohol || false,
        alcoholFrequency: data.alcohol_frequency || '',
        drugs: data.drugs || false,
        drugsDetails: data.drugs_details || '',
        
        // Información específica para mujeres
        lastPeriod: data.last_period || '',
        menstrualComplications: data.menstrual_complications || false,
        menstrualComplicationsDetails: data.menstrual_complications_details || '',
        birthControl: data.birth_control || false,
        pregnancy: data.pregnancy || false,
        abortions: data.abortions || '',
        breastfeeding: data.breastfeeding || false,
        
        // Salud dental
        bruxism: data.bruxism || false,
        teethAppearance: data.teeth_appearance || false,
        badBreath: data.bad_breath || false,
        chewingDifficulty: data.chewing_difficulty || false,
        anesthesiaReaction: data.anesthesia_reaction || false,
        anesthesiaReactionDetails: data.anesthesia_reaction_details || '',
        recentPain: data.recent_pain || false,
        gumBleeding: data.gum_bleeding || '',
        jawClicking: data.jaw_clicking || '',
        looseTeeth: data.loose_teeth || false,
        foodBetweenTeeth: data.food_between_teeth || false,
        lipBiting: data.lip_biting || false,
        objectBiting: data.object_biting || false,
        objectBitingDetails: data.object_biting_details || '',
        mouthBreathing: data.mouth_breathing || false,
        teethImportance: data.teeth_importance || '',
        dentistComfort: data.dentist_comfort || '',
        dentistComfortOther: data.dentist_comfort_other || '',
        
        // Entorno y hábitos
        education: data.education || '',
        favoriteColor: data.favorite_color || '',
        physicalActivity: data.physical_activity || false,
        physicalActivityType: data.physical_activity_type || '',
        brushingsPerDay: data.brushings_per_day || '',
        floss: data.floss || false,
        mouthwash: data.mouthwash || false,
        otherHygiene: data.other_hygiene || false,
        otherHygieneDetails: data.other_hygiene_details || '',
        vaccination: data.vaccination || '',
        
        // Antecedentes familiares
        familyHistory: data.family_history || '',
        
        // Firmas
        patientSignature: data.patient_signature || '',
        date: data.date || new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Error loading patient:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar la información del paciente',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const goToStep = (step) => {
    setCurrentStep(step)
  }
  
  const canProceed = () => {
    // Validación básica para el primer paso
    if (currentStep === 0) {
      return formData.name.trim() !== ''
    }
    return true
  }
  
  const handleSubmit = async () => {
    try {
      setIsSaving(true)
      
      // Preparar datos para actualizar (SIN updated_at)
      const updateData = {
        name: formData.name,
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
      
      // Actualizar paciente en la base de datos
      const { error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
      
      toast({
        title: 'Paciente actualizado',
        description: 'La información del paciente ha sido actualizada exitosamente',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
      
      // Redirigir a la vista del paciente
      navigate(`/patients/${id}/view`)
      
    } catch (error) {
      console.error('Error updating patient:', error)
      toast({
        title: 'Error',
        description: 'Error al actualizar la información del paciente',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando información del paciente...</Text>
        </VStack>
      </Box>
    )
  }
  
  if (!patient) {
    return (
      <Box p={8}>
        <Alert status="error" borderRadius="lg">
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
    )
  }
  
  return (
    <Box p={6}>
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
              Editar Paciente
            </Heading>
            <Text color='gray.600'>
              Actualizar información del paciente: {patient.name}
            </Text>
            <Text fontSize='sm' color='orange.500' fontWeight='500'>
              * Los campos marcados son obligatorios
            </Text>
          </VStack>
          
          <Button
            leftIcon={<FiArrowLeft />}
            variant='outline'
            onClick={() => navigate(`/patients/${id}/view`)}
            borderColor='#00B4D8'
            color='#00B4D8'
            _hover={{
              bg: 'rgba(0, 180, 216, 0.1)'
            }}
          >
            Volver
          </Button>
        </HStack>
        
        {/* Indicadores de pasos */}
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
              w={`${progress}%`}
              transition="width 0.3s ease"
            />
          </Box>
          
          {/* Indicadores de pasos */}
          <HStack spacing={4} justify="center" mb={8}>
            {steps.map((step, index) => (
              <HStack
                key={index}
                spacing={2}
                cursor={index <= currentStep ? 'pointer' : 'default'}
                onClick={() => index <= currentStep && goToStep(index)}
                opacity={index <= currentStep ? 1 : 0.5}
                transition="all 0.3s ease"
              >
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  bg={index <= currentStep ? 
                    'linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)' : 
                    'gray.300'
                  }
                  color="white"
                  display="grid"
                  placeItems="center"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  {index + 1}
                </Box>
                <Text
                  fontSize="sm"
                  fontWeight={index === currentStep ? 'bold' : 'normal'}
                  color={index === currentStep ? 'gray.800' : 'gray.600'}
                  display={{ base: 'none', md: 'block' }}
                >
                  {step}
                </Text>
              </HStack>
            ))}
          </HStack>
        </Box>
        
        {/* Contenido del paso actual */}
        <PatientEditForm 
          currentStep={currentStep}
          formData={formData}
          handleInputChange={handleInputChange}
        />
        
        {/* Navegación entre pasos */}
        <HStack justify='space-between' pt={6}>
          <HStack spacing={4}>
            {currentStep > 0 && (
              <Button
                leftIcon={<FiArrowLeft />}
                variant='outline'
                onClick={prevStep}
                borderColor='#00B4D8'
                color='#00B4D8'
                _hover={{
                  bg: 'rgba(0, 180, 216, 0.1)'
                }}
              >
                Anterior
              </Button>
            )}
          </HStack>
          
          <HStack spacing={4}>
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={nextStep}
                isDisabled={!canProceed()}
                bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                color='white'
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
                }}
                _disabled={{
                  opacity: 0.6,
                  cursor: 'not-allowed',
                  transform: 'none'
                }}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                isLoading={isSaving}
                loadingText="Guardando..."
                bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
                color='white'
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)'
                }}
              >
                Guardar Cambios
              </Button>
            )}
          </HStack>
        </HStack>
      </VStack>
    </Box>
  )
}
