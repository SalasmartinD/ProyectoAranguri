import { NextResponse } from 'next/server';
import { logger } from '@/core/utils/logger';

export async function GET() {
  try {
    // Disparar un log de prueba de nivel INFO
    logger.info('Este es un log de prueba generado desde el endpoint de validación', 'TEST_ENDPOINT', {
      metadatos: {
        plataforma: 'ERP Concesionaria',
        agente: 'Antigravity AI',
        motor: 'Next.js 16 App Router',
        estado: 'Exitoso',
      },
    });

    return NextResponse.json({
      success: true,
      mensaje: 'Log de prueba disparado con éxito.',
      consola: 'Verifique su terminal local de desarrollo para ver el formato de colores ANSI.',
      base_de_datos: 'Consulte su tabla public.sistema_logs en Supabase para verificar la inmutabilidad.',
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
