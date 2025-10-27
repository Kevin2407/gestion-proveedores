import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET - Obtener todos los tipos de equipo
export async function GET(request) {
  try {
    const pool = await getConnection()
    
    const result = await pool.request()
      .query(`
        SELECT 
          id_tipoequipo,
          nombre_categoria,
          descripcion
        FROM Tipo_Equipo
        ORDER BY nombre_categoria ASC
      `)
    
    return NextResponse.json({
      success: true,
      data: result.recordset
    })
    
  } catch (error) {
    console.error('Error en GET /api/equipment-types:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo tipo de equipo
export async function POST(request) {
  try {
    const body = await request.json()
    const { nombre_categoria, descripcion } = body
    
    const pool = await getConnection()
    
    // Obtener el siguiente ID
    const maxIdResult = await pool.request()
      .query('SELECT ISNULL(MAX(id_tipoequipo), 0) + 1 AS next_id FROM Tipo_Equipo')
    
    const nextId = maxIdResult.recordset[0].next_id
    
    const result = await pool.request()
      .input('id_tipoequipo', sql.Int, nextId)
      .input('nombre_categoria', sql.NVarChar(100), nombre_categoria)
      .input('descripcion', sql.NVarChar(255), descripcion || null)
      .query(`
        INSERT INTO Tipo_Equipo (id_tipoequipo, nombre_categoria, descripcion)
        VALUES (@id_tipoequipo, @nombre_categoria, @descripcion);
        
        SELECT * FROM Tipo_Equipo WHERE id_tipoequipo = @id_tipoequipo
      `)
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error en POST /api/equipment-types:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Actualizar tipo de equipo
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id_tipoequipo, nombre_categoria, descripcion } = body
    
    const pool = await getConnection()
    
    const result = await pool.request()
      .input('id_tipoequipo', sql.Int, id_tipoequipo)
      .input('nombre_categoria', sql.NVarChar(100), nombre_categoria)
      .input('descripcion', sql.NVarChar(255), descripcion || null)
      .query(`
        UPDATE Tipo_Equipo
        SET nombre_categoria = @nombre_categoria,
            descripcion = @descripcion
        WHERE id_tipoequipo = @id_tipoequipo;
        
        SELECT * FROM Tipo_Equipo WHERE id_tipoequipo = @id_tipoequipo
      `)
    
    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tipo de equipo no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    })
    
  } catch (error) {
    console.error('Error en PUT /api/equipment-types:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar tipo de equipo
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
      .input('id_tipoequipo', sql.Int, parseInt(id))
      .query(`
        DELETE FROM Tipo_Equipo
        WHERE id_tipoequipo = @id_tipoequipo
      `)
    
    return NextResponse.json({
      success: true,
      message: 'Tipo de equipo eliminado exitosamente'
    })
    
  } catch (error) {
    console.error('Error en DELETE /api/equipment-types:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
