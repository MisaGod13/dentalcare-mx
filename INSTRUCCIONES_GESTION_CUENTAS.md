# 🚀 Instrucciones de Uso: Gestión de Cuentas de Pacientes

## 📍 Ubicación del Botón

El botón **"Gestionar cuentas de pacientes"** se encuentra en el **Dashboard del Dentista** en la sección de **"Acciones rápidas"**.

### 🎯 Cómo Acceder:
1. **Inicia sesión** como dentista en `/login`
2. **Ve al Dashboard** principal (`/dashboard`)
3. **Busca la sección** "Acciones rápidas"
4. **Haz clic** en el botón con el ícono de escudo (🛡️)

## 🔔 Indicadores Visuales

### 📊 Estadísticas en el Dashboard:
- **Tarjeta "Cuentas Activas"**: Muestra el total de cuentas de pacientes aprobadas
- **Badge rojo**: Aparece en el botón cuando hay solicitudes pendientes
- **Contador de solicitudes**: Se muestra en la esquina superior derecha del botón

### 🎨 Colores y Estados:
- **🟢 Verde**: Cuentas activas (aprobadas)
- **🟡 Amarillo**: Solicitudes pendientes
- **🔴 Rojo**: Solicitudes rechazadas o expiradas

## 🚀 Flujo de Trabajo Completo

### 1️⃣ **Crear Solicitud de Cuenta**
```
Dashboard → Gestionar cuentas → Seleccionar paciente → "Crear solicitud de cuenta"
```

### 2️⃣ **Aprobar Solicitud**
```
Ver solicitud pendiente → "Aprobar y crear cuenta" → Sistema genera usuario automáticamente
```

### 3️⃣ **Paciente Accede**
```
Paciente recibe credenciales → Va a /patient-login → Accede a su dashboard
```

## 🛠️ Funcionalidades Disponibles

### ✅ **Para el Dentista:**
- **Crear solicitudes** de cuenta para pacientes
- **Aprobar/rechazar** solicitudes pendientes
- **Ver credenciales** generadas automáticamente
- **Gestionar permisos** de cada paciente
- **Copiar credenciales** al portapapeles
- **Ver instrucciones** para el paciente

### ✅ **Para el Paciente:**
- **Login directo** con credenciales temporales
- **Dashboard personalizado** con su información médica
- **Historial clínico** visible según permisos
- **Asistente virtual** personalizado
- **Gestión de citas** y recordatorios

## 📱 Navegación Rápida

### **Desde el Dashboard:**
- **🛡️ Gestionar cuentas** → `/patient-accounts`
- **👥 Ver pacientes** → `/patients`
- **📅 Agenda** → `/agenda`
- **🤖 Chat IA** → `/chat-assistant`

### **URLs del Sistema:**
- **Dashboard Dentista**: `/dashboard`
- **Gestión de Cuentas**: `/patient-accounts`
- **Login Pacientes**: `/patient-login`
- **Dashboard Pacientes**: `/patient-dashboard`

## 🔐 Seguridad y Permisos

### **Sistema de Roles:**
- **Dentista**: Acceso completo a gestión de cuentas
- **Paciente**: Solo acceso a su información autorizada
- **RLS (Row Level Security)**: Protección automática de datos

### **Permisos por Defecto:**
- ✅ Ver historial médico
- ✅ Ver diagnósticos autorizados
- ✅ Agendar citas
- ✅ Ver consultas
- ✅ Usar asistente virtual

## 📊 Monitoreo y Estadísticas

### **Métricas Disponibles:**
- **Total de pacientes** registrados
- **Cuentas activas** aprobadas
- **Solicitudes pendientes** de revisión
- **Archivos** y **Informes IA** generados

### **Alertas Automáticas:**
- **Badge rojo** cuando hay solicitudes pendientes
- **Contador** de solicitudes en espera
- **Notificaciones** para el paciente cuando se crea su cuenta

## 🔧 Solución de Problemas

### **Botón no aparece:**
- Verifica que estés logueado como dentista
- Confirma que tienes permisos de administrador
- Revisa la consola del navegador para errores

### **No se pueden crear cuentas:**
- Verifica la configuración de Supabase
- Confirma que las variables de entorno estén configuradas
- Ejecuta las migraciones SQL necesarias

### **Paciente no puede acceder:**
- Verifica que la cuenta esté aprobada
- Confirma que las credenciales sean correctas
- Revisa que la ruta `/patient-login` esté disponible

## 🎯 Mejores Prácticas

### **Al Crear Cuentas:**
1. **Verifica el email** del paciente antes de crear la solicitud
2. **Comunica las credenciales** de forma segura al paciente
3. **Revisa los permisos** asignados por defecto
4. **Proporciona instrucciones** claras para el primer acceso

### **Al Gestionar Permisos:**
1. **Asigna solo los permisos necesarios** para cada paciente
2. **Revisa regularmente** los permisos otorgados
3. **Documenta** cualquier cambio en los permisos
4. **Mantén un registro** de cuentas activas

## 🔄 Actualizaciones Futuras

### **Funcionalidades Planificadas:**
- [ ] **Notificaciones por email** automáticas
- [ ] **Cambio de contraseña** obligatorio en primer acceso
- [ ] **Auditoría completa** de accesos de pacientes
- [ ] **Integración con WhatsApp** para recordatorios
- [ ] **Sistema de verificación** de identidad del paciente

### **Mejoras de UX:**
- [ ] **Tutorial interactivo** para nuevos usuarios
- [ ] **Dashboard personalizable** para dentistas
- [ ] **Reportes automáticos** de actividad
- [ ] **Sincronización** con calendario personal

## 📞 Soporte Técnico

### **Si tienes problemas:**
1. **Revisa los logs** de la consola del navegador
2. **Verifica la configuración** de Supabase
3. **Confirma que las migraciones SQL** se ejecutaron
4. **Revisa las variables de entorno** en el archivo `.env`

### **Archivos de Configuración:**
- **`.env`**: Variables de entorno de Supabase
- **`supabaseAdminClient.js`**: Cliente con permisos de administrador
- **`PatientAccountManager.jsx`**: Componente de gestión de cuentas
- **`update_patient_accounts_system.sql`**: Migraciones de base de datos

---

## 🎉 ¡Sistema Listo para Usar!

El sistema de gestión de cuentas de pacientes está completamente implementado y listo para uso en producción. Los dentistas pueden crear, aprobar y administrar cuentas de pacientes de manera segura y eficiente, mientras que los pacientes disfrutan de acceso personalizado a su información médica.
