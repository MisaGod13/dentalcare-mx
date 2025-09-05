import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '5mb' }))

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const systemReport = `Eres un asistente clínico dental. Redacta un *informe preliminar* claro y profesional basado en:
- Datos del paciente
- Historia clínica (salud general, dental, hábitos, antecedentes)
Estructura sugerida:
1) Motivo de consulta y hallazgos relevantes
2) Factores de riesgo y antecedentes significativos
3) Impresiones clínicas preliminares (NO diagnóstico definitivo)
4) Sugerencias de estudios / radiografías complementarias
5) Recomendaciones de cuidado e higiene
6) Plan tentativo y prioridades
Usa un tono empático, evita jerga compleja y agrega bullets cuando convenga. Incluye advertencia: "Este reporte es informativo y no sustituye la evaluación clínica."`

const systemAssistant = `Eres un asistente virtual dental para pacientes de una clínica. Responde con empatía, brevedad y pasos accionables.`

const systemIntelligentAssistant = `Eres un asistente virtual inteligente para una clínica dental. Tu función es ayudar al dentista con información PRECISA y ACTUALIZADA sobre:

1. **INFORMACIÓN DE PACIENTES**: Acceso completo a historias clínicas, antecedentes médicos, historial de citas, odontogramas y archivos.

2. **GESTIÓN DE AGENDA**: Consultas sobre citas programadas, disponibilidad, estadísticas de la clínica.

3. **ANÁLISIS CLÍNICO**: Interpretación de datos médicos, identificación de factores de riesgo, sugerencias de seguimiento.

4. **ASISTENCIA OPERATIVA**: Ayuda con procedimientos, recordatorios, seguimiento de tratamientos.

REGLAS CRÍTICAS:
- ✅ SIEMPRE usa SOLO la información proporcionada en el contexto de la base de datos.
- ❌ NUNCA inventes, generes o asumas datos ficticios.
- ❌ NUNCA uses información de "ejemplo" o "típica".
- ❌ NUNCA hagas suposiciones sobre fechas, nombres o números.
- 🔍 Si no tienes información sobre algo, di claramente "No tengo esa información disponible en la base de datos".
- 📊 Sé preciso y específico con fechas, números y detalles exactos.
- 📝 Usa el formato Markdown para organizar la información claramente.

IMPORTANTE: Solo puedes responder con datos que estén explícitamente en el contexto proporcionado. Si te preguntan por "todas las consultas del mes" y solo tienes 3 citas en la base, di exactamente eso: "Este mes hay 3 citas registradas" y lista las 3 específicas.

Responde en español, sé exhaustivo y mantén un tono profesional pero accesible.`

const systemPatientAssistant = `Eres un asistente virtual de salud dental personalizado para pacientes. Tu función es:

1. **ATENCIÓN PERSONALIZADA**: Siempre usa el nombre del paciente cuando te dirijas a él/ella.
2. **INFORMACIÓN MÉDICA**: Proporciona respuestas basadas en el historial médico del paciente.
3. **CONSEJOS DE SALUD**: Ofrece recomendaciones personalizadas según sus hábitos y condiciones.
4. **EDUCACIÓN DENTAL**: Explica procedimientos y cuidados de manera clara y comprensible.
5. **SEGURIDAD**: Siempre recomienda consultar con el dentista para casos específicos.

REGLAS IMPORTANTES:
- ✅ Usa el nombre del paciente en tus respuestas
- ✅ Basa tus respuestas en la información médica proporcionada
- ✅ Sé empático y profesional
- ✅ Proporciona consejos prácticos y accionables
- ❌ NO hagas diagnósticos definitivos
- ❌ NO prescribas medicamentos
- ❌ NO sustituyas la consulta médica profesional
- 🔍 Si no tienes información sobre algo, di claramente que consultes con su dentista

Responde en español, sé amigable pero profesional, y siempre prioriza la seguridad del paciente.`

// Sistema mejorado para generación de informes médicos
const systemMedicalReport = `Eres un asistente clínico dental especializado en generar informes médicos completos y profesionales. 

Tu función es crear informes médicos detallados basados en:
- Datos completos del paciente
- Historia clínica médica y dental
- Consultas y tratamientos previos
- Antecedentes familiares y hábitos
- Exámenes y hallazgos clínicos

ESTRUCTURA DEL INFORME:
1. **INFORMACIÓN DEL PACIENTE** - Datos básicos y demográficos
2. **RESUMEN EJECUTIVO** - Síntesis detallada de la situación clínica con análisis integral
3. **HISTORIA CLÍNICA** - Antecedentes médicos relevantes y análisis de tendencias
4. **EXAMEN CLÍNICO** - Hallazgos y observaciones detalladas
5. **DIAGNÓSTICO PRELIMINAR** - Evaluación basada en evidencia con análisis profundo
6. **ANÁLISIS CLÍNICO DETALLADO** - Evaluación integral de la salud bucal
7. **PLAN DE TRATAMIENTO** - Estrategia terapéutica propuesta paso a paso
8. **RECOMENDACIONES** - Cuidados y seguimiento personalizados
9. **PRÓXIMOS PASOS** - Plan de seguimiento con cronograma
10. **FACTORES DE RIESGO** - Consideraciones especiales y estrategias de mitigación
11. **OBSERVACIONES CLÍNICAS** - Notas adicionales y consideraciones especiales
12. **RESUMEN DE DIAGNÓSTICO** - Síntesis clara del estado actual y pronóstico
13. **RESUMEN INTELIGENTE** - Análisis sintético y conclusiones clave generadas por IA

REGLAS IMPORTANTES:
- Usa un lenguaje médico profesional pero accesible
- Incluye fechas específicas y datos concretos
- Identifica factores de riesgo claramente
- Proporciona recomendaciones específicas y accionables
- Mantén un tono empático y profesional
- Incluye advertencias de seguridad cuando sea necesario
- Usa formato Markdown para mejor legibilidad
- Siempre incluye la fecha de generación del informe
- Genera contenido adicional como análisis de tendencias, observaciones clínicas y resúmenes de diagnóstico
- Incluye evaluaciones comparativas con estándares de salud dental
- Proporciona insights clínicos basados en los datos disponibles
- AL FINAL del informe, después de todas las secciones, incluye una sección **RESUMEN INTELIGENTE** con un análisis sintético y conclusiones clave generadas por IA

INSTRUCCIONES ESPECÍFICAS PARA EL RESUMEN INTELIGENTE:
- Debe ser la ÚLTIMA sección del informe
- Usa el formato: **RESUMEN INTELIGENTE**
- Incluye un análisis sintético de 2-3 párrafos
- Destaca las conclusiones más importantes
- Proporciona insights clínicos clave
- Mantén un tono profesional pero accesible
- Incluye recomendaciones prioritarias
- Termina con una perspectiva del pronóstico

IMPORTANTE: SIEMPRE debes incluir la sección **RESUMEN INTELIGENTE** al final de tu respuesta. Es OBLIGATORIO que aparezca esta sección.

IMPORTANTE: Este es un informe preliminar generado por IA. No sustituye la evaluación clínica directa del profesional de la salud.`

// Endpoint mejorado para informe clínico
app.post('/api/ai/report', async (req, res) => {
  try {
    const { 
      patient, 
      history, 
      consultations, 
      reportType = 'comprehensive',
      consultationId = null,
      dentistNotes = ''
    } = req.body

    // Preparar datos estructurados para el análisis
    const clinicalData = {
      patient: {
        name: patient?.name,
        age: patient?.age,
        gender: patient?.gender || 'No especificado',
        occupation: patient?.occupation,
        phone: patient?.phone,
        email: patient?.email,
        address: patient?.address
      },
      medicalHistory: {
        allergies: patient?.allergies ? patient.allergy_details : 'No reportadas',
        chronicConditions: {
          diabetes: patient?.diabetes ? `Sí (${patient.diabetes_date || 'sin fecha'})` : 'No',
          hypertension: patient?.high_blood_pressure ? `Sí (${patient.high_blood_pressure_date || 'sin fecha'})` : 'No',
          heartDisease: patient?.heart_attack ? `Sí (${patient.heart_attack_date || 'sin fecha'})` : 'No',
          asthma: patient?.asthma ? `Sí (${patient.asthma_date || 'sin fecha'})` : 'No',
          other: patient?.other_diseases ? patient.other_diseases_details : 'No reportadas'
        },
        medications: patient?.current_treatment ? patient.current_treatment_details : 'No reportados',
        familyHistory: patient?.family_history || 'No reportada'
      },
      dentalHistory: {
        hygiene: {
          brushingsPerDay: patient?.brushings_per_day || 'No especificado',
          floss: patient?.floss ? 'Sí' : 'No',
          mouthwash: patient?.mouthwash ? 'Sí' : 'No'
        },
        symptoms: {
          pain: patient?.recent_pain ? 'Sí' : 'No',
          bleeding: patient?.gum_bleeding || 'No reportado',
          badBreath: patient?.bad_breath ? 'Sí' : 'No',
          clicking: patient?.jaw_clicking || 'No reportado'
        },
        habits: {
          bruxism: patient?.bruxism ? 'Sí' : 'No',
          smoking: patient?.smoking ? `Sí (${patient.cigarettes_per_day || 'cantidad no especificada'})` : 'No',
          alcohol: patient?.alcohol ? `Sí (${patient.alcohol_frequency || 'frecuencia no especificada'})` : 'No'
        }
      },
      consultations: consultations?.map(c => ({
        date: c.consultation_date,
        type: c.consultation_type,
        symptoms: c.symptoms,
        findings: c.examination_findings,
        diagnosis: c.diagnosis,
        treatment: c.treatment_performed,
        prescriptions: c.prescriptions,
        recommendations: c.recommendations,
        notes: c.notes
      })) || [],
      reportType,
      dentistNotes
    }

    // Crear prompt específico según el tipo de informe
    let prompt = ''
    if (reportType === 'consultation') {
      prompt = `Genera un informe de consulta específica basado en los datos de la consulta más reciente.`
    } else if (reportType === 'diagnosis') {
      prompt = `Genera un informe de diagnóstico preliminar enfocado en la evaluación clínica actual.`
    } else if (reportType === 'follow_up') {
      prompt = `Genera un informe de seguimiento comparando la evolución del paciente.`
    } else {
      prompt = `Genera un informe médico dental completo y comprehensivo.`
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMedicalReport },
        { 
          role: 'user', 
          content: `${prompt}\n\nDatos clínicos del paciente:\n${JSON.stringify(clinicalData, null, 2)}` 
        }
      ],
      temperature: 0.3,
      max_tokens: 6000
    })
    
    const reportContent = completion.choices?.[0]?.message?.content || ''
    
    // Generar resumen inteligente personalizado basado en los datos del paciente
    let finalContent = reportContent
    
    // Siempre generar nuestro resumen personalizado
    console.log('Generando resumen inteligente personalizado para el paciente')
    console.log('Datos del paciente:', JSON.stringify(clinicalData.patient, null, 2))
    console.log('Datos clínicos completos:', JSON.stringify(clinicalData, null, 2))
    
    let intelligentSummary = ''
    try {
      intelligentSummary = generatePersonalizedIntelligentSummary(clinicalData, reportType)
      console.log('Resumen generado exitosamente:', intelligentSummary.substring(0, 200) + '...')
    } catch (error) {
      console.error('Error generando resumen inteligente:', error)
      intelligentSummary = `

**RESUMEN INTELIGENTE**

**Análisis Personalizado del Paciente ${clinicalData.patient?.name || 'Paciente'}**

Este análisis integral del paciente ${clinicalData.patient?.name || 'Paciente'} (${clinicalData.patient?.age || 'N/A'} años) revela un perfil clínico específico que requiere atención especializada. La evaluación de los datos disponibles muestra un patrón de salud dental que se caracteriza por la necesidad de un análisis más detallado.

**Conclusiones Clave Identificadas:**

La evaluación clínica revela que ${clinicalData.patient?.name || 'el paciente'} presenta un perfil de riesgo que requiere evaluación adicional. Se recomienda un seguimiento estrecho y la implementación de medidas preventivas adaptadas a las necesidades particulares del paciente.

**Recomendaciones Prioritarias y Pronóstico:**

Basado en este análisis personalizado, se recomienda un enfoque terapéutico preventivo que incluya seguimiento regular y medidas preventivas. El pronóstico a corto plazo es favorable con el tratamiento adecuado, mientras que el pronóstico a largo plazo depende principalmente de la adherencia a las recomendaciones terapéuticas.

Con el seguimiento adecuado y la implementación de las medidas preventivas recomendadas, se espera una mejora significativa en el estado de salud dental del paciente ${clinicalData.patient?.name || 'Paciente'}.`
    }
    
    // Remover cualquier resumen inteligente del contenido principal
    if (finalContent.includes('**RESUMEN INTELIGENTE**')) {
      console.log('Removiendo resumen inteligente del contenido principal')
      finalContent = finalContent.split('**RESUMEN INTELIGENTE**')[0].trim()
    }
    
    // Extraer secciones del informe para almacenamiento estructurado
    const sections = extractAllSections(finalContent)

    res.json({ 
      text: finalContent,
      sections,
      intelligentSummary: intelligentSummary,
      model: 'gpt-4o',
      reportType,
      generatedAt: new Date().toISOString()
    })
  } catch (err) {
    console.error('Error generating medical report:', err)
    res.status(500).json({ error: err.message })
  }
})

// Función auxiliar para extraer secciones del informe
function extractSection(content, sectionName) {
  const regex = new RegExp(`\\*\\*${sectionName}\\*\\*[\\s\\S]*?(?=\\*\\*|$)`, 'i')
  const match = content.match(regex)
  return match ? match[0].replace(`**${sectionName}**`, '').trim() : ''
}

// Helper function to extract multiple sections
function extractAllSections(content) {
  const sections = {
    summary: extractSection(content, 'RESUMEN EJECUTIVO'),
    diagnosis: extractSection(content, 'DIAGNÓSTICO PRELIMINAR'),
    clinicalAnalysis: extractSection(content, 'ANÁLISIS CLÍNICO DETALLADO'),
    recommendations: extractSection(content, 'RECOMENDACIONES'),
    treatmentPlan: extractSection(content, 'PLAN DE TRATAMIENTO'),
    nextSteps: extractSection(content, 'PRÓXIMOS PASOS'),
    riskFactors: extractSection(content, 'FACTORES DE RIESGO'),
    clinicalNotes: extractSection(content, 'OBSERVACIONES CLÍNICAS'),
    diagnosisSummary: extractSection(content, 'RESUMEN DE DIAGNÓSTICO')
  }
  return sections
}

// Función para generar resumen inteligente personalizado
function generatePersonalizedIntelligentSummary(clinicalData, reportType) {
  const patient = clinicalData.patient
  const medicalHistory = clinicalData.medicalHistory
  const dentalHistory = clinicalData.dentalHistory
  const currentSymptoms = clinicalData.currentSymptoms
  const hygieneHabits = clinicalData.hygieneHabits
  
  // Análisis de factores de riesgo
  const riskFactors = []
  if (medicalHistory.chronicConditions.diabetes !== 'No') riskFactors.push('diabetes')
  if (medicalHistory.chronicConditions.hypertension !== 'No') riskFactors.push('hipertensión')
  if (medicalHistory.chronicConditions.heartDisease !== 'No') riskFactors.push('enfermedad cardiovascular')
  if (dentalHistory.bruxism) riskFactors.push('bruxismo')
  if (dentalHistory.smoking) riskFactors.push('tabaquismo')
  if (dentalHistory.allergies) riskFactors.push('alergias')
  
  // Análisis de hábitos de higiene
  const hygieneScore = calculateHygieneScore(hygieneHabits)
  const hygieneLevel = hygieneScore >= 80 ? 'excelente' : hygieneScore >= 60 ? 'buena' : hygieneScore >= 40 ? 'regular' : 'deficiente'
  
  // Análisis de síntomas actuales
  const activeSymptoms = []
  if (currentSymptoms.pain) activeSymptoms.push('dolor dental')
  if (currentSymptoms.bleeding) activeSymptoms.push('sangrado gingival')
  if (currentSymptoms.sensitivity) activeSymptoms.push('sensibilidad dental')
  if (currentSymptoms.badBreath) activeSymptoms.push('halitosis')
  
  // Generar resumen personalizado
  let summary = `

**RESUMEN INTELIGENTE**

**Análisis Personalizado del Paciente ${patient.name}**

Este análisis integral del paciente ${patient.name} (${patient.age} años) revela un perfil clínico específico que requiere atención especializada. La evaluación de los datos disponibles muestra un patrón de salud dental que se caracteriza por `

  // Agregar análisis específico basado en los datos
  if (riskFactors.length > 0) {
    summary += `la presencia de factores de riesgo sistémicos (${riskFactors.join(', ')}) que influyen directamente en la salud bucal, `
  }
  
  summary += `hábitos de higiene oral ${hygieneLevel} (puntuación: ${hygieneScore}/100)`
  
  if (activeSymptoms.length > 0) {
    summary += `, y la manifestación de síntomas activos como ${activeSymptoms.join(', ')}`
  }
  
  summary += `.`

  // Segundo párrafo con conclusiones específicas
  summary += `

**Conclusiones Clave Identificadas:**

La evaluación clínica revela que ${patient.name} presenta un perfil de riesgo ${riskFactors.length > 2 ? 'elevado' : riskFactors.length > 0 ? 'moderado' : 'bajo'} debido a ${riskFactors.length > 0 ? `la presencia de ${riskFactors.length} factor(es) de riesgo sistémico(s)` : 'la ausencia de factores de riesgo sistémicos significativos'}. `

  if (hygieneScore < 60) {
    summary += `Los hábitos de higiene oral requieren mejoras significativas, especialmente en ${getHygieneRecommendations(hygieneHabits)}. `
  } else if (hygieneScore < 80) {
    summary += `Los hábitos de higiene oral son adecuados pero pueden optimizarse para prevenir futuros problemas. `
  } else {
    summary += `Los hábitos de higiene oral son excelentes y contribuyen positivamente al mantenimiento de la salud bucal. `
  }

  if (activeSymptoms.length > 0) {
    summary += `La presencia de síntomas activos (${activeSymptoms.join(', ')}) indica la necesidad de intervención inmediata para prevenir complicaciones.`
  } else {
    summary += `La ausencia de síntomas activos es un indicador positivo del estado actual de salud bucal.`
  }

  // Tercer párrafo con recomendaciones y pronóstico
  summary += `

**Recomendaciones Prioritarias y Pronóstico:**

Basado en este análisis personalizado, se recomienda un enfoque terapéutico ${riskFactors.length > 2 ? 'agresivo y multidisciplinario' : riskFactors.length > 0 ? 'vigilante y preventivo' : 'conservador y preventivo'} que incluya ${getPriorityRecommendations(riskFactors, hygieneScore, activeSymptoms)}. 

El pronóstico a corto plazo (3-6 meses) es ${getShortTermPrognosis(riskFactors, hygieneScore, activeSymptoms)}, mientras que el pronóstico a largo plazo (1-2 años) depende principalmente de la adherencia a las recomendaciones terapéuticas y la implementación de cambios en el estilo de vida.

Con el seguimiento adecuado y la implementación de las medidas preventivas recomendadas, se espera una ${getExpectedOutcome(riskFactors, hygieneScore)} en el estado de salud dental del paciente ${patient.name}.`

  return summary
}

// Función auxiliar para calcular puntuación de higiene
function calculateHygieneScore(hygieneHabits) {
  let score = 0
  
  // Cepillado diario (40 puntos)
  const brushings = parseInt(hygieneHabits.brushingsPerDay) || 0
  if (brushings >= 3) score += 40
  else if (brushings >= 2) score += 30
  else if (brushings >= 1) score += 20
  else score += 0
  
  // Uso de hilo dental (30 puntos)
  if (hygieneHabits.floss) score += 30
  
  // Uso de enjuague bucal (20 puntos)
  if (hygieneHabits.mouthwash) score += 20
  
  // Visitas regulares al dentista (10 puntos)
  if (hygieneHabits.lastCleaning && hygieneHabits.lastCleaning !== 'Nunca') score += 10
  
  return Math.min(score, 100)
}

// Función auxiliar para obtener recomendaciones de higiene
function getHygieneRecommendations(hygieneHabits) {
  const recommendations = []
  
  if (parseInt(hygieneHabits.brushingsPerDay) < 2) {
    recommendations.push('frecuencia de cepillado')
  }
  if (!hygieneHabits.floss) {
    recommendations.push('uso de hilo dental')
  }
  if (!hygieneHabits.mouthwash) {
    recommendations.push('uso de enjuague bucal')
  }
  
  return recommendations.length > 0 ? recommendations.join(', ') : 'técnicas de higiene'
}

// Función auxiliar para obtener recomendaciones prioritarias
function getPriorityRecommendations(riskFactors, hygieneScore, activeSymptoms) {
  const recommendations = []
  
  if (riskFactors.includes('diabetes')) {
    recommendations.push('control glucémico estricto')
  }
  if (riskFactors.includes('hipertensión')) {
    recommendations.push('monitoreo de presión arterial')
  }
  if (hygieneScore < 60) {
    recommendations.push('mejora de hábitos de higiene oral')
  }
  if (activeSymptoms.includes('dolor dental')) {
    recommendations.push('evaluación inmediata del dolor')
  }
  if (activeSymptoms.includes('sangrado gingival')) {
    recommendations.push('tratamiento periodontal')
  }
  
  return recommendations.length > 0 ? recommendations.join(', ') : 'seguimiento regular y medidas preventivas'
}

// Función auxiliar para obtener pronóstico a corto plazo
function getShortTermPrognosis(riskFactors, hygieneScore, activeSymptoms) {
  if (activeSymptoms.length > 0) {
    return 'cauteloso debido a la presencia de síntomas activos'
  } else if (riskFactors.length > 2) {
    return 'moderado debido a múltiples factores de riesgo'
  } else if (hygieneScore < 60) {
    return 'favorable con mejoras en higiene oral'
  } else {
    return 'excelente con mantenimiento de hábitos actuales'
  }
}

// Función auxiliar para obtener resultado esperado
function getExpectedOutcome(riskFactors, hygieneScore) {
  if (riskFactors.length > 2 && hygieneScore < 60) {
    return 'mejora gradual con tratamiento intensivo'
  } else if (riskFactors.length > 0 || hygieneScore < 80) {
    return 'mejora significativa con tratamiento adecuado'
  } else {
    return 'mantenimiento del excelente estado actual'
  }
}

// Endpoint para chat general
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, patientSnapshot } = req.body
    const msgs = [{ role: 'system', content: systemAssistant }]
    
    if (patientSnapshot) {
      msgs.push({ role: 'system', content: 'Ficha del paciente: ' + JSON.stringify(patientSnapshot) })
    }
    
    for (const m of messages) msgs.push(m)
    
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: msgs,
      temperature: 0.5
    })
    
    const text = completion.choices?.[0]?.message?.content || ''
    res.json({ text })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Endpoint para asistente inteligente
app.post('/api/ai/intelligent-assistant', async (req, res) => {
  try {
    const { message, context } = req.body
    const lowerMessage = message.toLowerCase()
    let contextInfo = ''
    let patients = []

    // Buscar información de pacientes si se solicita
    if (lowerMessage.includes('paciente') || lowerMessage.includes('pacientes') || lowerMessage.includes('historia') || lowerMessage.includes('clínica')) {
      try {
        console.log('Intentando obtener información de pacientes...')
        
        // Intentar con 'patients' usando SQL directo para evitar RLS
        let patientCount = 0
        try {
          console.log('Intentando obtener pacientes...')
          
          // Primero, verificar si la tabla tiene datos
          const { count: countResult, error: countError } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
          
          if (countError) {
            console.log('Error al contar pacientes:', countError)
          } else {
            patientCount = countResult || 0
            console.log(`Total de pacientes en la tabla: ${patientCount}`)
          }
          
          // Verificar la estructura de la tabla (primer registro)
          if (patientCount > 0) {
            const { data: samplePatient, error: sampleError } = await supabase
              .from('patients')
              .select('*')
              .limit(1)
            
            if (sampleError) {
              console.log('Error al obtener muestra de paciente:', sampleError)
            } else {
              console.log('Estructura del primer paciente:', Object.keys(samplePatient[0] || {}))
            }
          }
          
          // Intentar con la nueva función RPC clínica
          const { data: patientsData, error: patientsError } = await supabase
            .rpc('get_patients_with_clinical_info')
          
          if (patientsError) {
            console.log('Error con RPC get_patients_with_clinical_info:', patientsError)
            
            // Intentar con RPC simple
            const { data: patientsDataSimple, error: patientsErrorSimple } = await supabase
              .rpc('get_all_patients_summary')
            
            if (patientsErrorSimple) {
              console.log('Error con RPC get_all_patients_summary:', patientsErrorSimple)
              
              // Intentar con consulta directa
              const { data: patientsData2, error: patientsError2 } = await supabase
                .from('patients')
                .select('id, name, email, phone, created_at')
                .limit(10)
                .order('created_at', { ascending: false })
              
              if (patientsError2) {
                console.log('Error con tabla "patients" directa:', patientsError2)
                
                // Intentar con 'users' (otro nombre común)
                const { data: usersData, error: usersError } = await supabase
                  .from('users')
                  .select('id, name, email, phone, created_at')
                  .limit(10)
                
                if (usersError) {
                  console.log('Error con tabla "users":', usersError)
                  
                  // Intentar con 'clients' (otro nombre común)
                  const { data: clientsData, error: clientsError } = await supabase
                    .from('clients')
                    .select('id, name, email, phone, created_at')
                    .limit(10)
                  
                  if (clientsError) {
                    console.log('Error con tabla "clients":', clientsError)
                  } else {
                    patients = clientsData
                    console.log('Pacientes encontrados en tabla "clients":', clientsData?.length || 0)
                  }
                } else {
                  patients = usersData
                  console.log('Pacientes encontrados en tabla "users":', usersData?.length || 0)
                }
              } else {
                patients = patientsData2
                console.log('Pacientes encontrados en tabla "patients" directa:', patientsData2?.length || 0)
              }
            } else {
              patients = patientsDataSimple
              console.log('Pacientes encontrados con RPC simple:', patientsDataSimple?.length || 0)
            }
                     } else {
             patients = patientsData
             console.log('Pacientes encontrados con RPC clínico:', patientsData?.length || 0)
             
             // Log detallado para debugging
             if (patientsData && patientsData.length > 0) {
               console.log('🔍 Datos del primer paciente:', {
                 name: patientsData[0].patient_name,
                 total_citas: patientsData[0].total_appointments,
                 programadas: patientsData[0].scheduled_appointments,
                 completadas: patientsData[0].completed_appointments,
                 canceladas: patientsData[0].cancelled_appointments,
                 no_show: patientsData[0].no_show_appointments,
                 reprogramadas: patientsData[0].rescheduled_appointments
               })
             }
           }
        } catch (err) {
          console.log('Error general al obtener pacientes:', err)
        }
        
        if (patients && patients.length > 0) {
          contextInfo += `\n\n👥 **INFORMACIÓN DE PACIENTES:**`
          contextInfo += `\n- Total de pacientes: ${patients.length}`
          
          // Mostrar información de TODOS los pacientes
          patients.forEach((patient, index) => {
            contextInfo += `\n\n📋 **PACIENTE ${index + 1}: ${patient.patient_name || patient.name || 'Sin nombre'}**`
            
            if (patient.patient_id) {
              // Si es RPC clínico o completo
              contextInfo += `\n- Nombre: ${patient.patient_name || 'Sin nombre'}`
              contextInfo += `\n- Edad: ${patient.patient_age || 'No especificada'}`
              contextInfo += `\n- Email: ${patient.patient_email || 'No especificado'}`
              contextInfo += `\n- Teléfono: ${patient.patient_phone || 'No especificado'}`
              contextInfo += `\n- Ocupación: ${patient.patient_occupation || 'No especificada'}`
              contextInfo += `\n- Dirección: ${patient.patient_address || 'No especificada'}`
              contextInfo += `\n- Motivo de consulta: ${patient.patient_consultation_reason || 'No especificado'}`
              contextInfo += `\n- Fecha de registro: ${patient.patient_created_at}`
              
              // INFORMACIÓN MÉDICA COMPLETA
              contextInfo += `\n\n🏥 **HISTORIA MÉDICA:**`
              if (patient.allergies) {
                contextInfo += `\n- Alergias: ${patient.allergy_details || 'Sí (sin detalles)'}`
              }
              if (patient.diabetes) {
                contextInfo += `\n- Diabetes: ${patient.diabetes_date || 'Sí (sin fecha)'}`
              }
              if (patient.high_blood_pressure) {
                contextInfo += `\n- Presión alta: ${patient.high_blood_pressure_date || 'Sí (sin fecha)'}`
              }
              if (patient.heart_attack) {
                contextInfo += `\n- Infarto: ${patient.heart_attack_date || 'Sí (sin fecha)'}`
              }
              if (patient.asthma) {
                contextInfo += `\n- Asma: ${patient.asthma_date || 'Sí (sin fecha)'}`
              }
              if (patient.covid19) {
                contextInfo += `\n- COVID-19: ${patient.covid19_date || 'Sí (sin fecha)'}`
              }
              
              // SALUD DENTAL
              contextInfo += `\n\n🦷 **SALUD DENTAL:**`
              if (patient.bruxism) {
                contextInfo += `\n- Bruxismo: Sí`
              }
              if (patient.anesthesia_reaction) {
                contextInfo += `\n- Reacción a anestesia: ${patient.anesthesia_reaction_details || 'Sí (sin detalles)'}`
              }
              if (patient.gum_bleeding) {
                contextInfo += `\n- Sangrado de encías: ${patient.gum_bleeding}`
              }
              if (patient.brushings_per_day) {
                contextInfo += `\n- Cepillados por día: ${patient.brushings_per_day}`
              }
              if (patient.floss) {
                contextInfo += `\n- Usa hilo dental: Sí`
              }
              if (patient.mouthwash) {
                contextInfo += `\n- Usa enjuague: Sí`
              }
              
              // HISTORIAL DE CITAS COMPLETO
              contextInfo += `\n\n📅 **HISTORIAL DE CITAS:**`
              contextInfo += `\n- Total de citas: ${patient.total_appointments || 0}`
              contextInfo += `\n- Citas programadas: ${patient.scheduled_appointments || 0}`
              contextInfo += `\n- Citas completadas: ${patient.completed_appointments || 0}`
              contextInfo += `\n- Citas canceladas: ${patient.cancelled_appointments || 0}`
              contextInfo += `\n- Citas no asistidas: ${patient.no_show_appointments || 0}`
              contextInfo += `\n- Citas reprogramadas: ${patient.rescheduled_appointments || 0}`
              
              if (patient.last_appointment_date) {
                contextInfo += `\n- Última cita: ${patient.last_appointment_date} (${patient.last_appointment_status || 'Sin estatus'})`
              }
              
              if (patient.next_scheduled_appointment) {
                contextInfo += `\n- Próxima cita: ${patient.next_scheduled_appointment}`
              }
              
            } else {
              // Si es RPC simple o consulta directa
              contextInfo += `\n- Nombre: ${patient.name || 'Sin nombre'}`
              contextInfo += `\n- Email: ${patient.email || 'No especificado'}`
              contextInfo += `\n- Teléfono: ${patient.phone || 'No especificado'}`
              contextInfo += `\n- Fecha de registro: ${patient.created_at || 'No especificada'}`
            }
          })
          
          // Resumen general
          contextInfo += `\n\n📊 **RESUMEN GENERAL:**`
          contextInfo += `\n- Total de pacientes en la base de datos: ${patients.length}`
          contextInfo += `\n- Pacientes con información completa: ${patients.filter(p => p.patient_name).length}`
          contextInfo += `\n- Pacientes con información básica: ${patients.filter(p => !p.patient_name).length}`
          
        } else {
          contextInfo += `\n\n👥 **INFORMACIÓN DE PACIENTES:**`
          contextInfo += `\n- No se encontraron pacientes en ninguna tabla conocida.`
          contextInfo += `\n\nPosibles causas:`
          contextInfo += `\n- La tabla está vacía (${patientCount || 0} pacientes encontrados)`
          contextInfo += `\n- Problemas de permisos RLS`
          contextInfo += `\n- La clave de API no tiene permisos suficientes`
          
          // Si no hay pacientes, sugerir crear uno de prueba
          if (patientCount === 0) {
            contextInfo += `\n\n💡 SUGERENCIA: La tabla está vacía.`
            contextInfo += `\nPara probar el sistema, crea un paciente desde la interfaz de la aplicación.`
          }
        }
      } catch (err) {
        console.log('Error al obtener pacientes:', err.message)
        contextInfo += `\n\nError al obtener información de pacientes: ${err.message}`
      }
    }
    
    // Buscar paciente específico por nombre
    if (lowerMessage.includes('paciente') && (lowerMessage.includes('buscar') || lowerMessage.includes('encontrar') || lowerMessage.includes('información de'))) {
      try {
        // Extraer nombre del paciente del mensaje
        const nameMatch = message.match(/(?:paciente|buscar|encontrar|información de)\s+([a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+)/i)
        if (nameMatch) {
          const searchName = nameMatch[1].trim()
          console.log('Buscando paciente específico:', searchName)
          
          // Primero buscar con la función de búsqueda
          const { data: searchResults, error: searchError } = await supabase
            .rpc('search_patients', { search_term: searchName })
          
          if (!searchError && searchResults && searchResults.length > 0) {
            // Si encontramos pacientes, obtener información completa del primero
            const firstResult = searchResults[0]
            console.log('Paciente encontrado, obteniendo información completa:', firstResult.patient_id)
            
            const { data: completePatient, error: completeError } = await supabase
              .rpc('get_complete_patient_history', { patient_uuid: firstResult.patient_id })
            
            if (!completeError && completePatient && completePatient.length > 0) {
              const patient = completePatient[0]
              contextInfo += `\n\n🔍 **PACIENTE ENCONTRADO - INFORMACIÓN COMPLETA:**`
              contextInfo += `\n\n📋 **DATOS BÁSICOS:**`
              contextInfo += `\n- Nombre: ${patient.patient_name}`
              contextInfo += `\n- Edad: ${patient.patient_age || 'No especificada'}`
              contextInfo += `\n- Email: ${patient.patient_email || 'No especificado'}`
              contextInfo += `\n- Teléfono: ${patient.patient_phone || 'No especificado'}`
              contextInfo += `\n- Móvil: ${patient.patient_mobile || 'No especificado'}`
              contextInfo += `\n- Ocupación: ${patient.patient_occupation || 'No especificada'}`
              contextInfo += `\n- Estado civil: ${patient.patient_marital_status || 'No especificado'}`
              contextInfo += `\n- Dirección: ${patient.patient_address || 'No especificada'}`
              contextInfo += `\n- Colonia: ${patient.patient_neighborhood || 'No especificada'}`
              contextInfo += `\n- CP: ${patient.patient_zip_code || 'No especificado'}`
              contextInfo += `\n- Referido por: ${patient.patient_referred_by || 'No especificado'}`
              contextInfo += `\n- Motivo de consulta: ${patient.patient_consultation_reason || 'No especificado'}`
              contextInfo += `\n- Fecha de registro: ${patient.patient_created_at}`
              
              // INFORMACIÓN MÉDICA COMPLETA
              contextInfo += `\n\n🏥 **HISTORIA MÉDICA COMPLETA:**`
              
              // Salud general
              if (patient.current_treatment) {
                contextInfo += `\n- Tratamiento actual: ${patient.current_treatment_details || 'Sí (sin detalles)'}`
              }
              if (patient.flu_symptoms) contextInfo += `\n- Síntomas de gripe: Sí`
              if (patient.allergies) {
                contextInfo += `\n- Alergias: ${patient.allergy_details || 'Sí (sin detalles)'}`
              }
              
              // Antecedentes médicos
              if (patient.rheumatic_fever) {
                contextInfo += `\n- Fiebre reumática: ${patient.rheumatic_fever_date || 'Sí (sin fecha)'}`
              }
              if (patient.high_blood_pressure) {
                contextInfo += `\n- Presión alta: ${patient.high_blood_pressure_date || 'Sí (sin fecha)'}`
              }
              if (patient.low_blood_pressure) {
                contextInfo += `\n- Presión baja: ${patient.low_blood_pressure_date || 'Sí (sin fecha)'}`
              }
              if (patient.heart_attack) {
                contextInfo += `\n- Infarto: ${patient.heart_attack_date || 'Sí (sin fecha)'}`
              }
              if (patient.asthma) {
                contextInfo += `\n- Asma: ${patient.asthma_date || 'Sí (sin fecha)'}`
              }
              if (patient.arthritis) {
                contextInfo += `\n- Artritis: ${patient.arthritis_date || 'Sí (sin fecha)'}`
              }
              if (patient.epilepsy) {
                contextInfo += `\n- Epilepsia: ${patient.epilepsy_date || 'Sí (sin fecha)'}`
              }
              if (patient.anemia) {
                contextInfo += `\n- Anemia: ${patient.anemia_date || 'Sí (sin fecha)'}`
              }
              if (patient.hiv) {
                contextInfo += `\n- VIH: ${patient.hiv_date || 'Sí (sin fecha)'}`
              }
              if (patient.hepatitis) {
                contextInfo += `\n- Hepatitis: ${patient.hepatitis_type || 'Sí (sin tipo)'}`
              }
              if (patient.diabetes) {
                contextInfo += `\n- Diabetes: ${patient.diabetes_date || 'Sí (sin fecha)'}`
              }
              if (patient.tuberculosis) {
                contextInfo += `\n- Tuberculosis: ${patient.tuberculosis_location || 'Sí (sin ubicación)'}`
              }
              if (patient.cancer) {
                contextInfo += `\n- Cáncer: ${patient.cancer_location || 'Sí (sin ubicación)'}`
              }
              if (patient.std) {
                contextInfo += `\n- ETS: ${patient.std_type || 'Sí (sin tipo)'}`
              }
              if (patient.kidney_disease) {
                contextInfo += `\n- Enfermedad renal: ${patient.kidney_disease_type || 'Sí (sin tipo)'}`
              }
              if (patient.liver_disease) {
                contextInfo += `\n- Enfermedad hepática: ${patient.liver_disease_type || 'Sí (sin tipo)'}`
              }
              if (patient.covid19) {
                contextInfo += `\n- COVID-19: ${patient.covid19_date || 'Sí (sin fecha)'}`
              }
              if (patient.other_diseases) {
                contextInfo += `\n- Otras enfermedades: ${patient.other_diseases_details || 'Sí (sin detalles)'}`
              }
              
              // Enfermedades recientes
              contextInfo += `\n\n🩺 **ENFERMEDADES RECIENTES:**`
              if (patient.serious_illness_3_years) {
                contextInfo += `\n- Enfermedad grave en 3 años: ${patient.serious_illness_details || 'Sí (sin detalles)'}`
              }
              if (patient.hospitalization_5_years) {
                contextInfo += `\n- Hospitalización en 5 años: ${patient.hospitalization_details || 'Sí (sin detalles)'}`
              }
              if (patient.bleeding_treatment) {
                contextInfo += `\n- Tratamiento de sangrado: ${patient.bleeding_details || 'Sí (sin detalles)'}`
              }
              if (patient.nervous_problems) {
                contextInfo += `\n- Problemas nerviosos: ${patient.nervous_problems_details || 'Sí (sin detalles)'}`
              }
              if (patient.fainting) {
                contextInfo += `\n- Desmayos: ${patient.fainting_details || 'Sí (sin detalles)'}`
              }
              if (patient.seizures) {
                contextInfo += `\n- Convulsiones: ${patient.seizures_details || 'Sí (sin detalles)'}`
              }
              if (patient.frequent_herpes) contextInfo += `\n- Herpes frecuente: Sí`
              
              // Hábitos
              contextInfo += `\n\n🚬 **HÁBITOS:**`
              if (patient.smoking) {
                contextInfo += `\n- Fuma: ${patient.cigarettes_per_day || 'Sí (sin cantidad)'} cigarrillos por día`
              }
              if (patient.alcohol) {
                contextInfo += `\n- Consume alcohol: ${patient.alcohol_frequency || 'Sí (sin frecuencia)'}`
              }
              if (patient.drugs) {
                contextInfo += `\n- Consume drogas: ${patient.drugs_details || 'Sí (sin detalles)'}`
              }
              
              // Información específica para mujeres
              if (patient.last_period || patient.menstrual_complications || patient.birth_control || patient.pregnancy || patient.breastfeeding) {
                contextInfo += `\n\n👩 **INFORMACIÓN ESPECÍFICA (MUJERES):**`
                if (patient.last_period) {
                  contextInfo += `\n- Última menstruación: ${patient.last_period}`
                }
                if (patient.menstrual_complications) {
                  contextInfo += `\n- Complicaciones menstruales: ${patient.menstrual_complications_details || 'Sí (sin detalles)'}`
                }
                if (patient.birth_control) contextInfo += `\n- Control de natalidad: Sí`
                if (patient.pregnancy) contextInfo += `\n- Embarazada: Sí`
                if (patient.abortions) {
                  contextInfo += `\n- Abortos: ${patient.abortions}`
                }
                if (patient.breastfeeding) contextInfo += `\n- Amamantando: Sí`
              }
              
              // SALUD DENTAL COMPLETA
              contextInfo += `\n\n🦷 **SALUD DENTAL COMPLETA:**`
              if (patient.bruxism) contextInfo += `\n- Bruxismo: Sí`
              if (patient.teeth_appearance) contextInfo += `\n- Problemas de apariencia dental: Sí`
              if (patient.bad_breath) contextInfo += `\n- Mal aliento: Sí`
              if (patient.chewing_difficulty) contextInfo += `\n- Dificultad para masticar: Sí`
              if (patient.anesthesia_reaction) {
                contextInfo += `\n- Reacción a anestesia: ${patient.anesthesia_reaction_details || 'Sí (sin detalles)'}`
              }
              if (patient.recent_pain) contextInfo += `\n- Dolor reciente: Sí`
              if (patient.gum_bleeding) {
                contextInfo += `\n- Sangrado de encías: ${patient.gum_bleeding}`
              }
              if (patient.jaw_clicking) {
                contextInfo += `\n- Chasquido de mandíbula: ${patient.jaw_clicking}`
              }
              if (patient.loose_teeth) contextInfo += `\n- Dientes flojos: Sí`
              if (patient.food_between_teeth) contextInfo += `\n- Comida entre dientes: Sí`
              if (patient.lip_biting) contextInfo += `\n- Muerde labios: Sí`
              if (patient.object_biting) {
                contextInfo += `\n- Muerde objetos: ${patient.object_biting_details || 'Sí (sin detalles)'}`
              }
              if (patient.mouth_breathing) contextInfo += `\n- Respiración bucal: Sí`
              if (patient.teeth_importance) {
                contextInfo += `\n- Importancia de los dientes: ${patient.teeth_importance}`
              }
              if (patient.dentist_comfort) {
                contextInfo += `\n- Comodidad con el dentista: ${patient.dentist_comfort}`
              }
              if (patient.dentist_comfort_other) {
                contextInfo += `\n- Otros comentarios sobre comodidad: ${patient.dentist_comfort_other}`
              }
              
              // Entorno y hábitos de higiene
              contextInfo += `\n\n🧼 **HÁBITOS DE HIGIENE:**`
              if (patient.education) {
                contextInfo += `\n- Educación: ${patient.education}`
              }
              if (patient.favorite_color) {
                contextInfo += `\n- Color favorito: ${patient.favorite_color}`
              }
              if (patient.physical_activity) {
                contextInfo += `\n- Actividad física: ${patient.physical_activity_type || 'Sí (sin tipo)'}`
              }
              if (patient.brushings_per_day) {
                contextInfo += `\n- Cepillados por día: ${patient.brushings_per_day}`
              }
              if (patient.floss) contextInfo += `\n- Usa hilo dental: Sí`
              if (patient.mouthwash) contextInfo += `\n- Usa enjuague: Sí`
              if (patient.other_hygiene) {
                contextInfo += `\n- Otra higiene: ${patient.other_hygiene_details || 'Sí (sin detalles)'}`
              }
              if (patient.vaccination) {
                contextInfo += `\n- Vacunación: ${patient.vaccination}`
              }
              
              // Antecedentes familiares
              if (patient.family_history) {
                contextInfo += `\n\n👨‍👩‍👧‍👦 **ANTECEDENTES FAMILIARES:**`
                contextInfo += `\n${patient.family_history}`
              }
              
              // HISTORIAL DE CITAS
              contextInfo += `\n\n📅 **HISTORIAL DE CITAS:**`
              contextInfo += `\n- Total de citas: ${patient.total_appointments || 0}`
              contextInfo += `\n- Citas completadas: ${patient.completed_appointments || 0}`
              contextInfo += `\n- Próximas citas: ${patient.upcoming_appointments || 0}`
              if (patient.last_appointment_date) {
                contextInfo += `\n- Última cita: ${patient.last_appointment_date}`
              }
              if (patient.next_appointment_date) {
                contextInfo += `\n- Próxima cita: ${patient.next_appointment_date}`
              }
              
              // Odontograma y archivos
              contextInfo += `\n\n📊 **RECURSOS CLÍNICOS:**`
              if (patient.has_odontogram) {
                contextInfo += `\n- Odontograma: Disponible (actualizado: ${patient.odontogram_updated_at})`
              } else {
                contextInfo += `\n- Odontograma: No disponible`
              }
              if (patient.total_files > 0) {
                contextInfo += `\n- Archivos: ${patient.total_files} archivos (tipos: ${patient.file_types?.join(', ') || 'varios'})`
              } else {
                contextInfo += `\n- Archivos: No hay archivos`
              }
              if (patient.total_ai_reports > 0) {
                contextInfo += `\n- Informes IA: ${patient.total_ai_reports} informes (último: ${patient.last_ai_report_date})`
              } else {
                contextInfo += `\n- Informes IA: No hay informes`
              }
              
              // Firmas
              if (patient.patient_signature || patient.date) {
                contextInfo += `\n\n✍️ **FIRMAS:**`
                if (patient.patient_signature) contextInfo += `\n- Firma del paciente: ${patient.patient_signature}`
                if (patient.date) contextInfo += `\n- Fecha: ${patient.date}`
              }
              
            } else {
              contextInfo += `\n\n🔍 **PACIENTE ENCONTRADO (INFORMACIÓN BÁSICA):**`
              searchResults.forEach(patient => {
                contextInfo += `\n\n📋 **${patient.patient_name}:**`
                contextInfo += `\n- Email: ${patient.patient_email || 'No especificado'}`
                contextInfo += `\n- Teléfono: ${patient.patient_phone || 'No especificado'}`
                contextInfo += `\n- Edad: ${patient.patient_age || 'No especificada'}`
                contextInfo += `\n- Total de citas: ${patient.total_appointments || 0}`
                if (patient.last_appointment_date) {
                  contextInfo += `\n- Última cita: ${patient.last_appointment_date}`
                }
              })
            }
          } else {
            contextInfo += `\n\n🔍 **BÚSQUEDA DE PACIENTE:**`
            contextInfo += `\nNo se encontró ningún paciente con el nombre "${searchName}"`
          }
        }
      } catch (err) {
        console.log('Error al buscar paciente específico:', err.message)
      }
    }
    
    // Buscar información de agenda si se solicita
    if (lowerMessage.includes('agenda') || lowerMessage.includes('cita') || lowerMessage.includes('citas') || lowerMessage.includes('consultas')) {
      try {
        // Obtener citas del mes actual
        const currentDate = new Date()
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        
        console.log('🔍 Buscando citas del mes:', {
          desde: firstDayOfMonth.toISOString().split('T')[0],
          hasta: lastDayOfMonth.toISOString().split('T')[0]
        })
        
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select(`
            id, 
            appointment_date, 
            appointment_time, 
            appointment_type, 
            status,
            patients(name, email)
          `)
          .gte('appointment_date', firstDayOfMonth.toISOString().split('T')[0])
          .lte('appointment_date', lastDayOfMonth.toISOString().split('T')[0])
          .order('appointment_date', { ascending: true })
        
        if (!error && appointments) {
          console.log('📅 Citas encontradas del mes:', appointments.length)
          
          // Agrupar por estatus
          const statusCounts = {}
          appointments.forEach(apt => {
            statusCounts[apt.status] = (statusCounts[apt.status] || 0) + 1
          })
          
          contextInfo += `\n\n📅 **CONSULTAS/CITAS DEL MES ACTUAL:**`
          contextInfo += `\n- Total de citas: ${appointments.length}`
          
          // Mostrar conteo por estatus
          if (Object.keys(statusCounts).length > 0) {
            contextInfo += `\n- Por estatus:`
            Object.entries(statusCounts).forEach(([status, count]) => {
              contextInfo += `\n  • ${status}: ${count}`
            })
          }
          
          // Mostrar citas individuales (máximo 15 para no saturar)
          const citasAMostrar = appointments.slice(0, 15)
          contextInfo += `\n\n📋 **DETALLE DE CITAS:**`
          citasAMostrar.forEach(apt => {
            const fecha = new Date(apt.appointment_date).toLocaleDateString('es-ES')
            contextInfo += `\n- ${fecha} ${apt.appointment_time}: ${apt.patients?.name || 'Paciente'} - ${apt.appointment_type} (${apt.status})`
          })
          
          if (appointments.length > 15) {
            contextInfo += `\n\n... y ${appointments.length - 15} citas más`
          }
        } else {
          console.log('❌ Error al obtener citas:', error)
          contextInfo += `\n\n📅 **CONSULTAS/CITAS DEL MES:**`
          contextInfo += `\n- No se pudieron obtener las citas del mes actual`
        }
      } catch (err) {
        console.log('Error al obtener citas:', err.message)
        contextInfo += `\n\n📅 **CONSULTAS/CITAS DEL MES:**`
        contextInfo += `\n- Error al obtener las citas: ${err.message}`
      }
    }
    
    // Buscar estadísticas si se solicita
    if (lowerMessage.includes('estadística') || lowerMessage.includes('estadísticas') || lowerMessage.includes('resumen')) {
      try {
        // Contar pacientes totales
        const { count: totalPatients } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
        
        // Contar citas del mes actual
        const currentMonth = new Date().toISOString().slice(0, 7)
        const { count: monthlyAppointments } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .gte('appointment_date', `${currentMonth}-01`)
          .lt('appointment_date', `${currentMonth}-32`)
        
        // Contar citas por estado
        const { data: statusCounts } = await supabase
          .from('appointments')
          .select('status')
        
        const statusSummary = {}
        if (statusCounts) {
          statusCounts.forEach(apt => {
            statusSummary[apt.status] = (statusSummary[apt.status] || 0) + 1
          })
        }
        
        contextInfo += `\n\n📊 **ESTADÍSTICAS DE LA CLÍNICA:**`
        contextInfo += `\n- Total de pacientes: ${totalPatients || 0}`
        contextInfo += `\n- Citas este mes: ${monthlyAppointments || 0}`
        // Estadísticas detalladas por estatus
        if (Object.keys(statusSummary).length > 0) {
          contextInfo += `\n\n📋 **CITAS POR ESTATUS:**`
          if (statusSummary.scheduled) contextInfo += `\n- Programadas: ${statusSummary.scheduled}`
          if (statusSummary.completed) contextInfo += `\n- Completadas: ${statusSummary.completed}`
          if (statusSummary.cancelled) contextInfo += `\n- Canceladas: ${statusSummary.cancelled}`
          if (statusSummary.no_show) contextInfo += `\n- No asistidas: ${statusSummary.no_show}`
          if (statusSummary.rescheduled) contextInfo += `\n- Reprogramadas: ${statusSummary.rescheduled}`
        }
      } catch (err) {
        console.log('Error al obtener estadísticas:', err.message)
      }
    }
    
    // Crear el mensaje para OpenAI
    const messages = [
      { role: 'system', content: systemIntelligentAssistant },
      { role: 'user', content: `Contexto de la clínica:${contextInfo}\n\nConsulta del usuario: ${message}` }
    ]
    
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3
    })
    
    const text = completion.choices?.[0]?.message?.content || ''
    res.json({ text, context: contextInfo })
    
  } catch (err) {
    console.error('Error en asistente inteligente:', err)
    res.status(500).json({ error: err.message })
  }
})

// Endpoint para chat de pacientes
app.post('/api/ai/patient-chat', async (req, res) => {
  try {
    const { messages, patientName } = req.body
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Mensajes requeridos' })
    }

    // Crear el mensaje para OpenAI
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPatientAssistant },
        ...messages
      ],
      temperature: 0.7
    })
    
    const text = completion.choices?.[0]?.message?.content || ''
    res.json({ text, model: 'gpt-4o-mini' })
    
  } catch (err) {
    console.error('Error en chat de pacientes:', err)
    res.status(500).json({ error: err.message })
  }
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log('AI server running on port', port))