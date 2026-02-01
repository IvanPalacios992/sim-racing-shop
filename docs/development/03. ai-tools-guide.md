# 🤖 Guía de Herramientas IA para Desarrollo

## 🎯 Objetivo

Esta guía te enseña a usar herramientas de IA para acelerar el desarrollo del proyecto. Con el setup correcto, puedes reducir el tiempo de desarrollo en 30-40%.

---

## 📊 Stack de IA Recomendado

### Setup Óptimo (1 Desarrollador)

```
Editor Principal:     Cursor IDE ($20/mes)
Autocompletado:       GitHub Copilot ($10/mes) o Codeium (gratis)
UI/Componentes:       v0.dev (gratis tier)
Consultas:            Claude 3.5 Sonnet (este chat)
Código Boilerplate:   Copilot Chat / Cursor Composer

TOTAL: $30/mes (o $20 solo Cursor)
ROI: 30-40% más rápido = 40-50h ahorradas/mes
```

---

## 1️⃣ CURSOR IDE - Editor con IA Integrada

### ¿Qué es Cursor?

Editor fork de VSCode con IA nativa. Mejor que VSCode + Copilot juntos.

**Precio:** $20/mes (Pro)  
**Web:** [cursor.sh](https://cursor.sh)

### Setup Inicial

```bash
# 1. Descargar e instalar
# https://cursor.sh/

# 2. Migrar settings desde VSCode
# Al abrir primera vez, Cursor pregunta si importar

# 3. Login con GitHub

# 4. Configurar API key (Settings → AI)
# Usar Claude API o dejar default
```

### Características Principales

#### A) Cmd+K - Inline Editing

Edita código con lenguaje natural:

```typescript
// Selecciona este código y presiona Cmd+K (Mac) o Ctrl+K (Win)
// Prompt: "add error handling and logging"

function createOrder(data: OrderData) {
  const order = await orderRepository.create(data);
  return order;
}

// Cursor genera:
async function createOrder(data: OrderData) {
  try {
    logger.info('Creating order', { data });
    const order = await orderRepository.create(data);
    logger.info('Order created successfully', { orderId: order.id });
    return order;
  } catch (error) {
    logger.error('Failed to create order', { error, data });
    throw new OrderCreationError('Failed to create order', { cause: error });
  }
}
```

**Casos de Uso:**
- "add typescript types"
- "convert to async/await"
- "add input validation"
- "optimize this query"
- "add error handling"

---

#### B) Cmd+L - Chat con Codebase

Chat que entiende TODO tu código:

```
You: "How is authentication implemented?"
Cursor: [Analiza tu código]
"Authentication uses JWT tokens with ASP.NET Identity..."

You: "Show me where users are created"
Cursor: [Te lleva al código]
"Users are created in UserService.cs, line 42..."

You: "Add 2FA to the login flow"
Cursor: [Genera código específico para tu proyecto]
```

**Ventajas:**
- Entiende contexto completo
- Sugiere código que funciona con tu arquitectura
- Responde basándose en tu código real

---

#### C) Composer - Ediciones Multi-Archivo

Editar múltiples archivos a la vez:

```
Prompt en Composer:
"Create a new Product API endpoint with:
- Controller in API/Controllers
- Service in Core/Services  
- Tests in Tests/Integration
- Update Swagger docs"

Cursor genera y modifica:
✓ ProductController.cs (nuevo)
✓ ProductService.cs (nuevo)
✓ IProductService.cs (nuevo)
✓ ProductControllerTests.cs (nuevo)
✓ Program.cs (actualizado, registra servicio)
✓ Startup.cs (actualizado, añade route)
```

**Casos de Uso:**
- Crear features completas
- Refactorizar múltiples archivos
- Añadir tests a varios archivos
- Actualizar imports en todo el proyecto

---

### Prompts Efectivos en Cursor

#### Para Componentes React:

```
"Create a ProductCard component with:
- Image with lazy loading
- Title, price, and description
- Add to cart button
- TypeScript props
- Tailwind styling
- Responsive design"
```

#### Para APIs .NET:

```
"Create CRUD endpoints for Orders:
- GET /api/orders (with pagination)
- GET /api/orders/{id}
- POST /api/orders
- PUT /api/orders/{id}
- DELETE /api/orders/{id}
- Include FluentValidation
- Add XML comments for Swagger"
```

#### Para Tests:

```
"Generate unit tests for OrderService:
- Test CreateOrder with valid data
- Test CreateOrder with invalid data
- Test GetOrder by id (found and not found)
- Mock repository
- Use xUnit and FluentAssertions"
```

---

## 2️⃣ GITHUB COPILOT - Autocompletado Inteligente

### Setup

```bash
# 1. Instalar extensión en Cursor/VSCode
# Extensions → "GitHub Copilot"

# 2. Login con cuenta GitHub

# 3. Activar ($10/mes si no tienes Copilot gratis)
```

### Cómo Usar

#### Autocompletado en Línea

Simplemente empieza a escribir y Copilot sugiere:

```typescript
// Escribes:
function calculateShipping

// Copilot sugiere (presiona Tab para aceptar):
function calculateShippingCost(zone: ShippingZone, weight: number): number {
  const baseRate = zone.baseRate;
  const perKgRate = zone.perKgRate;
  return baseRate + (weight * perKgRate);
}
```

#### Generar desde Comentarios

```typescript
// Write a function that validates email format
// Copilot genera:
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Create a hook to manage shopping cart state
// Copilot genera:
function useShoppingCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  
  const addItem = (item: CartItem) => {
    setItems([...items, item]);
  };
  
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  return { items, addItem, removeItem };
}
```

#### Copilot Chat

```
En panel lateral:
"Explain this code"
"Find bugs"
"Add error handling"
"Generate tests"
"Optimize performance"
```

---

### Tips para Mejores Sugerencias

1. **Nombres descriptivos:**
   ```typescript
   // ❌ Malo
   function calc(a, b)
   
   // ✅ Bueno
   function calculateTotalWithTax(subtotal: number, taxRate: number)
   ```

2. **Comentarios claros:**
   ```typescript
   // ❌ Malo
   // do stuff
   
   // ✅ Bueno
   // Calculate shipping cost based on weight and destination zone
   // Returns cost in euros
   ```

3. **Contexto en el archivo:**
   - Copilot lee el archivo actual
   - Define types/interfaces arriba
   - Importa dependencias antes

---

## 3️⃣ V0.DEV - Generador de Componentes UI

### ¿Qué es v0?

Herramienta de Vercel que genera componentes React desde descripciones.

**Precio:** Gratis (con límites) / $20/mes  
**Web:** [v0.dev](https://v0.dev)

### Casos de Uso

#### Generar Landing Pages

```
Prompt:
"Modern landing page for a sim racing shop with:
- Hero section with CTA
- Product grid (3 columns)
- Features section with icons
- Testimonials
- Footer with links
- Dark mode
- Tailwind CSS"

→ v0 genera código listo para copiar
```

#### Generar Componentes

```
Prompt:
"Product card component with:
- Image with hover zoom
- Product name and price
- Add to cart button
- Rating stars
- Badge for 'New' or 'Sale'
- Responsive
- shadcn/ui components"

→ Genera componente completo
```

#### Generar Formularios

```
Prompt:
"Checkout form with:
- Shipping address fields
- Payment method selection
- Order summary sidebar
- Validation with react-hook-form
- Zod schema
- Error messages
- Loading states"

→ Genera formulario completo validado
```

### Workflow con v0

```
1. Describir componente en v0.dev
2. Copiar código generado
3. Pegar en tu proyecto
4. Ajustar según necesidad
5. Integrar con tu lógica
```

**Ahorro:** 1-2 horas por componente complejo

---

## 4️⃣ CLAUDE 3.5 SONNET - Arquitectura y Diseño

### Casos de Uso

#### Arquitectura de Sistemas

```
Prompt:
"I'm building an e-commerce for custom sim racing hardware.
Stack: .NET 10, Next.js, PostgreSQL.
Design the database schema for:
- Products with 3D models
- Customizable components
- Orders with configurations
- Multi-language support"

→ Claude genera ERD completo + SQL
```

#### Code Reviews

```
Prompt:
"Review this code and suggest improvements:

[pegar código]

Focus on:
- Security issues
- Performance
- Best practices
- Potential bugs"

→ Claude analiza y sugiere mejoras
```

#### Debugging Complejo

```
Prompt:
"I'm getting this error:
[pegar error]

Here's my code:
[pegar código]

And my configuration:
[pegar config]

What's wrong and how to fix?"

→ Claude diagnostica y da solución
```

#### Generar Tests

```
Prompt:
"Generate comprehensive unit tests for this service:

[pegar código del servicio]

Use:
- xUnit
- FluentAssertions
- Moq for mocking
- Cover happy path and edge cases"

→ Claude genera suite de tests
```

---

## 5️⃣ CODEIUM - Alternativa Gratuita a Copilot

### ¿Por qué Codeium?

Si no quieres pagar Copilot, Codeium es excelente y **100% gratis**.

**Precio:** $0  
**Web:** [codeium.com](https://codeium.com)

### Setup

```bash
# 1. Instalar extensión en Cursor/VSCode
# Extensions → "Codeium"

# 2. Crear cuenta gratis

# 3. Usar igual que Copilot
```

### Características

- Autocompletado inline (como Copilot)
- Chat con código
- Explicaciones
- Generación de tests
- Múltiples lenguajes

**Diferencia vs Copilot:**
- Ligeramente menos preciso
- Pero gratis e ilimitado
- Excelente para empezar

---

## 6️⃣ WORKFLOWS CON IA - Ejemplos Prácticos

### Workflow: Crear Feature Completo

```
1. Arquitectura (Claude):
   "Design database schema for wishlist feature"
   → Obtener SQL y estructura

2. Backend (Cursor):
   Cmd+L: "Create wishlist CRUD API endpoints"
   → Genera controllers, services, DTOs

3. Frontend (v0.dev):
   "Wishlist page with grid of saved products"
   → Genera UI component

4. Integración (Cursor):
   "Connect WishlistPage to API endpoints"
   → Genera hooks y API calls

5. Tests (Copilot):
   // Generate tests for WishlistService
   → Genera tests unitarios

6. Review (Claude):
   "Review this implementation for bugs"
   → Code review final
```

**Tiempo sin IA:** 8-10 horas  
**Tiempo con IA:** 3-4 horas  
**Ahorro:** 50-60%

---

### Workflow: Debugging de Producción

```
1. Recopilar info (Manual):
   - Error logs
   - Stack trace
   - Request details
   - Environment

2. Analizar (Claude):
   "Here's a production error:
   [logs + context]
   What's the root cause?"
   → Diagnóstico inicial

3. Reproducir localmente (Cursor):
   Cmd+L: "Add test case that reproduces this error"
   → Genera test

4. Fix (Cursor):
   Cmd+K en código: "Fix this race condition"
   → Sugerencia de solución

5. Test (Copilot):
   // Add integration test for the fix
   → Genera test de regresión

6. Verificar (Manual):
   Test localmente, deploy staging
```

---

### Workflow: Refactoring Grande

```
1. Plan (Claude):
   "I need to refactor the order service.
   Current structure:
   [pegar código]
   
   Goals:
   - Extract payment logic
   - Improve testability
   - Add better error handling
   
   Suggest refactoring plan"
   → Plan paso a paso

2. Ejecutar (Cursor Composer):
   "Implement this refactoring plan:
   [pegar plan de Claude]"
   → Cursor modifica múltiples archivos

3. Tests (Cursor):
   "Generate tests for refactored code"
   → Tests para nueva estructura

4. Review (Claude):
   "Review refactored code for issues"
   → Final check
```

---

## 🎯 Prompts Efectivos - Cheat Sheet

### Para Componentes React

```
"Create a [ComponentName] component with:
- Props: [list props and types]
- Features: [list features]
- Styling: Tailwind CSS, [specific styles]
- State management: [if needed]
- Accessibility: [if important]
- TypeScript with full type safety"
```

### Para APIs .NET

```
"Create [endpoint description]:
- HTTP method: [GET/POST/etc]
- Route: /api/[route]
- Input: [DTO structure]
- Output: [response structure]
- Validation: FluentValidation
- Error handling: try-catch with specific exceptions
- Authorization: [if needed]
- XML comments for Swagger"
```

### Para Tests

```
"Generate [type] tests for [class name]:
- Framework: [xUnit/NUnit]
- Assertions: [FluentAssertions]
- Mocking: [Moq/NSubstitute]
- Coverage:
  * Happy path
  * Edge cases: [list specific cases]
  * Error scenarios: [list]
- Use AAA pattern (Arrange, Act, Assert)"
```

### Para Base de Datos

```
"Design database schema for [feature]:
- Tables needed: [list]
- Relationships: [describe]
- Constraints: [list]
- Indexes: [what needs indexing]
- Consider: [specific requirements]
- Generate: PostgreSQL SQL script with:
  * CREATE TABLE statements
  * Foreign keys
  * Indexes
  * Sample data INSERT"
```

### Para Debugging

```
"Debug this issue:

Error: [paste error message]

Code: [paste relevant code]

Context: [what you were trying to do]

Already tried: [list what you tried]

Please:
1. Identify root cause
2. Explain why it's happening
3. Provide step-by-step fix
4. Suggest how to prevent similar issues"
```

---

## 💡 Tips Avanzados

### 1. Contexto es Clave

**❌ Malo:**
```
"create login function"
```

**✅ Bueno:**
```
"Create login function for our Next.js app:
- Uses JWT authentication
- Calls /api/auth/login endpoint
- Stores token in httpOnly cookie
- Redirects to dashboard on success
- Shows error toast on failure
- TypeScript with Zod validation
- Use our existing axios instance from @/lib/api"
```

### 2. Iteración Incremental

```
1. "Create basic ProductCard component"
2. "Add hover effects and animations"
3. "Add lazy loading for images"
4. "Add add-to-cart functionality"
5. "Add loading and error states"
```

Mejor que todo de una vez.

### 3. Aprovechar el Código Existente

```
"Refactor this to use our existing useCart hook:
[pegar código]

Our useCart hook:
[pegar hook]"
```

Cursor/Claude entienden mejor con ejemplos.

### 4. Especificar Estilo

```
"Use our coding style:
- Functional components (no class)
- TypeScript strict mode
- Tailwind for styling (no CSS modules)
- Named exports
- Arrow functions
- Descriptive variable names"
```

### 5. Pedir Explicaciones

```
"Explain this code step by step:
[código complejo]

Then suggest improvements."
```

---

## 📊 Métricas y ROI

### Tiempo Ahorrado por Tarea

| Tarea | Sin IA | Con IA | Ahorro |
|-------|--------|--------|--------|
| CRUD API completo | 4h | 1h | 75% |
| Componente UI complejo | 2h | 30min | 75% |
| Tests unitarios | 2h | 45min | 63% |
| Debugging bug complejo | 3h | 1h | 67% |
| Refactoring grande | 6h | 2h | 67% |
| Documentación | 2h | 30min | 75% |

### ROI Mensual

```
Inversión IA: $30/mes

Ahorro tiempo: 40h/mes (conservador)
Valor tiempo: $60/h
Ahorro dinero: $2,400/mes

ROI: 80x (8000%)
```

**Incluso con solo 10h ahorradas/mes:**
```
10h × $60/h = $600/mes ahorro
Inversión: $30/mes
ROI: 20x (2000%)
```

---

## ⚠️ Limitaciones y Cuidados

### Lo que IA NO Hace Bien

1. **Arquitectura de Alto Nivel**
   - IA ayuda, pero decisiones importantes son tuyas
   - Revisar propuestas críticamente

2. **Seguridad Crítica**
   - Siempre revisar código relacionado con auth
   - Validar inputs manualmente
   - No confiar ciegamente en validaciones generadas

3. **Lógica de Negocio Compleja**
   - IA puede no entender contexto completo
   - Revisar cálculos, reglas de negocio

4. **Performance Optimization**
   - IA genera código funcional, no siempre óptimo
   - Hacer profiling y optimizar manualmente

### Best Practices

✅ **DO:**
- Revisar TODO el código generado
- Testear exhaustivamente
- Usar IA como asistente, no como sustituto
- Aprender del código generado
- Iterar y refinar prompts

❌ **DON'T:**
- Copiar/pegar sin entender
- Confiar en código crítico sin revisar
- Usar en producción sin testear
- Depender 100% de IA
- Ignorar warnings/errores

---

## 🎓 Recursos para Aprender Más

### Prompting

- [Anthropic Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [Cursor Documentation](https://cursor.sh/docs)

### Ejemplos

- [Cursor Directory](https://cursor.directory/) - Prompts comunitarios
- [Awesome ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts)

### Comunidades

- [Cursor Discord](https://discord.gg/cursor)
- [r/cursor](https://reddit.com/r/cursor)
- [r/ChatGPTCoding](https://reddit.com/r/ChatGPTCoding)

---

## 📋 Checklist Setup IA

Antes de empezar desarrollo con IA:

- [ ] Cursor IDE instalado y configurado
- [ ] GitHub Copilot activado (o Codeium)
- [ ] v0.dev cuenta creada
- [ ] Claude 3.5 (este chat) bookmarked
- [ ] Extensiones instaladas en Cursor
- [ ] Settings de Cursor configurados
- [ ] .cursorrules creado (opcional)
- [ ] Familiarizado con shortcuts (Cmd+K, Cmd+L)
- [ ] Primera feature de prueba con IA

---

## 🚀 Primeros Pasos

### Día 1: Setup y Familiarización

1. Instalar Cursor
2. Hacer tutorial integrado
3. Probar Cmd+K en código existente
4. Probar Cmd+L con preguntas
5. Generar primer componente con v0

### Día 2: Primera Feature con IA

1. Elegir feature pequeña (ej: página FAQ)
2. Usar Claude para planear
3. Usar v0 para UI
4. Usar Cursor para integración
5. Documentar qué funcionó/no funcionó

### Semana 1: Workflow Establecido

1. Definir prompts favoritos
2. Crear snippets de prompts comunes
3. Medir tiempo ahorrado
4. Ajustar workflow según necesidad

---

**Última actualización:** Enero 2026  
**Mantener actualizado con nuevas herramientas**
