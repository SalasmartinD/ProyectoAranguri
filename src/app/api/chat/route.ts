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
      .select('id, marca, modelo, anio, precio_venta, kilometros, estado, imagenes')
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
      imagen: (v.imagenes && v.imagenes.length > 0) ? v.imagenes[0] : 'Sin imagen'
    }));

    // 5. Configurar el System Prompt estricto
    const systemInstruction = `Eres el asistente virtual de la concesionaria AutomotoresSalas. Tu único objetivo es asesorar a los clientes basándote estrictamente en nuestro stock de vehículos disponible.

    Este es nuestro stock disponible actual en formato JSON:
    ${JSON.stringify(stockContext, null, 2)}

    Normas estrictas de respuesta:
    1. No utilices negritas con asteriscos (ej: no uses **texto**), ni hagas asteriscos en ningun momento del chat, ni uses , cursivas ni otros formatos markdown en tus respuestas. Devuelve texto plano, limpio y estructurado de forma legible con saltos de línea estándar.
    2. Respeta estrictamente los precios y kilómetros del stock provisto. Jamás alteres los precios de venta, ni ofrezcas rebajas o bonificaciones por tu cuenta.
    3. No digas cosas que no sabes ni inventes características o stock de autos que no figuren en la lista anterior. Si te piden un vehículo o marca no disponible, aclara que no está en stock actualmente y sugiere la alternativa disponible más cercana en precio o segmento.
    4. No menciones que la imagen no está disponible o que tiene texto de placeholder. Si preguntan por fotos o aspecto visual, indícales amablemente que pueden ver la galería completa ingresando al botón "Detalles" en la ficha de cada auto de nuestro catálogo.
    5. Para preguntas sobre financiación personalizada, cotizaciones de usados, trámites complejos o si el cliente desea agendar una visita, explícale cordialmente que un asesor comercial humano puede coordinar esos detalles y recomiéndale presionar el botón de WhatsApp del sitio.`;

    // 6. Generar respuesta con Gemini
    const textResponse = await generateChatResponse(messages, systemInstruction);

    return NextResponse.json({ response: textResponse });
  } catch (error: unknown) {
    console.error('Error en API Route /api/chat:', error);

    const isApiKeyMissing = error instanceof Error && error.message === 'GEMINI_API_KEY_MISSING';
    if (isApiKeyMissing) {
      return NextResponse.json(
        { error: 'Configuración incompleta. Por favor, configura tu GEMINI_API_KEY en el archivo .env.local para activar el asistente de IA.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ocurrió un error inesperado al procesar tu consulta con el asistente.' },
      { status: 500 }
    );
  }
}
