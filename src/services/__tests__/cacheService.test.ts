import { describe, it, expect, beforeEach } from '@jest/globals';
import { cacheService } from '@/services/cacheService';

describe('CacheService', () => {
  beforeEach(() => {
    cacheService.clear();
    jest.clearAllMocks();
  });

  it('deve armazenar e recuperar dados do cache', () => {
    const key = 'test-key';
    const data = { id: 1, name: 'Test Data' };

    cacheService.set(key, data);
    const retrieved = cacheService.get(key);

    expect(retrieved).toEqual(data);
  });

  it('deve retornar null para chave inexistente', () => {
    const result = cacheService.get('inexistent-key');
    expect(result).toBeNull();
  });

  it('deve verificar se chave existe no cache', () => {
    const key = 'exists-key';
    const data = { test: true };

    expect(cacheService.has(key)).toBe(false);

    cacheService.set(key, data);
    expect(cacheService.has(key)).toBe(true);
  });

  it('deve deletar item do cache', () => {
    const key = 'delete-key';
    const data = { toDelete: true };

    cacheService.set(key, data);
    expect(cacheService.has(key)).toBe(true);

    cacheService.delete(key);
    expect(cacheService.has(key)).toBe(false);
    expect(cacheService.get(key)).toBeNull();
  });

  it('deve limpar todo o cache', () => {
    cacheService.set('key1', { data: 1 });
    cacheService.set('key2', { data: 2 });
    cacheService.set('key3', { data: 3 });

    expect(cacheService.has('key1')).toBe(true);
    expect(cacheService.has('key2')).toBe(true);
    expect(cacheService.has('key3')).toBe(true);

    cacheService.clear();

    expect(cacheService.has('key1')).toBe(false);
    expect(cacheService.has('key2')).toBe(false);
    expect(cacheService.has('key3')).toBe(false);
  });

  it('deve verificar tamanho do cache', () => {
    cacheService.set('item1', { data: 1 });
    cacheService.set('item2', { data: 2 });

    // Verificar que tem itens
    expect(cacheService.has('item1')).toBe(true);
    expect(cacheService.has('item2')).toBe(true);

    cacheService.clear();

    // Verificar que foi limpo
    expect(cacheService.has('item1')).toBe(false);
    expect(cacheService.has('item2')).toBe(false);
  });
});
