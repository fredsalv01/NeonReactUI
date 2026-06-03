# Guía de Contribución

## 🚀 Commit Message Convention

Este proyecto utiliza **Conventional Commits** para mantener un historial de commits limpio y organizado.

### Tipos de Commits Permitidos

| Tipo | Descripción | Emoji |
|------|-------------|-------|
| `feat` | Nueva funcionalidad | ✨ |
| `fix` | Arreglo de bug | 🐛 |
| `hotfix` | Arreglo urgente en producción | 🚨 |
| `docs` | Cambios en documentación | 📚 |
| `style` | Cambios de formato (no afectan lógica) | 💄 |
| `refactor` | Refactorización de código | ♻️ |
| `perf` | Mejora de performance | ⚡ |
| `test` | Agregar o actualizar tests | ✅ |
| `build` | Cambios en build o dependencias | 🔨 |
| `ci` | Cambios en CI/CD | 🤖 |
| `chore` | Cambios generales | 🧹 |
| `revert` | Revertir un commit anterior | ⏮️ |
| `wip` | Work in progress (no mergear a main) | 🚧 |

### Formato

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

### Ejemplos

#### Feature
```
feat(inventory): add image upload functionality

Added support for uploading equipment images to Supabase storage
with UUID-based naming and progress tracking.

Closes #42
```

#### Fix
```
fix(modal): prevent focus loss when typing in inputs

Removed automatic modal focus stealing that was causing inputs
to lose focus after each keystroke.
```

#### Hotfix
```
hotfix(auth): fix critical session expiration bug

The auth token was expiring prematurely due to incorrect
timestamp calculation.

Closes #156
```

#### Documentation
```
docs: update API documentation

Added missing endpoint descriptions and request/response examples.
```

#### Refactor
```
refactor(inventory): replace React Query with Zustand

Migrated data management from React Query to Zustand for
better real-time updates.
```

## 📋 Setup Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Git Hooks
```bash
npm run prepare
```

Este comando instalará automáticamente los hooks de Husky para validar commits localmente.

### 3. Hacer Commits

#### Opción A: Usar el asistente interactivo (recomendado)
```bash
npm run commit
```

#### Opción B: Git commit directo (con validación)
```bash
git commit -m "feat(feature-name): your message here"
```

Si el mensaje no sigue la convención, será rechazado con un error.

## ✅ CI/CD Pipeline

Cada push a una rama de feature o pull request a `main` ejecutará automáticamente:

1. **Commitlint** - Valida que todos los commits sigan la convención
2. **ESLint** - Verifica calidad del código
3. **Build** - Compila el proyecto
4. **Tests** - Ejecuta suite de tests
5. **Security Audit** - Revisa vulnerabilidades en dependencias

### Estados Posibles
- ✅ **Success** - Todo pasó
- ⚠️ **Warning** - Hay warnings pero se permite merge
- ❌ **Failed** - Debe corregirse antes de mergear

## 🐛 Troubleshooting

### "commit-msg hook rejected"
Esto significa que tu mensaje de commit no sigue la convención. Verifica:
- El tipo está en la lista permitida
- La descripción no termina con punto
- El header no excede 100 caracteres

### "husky: command not found"
Ejecuta: `npm run prepare`

### Bypass hooks (no recomendado)
```bash
git commit --no-verify
```

## 📊 Branch Naming Convention

- `feature/feature-name` - Nueva funcionalidad
- `fix/bug-description` - Arreglo de bug
- `hotfix/issue-description` - Arreglo urgente
- `docs/description` - Cambios de documentación
- `refactor/description` - Refactorización

Ejemplo: `feature/inventory-modal-fix`

## 🔗 Referencias

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitlint](https://commitlint.js.org/)
- [Husky](https://husky.sh/)
