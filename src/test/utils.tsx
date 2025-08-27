import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Wrapper para testes com React Query e Router
export function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );

  return { queryClient, TestWrapper };
}

// Wrapper personalizado para renderizar componentes nos testes
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const { TestWrapper } = createTestWrapper();
  return render(ui, { wrapper: TestWrapper, ...options });
}

// Wrapper simples para hooks que usam React Query
export function createHookWrapper() {
  const { TestWrapper } = createTestWrapper();
  return TestWrapper;
}