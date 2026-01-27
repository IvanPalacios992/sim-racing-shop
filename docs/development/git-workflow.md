# 🔀 Git Workflow y Estrategia de Branching

## 📊 Estrategia: Git Flow Simplificado

Usaremos una versión simplificada de Git Flow, optimizada para un equipo pequeño y despliegues continuos.

```
main (production) ─────●─────────●──────────●──────►
                        ↑         ↑          ↑
                        │         │          │
develop (staging) ──●───●─●───●───●──●───●───●──────►
                     ↑   ↑ ↑   ↑   ↑  ↑   ↑   ↑
                     │   │ │   │   │  │   │   │
feature/checkout ────┘   │ │   │   │  │   │   │
feature/3d-viewer ───────┘ │   │   │  │   │   │
feature/admin-panel ────────┘   │   │  │   │   │
hotfix/payment-bug ─────────────┘   │  │   │   │
feature/emails ──────────────────────┘  │   │   │
feature/seo ─────────────────────────────┘   │   │
feature/testing ─────────────────────────────┘   │
hotfix/critical-bug ─────────────────────────────┘
```

---

## 🌿 Branches Principales

### `main` - Producción
- **Propósito:** Código en producción
- **Deploy:** Automático a producción (Vercel + Railway)
- **Protección:** Requiere Pull Request + aprobación
- **Commits directos:** ❌ NUNCA

### `develop` - Staging
- **Propósito:** Integración y testing
- **Deploy:** Automático a staging
- **Commits directos:** ⚠️ Evitar, preferir PR
- **Base para:** Feature branches

---

## 🔧 Branches de Trabajo

### Feature Branches

**Nomenclatura:**
```
feature/nombre-descriptivo
feature/checkout-flow
feature/3d-configurator
feature/admin-dashboard
```

**Crear:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-descriptivo
```

**Lifecycle:**
1. Crear desde `develop`
2. Desarrollar y commitear
3. Push a GitHub
4. Abrir PR hacia `develop`
5. Code review
6. Merge y eliminar branch

**Eliminar después de merge:**
```bash
# Localmente
git branch -d feature/nombre-descriptivo

# Remotamente (automático en GitHub si se configura)
git push origin --delete feature/nombre-descriptivo
```

---

### Hotfix Branches

**Nomenclatura:**
```
hotfix/descripcion-bug
hotfix/payment-gateway-timeout
hotfix/crash-on-checkout
```

**Crear:**
```bash
# Desde main (bug en producción)
git checkout main
git pull origin main
git checkout -b hotfix/descripcion-bug
```

**Lifecycle:**
1. Crear desde `main`
2. Fix rápido
3. Commitear
4. PR hacia `main` (urgente)
5. Merge a `main` → deploy
6. **IMPORTANTE:** Merge también a `develop`
   ```bash
   git checkout develop
   git merge main
   git push origin develop
   ```

---

### Release Branches (Opcional)

Para proyecto individual, probablemente no necesites, pero si quieres:

**Nomenclatura:**
```
release/v1.0.0
release/v1.1.0
```

**Uso:**
```bash
git checkout develop
git checkout -b release/v1.0.0
# Preparar release (actualizar versiones, changelog)
git commit -m "chore: prepare release v1.0.0"
# PR a main
```

---

## 📝 Convenciones de Commits

### Formato: Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Tipos de Commit

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat(checkout): add payment processing` |
| `fix` | Bug fix | `fix(auth): resolve token expiration issue` |
| `docs` | Documentación | `docs: update setup guide` |
| `style` | Formato (no afecta código) | `style: fix linting errors` |
| `refactor` | Refactorización | `refactor(api): simplify order service` |
| `perf` | Mejoras de performance | `perf(3d): optimize model loading` |
| `test` | Tests | `test(cart): add unit tests` |
| `chore` | Tareas de mantenimiento | `chore: update dependencies` |
| `ci` | CI/CD | `ci: add deployment workflow` |
| `build` | Build system | `build: configure webpack` |

### Scopes Comunes

```
auth, checkout, cart, product, admin, api, 
frontend, backend, db, 3d, email, docs
```

### Ejemplos Buenos

```bash
✅ feat(checkout): implement stripe payment integration
✅ fix(cart): correct quantity calculation bug
✅ docs(readme): add installation instructions
✅ refactor(api): extract payment service
✅ test(auth): add login endpoint tests
✅ chore(deps): upgrade next.js to 15.1
```

### Ejemplos Malos

```bash
❌ updated stuff
❌ fix bug
❌ changes
❌ WIP
❌ asdfasdf
```

---

## 🔄 Flujo de Trabajo Típico

### Desarrollar Nueva Feature

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Crear feature branch
git checkout -b feature/user-authentication

# 3. Desarrollar (hacer commits frecuentes)
git add .
git commit -m "feat(auth): add login endpoint"

git add .
git commit -m "feat(auth): add registration form"

git add .
git commit -m "test(auth): add auth service tests"

# 4. Push a GitHub
git push origin feature/user-authentication

# 5. Abrir Pull Request en GitHub UI
# Target: develop ← feature/user-authentication

# 6. Code review y ajustes
git add .
git commit -m "refactor(auth): address review comments"
git push origin feature/user-authentication

# 7. Merge (en GitHub o CLI)
# En GitHub: Click "Merge Pull Request"

# O por CLI después de aprobación:
git checkout develop
git merge feature/user-authentication
git push origin develop

# 8. Eliminar branch
git branch -d feature/user-authentication
git push origin --delete feature/user-authentication
```

---

### Hotfix en Producción

```bash
# 1. Desde main
git checkout main
git pull origin main

# 2. Crear hotfix branch
git checkout -b hotfix/stripe-webhook-error

# 3. Fix rápido
git add .
git commit -m "fix(payments): handle stripe webhook timeout"

# 4. Push y PR urgente
git push origin hotfix/stripe-webhook-error
# Abrir PR a main (marcar como urgente)

# 5. Merge a main (después de aprobación)
git checkout main
git merge hotfix/stripe-webhook-error
git push origin main
# → Esto triggerea deploy a producción

# 6. ⚠️ IMPORTANTE: Merge a develop también
git checkout develop
git merge main
git push origin develop

# 7. Eliminar hotfix branch
git branch -d hotfix/stripe-webhook-error
git push origin --delete hotfix/stripe-webhook-error
```

---

### Release a Producción

```bash
# 1. Desde develop (debe estar estable)
git checkout develop
git pull origin develop

# 2. Abrir PR: develop → main
# En GitHub UI o:
git checkout main
git pull origin main
git merge develop
git push origin main

# → Esto triggerea deploy a producción

# 3. Opcional: Crear tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

## 🔀 Merge vs Rebase

### Cuándo Usar Cada Uno

**Merge (Recomendado para este proyecto):**
```bash
git checkout develop
git merge feature/mi-feature
```
✅ Preserva historia completa  
✅ Más seguro para colaboración  
✅ Mejor para features complejas  

**Rebase (Solo para limpiar historia local):**
```bash
git checkout feature/mi-feature
git rebase develop
```
✅ Historia lineal  
⚠️ Solo antes de hacer push  
⚠️ NUNCA en branches públicos  

**Squash Merge (Para PRs con muchos commits):**
```bash
# En GitHub PR: "Squash and merge"
```
✅ Condensa múltiples commits en uno  
✅ Historia limpia en main/develop  

---

## 🛡️ Protección de Branches

### Configurar en GitHub

**Settings → Branches → Branch Protection Rules**

#### Para `main`:
- [x] Require pull request before merging
- [x] Require approvals (1 mínimo)
- [x] Dismiss stale approvals
- [x] Require status checks to pass
  - [x] CI tests must pass
  - [x] Linting must pass
- [x] Require conversation resolution
- [x] Require linear history (opcional)
- [x] Include administrators
- [x] Restrict who can push (solo maintainers)

#### Para `develop`:
- [x] Require pull request before merging
- [x] Require status checks to pass
- [ ] Require approvals (opcional si trabajas solo)

---

## 📋 Pull Request Template

Crear `.github/pull_request_template.md`:

```markdown
## 📝 Descripción

Descripción clara y concisa de los cambios.

## 🎯 Tipo de cambio

- [ ] 🐛 Bug fix (no breaking change)
- [ ] ✨ Nueva feature (no breaking change)
- [ ] 💥 Breaking change (fix o feature que causa que funcionalidad existente no funcione)
- [ ] 📝 Documentación
- [ ] ♻️ Refactorización

## ✅ Checklist

- [ ] Mi código sigue el estilo del proyecto
- [ ] He realizado self-review
- [ ] He comentado código complejo
- [ ] He actualizado documentación
- [ ] Mis cambios no generan warnings
- [ ] He añadido tests
- [ ] Tests nuevos y existentes pasan localmente
- [ ] Cambios dependientes han sido mergeados

## 🧪 Testing

Describe los tests realizados:
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual testing

## 📸 Screenshots (si aplica)

Añadir capturas de UI changes.

## 📚 Documentación Relacionada

Links a issues, tickets, documentación, etc.

## 🔗 Issues Relacionados

Closes #123
Fixes #456
```

---

## 🏷️ Versionado Semántico

Usar [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1 → 1.1.0 → 2.0.0
```

**MAJOR:** Breaking changes  
**MINOR:** Nueva funcionalidad (backward compatible)  
**PATCH:** Bug fixes (backward compatible)

### Ejemplos:

```bash
# First release
v1.0.0

# Bug fix
v1.0.1 - fix(payments): resolve stripe timeout

# New feature
v1.1.0 - feat(wishlist): add wishlist functionality

# Breaking change
v2.0.0 - feat(api)!: redesign REST API structure
```

### Crear Release en GitHub

```bash
# Crear tag
git tag -a v1.0.0 -m "Release v1.0.0: MVP Launch"
git push origin v1.0.0

# O en GitHub UI:
# Releases → Draft new release → Create tag
```

---

## 🚫 .gitignore Completo

```gitignore
# ============================================
# FRONTEND (Next.js)
# ============================================

# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage
*.lcov
.nyc_output
playwright-report/
test-results/

# Next.js
/.next/
/out/
.vercel

# Production
/build
/dist

# Environment variables
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.idea/
*.swp
*.swo
*~
.DS_Store

# Misc
*.log
.cache

# ============================================
# BACKEND (.NET)
# ============================================

# Build results
[Dd]ebug/
[Dd]ebugPublic/
[Rr]elease/
[Rr]eleases/
x64/
x86/
[Aa]rm/
[Aa]rm64/
bld/
[Bb]in/
[Oo]bj/
[Ll]og/
[Ll]ogs/

# User-specific files
*.rsuser
*.suo
*.user
*.userosscache
*.sln.docstates

# Visual Studio
.vs/
.vscode/

# Rider
.idea/
*.sln.iml

# Logs
logs/
*.log

# Database
*.db
*.db-shm
*.db-wal

# Environment files
appsettings.Development.json
appsettings.Production.json
appsettings.Staging.json
appsettings.*.json
!appsettings.json
!appsettings.example.json

# User secrets
secrets.json

# ============================================
# DOCKER
# ============================================

# Docker volumes
**/data/

# ============================================
# OS
# ============================================

# macOS
.DS_Store
.AppleDouble
.LSOverride
._*

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/

# Linux
*~

# ============================================
# PROJECT SPECIFIC
# ============================================

# Uploaded files (if stored locally)
/uploads/
/public/uploads/

# Models 3D (si son muy grandes, usar LFS)
# /public/models/*.glb

# Temporary files
temp/
tmp/
*.tmp

# Coverage reports
coverage/
*.coverage
*.coveragexml

# Documentation build
/docs/_build/
```

---

## 🤖 Git Hooks con Husky (Opcional)

Para automatizar checks antes de commits:

### Setup Husky

```bash
cd frontend

# Instalar husky
npm install -D husky

# Inicializar
npx husky install

# Añadir hook pre-commit
npx husky add .husky/pre-commit "npm run lint"
npx husky add .husky/pre-commit "npm run type-check"

# Añadir hook pre-push
npx husky add .husky/pre-push "npm test"
```

### Ejemplo `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running linter..."
npm run lint

echo "🔍 Running type check..."
npm run type-check

echo "✅ Pre-commit checks passed"
```

---

## 📊 Comandos Git Útiles

### Información y Estado

```bash
# Estado actual
git status

# Ver branches
git branch -a

# Ver historial
git log --oneline --graph --all

# Ver cambios no commiteados
git diff

# Ver cambios en archivo específico
git diff archivo.ts

# Ver quién modificó cada línea
git blame archivo.ts
```

### Deshacer Cambios

```bash
# Descartar cambios en archivo
git checkout -- archivo.ts

# Descartar todos los cambios
git reset --hard

# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1

# Deshacer último commit (descartar cambios)
git reset --hard HEAD~1

# Revertir commit específico (crea nuevo commit)
git revert abc123

# Modificar último commit
git commit --amend -m "nuevo mensaje"
```

### Stash (Guardar cambios temporalmente)

```bash
# Guardar cambios
git stash

# Guardar con mensaje
git stash save "WIP: feature X"

# Ver stashes
git stash list

# Aplicar último stash
git stash pop

# Aplicar stash específico
git stash apply stash@{0}

# Eliminar stash
git stash drop stash@{0}
```

### Limpieza

```bash
# Eliminar branches locales mergeados
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d

# Eliminar archivos no trackeados
git clean -fd

# Preview de limpieza
git clean -fdn
```

---

## 🎯 Best Practices

### ✅ DO's

1. **Commits pequeños y frecuentes**
   - Cada commit debe hacer una cosa
   - Más fácil de revertir si hay problemas

2. **Mensajes descriptivos**
   - Usar conventional commits
   - Explicar el "por qué", no solo el "qué"

3. **Pull antes de push**
   ```bash
   git pull --rebase origin develop
   git push origin feature/mi-feature
   ```

4. **Feature branches desde develop**
   - Siempre crear features desde `develop` actualizado

5. **Tests antes de merge**
   - Todos los tests deben pasar
   - No mergear código roto

6. **Code review antes de merge**
   - Incluso si trabajas solo, haz self-review

7. **Eliminar branches después de merge**
   - Mantener repo limpio

### ❌ DON'Ts

1. **No commits directos a main**
   - Siempre usar PR

2. **No push de secrets**
   - Usar `.gitignore`
   - Si ocurre, rotar secrets inmediatamente

3. **No commits de node_modules o bin/**
   - Ya están en `.gitignore`

4. **No force push a branches compartidos**
   ```bash
   # ❌ NUNCA
   git push --force origin develop
   
   # ✅ Solo en tu feature branch
   git push --force origin feature/mi-feature
   ```

5. **No merge sin tests**
   - CI debe estar verde

6. **No mensajes vagos**
   - "fix", "update", "changes" → ❌
   - Usar conventional commits → ✅

---

## 🆘 Troubleshooting Git

### Conflict al hacer merge

```bash
# Ver archivos en conflicto
git status

# Editar archivos y resolver conflictos
# Buscar <<<<<<< y =======

# Después de resolver
git add archivo-resuelto.ts
git commit -m "fix: resolve merge conflicts"
```

### Olvidé hacer pull antes de push

```bash
# Hacer pull con rebase
git pull --rebase origin develop

# Resolver conflictos si hay
# Continuar rebase
git rebase --continue
```

### Commité en branch equivocado

```bash
# Guardar cambios
git stash

# Cambiar a branch correcto
git checkout feature/branch-correcto

# Aplicar cambios
git stash pop
```

### Quiero cambiar mensaje de commit

```bash
# Último commit
git commit --amend -m "nuevo mensaje"

# Si ya hice push
git push --force origin mi-branch  # ⚠️ Solo en tu feature branch
```

---

## 📚 Recursos Adicionales

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)

---

**Última actualización:** Enero 2026  
**Mantener actualizado con cambios en workflow**
