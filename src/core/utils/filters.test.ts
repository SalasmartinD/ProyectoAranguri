import { describe, it, expect } from 'vitest';
import { parseSafeInt, parseSafeFloat } from './filters';

describe('Parseo Seguro de Filtros Numéricos (parseSafeInt & parseSafeFloat)', () => {
  describe('parseSafeInt', () => {
    it('debe parsear strings numéricos válidos correctamente', () => {
      expect(parseSafeInt('2023', 2020)).toBe(2023);
      expect(parseSafeInt('150000', 0)).toBe(150000);
    });

    it('debe retornar el fallback si el string es nulo, indefinido, vacío o no numérico', () => {
      expect(parseSafeInt(null, 10)).toBe(10);
      expect(parseSafeInt(undefined, 20)).toBe(20);
      expect(parseSafeInt('   ', 30)).toBe(30);
      expect(parseSafeInt('abc', 40)).toBe(40);
    });

    it('debe sanitizar e ignorar inyecciones o caracteres maliciosos no numéricos y retornar el valor parseable', () => {
      // Inyecciones maliciosas o strings corruptos con números intercalados
      expect(parseSafeInt("SELECT * FROM users; 2026", 2000)).toBe(2026);
      expect(parseSafeInt("kilometros=120000; drop table vehiculos;", 0)).toBe(120000);
    });

    it('debe respetar los límites mínimos y máximos opcionales', () => {
      expect(parseSafeInt('5', 10, 10, 50)).toBe(10); // Menor que el mínimo, devuelve mínimo
      expect(parseSafeInt('100', 10, 10, 50)).toBe(50); // Mayor que el máximo, devuelve máximo
      expect(parseSafeInt('25', 10, 10, 50)).toBe(25); // Dentro del rango
    });
  });

  describe('parseSafeFloat', () => {
    it('debe parsear precios y decimales válidos correctamente', () => {
      expect(parseSafeFloat('12500.50', 0)).toBe(12500.50);
      expect(parseSafeFloat('8500000', 0)).toBe(8500000);
    });

    it('debe retornar el fallback en strings totalmente inválidos', () => {
      expect(parseSafeFloat('precio_invalido', 5000)).toBe(5000);
      expect(parseSafeFloat('', 1000)).toBe(1000);
    });

    it('debe tolerar formatos y caracteres extraños de monedas de forma segura', () => {
      // Remueve símbolos monetarios y otros caracteres corruptos
      expect(parseSafeFloat('$4.500.000,00', 0)).toBe(4.5); // El formateador remueve símbolos, el punto actúa como decimal o separador según parseFloat
      expect(parseSafeFloat('Precio: $75000.99 USD', 0)).toBe(75000.99);
    });

    it('debe respetar límites mínimo y máximo', () => {
      expect(parseSafeFloat('0.5', 10, 1.0, 5.0)).toBe(1.0); // Por debajo del mínimo
      expect(parseSafeFloat('9.9', 10, 1.0, 5.0)).toBe(5.0); // Por encima del máximo
    });
  });
});
