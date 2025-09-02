import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Limpa automaticamente o DOM após cada teste
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.restoreAllMocks();
});

// Mock do Supabase com jest
const mockSupabase = {
  supabase: {
    auth: {
      signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: null } }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockResolvedValue('OK'),
    })),
    removeChannel: jest.fn(),
  },
};

jest.mock('@/integrations/supabase/client', () => mockSupabase);

// Mock do React Router
const mockReactRouter = {
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => children,
};

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    ...mockReactRouter,
  };
});

// Mock do Toast
const mockToast = {
  useToast: () => ({
    toast: jest.fn(),
  }),
};

jest.mock('@/hooks/use-toast', () => mockToast);

// Mock do AuthContext
const mockAuth = {
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@test.com' },
    isLoading: false,
    signIn: jest.fn().mockResolvedValue({ data: null, error: null }),
    signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  }),
};

jest.mock('@/contexts/AuthContext', () => mockAuth);

// Mock dos serviços
const mockServices = {
  StockService: {
    getCurrentStock: jest.fn().mockResolvedValue(0),
    createMovement: jest.fn().mockResolvedValue({ success: true }),
    getMovementsWithDetails: jest.fn().mockResolvedValue([]),
  },
};

jest.mock('@/services/stockService', () => mockServices);