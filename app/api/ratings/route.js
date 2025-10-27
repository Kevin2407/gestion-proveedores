import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET - Obtener todas las calificaciones
export async function GET(request) {
  try {
    const pool = await getConnection()
    
    const result = await pool.request()
      .query(`
        SELECT 
          c.id_calificacion,
          c.fecha_evaluacion,
          c.puntaje,
          c.comentarios,
          c.id_proveedor,
          p.nombre AS proveedor_nombre
        FROM Calificacion c
        INNER JOIN Proveedor p ON c.id_proveedor = p.id_proveedor
        ORDER BY c.fecha_evaluacion DESC
      `)
    
    return NextResponse.json({
      success: true,
      data: result.recordset
    })
    
  } catch (error) {
    console.error('Error en GET /api/ratings:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear nueva calificación
export async function POST(request) {
  try {
    const body = await request.json()
    const { fecha_evaluacion, puntaje, comentarios, id_proveedor } = body
    
    const pool = await getConnection()
    
    // Obtener el siguiente ID
    const maxIdResult = await pool.request()
      .query('SELECT ISNULL(MAX(id_calificacion), 0) + 1 AS next_id FROM Calificacion')
    
    const nextId = maxIdResult.recordset[0].next_id
    
    const result = await pool.request()
      .input('id_calificacion', sql.Int, nextId)
      .input('fecha_evaluacion', sql.Date, fecha_evaluacion)
      .input('puntaje', sql.TinyInt, puntaje)
      .input('comentarios', sql.NVarChar(255), comentarios || null)
      .input('id_proveedor', sql.Int, id_proveedor)
      .query(`
        INSERT INTO Calificacion (id_calificacion, fecha_evaluacion, puntaje, comentarios, id_proveedor)
        VALUES (@id_calificacion, @fecha_evaluacion, @puntaje, @comentarios, @id_proveedor);
        
        SELECT 
          c.*,
          p.nombre AS proveedor_nombre
        FROM Calificacion c
        INNER JOIN Proveedor p ON c.id_proveedor = p.id_proveedor
        WHERE c.id_calificacion = @id_calificacion
      `)
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error en POST /api/ratings:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Actualizar calificación
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id_calificacion, fecha_evaluacion, puntaje, comentarios, id_proveedor } = body
    
    const pool = await getConnection()
    
    const result = await pool.request()
      .input('id_calificacion', sql.Int, id_calificacion)
      .input('fecha_evaluacion', sql.Date, fecha_evaluacion)
      .input('puntaje', sql.TinyInt, puntaje)
      .input('comentarios', sql.NVarChar(255), comentarios || null)
      .input('id_proveedor', sql.Int, id_proveedor)
      .query(`
        UPDATE Calificacion
        SET fecha_evaluacion = @fecha_evaluacion,
            puntaje = @puntaje,
            comentarios = @comentarios,
            id_proveedor = @id_proveedor
        WHERE id_calificacion = @id_calificacion;
        
        SELECT 
          c.*,
          p.nombre AS proveedor_nombre
        FROM Calificacion c
        INNER JOIN Proveedor p ON c.id_proveedor = p.id_proveedor
        WHERE c.id_calificacion = @id_calificacion
      `)
    
    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Calificación no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    })
    
  } catch (error) {
    console.error('Error en PUT /api/ratings:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar calificación
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
      .input('id_calificacion', sql.Int, parseInt(id))
      .query(`
        DELETE FROM Calificacion
        WHERE id_calificacion = @id_calificacion
      `)
    
    return NextResponse.json({
      success: true,
      message: 'Calificación eliminada exitosamente'
    })
    
  } catch (error) {
    console.error('Error en DELETE /api/ratings:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
