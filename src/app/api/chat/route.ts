import { NextResponse } from 'next/server';
import { supabase } from '@/core/services/supabase';
import { generateChatResponse } from '@/core/services/ai';
import { Message } from '@/core/types/chat';

export async function POST(request: Request) {
  try {
    // 1. Validar que la API Key de Gemini esté configurada
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key') {
      return NextResponse.json(
        { 
          error: 'Configuración incompleta. Por favor, configura tu GEMINI_API_KEY en el archivo .env.local para activar el asistente de IA.' 
        },
        { status: 500 }
      );
    }

    // 2. Parsear el cuerpo de la petición
    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Formato de petición inválido. Se requiere un arreglo de "messages".' },
        { status: 400 }
      );
    }

    const messages: Message[] = body.messages;
    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'El historial de mensajes no puede estar vacío.' },
        { status: 400 }
      );
    }

    // 3. Consultar stock disponible de Supabase
    const { data: vehiculos, error: dbError } = await supabase
      .from('vehiculos')
      .select('id, marca, modelo, anio, precio_venta, kilometros, estado, imagen_url')
      .eq('estado', 'Disponible');

    if (dbError) {
      console.error('Error al consultar base de datos en API Chat:', dbError);
      return NextResponse.json(
        { error: 'Error interno al consultar el catálogo de vehículos disponible.' },
        { status: 500 }
      );
    }

    // 4. Formatear el stock como JSON simplificado para el contexto del LLM
    const stockContext = (vehiculos || []).map(v => ({
      id: v.id,
      marca: v.marca,
      modelo: v.modelo,
      anio: v.anio,
      precio: `$${v.precio_venta.toLocaleString('es-AR')}`,
      kilometros: `${v.kilometros.toLocaleString('es-AR')} km`,
      imagen: v.imagen_url || 'Sin imagen'
    }));

    // 5. Configurar el System Prompt estricto
    const systemInstruction = `Sos el asesor virtual de la concesionaria. Tu stock real disponible es el siguiente:
${JSON.stringify(stockContext, null, 2)}

Respondé las dudas de forma amable basándote solo en estos datos. Si el usuario pide un vehículo, marca, modelo o tipo que no está en la lista anterior, debes ser transparente indicando que no está disponible actualmente, y sugerirle la alternativa disponible más cercana en precio o segmento dentro de nuestro stock actual. No inventes vehículos que no estén en el JSON.`;

    // 6. Generar respuesta con Gemini
    const textResponse = await generateChatResponse(messages, systemInstruction);

    return NextResponse.json({ response: textResponse });
  } catch (error: any) {
    console.error('Error en API Route /api/chat:', error);
    
    if (error?.message === 'GEMINI_API_KEY_MISSING') {
      return NextResponse.json(
        { error: 'Configuración incompleta. Por favor, configura tu GEMINI_API_KEY en el archivo .env.local para activar el asistente de IA.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Ocurrió un error inesperado al procesar tu consulta con el asistente.' },
      { status: 500 }
    );
  }
}
