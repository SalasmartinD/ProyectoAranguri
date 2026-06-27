import { z } from 'zod';

/**
 * Sanitiza una cadena de texto para prevenir ataques XSS, HTML Injection e inyecciones de script.
 * Remueve o codifica caracteres peligrosos utilizando expresiones regulares eficientes y nativas.
 * 
 * @param input Cadena de texto a sanitizar
 * @returns Cadena sanitizada libre de tags o scripts HTML reactivos
 */
export function sanitizarTexto(input: string | null | undefined): string {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') return String(input);

  let limpio = input.trim();

  // 1. Remover bloques de tags script completos: <script>...</script> (case-insensitive, multiline)
  limpio = limpio.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remover handlers de eventos HTML (ej: onmouseover=, onclick=, onload=) BEFORE replacing brackets
  limpio = limpio.replace(/\bon[a-z]+\s*=\s*(["'][^"']*["']|[^\s>]*)/gi, '');

  // 3. Remover esquemas URI peligrosos que gatillan ejecucion JS (javascript:, data:, vbscript:)
  limpio = limpio.replace(/(javascript|data|vbscript):/gi, '');

  // 4. Codificar corchetes angulares para neutralizar cualquier tag HTML inyectado
  limpio = limpio
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return limpio;
}

/**
 * Esquema de validación reusable para strings seguros (sanitizados).
 * Aplica la sanitización de forma nativa mediante .transform() de Zod.
 */
export const safeStringSchema = z.string().transform((val) => sanitizarTexto(val));
