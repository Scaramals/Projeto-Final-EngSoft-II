
import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { debounce, throttle } from "lodash";

interface BatchedQuery {
  queryKey: string[];
  queryFn: () => Promise<any>;
  priority: number;
}

export function useOptimizedQueries() {
  const queryClient = useQueryClient();
  const batchedQueries = useRef<BatchedQuery[]>([]);
  const batchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced search para evitar múltiplas requisições durante digitação
  const debouncedSearch = useCallback(
    debounce(async (searchTerm: string, callback: (term: string) => void) => {
      if (searchTerm.trim().length >= 2) {
        callback(searchTerm);
      }
    }, 300),
    []
  );

  // Throttled refresh para evitar spam de atualizações
  const throttledRefresh = useCallback(
    throttle(async (queryKeys: string[][]) => {
      await Promise.all(
        queryKeys.map(key => queryClient.invalidateQueries({ queryKey: key }))
      );
    }, 1000),
    [queryClient]
  );

  // Batch queries para agrupar chamadas
  const addToBatch = useCallback((query: BatchedQuery) => {
    batchedQueries.current.push(query);
    
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }

    batchTimeout.current = setTimeout(async () => {
      const queries = [...batchedQueries.current];
      batchedQueries.current = [];
      
      // Ordenar por prioridade e executar
      queries.sort((a, b) => b.priority - a.priority);
      
      await Promise.all(
        queries.map(query => 
          queryClient.prefetchQuery({
            queryKey: query.queryKey,
            queryFn: query.queryFn,
          })
        )
      );
    }, 50);
  }, [queryClient]);

  // Evitar requisições desnecessárias no useEffect
  const conditionalFetch = useCallback(
    (condition: boolean, queryKey: string[], queryFn: () => Promise<any>) => {
      if (condition && !queryClient.getQueryData(queryKey)) {
        return queryClient.fetchQuery({ queryKey, queryFn });
      }
      return Promise.resolve(queryClient.getQueryData(queryKey));
    },
    [queryClient]
  );

  return {
    debouncedSearch,
    throttledRefresh,
    addToBatch,
    conditionalFetch,
  };
}
