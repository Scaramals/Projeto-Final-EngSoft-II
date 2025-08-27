# 🧪 Guia de Testes - Sistema de Gestão de Inventário

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Configuração](#configuração)
- [Como Executar os Testes](#como-executar-os-testes)
- [Estrutura dos Testes](#estrutura-dos-testes)
- [Cobertura de Código](#cobertura-de-código)
- [Tipos de Testes](#tipos-de-testes)
- [Exemplos](#exemplos)
- [Boas Práticas](#boas-práticas)

## 🎯 Visão Geral

Este projeto utiliza **Vitest** como framework principal de testes, com **React Testing Library** para testes de componentes e **Jest DOM** para assertions personalizadas.

### 📊 Métricas de Cobertura
- **Meta Mínima**: 80% (lines, branches, functions, statements)
- **Meta Ideal**: 100%

## ⚙️ Configuração

### Dependências de Teste
- **Vitest**: Framework de testes rápido
- **@testing-library/react**: Utilitários para testar componentes React
- **@testing-library/user-event**: Simulação de interações do usuário
- **@testing-library/jest-dom**: Matchers customizados para DOM
- **@vitest/coverage-v8**: Relatórios de cobertura
- **jsdom**: Ambiente DOM simulado

### Configuração (vitest.config.ts)
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

## 🚀 Como Executar os Testes

### Comandos Disponíveis

```bash
# Executar todos os testes em modo watch
npm run test

# Executar testes com interface gráfica
npm run test:ui

# Executar testes uma única vez
npm run test:run

# Executar testes com relatório de cobertura
npm run test:coverage

# Executar testes específicos
npm run test -- src/hooks/__tests__/useProducts.test.ts

# Executar testes em modo watch para arquivos específicos
npm run test:watch -- src/components
```

### 📊 Visualizar Cobertura

Após executar `npm run test:coverage`:

1. **Terminal**: Veja resumo da cobertura
2. **HTML**: Abra `coverage/index.html` no navegador para relatório detalhado
3. **LCOV**: Arquivo `coverage/lcov.info` para ferramentas externas

## 📁 Estrutura dos Testes

```
src/
├── components/
│   ├── ui/
│   │   └── __tests__/
│   │       └── button.test.tsx
│   └── products/
│       └── __tests__/
│           └── ProductCard.test.tsx
├── hooks/
│   └── __tests__/
│       ├── useProducts.test.ts
│       ├── useStockForm.test.ts
│       └── useDashboard.test.ts
├── services/
│   └── __tests__/
│       ├── stockService.test.ts
│       └── stockMovementValidation.test.ts
├── utils/
│   └── __tests__/
│       ├── formatters.test.ts
│       └── validators.test.ts
├── lib/
│   └── __tests__/
│       └── utils.test.ts
└── test/
    ├── setup.ts
    └── README.md
```

## 🧪 Tipos de Testes

### 1. Testes de Componentes
Testam comportamento e renderização de componentes React.

**Exemplo**: `src/components/products/__tests__/ProductCard.test.tsx`
```typescript
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  it('deve renderizar informações do produto', () => {
    const product = {
      id: '1',
      name: 'Produto Teste',
      price: 99.99
    };
    
    render(<ProductCard product={product} />);
    
    expect(screen.getByText('Produto Teste')).toBeInTheDocument();
    expect(screen.getByText('R$ 99,99')).toBeInTheDocument();
  });
});
```

### 2. Testes de Hooks
Testam lógica de hooks customizados.

**Exemplo**: `src/hooks/__tests__/useProducts.test.ts`
```typescript
import { renderHook } from '@testing-library/react';
import { useProducts } from '../useProducts';

describe('useProducts', () => {
  it('deve carregar produtos inicialmente', () => {
    const { result } = renderHook(() => useProducts());
    
    expect(result.current.isLoading).toBe(true);
  });
});
```

### 3. Testes de Serviços
Testam lógica de negócio e integração com APIs.

**Exemplo**: `src/services/__tests__/stockService.test.ts`
```typescript
import { StockService } from '../stockService';

describe('StockService', () => {
  it('deve retornar estoque atual do produto', async () => {
    const stock = await StockService.getCurrentStock('product-1');
    expect(typeof stock).toBe('number');
  });
});
```

### 4. Testes de Utilitários
Testam funções auxiliares e validadores.

**Exemplo**: `src/utils/__tests__/formatters.test.ts`
```typescript
import { formatCurrency } from '../formatters';

describe('formatters', () => {
  it('deve formatar valor como moeda brasileira', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
  });
});
```

## 📊 Cobertura de Código

### Interpretando Relatórios

- **Lines**: Linhas de código executadas
- **Branches**: Ramificações condicionais testadas
- **Functions**: Funções testadas
- **Statements**: Declarações executadas

### Arquivos Excluídos da Cobertura
- `node_modules/`
- `src/test/`
- `**/*.d.ts`
- `**/*.config.*`
- `src/integrations/supabase/types.ts`
- `build.js`
- `src/main.tsx`
- `src/App.tsx`

## ✅ Status dos Testes Existentes

### ✅ Hooks Testados
- [x] `useDashboard` - Teste completo com mock de API
- [x] `useStockMovements` - Testa CRUD e validações
- [x] `useSuppliers` - Testa operações de fornecedores
- [x] `useCategories` - Testa gerenciamento de categorias
- [x] `useRealtimeStock` - Testa atualizações em tempo real
- [x] `useProducts` - Testa operações de produtos
- [x] `useStockForm` - Testa validações de formulário

### ✅ Componentes Testados
- [x] `Button` - Testa variantes e comportamentos
- [x] `ProductCard` - Testa renderização de dados

### ✅ Serviços Testados
- [x] `StockService` - Testa operações de estoque
- [x] `stockMovementValidation` - Testa validações

### ✅ Utilitários Testados
- [x] `formatters` - Testa formatação de moeda e data
- [x] `validators` - Testa validações de email e senha
- [x] `utils` - Testa funções auxiliares

## 🎯 Boas Práticas

### ✅ Fazer
- **Nomes descritivos**: Use descrições claras nos testes
- **AAA Pattern**: Arrange, Act, Assert
- **Mocks mínimos**: Mocke apenas o necessário
- **Testes unitários**: Teste uma funcionalidade por vez
- **Dados de teste**: Use dados realistas mas simples

### ❌ Evitar
- **Testes frágeis**: Depender de implementação interna
- **Mocks excessivos**: Mockar tudo desnecessariamente
- **Testes duplicados**: Testar a mesma coisa múltiplas vezes
- **Testes complexos**: Um teste deve ter um foco específico

### 📝 Template de Teste
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('NomeDoComponente/Hook/Service', () => {
  beforeEach(() => {
    // Setup para cada teste
    vi.clearAllMocks();
  });

  describe('funcionalidade específica', () => {
    it('deve fazer algo específico quando condição X', () => {
      // Arrange: Preparar dados e mocks
      const mockData = { id: '1', name: 'Test' };
      
      // Act: Executar a ação
      const result = funcaoTestada(mockData);
      
      // Assert: Verificar resultado
      expect(result).toBe(expectedValue);
    });
  });
});
```

## 🔧 Comandos Úteis para Desenvolvimento

```bash
# Executar testes relacionados a arquivos modificados
npm run test -- --changed

# Executar testes com verbose output
npm run test -- --reporter=verbose

# Executar testes em modo silent
npm run test -- --silent

# Executar testes com retry para flaky tests
npm run test -- --retry=3

# Executar apenas testes que falharam
npm run test -- --rerun-failures
```

## 📈 Melhorias Futuras

- [ ] Testes E2E com Playwright
- [ ] Testes de integração com Supabase
- [ ] Performance testing
- [ ] Visual regression testing
- [ ] Automated accessibility testing

## 🆘 Troubleshooting

### Problema: Testes falhando após mudanças no Supabase
**Solução**: Verifique os mocks em `src/test/setup.ts`

### Problema: Cobertura baixa em componentes UI
**Solução**: Adicione testes de interação do usuário

### Problema: Testes lentos
**Solução**: Use `--no-coverage` durante desenvolvimento

---

Para mais informações, consulte:
- [Documentação do Vitest](https://vitest.dev)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

**Contato**: Equipe de Desenvolvimento