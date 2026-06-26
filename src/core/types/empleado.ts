export type TipoRemuneracion = 'FIJO' | 'COMISION' | 'MIXTO';

export interface Role {
  id: string;
  nombre: string;
  creado_en: string;
}

export interface Empleado {
  id: string;
  nombre: string;
  rol_id: string;
  roles?: {
    nombre: string;
  };
  fecha_ingreso: string;
  activo: boolean;
  tipo_remuneracion: TipoRemuneracion;
  sueldo_fijo: number;
  porcentaje_comision: number;
  dia_cobro: number;
  creado_en: string;
  fecha_alta: string;
  fecha_baja: string | null;
}

export interface EmpleadoInput {
  nombre: string;
  rol_id: string;
  fecha_ingreso: string;
  activo?: boolean;
  tipo_remuneracion?: TipoRemuneracion;
  sueldo_fijo?: number;
  porcentaje_comision?: number;
  dia_cobro?: number;
  fecha_alta?: string;
  fecha_baja?: string | null;
}
