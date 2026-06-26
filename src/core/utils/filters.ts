/**
 * Parsea un valor entero de forma segura para filtros (ej: año, kilometros).
 * Previene inyecciones de strings maliciosos o valores no numéricos devolviendo un fallback seguro.
 */
export function parseSafeInt(value: string | null | undefined, fallback: number, min?: number, max?: number): number {
  if (value === null || value === undefined || typeof value !== 'string' || value.trim() === '') {
    return fallback;
  }

  // Sanitizar el string para evitar inyecciones maliciosas dejando solo caracteres de números y signos básicos
  const sanitized = value.replace(/[^0-9\-+]/g, '');
  const parsed = parseInt(sanitized, 10);

  if (isNaN(parsed)) {
    return fallback;
  }

  if (min !== undefined && parsed < min) {
    return min;
  }
  if (max !== undefined && parsed > max) {
    return max;
  }

  return parsed;
}

/**
 * Parsea un valor decimal de forma segura para filtros (ej: precios).
 * Previene inyecciones de strings maliciosos o valores no numéricos devolviendo un fallback seguro.
 */
export function parseSafeFloat(value: string | null | undefined, fallback: number, min?: number, max?: number): number {
  if (value === null || value === undefined || typeof value !== 'string' || value.trim() === '') {
    return fallback;
  }

  // Sanitizar el string dejando solo números, punto decimal y signo menos
  const sanitized = value.replace(/[^0-9.\-+]/g, '');
  const parsed = parseFloat(sanitized);

  if (isNaN(parsed)) {
    return fallback;
  }

  if (min !== undefined && parsed < min) {
    return min;
  }
  if (max !== undefined && parsed > max) {
    return max;
  }

  return parsed;
}
