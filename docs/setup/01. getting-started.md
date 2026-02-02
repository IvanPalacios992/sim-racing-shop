# 🚀 Guía de Inicio Rápido

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

### Software Requerido

```bash
# Node.js 20+ y npm
node --version  # Debe ser v20.x.x o superior
npm --version   # Debe ser v10.x.x o superior

# .NET 10 SDK
dotnet --version  # Debe ser 10.0.x

# Git
git --version  # Cualquier versión reciente

# Docker y Docker Compose (recomendado)
docker --version
docker-compose --version
```

### Cuentas y Servicios (para desarrollo local)

- [ ] Cuenta GitHub (para repositorio)
- [ ] Cuenta Stripe (modo test) - [stripe.com](https://stripe.com)
- [ ] Cuenta Resend (tier gratuito) - [resend.com](https://resend.com)
- [ ] Cuenta Sentry (opcional, tier gratuito) - [sentry.io](https://sentry.io)

---

## 🎬 Opción 1: Setup Rápido con Docker (Recomendado)

La forma más rápida de poner el proyecto en marcha.

### Paso 1: Clonar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sim-racing-shop.git
cd sim-racing-shop
```

### Paso 2: Levantar Servicios con Docker

```bash
# Levantar PostgreSQL, Redis y Seq
docker-compose up -d

# Verificar que los contenedores están corriendo
docker-compose ps
```

Deberías ver:
- `postgres` - Running en puerto 5432
- `redis` - Running en puerto 6379
- `seq` - Running en puerto 5341 (UI en http://localhost:5341)

### Paso 3: Configurar Variables de Entorno

#### Backend

```bash
cd backend

# Copiar archivo de ejemplo
cp appsettings.example.json appsettings.Development.json

# Editar y configurar (usar tu editor favorito)
code appsettings.Development.json
```

Configuración mínima para desarrollo:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=simracing;Username=postgres;Password=postgres"
  },
  "Redis": {
    "Configuration": "localhost:6379"
  },
  "Jwt": {
    "Secret": "your-super-secret-key-change-this-min-32-characters",
    "Issuer": "SimRacingShop",
    "Audience": "SimRacingShop"
  },
  "Stripe": {
    "SecretKey": "sk_test_tu_clave_aqui",
    "WebhookSecret": ""
  },
  "Email": {
    "ApiKey": "re_tu_clave_resend",
    "FromEmail": "noreply@test.com"
  }
}
```

**Configurar User Secrets (recomendado para claves sensibles):**
```bash
dotnet user-secrets init
dotnet user-secrets set "Jwt:Secret" "your-super-secret-key-min-32-chars"
dotnet user-secrets set "Stripe:SecretKey" "sk_test_..."
dotnet user-secrets set "Email:ApiKey" "re_..."
```

#### Frontend

```bash
cd ../frontend

# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar con tus valores
code .env.local
```

Contenido mínimo:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_ENVIRONMENT=development

# Opcional para desarrollo
# NEXT_PUBLIC_SENTRY_DSN=
# NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

### Paso 4: Instalar Dependencias y Ejecutar Migraciones

#### Backend

```bash
cd backend

# Restaurar paquetes NuGet
dotnet restore

# Ejecutar migraciones para crear tablas
dotnet ef database update

# Opcional: Seed data de ejemplo
dotnet run --seed
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install
```

### Paso 5: Ejecutar el Proyecto

Abre **dos terminales**:

**Terminal 1 - Backend:**
```bash
cd backend
dotnet run

# O con hot reload:
dotnet watch run
```

Backend estará disponible en:
- API: http://localhost:5000
- Swagger: http://localhost:5000/swagger

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend estará disponible en:
- http://localhost:3000

### Paso 6: Verificar Instalación

1. **Abrir navegador:** http://localhost:3000
2. **Verificar home carga correctamente**
3. **Abrir Swagger:** http://localhost:5000/swagger
4. **Verificar endpoints disponibles**

**Test rápido:**
```bash
# Verificar API responde
curl http://localhost:5000/api/health

# Debería retornar: {"status":"healthy"}
```

### 🎉 ¡Listo! Tu entorno de desarrollo está funcionando.

---

## 🔧 Opción 2: Setup Manual (Sin Docker)

Si prefieres instalar servicios manualmente.

### Paso 1: Instalar PostgreSQL

**macOS (con Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16

# Crear base de datos
createdb simracing
```

**Windows:**
1. Descargar PostgreSQL 16 desde [postgresql.org](https://www.postgresql.org/download/)
2. Instalar con pgAdmin
3. Crear base de datos `simracing`

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql-16
sudo systemctl start postgresql

# Crear usuario y BD
sudo -u postgres createuser -s $USER
createdb simracing
```

### Paso 2: Instalar Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Windows:**
```bash
# Usar WSL2 o descargar desde:
# https://github.com/microsoftarchive/redis/releases
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

### Paso 3: Instalar Seq (Opcional, para logs)

```bash
# Con Docker (más fácil):
docker run -d --name seq -e ACCEPT_EULA=Y -p 5341:80 datalust/seq:latest

# O descarga standalone desde:
# https://datalust.co/download
```

### Paso 4: Continuar con Pasos 1, 3, 4, 5 y 6 de la Opción 1

---

## 📝 Comandos Útiles de Desarrollo

### Backend (.NET)

```bash
# Ejecutar con hot reload
dotnet watch run

# Ejecutar tests
dotnet test

# Crear nueva migración
dotnet ef migrations add NombreDeLaMigracion

# Aplicar migraciones
dotnet ef database update

# Revertir última migración
dotnet ef database update PreviousMigration

# Eliminar BD y recrear
dotnet ef database drop
dotnet ef database update

# Generar clases desde BD (reverse engineer)
dotnet ef dbcontext scaffold "ConnectionString" Npgsql.EntityFrameworkCore.PostgreSQL

# Ver user secrets
dotnet user-secrets list

# Compilar en Release
dotnet build -c Release

# Publicar para deploy
dotnet publish -c Release -o ./publish
```

### Frontend (Next.js)

```bash
# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar compilado (producción)
npm start

# Ejecutar linter
npm run lint

# Formatear código con Prettier
npm run format

# Ejecutar tests unitarios
npm run test

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests E2E
npm run test:e2e

# Ejecutar Playwright con UI
npx playwright test --ui

# Type checking
npm run type-check

# Analizar bundle
npm run analyze
```

### Docker Compose

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f postgres

# Parar servicios
docker-compose stop

# Parar y eliminar contenedores
docker-compose down

# Eliminar volúmenes también (⚠️ borra datos)
docker-compose down -v

# Reconstruir imágenes
docker-compose build

# Reiniciar un servicio
docker-compose restart postgres
```

### Git (flujo recomendado)

```bash
# Crear feature branch
git checkout -b feature/nombre-feature

# Hacer cambios y commit
git add .
git commit -m "feat: descripción del cambio"

# Push a GitHub
git push origin feature/nombre-feature

# Actualizar desde main
git checkout main
git pull
git checkout feature/nombre-feature
git rebase main

# Merge a develop
git checkout develop
git merge feature/nombre-feature
git push
```

---

## 🧪 Verificación de Setup

### Checklist de Verificación

Ejecuta estos comandos para verificar que todo funciona:

```bash
# ✅ Node.js y npm
node --version
npm --version

# ✅ .NET
dotnet --version

# ✅ Docker (si usas)
docker --version
docker-compose ps

# ✅ PostgreSQL
psql -U postgres -d simracing -c "SELECT version();"

# ✅ Redis
redis-cli ping  # Debe retornar PONG

# ✅ Backend corre
curl http://localhost:5000/api/health

# ✅ Frontend corre
curl http://localhost:3000
```

### Tests de Integración

```bash
# Backend - correr todos los tests
cd backend
dotnet test

# Frontend - correr tests unitarios
cd frontend
npm test

# Frontend - correr tests E2E (requiere app corriendo)
npm run test:e2e
```

---

## 🐛 Troubleshooting Común

### Problema: "No se puede conectar a PostgreSQL"

**Síntomas:**
```
Npgsql.NpgsqlException: Connection refused
```

**Soluciones:**
1. Verificar que PostgreSQL está corriendo:
   ```bash
   # Docker:
   docker-compose ps
   
   # Local:
   brew services list  # macOS
   systemctl status postgresql  # Linux
   ```

2. Verificar puerto correcto (5432 por defecto)

3. Verificar credenciales en `appsettings.Development.json`

4. Verificar firewall no está bloqueando

### Problema: "Cannot find module 'next'"

**Síntomas:**
```
Error: Cannot find module 'next'
```

**Solución:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Problema: Migraciones fallan

**Síntomas:**
```
A connection could not be made to the database
```

**Soluciones:**
1. Verificar PostgreSQL está corriendo
2. Verificar connection string correcto
3. Intentar eliminar carpeta `Migrations` y recrear:
   ```bash
   rm -rf Migrations
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

### Problema: Puertos en uso

**Síntomas:**
```
Address already in use
```

**Solución:**
```bash
# Encontrar proceso usando el puerto (ejemplo 3000)
# macOS/Linux:
lsof -i :3000
kill -9 <PID>

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# O cambiar puerto en .env:
# Frontend:
PORT=3001 npm run dev

# Backend (en Properties/launchSettings.json)
```

### Problema: CORS errors en frontend

**Síntomas:**
```
Access to fetch blocked by CORS policy
```

**Solución:**
Verificar en `backend/Program.cs` que CORS permite localhost:3000:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Development", builder =>
    {
        builder.WithOrigins("http://localhost:3000")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});
```

### Problema: Modelos 3D no cargan

**Síntomas:**
- Visor 3D muestra pantalla en blanco
- Error en consola sobre CORS o archivo no encontrado

**Soluciones:**
1. Verificar que archivos .glb están en `/public/models`
2. Verificar permisos de lectura
3. Verificar ruta en código (case-sensitive)
4. Verificar tamaño archivo < 10MB
5. Verificar formato es GLB válido

### Problema: Stripe test no funciona

**Síntomas:**
- Error al procesar pago

**Soluciones:**
1. Verificar usas claves de **test mode**:
   - `pk_test_...` (publishable)
   - `sk_test_...` (secret)
2. Usar tarjeta de test: `4242 4242 4242 4242`
3. Verificar webhook secret está vacío en desarrollo
4. Ver logs en Stripe Dashboard

---

## 📚 Próximos Pasos

Ahora que tienes el entorno funcionando:

1. **Lee la documentación:**
   - [Tech Stack](./tech-stack.md) - Entender tecnologías usadas
   - [MVP Roadmap](./mvp-roadmap.md) - Plan de desarrollo
   - [Feature Requirements](./feature-requirements.md) - Requisitos funcionales

2. **Explora el código:**
   - `/frontend/src/app` - Páginas Next.js
   - `/frontend/src/components` - Componentes React
   - `/backend/src/API/Controllers` - Controllers de la API
   - `/backend/src/Core` - Lógica de negocio

3. **Crea tu primer feature:**
   - Sigue el [Git Workflow](./git-workflow.md)
   - Crea un branch: `git checkout -b feature/mi-feature`
   - Haz tus cambios
   - Abre un Pull Request

4. **Usa herramientas IA:**
   - Lee [AI Tools Guide](./ai-tools-guide.md)
   - Configura Cursor/Copilot para acelerar desarrollo

5. **Ejecuta tests:**
   - Backend: `dotnet test`
   - Frontend: `npm test`
   - E2E: `npm run test:e2e`

---

## 🆘 Necesitas Ayuda?

- **Documentación:** Revisa la carpeta `/docs`
- **Issues conocidos:** Busca en GitHub Issues
- **Pregunta:** Abre un GitHub Discussion
- **Bug:** Abre un GitHub Issue con template

---

## ✅ Checklist Final de Setup

Antes de empezar a desarrollar, verifica:

- [ ] Node.js 20+ instalado
- [ ] .NET 10 instalado
- [ ] PostgreSQL corriendo (Docker o local)
- [ ] Redis corriendo (Docker o local)
- [ ] Variables de entorno configuradas
- [ ] Migraciones aplicadas (BD creada)
- [ ] Backend corre en localhost:5000
- [ ] Frontend corre en localhost:3000
- [ ] Swagger accesible en localhost:5000/swagger
- [ ] Tests backend pasan
- [ ] Tests frontend pasan
- [ ] Puedes registrarte/login
- [ ] Puedes ver productos de ejemplo

**¡Si todo está ✅, estás listo para desarrollar!** 🚀

---

**Última actualización:** Enero 2026  
**Mantenido por:** Equipo de desarrollo
