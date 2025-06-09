
# 📦 Sistema de Gestão de Estoque

Um sistema moderno e eficiente para gerenciamento de estoque, desenvolvido com as melhores práticas de engenharia de software.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **UI/UX**: Tailwind CSS + Shadcn/UI
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: TanStack Query (React Query)
- **Roteamento**: React Router DOM
- **Gráficos**: Recharts
- **Ícones**: Lucide React

## ✨ Funcionalidades Principais

### 📊 Dashboard Inteligente
- Métricas em tempo real
- Gráficos interativos de movimentações
- Análise de categorias
- Alertas de estoque baixo
- Comparação mensal automatizada

### 📦 Gestão de Produtos
- CRUD completo de produtos
- Upload de imagens
- Controle de estoque mínimo
- Categorização avançada
- Busca e filtros otimizados

### 🏭 Gestão de Fornecedores
- Cadastro completo de fornecedores
- Vinculação produto-fornecedor
- Histórico de relacionamentos

### 📈 Relatórios Avançados
- Relatórios de movimentações
- Análise de valor de estoque
- Distribuição por categorias
- Exportação de dados

### 🔔 Sistema de Notificações
- Alertas em tempo real
- WebSockets para atualizações instantâneas
- Notificações de estoque baixo
- Alertas de movimentações de alto valor

### 👥 Gestão de Usuários
- Sistema de autenticação segura
- Controle de permissões (Employee/Admin/Developer)
- Perfis de usuário

## 🛠️ Otimizações Implementadas

### ⚡ Performance
- **Debounce e Throttle**: Otimização de buscas e atualizações
- **Cache Inteligente**: Sistema de cache com TTL configurável
- **Batching**: Agrupamento de consultas para reduzir requisições
- **Lazy Loading**: Carregamento sob demanda de componentes
- **WebSockets**: Atualizações em tempo real sem polling

### 📱 Responsividade
- Design mobile-first
- Breakpoints otimizados
- Componentes adaptativos
- Touch-friendly interfaces

### 🔒 Segurança
- Row Level Security (RLS) no Supabase
- Autenticação JWT
- Validação de permissões
- Logs de segurança

## 🏗️ Arquitetura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── auth/           # Componentes de autenticação
│   ├── dashboard/      # Componentes do dashboard
│   ├── layout/         # Layout e navegação
│   ├── notifications/  # Sistema de notificações
│   └── ui/            # Componentes base (Shadcn)
├── hooks/              # Custom hooks
├── pages/              # Páginas da aplicação
├── services/           # Serviços e APIs
├── types/              # Definições TypeScript
└── lib/                # Utilitários e configurações
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd sistema-estoque
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Configure o Supabase:
- Crie um projeto no [Supabase](https://supabase.com)
- Execute as migrações SQL fornecidas
- Configure as variáveis no arquivo `.env.local`

5. Execute o projeto:
```bash
npm run dev
```

## 📊 Banco de Dados

### Tabelas Principais
- `products`: Produtos e estoque
- `stock_movements`: Movimentações de estoque
- `suppliers`: Fornecedores
- `categories`: Categorias de produtos
- `profiles`: Perfis de usuário

### Funções Otimizadas
- `get_dashboard_stats()`: Estatísticas do dashboard
- `get_movements_summary()`: Resumo de movimentações
- `get_category_analysis()`: Análise por categorias
- `get_low_stock_products()`: Produtos com estoque baixo

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Executa em modo desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
npm run lint         # Linting do código
npm run type-check   # Verificação de tipos
```

## 📝 Padrões de Código

### Convenções
- **Componentes**: PascalCase
- **Hooks**: camelCase com prefixo `use`
- **Tipos**: PascalCase com sufixo adequado
- **Constantes**: UPPER_SNAKE_CASE

### Estrutura de Componentes
```typescript
interface ComponentProps {
  // Props tipadas
}

export const Component: React.FC<ComponentProps> = ({ prop }) => {
  // Hooks
  // Estados
  // Efeitos
  // Handlers
  // Render
};
```

## 🌟 Funcionalidades Futuras

- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Sincronização automática
- [ ] API REST pública
- [ ] Integração com ERPs
- [ ] App mobile nativo
- [ ] IA para previsão de estoque

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvedor Principal**: Victor Gabriel Carvalho Pereira
- **Arquitetura**: Sistema modular e escalável
- **Design**: Interface moderna e intuitiva

## 📞 Suporte

Para suporte ou dúvidas:
- 📧 Email: suporte@sistema-estoque.com
- 💬 Discord: [Servidor do Projeto](https://discord.gg/projeto)
- 📖 Documentação: [docs.sistema-estoque.com](https://docs.sistema-estoque.com)

---

**Feito com ❤️ e as melhores práticas de engenharia de software**
