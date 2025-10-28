import { getConnection } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await getConnection()

    const totalsResult = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM Proveedor) AS total_proveedores,
        (SELECT COUNT(*) FROM Tecnico) AS total_tecnicos,
        (SELECT COUNT(*) FROM Producto) AS total_productos,
        (SELECT COUNT(*) FROM Orden_De_Compra) AS total_ordenes,
        (SELECT COUNT(*) FROM Calificacion) AS total_calificaciones,
        (SELECT COUNT(*) FROM Falla_Proveedor) AS total_fallas,
        (SELECT ISNULL(AVG(CAST(puntaje AS FLOAT)), 0) FROM Calificacion) AS promedio_calificaciones,
        (SELECT ISNULL(SUM(monto_total), 0) FROM Orden_De_Compra WHERE MONTH(fecha_pedido) = MONTH(GETDATE()) AND YEAR(fecha_pedido) = YEAR(GETDATE())) AS gasto_mes_actual
    `)

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

    const ordersByStatusResult = await pool.request().query(`
      SELECT 
        estado,
        COUNT(*) AS cantidad,
        ISNULL(SUM(monto_total), 0) AS monto_total
      FROM Orden_De_Compra
      GROUP BY estado
    `)

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

    const recentOrdersResult = await pool.request().query(`
      SELECT TOP 5
        o.id_orden,
        o.fecha_pedido,
        o.monto_total,
        o.estado,
        per.nombre AS proveedor_nombre
      FROM Orden_De_Compra o
        INNER JOIN Proveedor p ON o.id_proveedor = p.id_proveedor
        INNER JOIN Persona per ON p.id_persona = per.id_persona
      ORDER BY o.fecha_pedido DESC, o.id_orden DESC
    `)

    return NextResponse.json({
      success: true,
      data: {
        totales: totalsResult.recordset[0],
        mejoresCalificaciones: topRatingsResult.recordset,
        proveedoresSinFallas: providersWithoutFailsResult.recordset,
        ordenesPorEstado: ordersByStatusResult.recordset,
        auditoriaOrdenes: auditResult.recordset,
        ordenesRecientes: recentOrdersResult.recordset,
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
