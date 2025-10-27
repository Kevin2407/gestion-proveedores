import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET - Obtener todos los equipos adquiridos
export async function GET(request) {
  try {
    const pool = await getConnection()
    
    const result = await pool.request()
      .query(`
        SELECT 
          e.id_equipo,
          e.modelo,
          e.numero_serie,
          e.fecha_vencimiento_garantia,
          e.estado,
          e.id_item,
          e.id_tipoequipo,
          t.nombre_categoria AS tipo_equipo,
          i.descripcion AS descripcion_item
        FROM Equipo_Adquirido e
        INNER JOIN Tipo_Equipo t ON e.id_tipoequipo = t.id_tipoequipo
        LEFT JOIN Item_Orden_De_Compra i ON e.id_item = i.id_item
        ORDER BY e.modelo ASC
      `)
    
    return NextResponse.json({
      success: true,
      data: result.recordset
    })
    
  } catch (error) {
    console.error('Error en GET /api/equipment:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo equipo adquirido
export async function POST(request) {
  try {
    const body = await request.json()
    const { modelo, numero_serie, fecha_vencimiento_garantia, estado, id_item, id_tipoequipo } = body
    
    const pool = await getConnection()
    
    // Obtener el siguiente ID
    const maxIdResult = await pool.request()
      .query('SELECT ISNULL(MAX(id_equipo), 0) + 1 AS next_id FROM Equipo_Adquirido')
    
    const nextId = maxIdResult.recordset[0].next_id
    
    const result = await pool.request()
      .input('id_equipo', sql.Int, nextId)
      .input('modelo', sql.NVarChar(100), modelo)
      .input('numero_serie', sql.NVarChar(100), numero_serie)
      .input('fecha_vencimiento_garantia', sql.Date, fecha_vencimiento_garantia || null)
      .input('estado', sql.VarChar(50), estado)
      .input('id_item', sql.Int, id_item)
      .input('id_tipoequipo', sql.Int, id_tipoequipo)
      .query(`
        INSERT INTO Equipo_Adquirido (id_equipo, modelo, numero_serie, fecha_vencimiento_garantia, estado, id_item, id_tipoequipo)
        VALUES (@id_equipo, @modelo, @numero_serie, @fecha_vencimiento_garantia, @estado, @id_item, @id_tipoequipo);
        
        SELECT 
          e.*,
          t.nombre_categoria AS tipo_equipo,
          i.descripcion AS descripcion_item
        FROM Equipo_Adquirido e
        INNER JOIN Tipo_Equipo t ON e.id_tipoequipo = t.id_tipoequipo
        LEFT JOIN Item_Orden_De_Compra i ON e.id_item = i.id_item
        WHERE e.id_equipo = @id_equipo
      `)
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error en POST /api/equipment:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Actualizar equipo
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id_equipo, modelo, numero_serie, fecha_vencimiento_garantia, estado, id_item, id_tipoequipo } = body
    
    const pool = await getConnection()
    
    const result = await pool.request()
      .input('id_equipo', sql.Int, id_equipo)
      .input('modelo', sql.NVarChar(100), modelo)
      .input('numero_serie', sql.NVarChar(100), numero_serie)
      .input('fecha_vencimiento_garantia', sql.Date, fecha_vencimiento_garantia || null)
      .input('estado', sql.VarChar(50), estado)
      .input('id_item', sql.Int, id_item)
      .input('id_tipoequipo', sql.Int, id_tipoequipo)
      .query(`
        UPDATE Equipo_Adquirido
        SET modelo = @modelo,
            numero_serie = @numero_serie,
            fecha_vencimiento_garantia = @fecha_vencimiento_garantia,
            estado = @estado,
            id_item = @id_item,
            id_tipoequipo = @id_tipoequipo
        WHERE id_equipo = @id_equipo;
        
        SELECT 
          e.*,
          t.nombre_categoria AS tipo_equipo,
          i.descripcion AS descripcion_item
        FROM Equipo_Adquirido e
        INNER JOIN Tipo_Equipo t ON e.id_tipoequipo = t.id_tipoequipo
        LEFT JOIN Item_Orden_De_Compra i ON e.id_item = i.id_item
        WHERE e.id_equipo = @id_equipo
      `)
    
    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Equipo no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    })
    
  } catch (error) {
    console.error('Error en PUT /api/equipment:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar equipo
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
      .input('id_equipo', sql.Int, parseInt(id))
      .query(`
        DELETE FROM Equipo_Adquirido
        WHERE id_equipo = @id_equipo
      `)
    
    return NextResponse.json({
      success: true,
      message: 'Equipo eliminado exitosamente'
    })
    
  } catch (error) {
    console.error('Error en DELETE /api/equipment:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
