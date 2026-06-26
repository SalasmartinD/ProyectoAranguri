import { NextResponse } from 'next/server';
import { supabase } from '@/core/services/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: 'Cuerpo de petición vacío.' },
        { status: 400 }
      );
    }

    const { empleadoId, mes, anio } = body;

    if (!empleadoId || !mes || !anio) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: empleadoId, mes y anio.' },
        { status: 400 }
      );
    }

    const numericMes = Number(mes);
    const numericAnio = Number(anio);

    if (numericMes < 1 || numericMes > 12) {
      return NextResponse.json(
        { error: 'El mes debe estar entre 1 y 12.' },
        { status: 400 }
      );
    }

    // 1. Obtener datos del empleado
    const { data: empleado, error: empErr } = await supabase
      .from('empleados')
      .select('*')
      .eq('id', empleadoId)
      .single();

    if (empErr || !empleado) {
      return NextResponse.json(
        { error: 'Empleado no encontrado.' },
        { status: 404 }
      );
    }

    // 2. Control de duplicados: Buscar si ya existe la liquidación en movimientos_caja
    const searchDesc = `ID: ${empleadoId}`;
    const periodStr = `Período ${numericMes.toString().padStart(2, '0')}/${numericAnio}`;

    const { data: existingMovements, error: existErr } = await supabase
      .from('movimientos_caja')
      .select('id')
      .eq('categoria', 'SUELDOS_Y_COMISIONES')
      .like('descripcion', `%${searchDesc}%`)
      .like('descripcion', `%${periodStr}%`);

    if (existErr) {
      console.error('Error al validar liquidaciones existentes:', existErr);
      return NextResponse.json(
        { error: 'Error de base de datos al validar liquidaciones duplicadas.' },
        { status: 500 }
      );
    }

    if (existingMovements && existingMovements.length > 0) {
      return NextResponse.json(
        { error: 'Este empleado ya cuenta con una liquidación de sueldo registrada para el período indicado.' },
        { status: 400 }
      );
    }

    // 3. Obtener ventas del período
    const startDate = new Date(numericAnio, numericMes - 1, 1, 0, 0, 0, 0).toISOString();
    const endDate = new Date(numericMes === 12 ? numericAnio + 1 : numericAnio, numericMes === 12 ? 0 : numericMes, 1, 0, 0, 0, 0).toISOString();

    const { data: sales, error: salesErr } = await supabase
      .from('transacciones')
      .select('monto')
      .eq('empleado_id', empleadoId)
      .eq('tipo', 'Venta')
      .gte('fecha', startDate)
      .lt('fecha', endDate);

    if (salesErr) {
      console.error('Error al obtener ventas del empleado:', salesErr);
      return NextResponse.json(
        { error: 'Error de base de datos al obtener las ventas del período.' },
        { status: 500 }
      );
    }

    // 4. Calcular liquidación
    const totalVentas = (sales || []).reduce((sum, s) => sum + Number(s.monto), 0);
    const sueldoFijo = Number(empleado.sueldo_fijo || 0);
    const comision = (totalVentas * Number(empleado.porcentaje_comision || 0)) / 100;

    let totalLiquidado = 0;
    if (empleado.tipo_remuneracion === 'FIJO') {
      totalLiquidado = sueldoFijo;
    } else if (empleado.tipo_remuneracion === 'COMISION') {
      totalLiquidado = comision;
    } else if (empleado.tipo_remuneracion === 'MIXTO') {
      totalLiquidado = sueldoFijo + comision;
    }

    if (totalLiquidado <= 0) {
      return NextResponse.json(
        { error: 'El monto total a liquidar debe ser mayor a $0. El empleado no cuenta con sueldo fijo ni comisiones de venta registradas en este período.' },
        { status: 400 }
      );
    }

    // 5. Registrar el Egreso en la caja
    const descripcion = `Pago de sueldo - ${empleado.nombre} (ID: ${empleadoId}) - Período ${numericMes.toString().padStart(2, '0')}/${numericAnio}. Sueldo Fijo: $${sueldoFijo.toLocaleString('es-AR')}, Comisión: $${comision.toLocaleString('es-AR')} (${sales?.length || 0} ventas).`;

    const { data: movimiento, error: moveErr } = await supabase
      .from('movimientos_caja')
      .insert([
        {
          monto: totalLiquidado,
          tipo_movimiento: 'EGRESO',
          categoria: 'SUELDOS_Y_COMISIONES',
          descripcion
        }
      ])
      .select()
      .single();

    if (moveErr) {
      console.error('Error al registrar egreso en caja:', moveErr);
      return NextResponse.json(
        { error: 'No se pudo completar la operación de liquidación en el registro de caja.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      movimiento
    });
  } catch (error: any) {
    console.error('Error general en liquidar-sueldo Route:', error);
    return NextResponse.json(
      { error: error?.message || 'Ocurrió un error inesperado al procesar la liquidación.' },
      { status: 500 }
    );
  }
}
