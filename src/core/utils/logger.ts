import { getSupabaseAdminClient } from '@/core/services/supabase';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface LogOptions {
  metadatos?: Record<string, unknown>;
  usuarioId?: string;
}

class ServerLogger {
  /**
   * Persiste una entrada de log en la base de datos Supabase usando el rol de servicio
   * e imprime el log formateado en la consola si está en entorno de desarrollo.
   */
  private async persistLog(
    nivel: LogLevel,
    mensaje: string,
    contexto: string,
    options?: LogOptions
  ): Promise<void> {
    const metadatos = options?.metadatos || {};
    const usuarioId = options?.usuarioId || null;

    // 1. Logging en consola local (con colores ANSI) en desarrollo
    if (process.env.NODE_ENV === 'development') {
      const colors: Record<LogLevel, string> = {
        INFO: '\x1b[32m',     // Verde
        WARN: '\x1b[33m',     // Amarillo
        ERROR: '\x1b[31m',    // Rojo
        CRITICAL: '\x1b[1;31m', // Rojo Negrita
      };
      const reset = '\x1b[0m';
      const color = colors[nivel] || '';
      console.log(
        `[${new Date().toISOString()}] ${color}${nivel}${reset} [${contexto}] ${mensaje}`,
        Object.keys(metadatos).length ? metadatos : ''
      );
    }

    // 2. Persistir en la tabla de logs mediante el cliente con privilegios administrativos
    try {
      const adminClient = getSupabaseAdminClient();
      const { error } = await adminClient
        .from('sistema_logs')
        .insert({
          nivel,
          contexto,
          mensaje,
          usuario_id: usuarioId,
          metadatos,
        });

      if (error) {
        console.error('Error al persistir log en Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error crítico del logger al conectar con Supabase:', err);
    }
  }

  public info(mensaje: string, contexto: string, options?: LogOptions): void {
    // Ejecución asíncrona fire-and-forget para no bloquear el hilo del response
    this.persistLog('INFO', mensaje, contexto, options);
  }

  public warn(mensaje: string, contexto: string, options?: LogOptions): void {
    this.persistLog('WARN', mensaje, contexto, options);
  }

  public error(mensaje: string, contexto: string, options?: LogOptions): void {
    this.persistLog('ERROR', mensaje, contexto, options);
  }

  public critical(mensaje: string, contexto: string, options?: LogOptions): void {
    this.persistLog('CRITICAL', mensaje, contexto, options);
  }
}

export const logger = new ServerLogger();
export default logger;
