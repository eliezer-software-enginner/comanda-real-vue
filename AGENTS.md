# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this repository.

## Development Commands

### Core Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs type-check + build-only in parallel)
- `npm run build-only` - Build without type checking
- `npm run preview` - Preview production build locally

### Testing Commands

- `npm run test:unit` - Run all unit tests once
- `npm run test:unit <file>` - Run single test file (e.g., `npm run test:unit src/services/lojistaService/LojistaService.test.ts`)
- `npm run seed` - Populate database with mock data (runs multiple mock test files)
- Test files use `.test.ts` extension and are placed alongside service files

### Code Quality Commands

- `npm run lint` - Run ESLint with auto-fix and caching
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run pre-commit` - Run build + unit tests (used for pre-commit hook)

### Firebase Commands

- `npm run firebase:emulators` - Start Firebase emulators
- Use `./scripts/inicializa-app.sh` (Linux) or `.\scripts\inicializa-app.ps1` (Windows) for complete setup

## Code Style Guidelines

### Import Organization

- Use `@` alias for src directory imports (configured in vite.config.ts)
- Group imports: 1) External libraries, 2) Internal services, 3) Components, 4) Utils
- Example:

```typescript
import { createApp } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import logger from '@/plugins/logs'
import { LojistaService } from '@/services/lojistaService/LojistaService'
```

### TypeScript Conventions

- Use interfaces for object shapes and type aliases for primitives/unions
- Prefer explicit return types for public methods
- Use generic types properly (e.g., `CrudService<InputData, T extends Identificavel>`)
- Use `type` for Firebase types, `interface` for domain models

### Naming Conventions

- **Files**: PascalCase for components (ProductForm.vue), camelCase for services (lojistaService.ts)
- **Classes**: PascalCase (LojistaService, CrudService)
- **Methods**: camelCase with descriptive Portuguese names (criar, atualizar, getById)
- **Variables**: camelCase, prefer Portuguese for business logic
- **Constants**: UPPER_SNAKE_CASE for static values

### Error Handling

- Use structured logging with logger from '@/plugins/logs'
- Include context: label, method, and relevant data
- Throw descriptive Error objects with Portuguese messages
- Use try-catch blocks for async operations, especially Firebase calls

### Vue Component Guidelines

- Use Composition API with `<script setup lang="ts">`
- Define props interfaces with descriptive names
- Use `useCssModule()` for CSS modules
- Prefer `ref` over `reactive` for primitive values
- Use `watch` with immediate option for prop changes
- Handle form submissions with preventDefault
- Import pattern: `<style module src="./Component.module.css">`

### Service Layer Patterns

- Extend `CrudService<InputData, Model>` for database operations
- Implement abstract methods: `getCollection()`, `getDoc()`, `prepararDadosPreCriacao()`, validation methods
- Use DTOs for input data, Models for internal representation
- Include comprehensive logging for all operations
- Handle document existence checks appropriately

### CSS Module Conventions

- Use CSS Modules for component-scoped styles
- Follow BEM-like naming: `.formGroup`, `.saveButton`, `.cancelButton`
- Import with `<style module src="./Component.module.css">`

### Testing Guidelines

- Use Vitest with jsdom environment
- Structure tests with `describe`, `test`, `beforeAll`
- Mock Firebase with emulator configuration
- Test both success and error scenarios
- Use descriptive Portuguese test names

### Firebase Integration

- Use emulator in development (check `import.meta.env.MODE === 'development'`)
- Follow collection structure: `apps/comanda-real/{collection}`
- Use proper TypeScript types from Firebase
- Handle document references and snapshots correctly

### Code Formatting

- Prettier config: no semicolons, single quotes, 100 char width
- ESLint with Vue + TypeScript + Prettier integration
- Use `npm run format` before commits

## Project Structure Notes

### Key Directories

- `src/services/` - Business logic and data access
- `src/components/` - Vue components organized by feature
- `src/views/` - Page components (dashboardLoja/, usuario/)
- `src/mocks/` - Test data and mock configurations
- `src/utils/` - Utility functions and helpers
- `src/types/` - TypeScript type definitions
- `src/plugins/` - Vue plugins (logs, vuetify)
- `src/stores/` - Pinia state management

### Service Architecture

- Each service extends `CrudService` for standard CRUD operations
- Use separate DTO files for input validation
- Model files represent database entities
- Test files use `.test.ts` extension with comprehensive coverage

### State Management

- Uses Pinia for global state
- Services handle data persistence
- Components manage local state with refs

## Development Workflow

1. Start Firebase emulators: `npm run firebase:emulators`
2. Seed mock data: `npm run seed`
3. Start dev server: `npm run dev`
4. Run tests: `npm run test:unit`
5. Check types: `npm run type-check`
6. Format code: `npm run format`
7. Run pre-commit check: `npm run pre-commit`

## Git Commit Guidelines

- **IMPORTANT**: Always make commit immediately after implementing working changes
- Use descriptive Portuguese commit messages
- Include brief summary of what was changed and why
- Example: `git commit -m "corrige adição de múltiplas unidades no carrinho"`
- Do not batch multiple working changes - commit each functional improvement separately
