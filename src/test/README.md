# Sistema de Testes - Vdev.0 Technologies

## Visão Geral

Este projeto implementa um sistema completo de testes unitários e de integração usando **Vitest**, **React Testing Library** e **@testing-library/user-event** para garantir a qualidade e confiabilidade do código.

## 🎯 Objetivos de Cobertura

- **Cobertura Mínima**: 80%
- **Cobertura Ideal**: 100%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## 🧪 Tipos de Testes Implementados

### 1. Testes de Caixa Branca
- **Testes Unitários**: Testam métodos, funções e classes de forma isolada
- **Testes de Componentes**: Verificam a renderização e comportamento dos componentes React
- **Testes de Hooks**: Validam a lógica de hooks customizados
- **Testes de Serviços**: Testam a lógica de negócio e integrações

### 2. Estrutura de Testes

```
src/
├── test/
│   ├── setup.ts              # Configuração global dos testes
│   └── README.md            # Este arquivo
├── components/
│   └── __tests__/           # Testes de componentes
├── hooks/
│   └── __tests__/           # Testes de hooks
├── services/
│   └── __tests__/           # Testes de serviços
├── utils/
│   └── __tests__/           # Testes de utilitários
└── types/
    └── __tests__/           # Testes de validação de tipos
```

## 🔧 Configuração

### Dependências de Teste
- **vitest**: Framework de testes rápido e moderno
- **@testing-library/react**: Utilitários para testar componentes React
- **@testing-library/jest-dom**: Matchers customizados para DOM
- **@testing-library/user-event**: Simulação de eventos de usuário
- **@vitest/coverage-v8**: Relatórios de cobertura de código
- **jsdom**: Ambiente DOM para testes

### Configuração do Vitest
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
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

## 📋 Scripts de Teste

Adicione ao `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

## 🧩 Exemplos de Testes

### Teste de Componente
```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('deve renderizar com texto correto', () => {
    const { getByRole } = render(<Button>Clique aqui</Button>);
    expect(getByRole('button', { name: 'Clique aqui' })).toBeInTheDocument();
  });
});
```

### Teste de Hook
```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRealtimeStock } from '@/hooks/useRealtimeStock';

describe('useRealtimeStock', () => {
  it('deve retornar estoque inicial', async () => {
    const { result } = renderHook(() => useRealtimeStock('product-123'));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(typeof result.current.currentStock).toBe('number');
  });
});
```

### Teste de Serviço
```typescript
import { describe, it, expect, vi } from 'vitest';
import { StockService } from '@/services/stockService';

vi.mock('@/integrations/supabase/client');

describe('StockService', () => {
  it('deve validar quantidade positiva', async () => {
    const result = await StockService.createMovement({
      productId: 'test',
      quantity: -5,
      type: 'in'
    });
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('quantidade deve ser positiva');
  });
});
```

### Teste de Validador
```typescript
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword } from '@/utils/validators';

describe('validators', () => {
  describe('validateEmail', () => {
    it('deve validar email válido', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });
});
```

## 🎨 Melhores Práticas

### 1. Estrutura de Testes
- **Arrange**: Configurar os dados de teste
- **Act**: Executar a ação a ser testada
- **Assert**: Verificar o resultado esperado

### 2. Nomenclatura
- Nomes descritivos que explicam o comportamento esperado
- Use português para facilitar a compreensão da equipe
- Formato: `deve [comportamento esperado] quando [condição]`

### 3. Isolamento
- Cada teste deve ser independente
- Use `beforeEach` para limpar estado entre testes
- Mock dependências externas (APIs, Supabase, etc.)

### 4. Cobertura
- Teste casos de sucesso e falha
- Teste condições de borda
- Valide tratamento de erros

## 🔍 Mocks Disponíveis

### Supabase Mock
```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      // ... outros métodos
    }))
  }
}));
```

### Router Mock
```typescript
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({}),
  };
});
```

### Toast Mock
```typescript
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));
```

## 📊 Relatórios de Cobertura

Os relatórios são gerados em:
- **Terminal**: Sumário durante execução
- **HTML**: `coverage/index.html` (navegável)
- **JSON**: `coverage/coverage-summary.json` (CI/CD)

## 🚀 Execução de Testes

```bash
# Executar todos os testes
npm run test

# Executar com interface visual
npm run test:ui

# Executar com cobertura
npm run test:coverage

# Executar uma vez (CI/CD)
npm run test:run

# Executar testes específicos
npx vitest hooks

# Modo watch para desenvolvimento
npx vitest --watch
```

## 🎯 Métricas de Qualidade

- **Tempo de execução**: < 2 segundos para suite completa
- **Cobertura**: Mínimo 80%, objetivo 100%
- **Falsos positivos**: < 5%
- **Manutenibilidade**: Testes devem ser fáceis de entender e modificar

## 📚 Recursos Adicionais

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Desenvolvido pela Vdev.0 Technologies**  
CEO: Victor Pereira  
Email: victorgabrielcapereira@gmail.com  
GitHub: https://github.com/Vdev-0  
LinkedIn: http://linkedin.com/in/victor-pereira-v2005/