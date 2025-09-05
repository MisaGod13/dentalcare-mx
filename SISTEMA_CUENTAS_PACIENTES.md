# Sistema de Cuentas de Pacientes - DentalCareMX

## Resumen del Sistema

El sistema de cuentas de pacientes permite a los dentistas crear cuentas de acceso para sus pacientes, permitiéndoles acceder a su información médica, diagnósticos, agendar citas y usar el asistente virtual personalizado.

## Flujo Completo de Creación de Cuentas

### 1. Creación de Solicitud (Dentista)
- El dentista va a **Dashboard → Gestionar cuentas**
- Selecciona un paciente sin cuenta
- Hace clic en **"Crear solicitud de cuenta"**
- Se crea una solicitud con estado "pendiente"

### 2. Aprobación y Generación de Credenciales (Dentista)
- El dentista ve la solicitud pendiente
- Hace clic en **"Aprobar y crear cuenta"**
- El sistema:
  - Genera un email automático (ej: `juan.perez@dentalcare.com`)
  - Genera una contraseña temporal de 8 caracteres
  - Crea un usuario en Supabase Auth
  - Actualiza el perfil del paciente
  - Crea una notificación para el paciente
  - Marca la solicitud como "aprobada"

### 3. Acceso del Paciente
- El paciente recibe sus credenciales del dentista
- Va a `/patient-login`
- Ingresa su email y contraseña temporal
- En su primer acceso, **debe cambiar la contraseña**
- Después del cambio, accede a su dashboard personalizado

## Componentes del Sistema

### Frontend (React)

#### 1. PatientAccountManager.jsx
- **Ubicación**: `client/src/components/PatientAccountManager.jsx`
- **Función**: Permite al dentista gestionar cuentas de pacientes
- **Características**:
  - Lista de pacientes con estado de cuenta
  - Creación de solicitudes de cuenta
  - Aprobación/rechazo de solicitudes
  - Visualización de credenciales generadas
  - Botón para copiar credenciales
  - Modal con instrucciones para el paciente

#### 2. PatientLogin.jsx
- **Ubicación**: `client/src/pages/PatientLogin.jsx`
- **Función**: Página de login específica para pacientes
- **Características**:
  - Formulario de login con validación
  - Cambio obligatorio de contraseña en primer acceso
  - Validación de contraseña segura
  - Redirección automática al dashboard

#### 3. PatientDashboard.jsx
- **Ubicación**: `client/src/pages/PatientDashboard.jsx`
- **Función**: Dashboard personalizado del paciente
- **Características**:
  - Historial médico
  - Diagnósticos visibles
  - Recomendaciones personalizadas
  - Chat con asistente virtual
  - Notificaciones del sistema

### Backend (Supabase)

#### 1. Tablas Principales

##### `profiles`
```sql
- id: UUID (PK)
- role: TEXT ('dentist' | 'patient')
- patient_id: UUID (FK a patients)
- is_active: BOOLEAN
- is_first_login: BOOLEAN (nuevo)
- auth_user_id: UUID (FK a auth.users)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

##### `patient_account_requests`
```sql
- id: UUID (PK)
- patient_id: UUID (FK a patients)
- dentist_id: UUID (FK a profiles)
- status: TEXT ('pending' | 'approved' | 'rejected')
- credentials_generated: BOOLEAN (nuevo)
- temp_password: TEXT (nuevo)
- auth_user_id: UUID (FK a auth.users) (nuevo)
- created_at: TIMESTAMP
- approval_date: TIMESTAMP
- rejection_reason: TEXT
```

#### 2. Funciones RPC

##### `create_patient_account`
- Crea la cuenta del paciente y asigna permisos por defecto

##### `get_ai_assistant_context`
- Obtiene contexto del paciente para el asistente virtual

##### `record_ai_interaction`
- Registra interacciones con el asistente virtual

#### 3. Políticas RLS (Row Level Security)

##### `profiles`
- Pacientes solo pueden ver/editar su propio perfil
- Dentistas pueden ver todos los perfiles

##### `patient_account_requests`
- Solo dentistas pueden crear/editar solicitudes
- Pacientes solo pueden ver sus propias solicitudes

##### `patient_notifications`
- Pacientes solo pueden ver sus notificaciones
- Dentistas pueden ver notificaciones de sus pacientes

## Instrucciones para el Paciente

### Credenciales de Acceso
- **Email**: Generado automáticamente por el sistema
- **Contraseña temporal**: Generada automáticamente (8 caracteres)

### Primer Acceso
1. Ir a `/patient-login`
2. Ingresar email y contraseña temporal
3. **Cambiar obligatoriamente la contraseña**
4. La nueva contraseña debe tener:
   - Mínimo 8 caracteres
   - Al menos una letra mayúscula
   - Al menos una letra minúscula
   - Al menos un número

### Funcionalidades Disponibles
- ✅ Ver historial médico
- ✅ Consultar diagnósticos
- ✅ Agendar citas
- ✅ Ver consultas previas
- ✅ Chat con asistente virtual personalizado
- ✅ Recibir notificaciones del sistema

## Instrucciones para el Dentista

### Crear Cuenta de Paciente
1. Ir a **Dashboard → Gestionar cuentas**
2. Buscar el paciente en la lista
3. Hacer clic en **"Crear solicitud de cuenta"**
4. Revisar la solicitud pendiente
5. Hacer clic en **"Aprobar y crear cuenta"**
6. **Copiar las credenciales generadas**
7. **Entregar credenciales al paciente**

### Gestionar Cuentas Existentes
- Ver estado de todas las cuentas
- Copiar credenciales cuando sea necesario
- Ver permisos activos de cada paciente
- Monitorear actividad de las cuentas

## Seguridad y Privacidad

### Autenticación
- Usuarios creados en Supabase Auth
- Contraseñas hasheadas y seguras
- Sesiones manejadas por Supabase

### Autorización
- Role-based access control (RBAC)
- Row Level Security (RLS) en todas las tablas
- Pacientes solo acceden a su propia información
- Dentistas acceden a información de sus pacientes

### Datos Sensibles
- Historial médico protegido por RLS
- Diagnósticos con control de visibilidad
- Notificaciones personalizadas por paciente
- Logs de interacciones con IA

## Migración de Base de Datos

### Archivo de Migración
- **Ubicación**: `supabase/migration_patient_accounts_update.sql`
- **Función**: Actualiza el esquema existente con nuevos campos

### Campos Agregados
- `profiles.is_first_login`
- `profiles.auth_user_id`
- `patient_account_requests.credentials_generated`
- `patient_account_requests.temp_password`
- `patient_account_requests.auth_user_id`

### Funciones Agregadas
- `is_patient_user()`
- `get_authenticated_patient_info()`
- `verify_patient_credentials()`
- `update_first_login_status()`

## Rutas de la Aplicación

### Públicas
- `/patient-login` - Login de pacientes

### Protegidas (Pacientes)
- `/patient-dashboard` - Dashboard del paciente

### Protegidas (Dentistas)
- `/patient-accounts` - Gestión de cuentas de pacientes

## Notificaciones del Sistema

### Tipos de Notificación
- `account_created` - Cuenta creada exitosamente
- `appointment_scheduled` - Cita programada
- `diagnosis_available` - Nuevo diagnóstico disponible
- `consultation_reminder` - Recordatorio de consulta

### Entrega de Notificaciones
- Notificaciones en tiempo real en el dashboard
- Historial de notificaciones
- Estado de lectura (leída/no leída)

## Solución de Problemas

### Error: "No se pudo crear la cuenta"
- Verificar que el paciente existe en la base de datos
- Verificar permisos del dentista
- Revisar logs de Supabase

### Error: "Credenciales inválidas"
- Verificar que la cuenta esté aprobada
- Verificar que las credenciales sean correctas
- Verificar que la cuenta esté activa

### Error: "Acceso denegado"
- Verificar que el usuario tenga rol 'patient'
- Verificar que la cuenta esté activa
- Verificar políticas RLS

## Próximas Mejoras

### Funcionalidades Planificadas
- [ ] Recuperación de contraseña por email
- [ ] Verificación de email en dos pasos
- [ ] Historial de accesos del paciente
- [ ] Notificaciones push en móvil
- [ ] Integración con WhatsApp/SMS

### Mejoras de Seguridad
- [ ] Autenticación de dos factores (2FA)
- [ ] Detección de accesos sospechosos
- [ ] Auditoría completa de acciones
- [ ] Encriptación de datos sensibles

### Mejoras de UX
- [ ] Tutorial interactivo para pacientes
- [ ] Dashboard personalizable
- [ ] Temas visuales personalizados
- [ ] Accesibilidad mejorada

## Soporte Técnico

### Para Dentistas
- Contactar al administrador del sistema
- Revisar logs en Supabase Dashboard
- Verificar permisos y políticas RLS

### Para Pacientes
- Contactar a su dentista
- Verificar credenciales de acceso
- Revisar estado de la cuenta

### Para Desarrolladores
- Revisar logs de la consola del navegador
- Verificar llamadas a la API de Supabase
- Revisar políticas RLS y funciones
- Verificar migraciones de base de datos

---

**Nota**: Este sistema está diseñado para cumplir con las regulaciones mexicanas de protección de datos médicos y privacidad del paciente.


