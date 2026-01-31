# 🔐 Variables de Entorno

## 📋 Descripción General

Este documento detalla todas las variables de entorno necesarias para el proyecto, organizadas por servicio y entorno.

**⚠️ IMPORTANTE:**
- **NUNCA** commitear archivos con valores reales (`.env.local`, `appsettings.Development.json`)
- Usar `.env.example` y `appsettings.example.json` como plantillas
- Valores sensibles en producción deben estar en servicios seguros (Vercel Secrets, Railway Env Vars)

---

## 🎨 FRONTEND (Next.js)

### Archivos de Configuración

```
frontend/
├── .env.example          # Plantilla para compartir
├── .env.local           # Local development (NO commitear)
├── .env.production      # Producción (opcional, usar Vercel UI)
└── .env.staging         # Staging (opcional)
```

### Variables Públicas (NEXT_PUBLIC_*)

Estas variables son accesibles en el cliente (browser).

#### API y Backend

```bash
# URL del backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Producción:
# NEXT_PUBLIC_API_URL=https://api.simracingshop.com/api
```

**Uso:** Todas las llamadas a la API
**Requerido:** ✅ Sí
**Valor local:** `http://localhost:5000/api`
**Valor producción:** `https://api.tudominio.com/api`

---

#### Stripe

```bash
# Clave pública de Stripe (test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef...

# Producción (live mode):
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51234567890abcdef...
```

**Uso:** Stripe Elements, procesamiento de pagos
**Requerido:** ✅ Sí (para checkout)
**Obtener:** [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
**Nota:** Usar `pk_test_*` en desarrollo, `pk_live_*` en producción

---

#### Analytics

```bash
# Google Analytics Measurement ID
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Tag Manager (opcional)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

**Uso:** Tracking de analytics
**Requerido:** ⚠️ Opcional (recomendado en producción)
**Obtener:** [Google Analytics](https://analytics.google.com/)

---

#### Monitoring

```bash
# Sentry DSN público
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/7654321
```

**Uso:** Error tracking en cliente
**Requerido:** ⚠️ Opcional (recomendado)
**Obtener:** [Sentry Dashboard](https://sentry.io/)

---

#### Captcha

```bash
# hCaptcha Site Key
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001
```

**Uso:** Validación anti-bot en formularios
**Requerido:** ⚠️ Opcional (recomendado para registro/checkout)
**Obtener:** [hCaptcha Dashboard](https://dashboard.hcaptcha.com/)

---

#### Otros

```bash
# URL base de la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Producción:
# NEXT_PUBLIC_BASE_URL=https://simracingshop.com

# Entorno actual
NEXT_PUBLIC_ENVIRONMENT=development
# Opciones: development | staging | production
```

**Uso:** URLs canónicas, OG tags, redirects
**Requerido:** ✅ Sí

---

### Variables Privadas (Server-Side Only)

Estas variables solo están disponibles en el servidor.

```bash
# Stripe Secret Key (NUNCA exponer al cliente)
STRIPE_SECRET_KEY=sk_test_51234567890abcdef...
# Producción: sk_live_51234567890abcdef...

# API Keys para servicios
RESEND_API_KEY=re_123456789_abcdefghijklmnop
SENTRY_AUTH_TOKEN=sntrys_abc123def456...

# Vercel Blob Storage (si se usa)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_abc123...
```

---

### Ejemplo Completo `.env.local`

```bash
# ============================================
# FRONTEND - LOCAL DEVELOPMENT
# ============================================

# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...

# Analytics (opcional en dev)
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Monitoring (opcional en dev)
# NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
# SENTRY_AUTH_TOKEN=sntrys_...

# Captcha (opcional en dev)
# NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001

# Storage (si usas Vercel Blob localmente)
# BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

---

## ⚙️ BACKEND (.NET)

### Archivos de Configuración

```
backend/
├── appsettings.json              # Configuración base (commiteable)
├── appsettings.example.json      # Plantilla (commiteable)
├── appsettings.Development.json  # Local (NO commitear)
├── appsettings.Production.json   # Producción (NO commitear, usar env vars)
└── appsettings.Staging.json      # Staging (NO commitear)
```

### appsettings.json (Base)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### appsettings.Development.json (Local)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=simracing;Username=postgres;Password=postgres;Port=5432"
  },
  
  "Redis": {
    "Configuration": "localhost:6379",
    "InstanceName": "SimRacing_"
  },
  
  "Jwt": {
    "Secret": "your-super-secret-key-must-be-at-least-32-characters-long",
    "Issuer": "SimRacingShop",
    "Audience": "SimRacingShop",
    "ExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 7
  },
  
  "Stripe": {
    "SecretKey": "sk_test_51...",
    "WebhookSecret": "whsec_...",
    "Currency": "eur",
    "SuccessUrl": "http://localhost:3000/pedido/{CHECKOUT_SESSION_ID}/confirmacion",
    "CancelUrl": "http://localhost:3000/checkout"
  },
  
  "Email": {
    "Provider": "Resend",
    "ApiKey": "re_...",
    "FromEmail": "noreply@test.com",
    "FromName": "SimRacing Shop"
  },
  
  "Serilog": {
    "Using": ["Serilog.Sinks.Console", "Serilog.Sinks.File", "Serilog.Sinks.Seq"],
    "MinimumLevel": {
      "Default": "Debug",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.EntityFrameworkCore": "Information",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/log-.txt",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 7,
          "outputTemplate": "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
        }
      },
      {
        "Name": "Seq",
        "Args": {
          "serverUrl": "http://localhost:5341"
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName", "WithThreadId"]
  },
  
  "Sentry": {
    "Dsn": "https://...@sentry.io/...",
    "Environment": "development",
    "TracesSampleRate": 1.0,
    "SendDefaultPii": false
  },
  
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowCredentials": true
  },
  
  "RateLimiting": {
    "EnableRateLimiting": true,
    "PermitLimit": 100,
    "Window": "00:01:00",
    "QueueLimit": 10
  },
  
  "AdminSeed": {
    "Email": "admin@tudominio.com",
    "Password": "AdminPassword123!",
    "FirstName": "Admin",
    "LastName": "SimRacing"
  },

  "Features": {
    "EnableSwagger": true,
    "EnableDetailedErrors": true,
    "EnableSeedData": true
  }
}
```

---

## 🔑 Descripción Detallada de Variables Backend

### ConnectionStrings

#### DefaultConnection
```json
"DefaultConnection": "Host=localhost;Database=simracing;Username=postgres;Password=postgres;Port=5432"
```

**Componentes:**
- `Host`: Servidor PostgreSQL
- `Database`: Nombre de la BD
- `Username`: Usuario de BD
- `Password`: Contraseña
- `Port`: Puerto (default 5432)

**Producción:**
```json
"DefaultConnection": "Host=your-db.supabase.co;Database=postgres;Username=postgres;Password=xxx;Port=5432;SSL Mode=Require"
```

---

### Redis

```json
"Redis": {
  "Configuration": "localhost:6379",
  "InstanceName": "SimRacing_"
}
```

**Configuration:** Connection string de Redis
- Local: `localhost:6379`
- Upstash: `redis-12345.upstash.io:6379,password=xxx,ssl=true`

**InstanceName:** Prefijo para todas las keys (evita colisiones)

---

### JWT (Autenticación)

```json
"Jwt": {
  "Secret": "your-super-secret-key-min-32-chars",
  "Issuer": "SimRacingShop",
  "Audience": "SimRacingShop",
  "ExpiryMinutes": 60,
  "RefreshTokenExpiryDays": 7
}
```

**Secret:** ⚠️ CRÍTICO - Debe ser aleatorio y > 32 caracteres
```bash
# Generar secret seguro:
openssl rand -base64 32
```

**Issuer/Audience:** Identificadores del token (pueden ser iguales)

**ExpiryMinutes:** Duración del access token (60 = 1 hora)

**RefreshTokenExpiryDays:** Duración del refresh token (7 días)

---

### AdminSeed (Usuario Admin Inicial)

```json
"AdminSeed": {
  "Email": "admin@simracingshop.com",
  "Password": "TuPasswordSeguro123!",
  "FirstName": "Admin",
  "LastName": "SimRacing"
}
```

**⚠️ IMPORTANTE:** Estas variables son **requeridas** en el primer inicio si no existe ningún usuario admin en la base de datos. Si no están configuradas, la aplicación fallará con un error.

**Email:** Email del usuario administrador inicial
- Debe ser un email válido
- Se usará para login

**Password:** Contraseña del admin
- Mínimo 8 caracteres
- Debe contener: mayúscula, minúscula, dígito

**FirstName/LastName:** Nombre del administrador (opcionales, tienen valores por defecto)

**Variables de entorno:**
```bash
AdminSeed__Email=admin@simracingshop.com
AdminSeed__Password=TuPasswordSeguro123!
AdminSeed__FirstName=Admin
AdminSeed__LastName=SimRacing
```

**Nota:** Una vez creado el admin, estas variables pueden quedar vacías. El seeder solo crea el usuario si no existe ningún admin en el sistema.

---

### Stripe

```json
"Stripe": {
  "SecretKey": "sk_test_...",
  "WebhookSecret": "whsec_...",
  "Currency": "eur",
  "SuccessUrl": "http://localhost:3000/pedido/{CHECKOUT_SESSION_ID}/confirmacion",
  "CancelUrl": "http://localhost:3000/checkout"
}
```

**SecretKey:** Clave secreta de Stripe
- Test: `sk_test_...`
- Live: `sk_live_...`

**WebhookSecret:** Secret para verificar webhooks
- Obtener en Stripe Dashboard → Webhooks
- Dejar vacío en desarrollo si no usas webhooks localmente

**Currency:** Divisa (eur, usd, gbp, etc.)

**SuccessUrl/CancelUrl:** URLs de redirect después del pago

---

### Email (Resend)

```json
"Email": {
  "Provider": "Resend",
  "ApiKey": "re_...",
  "FromEmail": "noreply@tudominio.com",
  "FromName": "SimRacing Shop"
}
```

**ApiKey:** Obtener en [Resend Dashboard](https://resend.com/api-keys)

**FromEmail:** Debe estar verificado en Resend
- Test: Usar `onboarding@resend.dev` (funciona sin verificar)
- Producción: Verificar tu dominio

**FromName:** Nombre que aparece en emails

---

### Serilog (Logging)

```json
"Serilog": {
  "MinimumLevel": {
    "Default": "Information",
    "Override": {
      "Microsoft": "Warning",
      "System": "Warning"
    }
  },
  "WriteTo": [
    {"Name": "Console"},
    {"Name": "File", "Args": {...}},
    {"Name": "Seq", "Args": {"serverUrl": "http://localhost:5341"}}
  ]
}
```

**MinimumLevel:** Nivel mínimo de log
- `Verbose` → `Debug` → `Information` → `Warning` → `Error` → `Fatal`

**WriteTo:** Destinos de logs
- **Console:** Consola (siempre)
- **File:** Archivos rotativos
- **Seq:** UI para logs estructurados

---

### CORS

```json
"Cors": {
  "AllowedOrigins": ["http://localhost:3000", "https://tudominio.com"],
  "AllowCredentials": true
}
```

**AllowedOrigins:** Lista de dominios permitidos
⚠️ En producción, solo incluir dominios específicos (no `*`)

**AllowCredentials:** Permitir cookies/auth headers

---

### RateLimiting

```json
"RateLimiting": {
  "EnableRateLimiting": true,
  "PermitLimit": 100,
  "Window": "00:01:00",
  "QueueLimit": 10
}
```

**PermitLimit:** Requests permitidos por ventana

**Window:** Duración de la ventana (formato TimeSpan)
- `00:01:00` = 1 minuto
- `00:15:00` = 15 minutos

**QueueLimit:** Requests en cola si se excede límite

---

## 🔒 User Secrets (Desarrollo Local)

Para desarrollo, es mejor usar **User Secrets** en lugar de `appsettings.Development.json`.

### Configurar User Secrets

```bash
cd backend

# Inicializar user secrets
dotnet user-secrets init

# Añadir secrets individuales
dotnet user-secrets set "Jwt:Secret" "your-super-secret-key-here"
dotnet user-secrets set "Stripe:SecretKey" "sk_test_..."
dotnet user-secrets set "Email:ApiKey" "re_..."
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;..."

# Ver todos los secrets
dotnet user-secrets list

# Eliminar un secret
dotnet user-secrets remove "Jwt:Secret"

# Limpiar todos
dotnet user-secrets clear
```

**Ventaja:** Los secrets se guardan en `~/.microsoft/usersecrets/` (fuera del repo)

---

## 🌍 Variables por Entorno

### Development (Local)

```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ENVIRONMENT=development
STRIPE_SECRET_KEY=sk_test_...

# Backend
ConnectionStrings__DefaultConnection=Host=localhost...
Jwt__Secret=dev-secret-key-32-chars-min
```

### Staging

```bash
# Frontend (Vercel Preview)
NEXT_PUBLIC_API_URL=https://api-staging.simracingshop.com/api
NEXT_PUBLIC_ENVIRONMENT=staging
STRIPE_SECRET_KEY=sk_test_...  # Seguir usando test

# Backend (Railway Staging)
ConnectionStrings__DefaultConnection=Host=staging-db.railway...
Jwt__Secret=staging-secret-different-from-prod
```

### Production

```bash
# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://api.simracingshop.com/api
NEXT_PUBLIC_ENVIRONMENT=production
STRIPE_SECRET_KEY=sk_live_...  # ⚠️ LIVE MODE

# Backend (Railway Production)
ConnectionStrings__DefaultConnection=Host=prod-db.supabase.co...
Jwt__Secret=production-super-secret-key-min-32-chars
Sentry__Environment=production
```

---

## 🚀 Configuración en Servicios Cloud

### Vercel (Frontend)

**Vía UI:**
1. Dashboard → Tu Proyecto → Settings → Environment Variables
2. Añadir variables una por una
3. Elegir entornos: Production, Preview, Development

**Vía CLI:**
```bash
# Añadir variable
vercel env add NEXT_PUBLIC_API_URL production

# Listar variables
vercel env ls

# Pull variables localmente
vercel env pull .env.local
```

**Notas:**
- Variables `NEXT_PUBLIC_*` se incluyen en el bundle del cliente
- Variables sin prefijo solo están en server-side
- Cambios requieren redeploy

---

### Railway (Backend)

**Vía UI:**
1. Dashboard → Tu Servicio → Variables
2. Añadir en formato `KEY=value`
3. Aplicar cambios (redeploy automático)

**Variables de entorno en Railway:**
```bash
# Connection String (Railway lo genera automático)
DATABASE_URL=postgresql://postgres:...@containers-us-west-...

# Formato .NET
ConnectionStrings__DefaultConnection=${{DATABASE_URL}}

# JWT
Jwt__Secret=tu-secret-produccion

# Stripe
Stripe__SecretKey=sk_live_...
Stripe__WebhookSecret=whsec_...

# Email
Email__ApiKey=re_...

# Sentry
Sentry__Dsn=https://...@sentry.io/...
Sentry__Environment=production

# Admin Seed (solo primer deploy)
AdminSeed__Email=admin@tudominio.com
AdminSeed__Password=password-seguro-produccion
```

**Nota:** Railway usa `__` para anidar en lugar de `:` (formato .NET standard)

---

### Supabase (PostgreSQL)

**Connection String:**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

**Obtener:**
1. Dashboard → Settings → Database
2. Connection string → URI (pooler mode recomendado)

---

### Upstash (Redis)

**Connection String:**
```bash
# Formato estándar
redis-12345.upstash.io:6379

# Con password
redis-12345.upstash.io:6379,password=tu-password,ssl=true

# En appsettings.json
"Redis": {
  "Configuration": "redis-12345.upstash.io:6379,password=xxx,ssl=true"
}
```

**Obtener:**
1. Dashboard → Tu Database → Connect
2. Copiar connection string

---

## 🔐 Seguridad y Best Practices

### ✅ DO's

1. **Usar User Secrets en desarrollo**
   ```bash
   dotnet user-secrets set "Key" "Value"
   ```

2. **Variables diferentes por entorno**
   - Dev: claves test, logs verbose
   - Prod: claves live, logs minimal

3. **Rotar secrets periódicamente**
   - JWT Secret: cada 90 días
   - API Keys: cuando sea necesario

4. **Usar servicios de secrets management**
   - Vercel Secrets (frontend)
   - Railway Environment Variables (backend)
   - Nunca hardcodear en código

5. **Validar variables al inicio**
   ```csharp
   if (string.IsNullOrEmpty(stripeSecretKey))
       throw new InvalidOperationException("Stripe Secret Key not configured");
   ```

### ❌ DON'Ts

1. **NUNCA commitear secrets**
   - Añadir a `.gitignore`:
     ```
     .env.local
     .env.*.local
     appsettings.Development.json
     appsettings.Production.json
     ```

2. **No usar mismos secrets en dev y prod**
   - JWT Secret diferente
   - Stripe test vs live keys
   - BD diferentes

3. **No exponer secrets en logs**
   ```csharp
   // ❌ MAL
   logger.LogInformation($"Connecting with password: {password}");
   
   // ✅ BIEN
   logger.LogInformation("Connecting to database");
   ```

4. **No compartir secrets por email/slack**
   - Usar 1Password / Bitwarden
   - O regenerar después de compartir

---

## 📋 Checklist de Variables

### Antes de Deploy

- [ ] Todas las variables definidas en servicios cloud
- [ ] Variables de producción diferentes de desarrollo
- [ ] Stripe en live mode (producción)
- [ ] CORS solo permite dominio real
- [ ] Sentry configurado con environment correcto
- [ ] Emails desde dominio verificado
- [ ] Connection strings con SSL en producción
- [ ] JWT Secret robusto (32+ chars)
- [ ] Rate limiting habilitado
- [ ] Logs no contienen secrets

### Variables Críticas (NO OLVIDAR)

- [ ] `ConnectionStrings__DefaultConnection`
- [ ] `Jwt__Secret`
- [ ] `Stripe__SecretKey`
- [ ] `Email__ApiKey`
- [ ] `AdminSeed__Email` (solo primer deploy)
- [ ] `AdminSeed__Password` (solo primer deploy)
- [ ] `NEXT_PUBLIC_API_URL`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `Cors__AllowedOrigins`

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"
**Causa:** Connection string incorrecto
**Solución:** Verificar formato y credenciales

### Error: "Stripe authentication failed"
**Causa:** Secret key incorrecta o expirada
**Solución:** Verificar key en Stripe Dashboard

### Error: "CORS policy blocked"
**Causa:** Frontend URL no en AllowedOrigins
**Solución:** Añadir URL correcta en backend

### Error: "JWT token invalid"
**Causa:** Secret diferente entre issuer y validator
**Solución:** Verificar mismo secret en ambos lados

### Error: "No admin user exists and AdminSeed settings are not configured"
**Causa:** Primera ejecución sin configurar variables AdminSeed
**Solución:** Configurar `AdminSeed__Email` y `AdminSeed__Password` en variables de entorno

---

**Última actualización:** Enero 2026  
**Mantener actualizado con cada nueva variable añadida**
