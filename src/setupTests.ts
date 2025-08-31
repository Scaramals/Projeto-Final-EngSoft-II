import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpa automaticamente o DOM após cada teste
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.clearAllTimers();
  vi.restoreAllMocks();
});

// Mock do Supabase com vi.hoisted
const mockSupabase = vi.hoisted(() => ({
  supabase: {
    auth: {
      signUp: vi.fn().mockResolvedValue({ data: null, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: null } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue('OK'),
    })),
    removeChannel: vi.fn(),
  },
}));

vi.mock('@/integrations/supabase/client', () => mockSupabase);

// Mock do React Router com vi.hoisted
const mockReactRouter = vi.hoisted(() => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => children,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    ...mockReactRouter,
  };
});

// Mock do Toast com vi.hoisted
const mockToast = vi.hoisted(() => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-toast', () => mockToast);

// Mock do AuthContext com vi.hoisted
const mockAuth = vi.hoisted(() => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@test.com' },
    isLoading: false,
    signIn: vi.fn().mockResolvedValue({ data: null, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: null, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  }),
}));

vi.mock('@/contexts/AuthContext', () => mockAuth);

// Mock dos serviços com vi.hoisted
const mockServices = vi.hoisted(() => ({
  StockService: {
    getCurrentStock: vi.fn().mockResolvedValue(0),
    createMovement: vi.fn().mockResolvedValue({ success: true }),
    getMovementsWithDetails: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/services/stockService', () => mockServices);