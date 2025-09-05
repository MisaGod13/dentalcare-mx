# Sistema de Cuentas de Pacientes - DentalCareMX

## Descripción General

Este sistema permite a los dentistas crear cuentas individuales para sus pacientes, permitiéndoles acceder a su historial médico, diagnósticos, recomendaciones y un asistente virtual personalizado, todo según las normas mexicanas de salud dental.

## Características Principales

### 🏥 Para Dentistas
- **Gestión de cuentas de pacientes**: Crear, aprobar y administrar cuentas de acceso
- **Control de permisos**: Gestionar qué puede ver y hacer cada paciente
- **Revisión de solicitudes**: Aprobar o rechazar citas solicitadas por pacientes
- **Notificaciones automáticas**: Sistema de alertas para cambios importantes

### 👤 Para Pacientes
- **Dashboard personalizado**: Acceso a su información médica
- **Historial clínico**: Ver consultas, tratamientos y diagnósticos
- **Asistente virtual**: Chat personalizado con IA basado en su historial
- **Agenda de citas**: Solicitar y gestionar citas
- **Recomendaciones**: Recibir consejos personalizados de salud dental

## Implementación

### 1. Base de Datos

Ejecuta el archivo SQL para crear las tablas necesarias:

```sql
-- Ejecutar en Supabase
\i supabase/patient_accounts_system.sql
```

### 2. Componentes React

El sistema incluye los siguientes componentes:

- `PatientAccountManager.jsx` - Gestión de cuentas (para dentistas)
- `PatientDashboard.jsx` - Dashboard del paciente
- `PatientChatAssistant.jsx` - Asistente virtual personalizado
- `PatientAppointmentScheduler.jsx` - Agenda de citas para pacientes
- `PatientAppointmentRequests.jsx` - Revisión de solicitudes (para dentistas)

### 3. Rutas

Agrega las siguientes rutas a tu aplicación:

```jsx
// Rutas para pacientes
<Route path="/patient-dashboard" element={<ProtectedRoute><PatientDashboard/></ProtectedRoute>} />
<Route path="/patient-accounts" element={<ProtectedRoute><PatientAccountManager/></ProtectedRoute>} />
```

## Flujo de Trabajo

### Creación de Cuenta de Paciente

1. **El dentista registra un paciente** en el sistema
2. **Crea una solicitud de cuenta** desde el gestor de cuentas
3. **El sistema genera credenciales** temporales
4. **El paciente recibe acceso** a su dashboard personalizado

### Gestión de Citas

1. **El paciente solicita una cita** desde su dashboard
2. **El sistema envía la solicitud** al dentista
3. **El dentista revisa y aprueba/rechaza** la solicitud
4. **El paciente recibe notificación** del resultado

### Asistente Virtual

1. **El paciente inicia chat** con el asistente
2. **El sistema carga contexto** personalizado (historial, diagnósticos, etc.)
3. **El asistente responde** basándose en la información del paciente
4. **Se registra la interacción** para análisis posterior

## Estructura de Base de Datos

### Tablas Principales

- `patient_account_requests` - Solicitudes de creación de cuentas
- `patient_notifications` - Sistema de notificaciones
- `patient_diagnoses` - Diagnósticos con control de visibilidad
- `patient_recommendations` - Recomendaciones personalizadas
- `ai_assistant_interactions` - Registro de interacciones con IA
- `patient_permissions` - Sistema de permisos granulares

### Funciones RPC

- `create_patient_account()` - Crear cuenta de paciente
- `get_patient_medical_history_for_patient()` - Obtener historial médico
- `get_patient_diagnoses_for_patient()` - Obtener diagnósticos visibles
- `get_patient_recommendations()` - Obtener recomendaciones
- `get_ai_assistant_context()` - Contexto para asistente virtual
- `record_ai_interaction()` - Registrar interacción con IA

## Seguridad y Privacidad

### Row Level Security (RLS)

- **Pacientes solo ven su propia información**
- **Dentistas ven información de sus pacientes**
- **Control granular de permisos por funcionalidad**

### Control de Acceso

- **Autenticación obligatoria** para todas las funciones
- **Verificación de roles** (dentista vs paciente)
- **Auditoría completa** de todas las acciones

## Configuración

### Variables de Entorno

```env
# Supabase
REACT_APP_SUPABASE_URL=tu_url_de_supabase
REACT_APP_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Permisos por Defecto

Al crear una cuenta de paciente, se otorgan automáticamente:

- ✅ Ver historial médico
- ✅ Ver diagnósticos
- ✅ Agendar citas
- ✅ Ver consultas
- ✅ Chat con asistente virtual

## Uso del Sistema

### Para Dentistas

1. **Accede al dashboard** principal
2. **Ve a "Gestionar cuentas"** para administrar pacientes
3. **Revisa solicitudes de citas** en la agenda
4. **Configura permisos** individuales según necesidades

### Para Pacientes

1. **Inicia sesión** con credenciales proporcionadas
2. **Accede a tu dashboard** personalizado
3. **Revisa tu historial médico** y diagnósticos
4. **Usa el asistente virtual** para consultas
5. **Solicita citas** según tu disponibilidad

## Notificaciones

### Tipos de Notificación

- `appointment_reminder` - Recordatorio de cita
- `diagnosis_update` - Nuevo diagnóstico disponible
- `consultation_scheduled` - Consulta programada
- `general` - Notificaciones generales

### Sistema Automático

- **Nuevos diagnósticos** → Notificación automática
- **Consultas programadas** → Notificación automática
- **Cambios de estado** → Notificación automática

## Asistente Virtual

### Características

- **Contexto personalizado** basado en historial del paciente
- **Respuestas específicas** sobre diagnósticos y tratamientos
- **Recomendaciones personalizadas** según perfil del paciente
- **Registro completo** de todas las interacciones

### Funcionalidades

- Información sobre diagnósticos activos
- Detalles de tratamientos recientes
- Consejos de higiene personalizados
- Orientación sobre próximas consultas
- Respuestas a preguntas generales de salud dental

## Mantenimiento

### Tareas Regulares

- **Revisar solicitudes pendientes** de cuentas
- **Procesar solicitudes de citas** de pacientes
- **Monitorear interacciones** con asistente virtual
- **Actualizar permisos** según necesidades

### Backup y Seguridad

- **Respaldo automático** de base de datos
- **Logs de auditoría** completos
- **Encriptación** de datos sensibles
- **Acceso restringido** por roles

## Solución de Problemas

### Problemas Comunes

1. **Paciente no puede acceder**
   - Verificar que la cuenta esté aprobada
   - Revisar permisos asignados
   - Confirmar credenciales correctas

2. **Asistente virtual no responde**
   - Verificar conexión a base de datos
   - Revisar contexto del paciente
   - Comprobar funciones RPC

3. **Notificaciones no llegan**
   - Verificar configuración de notificaciones
   - Revisar triggers automáticos
   - Comprobar permisos de notificación

### Logs y Debugging

- **Console del navegador** para errores del cliente
- **Logs de Supabase** para errores del servidor
- **Función `record_ai_interaction`** para debugging del asistente

## Futuras Mejoras

### Funcionalidades Planificadas

- **App móvil** para pacientes
- **Integración con calendario** personal
- **Recordatorios por SMS/Email**
- **Análisis avanzado** de interacciones con IA
- **Sistema de puntuación** de respuestas del asistente

### Escalabilidad

- **Multi-tenant** para múltiples clínicas
- **API pública** para integraciones externas
- **Sistema de plugins** para funcionalidades adicionales
- **Backup en la nube** automático

## Soporte

### Documentación

- **API Reference** completa
- **Guías de usuario** paso a paso
- **Videos tutoriales** de implementación
- **FAQ** con preguntas comunes

### Contacto

- **Soporte técnico** disponible 24/7
- **Comunidad** de desarrolladores
- **Foros** de discusión y ayuda
- **Chat en vivo** para consultas urgentes

---

**Nota**: Este sistema cumple con las regulaciones mexicanas de salud dental y está diseñado para mantener la privacidad y seguridad de la información médica de los pacientes.


