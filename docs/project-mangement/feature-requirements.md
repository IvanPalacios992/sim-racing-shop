# 📋 Requisitos Funcionales Detallados

## 🎯 Alcance

Este documento detalla todos los requisitos funcionales del MVP de SimRacing Shop. Cada feature incluye criterios de aceptación y prioridad.

**Leyenda de Prioridad:**
- 🔴 **P0 - Crítico:** Bloqueante para MVP
- 🟠 **P1 - Alto:** Importante para MVP
- 🟡 **P2 - Medio:** Deseable en MVP
- 🟢 **P3 - Bajo:** Post-MVP

---

## 1. AUTENTICACIÓN Y USUARIOS

### 1.1 Registro de Usuario 🔴 P0

**Descripción:** Los usuarios pueden crear una cuenta en la plataforma.

**Criterios de Aceptación:**
- Usuario puede registrarse con email y contraseña
- Validación de email (formato válido)
- Contraseña mínimo 8 caracteres, 1 mayúscula, 1 número
- Email debe ser único en el sistema
- Envío de email de verificación (opcional en MVP)
- Mensajes de error claros si falla registro
- CAPTCHA para prevenir bots

**Campos del Formulario:**
- Email* (required)
- Contraseña* (required)
- Confirmar contraseña* (required)
- Nombre (optional)
- Apellidos (optional)
- Checkbox aceptar términos y condiciones*

**Validaciones:**
```
- Email: formato válido + único
- Contraseña: min 8 chars, 1 uppercase, 1 number
- Contraseñas coinciden
- Términos aceptados
- CAPTCHA válido
```

---

### 1.2 Login 🔴 P0

**Descripción:** Usuarios registrados pueden iniciar sesión.

**Criterios de Aceptación:**
- Login con email y contraseña
- JWT token generado al autenticar
- Token almacenado de forma segura
- Redirect a página anterior o home tras login
- Mensajes de error claros (credenciales incorrectas)
- Opción "Recordarme" (refresh token)
- Link "¿Olvidaste tu contraseña?"

**Flujo:**
```
1. Usuario ingresa email/password
2. Backend valida credenciales
3. Genera JWT + refresh token
4. Frontend guarda tokens
5. Redirect a destino
```

---

### 1.3 Recuperación de Contraseña 🔴 P0

**Descripción:** Usuarios pueden recuperar acceso si olvidan su contraseña.

**Criterios de Aceptación:**
- Usuario ingresa su email
- Sistema envía email con link de reset
- Link válido por 1 hora
- Usuario puede establecer nueva contraseña
- Contraseña anterior no puede reutilizarse (opcional)
- Notificación por email de cambio exitoso

**Flujo:**
```
1. Usuario solicita reset (ingresa email)
2. Sistema genera token único
3. Envía email con link (valid 1h)
4. Usuario hace clic en link
5. Formulario nueva contraseña
6. Actualiza y notifica por email
```

---

### 1.4 Área de Usuario 🔴 P0

**Descripción:** Dashboard personal donde el usuario gestiona su información.

**Secciones:**

**1.4.1 Perfil**
- Ver y editar información personal
- Cambiar contraseña
- Configurar idioma preferido

**Campos Editables:**
- Nombre
- Apellidos
- Teléfono
- Idioma (es/en)

**1.4.2 Direcciones**
- Ver direcciones guardadas
- Añadir nueva dirección
- Editar dirección existente
- Eliminar dirección
- Marcar dirección por defecto

**1.4.3 Historial de Pedidos**
- Ver lista de pedidos realizados
- Filtrar por estado
- Ver detalle de cada pedido
- Descargar factura (futuro)

---

### 1.5 Roles de Usuario 🔴 P0

**Descripción:** Sistema de roles para diferenciar permisos.

**Roles en MVP:**
- **Customer (por defecto):** Comprar productos
- **Admin:** Acceso completo al panel de administración

**Permisos Admin:**
- Gestionar productos y componentes
- Ver todos los pedidos
- Cambiar estados de pedidos
- Ver dashboard de métricas
- Gestionar usuarios (ver lista)

---

### 1.6 Autenticación de Dos Factores (2FA) 🟠 P1

**Descripción:** Seguridad adicional para cuentas de administrador.

**Criterios de Aceptación:**
- Solo requerido para usuarios admin
- TOTP (Time-based One-Time Password)
- QR code para configurar (Google Authenticator, Authy)
- Códigos de backup generados
- Opción de desactivar 2FA

**Flujo:**
```
1. Admin activa 2FA en configuración
2. Sistema genera secreto TOTP
3. Muestra QR code
4. Admin escanea con app authenticator
5. Ingresa código para verificar
6. Genera códigos de backup
7. Login requiere código adicional
```

---

## 2. CATÁLOGO DE PRODUCTOS

### 2.1 Listado de Productos 🔴 P0

**Descripción:** Página principal del catálogo mostrando todos los productos.

**Criterios de Aceptación:**
- Grid responsive de productos
- Mostrar imagen principal, nombre, precio
- Badge "Personalizable" si aplica
- Badge "Bajo stock" si aplica
- Paginación o infinite scroll
- Loading states mientras carga
- Empty state si no hay productos

**Filtros 🟠 P1:**
- Por categoría (si hay múltiples)
- Rango de precio
- Disponibilidad (en stock / bajo stock)
- Ordenar por: precio (asc/desc), nombre, más reciente

**Búsqueda 🟡 P2:**
- Barra de búsqueda
- Full-text search en nombre y descripción
- Resultados mientras escribe (debounced)

**Elementos por Producto:**
```
- Imagen principal
- Nombre del producto
- Precio base (desde X€)
- Badge personalizable
- Badge bajo stock
- Botón "Ver detalles"
```

---

### 2.2 Detalle de Producto 🔴 P0

**Descripción:** Página individual con toda la información de un producto.

**Criterios de Aceptación:**
- URL amigable: `/productos/{slug}`
- Multiidioma: `/es/productos/{slug}` y `/en/products/{slug}`
- Galería de imágenes (múltiples fotos)
- Información completa del producto
- Botón "Personalizar en 3D"
- Especificaciones técnicas
- Precio con IVA incluido
- Tiempo estimado de fabricación

**Secciones:**

**1. Galería de Imágenes**
- Imagen principal grande
- Thumbnails de otras imágenes
- Zoom al hacer hover
- Lightbox al hacer clic (opcional)

**2. Información Básica**
- Nombre del producto
- SKU visible
- Descripción corta
- Precio base (con IVA)
- Badge "Personalizable"
- Indicador de disponibilidad

**3. Descripción Detallada**
- Descripción larga con formato
- Características principales
- Materiales utilizados
- Compatibilidad (con qué bases funciona)

**4. Especificaciones Técnicas 🟠 P1**
Tabla con:
- Dimensiones (largo × ancho × alto)
- Peso
- Materiales
- Conectividad
- Compatibilidad
- Garantía

**5. CTA (Call to Action)**
- Botón grande "Personalizar en 3D"
- O "Añadir al carrito" si no personalizable

**SEO 🔴 P0:**
- Meta title y description únicos
- JSON-LD schema Product
- OpenGraph tags
- Imágenes con alt text
- Canonical URL

---

### 2.3 Búsqueda de Productos 🟡 P2

**Descripción:** Funcionalidad de búsqueda global.

**Criterios de Aceptación:**
- Barra de búsqueda en header
- Búsqueda en nombre, descripción, SKU
- Resultados relevantes
- Destacar términos encontrados
- Link a página de resultados completa

**Nice to Have:**
- Autocompletado mientras escribe
- Búsqueda por voz (futuro)
- Historial de búsquedas (futuro)

---

## 3. CONFIGURADOR 3D

### 3.1 Visor 3D Base 🔴 P0

**Descripción:** Visualización interactiva del producto en 3D.

**Criterios de Aceptación:**
- Cargar modelo GLB del producto
- Controles de órbita (rotar, zoom, pan)
- Responsive (funciona en mobile con touch)
- Loading indicator mientras carga modelo
- Fallback si el modelo no carga
- Performance 60fps mínimo
- Botón "Reset camera" para volver a vista inicial

**Controles:**
- **Mouse:** Click + drag para rotar, scroll para zoom
- **Touch:** Swipe para rotar, pinch para zoom
- **Teclado:** Flechas para rotar (opcional)

**Lighting:**
- Iluminación ambiente adecuada
- Environment map para reflejos realistas
- Sombras de contacto (opcional)

---

### 3.2 Personalización de Componentes 🔴 P0

**Descripción:** Usuario puede personalizar elementos del producto.

**Criterios de Aceptación:**
- Panel de opciones junto al visor 3D
- Cambios se reflejan en tiempo real en el modelo
- Cada opción muestra precio adicional (si aplica)
- Validación de combinaciones válidas
- Precio total se actualiza automáticamente
- Indicador de componentes bajo stock

**Tipos de Personalización:**

**1. Color/Material de Grips**
- Color picker o paleta predefinida
- Vista previa del color
- Cambia material del mesh en 3D

**2. Configuración de Botones**
- Selección de layout (racing, rally, drift)
- Cantidad de botones
- Tipo de botones (push, toggle)

**3. Placa Frontal**
- Texto personalizado (máx 15 caracteres)
- Preview en tiempo real en el modelo
- Font predefinido

**4. Base/Soporte**
- Selección de tipo de base
- Compatibilidad validada

**Validaciones:**
- Verificar componentes disponibles en stock
- No permitir configuraciones inválidas
- Mostrar mensaje si componente bajo stock
- Calcular tiempo adicional de fabricación

---

### 3.3 Guardado de Configuración 🔴 P0

**Descripción:** Usuario puede guardar su configuración personalizada.

**Criterios de Aceptación:**
- Botón "Guardar configuración"
- Genera URL única compartible
- Configuración persiste en BD
- Puede cargarse desde URL
- Asociada a usuario (si está logueado) o anónima

**Funcionalidades:**
- Copiar URL al clipboard
- Compartir en redes sociales (opcional)
- Ver configuraciones guardadas en perfil (futuro)
- Botón "Comprar desde configuración compartida"

**URL Formato:**
```
https://simracingshop.com/config/{token}
```

---

### 3.4 Cálculo de Precio Dinámico 🔴 P0

**Descripción:** El precio se actualiza según personalización.

**Criterios de Aceptación:**
- Precio base del producto
- + Modificadores de cada opción seleccionada
- Mostrar desglose (opcional):
  - Precio base: X€
  - Grips personalizados: +Y€
  - Botones premium: +Z€
  - **Total: (X+Y+Z)€ + IVA**
- Siempre mostrar con IVA incluido
- Actualización instantánea al cambiar opciones

---

### 3.5 Tiempo de Fabricación Estimado 🟠 P1

**Descripción:** Mostrar tiempo estimado según configuración.

**Criterios de Aceptación:**
- Tiempo base de fabricación del producto
- + Tiempo adicional si componente bajo stock
- Mostrar mensaje claro: "Listo en 7-10 días"
- Color warning si tiempo extendido
- Explicar por qué se extiende (componente X bajo stock)

**Cálculo:**
```
Tiempo total = Base + Lead time de componentes bajo stock
```

---

## 4. CARRITO DE COMPRA

### 4.1 Añadir al Carrito 🔴 P0

**Descripción:** Usuario puede añadir productos configurados al carrito.

**Criterios de Aceptación:**
- Botón "Añadir al carrito" visible
- Validar configuración completa antes de añadir
- Toast/notificación de éxito
- Badge en icono de carrito se actualiza
- Persiste en BD (si usuario logueado) o sessionStorage
- Poder añadir mismo producto con configs diferentes

---

### 4.2 Ver Carrito 🔴 P0

**Descripción:** Página del carrito con todos los items.

**Criterios de Aceptación:**
- Lista de todos los items
- Por cada item mostrar:
  - Thumbnail (imagen o captura 3D)
  - Nombre del producto
  - Configuración resumida
  - Precio unitario
  - Cantidad
  - Subtotal
  - Botón eliminar
- Resumen de precios:
  - Subtotal
  - IVA (21%)
  - Envío (calculado en checkout)
  - Total
- Botón "Proceder al pago"
- Botón "Seguir comprando"

**Empty State:**
- Mensaje "Tu carrito está vacío"
- CTA "Ver productos"

---

### 4.3 Editar Cantidad 🔴 P0

**Descripción:** Modificar cantidad de items en carrito.

**Criterios de Aceptación:**
- Input numérico o +/- botones
- Cantidad mínima: 1
- Cantidad máxima: 10 (configurable)
- Actualización optimista (instantánea en UI)
- Sincronización con backend
- Recalcular totales automáticamente

---

### 4.4 Eliminar Item 🔴 P0

**Descripción:** Quitar producto del carrito.

**Criterios de Aceptación:**
- Botón/icono eliminar visible
- Confirmación antes de eliminar (opcional)
- Animación de salida
- Toast "Producto eliminado"
- Opción "Deshacer" (opcional)
- Recalcular totales

---

### 4.5 Merge de Carritos 🟠 P1

**Descripción:** Al hacer login, fusionar carrito anónimo con carrito del usuario.

**Criterios de Aceptación:**
- Si usuario tiene items en sessionStorage antes de login
- Tras login, mergear con carrito en BD
- No duplicar items idénticos (sumar cantidades)
- Mantener todas las configuraciones
- Notificar usuario si hay merge

---

## 5. CHECKOUT Y PAGOS

### 5.1 Flujo de Checkout 🔴 P0

**Descripción:** Proceso guiado de finalización de compra en 3 pasos.

**Step 1: Dirección de Envío**
- Formulario de dirección completo
- Campos: nombre, calle, ciudad, código postal, país
- Validación de código postal
- Opción seleccionar dirección guardada (si usuario registrado)
- Checkbox "Guardar esta dirección"
- Botón "Continuar"

**Step 2: Método de Pago**
- Selección de método (Stripe en MVP)
- Formulario de tarjeta (Stripe Elements)
- Validación en tiempo real
- Checkbox "Guardar tarjeta" (NO en MVP, solo Stripe tokeniza)
- Botón "Continuar"

**Step 3: Resumen y Confirmación**
- Resumen completo del pedido:
  - Items con configuraciones
  - Dirección de envío
  - Método de pago (últimos 4 dígitos)
  - Desglose de precios completo
- Tiempo estimado de fabricación total
- Checkbox "Acepto términos y condiciones"
- Botón "Confirmar y pagar"

**Criterios Generales:**
- Progress indicator (1/3, 2/3, 3/3)
- Poder volver al paso anterior
- Auto-save del progreso
- Validación en cada paso antes de avanzar

---

### 5.2 Cálculo de Envío 🔴 P0

**Descripción:** Calcular coste de envío según zona y peso.

**Criterios de Aceptación:**
- Detectar zona por código postal:
  - Península (01-52): Base 5€ + 0.50€/kg
  - Baleares (07): Base 10€ + 1€/kg
  - Canarias (35, 38): Base 15€ + 1.50€/kg
- Calcular peso total del pedido
- Aplicar fórmula: `coste = base + (peso_kg * tarifa)`
- Mostrar coste antes de pago
- Aplicar envío gratis si pedido > umbral:
  - Península: > 100€
  - Baleares: > 150€
  - Canarias: > 200€

**Validaciones:**
- CP válido
- Zona soportada
- Peso calculado correctamente

---

### 5.3 Integración con Stripe 🔴 P0

**Descripción:** Procesamiento de pagos con tarjeta.

**Criterios de Aceptación:**
- Stripe Elements embebido
- SCA (3D Secure) compliant
- PaymentIntent creado en backend
- Confirmación de pago
- Webhooks configurados:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
- No almacenar datos de tarjeta (Stripe tokeniza)
- Manejo de errores:
  - Tarjeta rechazada
  - Fondos insuficientes
  - Timeout
  - Error de red

**Flujo Técnico:**
```
1. Usuario ingresa datos tarjeta
2. Frontend crea PaymentIntent en backend
3. Backend llama Stripe API
4. Stripe retorna client_secret
5. Frontend confirma con Stripe Elements
6. Stripe procesa pago (3DS si necesario)
7. Webhook notifica resultado
8. Backend actualiza estado pedido
9. Frontend muestra confirmación
```

---

### 5.4 Página de Confirmación 🔴 P0

**Descripción:** Confirmación tras pago exitoso.

**Criterios de Aceptación:**
- URL: `/pedido/{orderId}/confirmacion`
- Mensaje de éxito claro
- Número de pedido destacado
- Resumen del pedido
- Tiempo estimado de fabricación
- Información de contacto
- Botón "Ver mis pedidos"
- Envío de email de confirmación

**Contenido:**
```
✅ ¡Pedido confirmado!

Número de pedido: #ORD-2026-0042
Total pagado: 234.50€

Tu pedido está en producción.
Tiempo estimado: 7-10 días laborables.

Recibirás un email cuando se envíe.
```

---

### 5.5 Emails Transaccionales 🔴 P0

**Descripción:** Notificaciones por email en cada fase.

**Emails a Implementar:**

**1. Confirmación de Registro**
- Subject: "Bienvenido a SimRacing Shop"
- Contenido: Bienvenida, link verificar email (opcional)

**2. Recuperación de Contraseña**
- Subject: "Restablece tu contraseña"
- Contenido: Link para reset (válido 1h)

**3. Confirmación de Pedido**
- Subject: "Pedido confirmado #ORD-XXXX"
- Contenido:
  - Número de pedido
  - Items con configuraciones
  - Total pagado
  - Dirección de envío
  - Tiempo estimado
  - Link para seguimiento

**4. Cambio de Estado (Futuro)**
- Subject: "Tu pedido #ORD-XXXX está [en producción/enviado]"

**Requisitos Técnicos:**
- HTML responsive (funciona en todos los clientes)
- Inline CSS
- Incluir logo y branding
- Links funcionando
- Footer con datos legales

---

## 6. GESTIÓN DE STOCK Y COMPONENTES

### 6.1 Sistema de Componentes 🔴 P0

**Descripción:** Base de datos de componentes que forman productos.

**Criterios de Aceptación:**
- Tabla `components` en BD
- Atributos:
  - SKU único
  - Nombre (multiidioma)
  - Tipo (grip, button_plate, base, etc)
  - Stock actual
  - Umbral de bajo stock
  - Lead time adicional (días)
  - Peso
  - Coste
- Asociación muchos-a-muchos con productos
- Admin puede crear/editar/eliminar componentes

---

### 6.2 Control de Stock 🔴 P0

**Descripción:** Monitoreo y gestión de inventario.

**Criterios de Aceptación:**
- Stock se descuenta al confirmar pedido (no al añadir carrito)
- Trigger de BD para actualizar stock automáticamente
- Alerta automática si stock < umbral
- No permitir comprar si stock = 0
- Mostrar "Bajo stock" si stock < umbral pero > 0
- Admin puede ajustar stock manualmente

**Lógica de Descuento:**
```
Al confirmar pedido:
  Por cada item:
    Por cada componente en configuración:
      stock_actual -= cantidad_usada
```

---

### 6.3 Validación de Disponibilidad 🔴 P0

**Descripción:** Verificar que configuración es fabricable.

**Criterios de Aceptación:**
- Antes de añadir al carrito: verificar componentes disponibles
- En checkout: re-verificar disponibilidad
- Si componente agotado: no permitir proceder
- Si componente bajo stock: advertir tiempo extendido
- Mensaje claro al usuario sobre qué falta

---

### 6.4 Tiempo de Fabricación Dinámico 🟠 P1

**Descripción:** Calcular tiempo real según disponibilidad.

**Criterios de Aceptación:**
- Tiempo base del producto (ej: 7 días)
- + Lead time de componentes bajo stock
- Mostrar en detalle de producto
- Mostrar en carrito
- Mostrar en confirmación

**Ejemplo:**
```
Producto base: 7 días
+ Grip rojo bajo stock: +3 días
= Total estimado: 10 días
```

---

## 7. PANEL DE ADMINISTRACIÓN

### 7.1 Dashboard 🔴 P0

**Descripción:** Página principal del admin con métricas.

**Criterios de Aceptación:**
- Solo accesible por usuarios admin
- KPIs principales:
  - Ventas del día
  - Ventas del mes
  - Pedidos pendientes
  - Productos más vendidos
  - Componentes bajo stock
- Gráficos básicos (opcional en MVP):
  - Ventas por día (línea)
  - Productos más vendidos (barra)
- Links rápidos a secciones

**Métricas Mínimas:**
```
- Total ventas hoy: X€
- Total ventas mes: Y€
- Pedidos pendientes: N
- Componentes bajo stock: M
```

---

### 7.2 Gestión de Pedidos 🔴 P0

**Descripción:** Ver y gestionar todos los pedidos.

**Criterios de Aceptación:**
- Tabla de pedidos con columnas:
  - Número de pedido
  - Cliente
  - Fecha
  - Total
  - Estado
  - Acciones
- Filtros:
  - Por estado
  - Por fecha (rango)
  - Por cliente (buscar)
- Ordenar por fecha, total, estado
- Paginación
- Acceso al detalle de cada pedido

**Vista Detalle de Pedido:**
- Toda la información:
  - Datos del cliente
  - Dirección de envío
  - Items con configuraciones
  - Visor 3D de cada configuración
  - Desglose de precios
  - Método de pago
  - Estado actual
  - Historial de cambios de estado
- Acciones:
  - Cambiar estado (dropdown)
  - Añadir notas internas
  - Ver componentes necesarios
  - Imprimir (futuro)

---

### 7.3 Cambio de Estado de Pedidos 🔴 P0

**Descripción:** Admin puede actualizar el estado de un pedido.

**Estados Posibles:**
- **Pending:** Pago pendiente
- **Paid:** Pago confirmado
- **In Production:** En fabricación
- **Shipped:** Enviado
- **Completed:** Entregado
- **Cancelled:** Cancelado

**Criterios de Aceptación:**
- Dropdown con estados disponibles
- Confirmación antes de cambiar
- Se registra en `order_status_history`
- Se registra quién hizo el cambio
- Email automático al cliente (opcional en MVP)
- Validar transiciones (no saltar estados ilógicamente)

**Transiciones Válidas:**
```
Pending → Paid → In Production → Shipped → Completed
         ↓
      Cancelled (desde cualquier estado pre-shipped)
```

---

### 7.4 Gestión de Productos 🔴 P0

**Descripción:** CRUD completo de productos.

**Funcionalidades:**

**Listar Productos:**
- Tabla con todos los productos
- Columnas: imagen, nombre, SKU, precio, activo
- Filtros: activo/inactivo, categoría
- Búsqueda por nombre/SKU
- Botón "Nuevo producto"

**Crear/Editar Producto:**
- Formulario con pestañas:
  - **General:** SKU, precio base, peso
  - **Traducciones:** Nombre, descripción (es/en)
  - **Imágenes:** Subir múltiples imágenes
  - **Modelo 3D:** Subir archivo GLB
  - **Especificaciones:** Tabla de specs
  - **Componentes:** Asociar componentes disponibles
- Validaciones completas
- Preview antes de guardar
- Botón "Publicar" / "Guardar borrador"

**Eliminar Producto:**
- Confirmación
- No eliminar si tiene pedidos asociados (soft delete)

---

### 7.5 Gestión de Componentes 🔴 P0

**Descripción:** CRUD completo de componentes.

**Funcionalidades:**

**Listar Componentes:**
- Tabla con todos los componentes
- Columnas: SKU, nombre, tipo, stock, acciones
- Indicador visual de nivel de stock:
  - Verde: stock > umbral
  - Naranja: stock ≤ umbral
  - Rojo: stock = 0
- Filtrar por tipo, bajo stock
- Búsqueda por nombre/SKU

**Crear/Editar Componente:**
- Formulario:
  - SKU* (único)
  - Tipo* (select)
  - Stock actual*
  - Umbral bajo stock* (default 5)
  - Lead time* (días adicionales)
  - Peso (gramos)
  - Coste
  - Traducciones (nombre, descripción)
- Validaciones
- Botón "Guardar"

**Ajustar Stock:**
- Input inline en tabla
- O modal "Ajustar stock"
- Ingresar nueva cantidad
- Guardar log de ajustes

---

### 7.6 Gestión de Usuarios 🟡 P2

**Descripción:** Ver lista de usuarios registrados.

**Criterios de Aceptación:**
- Tabla de usuarios
- Columnas: email, nombre, rol, fecha registro
- Búsqueda por email/nombre
- Ver detalle de usuario:
  - Información personal
  - Historial de pedidos
  - Direcciones guardadas
- Cambiar rol (customer ↔ admin)
- Desactivar usuario (opcional)

---

## 8. MULTIIDIOMA (i18n)

### 8.1 Soporte Español e Inglés 🔴 P0

**Descripción:** Toda la interfaz disponible en 2 idiomas.

**Criterios de Aceptación:**
- URLs diferenciadas:
  - `/es/productos/{slug}`
  - `/en/products/{slug}`
- Selector de idioma en header
- Traducciones completas de:
  - UI/UX (botones, labels, mensajes)
  - Contenido editorial (home, páginas legales)
  - Productos (nombre, descripción)
  - Componentes
  - Emails
- Persistir idioma seleccionado en cookie
- Detectar idioma del navegador (inicial)
- Sitemap con hreflang tags

**Traducciones desde Admin:**
- Productos: admin edita traducciones en ambos idiomas
- Componentes: admin edita traducciones
- Contenido editorial: hardcoded en código (no CMS en MVP)

---

## 9. SEO Y LEGAL

### 9.1 SEO Técnico 🔴 P0

**Descripción:** Optimización para motores de búsqueda.

**Criterios de Aceptación:**
- Meta tags únicos por página (title, description)
- OpenGraph tags (Facebook, LinkedIn)
- Twitter Card tags
- Canonical URLs
- Sitemap.xml dinámico
- robots.txt
- JSON-LD schemas:
  - Product (en páginas de producto)
  - Organization (en home)
  - BreadcrumbList (navegación)
- URLs amigables (slugs)
- Alt text en todas las imágenes
- Lighthouse score > 90

**Sitemaps:**
```xml
/sitemap.xml
  - /es/productos/[todos-los-slugs]
  - /en/products/[all-slugs]
  - Páginas estáticas
```

---

### 9.2 Páginas Legales 🔴 P0

**Descripción:** Páginas requeridas por ley.

**Páginas a Crear:**
- Términos y Condiciones
- Política de Privacidad
- Política de Cookies
- Política de Devoluciones
- Aviso Legal

**Criterios de Aceptación:**
- Accesibles desde footer
- Multiidioma (es/en)
- Actualizadas y específicas del negocio
- Mencionar RGPD y protección de datos
- Incluir datos de contacto

---

### 9.3 Cookie Consent 🔴 P0

**Descripción:** Banner de consentimiento de cookies (RGPD).

**Criterios de Aceptación:**
- Banner al entrar por primera vez
- Botones: "Aceptar todas", "Rechazar", "Configurar"
- Modal de configuración:
  - Cookies necesarias (siempre activas)
  - Cookies analíticas (opt-in)
  - Cookies marketing (opt-in, futuro)
- Guardar preferencias en cookie
- Link "Configuración de cookies" en footer
- No cargar analytics hasta aceptar

**Cookies Usadas:**
- Sesión (necesaria)
- Idioma (necesaria)
- Consent (necesaria)
- Analytics (opcional)

---

### 9.4 CAPTCHA 🟠 P1

**Descripción:** Protección anti-bot en formularios críticos.

**Criterios de Aceptación:**
- hCaptcha integrado (RGPD compliant)
- En formularios:
  - Registro
  - Contacto (si existe)
  - Checkout (opcional)
- Invisible o checkbox según configuración
- Validación en backend

---

## 10. SEGURIDAD

### 10.1 HTTPS y Seguridad Básica 🔴 P0

**Criterios de Aceptación:**
- HTTPS forzado en toda la aplicación
- HSTS headers configurados
- CSP (Content Security Policy) headers
- XSS protection headers
- No almacenar datos de tarjetas
- Passwords hasheados (bcrypt/PBKDF2)
- JWT tokens con expiración
- Rate limiting en APIs críticas

---

### 10.2 Rate Limiting 🔴 P0

**Descripción:** Limitar requests para prevenir abuso.

**Criterios de Aceptación:**
- Límites por IP:
  - Login: 5 intentos / 15 min
  - Registro: 3 registros / hora
  - API general: 100 requests / min
  - Checkout: 10 requests / hora
- Respuesta 429 Too Many Requests
- Headers con información de límite

---

## 11. PERFORMANCE Y MONITOREO

### 11.1 Performance 🟠 P1

**Criterios de Aceptación:**
- Lighthouse score > 90
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- API response time < 500ms (p95)
- Modelos 3D < 2MB cada uno
- Images optimizadas (WebP, next/image)

---

### 11.2 Monitoring 🔴 P0

**Criterios de Aceptación:**
- Sentry capturando errores
- Logs estructurados (Serilog)
- Logs centralizados (Better Stack o Seq)
- Uptime monitoring (UptimeRobot)
- Alertas configuradas:
  - Error rate > 1%
  - API latency > 1s
  - Servicio caído

---

## 12. NICE TO HAVE (Post-MVP)

### 12.1 Wishlist 🟢 P3
- Usuario puede guardar productos favoritos
- Ver lista de favoritos
- Notificación si producto en wishlist tiene descuento

### 12.2 Reviews y Valoraciones 🟢 P3
- Usuarios pueden dejar reseñas
- Rating de 1-5 estrellas
- Fotos en reviews
- Moderación por admin

### 12.3 Chat en Vivo 🟢 P3
- Widget de chat (Intercom, Crisp)
- Respuestas automáticas
- Horario de atención

### 12.4 Blog 🟢 P3
- CMS básico para posts
- Categorías
- SEO optimizado
- Comentarios (opcional)

### 12.5 Newsletter 🟢 P3
- Suscripción en footer
- Integración con Mailchimp/Brevo
- Campañas de email marketing

---

## 📊 Resumen de Prioridades

**P0 - Crítico (Bloqueante para MVP):**
- Autenticación completa
- Catálogo de productos
- Configurador 3D funcional
- Carrito y checkout
- Pagos con Stripe
- Panel admin básico
- SEO técnico
- Páginas legales

**P1 - Alto (Importante para MVP):**
- Filtros de productos
- Especificaciones técnicas
- Merge de carritos
- 2FA para admins
- Tiempo de fabricación dinámico
- CAPTCHA
- Performance optimizado

**P2 - Medio (Deseable en MVP):**
- Búsqueda avanzada
- Gestión usuarios en admin
- Más métricas en dashboard

**P3 - Bajo (Post-MVP):**
- Wishlist
- Reviews
- Chat
- Blog
- Newsletter

---

**Última actualización:** Enero 2026  
**Estado:** Documento vivo - actualizar según avance
