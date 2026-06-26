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
    if (!body) {
      return NextResponse.json(
        { error: 'Formato de petición inválido. Cuerpo vacío.' },
        { status: 400 }
      );
    }

    const { borrador, marca, modelo, anio, combustible, transmision, motorizacion } = body;

    if (!marca || !modelo || !anio) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos. Marca, modelo y año son necesarios para consultar la ficha técnica.' },
        { status: 400 }
      );
    }

    const draftText = typeof borrador === 'string' ? borrador.trim() : '';

    // 3. Generar la descripción comercial optimizada con Gemini
    const optimized = await optimizeDescription({
      draft: draftText,
      marca,
      modelo,
      anio: Number(anio),
      combustible: typeof combustible === 'string' ? combustible : undefined,
      transmision: typeof transmision === 'string' ? transmision : undefined,
      motorizacion: typeof motorizacion === 'string' ? motorizacion : undefined,
    });

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
