# 🗓️ Roadmap MVP - 1 Mes

## 📋 Resumen

**Duración:** 30 días (4 semanas)  
**Equipo:** 1 desarrollador senior + herramientas IA  
**Objetivo:** Lanzar MVP funcional con flujo de compra completo  
**Metodología:** Desarrollo iterativo, deploy continuo a staging

---

## 📊 Vista General por Semanas

```
SEMANA 1: Setup + Auth + Productos Base
├─ Setup infraestructura
├─ Autenticación completa
└─ CRUD productos y componentes

SEMANA 2: Configurador 3D + Carrito
├─ Visor 3D funcional
├─ Sistema de personalización
└─ Carrito de compra

SEMANA 3: Checkout + Pagos
├─ Flujo de checkout
├─ Integración Stripe
└─ Emails transaccionales

SEMANA 4: Admin + Testing + Deploy
├─ Panel administración
├─ Testing completo
└─ Deploy a producción
```

---

## 🏃 SEMANA 1: Fundamentos (Días 1-7)

### **Día 1-2: Setup Inicial** 🎯

#### Día 1: Infraestructura Base
**Tiempo estimado:** 8 horas

- [ ] **Setup Repositorio**
  - Crear repositorio GitHub (monorepo)
  - Configurar .gitignore
  - README inicial
  - Estructura de carpetas `/frontend`, `/backend`, `/docs`

- [ ] **Frontend Setup**
  - `npx create-next-app@latest frontend --typescript --tailwind --app`
  - Instalar dependencias base (ver tech-stack.md)
  - Configurar Tailwind + shadcn/ui
  - Setup next-intl (es/en)
  - Crear layout base

- [ ] **Backend Setup**
  - `dotnet new webapi -n SimRacingShop.API`
  - Estructura de proyecto (Core, Infrastructure, API)
  - Configurar Serilog
  - Setup Swagger/OpenAPI

- [ ] **Docker Compose**
  - PostgreSQL container
  - Redis container
  - Seq container (logs)
  - Script de inicialización

**Entregables:**
- Repositorio configurado
- Frontend y backend ejecutándose localmente
- Docker compose funcional

---

#### Día 2: Base de Datos
**Tiempo estimado:** 8 horas

- [ ] **Schema PostgreSQL**
  - Crear migraciones iniciales EF Core
  - Tablas: users, products, components, product_translations
  - Índices básicos
  - Triggers (updated_at)
  
- [ ] **Seed Data**
  - 3 productos de ejemplo
  - 10 componentes de ejemplo
  - Usuario admin de prueba
  - Traducciones (es/en)

- [ ] **Testing BD**
  - Verificar migraciones
  - Queries básicas
  - Validar relaciones

**Entregables:**
- Base de datos con schema completo
- Migraciones funcionando
- Datos de prueba cargados

---

### **Día 3-4: Autenticación** 🔐

#### Día 3: Backend Auth
**Tiempo estimado:** 8 horas

- [ ] **ASP.NET Identity Setup**
  - Configurar Identity con EF Core
  - Modelos: ApplicationUser, Roles
  - Password requirements

- [ ] **JWT Implementation**
  - Generar tokens JWT
  - Configurar validación tokens
  - Refresh tokens
  - 2FA setup (TOTP) para admins

- [ ] **Endpoints Auth**
  - POST `/api/auth/register`
  - POST `/api/auth/login`
  - POST `/api/auth/refresh`
  - POST `/api/auth/logout`
  - GET `/api/auth/me`

- [ ] **Tests Auth**
  - Tests unitarios de servicios
  - Tests de integración de endpoints

**Entregables:**
- API de autenticación completa
- JWT funcionando
- Tests pasando

---

#### Día 4: Frontend Auth
**Tiempo estimado:** 8 horas

- [ ] **Auth Context/Store**
  - Zustand store para usuario
  - Persist token en localStorage (o httpOnly cookie)
  - Auto-refresh token

- [ ] **Páginas Auth**
  - `/login` - Formulario login
  - `/register` - Formulario registro
  - `/forgot-password` - Recuperar contraseña
  - Validación con Zod + React Hook Form

- [ ] **Protected Routes**
  - Middleware para rutas protegidas
  - Redirect a login si no auth
  - Layout usuario autenticado

- [ ] **Testing**
  - Tests de componentes auth
  - E2E test: registro → login → logout

**Entregables:**
- Flujo de autenticación completo
- UI responsive y validada
- Tests E2E pasando

---

### **Día 5-7: Catálogo de Productos** 🛍️

#### Día 5: Backend Productos
**Tiempo estimado:** 8 horas

- [ ] **Productos API**
  - GET `/api/products` (listado con paginación)
  - GET `/api/products/{id}` (detalle)
  - GET `/api/products/slug/{slug}` (por URL)
  - Filtros: categoría, precio, disponibilidad
  - Búsqueda full-text (PostgreSQL)

- [ ] **Componentes API**
  - GET `/api/components` (listado)
  - GET `/api/components/product/{productId}` (por producto)
  - Filtrar por tipo, stock disponible

- [ ] **Cache Redis**
  - Cache listado de productos (TTL 1h)
  - Cache producto individual (TTL 24h)
  - Invalidación al actualizar

- [ ] **Tests**
  - Tests de repositorios
  - Tests de endpoints con mock data

**Entregables:**
- API de productos completa
- Cache funcionando
- Performance < 100ms

---

#### Día 6: Admin Panel - Productos CRUD
**Tiempo estimado:** 8 horas

- [ ] **Admin Productos API**
  - POST `/api/admin/products` (crear)
  - PUT `/api/admin/products/{id}` (editar)
  - DELETE `/api/admin/products/{id}` (eliminar)
  - POST `/api/admin/products/{id}/images` (subir imágenes)
  - PUT `/api/admin/products/{id}/translations` (traducciones)

- [ ] **Admin Componentes API**
  - CRUD completo de componentes
  - Actualizar stock
  - Marcar bajo stock

- [ ] **Validaciones**
  - FluentValidation para DTOs
  - Validar SKUs únicos
  - Validar precios positivos

**Entregables:**
- CRUD completo en backend
- Validaciones robustas
- Logs estructurados

---

#### Día 7: Frontend Catálogo
**Tiempo estimado:** 8 horas

- [ ] **Página Home/Landing**
  - Hero section
  - Productos destacados (grid)
  - Call to actions
  - SEO meta tags

- [ ] **Página Listado** (`/productos`)
  - Grid de productos
  - Filtros sidebar
  - Paginación o infinite scroll
  - Loading states

- [ ] **Página Detalle** (`/productos/[slug]`)
  - Galería de imágenes
  - Información del producto
  - Especificaciones técnicas
  - Botón "Personalizar"
  - JSON-LD schema

- [ ] **Testing**
  - Tests de componentes
  - Tests de integración con API
  - Lighthouse audit básico

**Entregables:**
- Catálogo funcional y navegable
- SEO básico implementado
- Performance aceptable

---

## 🎨 SEMANA 2: Experiencia 3D (Días 8-14)

### **Día 8-10: Visor 3D Base** 🎮

#### Día 8: Setup Three.js
**Tiempo estimado:** 8 horas

- [ ] **R3F Setup**
  - Instalar @react-three/fiber, @react-three/drei
  - Componente base `<Canvas>`
  - OrbitControls
  - Lighting setup (ambient, directional)
  - Environment map

- [ ] **Cargar Modelos GLB**
  - Hook `useGLTF` 
  - Lazy loading de modelos
  - Loading fallback
  - Error handling

- [ ] **Componente ProductViewer**
  - Props: modelUrl, initialConfig
  - Controles básicos (rotar, zoom)
  - Responsive (mobile touch)

**Entregables:**
- Visor 3D funcional
- Modelos cargando correctamente
- Performance 60fps

---

#### Día 9: Sistema de Configuración
**Tiempo estimado:** 8 horas

- [ ] **Configurador Backend**
  - GET `/api/products/{id}/configuration-options`
  - Validar configuración válida
  - Calcular precio con modificadores

- [ ] **Configurador Frontend**
  - UI de opciones (color picker, selects)
  - Zustand store para config actual
  - Aplicar cambios en 3D en tiempo real
  - Cambiar materiales/colores de meshes

- [ ] **Validación de Config**
  - Verificar componentes disponibles
  - Alertas si componente bajo stock
  - Calcular tiempo fabricación estimado

**Entregables:**
- Configurador interactivo
- Validaciones en tiempo real
- UX fluida

---

#### Día 10: Configuraciones Compartibles
**Tiempo estimado:** 8 horas

- [ ] **Backend Share System**
  - POST `/api/configurations` (guardar config)
  - GET `/api/configurations/{token}` (cargar compartida)
  - Generar share tokens únicos
  - Tabla `saved_configurations`

- [ ] **Frontend Share**
  - Botón "Compartir configuración"
  - Generar URL única
  - Copy to clipboard
  - Cargar desde URL compartida
  - Botón "Comprar desde aquí"

- [ ] **Optimización**
  - Comprimir configuración JSON
  - Caché de configs populares (Redis)

**Entregables:**
- URLs compartibles funcionando
- Pueden iniciar compra desde link
- Analytics de shares (opcional)

---

### **Día 11-12: Carrito de Compra** 🛒

#### Día 11: Backend Carrito
**Tiempo estimado:** 8 horas

- [ ] **Carrito API**
  - GET `/api/cart` (ver carrito)
  - POST `/api/cart/items` (añadir)
  - PUT `/api/cart/items/{id}` (actualizar cantidad)
  - DELETE `/api/cart/items/{id}` (eliminar)
  - DELETE `/api/cart` (vaciar)

- [ ] **Lógica de Carrito**
  - Validar producto existe
  - Validar config válida
  - Calcular subtotales
  - Asociar a usuario o sesión anónima
  - Merge carts al login

- [ ] **Tests**
  - Tests unitarios de servicio
  - Tests de integración
  - Edge cases (producto eliminado, etc)

**Entregables:**
- API de carrito completa
- Persistencia funcional
- Tests comprehensivos

---

#### Día 12: Frontend Carrito
**Tiempo estimado:** 8 horas

- [ ] **Página Carrito** (`/carrito`)
  - Lista de items
  - Thumbnail de configuración 3D
  - Editar cantidades
  - Eliminar items
  - Resumen de precios

- [ ] **Carrito Widget**
  - Badge con cantidad en navbar
  - Mini carrito dropdown (opcional)
  - Toast al añadir items

- [ ] **Zustand Store**
  - Estado global del carrito
  - Sincronización con backend
  - Optimistic updates

- [ ] **Validaciones**
  - Verificar stock antes de checkout
  - Alertar si precio cambió
  - Recalcular envío

**Entregables:**
- Carrito completamente funcional
- UX optimizada
- Estados de error manejados

---

### **Día 13-14: Gestión de Stock** 📦

#### Día 13: Backend Stock
**Tiempo estimado:** 8 horas

- [ ] **Sistema de Componentes**
  - Verificar stock disponible
  - Calcular componentes necesarios por config
  - Alertas de bajo stock
  - Lead time adicional si bajo stock

- [ ] **API Stock**
  - GET `/api/admin/components/low-stock`
  - PUT `/api/admin/components/{id}/stock` (ajustar)
  - GET `/api/products/{id}/availability` (check availability)

- [ ] **Triggers BD**
  - Auto-decrementar stock al confirmar pedido
  - Trigger para marcar bajo stock automático

**Entregables:**
- Sistema de stock robusto
- Validaciones antes de compra
- Admin puede gestionar stock

---

#### Día 14: Frontend Stock Indicators
**Tiempo estimado:** 8 horas

- [ ] **Indicadores de Stock**
  - Badge "Bajo stock" en productos
  - Mensaje "Tiempo fabricación extendido"
  - Mostrar disponibilidad en configurador

- [ ] **Admin Panel Stock**
  - Tabla de componentes
  - Indicador visual de niveles
  - Filtrar por bajo stock
  - Actualizar stock inline

- [ ] **Tests E2E**
  - Flow completo: configurar → verificar stock → añadir carrito
  - Validar mensajes de bajo stock

**Entregables:**
- Indicadores claros para usuarios
- Admin puede monitorear stock
- Tests E2E pasando

---

## 💳 SEMANA 3: Pagos y Checkout (Días 15-21)

### **Día 15-16: Checkout Flow** 💰

#### Día 15: Backend Checkout
**Tiempo estimado:** 8 horas

- [ ] **Shipping API**
  - GET `/api/shipping/zones` (zonas disponibles)
  - POST `/api/shipping/calculate` (calcular coste)
  - Lógica: detectar zona por CP
  - Calcular por peso + tarifa base
  - Aplicar envío gratis si aplica

- [ ] **Order Creation**
  - POST `/api/orders` (crear pedido)
  - Generar order_number único
  - Snapshot de productos/precios
  - Estado inicial: pending
  - Validar carrito no vacío

**Entregables:**
- Cálculo de envío funcional
- Creación de pedidos
- Validaciones robustas

---

#### Día 16: Frontend Checkout
**Tiempo estimado:** 8 horas

- [ ] **Página Checkout** (`/checkout`)
  - **Step 1:** Dirección de envío
  - **Step 2:** Método de pago
  - **Step 3:** Resumen y confirmar
  
- [ ] **Formularios**
  - Validación con Zod
  - Autocompletar direcciones
  - Guardar dirección para próximas compras
  - Selección zona de envío

- [ ] **Resumen**
  - Items del pedido
  - Subtotal
  - IVA (21%)
  - Envío
  - Total

- [ ] **Tests**
  - Tests de formularios
  - E2E: llenar checkout completo

**Entregables:**
- Checkout UI completo
- Formularios validados
- UX clara y guiada

---

### **Día 17-19: Integración Stripe** 💳

#### Día 17: Backend Stripe
**Tiempo estimado:** 8 horas

- [ ] **Stripe Setup**
  - Instalar Stripe.net
  - Configurar API keys (test mode)
  - Crear PaymentIntent

- [ ] **Payment API**
  - POST `/api/payments/create-intent` (crear intento)
  - POST `/api/payments/webhook` (webhook Stripe)
  - Manejar eventos: `payment_intent.succeeded`, `payment_intent.failed`

- [ ] **Order Update**
  - Actualizar estado a `paid` si éxito
  - Guardar `stripe_payment_intent_id`
  - Trigger: descontar componentes del stock
  - Crear registro en `order_status_history`

- [ ] **Tests**
  - Mock Stripe API
  - Test webhook handling
  - Test stock deduction

**Entregables:**
- Integración Stripe funcional
- Webhooks manejados
- Stock se descuenta correctamente

---

#### Día 18: Frontend Stripe
**Tiempo estimado:** 8 horas

- [ ] **Stripe Elements**
  - Instalar @stripe/react-stripe-js
  - Componente CardElement
  - Styling custom (match theme)

- [ ] **Payment Flow**
  - Crear PaymentIntent en backend
  - Confirmar pago con Stripe
  - Loading states durante proceso
  - Manejar errores (tarjeta rechazada, etc)

- [ ] **Página Confirmación** (`/pedido/{orderId}/confirmacion`)
  - Mensaje de éxito
  - Número de pedido
  - Resumen del pedido
  - Tiempo estimado de fabricación
  - CTA: ver pedidos

**Entregables:**
- Pago con Stripe funcional
- Manejo de errores completo
- Página de confirmación

---

#### Día 19: Emails Transaccionales
**Tiempo estimado:** 8 horas

- [ ] **Email Service**
  - Integrar Resend SDK
  - Plantillas HTML simples (inline CSS)
  - Helper para enviar emails

- [ ] **Emails Implementados**
  - Confirmación de registro
  - Recuperación de contraseña
  - Confirmación de pedido (con detalles)
  - Cambio de estado de pedido

- [ ] **Testing**
  - Emails llegando correctamente
  - Render correcto en Gmail, Outlook
  - Links funcionando

- [ ] **Logs**
  - Log de emails enviados
  - Tracking de errores de envío

**Entregables:**
- Sistema de emails funcional
- Plantillas responsive
- Deliverability alta

---

### **Día 20-21: Área de Usuario** 👤

#### Día 20: Backend User Area
**Tiempo estimado:** 8 horas

- [ ] **User Orders API**
  - GET `/api/users/me/orders` (historial)
  - GET `/api/users/me/orders/{id}` (detalle)
  - GET `/api/users/me/addresses` (direcciones guardadas)
  - PUT `/api/users/me/profile` (editar perfil)

- [ ] **Filters & Pagination**
  - Filtrar por estado
  - Ordenar por fecha
  - Paginación

**Entregables:**
- API área usuario completa
- Queries optimizadas

---

#### Día 21: Frontend User Area
**Tiempo estimado:** 8 horas

- [ ] **Página Perfil** (`/cuenta`)
  - Datos personales
  - Editar información
  - Cambiar contraseña
  - Direcciones guardadas

- [ ] **Página Pedidos** (`/cuenta/pedidos`)
  - Lista de pedidos
  - Estados visuales (badges)
  - Ver detalle de cada pedido
  - Tracking (si disponible)

- [ ] **Detalle Pedido** (`/cuenta/pedidos/{id}`)
  - Items del pedido
  - Configuración 3D usada
  - Estado actual
  - Timeline de estados
  - Información de envío

**Entregables:**
- Área de usuario funcional
- UX clara y útil
- Responsive

---

## 🎛️ SEMANA 4: Admin, Testing y Deploy (Días 22-30)

### **Día 22-24: Panel de Administración** 👨‍💼

#### Día 22: Admin Dashboard
**Tiempo estimado:** 8 horas

- [ ] **Backend Admin API**
  - GET `/api/admin/dashboard/stats` (KPIs)
  - GET `/api/admin/orders` (todos los pedidos)
  - GET `/api/admin/orders/pending` (pendientes)
  - PUT `/api/admin/orders/{id}/status` (cambiar estado)

- [ ] **Dashboard Stats**
  - Total ventas (día, semana, mes)
  - Pedidos pendientes
  - Productos más vendidos
  - Componentes bajo stock

**Entregables:**
- API admin completa
- Queries optimizadas para stats

---

#### Día 23: Frontend Admin - Pedidos
**Tiempo estimado:** 8 horas

- [ ] **Página Admin** (`/admin`)
  - Dashboard con métricas
  - Gráficos básicos (opcional)
  - Acceso rápido a secciones

- [ ] **Gestión Pedidos** (`/admin/pedidos`)
  - Tabla de pedidos
  - Filtros (estado, fecha, cliente)
  - Búsqueda por número pedido
  - Ver detalle de pedido
  - Cambiar estado (dropdown)
  - Añadir notas internas

- [ ] **Detalle Pedido Admin**
  - Toda la info del pedido
  - Visor 3D de configuración
  - Historial de cambios de estado
  - Información de cliente
  - Botón imprimir (futuro)

**Entregables:**
- Panel admin funcional
- Gestión de pedidos completa
- UI intuitiva

---

#### Día 24: Frontend Admin - Productos
**Tiempo estimado:** 8 horas

- [ ] **Gestión Productos** (`/admin/productos`)
  - Tabla de productos
  - CRUD completo (crear, editar, eliminar)
  - Subir imágenes
  - Subir modelo 3D
  - Gestionar traducciones (es/en)
  - Vista previa del producto

- [ ] **Gestión Componentes** (`/admin/componentes`)
  - Tabla de componentes
  - CRUD completo
  - Actualizar stock inline
  - Indicadores visuales de stock
  - Asociar a productos

- [ ] **Validaciones**
  - Formularios con validación
  - Confirmación antes de eliminar
  - Feedback visual de acciones

**Entregables:**
- Admin puede gestionar todo el catálogo
- UI responsive
- Validaciones robustas

---

### **Día 25-26: Testing Completo** 🧪

#### Día 25: Testing Backend
**Tiempo estimado:** 8 horas

- [ ] **Unit Tests**
  - Servicios de lógica de negocio
  - Validadores
  - Helpers y utilidades
  - Coverage > 70%

- [ ] **Integration Tests**
  - Endpoints críticos (auth, checkout, payments)
  - Tests con Testcontainers (PostgreSQL real)
  - Webhooks de Stripe

- [ ] **Performance Tests**
  - Load testing básico (opcional)
  - Query performance
  - Cache hit rates

**Entregables:**
- Suite de tests completa
- Coverage report
- Tests pasando en CI

---

#### Día 26: Testing Frontend
**Tiempo estimado:** 8 horas

- [ ] **Unit Tests**
  - Componentes críticos
  - Stores de Zustand
  - Utilities y helpers
  - Coverage > 60%

- [ ] **E2E Tests (Playwright)**
  - **Happy path completo:**
    - Registro → Login
    - Ver producto → Configurar 3D
    - Añadir carrito → Checkout
    - Pagar → Ver confirmación
  - **Admin flow:**
    - Login admin → Ver pedidos
    - Cambiar estado pedido
    - Crear producto

- [ ] **Visual Tests** (opcional)
  - Lighthouse CI
  - Screenshot tests críticos

**Entregables:**
- Tests E2E pasando
- Cobertura aceptable
- CI ejecutando tests automáticamente

---

### **Día 27-28: SEO y Legal** 📄

#### Día 27: SEO
**Tiempo estimado:** 8 horas

- [ ] **Meta Tags**
  - generateMetadata() en todas las páginas
  - OpenGraph tags
  - Twitter cards
  - Canonical URLs

- [ ] **Sitemap.xml**
  - Dinámico con productos
  - Incluir traducciones (hreflang)
  - Actualización automática

- [ ] **robots.txt**
  - Permitir indexación
  - Bloquear /admin, /cuenta

- [ ] **JSON-LD**
  - Schema Product en páginas de producto
  - Schema Organization en home
  - Schema BreadcrumbList

- [ ] **Performance**
  - Optimizar imágenes (next/image)
  - Lazy loading de componentes pesados
  - Minimizar CSS/JS

**Entregables:**
- SEO técnico completo
- Lighthouse score > 90
- Indexable por Google

---

#### Día 28: Legal y RGPD
**Tiempo estimado:** 8 horas

- [ ] **Páginas Legales**
  - Términos y condiciones
  - Política de privacidad
  - Política de cookies
  - Política de devoluciones
  - Aviso legal

- [ ] **Cookie Consent**
  - Banner de cookies (hCaptcha/react-cookie-consent)
  - Aceptar/Rechazar
  - Configuración de cookies

- [ ] **RGPD Compliance**
  - Formularios con consentimiento explícito
  - Política de datos clara
  - Opción de eliminar cuenta (futuro)

- [ ] **hCaptcha**
  - En formulario de contacto (si existe)
  - En registro (opcional)
  - En checkout (opcional)

**Entregables:**
- Compliance RGPD
- Páginas legales publicadas
- Cookie consent funcional

---

### **Día 29-30: Deploy y Lanzamiento** 🚀

#### Día 29: Deploy a Producción
**Tiempo estimado:** 8 horas

- [ ] **Setup Infraestructura**
  - Vercel: proyecto y dominio
  - Railway: backend y PostgreSQL
  - Supabase: verificar BD prod
  - Upstash: Redis prod
  - Cloudflare: configurar DNS

- [ ] **Variables de Entorno**
  - Configurar en Vercel
  - Configurar en Railway
  - Stripe keys de producción
  - Secrets rotados

- [ ] **Migraciones BD**
  - Ejecutar en producción
  - Seed data inicial (productos reales)

- [ ] **Deploy**
  - Deploy backend a Railway
  - Deploy frontend a Vercel
  - Configurar dominio y SSL
  - Verificar webhooks Stripe

**Entregables:**
- Aplicación en producción
- Dominio funcionando con HTTPS
- Servicios conectados

---

#### Día 30: Testing Final y Monitoring
**Tiempo estimado:** 8 horas

- [ ] **Smoke Tests en Producción**
  - Registro y login
  - Ver productos
  - Configurar 3D
  - Añadir al carrito
  - Proceso de checkout (con tarjeta test)
  - Admin login y gestión

- [ ] **Monitoring Setup**
  - Sentry capturando errores
  - Logs fluyendo a Better Stack
  - Alertas configuradas
  - Uptime monitoring (UptimeRobot)

- [ ] **Analytics**
  - Google Analytics eventos configurados
  - Verificar tracking

- [ ] **Backup**
  - Backup manual de BD
  - Verificar backups automáticos

- [ ] **Documentación Final**
  - README actualizado
  - Credenciales documentadas (1Password)
  - Guía de deployment

- [ ] **🎉 LANZAMIENTO**
  - Anuncio interno
  - Primera venta de prueba real
  - Monitorear métricas

**Entregables:**
- MVP completamente funcional en producción
- Monitoring activo
- Documentación completa
- ✅ MVP LANZADO

---

## ✅ Checklist Final MVP

### Funcionalidad
- [ ] Usuarios pueden registrarse y hacer login
- [ ] Catálogo de productos visible y navegable
- [ ] Configurador 3D funcional con personalización
- [ ] Carrito de compra operativo
- [ ] Checkout con 3 pasos completo
- [ ] Pagos con Stripe funcionando
- [ ] Emails de confirmación llegando
- [ ] Área de usuario con historial de pedidos
- [ ] Panel admin completo y funcional
- [ ] Multiidioma (ES/EN) funcionando
- [ ] URLs compartibles de configuraciones

### Técnico
- [ ] Tests automatizados pasando en CI
- [ ] Coverage > 70% en crítico
- [ ] API response time < 500ms
- [ ] Lighthouse score > 90
- [ ] Zero security vulnerabilities
- [ ] Logs estructurados y monitoreados
- [ ] Error tracking activo (Sentry)
- [ ] Backups de BD configurados

### Legal y Seguridad
- [ ] HTTPS en toda la aplicación
- [ ] Páginas legales publicadas
- [ ] Cookie consent implementado
- [ ] RGPD compliant
- [ ] Rate limiting activo
- [ ] hCaptcha en formularios

### Negocio
- [ ] 10 productos reales publicados
- [ ] Precios y costes configurados
- [ ] Zonas de envío configuradas
- [ ] Primera venta de prueba completada
- [ ] Métricas base capturadas

---

## 📈 Métricas de Éxito Post-Lanzamiento

**Primera Semana:**
- Uptime > 99%
- Error rate < 1%
- Al menos 1 venta real
- Feedback de 3+ usuarios

**Primer Mes:**
- 10+ ventas completadas
- Conversión carrito → pago > 40%
- Tiempo medio configuración < 5min
- Net Promoter Score capturado

---

## 🔄 Post-MVP Inmediato (Semana 5)

**Prioridad Alta:**
1. Fix bugs reportados
2. Optimizaciones de performance
3. Ajustes de UX basados en feedback
4. Documentación de aprendizajes

**Prioridad Media:**
5. PayPal integration
6. Sistema de cupones básico
7. Mejoras en dashboard admin

---

**Última actualización:** Enero 2026  
**Estado:** En ejecución  
**Progreso:** 0% → 100% (actualizar semanalmente)
