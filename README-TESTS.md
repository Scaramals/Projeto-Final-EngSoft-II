# Sistema de Testes - Jest

## Configuração Atual

✅ **Jest** configurado como framework de testes
✅ **CI/CD** configurado no GitHub Actions
✅ **Cobertura de código** habilitada
✅ **SonarCloud** integrado para análise de qualidade

## Scripts Disponíveis

```bash
# Rodar todos os testes
npm run test

# Rodar testes com cobertura
npm run test:coverage

# Rodar testes em modo watch
npm run test:watch

# Rodar testes para CI
npm run test:ci
```

## Estado Atual dos Testes

### ✅ Funcionando
- Validação de formulários (`stockMovementValidation.test.ts`)
- Utilitários (`utils.test.ts`, `formatters.test.ts`, `validators.test.ts`)
- Componente Button básico (`button.test.tsx`)
- Cache Service (`cacheService.test.ts`)
- Stock Service (`stockService.test.ts`)
- Stock Form (`useStockForm.test.ts`)

### 📊 Cobertura Atual
Execute `npm run test:coverage` para ver métricas detalhadas:
- **Linhas**: Cobertura por linha de código
- **Branches**: Cobertura de condicionais
- **Functions**: Cobertura de funções
- **Statements**: Cobertura de declarações

## CI/CD Pipeline

O arquivo `.github/workflows/ci.yml` executa automaticamente:

1. **Linting** - Verifica padrões de código
2. **Testes** - Roda todos os testes com cobertura
3. **Build** - Compila o projeto
4. **Security Audit** - Verifica vulnerabilidades
5. **SonarCloud** - Análise de qualidade de código

## Como Adicionar Novos Testes

1. Crie arquivos na pasta `__tests__` ou com sufixo `.test.ts/.test.tsx`
2. Use imports do Jest: `import { describe, it, expect } from '@jest/globals'`
3. Para componentes React: `import { render } from '@testing-library/react'`
4. Para hooks: `import { renderHook } from '@testing-library/react'`

## Exemplo de Teste Simples

```typescript
import { describe, it, expect } from '@jest/globals';

describe('MinhaFuncao', () => {
  it('deve retornar resultado esperado', () => {
    const resultado = minhaFuncao('entrada');
    expect(resultado).toBe('saida esperada');
  });
});
```

## Metas de Cobertura

- **Mínimo**: 80% em todas as métricas
- **Objetivo**: 90%+ para componentes críticos
- **Excluídos**: Tipos, configurações, migrações do Supabase

Execute `npm run test:coverage` para verificar se está atingindo as metas!