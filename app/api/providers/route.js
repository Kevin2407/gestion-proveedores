import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET - Obtener todos los proveedores
export async function GET(request) {
  try {
    const pool = await getConnection()
    
    const result = await pool.request()
      .query(`
        SELECT 
          id_proveedor,
          nombre,
          cuit,
          fecha_alta
        FROM Proveedor
        ORDER BY nombre ASC
      `)
    
    return NextResponse.json({
      success: true,
      data: result.recordset
    })
    
  } catch (error) {
    console.error('Error en GET /api/providers:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo proveedor
export async function POST(request) {
  try {
    const body = await request.json()
    const { nombre, cuit, fecha_alta } = body
    
    const pool = await getConnection()
    
    // Obtener el siguiente ID disponible
    const maxIdResult = await pool.request()
      .query('SELECT ISNULL(MAX(id_proveedor), 0) + 1 AS next_id FROM Proveedor')
    
    const nextId = maxIdResult.recordset[0].next_id
    
    const result = await pool.request()
      .input('id_proveedor', sql.Int, nextId)
      .input('nombre', sql.NVarChar(100), nombre)
      .input('cuit', sql.NVarChar(20), cuit)
      .input('fecha_alta', sql.Date, fecha_alta)
      .query(`
        INSERT INTO Proveedor (id_proveedor, nombre, cuit, fecha_alta)
        VALUES (@id_proveedor, @nombre, @cuit, @fecha_alta);
        
        SELECT * FROM Proveedor WHERE id_proveedor = @id_proveedor
      `)
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error en POST /api/providers:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Actualizar proveedor
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id_proveedor, nombre, cuit, fecha_alta } = body
    
    const pool = await getConnection()
    
    const result = await pool.request()
      .input('id_proveedor', sql.Int, id_proveedor)
      .input('nombre', sql.NVarChar(100), nombre)
      .input('cuit', sql.NVarChar(20), cuit)
      .input('fecha_alta', sql.Date, fecha_alta)
      .query(`
        UPDATE Proveedor
        SET nombre = @nombre,
            cuit = @cuit,
            fecha_alta = @fecha_alta
        WHERE id_proveedor = @id_proveedor;
        
        SELECT * FROM Proveedor WHERE id_proveedor = @id_proveedor
      `)
    
    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    })
    
  } catch (error) {
    console.error('Error en PUT /api/providers:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar proveedor
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
      .input('id_proveedor', sql.Int, parseInt(id))
      .query(`
        DELETE FROM Proveedor
        WHERE id_proveedor = @id_proveedor
      `)
    
    return NextResponse.json({
      success: true,
      message: 'Proveedor eliminado exitosamente'
    })
    
  } catch (error) {
    console.error('Error en DELETE /api/providers:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
