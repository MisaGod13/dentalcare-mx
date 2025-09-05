# 🚀 Guía de Deploy en Vercel - DentalCare MX

## 📋 Requisitos Previos

1. **Cuenta de Vercel**: Regístrate en [vercel.com](https://vercel.com)
2. **Cuenta de Supabase**: Tu proyecto ya está configurado
3. **Cuenta de OpenAI**: Para la funcionalidad de IA
4. **GitHub**: Para subir tu código

## 🔧 Configuración del Proyecto

### 1. Preparar Variables de Entorno

Crea los siguientes archivos `.env` en cada carpeta:

#### En la raíz del proyecto:
```bash
cp env.example .env
```

#### En la carpeta client/:
```bash
cp env.example client/.env
```

#### En la carpeta server/:
```bash
cp env.example server/.env
```

### 2. Configurar Variables de Entorno

Edita cada archivo `.env` y reemplaza los valores:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=tu_clave_servicio_aqui

# OpenAI
OPENAI_API_KEY=tu_clave_openai_aqui
```

## 🚀 Proceso de Deploy

### Paso 1: Subir a GitHub

1. Inicializa Git si no lo has hecho:
```bash
git init
git add .
git commit -m "Preparar para deploy en Vercel"
```

2. Crea un repositorio en GitHub y súbelo:
```bash
git remote add origin https://github.com/tu-usuario/dentalcare-mx.git
git push -u origin main
```

### Paso 2: Deploy en Vercel

1. **Conectar con GitHub**:
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "New Project"
   - Conecta tu cuenta de GitHub
   - Selecciona tu repositorio `dentalcare-mx`

2. **Configurar Variables de Entorno**:
   - En la sección "Environment Variables"
   - Agrega las siguientes variables:

   ```
   VITE_SUPABASE_URL = https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY = tu_clave_anonima
   VITE_SUPABASE_SERVICE_ROLE_KEY = tu_clave_servicio
   SUPABASE_URL = https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY = tu_clave_anonima
   SUPABASE_SERVICE_ROLE_KEY = tu_clave_servicio
   OPENAI_API_KEY = tu_clave_openai
   ```

3. **Configurar Build Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Deploy**:
   - Haz clic en "Deploy"
   - Espera a que termine el proceso

## 🔧 Configuración Adicional

### Para el Backend (API Routes)

Vercel detectará automáticamente tu servidor Node.js en la carpeta `server/` y lo configurará como API routes.

### Para el Frontend

El frontend se construirá automáticamente desde la carpeta `client/` y se servirá como sitio estático.

## 🌐 URLs del Proyecto

Después del deploy, tendrás:

- **Frontend**: `https://tu-proyecto.vercel.app`
- **API**: `https://tu-proyecto.vercel.app/api/`

## 🔍 Verificar el Deploy

1. **Frontend**: Visita la URL principal
2. **API**: Prueba `https://tu-proyecto.vercel.app/api/health` (si tienes esa ruta)
3. **Supabase**: Verifica que la conexión funcione
4. **OpenAI**: Prueba la funcionalidad de IA

## 🛠️ Solución de Problemas

### Error de Build
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs de build en Vercel

### Error de Conexión a Supabase
- Verifica las URLs y claves de Supabase
- Asegúrate de que las políticas RLS estén configuradas

### Error de OpenAI
- Verifica que la clave de API sea válida
- Revisa los límites de uso de tu cuenta

## 📱 Dominio Personalizado (Opcional)

1. Ve a "Settings" > "Domains"
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones de Vercel

## 🔄 Deploy Automático

Una vez configurado, cada push a la rama `main` de GitHub desplegará automáticamente los cambios.

## 💰 Costos

- **Vercel**: Gratis para proyectos personales
- **Supabase**: Gratis hasta 500MB de base de datos
- **OpenAI**: Pago por uso (muy económico)

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Verifica las variables de entorno
3. Comprueba la configuración de Supabase
4. Revisa la documentación de Vercel

---

¡Tu aplicación DentalCare MX estará online en minutos! 🎉
