import { Vehiculo } from './vehiculo';
import { Empleado } from './empleado';

export type TransaccionTipo = 'Compra' | 'Venta';

export interface Transaccion {
  id: string;
  tipo: TransaccionTipo;
  vehiculo_id: string;
  empleado_id: string;
  monto: number;
  ganancia_neta: number;
  fecha: string;
  
  // Opcionales para cuando se hace un JOIN en Supabase
  vehiculo?: Vehiculo;
  empleado?: Empleado;
}

export interface TransaccionInput {
  tipo: TransaccionTipo;
  vehiculo_id: string;
  empleado_id: string;
  monto: number;
}
