# Sistema de Informes Médicos con IA

## Descripción General

El sistema de informes médicos con IA es una funcionalidad avanzada que permite a los dentistas generar informes médicos completos y profesionales utilizando inteligencia artificial. Los pacientes pueden visualizar sus informes médicos de forma segura y descargarlos en formato PDF.

## Características Principales

### Para Dentistas
- **Generación de Informes Inteligentes**: Crea informes médicos completos basados en datos del paciente, historial médico y consultas
- **Múltiples Tipos de Informes**:
  - **Completo**: Análisis integral del paciente
  - **Consulta**: Basado en una consulta específica
  - **Diagnóstico**: Evaluación clínica actual
  - **Seguimiento**: Evolución del paciente
- **Interfaz Moderna**: Diseño intuitivo con estadísticas y visualizaciones
- **Descarga PDF**: Exporta informes en formato PDF profesional
- **Gestión Completa**: Ver, editar y eliminar informes

### Para Pacientes
- **Visualización Segura**: Acceso a sus informes médicos personales
- **Interfaz Amigable**: Diseño pensado para pacientes
- **Descarga Personal**: Descarga sus informes en PDF
- **Información Estructurada**: Resúmenes, diagnósticos y recomendaciones organizados
- **Privacidad**: Solo pueden ver informes marcados como visibles

## Estructura de la Base de Datos

### Tabla `ai_reports`
```sql
- id: UUID (Primary Key)
- patient_id: UUID (Foreign Key)
- content: TEXT (Contenido completo del informe)
- title: TEXT (Título del informe)
- summary: TEXT (Resumen ejecutivo)
- diagnosis: TEXT (Diagnóstico preliminar)
- recommendations: TEXT (Recomendaciones)
- treatment_plan: TEXT (Plan de tratamiento)
- next_steps: TEXT (Próximos pasos)
- risk_factors: TEXT (Factores de riesgo)
- report_type: TEXT (Tipo de informe)
- model: TEXT (Modelo de IA utilizado)
- generated_by: UUID (ID del dentista que generó)
- dentist_notes: TEXT (Notas adicionales del dentista)
- is_visible_to_patient: BOOLEAN (Visibilidad para el paciente)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Componentes Principales

### 1. MedicalReportGenerator
**Ubicación**: `client/src/components/MedicalReportGenerator.jsx`

**Funcionalidades**:
- Generación de informes con IA
- Gestión de informes existentes
- Exportación a PDF
- Interfaz de configuración de informes
- Visualización de estadísticas

**Props**:
- `patientId`: ID del paciente
- `patientData`: Datos del paciente
- `onReportGenerated`: Callback cuando se genera un informe

### 2. PatientReportViewer
**Ubicación**: `client/src/components/PatientReportViewer.jsx`

**Funcionalidades**:
- Visualización de informes para pacientes
- Interfaz amigable con pestañas
- Descarga de PDFs
- Indicadores de prioridad
- Información de seguridad

**Props**:
- `patientId`: ID del paciente
- `patientData`: Datos del paciente

### 3. API de Generación
**Ubicación**: `server/index.js`

**Endpoint**: `POST /api/ai/report`

**Parámetros**:
```json
{
  "patient": "Datos del paciente",
  "history": "Historial médico",
  "consultations": "Consultas previas",
  "reportType": "Tipo de informe",
  "dentistNotes": "Notas del dentista"
}
```

**Respuesta**:
```json
{
  "text": "Contenido del informe",
  "sections": {
    "summary": "Resumen ejecutivo",
    "diagnosis": "Diagnóstico",
    "recommendations": "Recomendaciones",
    "treatmentPlan": "Plan de tratamiento",
    "nextSteps": "Próximos pasos",
    "riskFactors": "Factores de riesgo"
  },
  "model": "gpt-4o",
  "reportType": "comprehensive",
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Flujo de Trabajo

### Para Dentistas
1. **Acceso**: Ir a la página del paciente → Pestaña "Informes Médicos"
2. **Configuración**: Seleccionar tipo de informe y agregar notas
3. **Generación**: Hacer clic en "Generar Informe"
4. **Revisión**: Ver el informe generado
5. **Gestión**: Descargar, editar o eliminar informes

### Para Pacientes
1. **Acceso**: Ir a "Informes Médicos" en el menú
2. **Visualización**: Ver lista de informes disponibles
3. **Detalle**: Hacer clic en un informe para verlo completo
4. **Descarga**: Descargar en PDF si es necesario

## Seguridad y Privacidad

### Políticas RLS (Row Level Security)
- Los dentistas solo pueden ver informes de sus pacientes
- Los pacientes solo pueden ver informes marcados como visibles
- Validación de permisos en cada operación

### Datos Sensibles
- Los informes contienen información médica confidencial
- Acceso restringido por roles de usuario
- Encriptación en tránsito y en reposo

## Configuración Requerida

### Variables de Entorno
```env
OPENAI_API_KEY=tu_clave_de_openai
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
```

### Dependencias del Cliente
```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1"
}
```

### Dependencias del Servidor
```json
{
  "openai": "^4.55.0",
  "@supabase/supabase-js": "^2.56.1"
}
```

## Instalación y Configuración

### 1. Ejecutar Migración de Base de Datos
```sql
-- Ejecutar el archivo: supabase/improve_ai_reports_table.sql
```

### 2. Instalar Dependencias
```bash
# Cliente
cd client
npm install jspdf html2canvas

# Servidor
cd server
npm install openai
```

### 3. Configurar Variables de Entorno
```env
# .env en la raíz del proyecto
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4. Iniciar Servicios
```bash
# Servidor de IA
cd server
npm run dev

# Cliente
cd client
npm run dev
```

## Uso Avanzado

### Personalización de Prompts
Los prompts de IA se pueden personalizar en `server/index.js`:

```javascript
const systemMedicalReport = `Tu prompt personalizado aquí...`
```

### Tipos de Informes Personalizados
Agregar nuevos tipos en `MedicalReportGenerator.jsx`:

```javascript
const getReportTypeLabel = (type) => {
  const labels = {
    'comprehensive': 'Completo',
    'consultation': 'Consulta',
    'diagnosis': 'Diagnóstico',
    'follow_up': 'Seguimiento',
    'custom_type': 'Tipo Personalizado' // Nuevo tipo
  }
  return labels[type] || type
}
```

### Estilos Personalizados
Los estilos se pueden personalizar en los componentes usando Chakra UI:

```jsx
<Box
  sx={{
    '& h1': { fontSize: 'xl', fontWeight: 'bold' },
    '& h2': { fontSize: 'lg', fontWeight: 'bold' }
  }}
>
  {content}
</Box>
```

## Solución de Problemas

### Error: "No se puede generar el informe"
- Verificar que la API de OpenAI esté configurada correctamente
- Revisar los logs del servidor para errores específicos
- Asegurar que el paciente tenga datos suficientes

### Error: "No se pueden cargar los informes"
- Verificar las políticas RLS de Supabase
- Revisar que el usuario tenga los permisos correctos
- Comprobar la conexión a la base de datos

### Error: "No se puede descargar el PDF"
- Verificar que las dependencias `jspdf` y `html2canvas` estén instaladas
- Revisar que el navegador permita descargas
- Comprobar que el contenido del informe sea válido

## Mejoras Futuras

### Funcionalidades Planificadas
- [ ] Plantillas de informes personalizables
- [ ] Firma digital en PDFs
- [ ] Notificaciones automáticas de nuevos informes
- [ ] Análisis de tendencias de salud
- [ ] Integración con sistemas externos
- [ ] Múltiples idiomas
- [ ] Modo offline

### Optimizaciones
- [ ] Cache de informes generados
- [ ] Compresión de PDFs
- [ ] Lazy loading de informes
- [ ] Paginación para listas largas

## Soporte

Para soporte técnico o preguntas sobre el sistema de informes médicos:

1. Revisar la documentación completa
2. Verificar los logs de la aplicación
3. Consultar la base de datos de Supabase
4. Contactar al equipo de desarrollo

---

**Nota**: Este sistema está diseñado para uso médico profesional y cumple con estándares de privacidad y seguridad de datos de salud.
