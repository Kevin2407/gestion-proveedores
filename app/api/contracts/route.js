import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET - Obtener todos los contratos
export async function GET(request) {
  try {
    const pool = await getConnection()
    
    const result = await pool.request()
      .query(`
        SELECT 
          c.id_contrato,
          c.nombre_contrato,
          c.fecha_inicio,
          c.fecha_vencimiento,
          c.monto_anual,
          c.ruta_archivo,
          c.id_proveedor,
          p.nombre AS proveedor_nombre
        FROM Contrato c
        INNER JOIN Proveedor p ON c.id_proveedor = p.id_proveedor
        ORDER BY c.fecha_inicio DESC
      `)
    
    return NextResponse.json({
      success: true,
      data: result.recordset
    })
    
  } catch (error) {
    console.error('Error en GET /api/contracts:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo contrato
export async function POST(request) {
  try {
    const body = await request.json()
    const { nombre_contrato, fecha_inicio, fecha_vencimiento, monto_anual, ruta_archivo, id_proveedor } = body
    
    const pool = await getConnection()
    
    // Obtener el siguiente ID
    const maxIdResult = await pool.request()
      .query('SELECT ISNULL(MAX(id_contrato), 0) + 1 AS next_id FROM Contrato')
    
    const nextId = maxIdResult.recordset[0].next_id
    
    const result = await pool.request()
      .input('id_contrato', sql.Int, nextId)
      .input('nombre_contrato', sql.NVarChar(100), nombre_contrato)
      .input('fecha_inicio', sql.Date, fecha_inicio)
      .input('fecha_vencimiento', sql.Date, fecha_vencimiento)
      .input('monto_anual', sql.Decimal(12, 2), monto_anual)
      .input('ruta_archivo', sql.VarChar(255), ruta_archivo || null)
      .input('id_proveedor', sql.Int, id_proveedor)
      .query(`
        INSERT INTO Contrato (id_contrato, nombre_contrato, fecha_inicio, fecha_vencimiento, monto_anual, ruta_archivo, id_proveedor)
        VALUES (@id_contrato, @nombre_contrato, @fecha_inicio, @fecha_vencimiento, @monto_anual, @ruta_archivo, @id_proveedor);
        
        SELECT 
          c.*,
          p.nombre AS proveedor_nombre
        FROM Contrato c
        INNER JOIN Proveedor p ON c.id_proveedor = p.id_proveedor
        WHERE c.id_contrato = @id_contrato
      `)
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error en POST /api/contracts:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Actualizar contrato
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id_contrato, nombre_contrato, fecha_inicio, fecha_vencimiento, monto_anual, ruta_archivo, id_proveedor } = body
    
    const pool = await getConnection()
    
    const result = await pool.request()
      .input('id_contrato', sql.Int, id_contrato)
      .input('nombre_contrato', sql.NVarChar(100), nombre_contrato)
      .input('fecha_inicio', sql.Date, fecha_inicio)
      .input('fecha_vencimiento', sql.Date, fecha_vencimiento)
      .input('monto_anual', sql.Decimal(12, 2), monto_anual)
      .input('ruta_archivo', sql.VarChar(255), ruta_archivo || null)
      .input('id_proveedor', sql.Int, id_proveedor)
      .query(`
        UPDATE Contrato
        SET nombre_contrato = @nombre_contrato,
            fecha_inicio = @fecha_inicio,
            fecha_vencimiento = @fecha_vencimiento,
            monto_anual = @monto_anual,
            ruta_archivo = @ruta_archivo,
            id_proveedor = @id_proveedor
        WHERE id_contrato = @id_contrato;
        
        SELECT 
          c.*,
          p.nombre AS proveedor_nombre
        FROM Contrato c
        INNER JOIN Proveedor p ON c.id_proveedor = p.id_proveedor
        WHERE c.id_contrato = @id_contrato
      `)
    
    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contrato no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    })
    
  } catch (error) {
    console.error('Error en PUT /api/contracts:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar contrato
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
      .input('id_contrato', sql.Int, parseInt(id))
      .query(`
        DELETE FROM Contrato
        WHERE id_contrato = @id_contrato
      `)
    
    return NextResponse.json({
      success: true,
      message: 'Contrato eliminado exitosamente'
    })
    
  } catch (error) {
    console.error('Error en DELETE /api/contracts:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
