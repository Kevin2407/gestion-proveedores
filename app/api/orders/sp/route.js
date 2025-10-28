import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

function mapOrder(orderRow, detailRows) {
  if (!orderRow) return null

  return {
    id_orden: orderRow.id_orden,
    fecha_pedido: orderRow.fecha_pedido,
    fecha_entrega: orderRow.fecha_entrega,
    monto_total: orderRow.monto_total !== null ? Number(orderRow.monto_total) : 0,
    estado: orderRow.estado,
    id_proveedor: orderRow.id_proveedor,
    proveedor_nombre: orderRow.proveedor_nombre,
    detalles: detailRows.map((detail) => ({
      id_detalle: detail.id_Detalle_OC,
      id_producto: detail.id_producto,
      producto_nombre: detail.nombre_producto,
      cantidad: detail.cantidad,
      precio_unitario: Number(detail.precio_unitario),
      subtotal: Number(detail.subtotal),
    })),
  }
}

async function fetchOrderById(pool, id) {
  const result = await pool
    .request()
    .input('id_orden', sql.Int, id)
    .query(`
      SELECT 
        o.id_orden,
        o.fecha_pedido,
        o.fecha_entrega,
        o.monto_total,
        o.estado,
        o.id_proveedor,
        per.nombre AS proveedor_nombre
      FROM Orden_De_Compra o
        INNER JOIN Proveedor pr ON o.id_proveedor = pr.id_proveedor
        INNER JOIN Persona per ON pr.id_persona = per.id_persona
      WHERE o.id_orden = @id_orden;

      SELECT 
        d.id_Detalle_OC,
        d.id_orden,
        d.id_producto,
        prod.nombre_producto,
        d.cantidad,
        d.precio_unitario,
        d.subtotal
      FROM Detalle_OC d
        INNER JOIN Producto prod ON d.id_producto = prod.id_producto
      WHERE d.id_orden = @id_orden
      ORDER BY d.id_Detalle_OC ASC;
    `)

  if (result.recordsets[0].length === 0) {
    return null
  }

  return mapOrder(result.recordsets[0][0], result.recordsets[1])
}

export async function POST(request) {
  try {
    const { id_proveedor, fecha_pedido, monto_total } = await request.json()

    if (!id_proveedor || !fecha_pedido || monto_total === undefined) {
      return NextResponse.json(
        { success: false, error: 'Los campos id_proveedor, fecha_pedido y monto_total son obligatorios.' },
        { status: 400 }
      )
    }

    const montoTotalNumber = Number(monto_total)

    if (Number.isNaN(montoTotalNumber) || montoTotalNumber <= 0) {
      return NextResponse.json(
        { success: false, error: 'monto_total debe ser un número positivo.' },
        { status: 400 }
      )
    }

    const pool = await getConnection()

    await pool
      .request()
      .input('id_proveedor', sql.Int, id_proveedor)
      .input('fecha_pedido', sql.Date, fecha_pedido)
      .input('monto_total', sql.Decimal(14, 2), montoTotalNumber)
      .execute('SP_RegistrarOrden')

    const orderIdResult = await pool
      .request()
      .input('id_proveedor', sql.Int, id_proveedor)
      .input('fecha_pedido', sql.Date, fecha_pedido)
      .query(`
        SELECT TOP 1 id_orden
        FROM Orden_De_Compra
        WHERE id_proveedor = @id_proveedor AND fecha_pedido = @fecha_pedido
        ORDER BY id_orden DESC
      `)

    let order = null

    if (orderIdResult.recordset.length > 0) {
      order = await fetchOrderById(pool, orderIdResult.recordset[0].id_orden)
    }

    return NextResponse.json({
      success: true,
      message: 'Stored procedure ejecutada correctamente.',
      data: order,
    })
  } catch (error) {
    console.error('Error en POST /api/orders/sp:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
