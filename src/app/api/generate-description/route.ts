import { NextResponse } from 'next/server';
import { optimizeDescription } from '@/core/services/ai';

export async function POST(request: Request) {
  try {
    // 1. Validar la configuración de Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key') {
      return NextResponse.json(
        {
          error: 'Configuración incompleta. Por favor, configura tu GEMINI_API_KEY en el archivo .env.local para activar el asistente de IA.'
        },
        { status: 500 }
      );
    }

    // 2. Obtener y validar el cuerpo de la petición
    const body = await request.json().catch(() => null);
    if (!body || typeof body.draft !== 'string') {
      return NextResponse.json(
        { error: 'Formato de petición inválido. Se requiere el campo "draft" de tipo texto.' },
        { status: 400 }
      );
    }

    const draft = body.draft.trim();
    if (!draft) {
      return NextResponse.json(
        { error: 'El borrador de texto no puede estar vacío.' },
        { status: 400 }
      );
    }

    // 3. Generar la descripción comercial optimizada con Gemini
    const optimized = await optimizeDescription(draft);

    return NextResponse.json({ description: optimized });
  } catch (error: any) {
    console.error('Error en API Route /api/generate-description:', error);

    if (error?.message === 'GEMINI_API_KEY_MISSING') {
      return NextResponse.json(
        { error: 'Configuración incompleta. Por favor, configura tu GEMINI_API_KEY en el archivo .env.local para activar el asistente de IA.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Ocurrió un error inesperado al optimizar el texto con Gemini.' },
      { status: 500 }
    );
  }
}
