import { describe, it, expect } from 'vitest';
import { sanitizarTexto } from './sanitizer';

describe('sanitizarTexto', () => {
  it('debe mantener texto plano inofensivo intacto', () => {
    expect(sanitizarTexto('Ford Focus 2018')).toBe('Ford Focus 2018');
  });

  it('debe eliminar bloques script por completo', () => {
    const input = 'Hola <script>alert("XSS")</script> mundo';
    expect(sanitizarTexto(input)).toBe('Hola  mundo');
  });

  it('debe codificar corchetes angulares de HTML inyectado', () => {
    const input = '<div>Texto</div>';
    expect(sanitizarTexto(input)).toBe('&lt;div&gt;Texto&lt;/div&gt;');
  });

  it('debe remover el esquema javascript: del texto', () => {
    const input = 'javascript:alert("hola")';
    expect(sanitizarTexto(input)).toBe('alert("hola")');
  });

  it('debe remover handlers de eventos HTML como onmouseover u onclick', () => {
    const input = '<img src="x" onmouseover="alert(1)" onclick=test()>';
    // Después de codificar < y > queda: &lt;img src="x" onmouseover="alert(1)" onclick=test()&gt;
    // Y luego se remueven onmouseover y onclick
    const clean = sanitizarTexto(input);
    expect(clean).not.toContain('onmouseover');
    expect(clean).not.toContain('onclick');
    expect(clean).toBe('&lt;img src="x"  &gt;');
  });
});
