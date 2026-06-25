export type EmpleadoRol = 'Vendedor' | 'Administrador' | 'Gerente';

export interface Empleado {
  id: string;
  nombre: string;
  rol: EmpleadoRol;
  fecha_ingreso: string;
  activo: boolean;
  creado_en: string;
}

export interface EmpleadoInput {
  nombre: string;
  rol: EmpleadoRol;
  fecha_ingreso: string;
  activo?: boolean;
}
