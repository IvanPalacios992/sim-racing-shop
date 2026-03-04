# 🏎️ SimRacing Shop - E-commerce de hardware personalizado

Plataforma e-commerce especializada en hardware de sim racing personalizable con visor 3D interactivo.

## 🎯 Descripción del proyecto

SimRacing Shop es una tienda online que permite a los usuarios configurar y comprar hardware de simulación de carreras totalmente personalizado. La plataforma incluye un visor 3D interactivo donde los clientes pueden personalizar colores, componentes y accesorios en tiempo real antes de realizar la compra.

## ✨ Características principales

### Para clientes
- 🛒 Catálogo de productos con filtros y búsqueda
- 🎨 Configurador 3D interactivo en tiempo real
- 💳 Múltiples métodos de pago (Stripe, PayPal, Bizum)
- 🌍 Soporte multiidioma (Español/Inglés)
- 📦 Cálculo automático de costes de envío por zonas
- 🔐 Área de usuario con historial de pedidos
- 🔗 URLs compartibles de configuraciones

### Para administradores
- 📊 Panel de administración completo
- 🏭 Gestión de productos y componentes
- 📈 Dashboard con métricas de ventas
- 🔄 Control de estados de pedidos
- 📦 Gestión de stock e inventario
- 👥 Administración de usuarios

## 🛠️ Stack tecnológico

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS + shadcn/ui
- **3D:** React Three Fiber + Drei
- **State:** Zustand
- **i18n:** next-intl
- **Forms:** React Hook Form + Zod

### Backend
- **Framework:** .NET 10 Web API
- **ORM:** Entity Framework Core
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Auth:** JWT + ASP.NET Identity

### Infraestructura
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Railway
- **Database:** Railway
- **CDN:** Cloudflare
- **Monitoring:** Sentry + Better Stack
- **CI/CD:** GitHub Actions

### Servicios externos
- **Pagos:** Stripe
- **Email:** Resend
- **Analytics:** Google Analytics 4
- **Captcha:** hCaptcha

## 📁 Estructura del proyecto

```
sim-racing-shop/
├── frontend/               # Aplicación Next.js
│   ├── src/
│   │   ├── app/           # App Router (páginas)
│   │   ├── components/    # Componentes reutilizables
│   │   ├── lib/           # Utilidades y configuración
│   │   └── stores/        # Estado global (Zustand)
│   ├── public/            # Assets estáticos
│   └── tests/             # Tests E2E y unitarios
│
├── backend/               # API .NET
│   ├── src/
│   │   ├── API/          # Controllers y configuración
│   │   ├── Core/         # Entidades y lógica de negocio
│   │   ├── Infrastructure/ # EF Core, repositorios
│   │   └── Services/     # Servicios de aplicación
│   └── tests/            # Tests unitarios e integración
│
├── docs/                  # Documentación del proyecto
├── infrastructure/        # IaC y scripts de deployment
└── .github/              # Workflows de CI/CD
```

## 🚀 Inicio rápido

### Prerequisitos
- Node.js 20+
- .NET 10 SDK
- PostgreSQL 16
- Redis 7
- Docker (opcional, recomendado)

### Instalación con Docker

```bash
# Clonar el repositorio
git clone https://github.com/IvanPalacios992/sim-racing-shop.git
cd sim-racing-shop

# Levantar servicios con Docker Compose
docker-compose up -d

# Instalar dependencias frontend
cd frontend
npm install

# Instalar dependencias backend
cd ../backend
dotnet restore

# Ejecutar migraciones
dotnet ef database update

# Iniciar desarrollo
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && dotnet run
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: https://localhost:7002
- API Docs: https://localhost:7002/swagger

## 📖 Documentación

- [**Guía de Inicio**](docs/setup/01.%20getting-started.md) - Configuración inicial
- [**Arquitectura del Sistema**](docs/architecture/01.%20system-architecture.md) - Visión general
- [**Diseño de Base de Datos**](docs/architecture/02.%20database-design.md) - Esquema y relaciones
- [**Roadmap MVP**](docs/project-management/05.%20mvp-roadmap.md) - Plan de desarrollo
- [**Stack Tecnológico**](docs/project-management/03.%20tech-stack.md) - Detalles técnicos
- [**Workflow Git**](docs/development/02.%20git-workflow.md) - Proceso de desarrollo
- [**Guía de Herramientas IA**](docs/development/03.%20ai-tools-guide.md) - Acelerar desarrollo

## 🧪 Testing

```bash
# Frontend - Tests unitarios
cd frontend
npm run test

# Frontend - Tests E2E
npm run test:e2e

# Backend - Tests unitarios
cd backend
dotnet test

# Backend - Tests con coverage
dotnet test --collect:"XPlat Code Coverage"
```

## 🔒 Variables de entorno

Copia los archivos de ejemplo y configura tus credenciales:

```bash
# Frontend
cp frontend/.env.example frontend/.env.local

# Backend
cp backend/appsettings.example.json backend/appsettings.Development.json
```

Ver [docs/setup/environment-variables.md](docs/setup/02.%20environment-variables.md) para detalles completos.

## 🚢 Deployment

### Staging (automático en push a `develop`)
```bash
git push origin develop
```

### Production (manual con aprobación)
```bash
git push origin main
# Requiere aprobación en GitHub
```

Ver [docs/deployment/deployment-guide.md](docs/deployment/01.%20deplyment-guide.md) para más información.

## 📊 Roadmap

### ✅ MVP (Mes 1)
- Catálogo de productos
- Configurador 3D
- Checkout con Stripe
- Panel de administración básico
- Multiidioma (ES/EN)

### 🔄 Fase 2 (Mes 2-3)
- PayPal y Bizum
- Sistema de cupones
- Newsletter
- Blog SEO
- Métricas avanzadas

### 🔮 Futuro
- App móvil nativa
- Reviews y valoraciones
- Chat en vivo
- Programa de afiliados
- Marketplace multi-vendedor

Ver [docs/project-management/mvp-roadmap.md](docs/project-management/05.%20mvp-roadmap.md) para detalles completos.

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Ver [docs/development/git-workflow.md](docs/development/02.%20git-workflow.md) para el proceso detallado.

## 📄 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados.
