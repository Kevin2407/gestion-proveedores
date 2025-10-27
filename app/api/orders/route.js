import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET - Obtener todas las órdenes de compra
export async function GET(request) {
  try {
    const pool = await getConnection()
    
    const result = await pool.request()
      .query(`
        SELECT 
          o.id_orden,
          o.fecha_pedido,
          o.fecha_entrega,
          o.monto_total,
          o.estado,
          o.id_proveedor,
          p.nombre AS proveedor_nombre
        FROM Orden_De_Compra o
        INNER JOIN Proveedor p ON o.id_proveedor = p.id_proveedor
        ORDER BY o.fecha_pedido DESC
      `)
    
    return NextResponse.json({
      success: true,
      data: result.recordset
    })
    
  } catch (error) {
    console.error('Error en GET /api/orders:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear nueva orden de compra con items (TRANSACCIÓN)
export async function POST(request) {
  const transaction = new sql.Transaction(await getConnection())
  
  try {
    const body = await request.json()
    const { fecha_pedido, fecha_entrega, monto_total, estado, id_proveedor, items } = body
    
    // Iniciar transacción
    await transaction.begin()
    
    // Obtener el siguiente ID para la orden
    const maxIdResult = await transaction.request()
      .query('SELECT ISNULL(MAX(id_orden), 0) + 1 AS next_id FROM Orden_De_Compra')
    
    const nextOrderId = maxIdResult.recordset[0].next_id
    
    // Insertar orden de compra
    await transaction.request()
      .input('id_orden', sql.Int, nextOrderId)
      .input('fecha_pedido', sql.Date, fecha_pedido)
      .input('fecha_entrega', sql.Date, fecha_entrega || null)
      .input('monto_total', sql.Decimal(12, 2), monto_total)
      .input('estado', sql.NVarChar(50), estado)
      .input('id_proveedor', sql.Int, id_proveedor)
      .query(`
        INSERT INTO Orden_De_Compra (id_orden, fecha_pedido, fecha_entrega, monto_total, estado, id_proveedor)
        VALUES (@id_orden, @fecha_pedido, @fecha_entrega, @monto_total, @estado, @id_proveedor)
      `)
    
    // Insertar items de la orden si existen
    if (items && items.length > 0) {
      const maxItemIdResult = await transaction.request()
        .query('SELECT ISNULL(MAX(id_item), 0) AS max_id FROM Item_Orden_De_Compra')
      
      let nextItemId = maxItemIdResult.recordset[0].max_id + 1
      
      for (const item of items) {
        await transaction.request()
          .input('id_item', sql.Int, nextItemId)
          .input('descripcion', sql.NVarChar(150), item.descripcion)
          .input('cantidad', sql.SmallInt, item.cantidad)
          .input('precio_unitario', sql.Decimal(10, 2), item.precio_unitario)
          .input('subtotal', sql.Decimal(10, 2), item.subtotal)
          .input('id_orden', sql.Int, nextOrderId)
          .input('id_tipoequipo', sql.Int, item.id_tipoequipo)
          .query(`
            INSERT INTO Item_Orden_De_Compra (id_item, descripcion, cantidad, precio_unitario, subtotal, id_orden, id_tipoequipo)
            VALUES (@id_item, @descripcion, @cantidad, @precio_unitario, @subtotal, @id_orden, @id_tipoequipo)
          `)
        
        nextItemId++
      }
    }
    
    // Obtener el registro completo
    const result = await transaction.request()
      .input('id_orden', sql.Int, nextOrderId)
      .query(`
        SELECT 
          o.*,
          p.nombre AS proveedor_nombre
        FROM Orden_De_Compra o
        INNER JOIN Proveedor p ON o.id_proveedor = p.id_proveedor
        WHERE o.id_orden = @id_orden
      `)
    
    // Confirmar transacción
    await transaction.commit()
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    }, { status: 201 })
    
  } catch (error) {
    // Revertir transacción en caso de error
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback:', rollbackError)
    }
    
    console.error('Error en POST /api/orders:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Actualizar orden de compra
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id_orden, fecha_pedido, fecha_entrega, monto_total, estado, id_proveedor } = body
    
    const pool = await getConnection()
    
    const result = await pool.request()
      .input('id_orden', sql.Int, id_orden)
      .input('fecha_pedido', sql.Date, fecha_pedido)
      .input('fecha_entrega', sql.Date, fecha_entrega || null)
      .input('monto_total', sql.Decimal(12, 2), monto_total)
      .input('estado', sql.NVarChar(50), estado)
      .input('id_proveedor', sql.Int, id_proveedor)
      .query(`
        UPDATE Orden_De_Compra
        SET fecha_pedido = @fecha_pedido,
            fecha_entrega = @fecha_entrega,
            monto_total = @monto_total,
            estado = @estado,
            id_proveedor = @id_proveedor
        WHERE id_orden = @id_orden;
        
        SELECT 
          o.*,
          p.nombre AS proveedor_nombre
        FROM Orden_De_Compra o
        INNER JOIN Proveedor p ON o.id_proveedor = p.id_proveedor
        WHERE o.id_orden = @id_orden
      `)
    
    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    })
    
  } catch (error) {
    console.error('Error en PUT /api/orders:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar orden de compra
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
    
    // Primero eliminar items de la orden
    await transaction.request()
      .input('id_orden', sql.Int, parseInt(id))
      .query(`
        DELETE FROM Item_Orden_De_Compra
        WHERE id_orden = @id_orden
      `)
    
    // Luego eliminar la orden
    await transaction.request()
      .input('id_orden', sql.Int, parseInt(id))
      .query(`
        DELETE FROM Orden_De_Compra
        WHERE id_orden = @id_orden
      `)
    
    await transaction.commit()
    
    return NextResponse.json({
      success: true,
      message: 'Orden eliminada exitosamente'
    })
    
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback:', rollbackError)
    }
    
    console.error('Error en DELETE /api/orders:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
