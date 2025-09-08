# 🧪 Guia de Testes - Jest Configurado

## ✅ Status: Configuração Completa

- **Jest** configurado como framework de testes
- **Dependências** organizadas em devDependencies
- **CI/CD** configurado no GitHub Actions
- **Cobertura** de código habilitada

## 🚀 Como executar os testes

### Opção 1: Scripts NPM (após adicionar ao package.json)
Adicione manualmente no **package.json** na seção `"scripts"`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch", 
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

Depois execute:
```bash
npm run test           # Executa todos os testes
npm run test:watch     # Modo watch
npm run test:coverage  # Com cobertura
npm run test:ci        # Para CI/CD
```

### Opção 2: Script direto (disponível agora)
```bash
node scripts/test.js run       # Executa todos os testes
node scripts/test.js watch     # Modo watch
node scripts/test.js coverage  # Com cobertura
node scripts/test.js ci        # Para CI/CD
```

### Opção 3: Jest direto
```bash
npx jest                     # Executa testes
npx jest --coverage         # Com cobertura
npx jest --watch           # Modo watch
```

## 📊 Verificar Cobertura

Execute qualquer comando de cobertura acima para ver:
- **Linhas**: % de linhas cobertas
- **Branches**: % de condicionais testadas
- **Functions**: % de funções testadas  
- **Statements**: % de declarações testadas

## 🎯 Metas de Cobertura

- **Mínimo**: 80% em todas as métricas
- **Objetivo**: 90%+ para componentes críticos

## 📁 Estrutura dos Testes

```
src/
├── components/
│   └── __tests__/           # Testes de componentes
├── hooks/
│   └── __tests__/           # Testes de hooks
├── services/
│   └── __tests__/           # Testes de serviços
├── utils/
│   └── __tests__/           # Testes de utilitários
└── setupTests.ts            # Configuração global
└── test/
    └── utils.tsx            # Utilitários de teste
```

## 🔧 Arquivos de Configuração

- `jest.config.js` - Configuração principal do Jest
- `src/setupTests.ts` - Setup global dos testes
- `src/test/utils.tsx` - Providers e helpers para testes
- `.github/workflows/ci.yml` - Pipeline CI/CD

## ✨ Próximos Passos

1. **Adicione os scripts ao package.json** (cópia manual necessária)
2. **Execute `node scripts/test.js coverage`** para ver cobertura atual
3. **Expanda os testes** conforme necessário para atingir 90%+ de cobertura

A configuração está completa e pronta para uso! 🎉