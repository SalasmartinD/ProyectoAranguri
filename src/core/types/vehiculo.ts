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
  imagenes: string[];
  descripcion?: string | null;
  creado_en: string;
}

export interface VehiculoInput {
  id?: string;
  marca: string;
  modelo: string;
  anio: number;
  precio_compra: number;
  precio_venta: number;
  kilometros: number;
  estado: VehiculoEstado;
  imagenes: string[];
  descripcion?: string | null;
}
