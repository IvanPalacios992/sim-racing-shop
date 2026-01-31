# Plan de Testing - Autenticación

Este documento detalla los tests planificados para el módulo de autenticación.

**Leyenda de estado:**
- [ ] No implementado
- [x] Implementado

---

## Tests Unitarios

### AuthService

**Archivo:** `tests/SimRacingShop.UnitTests/Services/AuthServiceTests.cs`

#### RegisterAsync

| Estado | Test | Descripción |
|--------|------|-------------|
| [x] | `Register_WithValidData_ReturnsTokenAndUser` | Registro exitoso devuelve JWT, refresh token y datos del usuario |
| [x] | `Register_WithExistingEmail_ThrowsInvalidOperationException` | Email duplicado lanza excepción |
| [x] | `Register_WithWeakPassword_ThrowsInvalidOperationException` | Password sin requisitos mínimos falla |
| [x] | `Register_AssignsCustomerRole_ByDefault` | Usuario nuevo recibe rol "Customer" |
| [x] | `Register_SetsCreatedAtAndUpdatedAt` | Timestamps se establecen correctamente |
| [x] | `Register_TokenContainsCorrectClaims` | JWT incluye sub, email, jti, language, roles |
| [x] | `Register_TokenExpiresAtCorrectTime` | ExpiresAt coincide con configuración JwtSettings |

#### LoginAsync

| Estado | Test | Descripción |
|--------|------|-------------|
| [x] | `Login_WithValidCredentials_ReturnsTokenAndUser` | Login exitoso devuelve JWT y datos |
| [x] | `Login_WithInvalidEmail_ThrowsInvalidOperationException` | Email inexistente falla con mensaje genérico |
| [x] | `Login_WithInvalidPassword_ThrowsInvalidOperationException` | Password incorrecto falla con mensaje genérico |
| [x] | `Login_WithLockedAccount_ThrowsInvalidOperationException` | Cuenta bloqueada devuelve mensaje específico |
| [x] | `Login_AfterMaxFailedAttempts_LocksAccount` | 5 intentos fallidos bloquean la cuenta |
| [x] | `Login_IncludesUserRolesInToken` | JWT contiene los roles del usuario |

#### GetUserByIdAsync

| Estado | Test | Descripción |
|--------|------|-------------|
| [x] | `GetUserById_WithValidId_ReturnsUserDto` | ID válido devuelve usuario |
| [x] | `GetUserById_WithInvalidId_ReturnsNull` | ID inexistente devuelve null |
| [x] | `GetUserById_IncludesRoles` | UserDto incluye lista de roles |

#### GenerateJwtToken (validación indirecta)

| Estado | Test | Descripción |
|--------|------|-------------|
| [x] | `GeneratedToken_IsValidJwt` | Token puede ser parseado |
| [x] | `GeneratedToken_HasCorrectIssuer` | Issuer coincide con configuración |
| [x] | `GeneratedToken_HasCorrectAudience` | Audience coincide con configuración |
| [x] | `GeneratedToken_CanBeValidatedWithSecret` | Token válido con la clave secreta |

---

### AuthController

**Archivo:** `tests/SimRacingShop.UnitTests/Controllers/AuthControllerTests.cs`

#### POST /api/auth/register

| Estado | Test | Descripción |
|--------|------|-------------|
| [x] | `Register_WithMismatchedPasswords_ReturnsBadRequest` | Passwords diferentes devuelve 400 |
| [x] | `Register_WithValidData_ReturnsOkWithToken` | Registro exitoso devuelve 200 |
| [x] | `Register_WithDuplicateEmail_ReturnsBadRequest` | Email duplicado devuelve 400 |
| [x] | `Register_LogsSuccessfulRegistration` | Se registra log de información |

#### POST /api/auth/login

| Estado | Test | Descripción |
|--------|------|-------------|
| [x] | `Login_WithValidCredentials_ReturnsOkWithToken` | Login exitoso devuelve 200 |
| [x] | `Login_WithInvalidCredentials_ReturnsUnauthorized` | Credenciales inválidas devuelve 401 |
| [x] | `Login_LogsSuccessfulLogin` | Se registra log de información |
| [x] | `Login_LogsFailedAttempt` | Se registra warning en fallo |

#### GET /api/auth/me

| Estado | Test | Descripción |
|--------|------|-------------|
| [x] | `GetCurrentUser_WithoutToken_ReturnsUnauthorized` | Sin token devuelve 401 |
| [x] | `GetCurrentUser_WithValidToken_ReturnsUserData` | Token válido devuelve datos |
| [x] | `GetCurrentUser_WithInvalidUserId_ReturnsUnauthorized` | Claim inválido devuelve 401 |
| [x] | `GetCurrentUser_UserNotFound_ReturnsNotFound` | Usuario eliminado devuelve 404 |

#### GET /api/auth/admin-only

| Estado | Test | Descripción |
|--------|------|-------------|
| [x] | `AdminOnly_WithAdminRole_ReturnsOk` | Admin puede acceder |
| [x] | `AdminOnly_WithUserRole_ReturnsForbidden` | User normal devuelve 403 (requiere test de integración) |
| [x] | `AdminOnly_WithoutToken_ReturnsUnauthorized` | Sin token devuelve 401 (requiere test de integración) |

> **Nota:** Los tests de autorización por rol (`AdminOnly_WithUserRole_ReturnsForbidden` y `AdminOnly_WithoutToken_ReturnsUnauthorized`) verifican el comportamiento del controlador, pero la autorización real es manejada por el middleware de ASP.NET. Para verificar completamente el flujo de autorización se requieren tests de integración.

---

### DbInitializer

**Archivo:** `tests/SimRacingShop.UnitTests/Data/DbInitializerTests.cs`

| Estado | Test | Descripción |
|--------|------|-------------|
| [x] | `SeedAsync_CreatesAdminRole_WhenNotExists` | Crea rol Admin si no existe |
| [x] | `SeedAsync_CreatesUserRole_WhenNotExists` | Crea rol User si no existe |
| [x] | `SeedAsync_SkipsRoleCreation_WhenExists` | No duplica roles existentes |
| [x] | `SeedAsync_CreatesAdminUser_WhenNoAdminExists` | Crea admin con settings configurados |
| [x] | `SeedAsync_SkipsAdminCreation_WhenAdminExists` | No crea admin si ya existe uno |
| [x] | `SeedAsync_ThrowsException_WhenNoAdminAndNoSettings` | Error si no hay admin ni configuración |
| [x] | `SeedAsync_AssignsAdminRole_ToCreatedUser` | Admin creado tiene rol Admin |

#### Tests adicionales implementados

| Estado | Test | Descripción |
|--------|------|-------------|
| [x] | `SeedAsync_ThrowsException_WhenUserCreationFails` | Error si falla creación de usuario |
| [x] | `SeedAsync_LogsRoleCreation` | Se registra log al crear roles |
| [x] | `SeedAsync_SetsEmailConfirmed_ToTrue` | Email del admin queda confirmado |

---

## Tests de Integración

### Flujo completo con base de datos real (Testcontainers + PostgreSQL)

| Estado | Test | Descripción |
|--------|------|-------------|
| [ ] | `Register_And_Login_FullFlow` | Registro → Login → Acceso a /me funciona |
| [ ] | `Register_PersistsUser_InDatabase` | Usuario se guarda en PostgreSQL |
| [ ] | `Login_WithSeededAdmin_Works` | Admin seed puede hacer login |
| [ ] | `Token_ValidatesCorrectly_WithMiddleware` | Middleware JWT valida tokens reales |
| [ ] | `LockedAccount_UnlocksAfterTimeout` | Cuenta se desbloquea tras 15 minutos |
| [ ] | `RoleAuthorization_WorksEndToEnd` | Admin accede a /admin-only, User no |
| [ ] | `ConcurrentLogins_SameUser_AllSucceed` | Múltiples sesiones simultáneas permitidas |
| [ ] | `DatabaseSeeding_CreatesRolesAndAdmin` | DbInitializer funciona con BD real |
| [ ] | `ExpiredToken_ReturnsUnauthorized` | Token expirado es rechazado |

### Tests de API HTTP

| Estado | Test | Descripción |
|--------|------|-------------|
| [ ] | `POST_Register_ReturnsCorrectContentType` | Response es application/json |
| [ ] | `POST_Login_WithMalformedJson_ReturnsBadRequest` | JSON inválido devuelve 400 |
| [ ] | `GET_Me_WithExpiredToken_Returns401` | Token expirado rechazado |
| [ ] | `Endpoints_ReturnCorrectStatusCodes` | Códigos HTTP correctos |
| [ ] | `CORS_AllowsConfiguredOrigins` | CORS funciona correctamente |

---

## Tests de Rendimiento

### Throughput y Latencia

| Estado | Test | Descripción | Métrica objetivo |
|--------|------|-------------|------------------|
| [ ] | `Login_Throughput_Under100ms_P95` | Latencia P95 del login | < 100ms |
| [ ] | `Login_Handles100ConcurrentRequests` | 100 requests simultáneos | Sin errores 5xx |
| [ ] | `Register_Throughput_Under200ms_P95` | Latencia P95 del registro | < 200ms |
| [ ] | `TokenGeneration_Under10ms` | Generación de JWT | < 10ms |
| [ ] | `TokenValidation_Under5ms` | Validación de JWT en middleware | < 5ms |

### Estrés y Carga

| Estado | Test | Descripción |
|--------|------|-------------|
| [ ] | `Login_Under1000RPS_Sustained` | 1000 req/s durante 1 minuto |
| [ ] | `Login_RampUp_To2000RPS` | Incremento gradual hasta 2000 req/s |
| [ ] | `BruteForce_LockoutMechanism_Performance` | Lockout no degrada rendimiento |
| [ ] | `MemoryUsage_StableUnderLoad` | Sin memory leaks en carga sostenida |
| [ ] | `DatabaseConnections_PooledEfficiently` | Pool de conexiones no se agota |

### Seguridad/Rendimiento

| Estado | Test | Descripción |
|--------|------|-------------|
| [ ] | `PasswordHashing_TakesReasonableTime` | Bcrypt ~100-300ms (balance seguridad/UX) |
| [ ] | `TokenGeneration_NotPredictable` | JTI únicos en generación masiva |
| [ ] | `RateLimiting_ProtectsEndpoints` | Rate limit funciona bajo carga |

---

## Resumen

| Categoría | Total | Implementados | Pendientes |
|-----------|-------|---------------|------------|
| Unitarios - AuthService | 20 | 20 | 0 |
| Unitarios - AuthController | 12 | 12 | 0 |
| Unitarios - DbInitializer | 10 | 10 | 0 |
| Integración | 14 | 0 | 14 |
| Rendimiento | 13 | 0 | 13 |
| **Total** | **69** | **42** | **27** |

---

## Estructura de Archivos de Test

```
backend/tests/
├── SimRacingShop.UnitTests/
│   ├── Services/
│   │   └── AuthServiceTests.cs        ✅ Implementado
│   ├── Controllers/
│   │   └── AuthControllerTests.cs     ✅ Implementado
│   └── Data/
│       └── DbInitializerTests.cs      ✅ Implementado
├── SimRacingShop.IntegrationTests/
│   ├── Auth/
│   │   ├── AuthFlowTests.cs           ⏳ Pendiente
│   │   └── AuthApiTests.cs            ⏳ Pendiente
│   └── Fixtures/
│       └── PostgresFixture.cs         ⏳ Pendiente
└── SimRacingShop.PerformanceTests/
    └── Auth/
        ├── LoginPerformanceTests.cs   ⏳ Pendiente
        └── LoadTests.cs               ⏳ Pendiente
```

---

## Comandos para Ejecutar Tests

```bash
# Todos los tests
dotnet test

# Solo unitarios
dotnet test --filter "FullyQualifiedName~UnitTests"

# Solo integración
dotnet test --filter "FullyQualifiedName~IntegrationTests"

# Solo rendimiento
dotnet test --filter "FullyQualifiedName~PerformanceTests"

# Con cobertura
dotnet test --collect:"XPlat Code Coverage"

# Test específico
dotnet test --filter "FullyQualifiedName~Login_WithValidCredentials"
```

---

## Dependencias Requeridas

### UnitTests
- `xunit` - Framework de testing ✅
- `Moq` - Mocking ✅
- `FluentAssertions` - Assertions legibles ✅

### IntegrationTests
- `Microsoft.AspNetCore.Mvc.Testing` - WebApplicationFactory
- `Testcontainers.PostgreSql` - PostgreSQL en Docker

### PerformanceTests
- `NBomber` - Load testing
- `BenchmarkDotNet` - Microbenchmarks

---

**Última actualización:** Enero 2026
