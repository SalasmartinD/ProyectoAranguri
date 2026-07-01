import * as XLSX from 'xlsx';

export interface MovimientoCaja {
  id: string;
  fecha: string;
  monto: number;
  tipo_movimiento: 'INGRESO' | 'EGRESO';
  categoria_id: string;
  categorias_caja?: {
    nombre: string;
  } | null;
  descripcion: string;
}

export function exportarMovimientosAExcel(movimientos: MovimientoCaja[]): void {
  const datosExcel = movimientos.map((m) => ({
    Fecha: new Date(m.fecha).toLocaleString('es-AR'),
    Tipo: m.tipo_movimiento,
    'Categoría': m.categorias_caja?.nombre || 'General',
    'Descripción': m.descripcion,
    'Monto ($)': Number(m.monto),
  }));

  const worksheet = XLSX.utils.json_to_sheet(datosExcel);

  // Auto-ajustar el ancho de las columnas de forma básica
  const colWidths = Object.keys(datosExcel[0] || {}).map((key) => {
    const headerLen = key.length;
    const valuesLen = datosExcel.map((row) => String(row[key as keyof typeof row] ?? '').length);
    return { wch: Math.max(headerLen, ...valuesLen) + 3 };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

  XLSX.writeFile(workbook, `reporte_caja_${new Date().toISOString().split('T')[0]}.xlsx`);
}
