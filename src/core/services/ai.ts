import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '../types/chat';

/**
 * Obtiene la instancia del modelo de Gemini configurado.
 * Lanza un error controlado si no está configurada la API key.
 */
export function getGeminiModel(systemInstruction: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key') {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemInstruction,
    generationConfig: {
      temperature: 0.2, // Temperatura baja para evitar alucinaciones en precios y stock
    },
  });
}

/**
 * Genera la respuesta del asesor virtual basándose en el historial de mensajes
 * y las instrucciones del sistema (que contienen el JSON de stock disponible).
 */
export async function generateChatResponse(history: Message[], systemInstruction: string): Promise<string> {
  // Obtener el modelo inyectándole las instrucciones del sistema actualizadas con el stock
  const model = getGeminiModel(systemInstruction);

  // Gemini espera un formato específico:
  // - roles: 'user' o 'model'
  // - parts: [{ text: string }]
  const formattedHistory = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: msg.content }],
  }));

  // Sanitizar el historial para que el primer mensaje comience sí o sí con el rol 'user'.
  // Google Generative AI lanza un error crítico si el historial comienza con un mensaje de rol 'model'.
  const firstUserIdx = formattedHistory.findIndex((msg) => msg.role === 'user');
  const sanitizedHistory = firstUserIdx !== -1 ? formattedHistory.slice(firstUserIdx) : formattedHistory;

  // El último mensaje se envía para generar la respuesta
  const lastMessage = sanitizedHistory[sanitizedHistory.length - 1];
  const previousHistory = sanitizedHistory.slice(0, -1);

  // Iniciar la sesión de chat con el historial anterior sanitizado
  const chat = model.startChat({
    history: previousHistory,
  });

  // Enviar el último mensaje del usuario
  const result = await chat.sendMessage(lastMessage.parts[0].text);
  const responseText = result.response.text();

  return responseText;
}

export async function optimizeDescription(params: {
  draft: string;
  marca: string;
  modelo: string;
  anio: number;
  combustible?: string;
  transmision?: string;
  motorizacion?: string;
}): Promise<string> {
  const systemInstruction = `Actúa como una base de datos enciclopédica automotriz y redactor comercial premium de vehículos. 
Tu tarea es generar una descripción de venta técnica, estructurada y comercialmente atractiva utilizando estos datos:
- Marca: ${params.marca} | Modelo: ${params.modelo} | Año: ${params.anio}
- Combustible: ${params.combustible || 'No especificado'} | Transmisión: ${params.transmision || 'No especificada'}
- Motorización/Versión específica: ${params.motorizacion || 'No especificada'}

Estructura Obligatoria de Respuesta (Respeta este orden estricto):
1. INTRODUCCIÓN COMERCIAL (Max 3 líneas): Una frase elegante que presente el vehículo y su relevancia en el mercado de forma atractiva.
2. FICHA TÉCNICA DE FÁBRICA (Lista Markdown): Basándote firmemente en la 'Motorización' provista (ej: si dice 1.6 16v, busca ese motor exactamente), detalla:
   - **Motorización:** (Ej: Motor 1.6L 16 válvulas, 2.0L TFSI, etc.).
   - **Potencia y Rendimiento:** (Especificar los CV/HP reales de fábrica de ese motor específico).
   - **Tracción y Transmisión:** (Detallar según el tipo de transmisión enviado).
   - **Datos destacados:** (Consumo o prestaciones típicas de fábrica de forma breve).
3. DETALLES DE LA UNIDAD (Formato Párrafo): Integra de manera orgánica y fluida las observaciones particulares o agregados del borrador del usuario: "${params.draft}". Si está vacío, omite esta sección.

Reglas de Control de Calidad:
- Está PROHIBIDO inventar datos de la unidad real (kilometraje, services, dueños, etc.) si no están en el borrador.
- Si la 'motorizacion' especifica un bloque o versión, la ficha técnica DEBE basarse en ese motor estrictamente. No uses datos genéricos de otros motores del mismo modelo.
- Responde ÚNICAMENTE con el texto en Markdown, sin saludos ni prefacios.`;

  const model = getGeminiModel(systemInstruction);
  const result = await model.generateContent(params.draft || "Generar ficha técnica comercial estándar.");
  return result.response.text().trim();
}
