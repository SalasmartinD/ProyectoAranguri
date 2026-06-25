export type VehiculoEstado = 'Disponible' | 'Vendido' | 'Pausado';

export interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  precio_compra: number;
  precio_venta: number;
  kilometros: number;
  estado: VehiculoEstado;
  imagen_url?: string | null;
  creado_en: string;
}

export interface VehiculoInput {
  marca: string;
  modelo: string;
  anio: number;
  precio_compra: number;
  precio_venta: number;
  kilometros: number;
  estado: VehiculoEstado;
  imagen_url?: string | null;
}
