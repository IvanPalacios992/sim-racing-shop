# 📋 Visión General del Proyecto

## 🎯 Resumen Ejecutivo

**Nombre del Proyecto:** SimRacing Shop  
**Tipo:** E-commerce B2C  
**Sector:** Hardware de simulación de carreras  
**Modelo de Negocio:** Venta directa de productos personalizables bajo demanda  
**Timeline MVP:** 1 mes  
**Equipo:** 1 desarrollador senior + herramientas IA

## 🎪 Propuesta de Valor

SimRacing Shop es una plataforma e-commerce especializada en hardware de sim racing personalizable que permite a los entusiastas de las carreras configurar y comprar equipamiento de alta calidad totalmente personalizado a través de un visor 3D interactivo.

### Diferenciadores Clave

1. **Configurador 3D en Tiempo Real**
   - Visualización interactiva de productos
   - Personalización completa de componentes
   - Feedback visual inmediato

2. **Fabricación Bajo Demanda**
   - Sin stock masivo
   - Productos únicos y personalizados
   - Gestión inteligente de componentes

3. **Experiencia Técnica**
   - Especificaciones detalladas
   - Compatibilidad con bases de sim racing
   - Asesoramiento en configuraciones

## 🎨 Propuesta de Experiencia de Usuario

### Para el Cliente

**Flujo de Compra:**
```
Descubrir producto 
  → Personalizar en 3D 
  → Validar configuración 
  → Añadir al carrito 
  → Checkout 
  → Pago 
  → Confirmación 
  → Tracking
```

**Características UX:**
- Navegación intuitiva por categorías
- Búsqueda avanzada con filtros
- Visor 3D con controles simples (orbit, zoom)
- Indicadores de tiempo de fabricación
- URLs compartibles de configuraciones
- Proceso de checkout optimizado (3 pasos máximo)
- Notificaciones por email en cada fase

### Para el Administrador

**Flujo de Gestión:**
```
Recibir pedido 
  → Verificar configuración 
  → Producir 
  → Actualizar estado 
  → Enviar 
  → Marcar como completado
```

**Características Admin:**
- Dashboard con KPIs principales
- Gestión completa de productos y componentes
- Control de inventario con alertas
- Gestión de pedidos con estados
- Vista detallada de configuraciones 3D
- Herramientas de búsqueda y filtrado

## 🏗️ Arquitectura de Alto Nivel

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Frontend (Next.js)         │
│  - Catálogo                 │
│  - Configurador 3D          │
│  - Checkout                 │
└────────┬───────────────┬────┘
         │               │
         ▼               ▼
┌────────────────┐  ┌─────────────┐
│  Backend API   │  │  Stripe     │
│  (.NET 10)     │  │  (Pagos)    │
└────────┬───────┘  └─────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌──────┐  ┌───────┐
│ PG   │  │ Redis │
└──────┘  └───────┘
```

## 📊 Alcance del MVP

### ✅ Incluido en MVP (Mes 1)

**Funcionalidades Core:**
- Catálogo de productos (~10 productos iniciales)
- Configurador 3D con personalización de componentes
- Sistema de carrito de compra
- Checkout con Stripe
- Gestión de usuarios (registro, login, perfil)
- Panel de administración básico
- Multiidioma (Español/Inglés)
- Sistema de componentes con stock
- Cálculo de costes de envío por zonas
- Emails transaccionales básicos
- SEO básico (meta tags, sitemap, JSON-LD)

**Páginas Principales:**
- Home/Landing
- Catálogo de productos
- Detalle de producto con configurador 3D
- Carrito
- Checkout (3 pasos)
- Área de usuario
- Panel admin
- Páginas legales (términos, privacidad, devoluciones)

### ❌ Fuera del MVP (Futuro)

**Fase 2:**
- PayPal y Bizum
- Sistema de cupones/descuentos
- Newsletter y email marketing
- Blog para contenido SEO
- Reviews y valoraciones
- Wishlist

**Fase 3:**
- Chat en vivo
- Sistema de tickets de soporte
- Programa de afiliados
- Notificaciones push
- App móvil nativa
- Integración con transportistas
- Sistema de facturación automática

## 🎯 Objetivos del MVP

### Objetivos Técnicos

1. **Performance**
   - Lighthouse score > 90
   - Tiempo de carga < 3s
   - Modelos 3D < 2MB optimizados
   - API response time < 500ms

2. **Funcionalidad**
   - Tasa de éxito en checkout > 95%
   - Uptime > 99.5%
   - Zero critical bugs
   - Test coverage > 70% en lógica crítica

3. **Seguridad**
   - HTTPS en toda la aplicación
   - Datos de pago nunca almacenados
   - Rate limiting implementado
   - RGPD compliance completo

### Objetivos de Negocio

1. **Validación de Producto**
   - Probar concepto de configurador 3D
   - Medir interés en personalización
   - Validar pricing y costes

2. **Métricas Clave**
   - Conversión landing → producto: baseline
   - Tiempo medio en configurador: < 5 min
   - Conversión carrito → checkout: > 40%
   - Conversión checkout → pago: > 80%

3. **Aprendizajes**
   - Configuraciones más populares
   - Componentes más demandados
   - Puntos de fricción en UX
   - Tiempos reales de fabricación

## 👥 Roles y Responsabilidades

### Desarrollador (Tú)
- Arquitectura del sistema
- Desarrollo full-stack
- DevOps y deployment
- Testing
- Documentación técnica

### Herramientas IA
- Aceleración de desarrollo
- Generación de tests
- Code reviews
- Debugging asistido
- Documentación

### Stakeholders (Futuro)
- Validación de requisitos
- Feedback de UX
- Decisiones de producto
- Aprobación de releases

## 📈 Criterios de Éxito MVP

### Criterios Técnicos

- [ ] Aplicación desplegada en producción
- [ ] Flujo de compra completo funcional
- [ ] Tests automatizados pasando
- [ ] Monitoring y logging configurados
- [ ] Documentación completa
- [ ] Zero security vulnerabilities

### Criterios de Producto

- [ ] 10 productos configurables publicados
- [ ] Configurador 3D funcional y fluido
- [ ] Proceso de pago sin fricciones
- [ ] Panel admin operativo
- [ ] Emails transaccionales entregándose
- [ ] SEO básico implementado

### Criterios de Negocio

- [ ] Primera venta real completada
- [ ] Tiempo de fabricación validado
- [ ] Costes de operación calculados
- [ ] Métricas base establecidas
- [ ] Feedback de primeros usuarios recopilado

## 🚀 Fases Post-MVP

### Fase 2: Optimización (Mes 2)
**Objetivo:** Mejorar conversión y añadir métodos de pago

- Integrar PayPal
- Implementar Bizum
- Sistema de cupones
- A/B testing básico
- Optimizaciones de performance

### Fase 3: Engagement (Mes 3)
**Objetivo:** Aumentar retención y valor de vida del cliente

- Newsletter
- Blog SEO
- Reviews de productos
- Programa de puntos
- Wishlist

### Fase 4: Escala (Mes 4-6)
**Objetivo:** Preparar para crecimiento

- Chat en vivo
- Programa de afiliados
- Integraciones con transportistas
- App móvil (consideración)
- Dashboard analytics avanzado

## 💰 Modelo de Monetización

### Ingresos Principales

1. **Venta Directa de Productos**
   - Precio base del producto
   - Incrementos por personalización
   - Margen objetivo: 40-60%

2. **Costes de Envío**
   - Península: 5€ base + 0.50€/kg
   - Baleares: 10€ base + 1€/kg
   - Canarias: 15€ base + 1.50€/kg
   - Envío gratis según zona con pedido mínimo

### Estructura de Costes

**Costes Fijos:**
- Infraestructura: ~6€/mes (MVP)
- Dominio: ~1€/mes
- Total fijo: ~7€/mes

**Costes Variables:**
- Comisión Stripe: 1.5% + 0.25€ por transacción
- Componentes: según configuración
- Envío: según zona y peso
- Emails: incluidos en tier gratuito

**Break-even (estimado):**
- Con margen 50% y ticket medio 150€
- Necesitas ~2-3 ventas/mes para cubrir costes fijos
- Escalabilidad favorable por bajo coste fijo

## 🎓 Lecciones Aprendidas (Actualizar Post-MVP)

### Técnicas
- TBD después del MVP

### Producto
- TBD después del MVP

### Negocio
- TBD después del MVP

## 📞 Contactos y Recursos

### Técnicos
- **Repositorio:** [GitHub URL]
- **Staging:** [URL staging]
- **Production:** [URL producción]
- **Monitoring:** [Sentry dashboard]
- **Logs:** [Better Stack]

### Servicios
- **Stripe Dashboard:** [URL]
- **Vercel Dashboard:** [URL]
- **Railway Dashboard:** [URL]
- **Domain Registrar:** [Provider]

### Documentación
- **API Docs:** [Swagger URL]
- **Notion/Confluence:** [URL] (si aplica)
- **Design System:** [Figma URL] (si aplica)

---

**Última actualización:** Enero 2026  
**Versión:** 1.0  
**Estado:** En desarrollo (MVP)
