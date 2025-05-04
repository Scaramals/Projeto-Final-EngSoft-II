
# Sistema de Gerenciamento de Estoque

## Sobre o Projeto

Este é um sistema de gerenciamento de estoque completo desenvolvido com tecnologias modernas. O sistema permite controlar produtos, movimentações de estoque, gerar relatórios e visualizar estatísticas em um dashboard intuitivo.

## URL do Projeto

**URL**: [https://lovable.dev/projects/689992a5-57c1-4373-aab5-8b2b2fb20af2](https://lovable.dev/projects/689992a5-57c1-4373-aab5-8b2b2fb20af2)

## Tecnologias Utilizadas

O projeto é construído com:

- **Frontend**:
  - React 18
  - TypeScript
  - Vite (para build rápido)
  - Tailwind CSS (estilização)
  - Shadcn UI (componentes)
  - React Router (navegação)
  - TanStack Query (gerenciamento de estado e requisições)
  - Recharts (gráficos e visualizações)

- **Backend**:
  - Supabase (banco de dados PostgreSQL)
  - Autenticação e autorização
  - Row Level Security (RLS)
  - Funções SQL para operações complexas

## Arquitetura do Projeto

### Frontend

O frontend segue uma arquitetura moderna baseada em componentes, com separação clara de responsabilidades:

- **Pages**: Componentes de página completos
- **Components**: Componentes reutilizáveis da UI
- **Hooks**: Lógica de negócio reutilizável
- **Services**: Camada de abstração para chamadas à API
- **Contexts**: Gerenciamento de estado global
- **Types**: Definições de tipos TypeScript

### Backend (Supabase)

O backend utiliza Supabase, uma plataforma que fornece:

- Banco de dados PostgreSQL
- API RESTful e SDK JavaScript
- Autenticação e autorização
- Row Level Security para segurança de dados
- Funções SQL para lógica de negócios complexa

## Funcionalidades Principais

1. **Gerenciamento de Produtos**:
   - Cadastro, edição e exclusão de produtos
   - Controle de estoque mínimo
   - Categorização de produtos

2. **Movimentações de Estoque**:
   - Registrar entradas e saídas
   - Histórico de movimentações por produto
   - Anotações para cada movimentação

3. **Dashboard**:
   - Visão geral do estoque
   - Produtos com estoque baixo
   - Valor total do estoque
   - Movimentações recentes

4. **Relatórios**:
   - Relatórios de movimentações
   - Distribuição por categoria
   - Filtros avançados

5. **Autenticação e Segurança**:
   - Login/Logout
   - Perfis de usuário
   - Configurações de conta

## Estrutura de Dados

### Tabelas Principais

- **products**: Armazena informações sobre produtos
- **stock_movements**: Registra movimentações de estoque
- **profiles**: Informações de perfil de usuários
- **categories**: Categorias de produtos

## Padrões de Desenvolvimento

O projeto segue diversos padrões e práticas recomendadas:

1. **Separação de Responsabilidades**:
   - Frontend (UI/UX) separado da lógica de negócios
   - Serviços de API isolados em uma camada própria

2. **Hooks Personalizados**:
   - Encapsulamento de lógica de negócios em hooks reutilizáveis
   - Separação entre obtenção de dados e renderização

3. **Componentes Reutilizáveis**:
   - Componentes de UI modulares e independentes
   - Prop drilling minimizado com uso de contextos

4. **Validação de Dados**:
   - Validações de entrada no frontend e backend
   - Feedback claro para o usuário em caso de erros

5. **Segurança**:
   - Row Level Security para controle de acesso a dados
   - Autenticação e autorização robustas

## Como Executar o Projeto

### Via Lovable

A maneira mais simples é visitar o [Projeto Lovable](https://lovable.dev/projects/689992a5-57c1-4373-aab5-8b2b2fb20af2) e interagir diretamente.

### Localmente

Para trabalhar localmente usando seu IDE preferido:

```sh
# Passo 1: Clone o repositório
git clone <URL_DO_GIT>

# Passo 2: Navegue até o diretório do projeto
cd <NOME_DO_PROJETO>

# Passo 3: Instale as dependências necessárias
npm i

# Passo 4: Inicie o servidor de desenvolvimento
npm run dev
```

## Estrutura de Diretórios

```
├── public/              # Arquivos estáticos
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── auth/        # Componentes de autenticação
│   │   ├── dashboard/   # Componentes do dashboard
│   │   ├── inventory/   # Componentes de inventário
│   │   ├── layout/      # Componentes de layout
│   │   ├── products/    # Componentes de produtos
│   │   ├── reports/     # Componentes de relatórios
│   │   └── ui/          # Componentes de UI básicos
│   ├── contexts/        # Contextos React
│   ├── hooks/           # Hooks personalizados
│   ├── integrations/    # Integrações com serviços externos
│   │   └── supabase/    # Integração com Supabase
│   ├── lib/             # Utilitários e helpers
│   ├── pages/           # Componentes de páginas
│   ├── services/        # Serviços de API
│   └── types/           # Definições de tipos TypeScript
├── supabase/            # Configurações do Supabase
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

## Boas Práticas Implementadas

- **Código limpo e bem documentado**
- **Componentização para reuso**
- **Tipagem forte com TypeScript**
- **Gerenciamento de estado otimizado**
- **Padrão de serviços para operações de API**
- **Feedback visual para operações assíncronas**
- **Design responsivo para todos dispositivos**

## Futuras Melhorias

- Implementação de testes automatizados
- Sistema de notificações
- Dashboard customizável
- Relatórios exportáveis em PDF
- Integração com sistemas de fornecedores

## Licença

Este projeto está licenciado sob a MIT License.
