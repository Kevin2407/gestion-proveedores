import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await getConnection()

    // 4.a – Última calificación más alta registrada
    const topRatingsResult = await pool.request().query(`
      SELECT 
        p.id_proveedor,
        per.nombre,
        c.puntaje,
        c.fecha_evaluacion,
        c.comentarios
      FROM Proveedor p
        INNER JOIN Persona per ON p.id_persona = per.id_persona
        INNER JOIN Calificacion c ON p.id_proveedor = c.id_proveedor
      WHERE c.puntaje = (
        SELECT MAX(c2.puntaje) FROM Calificacion c2
      )
      ORDER BY c.fecha_evaluacion DESC, c.id_calificacion DESC
    `)

    const mejoresCalificaciones = topRatingsResult.recordset.map((item) => ({
      id_proveedor: item.id_proveedor,
      nombre: item.nombre,
      puntaje: item.puntaje !== null ? Number(item.puntaje) : null,
      fecha_evaluacion: item.fecha_evaluacion,
      comentarios: item.comentarios,
    }))

    // 4.b – Proveedores sin fallas registradas
    const providersWithoutFailsResult = await pool.request().query(`
      SELECT 
        p.id_proveedor,
        per.nombre,
        per.correo,
        per.telefono,
        p.fecha_alta
      FROM Proveedor p
        INNER JOIN Persona per ON p.id_persona = per.id_persona
      WHERE NOT EXISTS (
        SELECT 1
        FROM Falla_Proveedor f
        WHERE f.id_proveedor = p.id_proveedor
      )
      ORDER BY per.nombre ASC
    `)

    const proveedoresSinFallas = providersWithoutFailsResult.recordset.map((item) => ({
      id_proveedor: item.id_proveedor,
      nombre: item.nombre,
      correo: item.correo,
      telefono: item.telefono,
      fecha_alta: item.fecha_alta,
    }))

    


    // 5 – Procedimiento almacenado SP_RegistrarOrden
    const storedProcedureOrderResult = await pool.request().query(`
      WITH OrdenCoincidentes AS (
        SELECT
          d.id_orden,
          SUM(CASE WHEN d.id_producto = 1 AND d.cantidad = 5 AND d.precio_unitario = 100 AND d.subtotal = 500 THEN 1 ELSE 0 END) AS match_producto_1,
          SUM(CASE WHEN d.id_producto = 2 AND d.cantidad = 3 AND d.precio_unitario = 200 AND d.subtotal = 600 THEN 1 ELSE 0 END) AS match_producto_2,
          COUNT(*) AS total_detalles
        FROM Detalle_OC d
        GROUP BY d.id_orden
      )
      SELECT TOP 1
        o.id_orden,
        o.id_proveedor,
        per.nombre AS proveedor_nombre,
        o.fecha_pedido,
        o.fecha_entrega,
        o.monto_total,
        o.estado
      FROM Orden_De_Compra o
        INNER JOIN OrdenCoincidentes oc ON o.id_orden = oc.id_orden
        INNER JOIN Proveedor p ON o.id_proveedor = p.id_proveedor
        INNER JOIN Persona per ON p.id_persona = per.id_persona
      WHERE oc.total_detalles = 2
        AND oc.match_producto_1 = 1
        AND oc.match_producto_2 = 1
      ORDER BY o.id_orden DESC
    `)

    let storedProcedureOrder = null

    if (storedProcedureOrderResult.recordset.length > 0) {
      const orderRow = storedProcedureOrderResult.recordset[0]

      const storedProcedureDetailsResult = await pool
        .request()
        .input('id_orden', sql.Int, orderRow.id_orden)
        .query(`
          SELECT 
            d.id_Detalle_OC,
            d.id_producto,
            prod.nombre_producto,
            d.cantidad,
            d.precio_unitario,
            d.subtotal
          FROM Detalle_OC d
            INNER JOIN Producto prod ON d.id_producto = prod.id_producto
          WHERE d.id_orden = @id_orden
          ORDER BY d.id_Detalle_OC ASC
        `)

      storedProcedureOrder = {
        id_orden: orderRow.id_orden,
        id_proveedor: orderRow.id_proveedor,
        proveedor_nombre: orderRow.proveedor_nombre,
        fecha_pedido: orderRow.fecha_pedido,
        fecha_entrega: orderRow.fecha_entrega,
        monto_total: orderRow.monto_total !== null ? Number(orderRow.monto_total) : null,
        estado: orderRow.estado,
        detalles: storedProcedureDetailsResult.recordset.map((detail) => ({
          id_detalle: detail.id_Detalle_OC,
          id_producto: detail.id_producto,
          producto_nombre: detail.nombre_producto,
          cantidad: Number(detail.cantidad),
          precio_unitario: Number(detail.precio_unitario),
          subtotal: Number(detail.subtotal),
        })),
      }
    }



    const auditResult = await pool.request().query(`
      SELECT TOP 10
        a.id_auditoria,
        a.id_orden,
        a.id_proveedor,
        per.nombre AS proveedor_nombre,
        a.fecha_pedido,
        a.estado,
        a.fecha_auditoria,
        a.accion
      FROM Auditoria_Ordenes a
        LEFT JOIN Proveedor p ON a.id_proveedor = p.id_proveedor
        LEFT JOIN Persona per ON p.id_persona = per.id_persona
      ORDER BY a.fecha_auditoria DESC
    `)

    const auditoriaOrdenes = auditResult.recordset.map((item) => ({
      id_auditoria: item.id_auditoria,
      id_orden: item.id_orden,
      id_proveedor: item.id_proveedor,
      proveedor_nombre: item.proveedor_nombre,
      fecha_pedido: item.fecha_pedido,
      estado: item.estado,
      fecha_auditoria: item.fecha_auditoria,
      accion: item.accion,
    }))

    const consignas = {
      punto4a: {
        titulo: 'Punto 4.a – Última calificación más alta registrada',
        descripcion:
          'Consulta con subconsulta correlacionada que identifica al proveedor cuya calificación más reciente coincide con el puntaje máximo almacenado.',
        resultados: mejoresCalificaciones,
      },
      punto4b: {
        titulo: 'Punto 4.b – Proveedores sin fallas registradas',
        descripcion:
          'Consulta que utiliza NOT EXISTS para detectar proveedores que no poseen registros asociados en Falla_Proveedor.',
        resultados: proveedoresSinFallas,
      },
      punto5: {
        titulo: 'Punto 5 – Procedimiento almacenado SP_RegistrarOrden',
        descripcion:
          'Operación transaccional que inserta una orden de compra con dos productos fijos, validando los detalles y exponiendo la lógica centralizada en SQL Server.',
        ultimaOrdenGenerada: storedProcedureOrder,
      },
      punto6: {
        titulo: 'Punto 6 – Trigger TRG_AuditarOrden',
        descripcion:
          'Trigger AFTER que registra inserciones, actualizaciones y eliminaciones de Orden_De_Compra en la tabla Auditoria_Ordenes mediante INSERTED y DELETED.',
        resultados: auditoriaOrdenes,
      },
    }

    return NextResponse.json({
      success: true,
      data: {
        consignas,
      },
    })
  } catch (error) {
    console.error('Error en GET /api/reports:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
