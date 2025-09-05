# Configuración del Sistema de Cuentas de Pacientes - DentalCareMX

## 🚀 Configuración Rápida

### 1. Variables de Entorno

Crea un archivo `.env` en la carpeta `client/` con las siguientes variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role_aqui
```

### 2. Obtener las Claves de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** → **API**
3. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role secret** → `VITE_SUPABASE_SERVICE_ROLE_KEY`

### 3. Ejecutar Migraciones SQL

Ejecuta en tu base de datos de Supabase:

```sql
-- Ejecutar en Supabase SQL Editor
\i supabase/patient_accounts_system.sql
```

## 🔐 Seguridad del Service Role Key

**IMPORTANTE**: El `service_role` key se usa solo para:
- Crear usuarios de pacientes con rol específico
- No se expone en el código del cliente
- Solo se usa en funciones específicas de creación de cuentas

## 📋 Funcionalidades Implementadas

### ✅ Para Dentistas
- **Gestión de cuentas**: Crear, aprobar y administrar cuentas de pacientes
- **Generación automática**: Usuarios reales en Supabase Auth
- **Credenciales temporales**: Contraseñas seguras de 8 caracteres
- **Control de permisos**: Sistema granular de permisos

### ✅ Para Pacientes
- **Login directo**: Acceso con email y contraseña temporal
- **Dashboard personalizado**: Información médica personalizada
- **Asistente virtual**: Chat con IA basado en su historial
- **Gestión de citas**: Solicitar y ver citas programadas

## 🚀 Flujo de Trabajo

### 1. Crear Solicitud de Cuenta
```
Dentista → PatientAccountManager → Crear solicitud → Estado: "pending"
```

### 2. Aprobar y Generar Cuenta
```
Dentista → Aprobar solicitud → Sistema crea usuario real → Estado: "approved"
```

### 3. Paciente Accede
```
Paciente → /patient-login → Credenciales temporales → Cambiar contraseña
```

## 🛠️ Componentes Principales

- **`PatientAccountManager.jsx`**: Gestión de cuentas (para dentistas)
- **`supabaseAdminClient.js`**: Cliente con permisos de administrador
- **`PatientLogin.jsx`**: Login específico para pacientes
- **`PatientDashboard.jsx`**: Dashboard personalizado del paciente

## 🔧 Solución de Problemas

### Error: "VITE_SUPABASE_SERVICE_ROLE_KEY no está configurada"
- Verifica que el archivo `.env` existe en `client/`
- Asegúrate de que la variable esté correctamente nombrada
- Reinicia el servidor de desarrollo

### Error: "Error al crear usuario"
- Verifica que las claves de Supabase sean correctas
- Asegúrate de que el proyecto tenga habilitado el auth
- Revisa los logs de la consola para más detalles

### Usuario no aparece en Supabase Auth
- Verifica que la función `createPatientUser` se ejecute correctamente
- Revisa que el `service_role` key tenga permisos de administrador
- Confirma que la tabla `profiles` se haya creado correctamente

## 📱 URLs del Sistema

- **Login de Dentistas**: `/login`
- **Dashboard de Dentistas**: `/dashboard`
- **Gestión de Cuentas**: `/dashboard` → "Gestionar cuentas"
- **Login de Pacientes**: `/patient-login`
- **Dashboard de Pacientes**: `/patient-dashboard`

## 🔄 Actualizaciones Futuras

- [ ] Sistema de notificaciones por email
- [ ] Cambio de contraseña obligatorio en primer acceso
- [ ] Auditoría de accesos de pacientes
- [ ] Integración con WhatsApp para recordatorios
- [ ] Sistema de verificación de identidad

## 📞 Soporte

Si tienes problemas con la configuración:
1. Revisa los logs de la consola del navegador
2. Verifica la configuración de Supabase
3. Confirma que todas las migraciones SQL se ejecutaron
4. Revisa que las variables de entorno estén correctamente configuradas
