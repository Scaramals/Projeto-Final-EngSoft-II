
# 📦 Sistema de Gestão de Estoque - Vdev.0

Um sistema moderno e eficiente para gerenciamento de estoque, desenvolvido com as melhores práticas de engenharia de software e arquitetura escalável.

## 🚀 Stack Tecnológica

### Frontend
- **React 18.3.1** - Framework principal para UI
- **TypeScript 5.x** - Linguagem de programação tipada
- **Vite** - Build tool e bundler otimizado
- **Tailwind CSS 3.x** - Framework CSS utility-first
- **Shadcn/UI** - Biblioteca de componentes reutilizáveis

### Backend e Infraestrutura
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL 15+ - Banco de dados relacional
  - Auth - Sistema de autenticação JWT
  - Real-time - WebSockets para atualizações em tempo real
  - Edge Functions - Serverless functions
  - Row Level Security (RLS) - Segurança em nível de linha

### State Management e Data Fetching
- **TanStack Query v5** - Cache e sincronização de estado servidor
- **React Context API** - Gerenciamento de estado global
- **React Hook Form 7.x** - Formulários performáticos

### UI/UX e Interação
- **Lucide React 0.462** - Biblioteca de ícones
- **Recharts 2.12** - Gráficos e visualizações
- **Sonner** - Sistema de notificações toast
- **React Router DOM 6.x** - Roteamento client-side

## 🏗️ Arquitetura do Sistema

### Estrutura de Diretórios

```
src/
├── components/              # Componentes reutilizáveis
│   ├── auth/               # Autenticação e autorização
│   ├── dashboard/          # Componentes do painel principal
│   │   ├── charts/         # Gráficos e visualizações
│   │   └── sections/       # Seções específicas do dashboard
│   ├── forms/              # Formulários especializados
│   ├── inventory/          # Componentes de gestão de estoque
│   │   └── forms/          # Formulários de movimentação
│   ├── layout/             # Layouts e navegação
│   ├── notifications/      # Sistema de notificações
│   ├── products/           # Gestão de produtos
│   ├── reports/            # Relatórios e análises
│   ├── suppliers/          # Gestão de fornecedores
│   └── ui/                 # Componentes base (Shadcn)
├── contexts/               # Contextos React
├── hooks/                  # Custom hooks
├── integrations/           # Integrações externas
│   └── supabase/          # Cliente e tipos Supabase
├── lib/                    # Utilitários e configurações
├── pages/                  # Páginas da aplicação
├── services/               # Camada de serviços
├── types/                  # Definições TypeScript
└── utils/                  # Funções utilitárias
```

### Padrões Arquiteturais

- **Component-Based Architecture** - Componentes reutilizáveis e modulares
- **Custom Hooks Pattern** - Lógica reutilizável encapsulada
- **Service Layer Pattern** - Abstração da camada de dados
- **Repository Pattern** - Acesso consistente aos dados

## 📊 Modelagem do Banco de Dados

### Esquema Principal

```sql
-- Tabela de perfis de usuário
profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'employee',
  is_master BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
)

-- Tabela de categorias
categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
)

-- Tabela de produtos
products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL,
  category_id UUID REFERENCES categories(id),
  category TEXT, -- Campo legado
  image_url TEXT,
  minimum_stock INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  last_modified_by UUID
)

-- Tabela de fornecedores
suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj VARCHAR,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  last_modified_by UUID
)

-- Tabela de relacionamento produto-fornecedor
product_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
)

-- Tabela de movimentações de estoque
stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in', 'out')),
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  supplier_id UUID REFERENCES suppliers(id),
  notes TEXT,
  user_id UUID,
  created_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
)
```

### Funções do Banco de Dados

#### Estatísticas e Analytics
- `get_dashboard_stats()` - Métricas principais do dashboard
- `get_movements_summary(days)` - Resumo de movimentações por período
- `get_category_analysis()` - Análise por categorias
- `get_low_stock_products()` - Produtos com estoque baixo

#### Validação e Controle
- `validate_stock_movement()` - Validação de movimentações
- `get_current_stock()` - Estoque atual de produto
- `handle_stock_movement_simple()` - Trigger para atualização automática

#### Autorização
- `get_user_role()` - Papel do usuário
- `is_admin_or_master()` - Verificação de permissões administrativas

## 🔧 Custom Hooks

### Hooks de Dados
- `useProducts()` - Gestão de produtos (CRUD + cache)
- `useCategories()` - Gestão de categorias
- `useSuppliers()` - Gestão de fornecedores
- `useStockMovements()` - Movimentações de estoque

### Hooks de Estado
- `useDashboard()` - Estado do dashboard
- `useOptimizedDashboard()` - Dashboard otimizado
- `useProfile()` - Perfil do usuário
- `useAuthorization()` - Controle de acesso

### Hooks de Tempo Real
- `useRealtimeStock()` - Estoque em tempo real
- `useRealTimeNotifications()` - Notificações live

### Hooks de UI
- `use-mobile()` - Detecção de dispositivos móveis
- `use-toast()` - Sistema de notificações
- `useSimpleForm()` - Formulários simplificados

## 🎨 Sistema de Design

### Tokens de Design
```css
/* Cores semânticas definidas em index.css */
--primary: 222.2 84% 4.9%
--secondary: 210 40% 98%
--muted: 210 40% 96%
--accent: 210 40% 96%
--destructive: 0 84.2% 60.2%
```

### Componentes UI Base (Shadcn/UI)
- **Layout**: Card, Sheet, Dialog, Popover
- **Formulários**: Input, Select, Checkbox, Radio
- **Navegação**: Button, Breadcrumb, Tabs
- **Feedback**: Toast, Alert, Progress, Skeleton
- **Dados**: Table, Badge, Avatar

### Componentes Customizados
- **Layouts Responsivos**: MobileLayout, MobileOptimizedLayout
- **Inputs Especializados**: CurrencyInput, CepInput, CnpjInput
- **Visualizações**: Charts (Recharts), CategoryDisplay

## 🔐 Sistema de Segurança

### Autenticação
- **JWT Tokens** via Supabase Auth
- **Row Level Security (RLS)** em todas as tabelas
- **Políticas de acesso** baseadas em roles

### Autorização
```typescript
// Níveis de acesso
type UserRole = 'employee' | 'admin' | 'developer'

// Usuários master permanentes
const PERMANENT_ADMINS = [
  '7d2afaa5-2e77-43cd-b7fb-d5111ea59dc4',
  'a679c5aa-e45b-44e4-b4f2-c5e4ba5333aa'
]
```

### Validação de Dados
- **Zod schemas** para validação de formulários
- **Validação server-side** em edge functions
- **Sanitização** de inputs do usuário

## 📡 API e Serviços

### Camada de Serviços
```typescript
// Estrutura dos serviços
services/
├── api.ts                 # Serviço principal (compatibilidade)
├── products.service.ts    # CRUD de produtos
├── categories.service.ts  # Gestão de categorias
├── suppliers.service.ts   # Gestão de fornecedores
├── stockMovements.service.ts # Movimentações
├── cacheService.ts       # Sistema de cache
├── optimizedApi.ts       # APIs otimizadas
└── stockService.ts       # Controle de estoque
```

### Cache e Performance
- **Cache em memória** com TTL configurável
- **Invalidação automática** em mutações
- **Debounce e throttle** em buscas
- **Lazy loading** de componentes

### Real-time Features
- **WebSockets** via Supabase Realtime
- **Atualizações automáticas** de estoque
- **Notificações em tempo real**

## 📱 Responsividade Mobile

### Breakpoints
```css
sm: 640px   /* Tablets pequenos */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Monitores grandes */
```

### Componentes Mobile-First
- `MobileLayout` - Layout otimizado para mobile
- `MobileCard` - Cards responsivos
- `MobileGrid` - Grid adaptativo
- `useIsMobile()` - Hook para detecção de dispositivo

## 🚀 Funcionalidades Principais

### 📊 Dashboard Inteligente
- Métricas em tempo real
- Gráficos interativos (Recharts)
- Análise de categorias
- Alertas de estoque baixo
- Comparação temporal

### 📦 Gestão de Produtos
- CRUD completo com validação
- Upload de imagens
- Controle de estoque mínimo
- Categorização UUID-based
- Busca e filtros avançados

### 🏭 Gestão de Fornecedores
- Cadastro completo com validação CNPJ
- Relacionamento N:N com produtos
- Histórico de movimentações

### 📈 Relatórios e Analytics
- Relatórios de movimentações
- Análise de valor de estoque
- Distribuição por categorias
- Gráficos temporais

### 🔔 Sistema de Notificações
- Toast notifications (Sonner)
- Alertas em tempo real
- Notificações de estoque baixo

## 🛠️ Otimizações Implementadas

### Performance
- **React Query** com cache inteligente
- **Lazy loading** de rotas e componentes
- **Memoização** de cálculos pesados
- **Debounce** em buscas (300ms)
- **Virtual scrolling** em listas grandes

### SEO e Acessibilidade
- **Semantic HTML** em todos os componentes
- **ARIA labels** e roles apropriados
- **Contraste adequado** (WCAG 2.1)
- **Navegação por teclado**
- **Screen reader friendly**

### Segurança
- **Content Security Policy (CSP)**
- **XSS Protection**
- **CSRF Protection** via Supabase
- **Input sanitization**
- **SQL Injection prevention** (ORM)

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento (porta 8080)
npm run build        # Build para produção
npm run preview      # Preview da build

# Qualidade de Código
npm run lint         # ESLint
npm run type-check   # TypeScript check

# Supabase
npx supabase start   # Iniciar Supabase local
npx supabase stop    # Parar Supabase local
npx supabase status  # Status dos serviços
```

## 🧪 Convenções de Código

### Nomenclatura
```typescript
// Componentes: PascalCase
export const ProductCard: React.FC = () => {}

// Hooks: camelCase com prefixo 'use'
export const useProducts = () => {}

// Tipos: PascalCase
interface ProductFormData {}

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'

// Funções: camelCase
const formatCurrency = (value: number) => {}
```

### Estrutura de Componentes
```typescript
interface ComponentProps {
  // Props tipadas com JSDoc
  /** Título do componente */
  title: string
  /** Callback opcional */
  onAction?: () => void
}

export const Component: React.FC<ComponentProps> = ({ 
  title, 
  onAction 
}) => {
  // 1. Hooks de estado
  const [state, setState] = useState()
  
  // 2. Hooks de dados
  const { data, isLoading } = useQuery()
  
  // 3. Handlers e efeitos
  const handleClick = useCallback(() => {}, [])
  
  // 4. Early returns
  if (isLoading) return <Skeleton />
  
  // 5. Render principal
  return (
    <div className="component-wrapper">
      {/* JSX */}
    </div>
  )
}
```

## 🔄 Fluxo de Dados

### Arquitetura de Estado
```
User Interaction
       ↓
   Component
       ↓
  Custom Hook
       ↓
   Service Layer
       ↓
  Supabase Client
       ↓
   PostgreSQL
```

### Cache Strategy
```typescript
// Níveis de cache
1. React Query Cache (3-5 min)
2. Service Layer Cache (1-10 min)
3. Browser Cache (HTTP headers)
4. CDN Cache (Vercel)
```

## 🌟 Roadmap Futuro

### Funcionalidades Planejadas
- [ ] PWA (Progressive Web App)
- [ ] Modo offline com sincronização
- [ ] API REST pública
- [ ] Integração com ERPs externos
- [ ] App mobile nativo (React Native)
- [ ] IA para previsão de estoque
- [ ] Relatórios avançados (PDF/Excel)
- [ ] Multi-tenancy

### Melhorias Técnicas
- [ ] Micro-frontends
- [ ] GraphQL integration
- [ ] Redis para cache distribuído
- [ ] Monitoring com Sentry
- [ ] CI/CD com GitHub Actions
- [ ] Testes E2E com Playwright

## 🚀 Deploy e Infraestrutura

### Ambientes
- **Desenvolvimento**: Local com Supabase local
- **Staging**: Vercel Preview + Supabase Staging
- **Produção**: Vercel Production + Supabase Production

### Pipeline de Deploy
```yaml
# Automatizado via Vdev.0
1. Push to main
2. Build & Type check
3. Run tests
4. Deploy to Vercel
5. Update Supabase migrations
6. Health checks
```

## 📊 Monitoramento

### Métricas Principais
- **Performance**: Core Web Vitals
- **Erros**: Error boundaries + logging
- **Uso**: Analytics de funcionalidades
- **Performance**: Bundle size tracking

### Logs e Debugging
```typescript
// SecureLogger para logs estruturados
SecureLogger.info('User action', { 
  userId, 
  action: 'create_product',
  timestamp: new Date().toISOString()
})
```

## 🤝 Contribuição

### Workflow de Desenvolvimento
1. Fork do repositório
2. Branch feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit das mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para branch (`git push origin feature/nova-funcionalidade`)
5. Pull Request

### Padrões de Commit
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: manutenção
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe de Desenvolvimento

- **Arquiteto Principal**: Victor Gabriel Carvalho Pereira
- **Stack**: React + TypeScript + Supabase
- **Metodologia**: Agile + Clean Architecture
- **Ferramentas**: Vdev.0 + GitHub + Vercel

## 📞 Suporte e Documentação

- 📧 **Email**: suporte@vdev0.com
- 💬 **Discord**: [Servidor Vdev.0](https://discord.gg/vdev0)
- 📖 **Docs**: [docs.vdev0.com](https://docs.vdev0.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/vdev0/issues)

---

**Desenvolvido com ❤️ usando Vdev.0 e as melhores práticas de engenharia de software**

## 🔗 Links Úteis

- [Vdev.0 Platform](https://vdev0.dev)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query)

