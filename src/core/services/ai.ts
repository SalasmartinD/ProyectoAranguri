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

/**
 * Optimiza y reformula un borrador informal/técnico a una descripción comercial premium.
 */
export async function optimizeDescription(draft: string): Promise<string> {
  const systemInstruction = `Adopta el rol de un redactor comercial automotriz de nivel premium. 
Transforma el borrador ingresado en una descripción formal, concisa y atractiva para la venta.

Normas estrictas de redacción:
1. No inventes bajo ninguna circunstancia equipamiento, historial de servicios (como cambios de distribución), kilometraje, años, procedencia o detalles estéticos (como golpes o rayones) que no estén explícitamente detallados en el texto original.
2. Evita adornos poéticos exagerados, textos demasiado largos o introducciones vacías. Sé sobrio, preciso y elegante.
3. Si el borrador es muy breve, la salida debe ser igualmente concisa y limitarse a redactar de manera formal y atractiva la información provista en un único párrafo corto o en unas pocas viñetas claras.
4. Regla de oro: Responde únicamente con el texto reformulado final, sin prefacios, sin introducciones (prohibido decir "Aquí tienes la descripción:") y sin comillas.`;

  const model = getGeminiModel(systemInstruction);
  const result = await model.generateContent(draft);
  return result.response.text().trim();
}
