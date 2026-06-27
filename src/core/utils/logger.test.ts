import { describe, it, expect, vi } from 'vitest';
import { logger } from './logger';

// Mock del cliente administrador de Supabase
vi.mock('@/core/services/supabase', () => {
  const mockInsert = vi.fn().mockResolvedValue({ error: null });
  const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
  return {
    getSupabaseAdminClient: () => ({
      from: mockFrom,
    }),
  };
});

describe('ServerLogger', () => {
  it('debe registrar un evento de nivel INFO sin arrojar excepciones', async () => {
    // Forzar entorno de desarrollo en test para disparar console.log sin escribir en process.env
    vi.stubEnv('NODE_ENV', 'development');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    logger.info('Prueba de log de información', 'TEST_CONTEXT', {
      metadatos: { foo: 'bar' },
      usuarioId: '772b2fe8-10fd-4752-b5e1-88f1dc6d400e',
    });

    // Esperar una corta pausa asíncrona para que se ejecute fire-and-forget
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(consoleSpy).toHaveBeenCalled();
    
    // Restaurar entorno
    consoleSpy.mockRestore();
    vi.unstubAllEnvs();
  });
});
