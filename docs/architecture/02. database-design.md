# 🗄️ Diseño de Base de Datos

## 📋 Visión General

Base de datos relacional PostgreSQL 16 diseñada para soportar un e-commerce de productos personalizables con sistema de componentes y configuraciones 3D.

### Características Principales

- **18 tablas principales**
- **Soporte multiidioma** (traducciones en tablas separadas)
- **Sistema de componentes** (productos construidos con componentes)
- **Configuraciones compartibles** (URLs únicas)
- **Auditoría completa** (timestamps, historial de cambios)
- **Optimización** (índices estratégicos, triggers)

---

## 📊 Diagrama Entidad-Relación (ERD)

```
┌─────────────────┐
│     users       │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────▼────────────────┐        ┌──────────────────┐
    │  user_addresses     │        │  content_pages   │
    └─────────────────────┘        └────────┬─────────┘
                                            │
         │                                  │ 1:N
         │ 1:N                              │
         │                          ┌───────▼──────────────────┐
    ┌────▼──────────┐               │ content_page_translations│
    │    orders     │               └──────────────────────────┘
    └────┬──────────┘
         │                          ┌──────────────────┐
         │ 1:N                      │    products      │
         │                          └────────┬─────────┘
    ┌────▼──────────────┐                   │
    │   order_items     │◄──────────────────┤ N:M
    └────┬──────────────┘                   │
         │                                   │ 1:N
         │ 1:N                        ┌──────▼─────────────────┐
         │                            │ product_translations   │
    ┌────▼───────────────────┐       └────────────────────────┘
    │ order_item_components  │
    └────┬───────────────────┘       ┌────────────────────────┐
         │                           │   product_images       │
         │                           └────────────────────────┘
         │ N:1
         │                           ┌────────────────────────┐
    ┌────▼────────────┐              │ product_specifications │
    │   components    │              └────────────────────────┘
    └────┬────────────┘
         │                           ┌─────────────────────────┐
         │ 1:N                       │ product_component_options│
         │                           └──────────┬──────────────┘
    ┌────▼───────────────────┐                 │
    │ component_translations │                 │ N:1
    └────────────────────────┘                 │
                                       ┌────────▼──────────────┐
         ┌─────────────────────────────┤ saved_configurations  │
         │                             └───────────────────────┘
         │ N:1
         │
    ┌────▼──────────┐                 ┌──────────────────┐
    │  cart_items   │                 │  shipping_zones  │
    └───────────────┘                 └──────────────────┘

                                      ┌──────────────────────┐
                                      │ order_status_history │
                                      └──────────────────────┘

                                      ┌──────────────────┐
                                      │     coupons      │
                                      └──────────────────┘
```

---

## 📐 Tablas Detalladas

### 1. USUARIOS Y AUTENTICACIÓN

#### `users`
Tabla principal de usuarios.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    language VARCHAR(5) DEFAULT 'es',  -- es, en
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    role VARCHAR(20) DEFAULT 'customer',  -- customer, admin
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_role CHECK (role IN ('customer', 'admin')),
    CONSTRAINT chk_language CHECK (language IN ('es', 'en'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Campos Clave:**
- `email_verified`: Para flujo de verificación por email
- `two_factor_enabled`: 2FA obligatorio para admins
- `role`: Control de acceso basado en roles

---

#### `user_addresses`
Direcciones de envío/facturación de usuarios.

```sql
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL,  -- billing, shipping
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) DEFAULT 'ES',  -- ISO 3166-1 alpha-2
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_address_type CHECK (address_type IN ('billing', 'shipping'))
);

CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON user_addresses(user_id, is_default) 
    WHERE is_default = TRUE;
```

---

### 2. COMPONENTES (Building Blocks)

#### `components`
Componentes físicos que forman los productos.

```sql
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    component_type VARCHAR(50) NOT NULL,  -- grip, button_plate, base, led, etc
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_threshold INTEGER DEFAULT 5,  -- Alerta automática bajo stock
    lead_time_days INTEGER DEFAULT 0,  -- Días extra si bajo stock
    weight_grams INTEGER,
    cost_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_components_sku ON components(sku);
CREATE INDEX idx_components_type ON components(component_type);
CREATE INDEX idx_components_stock ON components(stock_quantity);
CREATE INDEX idx_components_low_stock ON components(stock_quantity) 
    WHERE stock_quantity <= min_stock_threshold;
```

**Lógica de Stock:**
- `stock_quantity <= min_stock_threshold` → mostrar "bajo stock"
- Si bajo stock → añadir `lead_time_days` al tiempo de fabricación
- Stock se descuenta al confirmar pedido (trigger)

---

#### `component_translations`
Traducciones de componentes (multiidioma).

```sql
CREATE TABLE component_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID REFERENCES components(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    UNIQUE(component_id, locale)
);

CREATE INDEX idx_component_trans_component ON component_translations(component_id);
CREATE INDEX idx_component_trans_locale ON component_translations(locale);
```

---

### 3. PRODUCTOS

#### `products`
Productos base (sin personalización).

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price > 0),
    vat_rate DECIMAL(5,2) DEFAULT 21.00,  -- IVA España
    model_3d_url VARCHAR(500),  -- Ruta al archivo .glb
    model_3d_size_kb INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    is_customizable BOOLEAN DEFAULT TRUE,
    base_production_days INTEGER DEFAULT 7,
    weight_grams INTEGER,  -- Peso base sin personalizaciones
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(is_active);
```

---

#### `product_translations`
Información multiidioma de productos.

```sql
CREATE TABLE product_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_description VARCHAR(500),
    long_description TEXT,
    meta_title VARCHAR(100),
    meta_description VARCHAR(200),
    slug VARCHAR(255) NOT NULL,  -- URL-friendly
    
    UNIQUE(product_id, locale),
    UNIQUE(locale, slug)  -- URLs únicas por idioma
);

CREATE INDEX idx_product_trans_product ON product_translations(product_id);
CREATE INDEX idx_product_trans_slug ON product_translations(locale, slug);
```

**Ejemplo de slugs:**
- ES: `/es/productos/volante-pro-racing`
- EN: `/en/products/pro-racing-wheel`

---

#### `product_images`
Galería de imágenes por producto.

```sql
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_order ON product_images(product_id, display_order);
```

---

#### `product_specifications`
Especificaciones técnicas (tabla key-value).

```sql
CREATE TABLE product_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL,
    spec_key VARCHAR(100) NOT NULL,  -- dimensions, weight, compatibility
    spec_value TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_product_specs_product ON product_specifications(product_id, locale);
```

**Ejemplo de specs:**
```
spec_key: "dimensions"
spec_value: "30cm × 28cm × 12cm"

spec_key: "compatibility"  
spec_value: "Logitech G29, Thrustmaster T300"
```

---

#### `product_component_options`
Qué componentes puede usar cada producto.

```sql
CREATE TABLE product_component_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    component_id UUID REFERENCES components(id) ON DELETE CASCADE,
    option_group VARCHAR(50) NOT NULL,  -- grip_color, button_layout
    price_modifier DECIMAL(10,2) DEFAULT 0.00,  -- Precio extra por esta opción
    is_default BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    
    UNIQUE(product_id, component_id)
);

CREATE INDEX idx_product_comp_opt_product ON product_component_options(product_id);
CREATE INDEX idx_product_comp_opt_group ON product_component_options(option_group);
```

**Ejemplo:**
```
Producto: Volante Pro
  option_group: "grip_color"
    - Componente: Grip Rojo (+0€)
    - Componente: Grip Alcantara (+15€)
  option_group: "button_layout"
    - Componente: 12 botones (+0€)
    - Componente: 24 botones premium (+30€)
```

---

### 4. CONFIGURACIONES (Shareable)

#### `saved_configurations`
Configuraciones guardadas con URL compartible.

```sql
CREATE TABLE saved_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_token VARCHAR(50) UNIQUE NOT NULL,  -- Para URL: /config/{token}
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- Opcional (anónimas)
    configuration_json JSONB NOT NULL,  -- {components: [...], customText: "..."}
    total_price DECIMAL(10,2),
    thumbnail_url VARCHAR(500),  -- Captura 3D generada (opcional)
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP  -- Opcional, para limpiar configs antiguas
);

CREATE INDEX idx_saved_config_token ON saved_configurations(share_token);
CREATE INDEX idx_saved_config_user ON saved_configurations(user_id);
CREATE INDEX idx_saved_config_product ON saved_configurations(product_id);
```

**Ejemplo de configuration_json:**
```json
{
  "components": [
    {"id": "uuid-grip-red", "group": "grip_color"},
    {"id": "uuid-24-buttons", "group": "button_layout"}
  ],
  "customText": "RACER01",
  "color": "#FF0000"
}
```

---

### 5. CARRITO

#### `cart_items`
Items en el carrito de compra.

```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    saved_configuration_id UUID REFERENCES saved_configurations(id),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_product ON cart_items(product_id);
```

**Notas:**
- Un usuario puede tener múltiples items del mismo producto con diferentes configs
- `unit_price` snapshot del precio al añadir (por si cambian precios)

---

### 6. PEDIDOS

#### `orders`
Pedidos realizados.

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,  -- ORD-2026-0001
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Información de contacto (snapshot por si se borra usuario)
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    
    -- Dirección de envío (snapshot)
    shipping_name VARCHAR(255) NOT NULL,
    shipping_street VARCHAR(255) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100),
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(2) DEFAULT 'ES',
    
    -- Precios
    subtotal DECIMAL(10,2) NOT NULL,
    vat_amount DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Pago
    payment_method VARCHAR(50),  -- stripe, paypal, bizum
    payment_status VARCHAR(20) DEFAULT 'pending',  
        -- pending, paid, failed, refunded
    stripe_payment_intent_id VARCHAR(255),
    
    -- Estado del pedido
    order_status VARCHAR(20) DEFAULT 'pending',
        -- pending, paid, in_production, shipped, completed, cancelled
    
    -- Producción
    estimated_production_days INTEGER,
    production_notes TEXT,
    
    -- Envío
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_payment_status CHECK (
        payment_status IN ('pending', 'paid', 'failed', 'refunded')
    ),
    CONSTRAINT chk_order_status CHECK (
        order_status IN ('pending', 'paid', 'in_production', 
                        'shipped', 'completed', 'cancelled')
    )
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_stripe ON orders(stripe_payment_intent_id);
```

**Generación de order_number:**
```sql
-- En backend, generar como:
ORD-{YEAR}-{SEQUENTIAL_NUMBER}
-- Ejemplo: ORD-2026-0042
```

---

#### `order_items`
Items individuales en cada pedido.

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    saved_configuration_id UUID REFERENCES saved_configurations(id),
    
    -- Snapshot de datos (por si cambian después)
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(50) NOT NULL,
    configuration_json JSONB,  -- Copia de la configuración exacta
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

---

#### `order_item_components`
Registro de componentes consumidos en cada item.

```sql
CREATE TABLE order_item_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    component_id UUID REFERENCES components(id) ON DELETE SET NULL,
    component_sku VARCHAR(50) NOT NULL,
    component_name VARCHAR(255) NOT NULL,
    quantity_used INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_item_comp_item ON order_item_components(order_item_id);
CREATE INDEX idx_order_item_comp_component ON order_item_components(component_id);
```

**Propósito:**
- Descontar stock al confirmar pedido
- Saber qué componentes fabricar
- Auditoría de inventario

---

#### `order_status_history`
Auditoría de cambios de estado.

```sql
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_history_order ON order_status_history(order_id, created_at);
```

---

### 7. ENVÍOS

#### `shipping_zones`
Zonas de envío con tarifas.

```sql
CREATE TABLE shipping_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name VARCHAR(100) NOT NULL,  -- Península, Baleares, Canarias
    postal_code_pattern VARCHAR(50),  -- regex o lista: 01-52, 07, 35-38
    base_cost DECIMAL(10,2) NOT NULL,
    cost_per_kg DECIMAL(10,2) DEFAULT 0.00,
    free_shipping_threshold DECIMAL(10,2),  -- Envío gratis si pedido > X
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Datos iniciales
INSERT INTO shipping_zones 
(zone_name, postal_code_pattern, base_cost, cost_per_kg, free_shipping_threshold) 
VALUES
('Península', '01-52', 5.00, 0.50, 100.00),
('Baleares', '07', 10.00, 1.00, 150.00),
('Canarias', '35,38', 15.00, 1.50, 200.00);
```

**Cálculo de envío:**
```
coste = base_cost + (peso_kg × cost_per_kg)

Si pedido_total > free_shipping_threshold:
    coste = 0
```

---

### 8. CONTENIDO (CMS)

#### `content_pages`
Páginas de contenido (términos, privacidad, etc).

```sql
CREATE TABLE content_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key VARCHAR(50) UNIQUE NOT NULL,  -- terms, privacy, returns, faq
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Datos iniciales
INSERT INTO content_pages (page_key) VALUES
('terms'), ('privacy'), ('cookies'), ('returns'), ('legal');
```

---

#### `content_page_translations`
Traducciones de páginas de contenido.

```sql
CREATE TABLE content_page_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES content_pages(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL,
    meta_title VARCHAR(100),
    meta_description VARCHAR(200),
    
    UNIQUE(page_id, locale),
    UNIQUE(locale, slug)
);

CREATE INDEX idx_content_trans_page ON content_page_translations(page_id);
CREATE INDEX idx_content_trans_slug ON content_page_translations(locale, slug);
```

---

### 9. CUPONES (Futuro)

#### `coupons`
Cupones de descuento.

```sql
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20),  -- percentage, fixed
    discount_value DECIMAL(10,2),
    min_purchase_amount DECIMAL(10,2),
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_discount_type CHECK (discount_type IN ('percentage', 'fixed'))
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active, valid_from, valid_until);
```

---

## 🔧 Triggers y Funciones

### 1. Auto-actualizar `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas necesarias
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_components_updated_at 
    BEFORE UPDATE ON components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### 2. Descontar Stock al Confirmar Pedido

```sql
CREATE OR REPLACE FUNCTION deduct_component_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar stock del componente
    UPDATE components c
    SET stock_quantity = stock_quantity - NEW.quantity_used
    WHERE c.id = NEW.component_id;
    
    -- Log si queda bajo stock
    IF (SELECT stock_quantity FROM components WHERE id = NEW.component_id) 
       <= (SELECT min_stock_threshold FROM components WHERE id = NEW.component_id) 
    THEN
        -- Aquí podrías insertar en tabla de alertas o enviar notificación
        RAISE NOTICE 'Component % is now below threshold', NEW.component_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deduct_stock 
    AFTER INSERT ON order_item_components
    FOR EACH ROW EXECUTE FUNCTION deduct_component_stock();
```

---

### 3. Registrar Cambios de Estado de Pedido

```sql
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_status <> OLD.order_status THEN
        INSERT INTO order_status_history (order_id, status, notes)
        VALUES (NEW.id, NEW.order_status, 'Status changed automatically');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_order_status 
    AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_order_status_change();
```

---

## 📊 Índices de Performance

### Índices Estratégicos

```sql
-- Búsqueda de productos
CREATE INDEX idx_product_trans_search ON product_translations 
    USING gin(to_tsvector('spanish', name || ' ' || COALESCE(short_description, '')));

CREATE INDEX idx_product_trans_search_en ON product_translations 
    USING gin(to_tsvector('english', name || ' ' || COALESCE(short_description, '')));

-- Queries frecuentes de admin
CREATE INDEX idx_orders_admin_dashboard ON orders(order_status, created_at DESC);

-- Carrito activo
CREATE INDEX idx_cart_recent ON cart_items(user_id, updated_at DESC);

-- Componentes bajo stock
CREATE INDEX idx_components_low_stock_alert ON components(component_type, stock_quantity)
    WHERE stock_quantity <= min_stock_threshold;
```

---

## 🔍 Queries Comunes Optimizadas

### 1. Obtener Producto con Traducciones e Imágenes

```sql
SELECT 
    p.*,
    pt.name,
    pt.slug,
    pt.short_description,
    pt.long_description,
    json_agg(DISTINCT jsonb_build_object(
        'url', pi.image_url,
        'alt', pi.alt_text,
        'order', pi.display_order
    ) ORDER BY pi.display_order) as images
FROM products p
INNER JOIN product_translations pt ON p.id = pt.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE pt.locale = 'es' 
  AND pt.slug = 'volante-pro-racing'
  AND p.is_active = TRUE
GROUP BY p.id, pt.id;
```

---

### 2. Opciones de Componentes por Producto

```sql
SELECT 
    pco.option_group,
    json_agg(jsonb_build_object(
        'id', c.id,
        'sku', c.sku,
        'name', ct.name,
        'stock', c.stock_quantity,
        'price_modifier', pco.price_modifier,
        'is_default', pco.is_default,
        'low_stock', c.stock_quantity <= c.min_stock_threshold,
        'lead_time_days', CASE 
            WHEN c.stock_quantity <= c.min_stock_threshold 
            THEN c.lead_time_days 
            ELSE 0 
        END
    ) ORDER BY pco.display_order) as options
FROM product_component_options pco
INNER JOIN components c ON pco.component_id = c.id
INNER JOIN component_translations ct ON c.id = ct.component_id
WHERE pco.product_id = :product_id
  AND ct.locale = :locale
GROUP BY pco.option_group;
```

---

### 3. Dashboard Admin - Pedidos Pendientes

```sql
SELECT 
    o.order_number,
    o.email,
    o.total_amount,
    o.order_status,
    o.created_at,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.order_status IN ('paid', 'in_production')
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 20;
```

---

### 4. Componentes Bajo Stock

```sql
SELECT 
    c.sku,
    ct.name,
    c.component_type,
    c.stock_quantity,
    c.min_stock_threshold,
    c.lead_time_days,
    (c.min_stock_threshold - c.stock_quantity) as units_below_threshold
FROM components c
INNER JOIN component_translations ct ON c.id = ct.component_id
WHERE c.stock_quantity <= c.min_stock_threshold
  AND ct.locale = 'es'
ORDER BY c.stock_quantity ASC;
```

---

## 📈 Estimaciones de Tamaño

### Tamaño por Tabla (100 pedidos/mes durante 1 año)

| Tabla | Registros | Tamaño Estimado |
|-------|-----------|-----------------|
| users | ~500 | ~50 KB |
| products | ~50 | ~20 KB |
| product_translations | ~100 | ~50 KB |
| components | ~200 | ~30 KB |
| orders | ~1,200 | ~300 KB |
| order_items | ~2,400 | ~500 KB |
| order_item_components | ~7,200 | ~800 KB |
| saved_configurations | ~500 | ~200 KB |
| cart_items | ~100 | ~20 KB |
| **TOTAL** | | **~2 MB** |

**Con imágenes y modelos 3D (en blob storage):**
- Modelos 3D: 10 productos × 1.5MB = 15 MB
- Imágenes: 10 productos × 5 imágenes × 200KB = 10 MB
- **Total assets: ~25 MB**

**Base de datos crecerá ~2-3 MB/año** con 100 pedidos/mes.

---

## 🔐 Seguridad y Permisos

### Row Level Security (RLS) - Opcional en Supabase

```sql
-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Usuarios solo ven sus propios pedidos
CREATE POLICY user_orders_policy ON orders
    FOR SELECT
    USING (user_id = current_setting('app.user_id')::uuid);

-- Admins ven todo
CREATE POLICY admin_orders_policy ON orders
    FOR ALL
    USING (current_setting('app.user_role') = 'admin');
```

### Auditoría de Cambios Sensibles

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,  -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at DESC);
```

---

## 🔄 Migraciones

### Versionado de Migraciones

```
migrations/
├── 001_initial_schema.sql
├── 002_add_2fa_to_users.sql
├── 003_add_product_specifications.sql
├── 004_add_shipping_zones.sql
└── 005_add_audit_log.sql
```

### Ejemplo de Migración

```sql
-- migrations/002_add_2fa_to_users.sql

-- Up Migration
ALTER TABLE users 
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN two_factor_secret VARCHAR(255);

-- Down Migration (comentado, para rollback manual)
-- ALTER TABLE users 
-- DROP COLUMN two_factor_enabled,
-- DROP COLUMN two_factor_secret;
```

---

## 📋 Checklist de Setup

### Inicial
- [ ] Crear base de datos `simracing`
- [ ] Ejecutar schema inicial
- [ ] Crear índices
- [ ] Crear triggers
- [ ] Insertar datos seed (zonas envío, páginas contenido)
- [ ] Verificar constraints
- [ ] Ejecutar queries de prueba

### Antes de Producción
- [ ] Backup configurado
- [ ] Índices optimizados
- [ ] Connection pooling configurado
- [ ] SSL/TLS habilitado
- [ ] Permisos de usuario restrictivos
- [ ] Monitoring de queries lentas
- [ ] EXPLAIN ANALYZE en queries críticas

---

## 🆘 Troubleshooting

### Query Lenta

```sql
-- Analizar query
EXPLAIN ANALYZE
SELECT ...;

-- Ver queries lentas
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

### Identificar Tabla Grande

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Locks

```sql
-- Ver locks activos
SELECT * FROM pg_locks
WHERE NOT granted;
```

---

**Última actualización:** Enero 2026  
**Versión Schema:** 1.0  
**PostgreSQL:** 16+
