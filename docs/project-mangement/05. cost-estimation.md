# 💰 Estimación de Costes Detallada

## 📊 Resumen Ejecutivo

**Inversión Inicial MVP:** 36€ (con herramientas IA) o 6€ (sin IA)  
**Coste Operativo Mensual (0-100 pedidos):** 6-36€/mes  
**Coste Operativo Mensual (100+ pedidos):** ~115€/mes  
**Break-even:** 2-3 ventas/mes (con margen 50%)

---

## 🎯 FASE MVP (Mes 1-3)

### Infraestructura Cloud

| Servicio | Plan | Coste Mensual | Notas |
|----------|------|---------------|-------|
| **Vercel** | Hobby | **$0** | ✅ 100GB bandwidth, suficiente para inicio |
| **Railway** | Starter | **$5** | ✅ Backend + PostgreSQL incluido |
| **Upstash Redis** | Free | **$0** | ✅ 10K commands/día |
| **Cloudflare** | Free | **$0** | ✅ CDN + DDoS protection |
| **Vercel Blob** | Free | **$0** | ✅ 1GB storage (modelos 3D) |
| **Dominio .com** | Anual | **~$1/mes** | ✅ Registro en Namecheap/Cloudflare |
| | | **$6/mes** | |

**Alternativa Railway → Render Free:**
- Render Free tier: $0 pero con sleep después de 15min inactividad
- **NO recomendado para producción**, solo desarrollo/staging

### Servicios Externos

| Servicio | Plan | Coste | Límites | Suficiente para MVP |
|----------|------|-------|---------|---------------------|
| **Stripe** | Pay-as-you-go | **$0 fijo** | 1.5% + 0.25€ por transacción | ✅ Solo pagas por venta |
| **Resend** | Free | **$0** | 100 emails/día, 3K/mes | ✅ Suficiente |
| **Sentry** | Developer | **$0** | 5K events/mes, 1 proyecto | ✅ Suficiente |
| **Better Stack** | Free | **$0** | 1GB logs/mes | ✅ Suficiente |
| **Google Analytics** | Free | **$0** | Ilimitado | ✅ Siempre gratis |
| **hCaptcha** | Free | **$0** | Ilimitado | ✅ Siempre gratis |
| | | **$0/mes** | | |

### Herramientas de Desarrollo (Opcional)

| Herramienta | Coste | Necesidad | Recomendación |
|-------------|-------|-----------|---------------|
| **Cursor IDE** | $20/mes | Alta | ✅ **RECOMENDADO** - ROI excelente |
| **GitHub Copilot** | $10/mes | Media | ✅ Acelera mucho |
| **Codeium** | $0 | Media | ✅ Alternativa gratuita a Copilot |
| **v0.dev** | $0-20/mes | Baja | ⚠️ Tier gratis suficiente |
| **Claude API** | Pay-per-use | Baja | ⚠️ Uso ocasional ~$5-10/mes |

**Configuración Recomendada:**
- **Con presupuesto:** Cursor ($20) + Copilot ($10) = **$30/mes**
- **Sin presupuesto:** Codeium (gratis) + Cursor trial = **$0/mes**

### 📊 TOTAL FASE MVP

```
MÍNIMO (sin IA):
  Infraestructura:    $6/mes
  Servicios:          $0/mes
  Herramientas:       $0/mes
  ────────────────────────
  TOTAL:              $6/mes

RECOMENDADO (con IA):
  Infraestructura:    $6/mes
  Servicios:          $0/mes
  Herramientas:       $30/mes
  ────────────────────────
  TOTAL:              $36/mes
```

**Costes Variables (por transacción):**
- Stripe: 1.5% + 0.25€
- Ejemplo con pedido 150€: 2.50€ de comisión

---

## 📈 FASE CRECIMIENTO (100+ pedidos/mes)

### Infraestructura Escalada

| Servicio | Plan Escalado | Coste | Mejoras |
|----------|---------------|-------|---------|
| **Vercel** | Pro | **$20/mes** | Mayor bandwidth, mejor DX |
| **Railway** | Scale | **$20/mes** | Más CPU/RAM, mejor performance |
| **Upstash Redis** | Pay-as-you-go | **$10/mes** | Más requests, mayor storage |
| **Cloudflare** | Free | **$0** | Sigue siendo suficiente |
| **Vercel Blob** | Pro | **$0.15/GB** | ~$5/mes estimado |
| **Dominio** | - | **$1/mes** | Sin cambios |
| | | **$56/mes** | |

### Servicios Escalados

| Servicio | Plan | Coste | Límites |
|----------|------|-------|---------|
| **Stripe** | Pay-as-you-go | **$0 fijo** | Sin cambios en pricing |
| **Resend** | Pro | **$20/mes** | 50K emails/mes |
| **Sentry** | Team | **$26/mes** | 50K events/mes, performance monitoring |
| **Better Stack** | Startup | **$18/mes** | 10GB logs/mes, alertas avanzadas |
| **Google Analytics** | Free | **$0** | Sin cambios |
| **hCaptcha** | Free | **$0** | Sin cambios |
| | | **$64/mes** | |

### 📊 TOTAL FASE CRECIMIENTO

```
Infraestructura:     $56/mes
Servicios:           $64/mes
Herramientas IA:     $30/mes (opcional, mismo)
────────────────────────────
TOTAL:               $150/mes (sin IA)
                     $180/mes (con IA)
```

**Costes Variables:**
- Stripe: 1.5% + 0.25€ por transacción
- Con 100 pedidos/mes a 150€ avg:
  - Facturación: 15,000€
  - Comisiones Stripe: ~250€
  - Margen neto tras comisiones: ~7,250€ (con 50% margen bruto)

---

## 💼 ANÁLISIS DE BREAK-EVEN

### Supuestos Base

```
Ticket Medio:         150€
Margen Bruto:         50% (75€ por venta)
Coste Fijo Mensual:   36€ (MVP con IA)
```

### Cálculo Break-Even

```
Ventas necesarias = Coste Fijo / Margen por Venta
                  = 36€ / 75€
                  = 0.48 ventas

Break-even: 1 venta/mes (redondeado)
```

### Escenarios de Rentabilidad

| Ventas/Mes | Facturación | Margen Bruto | Costes Fijos | Stripe | **Beneficio Neto** |
|------------|-------------|--------------|--------------|--------|-------------------|
| 1 | 150€ | 75€ | -36€ | -2.50€ | **+36.50€** |
| 5 | 750€ | 375€ | -36€ | -12.50€ | **+326.50€** |
| 10 | 1,500€ | 750€ | -36€ | -25€ | **+689€** |
| 50 | 7,500€ | 3,750€ | -56€ | -125€ | **+3,569€** |
| 100 | 15,000€ | 7,500€ | -120€ | -250€ | **+7,130€** |
| 200 | 30,000€ | 15,000€ | -150€ | -500€ | **+14,350€** |

**Notas:**
- Costes fijos aumentan en escenarios 50+ ventas (upgrade a planes Pro)
- Margen bruto 50% es conservador para productos personalizados
- No incluye costes de componentes/fabricación (asumidos en margen)

---

## 🔄 EVOLUCIÓN DE COSTES POR FASE

### Mes 1: Desarrollo MVP
```
Infraestructura:    $6
Herramientas IA:    $30 (opcional)
Tiempo desarrollo:  160h (1 mes full-time)
────────────────────────
TOTAL:              $36/mes
```

**Coste de Desarrollo (si contratado):**
- Desarrollador senior: ~60€/h × 160h = **9,600€**
- **Ahorro con IA:** ~30% = **ahorras ~3,000€**
- **ROI de herramientas IA:** 30€/mes vs 3,000€ ahorrados = **100x ROI**

### Mes 2-3: Primeras Ventas
```
Infraestructura:    $6
Servicios:          $0
Herramientas:       $30
────────────────────────
TOTAL:              $36/mes

Ingresos esperados: 5-10 ventas
Facturación:        750€-1,500€
Beneficio neto:     ~350€-700€/mes
```

### Mes 4-6: Crecimiento
```
Infraestructura:    $20-56 (según crecimiento)
Servicios:          $0-64 (según volumen emails)
Herramientas:       $30
────────────────────────
TOTAL:              $50-150/mes

Ingresos esperados: 20-50 ventas
Facturación:        3,000€-7,500€
Beneficio neto:     ~1,400€-3,600€/mes
```

### Mes 7+: Madurez
```
Infraestructura:    $56
Servicios:          $64
Herramientas:       $30
────────────────────────
TOTAL:              $150/mes

Ingresos objetivo:  100+ ventas
Facturación:        15,000€+
Beneficio neto:     ~7,000€+/mes
```

---

## 💳 DESGLOSE DE COMISIONES STRIPE

### Estructura de Costes Stripe (EU)

```
Tarjeta EU:         1.5% + 0.25€
Tarjeta no-EU:      2.9% + 0.25€ (futuro con clientes internacionales)
```

### Ejemplos de Comisión por Ticket

| Importe Pedido | Comisión Stripe | % Real |
|----------------|-----------------|--------|
| 50€ | 1.00€ | 2.0% |
| 100€ | 1.75€ | 1.75% |
| 150€ | 2.50€ | 1.67% |
| 200€ | 3.25€ | 1.63% |
| 300€ | 4.75€ | 1.58% |

**Observación:** A mayor ticket, menor % de comisión efectiva.

### Comisiones Mensuales Proyectadas

| Ventas/Mes | Ticket Medio | Facturación | Comisión Stripe | % sobre Facturación |
|------------|--------------|-------------|-----------------|---------------------|
| 10 | 150€ | 1,500€ | 25€ | 1.67% |
| 50 | 150€ | 7,500€ | 125€ | 1.67% |
| 100 | 150€ | 15,000€ | 250€ | 1.67% |

---

## 🎯 OPTIMIZACIÓN DE COSTES

### Estrategias MVP (0-50 ventas/mes)

**✅ Mantener:**
- Railway Starter ($5) - Relación calidad-precio excelente
- Vercel Hobby - Más que suficiente
- Tiers gratuitos de servicios

**❌ Evitar:**
- Servicios premium innecesarios
- CDN pagado (Cloudflare free es suficiente)
- Monitoring enterprise (Sentry free es OK)

**💡 Optimizaciones:**
1. **Comprimir modelos 3D:** < 1MB cada uno para ahorrar bandwidth
2. **Lazy load:** Cargar visor 3D solo cuando necesario
3. **Cache agresivo:** Redis para productos populares
4. **Images optimizadas:** WebP con next/image

### Estrategias Crecimiento (50-200 ventas/mes)

**⬆️ Upgrades Prioritarios:**
1. **Railway Scale ($20)** - Más performance para backend
2. **Vercel Pro ($20)** - Mejor bandwidth y build times
3. **Resend Pro ($20)** - Más emails sin límite diario
4. **Sentry Team ($26)** - Monitoring profesional

**⏸️ Mantener Gratis:**
- Cloudflare (suficiente hasta 1M+ requests)
- Google Analytics
- hCaptcha

**💡 Optimizaciones:**
1. **CDN adicional:** Considerar BunnyCDN para assets (muy barato)
2. **Database optimization:** Índices, query optimization
3. **Cron jobs:** Limpiar datos viejos (sesiones, configs expiradas)

### Estrategias Escala (200+ ventas/mes)

**🚀 Considerar:**
- **PostgreSQL dedicado** en lugar de Railway shared
- **Redis dedicado** con más memoria
- **WAF** (Web Application Firewall) si hay ataques
- **Backup service** profesional (no solo Supabase)

**Costes Adicionales Potenciales:**
- Soporte técnico dedicado: $100-500/mes
- Backup avanzado: $20-50/mes
- WAF: $20-100/mes

---

## 📊 COMPARATIVA DE ALTERNATIVAS

### Hosting Backend

| Provider | Coste | Pros | Contras | Decisión |
|----------|-------|------|---------|----------|
| **Railway** | $5/mes | Setup fácil, PG incluido | Más caro escalando | ✅ **MVP** |
| **Render** | Free/$7 | Free tier disponible | Sleep en free, lento cold start | ⚠️ Solo staging |
| **Fly.io** | ~$5-10 | Global edge, rápido | Más complejo setup | 🔄 Considerar futuro |
| **AWS ECS** | Variable | Escalabilidad infinita | Complejo, caro inicial | 🔜 Largo plazo |
| **DigitalOcean** | $6/mes | Simple, predecible | Manual setup | 🔄 Alternativa |

**Recomendación:** Railway para MVP, considerar Fly.io si necesitas multi-región.

### Email Service

| Provider | Free Tier | Coste Paid | Deliverability | Decisión |
|----------|-----------|------------|----------------|----------|
| **Resend** | 3K/mes | $20/mes (50K) | ⭐⭐⭐⭐⭐ | ✅ **ELEGIDO** |
| **SendGrid** | 100/día | $15/mes (40K) | ⭐⭐⭐⭐ | 🔄 Alternativa |
| **AWS SES** | 62K/mes | $0.10/1K | ⭐⭐⭐⭐⭐ | 🔜 Si > 100K/mes |
| **Postmark** | 100/mes | $15/mes (10K) | ⭐⭐⭐⭐⭐ | ⚠️ Caro |

**Recomendación:** Resend por API moderna y tier gratuito generoso.

### Monitoring

| Provider | Free Tier | Coste Paid | Features | Decisión |
|----------|-----------|------------|----------|----------|
| **Sentry** | 5K events | $26/mes (50K) | Error tracking + Performance | ✅ **ELEGIDO** |
| **Datadog** | 14 días trial | $15/host/mes | Todo-en-uno | ⚠️ Caro |
| **New Relic** | 100GB/mes | $99/usuario | APM completo | ⚠️ Overkill |
| **LogRocket** | 1K sessions | $99/mes | Session replay | 🔜 Considerar |

**Recomendación:** Sentry free para MVP, upgrade a Team cuando crezcas.

---

## 🎓 LECCIONES Y RECOMENDACIONES

### Do's ✅

1. **Empezar con tiers gratuitos**
   - Railway, Vercel, Resend, Sentry todos tienen free tiers generosos
   - Solo pagar cuando realmente necesites más

2. **Invertir en herramientas IA**
   - $30/mes en IA → Ahorras ~40h/mes → ROI brutal
   - Cursor + Copilot > trabajar sin ellos

3. **Monitorear costes desde día 1**
   - Vercel/Railway dashboards muestran uso
   - Configurar alertas de billing
   - No sorpresas de facturación

4. **Optimizar assets agresivamente**
   - Modelos 3D < 1MB
   - Imágenes WebP
   - Lazy loading todo lo pesado

5. **Elegir servicios con free tiers buenos**
   - Permite crecer sin cambiar stack
   - Menos migraciones = menos riesgo

### Don'ts ❌

1. **No pagar por servicios enterprise desde inicio**
   - No necesitas Datadog, New Relic, etc. en MVP
   - Sentry free es más que suficiente

2. **No sobreestimar tráfico inicial**
   - 100GB bandwidth/mes de Vercel = ~10K visitantes
   - Suficiente para primeros meses

3. **No infraestructura on-premise**
   - Mantener un servidor propio > $50/mes + tiempo
   - Cloud managed es más barato inicialmente

4. **No múltiples ambientes pagados**
   - 1 staging en Railway free/Render free
   - 1 production en Railway paid
   - No necesitas dev/staging/qa/prod en MVP

5. **No bases de datos separadas innecesarias**
   - PostgreSQL puede manejar Redis-like workloads con JSONB
   - Solo añade Redis cuando realmente necesites

---

## 💡 CHECKLIST DE OPTIMIZACIÓN

### Antes de Lanzar MVP

- [ ] Modelos 3D optimizados (< 1MB cada uno)
- [ ] Imágenes comprimidas y en WebP
- [ ] Lazy loading configurado
- [ ] Cache Redis implementado para catálogo
- [ ] Queries de BD con índices apropiados
- [ ] Lighthouse score > 90
- [ ] Verificar límites de free tiers

### Mensualmente (Post-Lanzamiento)

- [ ] Revisar dashboards de billing (Vercel, Railway)
- [ ] Analizar logs de Sentry (cuántos errores)
- [ ] Verificar uso de Resend (cuántos emails)
- [ ] Revisar hit rate de cache (Redis)
- [ ] Identificar queries lentas (PostgreSQL)
- [ ] Decidir si necesitas upgrades

### Antes de Escalar (50+ ventas/mes)

- [ ] Evaluar upgrade a Railway Scale
- [ ] Considerar Vercel Pro
- [ ] Upgrade Resend si > 3K emails/mes
- [ ] Implementar más índices de BD
- [ ] Considerar CDN adicional para assets

---

## 📈 PROYECCIÓN FINANCIERA

### Escenario Conservador (Año 1)

| Mes | Ventas | Facturación | Costes | Beneficio |
|-----|--------|-------------|--------|-----------|
| 1-3 | 5 | 750€ | -36€ | +314€ |
| 4-6 | 15 | 2,250€ | -50€ | +925€ |
| 7-9 | 30 | 4,500€ | -80€ | +1,845€ |
| 10-12 | 50 | 7,500€ | -120€ | +3,055€ |
| **TOTAL** | **600** | **90,000€** | **~1,200€** | **~43,800€** |

### Escenario Optimista (Año 1)

| Mes | Ventas | Facturación | Costes | Beneficio |
|-----|--------|-------------|--------|-----------|
| 1-3 | 10 | 1,500€ | -36€ | +689€ |
| 4-6 | 30 | 4,500€ | -80€ | +1,845€ |
| 7-9 | 70 | 10,500€ | -120€ | +4,630€ |
| 10-12 | 120 | 18,000€ | -150€ | +8,350€ |
| **TOTAL** | **1,380** | **207,000€** | **~1,500€** | **~102,000€** |

**Notas:**
- Supone margen bruto 50%
- No incluye costes de fabricación (asumidos en margen)
- No incluye impuestos
- No incluye salarios (proyecto individual)

---

## 🎯 CONCLUSIONES

### Inversión Inicial

```
✅ VIABLE: Solo $6-36/mes para MVP funcional
✅ BAJO RIESGO: Sin compromisos anuales
✅ ESCALABLE: Pay-as-you-grow
```

### ROI de Herramientas IA

```
Inversión: $30/mes
Ahorro tiempo: ~40h/mes
Valor tiempo: ~60€/h
ROI: 80x (2,400€ valor vs 30€ coste)

CONCLUSIÓN: IMPRESCINDIBLE para desarrollador individual
```

### Break-even

```
Con 1 venta/mes cubres costes
Con 2-3 ventas/mes: rentable
Con 10+ ventas/mes: muy rentable

CONCLUSIÓN: Riesgo financiero MÍNIMO
```

### Recomendación Final

**Para MVP:**
```
Infraestructura: $6/mes (Railway + Vercel + free tiers)
Herramientas IA: $30/mes (Cursor + Copilot)
TOTAL: $36/mes

→ Rentable desde primera venta
→ Sin riesgo financiero
→ Escalable sin cambios de stack
```

---

**Última actualización:** Enero 2026  
**Próxima revisión:** Post-MVP (actualizar con datos reales)  
**Nota:** Precios sujetos a cambios de proveedores, verificar antes de contratar
