import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET - Obtener estadísticas para reportes ejecutivos
export async function GET(request) {
  try {
    const pool = await getConnection()
    
    // Ejecutar múltiples consultas para obtener estadísticas
    const stats = {}
    
    // Total de proveedores
    const providersResult = await pool.request()
      .query('SELECT COUNT(*) AS total FROM Proveedor')
    stats.totalProveedores = providersResult.recordset[0].total
    
    // Contratos vigentes (no vencidos)
    const contractsResult = await pool.request()
      .query(`
        SELECT COUNT(*) AS total 
        FROM Contrato 
        WHERE fecha_vencimiento >= GETDATE()
      `)
    stats.contratosVigentes = contractsResult.recordset[0].total
    
    // Órdenes del mes actual
    const ordersResult = await pool.request()
      .query(`
        SELECT COUNT(*) AS total 
        FROM Orden_De_Compra 
        WHERE MONTH(fecha_pedido) = MONTH(GETDATE()) 
        AND YEAR(fecha_pedido) = YEAR(GETDATE())
      `)
    stats.ordenesDelMes = ordersResult.recordset[0].total
    
    // Gasto total del mes
    const spendingResult = await pool.request()
      .query(`
        SELECT ISNULL(SUM(monto_total), 0) AS total 
        FROM Orden_De_Compra 
        WHERE MONTH(fecha_pedido) = MONTH(GETDATE()) 
        AND YEAR(fecha_pedido) = YEAR(GETDATE())
      `)
    stats.gastoTotal = spendingResult.recordset[0].total
    
    // Total equipos adquiridos
    const equipmentResult = await pool.request()
      .query('SELECT COUNT(*) AS total FROM Equipo_Adquirido')
    stats.totalEquipos = equipmentResult.recordset[0].total
    
    // Incidencias abiertas (pendientes)
    const incidentsResult = await pool.request()
      .query(`
        SELECT COUNT(*) AS total 
        FROM Incidencia 
        WHERE estado = 'Pendiente'
      `)
    stats.incidenciasAbiertas = incidentsResult.recordset[0].total
    
    // Calificación promedio
    const ratingsResult = await pool.request()
      .query(`
        SELECT ISNULL(AVG(CAST(puntaje AS FLOAT)), 0) AS promedio 
        FROM Calificacion
      `)
    stats.calificacionPromedio = ratingsResult.recordset[0].promedio
    
    // Garantías por vencer (próximos 30 días)
    const warrantyResult = await pool.request()
      .query(`
        SELECT COUNT(*) AS total 
        FROM Equipo_Adquirido 
        WHERE fecha_vencimiento_garantia BETWEEN GETDATE() AND DATEADD(day, 30, GETDATE())
      `)
    stats.garantiasPorVencer = warrantyResult.recordset[0].total
    
    // Top 3 proveedores (por número de órdenes)
    const topProvidersResult = await pool.request()
      .query(`
        SELECT TOP 3
          p.id_proveedor,
          p.nombre,
          COUNT(o.id_orden) AS total_ordenes,
          ISNULL(SUM(o.monto_total), 0) AS monto_total,
          ISNULL(AVG(CAST(c.puntaje AS FLOAT)), 0) AS calificacion_promedio
        FROM Proveedor p
        LEFT JOIN Orden_De_Compra o ON p.id_proveedor = o.id_proveedor
        LEFT JOIN Calificacion c ON p.id_proveedor = c.id_proveedor
        GROUP BY p.id_proveedor, p.nombre
        ORDER BY total_ordenes DESC, monto_total DESC
      `)
    stats.topProveedores = topProvidersResult.recordset
    
    // Actividad reciente (últimas 10 acciones)
    const recentActivityResult = await pool.request()
      .query(`
        SELECT TOP 10 * FROM (
          SELECT 
            'orden' AS tipo,
            'Nueva orden de compra' AS descripcion,
            fecha_pedido AS fecha
          FROM Orden_De_Compra
          
          UNION ALL
          
          SELECT 
            'incidencia' AS tipo,
            'Incidencia reportada' AS descripcion,
            fecha_reportaje AS fecha
          FROM Incidencia
          
          UNION ALL
          
          SELECT 
            'calificacion' AS tipo,
            'Nueva calificación' AS descripcion,
            fecha_evaluacion AS fecha
          FROM Calificacion
          
          UNION ALL
          
          SELECT 
            'contrato' AS tipo,
            'Contrato creado' AS descripcion,
            fecha_inicio AS fecha
          FROM Contrato
        ) AS actividades
        ORDER BY fecha DESC
      `)
    stats.actividadReciente = recentActivityResult.recordset
    
    // Distribución de estados de equipos
    const equipmentStatusResult = await pool.request()
      .query(`
        SELECT 
          estado,
          COUNT(*) AS cantidad
        FROM Equipo_Adquirido
        GROUP BY estado
      `)
    stats.distribucionEstadosEquipos = equipmentStatusResult.recordset
    
    // Órdenes por estado
    const ordersStatusResult = await pool.request()
      .query(`
        SELECT 
          estado,
          COUNT(*) AS cantidad
        FROM Orden_De_Compra
        GROUP BY estado
      `)
    stats.ordenesPorEstado = ordersStatusResult.recordset
    
    return NextResponse.json({
      success: true,
      data: stats
    })
    
  } catch (error) {
    console.error('Error en GET /api/reports:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
