import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

function mapOrders(ordersRows, detailsRows) {
  const ordersMap = new Map()

  ordersRows.forEach((row) => {
    ordersMap.set(row.id_orden, {
      id_orden: row.id_orden,
      fecha_pedido: row.fecha_pedido,
      fecha_entrega: row.fecha_entrega,
      monto_total: row.monto_total !== null ? Number(row.monto_total) : 0,
      estado: row.estado,
      id_proveedor: row.id_proveedor,
      proveedor_nombre: row.proveedor_nombre,
      detalles: [],
    })
  })

  detailsRows.forEach((detail) => {
    const order = ordersMap.get(detail.id_orden)
    if (order) {
      order.detalles.push({
        id_detalle: detail.id_Detalle_OC,
        id_producto: detail.id_producto,
        producto_nombre: detail.nombre_producto,
        cantidad: detail.cantidad,
        precio_unitario: Number(detail.precio_unitario),
        subtotal: Number(detail.subtotal),
      })
    }
  })

  return Array.from(ordersMap.values())
}

async function fetchOrders(pool) {
  const result = await pool
    .request()
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
      ORDER BY o.fecha_pedido DESC, o.id_orden DESC;

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
      ORDER BY d.id_orden ASC, d.id_Detalle_OC ASC;
    `)

  const ordersRows = result.recordsets[0]
  const detailsRows = result.recordsets[1]

  return mapOrders(ordersRows, detailsRows)
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

  return mapOrders(result.recordsets[0], result.recordsets[1])[0]
}

export async function GET() {
  try {
    const pool = await getConnection()
    const orders = await fetchOrders(pool)

    return NextResponse.json({
      success: true,
      data: orders,
    })
  } catch (error) {
    console.error('Error en GET /api/orders:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('La orden debe incluir al menos un producto.')
  }

  return items.map((item) => {
    const cantidad = parseInt(item.cantidad, 10)
    const precioUnitario = Number(item.precio_unitario)

    if (Number.isNaN(cantidad) || cantidad <= 0) {
      throw new Error('La cantidad de cada producto debe ser un número entero positivo.')
    }

    if (Number.isNaN(precioUnitario) || precioUnitario <= 0) {
      throw new Error('El precio unitario debe ser un número positivo.')
    }

    const subtotal = item.subtotal !== undefined ? Number(item.subtotal) : cantidad * precioUnitario

    return {
      id_producto: item.id_producto,
      cantidad,
      precio_unitario: precioUnitario,
      subtotal: Number(subtotal.toFixed(2)),
    }
  })
}

function computeTotal(items) {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0)
  return Number(total.toFixed(2))
}

export async function POST(request) {
  const transaction = new sql.Transaction(await getConnection())

  try {
    const { id_proveedor, fecha_pedido, fecha_entrega, estado, items } = await request.json()

    if (!id_proveedor || !fecha_pedido || !estado) {
      return NextResponse.json(
        { success: false, error: 'Los campos id_proveedor, fecha_pedido y estado son obligatorios.' },
        { status: 400 }
      )
    }

    const normalizedItems = normalizeItems(items)
    const monto_total = computeTotal(normalizedItems)

    await transaction.begin()

    const orderResult = await transaction
      .request()
      .input('id_proveedor', sql.Int, id_proveedor)
      .input('fecha_pedido', sql.Date, fecha_pedido)
      .input('fecha_entrega', sql.Date, fecha_entrega || null)
      .input('monto_total', sql.Decimal(14, 2), monto_total)
      .input('estado', sql.NVarChar(50), estado)
      .query(`
        INSERT INTO Orden_De_Compra (id_proveedor, fecha_pedido, fecha_entrega, monto_total, estado)
        OUTPUT INSERTED.id_orden AS id_orden
        VALUES (@id_proveedor, @fecha_pedido, @fecha_entrega, @monto_total, @estado)
      `)

    const id_orden = orderResult.recordset[0].id_orden

    for (const item of normalizedItems) {
      await transaction
        .request()
        .input('id_orden', sql.Int, id_orden)
        .input('id_producto', sql.Int, item.id_producto)
        .input('cantidad', sql.Int, item.cantidad)
        .input('precio_unitario', sql.Decimal(10, 2), item.precio_unitario)
        .input('subtotal', sql.Decimal(10, 2), item.subtotal)
        .query(`
          INSERT INTO Detalle_OC (id_orden, id_producto, cantidad, precio_unitario, subtotal)
          VALUES (@id_orden, @id_producto, @cantidad, @precio_unitario, @subtotal)
        `)
    }

    await transaction.commit()

    const pool = await getConnection()
    const order = await fetchOrderById(pool, id_orden)

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 201 }
    )
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback POST /api/orders:', rollbackError)
    }

    console.error('Error en POST /api/orders:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  const transaction = new sql.Transaction(await getConnection())

  try {
    const { id_orden, id_proveedor, fecha_pedido, fecha_entrega, estado, items } = await request.json()

    if (!id_orden || !id_proveedor || !fecha_pedido || !estado) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios para actualizar la orden.' },
        { status: 400 }
      )
    }

    const normalizedItems = normalizeItems(items)
    const monto_total = computeTotal(normalizedItems)

    await transaction.begin()

    const updateOrderResult = await transaction
      .request()
      .input('id_orden', sql.Int, id_orden)
      .input('id_proveedor', sql.Int, id_proveedor)
      .input('fecha_pedido', sql.Date, fecha_pedido)
      .input('fecha_entrega', sql.Date, fecha_entrega || null)
      .input('monto_total', sql.Decimal(14, 2), monto_total)
      .input('estado', sql.NVarChar(50), estado)
      .query(`
        UPDATE Orden_De_Compra
        SET id_proveedor = @id_proveedor,
            fecha_pedido = @fecha_pedido,
            fecha_entrega = @fecha_entrega,
            monto_total = @monto_total,
            estado = @estado
        WHERE id_orden = @id_orden
      `)

    if (updateOrderResult.rowsAffected[0] === 0) {
      await transaction.rollback()
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    await transaction
      .request()
      .input('id_orden', sql.Int, id_orden)
      .query(`
        DELETE FROM Detalle_OC WHERE id_orden = @id_orden
      `)

    for (const item of normalizedItems) {
      await transaction
        .request()
        .input('id_orden', sql.Int, id_orden)
        .input('id_producto', sql.Int, item.id_producto)
        .input('cantidad', sql.Int, item.cantidad)
        .input('precio_unitario', sql.Decimal(10, 2), item.precio_unitario)
        .input('subtotal', sql.Decimal(10, 2), item.subtotal)
        .query(`
          INSERT INTO Detalle_OC (id_orden, id_producto, cantidad, precio_unitario, subtotal)
          VALUES (@id_orden, @id_producto, @cantidad, @precio_unitario, @subtotal)
        `)
    }

    await transaction.commit()

    const pool = await getConnection()
    const order = await fetchOrderById(pool, id_orden)

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback PUT /api/orders:', rollbackError)
    }

    console.error('Error en PUT /api/orders:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  const transaction = new sql.Transaction(await getConnection())

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID no proporcionado' },
        { status: 400 }
      )
    }

    await transaction.begin()

    await transaction
      .request()
      .input('id_orden', sql.Int, parseInt(id, 10))
      .query(`
        DELETE FROM Detalle_OC WHERE id_orden = @id_orden
      `)

    const deleteOrderResult = await transaction
      .request()
      .input('id_orden', sql.Int, parseInt(id, 10))
      .query(`
        DELETE FROM Orden_De_Compra WHERE id_orden = @id_orden
      `)

    if (deleteOrderResult.rowsAffected[0] === 0) {
      await transaction.rollback()
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    await transaction.commit()

    return NextResponse.json({
      success: true,
      message: 'Orden eliminada exitosamente',
    })
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback DELETE /api/orders:', rollbackError)
    }

    console.error('Error en DELETE /api/orders:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
