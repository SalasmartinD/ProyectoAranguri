export type EmpleadoRol = 'Vendedor' | 'Administrador' | 'Gerente';
export type TipoRemuneracion = 'FIJO' | 'COMISION' | 'MIXTO';

export interface Empleado {
  id: string;
  nombre: string;
  rol: EmpleadoRol;
  fecha_ingreso: string;
  activo: boolean;
  tipo_remuneracion: TipoRemuneracion;
  sueldo_fijo: number;
  porcentaje_comision: number;
  dia_cobro: number;
  creado_en: string;
}

export interface EmpleadoInput {
  nombre: string;
  rol: EmpleadoRol;
  fecha_ingreso: string;
  activo?: boolean;
  tipo_remuneracion?: TipoRemuneracion;
  sueldo_fijo?: number;
  porcentaje_comision?: number;
  dia_cobro?: number;
}
