# 🛠️ Stack Tecnológico Detallado

## 📊 Visión General

```
Frontend (Next.js)  ←→  Backend (.NET)  ←→  PostgreSQL
       ↓                      ↓                  ↓
   Vercel              Railway/Render       Supabase
       ↓                      ↓
   Cloudflare CDN         Redis (Upstash)
```

## 🎨 Frontend Stack

### Core Framework

**Next.js 15.1 (App Router)**
```json
{
  "version": "^15.1.0",
  "features": [
    "App Router (no Pages Router)",
    "Server Components",
    "Server Actions",
    "Streaming SSR",
    "ISR (Incremental Static Regeneration)",
    "Image Optimization",
    "Font Optimization"
  ],
  "reasoning": "Mejor framework React para e-commerce. SEO excelente, performance superior, developer experience optimal."
}
```

**React 18**
```json
{
  "version": "^18.3.0",
  "features": [
    "Concurrent rendering",
    "Suspense",
    "Error boundaries",
    "Hooks"
  ]
}
```

### UI y Styling

**Tailwind CSS**
```json
{
  "version": "^3.4.0",
  "plugins": ["@tailwindcss/forms", "@tailwindcss/typography"],
  "reasoning": "Utility-first, rápido desarrollo, excelente con shadcn/ui"
}
```

**shadcn/ui**
```json
{
  "components": [
    "Dialog", "Dropdown", "Select", "Toast", 
    "Button", "Input", "Card", "Tabs"
  ],
  "reasoning": "Componentes accesibles, customizables, sin overhead de librerías pesadas"
}
```

**Lucide React**
```json
{
  "version": "^0.344.0",
  "reasoning": "Iconos modernos, tree-shakeable, ligeros"
}
```

### Visualización 3D

**React Three Fiber**
```json
{
  "version": "^8.15.0",
  "description": "React renderer para Three.js",
  "reasoning": "Integración nativa con React, declarativo, mejor DX que Three.js vanilla"
}
```

**@react-three/drei**
```json
{
  "version": "^9.92.0",
  "features": [
    "OrbitControls",
    "Environment",
    "ContactShadows",
    "useGLTF",
    "Html (3D labels)",
    "PresentationControls"
  ],
  "reasoning": "Helpers esenciales, reduce boilerplate, optimizado"
}
```

**@react-three/postprocessing**
```json
{
  "version": "^2.15.0",
  "optional": true,
  "features": ["Bloom", "SSAO", "DepthOfField"],
  "reasoning": "Efectos visuales premium si se necesitan"
}
```

**Three.js**
```json
{
  "version": "^0.160.0",
  "note": "Peer dependency de R3F",
  "features": ["GLB/GLTF loading", "PBR materials", "Lighting"]
}
```

### State Management

**Zustand**
```json
{
  "version": "^4.4.0",
  "usage": ["Carrito", "Configurador 3D", "Usuario"],
  "reasoning": "Simple, ligero (3KB), sin boilerplate. Ideal para tiendas pequeñas/medianas."
}
```

Alternativas descartadas:
- Redux: Demasiado boilerplate para el alcance
- Context API: Performance issues con updates frecuentes
- Jotai/Recoil: Innecesariamente atómico para nuestro caso

### Formularios y Validación

**React Hook Form**
```json
{
  "version": "^7.49.0",
  "reasoning": "Mejor performance, menos re-renders, API simple"
}
```

**Zod**
```json
{
  "version": "^3.22.0",
  "reasoning": "Type-safe validation, integración perfecta con RHF, reusable en backend"
}
```

### Internacionalización

**next-intl**
```json
{
  "version": "^3.5.0",
  "features": [
    "App Router support",
    "Server/Client components",
    "Type-safe translations",
    "URL routing (/es/productos)"
  ],
  "reasoning": "Mejor librería i18n para Next.js 15 App Router"
}
```

### HTTP Client

**Native Fetch + Axios (backup)**
```json
{
  "primary": "fetch (nativo)",
  "backup": "axios ^1.6.0",
  "reasoning": "Fetch es suficiente con Next.js. Axios solo si necesitamos interceptors complejos."
}
```

### Pagos

**Stripe SDK**
```json
{
  "@stripe/stripe-js": "^2.4.0",
  "@stripe/react-stripe-js": "^2.4.0",
  "reasoning": "SDK oficial, Elements componentes, PCI compliant"
}
```

### Testing

**Vitest**
```json
{
  "version": "^1.1.0",
  "usage": "Unit tests",
  "reasoning": "Más rápido que Jest, mejor con ESM, hot reload"
}
```

**React Testing Library**
```json
{
  "version": "^14.1.0",
  "usage": "Component tests",
  "reasoning": "Estándar de facto, testing user-centric"
}
```

**Playwright**
```json
{
  "version": "^1.40.0",
  "usage": "E2E tests",
  "reasoning": "Multi-browser, mejor que Cypress para Next.js, auto-wait"
}
```

### Utilities

```json
{
  "date-fns": "^3.0.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0",
  "sharp": "^0.33.0"
}
```

---

## ⚙️ Backend Stack

### Core Framework

**ASP.NET Core 10**
```csharp
{
  "version": "10.0",
  "type": "Web API",
  "features": [
    "Minimal APIs",
    "Native AOT ready",
    "Rate limiting built-in",
    "Output caching"
  ],
  "reasoning": "Performance excelente, maduro, type-safe, gran ecosistema"
}
```

### ORM y Base de Datos

**Entity Framework Core 10**
```csharp
{
  "version": "10.0",
  "features": [
    "LINQ queries",
    "Migrations",
    "Change tracking",
    "Lazy/Eager loading"
  ],
  "packages": [
    "Npgsql.EntityFrameworkCore.PostgreSQL"
  ],
  "reasoning": "ORM más usado en .NET, excelente con PostgreSQL"
}
```

**PostgreSQL 16**
```json
{
  "version": "16",
  "features": [
    "JSONB para configuraciones",
    "Full-text search",
    "Triggers",
    "CTEs",
    "Window functions"
  ],
  "reasoning": "Open source, robusto, excelente para e-commerce, gratis"
}
```

### Autenticación

**ASP.NET Identity + JWT**
```csharp
{
  "Microsoft.AspNetCore.Identity.EntityFrameworkCore": "10.0.0",
  "Microsoft.AspNetCore.Authentication.JwtBearer": "10.0.0",
  "System.IdentityModel.Tokens.Jwt": "7.0.0",
  "features": [
    "User management",
    "Password hashing (PBKDF2)",
    "Role-based auth",
    "2FA (TOTP)"
  ],
  "reasoning": "Built-in, seguro, probado, cumple estándares"
}
```

### Validación

**FluentValidation**
```csharp
{
  "version": "11.3.0",
  "reasoning": "Validaciones legibles, reusables, separadas del modelo"
}
```

### Logging

**Serilog**
```csharp
{
  "version": "8.0.0",
  "sinks": [
    "Console",
    "File (rolling)",
    "Seq",
    "Better Stack"
  ],
  "features": [
    "Structured logging",
    "Log enrichment",
    "Contextual logging",
    "Async sinks"
  ],
  "reasoning": "Estándar de facto en .NET, flexible, structured logs"
}
```

### Caché

**StackExchange.Redis**
```csharp
{
  "version": "2.7.0",
  "usage": [
    "Catálogo de productos",
    "Sesiones",
    "Rate limiting",
    "Cache de configuraciones populares"
  ],
  "reasoning": "Cliente Redis más usado en .NET, robusto"
}
```

### Pagos

**Stripe.net**
```csharp
{
  "version": "43.0.0",
  "features": [
    "PaymentIntents",
    "Webhooks",
    "Customers",
    "Refunds"
  ],
  "reasoning": "SDK oficial, bien documentado, completo"
}
```

### Email

**Resend SDK**
```csharp
{
  "version": "1.0.0",
  "reasoning": "API moderna, tier gratuito generoso, buena deliverability"
}
```

### Monitoring

**Sentry.AspNetCore**
```csharp
{
  "version": "4.0.0",
  "features": [
    "Error tracking",
    "Performance monitoring",
    "Release tracking",
    "Breadcrumbs"
  ],
  "reasoning": "Mejor herramienta error tracking, integración nativa"
}
```

### Testing

**xUnit**
```csharp
{
  "version": "2.6.0",
  "reasoning": "Estándar en .NET, moderno, paralelizable"
}
```

**FluentAssertions**
```csharp
{
  "version": "6.12.0",
  "reasoning": "Assertions legibles: result.Should().BeEquivalentTo(expected)"
}
```

**Moq**
```csharp
{
  "version": "4.20.0",
  "reasoning": "Mocking simple y potente"
}
```

**Testcontainers**
```csharp
{
  "version": "3.6.0",
  "reasoning": "Tests de integración con PostgreSQL real en Docker"
}
```

### Utilities

```csharp
{
  "AutoMapper": "12.0.0",  // Object mapping
  "Bogus": "35.0.0"        // Fake data para tests
}
```

---

## 💾 Base de Datos

**PostgreSQL 16**
```yaml
Hosting: Supabase (Free tier) o Railway
Tamaño inicial: 500MB suficiente
Backups: Automáticos en Supabase
Conexiones: Pool de 10-20 conexiones

Extensiones usadas:
  - uuid-ossp (UUIDs)
  - pgcrypto (si se necesita)
  
Características usadas:
  - JSONB (configuraciones 3D)
  - Full-text search (búsqueda productos)
  - Triggers (actualizar stock)
  - Views (reportes admin)
```

---

## 🚀 Infraestructura

### Hosting Frontend

**Vercel (Hobby Plan - Gratis)**
```yaml
Features:
  - Edge Network global
  - Automatic HTTPS
  - Preview deployments
  - Image optimization
  - Analytics incluido
  - Zero config deployment

Límites Free Tier:
  - 100GB bandwidth/mes
  - Serverless executions: 100GB-Hrs
  - 1000 images optimized/mes
  - Suficiente para MVP
```

### Hosting Backend

**Railway (Starter - $5/mes)**
```yaml
Features:
  - 8GB RAM / 8 vCPU
  - $5 credit mensual
  - PostgreSQL incluido
  - Auto-deploy desde GitHub
  - Metrics dashboard

Alternativa: Render (Free tier)
  - 512MB RAM (puede ser justo)
  - Sleep después 15min inactividad
  - OK para testing, no para producción
```

### Base de Datos

**Supabase (Free tier)**
```yaml
Features:
  - PostgreSQL managed
  - 500MB storage
  - Backups diarios (7 días retención)
  - Connection pooler
  - Dashboard SQL editor
  - API REST automática (opcional)

Alternativa: Railway PostgreSQL
  - Incluido en $5/mes
  - 1GB storage
```

### Caché

**Upstash Redis (Free tier)**
```yaml
Features:
  - 10,000 commands/día
  - 256MB storage
  - Global replication
  - REST API

Suficiente para:
  - Cache de productos (read-heavy)
  - Sesiones
  - Rate limiting básico
```

### CDN

**Cloudflare (Free tier)**
```yaml
Features:
  - Unlimited bandwidth
  - DDoS protection
  - SSL/TLS
  - Page Rules (3 gratis)
  - Analytics básicos

Uso:
  - Proxy DNS
  - Cache de assets estáticos
  - Protección
```

### Storage

**Vercel Blob (Free tier)**
```yaml
Features:
  - 1GB storage
  - 100GB bandwidth
  - Global edge distribution
  
Uso:
  - Modelos 3D (.glb)
  - Imágenes de productos (backup)
  - Assets pesados
```

---

## 🔌 Servicios Externos

### Pagos

**Stripe**
```yaml
Plan: Pay-as-you-go (sin cuota fija)
Costes:
  - Tarjetas EU: 1.5% + 0.25€
  - No hay fee mensual
  - Webhooks incluidos
Features:
  - PaymentIntents API
  - SCA compliance (3D Secure)
  - Webhooks
  - Dashboard completo
```

### Email

**Resend**
```yaml
Free Tier:
  - 100 emails/día
  - 3,000 emails/mes
  - API simple
  - Deliverability alta

Suficiente para:
  - Confirmaciones de pedido
  - Recuperación contraseña
  - Notificaciones admin
  
Escalado: $20/mes para 50K emails
```

### Monitoring

**Sentry**
```yaml
Free Tier:
  - 5,000 events/mes
  - 1 proyecto
  - 1 miembro
  - Retención 30 días

Uso:
  - Error tracking
  - Performance monitoring
  - Release tracking
```

**Better Stack (Logs)**
```yaml
Free Tier:
  - 1GB/mes
  - Retención 3 días
  - 1 usuario

Alternativa: Seq self-hosted (gratis)
```

### Analytics

**Google Analytics 4**
```yaml
Plan: Gratuito ilimitado
Features:
  - Event tracking
  - Conversiones
  - Funnels
  - Audience segmentation
```

**Vercel Analytics**
```yaml
Incluido en Hobby plan
Features:
  - Web Vitals
  - Real User Monitoring
  - Audience insights
```

### Seguridad

**hCaptcha**
```yaml
Plan: Gratuito
Features:
  - Anti-bot
  - RGPD compliant
  - No tracking de usuarios

Uso:
  - Formulario de contacto
  - Registro
  - Checkout (opcional)
```

---

## 🧰 Herramientas de Desarrollo

### IDE y Editores

```yaml
Primario: Cursor IDE ($20/mes)
  - IA integrada
  - Fork de VSCode
  - Mejor para refactoring

Autocompletado: GitHub Copilot ($10/mes)
  - O Codeium (gratis)
  
UI/UX: v0.dev (gratis tier)
  - Generación de componentes React
```

### Control de Versiones

```yaml
Git: GitHub
CI/CD: GitHub Actions (2000 min/mes gratis)
Branching: Git Flow simplificado
```

### Testing

```yaml
Frontend:
  - Vitest (unit)
  - Playwright (E2E)
  - Lighthouse CI

Backend:
  - xUnit (unit/integration)
  - Testcontainers (integration con DB)
```

### Deployment

```yaml
Frontend: Vercel CLI + GitHub integration
Backend: Railway CLI + GitHub integration
Database: Supabase CLI para migraciones
```

---

## 📊 Comparativa de Alternativas

### Frontend Framework

| Framework | Pros | Contras | Decisión |
|-----------|------|---------|----------|
| **Next.js** ✅ | SEO excelente, SSR/SSG, Image optimization, Gran ecosistema | Vendor lock-in leve con Vercel | **ELEGIDO** |
| Remix | Moderno, edge-first | Menos maduro, ecosistema menor | Descartado |
| SvelteKit | Performance superior | Ecosistema menor, menos devs | Descartado |
| Gatsby | SEO bueno | Más lento build, menos flexible | Descartado |

### Backend Framework

| Framework | Pros | Contras | Decisión |
|-----------|------|---------|----------|
| **.NET Core** ✅ | Performance, type-safe, maduro | Más verboso que Node | **ELEGIDO** |
| Node/Express | JavaScript full-stack | Menos type-safe, performance menor | Descartado |
| FastAPI (Python) | Rápido desarrollo | Performance inferior | Descartado |
| Go | Performance máxima | Curva aprendizaje, menos librerías | Descartado |

### Base de Datos

| Database | Pros | Contras | Decisión |
|----------|------|---------|----------|
| **PostgreSQL** ✅ | Robusto, features avanzadas, gratis | Setup más complejo que MySQL | **ELEGIDO** |
| MySQL | Simple, popular | Menos features que PG | Descartado |
| MongoDB | Flexible schema | No ACID completo, overkill | Descartado |

### Hosting Frontend

| Provider | Free Tier | Pros | Contras | Decisión |
|----------|-----------|------|---------|----------|
| **Vercel** ✅ | Sí (100GB) | Optimizado Next.js, global CDN | Vendor lock-in | **ELEGIDO** |
| Netlify | Sí (100GB) | Similar a Vercel | Menos optimizado Next.js | Backup |
| Cloudflare Pages | Sí (unlimited) | Barato, rápido | Menos integrado | Considerar futuro |

### Hosting Backend

| Provider | Coste | Pros | Contras | Decisión |
|----------|-------|------|---------|----------|
| **Railway** ✅ | $5/mes | Fácil, incluye PG | Más caro escalando | **ELEGIDO** |
| Render | Free tier | Gratis para empezar | Sleep en free tier | Descartado |
| Fly.io | Free tier | Global edge | Más complejo | Considerar futuro |
| AWS ECS | Pay-as-you-go | Infinito escalado | Complejo, caro inicial | Futuro |

---

## 💰 Resumen de Costes

### MVP (Mes 1-3)

```
Infraestructura:
  ├─ Vercel               $0
  ├─ Railway              $5
  ├─ Upstash Redis        $0
  ├─ Cloudflare           $0
  └─ Dominio              $1
      Total Infra:        $6/mes

Servicios:
  ├─ Stripe               $0 (comisiones por venta)
  ├─ Resend               $0
  ├─ Sentry               $0
  ├─ Better Stack         $0
  └─ hCaptcha             $0
      Total Servicios:    $0/mes

Herramientas IA (opcional):
  ├─ Cursor               $20
  └─ GitHub Copilot       $10
      Total IA:           $30/mes

TOTAL MVP: $6-36/mes (sin IA-con IA)
```

### Crecimiento (>100 pedidos/mes)

```
Infraestructura:
  ├─ Vercel Pro           $20
  ├─ Railway Scale        $20
  ├─ Upstash Paid         $10
  └─ Dominio              $1
      Total:              $51/mes

Servicios:
  ├─ Resend Pro           $20
  ├─ Sentry Team          $26
  └─ Better Stack         $18
      Total:              $64/mes

TOTAL Crecimiento: ~$115/mes + comisiones
```

---

## 🔄 Plan de Actualización

Este documento debe actualizarse cuando:
- Se añadan nuevas dependencias
- Se cambien versiones mayores
- Se adopten nuevas herramientas
- Se migren servicios
- Se identifiquen mejores alternativas

**Última revisión:** Enero 2026  
**Próxima revisión:** Post-MVP
