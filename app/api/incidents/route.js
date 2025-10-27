import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET - Obtener todas las incidencias
export async function GET(request) {
  try {
    const pool = await getConnection()
    
    const result = await pool.request()
      .query(`
        SELECT 
          i.id_incidencia,
          i.fecha_reportaje,
          i.descripcion,
          i.severidad,
          i.estado,
          i.id_equipo,
          e.modelo AS equipo_modelo,
          e.numero_serie AS equipo_serie,
          t.nombre_categoria AS tipo_equipo
        FROM Incidencia i
        INNER JOIN Equipo_Adquirido e ON i.id_equipo = e.id_equipo
        INNER JOIN Tipo_Equipo t ON e.id_tipoequipo = t.id_tipoequipo
        ORDER BY i.fecha_reportaje DESC
      `)
    
    return NextResponse.json({
      success: true,
      data: result.recordset
    })
    
  } catch (error) {
    console.error('Error en GET /api/incidents:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear nueva incidencia
export async function POST(request) {
  try {
    const body = await request.json()
    const { fecha_reportaje, descripcion, severidad, estado, id_equipo } = body
    
    const pool = await getConnection()
    
    // Obtener el siguiente ID
    const maxIdResult = await pool.request()
      .query('SELECT ISNULL(MAX(id_incidencia), 0) + 1 AS next_id FROM Incidencia')
    
    const nextId = maxIdResult.recordset[0].next_id
    
    const result = await pool.request()
      .input('id_incidencia', sql.Int, nextId)
      .input('fecha_reportaje', sql.Date, fecha_reportaje)
      .input('descripcion', sql.NVarChar(255), descripcion)
      .input('severidad', sql.NVarChar(50), severidad || null)
      .input('estado', sql.NVarChar(50), estado)
      .input('id_equipo', sql.Int, id_equipo)
      .query(`
        INSERT INTO Incidencia (id_incidencia, fecha_reportaje, descripcion, severidad, estado, id_equipo)
        VALUES (@id_incidencia, @fecha_reportaje, @descripcion, @severidad, @estado, @id_equipo);
        
        SELECT 
          i.*,
          e.modelo AS equipo_modelo,
          e.numero_serie AS equipo_serie,
          t.nombre_categoria AS tipo_equipo
        FROM Incidencia i
        INNER JOIN Equipo_Adquirido e ON i.id_equipo = e.id_equipo
        INNER JOIN Tipo_Equipo t ON e.id_tipoequipo = t.id_tipoequipo
        WHERE i.id_incidencia = @id_incidencia
      `)
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error en POST /api/incidents:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Actualizar incidencia
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id_incidencia, fecha_reportaje, descripcion, severidad, estado, id_equipo } = body
    
    const pool = await getConnection()
    
    const result = await pool.request()
      .input('id_incidencia', sql.Int, id_incidencia)
      .input('fecha_reportaje', sql.Date, fecha_reportaje)
      .input('descripcion', sql.NVarChar(255), descripcion)
      .input('severidad', sql.NVarChar(50), severidad || null)
      .input('estado', sql.NVarChar(50), estado)
      .input('id_equipo', sql.Int, id_equipo)
      .query(`
        UPDATE Incidencia
        SET fecha_reportaje = @fecha_reportaje,
            descripcion = @descripcion,
            severidad = @severidad,
            estado = @estado,
            id_equipo = @id_equipo
        WHERE id_incidencia = @id_incidencia;
        
        SELECT 
          i.*,
          e.modelo AS equipo_modelo,
          e.numero_serie AS equipo_serie,
          t.nombre_categoria AS tipo_equipo
        FROM Incidencia i
        INNER JOIN Equipo_Adquirido e ON i.id_equipo = e.id_equipo
        INNER JOIN Tipo_Equipo t ON e.id_tipoequipo = t.id_tipoequipo
        WHERE i.id_incidencia = @id_incidencia
      `)
    
    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Incidencia no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    })
    
  } catch (error) {
    console.error('Error en PUT /api/incidents:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar incidencia
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID no proporcionado' },
        { status: 400 }
      )
    }
    
    const pool = await getConnection()
    
    await pool.request()
      .input('id_incidencia', sql.Int, parseInt(id))
      .query(`
        DELETE FROM Incidencia
        WHERE id_incidencia = @id_incidencia
      `)
    
    return NextResponse.json({
      success: true,
      message: 'Incidencia eliminada exitosamente'
    })
    
  } catch (error) {
    console.error('Error en DELETE /api/incidents:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
