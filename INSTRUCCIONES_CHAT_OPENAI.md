PS C:\Users\user\OneDrive\Escritorio\Proyecto Terminal\v1\DentalCareMX> npm run dev       

> dentalcare-mx@0.1.0 dev
> concurrently "npm --prefix server run dev" "npm --prefix client run dev"

[0] 
[0] > dentalcare-server@0.1.0 dev
[0] > node index.js
[0]
[1]
[1] > dentalcare-client@0.1.0 dev
[1] > vite
[1]
[1] 
[1]   VITE v5.4.19  ready in 669 ms
[1]
[1]   ➜  Local:   http://localhost:5173/
[1]   ➜  Network: use --host to expose
[0] node:events:492
[0]       throw er; // Unhandled 'error' event
[0]       ^
[0]
[0] Error: listen EADDRINUSE: address already in use :::3001
[0]     at Server.setupListenHandle [as _listen2] (node:net:1872:16)
[0]     at listenInCluster (node:net:1920:12)
[0]     at Server.listen (node:net:2008:7)
[0]     at Function.listen (C:\Users\user\OneDrive\Escritorio\Proyecto Terminal\v1\DentalCareMX\server\node_modules\express\lib\application.js:635:24)
[0]     at file:///C:/Users/user/OneDrive/Escritorio/Proyecto%20Terminal/v1/DentalCareMX/server/index.js:808:5
[0]     at ModuleJob.run (node:internal/modules/esm/module_job:218:25)
[0]     at async ModuleLoader.import (node:internal/modules/esm/loader:329:24)
[0]     at async loadESM (node:internal/process/esm_loader:34:7)
[0]     at async handleMainPromise (node:internal/modules/run_main:113:12)
[0] Emitted 'error' event on Server instance at:
[0]     at emitErrorNT (node:net:1899:8)
[0]     at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
[0]   code: 'EADDRINUSE',
[0]   errno: -4091,
[0]   syscall: 'listen',
[0]   address: '::',
[0]   port: 3001
[0] }
[0]
[0] Node.js v20.10.0
[0] npm --prefix server run dev exited with code 1
# 🚀 Configuración del Chat con OpenAI para Pacientes

## 📋 Requisitos Previos

1. **API Key de OpenAI**: Necesitas una clave de API válida de OpenAI
2. **Servidor funcionando**: El servidor debe estar corriendo en el puerto 3001
3. **Variables de entorno configuradas**

## 🔧 Configuración del Servidor

### 1. Crear archivo `.env` en la carpeta `server/`

```bash
cd v1/DentalCareMX/server
touch .env
```

### 2. Agregar las siguientes variables al archivo `.env`:

```env
# Configuración del servidor AI
PORT=3001

# OpenAI API Key (OBLIGATORIO)
OPENAI_API_KEY=tu_api_key_de_openai_aqui

# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Configuración adicional
NODE_ENV=development
```

### 3. Obtener API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Inicia sesión o crea una cuenta
3. Ve a "API Keys" en el menú lateral
4. Haz clic en "Create new secret key"
5. Copia la clave generada
6. Pégala en tu archivo `.env` como valor de `OPENAI_API_KEY`

## 🚀 Iniciar el Servidor

### 1. Instalar dependencias (si no lo has hecho):

```bash
cd v1/DentalCareMX/server
npm install
```

### 2. Iniciar el servidor:

```bash
npm run dev
```

Deberías ver: `AI server running on port 3001`

## 🎯 Funcionalidades del Chat

### ✨ Características Principales

- **IA Personalizada**: El asistente conoce el historial médico del paciente
- **Respuestas Contextuales**: Basadas en información real de la base de datos
- **Interfaz Estandarizada**: Diseño consistente con el resto de la aplicación
- **Seguridad Médica**: Siempre recomienda consultar con el dentista

### 🔍 Información que Accede la IA

- **Datos Personales**: Nombre, edad, ocupación
- **Antecedentes Médicos**: Alergias, diabetes, presión alta, etc.
- **Salud Dental**: Bruxismo, reacciones a anestesia, etc.
- **Hábitos**: Fumar, alcohol, actividad física, higiene dental
- **Historial de Citas**: Citas recientes y próximas
- **Historial Médico**: Diagnósticos y tratamientos previos

### 💬 Tipos de Respuestas

- **Consejos Personalizados**: Basados en hábitos específicos del paciente
- **Explicaciones Médicas**: Procedimientos y cuidados dentales
- **Recordatorios**: Higiene y visitas al dentista
- **Prevención**: Consejos específicos según su condición

## 🧪 Probar el Chat

### 1. Inicia sesión como paciente
### 2. Ve a la sección "Chat con Asistente Virtual"
### 3. Haz preguntas como:

```
- ¿Cómo debo cepillarme los dientes?
- ¿Cuándo es mi próxima cita?
- ¿Qué alimentos son buenos para mis dientes?
- ¿Cómo puedo prevenir las caries?
- ¿Qué significa mi diagnóstico?
```

## 🔒 Seguridad y Privacidad

### ✅ Medidas Implementadas

- **RLS (Row Level Security)**: Solo el paciente ve su información
- **Contexto Limitado**: La IA solo accede a datos del paciente autenticado
- **Sin Almacenamiento**: Las conversaciones no se guardan en la base de datos
- **Recomendaciones Seguras**: Siempre sugiere consultar con el dentista

### ⚠️ Limitaciones

- **No Diagnósticos**: La IA no puede diagnosticar enfermedades
- **No Prescripciones**: No puede recetar medicamentos
- **Información General**: Solo proporciona consejos educativos
- **Consulta Obligatoria**: Para casos específicos, siempre consultar al dentista

## 🐛 Solución de Problemas

### Error: "No se pudo conectar con el asistente"

1. **Verifica que el servidor esté corriendo**:
   ```bash
   cd v1/DentalCareMX/server
   npm run dev
   ```

2. **Verifica tu API Key de OpenAI**:
   - Asegúrate de que esté en el archivo `.env`
   - Verifica que sea válida en [OpenAI Platform](https://platform.openai.com/)

3. **Verifica el puerto**:
   - El servidor debe estar en el puerto 3001
   - No debe haber conflictos de puerto

### Error: "No se pudo generar una respuesta"

1. **Verifica la conexión a Supabase**:
   - Las variables de entorno de Supabase deben estar correctas
   - La base de datos debe estar accesible

2. **Verifica los permisos RLS**:
   - El paciente debe tener acceso a sus datos
   - Las políticas de seguridad deben estar configuradas

## 📱 Interfaz del Usuario

### 🎨 Diseño Estandarizado

- **Header**: Título con gradiente azul-verde
- **Alertas**: Información del estado de conexión
- **Sugerencias**: Preguntas rápidas predefinidas
- **Chat**: Burbujas de mensaje con colores diferenciados
- **Input**: Campo de texto con botón de envío
- **Responsive**: Adaptado a todos los dispositivos

### 🎯 Elementos Visuales

- **Colores**: Gradiente azul-verde consistente
- **Iconos**: React Icons para mejor UX
- **Tipografía**: Jerarquía clara de información
- **Espaciado**: Diseño limpio y respirable

## 🔄 Flujo de Funcionamiento

1. **Inicialización**: Se carga la información del paciente
2. **Contexto**: Se construye el contexto médico para la IA
3. **Chat**: El usuario escribe mensajes
4. **Procesamiento**: Se envía a OpenAI con el contexto del paciente
5. **Respuesta**: La IA genera una respuesta personalizada
6. **Visualización**: Se muestra en la interfaz del chat

## 📈 Monitoreo y Logs

### Logs del Servidor

El servidor registra:
- Conexiones exitosas
- Errores de API
- Tiempos de respuesta
- Uso de tokens de OpenAI

### Métricas de Uso

- Mensajes procesados
- Errores por tipo
- Tiempo promedio de respuesta
- Uso de la API de OpenAI

## 🚀 Próximas Mejoras

- **Historial de Chat**: Guardar conversaciones importantes
- **Análisis de Sentimiento**: Detectar urgencias médicas
- **Integración con Calendario**: Recordatorios automáticos
- **Multilingüe**: Soporte para otros idiomas
- **Accesibilidad**: Mejoras para usuarios con discapacidades

---

## ✅ Checklist de Configuración

- [ ] API Key de OpenAI configurada
- [ ] Servidor corriendo en puerto 3001
- [ ] Variables de entorno configuradas
- [ ] Base de datos Supabase accesible
- [ ] RLS configurado correctamente
- [ ] Paciente autenticado en la aplicación

**¡Con esto deberías tener un chat completamente funcional con IA personalizada para cada paciente!** 🎉
