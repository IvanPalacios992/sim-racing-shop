# 🏎️ SimRacing Shop - E-commerce de Hardware Personalizado

Plataforma e-commerce especializada en hardware de sim racing personalizable con visor 3D interactivo.

## 🎯 Descripción del Proyecto

SimRacing Shop es una tienda online que permite a los usuarios configurar y comprar hardware de simulación de carreras totalmente personalizado. La plataforma incluye un visor 3D interactivo donde los clientes pueden personalizar colores, componentes y accesorios en tiempo real antes de realizar la compra.

## ✨ Características Principales

### Para Clientes
- 🛒 Catálogo de productos con filtros y búsqueda
- 🎨 Configurador 3D interactivo en tiempo real
- 💳 Múltiples métodos de pago (Stripe, PayPal, Bizum)
- 🌍 Soporte multiidioma (Español/Inglés)
- 📦 Cálculo automático de costes de envío por zonas
- 🔐 Área de usuario con historial de pedidos
- 🔗 URLs compartibles de configuraciones

### Para Administradores
- 📊 Panel de administración completo
- 🏭 Gestión de productos y componentes
- 📈 Dashboard con métricas de ventas
- 🔄 Control de estados de pedidos
- 📦 Gestión de stock e inventario
- 👥 Administración de usuarios

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI:** React 18 + Tailwind CSS + shadcn/ui
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
- **Database:** Supabase / Railway
- **CDN:** Cloudflare
- **Monitoring:** Sentry + Better Stack
- **CI/CD:** GitHub Actions

### Servicios Externos
- **Pagos:** Stripe
- **Email:** Resend
- **Analytics:** Google Analytics 4
- **Captcha:** hCaptcha

## 📁 Estructura del Proyecto

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

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js 20+
- .NET 10 SDK
- PostgreSQL 16
- Redis 7
- Docker (opcional, recomendado)

### Instalación con Docker

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sim-racing-shop.git
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
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/swagger

### Instalación Manual

Ver [docs/setup/local-development.md](docs/setup/local-development.md) para instrucciones detalladas.

## 📖 Documentación

- [**Guía de Inicio**](docs/setup/getting-started.md) - Configuración inicial
- [**Arquitectura del Sistema**](docs/architecture/system-architecture.md) - Visión general
- [**Diseño de Base de Datos**](docs/architecture/database-design.md) - Esquema y relaciones
- [**Roadmap MVP**](docs/project-management/mvp-roadmap.md) - Plan de desarrollo
- [**Stack Tecnológico**](docs/project-management/tech-stack.md) - Detalles técnicos
- [**Workflow Git**](docs/development/git-workflow.md) - Proceso de desarrollo
- [**Guía de Herramientas IA**](docs/development/ai-tools-guide.md) - Acelerar desarrollo

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

## 🔒 Variables de Entorno

Copia los archivos de ejemplo y configura tus credenciales:

```bash
# Frontend
cp frontend/.env.example frontend/.env.local

# Backend
cp backend/appsettings.example.json backend/appsettings.Development.json
```

Ver [docs/setup/environment-variables.md](docs/setup/environment-variables.md) para detalles completos.

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

Ver [docs/deployment/deployment-guide.md](docs/deployment/deployment-guide.md) para más información.

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

Ver [docs/project-management/mvp-roadmap.md](docs/project-management/mvp-roadmap.md) para detalles completos.

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Ver [docs/development/git-workflow.md](docs/development/git-workflow.md) para el proceso detallado.

## 📄 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados.

## 👥 Equipo

- **Desarrollo:** [Tu Nombre]
- **Arquitectura:** [Tu Nombre]
- **DevOps:** [Tu Nombre]

## 📞 Contacto

- Email: contact@simracingshop.com
- Website: https://simracingshop.com

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [.NET](https://dotnet.microsoft.com/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [shadcn/ui](https://ui.shadcn.com/)
- [Stripe](https://stripe.com/)

---

**⚠️ Nota:** Este es un proyecto en desarrollo activo. Para comenzar el desarrollo, consulta la [Guía de Inicio](docs/setup/getting-started.md).
