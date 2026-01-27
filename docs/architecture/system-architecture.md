# 🏗️ Arquitectura del Sistema

## 📋 Visión General

SimRacing Shop es una aplicación e-commerce moderna construida con arquitectura de microservicios frontend-backend, optimizada para personalización de productos 3D.

### Características Arquitectónicas Clave

- **Separación Frontend/Backend:** Desacoplamiento total
- **API RESTful:** Comunicación stateless
- **Single Page Application:** Navegación sin recargas
- **Server-Side Rendering:** SEO y performance
- **Caché distribuido:** Redis para performance
- **Event-driven:** Webhooks para pagos

---

## 🎨 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                          INTERNET                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Cloudflare CDN     │
              │  - DDoS Protection   │
              │  - SSL/TLS           │
              │  - Edge Caching      │
              └──────────┬───────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                  │
        ▼                                  ▼
┌───────────────────┐            ┌────────────────────┐
│   FRONTEND        │            │   BACKEND          │
│   (Vercel)        │◄──────────►│   (Railway)        │
│                   │   REST API │                    │
│  Next.js 15       │            │  .NET 10 Web API   │
│  React 18         │            │  ASP.NET Core      │
│  Tailwind CSS     │            │                    │
│  R3F (3D)         │            │  ┌──────────────┐  │
│                   │            │  │ Controllers  │  │
│  Pages:           │            │  ├──────────────┤  │
│  - Home           │            │  │  Services    │  │
│  - Products       │            │  ├──────────────┤  │
│  - 3D Config      │            │  │ Repositories │  │
│  - Checkout       │            │  └──────────────┘  │
│  - Admin          │            │                    │
└─────────┬─────────┘            └──────────┬─────────┘
          │                                  │
          │                                  ├──────────┐
          │                                  │          │
          ▼                                  ▼          ▼
┌──────────────────┐              ┌──────────────────────────┐
│  Vercel Blob     │              │    PostgreSQL 16         │
│  (Storage)       │              │    (Supabase/Railway)    │
│                  │              │                          │
│  - Modelos 3D    │              │  Tables:                 │
│  - Imágenes      │              │  - users                 │
│  - Assets        │              │  - products              │
└──────────────────┘              │  - orders                │
                                  │  - components            │
                                  │  - configurations        │
                                  └──────────┬───────────────┘
                                             │
                                  ┌──────────▼───────────────┐
                                  │    Redis 7               │
                                  │    (Upstash)             │
                                  │                          │
                                  │  Cache:                  │
                                  │  - Product catalog       │
                                  │  - User sessions         │
                                  │  - API rate limiting     │
                                  └──────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     SERVICIOS EXTERNOS                           │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│   Stripe     │   Resend     │   Sentry     │  Google Analytics │
│  (Pagos)     │  (Email)     │  (Errors)    │  (Analytics)      │
└──────────────┴──────────────┴──────────────┴───────────────────┘
```

---

## 🎯 Arquitectura Frontend (Next.js)

### Estructura de Capas

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Pages, Components, UI)            │
│                                     │
│  /app                               │
│  ├── (auth)                         │
│  ├── productos/[slug]               │
│  ├── checkout                       │
│  └── admin                          │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Business Logic Layer          │
│  (Hooks, Context, Stores)           │
│                                     │
│  /lib                               │
│  /hooks                             │
│  /stores (Zustand)                  │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Data Access Layer             │
│  (API Clients, Services)            │
│                                     │
│  /lib/api                           │
│  /services                          │
└─────────────────┬───────────────────┘
                  │
                  ▼
         Backend REST API
```

### Estructura de Directorios

```
frontend/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── (auth)/            # Grupo de rutas auth
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── productos/
│   │   │   ├── page.tsx       # Listado
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Detalle con 3D
│   │   ├── carrito/
│   │   ├── checkout/
│   │   ├── cuenta/
│   │   ├── admin/
│   │   │   ├── pedidos/
│   │   │   └── productos/
│   │   └── layout.tsx         # Root layout
│   │
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # shadcn/ui components
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── Product3DViewer.tsx
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Navbar.tsx
│   │
│   ├── lib/                   # Utilidades y configuración
│   │   ├── api.ts            # Axios instance configurado
│   │   ├── auth.ts           # Helpers de autenticación
│   │   ├── utils.ts          # Utilidades generales
│   │   └── validations/      # Schemas de Zod
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useProducts.ts
│   │   └── use3DViewer.ts
│   │
│   ├── stores/                # Zustand stores
│   │   ├── authStore.ts
│   │   ├── cartStore.ts
│   │   └── configStore.ts
│   │
│   ├── types/                 # TypeScript types
│   │   ├── product.ts
│   │   ├── user.ts
│   │   └── order.ts
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── models/               # Modelos 3D (.glb)
│   └── images/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

### Flujo de Datos

```
User Action
    ↓
Component (React)
    ↓
Event Handler
    ↓
Store Update (Zustand) ←──────┐
    ↓                          │
API Call (axios)               │
    ↓                          │
Backend API                    │
    ↓                          │
Response                       │
    ↓                          │
Store Update ──────────────────┘
    ↓
Re-render Component
    ↓
UI Update
```

---

## ⚙️ Arquitectura Backend (.NET)

### Clean Architecture - Capas

```
┌─────────────────────────────────────────────────┐
│              API Layer                          │
│  (Controllers, Middleware, Filters)             │
│                                                 │
│  - HTTP Endpoints                               │
│  - Request/Response DTOs                        │
│  - Authentication/Authorization                 │
│  - Error Handling                               │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│           Application Layer                     │
│  (Services, Use Cases, Business Logic)          │
│                                                 │
│  - OrderService                                 │
│  - PaymentService                               │
│  - EmailService                                 │
│  - ValidationService                            │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              Domain Layer                       │
│  (Entities, Value Objects, Domain Logic)        │
│                                                 │
│  - Product, Order, User entities                │
│  - Business rules                               │
│  - Domain events                                │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│          Infrastructure Layer                   │
│  (Data Access, External Services)               │
│                                                 │
│  - EF Core DbContext                            │
│  - Repositories                                 │
│  - External API clients (Stripe, Resend)        │
│  - Cache (Redis)                                │
└─────────────────────────────────────────────────┘
```

### Estructura de Directorios

```
backend/
├── src/
│   ├── SimRacingShop.API/           # Web API Project
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── ProductsController.cs
│   │   │   ├── OrdersController.cs
│   │   │   └── AdminController.cs
│   │   ├── Middleware/
│   │   │   ├── ErrorHandlingMiddleware.cs
│   │   │   └── RateLimitingMiddleware.cs
│   │   ├── Filters/
│   │   │   └── ValidationFilter.cs
│   │   ├── Program.cs
│   │   └── Startup.cs
│   │
│   ├── SimRacingShop.Core/          # Domain + Application
│   │   ├── Entities/
│   │   │   ├── Product.cs
│   │   │   ├── Order.cs
│   │   │   ├── User.cs
│   │   │   └── Component.cs
│   │   ├── DTOs/
│   │   │   ├── ProductDto.cs
│   │   │   ├── OrderDto.cs
│   │   │   └── CreateOrderDto.cs
│   │   ├── Interfaces/
│   │   │   ├── IProductRepository.cs
│   │   │   ├── IOrderService.cs
│   │   │   └── IEmailService.cs
│   │   ├── Services/
│   │   │   ├── OrderService.cs
│   │   │   ├── PaymentService.cs
│   │   │   └── EmailService.cs
│   │   └── Validators/
│   │       └── CreateOrderValidator.cs
│   │
│   └── SimRacingShop.Infrastructure/ # Data Access
│       ├── Data/
│       │   ├── ApplicationDbContext.cs
│       │   ├── Configurations/
│       │   │   ├── ProductConfiguration.cs
│       │   │   └── OrderConfiguration.cs
│       │   └── Migrations/
│       ├── Repositories/
│       │   ├── ProductRepository.cs
│       │   ├── OrderRepository.cs
│       │   └── GenericRepository.cs
│       ├── Services/
│       │   ├── StripeService.cs
│       │   ├── ResendEmailService.cs
│       │   └── RedisCacheService.cs
│       └── DependencyInjection.cs
│
└── tests/
    ├── SimRacingShop.UnitTests/
    ├── SimRacingShop.IntegrationTests/
    └── SimRacingShop.PerformanceTests/
```

### Request Pipeline

```
HTTP Request
    ↓
ASP.NET Core Pipeline
    ↓
Middleware Stack:
  1. Exception Handler
  2. HTTPS Redirection
  3. CORS
  4. Authentication
  5. Rate Limiting
  6. Logging
    ↓
Routing
    ↓
Controller
    ↓
Model Binding & Validation
    ↓
Authorization Filter
    ↓
Action Method
    ↓
Service Layer
    ↓
Repository Layer
    ↓
Database / External Services
    ↓
Response
    ↓
Response Formatting (JSON)
    ↓
HTTP Response
```

---

## 🗄️ Arquitectura de Datos

### Modelo de Dominio (Simplificado)

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────┐     N:M      ┌──────────────┐
│     Order       │◄─────────────►│   Product    │
│                 │                └──────┬───────┘
│ - id            │                       │
│ - user_id       │                       │ 1:N
│ - total         │                       │
│ - status        │                ┌──────▼──────────┐
└──────┬──────────┘                │   Component     │
       │                           │                 │
       │ 1:N                       │ - id            │
       │                           │ - sku           │
┌──────▼──────────┐                │ - stock         │
│   OrderItem     │                └─────────────────┘
│                 │
│ - order_id      │                ┌──────────────────┐
│ - product_id    │                │  Saved Config    │
│ - config_id     │◄──────────────►│                  │
│ - quantity      │       1:1      │ - share_token    │
└─────────────────┘                │ - config_json    │
                                   └──────────────────┘
```

### Flujo de Datos - Crear Pedido

```
1. Frontend: User clicks "Finalizar Compra"
                    ↓
2. Validation: Validate cart, address, payment
                    ↓
3. API Call: POST /api/orders
                    ↓
4. Backend: OrderService.CreateOrder()
                    ↓
5. Validate Stock: Check component availability
                    ↓
6. Create Order: Save to database (pending)
                    ↓
7. Process Payment: Stripe API call
                    ↓
8. Webhook Received: payment_intent.succeeded
                    ↓
9. Update Order: Status = paid
                    ↓
10. Deduct Stock: Update component quantities
                    ↓
11. Send Email: Order confirmation
                    ↓
12. Response: Return order details to frontend
                    ↓
13. Redirect: User to confirmation page
```

---

## 🔄 Patrones de Integración

### Stripe Payment Flow

```
Frontend                Backend              Stripe
   │                       │                    │
   │ 1. Create Intent      │                    │
   ├──────────────────────►│                    │
   │                       │ 2. Create          │
   │                       ├───────────────────►│
   │                       │ 3. client_secret   │
   │                       │◄───────────────────┤
   │ 4. client_secret      │                    │
   │◄──────────────────────┤                    │
   │                       │                    │
   │ 5. Confirm Payment    │                    │
   ├──────────────────────────────────────────►│
   │                       │                    │
   │                       │ 6. Webhook         │
   │                       │◄───────────────────┤
   │                       │ 7. Update Order    │
   │                       │                    │
   │ 8. Success Response   │                    │
   │◄──────────────────────────────────────────┤
   │                       │                    │
```

### Email Notifications

```
Trigger Event
    ↓
Backend Service
    ↓
EmailService.SendAsync()
    ↓
Queue Email (optional)
    ↓
Resend API
    ↓
Email Delivered
    ↓
Log Success/Failure
```

---

## 🚀 Deployment Architecture

### Environments

```
┌──────────────────────────────────────────────┐
│           DEVELOPMENT                         │
│  - Local machine                              │
│  - Docker Compose (PG, Redis, Seq)           │
│  - Frontend: localhost:3000                   │
│  - Backend: localhost:5000                    │
│  - Hot reload enabled                         │
└──────────────────────────────────────────────┘
                    │
                    │ git push to develop
                    ↓
┌──────────────────────────────────────────────┐
│            STAGING                            │
│  - Vercel Preview (frontend)                 │
│  - Railway Preview (backend)                 │
│  - Test database (Supabase)                  │
│  - Stripe test mode                          │
│  - Auto-deploy on PR                         │
└──────────────────────────────────────────────┘
                    │
                    │ Merge to main (after approval)
                    ↓
┌──────────────────────────────────────────────┐
│           PRODUCTION                          │
│  - Vercel (frontend)                         │
│  - Railway (backend)                         │
│  - Supabase (database)                       │
│  - Upstash (Redis)                           │
│  - Stripe live mode                          │
│  - Monitoring: Sentry + Better Stack         │
└──────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
GitHub Push
    ↓
GitHub Actions
    ↓
┌───────────────────────┐
│   Build & Test        │
│  - Restore deps       │
│  - Compile            │
│  - Run tests          │
│  - Lint               │
│  - Type check         │
└─────────┬─────────────┘
          │
    ✅ Success
          │
          ├─────────────────┬──────────────────┐
          ↓                 ↓                  ↓
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │   Vercel     │  │   Railway    │  │   Sentry     │
  │   Deploy     │  │   Deploy     │  │   Release    │
  └──────────────┘  └──────────────┘  └──────────────┘
          │                 │                  │
          └─────────────────┴──────────────────┘
                            │
                      ✅ Deployed
                            │
                    Health Checks
                            │
                    Smoke Tests
```

---

## 🔒 Seguridad en la Arquitectura

### Capas de Seguridad

```
┌─────────────────────────────────────────────┐
│         Layer 1: Network                    │
│  - Cloudflare DDoS Protection               │
│  - WAF (opcional)                           │
│  - HTTPS/TLS 1.3                            │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Layer 2: Application                │
│  - CORS (dominios específicos)              │
│  - Rate Limiting (100 req/min)              │
│  - CSRF Protection                          │
│  - XSS Protection Headers                   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Layer 3: Authentication             │
│  - JWT with HttpOnly cookies                │
│  - 2FA for admins (TOTP)                    │
│  - Password hashing (PBKDF2)                │
│  - Token expiration & refresh               │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Layer 4: Authorization              │
│  - Role-based access control                │
│  - Resource-level permissions               │
│  - Admin-only endpoints                     │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Layer 5: Data                       │
│  - SQL injection prevention (EF Core)       │
│  - Input validation (FluentValidation)      │
│  - Output encoding                          │
│  - Encrypted connections (SSL)              │
└─────────────────────────────────────────────┘
```

---

## 📊 Monitoreo y Observabilidad

### Stack de Monitoreo

```
┌─────────────────────────────────────────────┐
│         Application Metrics                  │
│                                             │
│  Frontend:                                  │
│  - Vercel Analytics (Web Vitals)           │
│  - Sentry (Error tracking)                 │
│  - Google Analytics (User behavior)        │
│                                             │
│  Backend:                                   │
│  - Sentry (Errors + Performance)           │
│  - Serilog (Structured logs)               │
│  - Better Stack (Log aggregation)          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Infrastructure Metrics              │
│                                             │
│  - Vercel Dashboard (Bandwidth, builds)    │
│  - Railway Metrics (CPU, RAM, requests)    │
│  - Upstash Dashboard (Redis usage)         │
│  - Supabase (DB connections, queries)      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│            Alerting                         │
│                                             │
│  - Sentry: Error rate > 1%                 │
│  - UptimeRobot: Service down               │
│  - Better Stack: Critical logs             │
│  - Email/Slack notifications               │
└─────────────────────────────────────────────┘
```

### Logging Strategy

```
Log Levels:
┌────────────────────────────────────────┐
│  Verbose  → Dev only, muy detallado   │
│  Debug    → Dev/Staging               │
│  Info     → Eventos importantes        │
│  Warning  → Situaciones anormales      │
│  Error    → Errores manejados          │
│  Fatal    → Errores críticos           │
└────────────────────────────────────────┘

Log Targets:
- Console (siempre)
- File (rotating, 7 days retention)
- Seq/Better Stack (staging/production)
- Sentry (errors only)
```

---

## 🎯 Decisiones Arquitectónicas Clave

### 1. Monorepo vs Multi-repo

**Decisión:** Monorepo

**Razones:**
- ✅ Equipo pequeño (1 persona)
- ✅ Commits atómicos (frontend + backend)
- ✅ Versionado sincronizado
- ✅ Más simple de gestionar

---

### 2. Server-Side Rendering (SSR) vs Static

**Decisión:** Híbrido (SSR + ISR)

**Razones:**
- ✅ SEO crítico para e-commerce
- ✅ ISR para páginas de producto (regenerar cada hora)
- ✅ SSR para páginas dinámicas (checkout, admin)
- ✅ Static para páginas sin cambios (legal)

---

### 3. State Management: Zustand vs Redux

**Decisión:** Zustand

**Razones:**
- ✅ Menos boilerplate
- ✅ Más simple para equipo pequeño
- ✅ Performance similar
- ✅ TypeScript excelente
- ❌ Redux sería overkill

---

### 4. Database: SQL vs NoSQL

**Decisión:** PostgreSQL (SQL)

**Razones:**
- ✅ Relaciones complejas (products, orders, components)
- ✅ ACID transactions críticas (pagos, stock)
- ✅ Madurez y estabilidad
- ✅ JSONB para flexibilidad donde se necesita
- ❌ NoSQL no aporta ventajas aquí

---

### 5. Authentication: Session vs JWT

**Decisión:** JWT con refresh tokens

**Razones:**
- ✅ Stateless (escala mejor)
- ✅ API REST puro
- ✅ Funciona bien con SPA
- ✅ Mobile-ready (futuro)
- ⚠️ HttpOnly cookies para seguridad

---

### 6. Cache Strategy

**Decisión:** Redis + CDN

**Razones:**
- ✅ Redis para datos dinámicos (catálogo, sesiones)
- ✅ CDN para assets estáticos (modelos 3D, imágenes)
- ✅ ISR de Next.js como caché adicional
- ✅ Arquitectura de cacheo en capas

---

## 📈 Escalabilidad

### Escalado Horizontal

```
Current (MVP):
┌──────────┐      ┌──────────┐
│ Frontend │      │ Backend  │
│  1 inst  │      │  1 inst  │
└──────────┘      └──────────┘

Future (> 1000 pedidos/mes):
┌──────────┐      ┌──────────┐
│ Frontend │      │ Backend  │
│ (Vercel) │      │   ×3     │
│  Edge    │      │  inst    │
└──────────┘      └──────────┘
                       │
                  Load Balancer
```

### Puntos de Escalado

1. **Backend:** Railway auto-scaling o múltiples instancias
2. **Database:** 
   - Connection pooling (ya implementado)
   - Read replicas (futuro)
   - Sharding por región (muy futuro)
3. **Cache:** Upstash Redis escala automático
4. **CDN:** Cloudflare ya es global
5. **Storage:** Vercel Blob o migrar a S3

### Bottlenecks Potenciales

```
1. Database queries
   Solución: Índices, query optimization, caching

2. Modelos 3D pesados
   Solución: LOD, compresión, lazy loading

3. Email sending
   Solución: Queue (futuro), batch processing

4. Admin dashboard queries
   Solución: Materialized views, caching
```

---

## 🔄 Evolución Futura

### Fase 2: Microservicios (Solo si > 10K pedidos/mes)

```
                    API Gateway
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
   │ Product │     │  Order  │     │ Payment │
   │ Service │     │ Service │     │ Service │
   └─────────┘     └─────────┘     └─────────┘
        │                │                │
        └────────────────┴────────────────┘
                         │
                  Message Queue
                    (RabbitMQ)
```

**Solo considerar si:**
- Equipo > 3 desarrolladores
- Volumen > 10K pedidos/mes
- Necesidad de deploy independiente
- Complejidad justifica overhead

---

## 📚 Referencias y Recursos

### Patrones Arquitectónicos
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Microsoft .NET Architecture Guide](https://docs.microsoft.com/en-us/dotnet/architecture/)
- [Next.js Architecture](https://nextjs.org/docs/architecture)

### Best Practices
- [12 Factor App](https://12factor.net/)
- [API Design Best Practices](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design)
- [React Architecture Patterns](https://www.patterns.dev/)

---

## 📋 Glosario

- **ISR:** Incremental Static Regeneration
- **SSR:** Server-Side Rendering
- **CDN:** Content Delivery Network
- **JWT:** JSON Web Token
- **CORS:** Cross-Origin Resource Sharing
- **CSRF:** Cross-Site Request Forgery
- **XSS:** Cross-Site Scripting
- **WAF:** Web Application Firewall
- **LOD:** Level of Detail
- **ACID:** Atomicity, Consistency, Isolation, Durability

---

**Última actualización:** Enero 2026  
**Versión:** 1.0  
**Revisar después de:** MVP launch
