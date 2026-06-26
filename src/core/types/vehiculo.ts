export type VehiculoEstado = 'Disponible' | 'Vendido' | 'Pausado';

export type TipoVehiculo = 'SEDAN' | 'SUV' | 'PICKUP' | 'HATCHBACK' | 'COUPE' | 'VAN';
export type TipoCombustible = 'NAFTA' | 'DIESEL' | 'HIBRIDO' | 'ELECTRICO';
export type TipoTransmision = 'MANUAL' | 'AUTOMATICA';

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
  tipo?: TipoVehiculo | null;
  combustible?: TipoCombustible | null;
  transmision?: TipoTransmision | null;
  motorizacion?: string | null;
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
  tipo?: TipoVehiculo | null;
  combustible?: TipoCombustible | null;
  transmision?: TipoTransmision | null;
  motorizacion?: string | null;
}
