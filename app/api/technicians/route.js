import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET - Obtener todos los técnicos autorizados
export async function GET(request) {
  try {
    const pool = await getConnection()
    
    const result = await pool.request()
      .query(`
        SELECT 
          t.id_tecnico,
          t.nombre,
          t.especialidad,
          t.id_contacto,
          t.id_proveedor,
          p.nombre AS proveedor_nombre,
          c.telefono,
          c.mail,
          c.descripcion AS contacto_descripcion
        FROM Tecnico_Autorizado t
        INNER JOIN Proveedor p ON t.id_proveedor = p.id_proveedor
        INNER JOIN Persona_Contacto c ON t.id_contacto = c.id_contacto
        ORDER BY t.nombre ASC
      `)
    
    return NextResponse.json({
      success: true,
      data: result.recordset
    })
    
  } catch (error) {
    console.error('Error en GET /api/technicians:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo técnico (con persona de contacto)
export async function POST(request) {
  const transaction = new sql.Transaction(await getConnection())
  
  try {
    const body = await request.json()
    const { nombre, especialidad, id_proveedor, telefono, mail, contacto_descripcion } = body
    
    await transaction.begin()
    
    // Obtener siguiente ID para contacto
    const maxContactIdResult = await transaction.request()
      .query('SELECT ISNULL(MAX(id_contacto), 0) + 1 AS next_id FROM Persona_Contacto')
    
    const nextContactId = maxContactIdResult.recordset[0].next_id
    
    // Obtener siguiente ID para técnico
    const maxTechIdResult = await transaction.request()
      .query('SELECT ISNULL(MAX(id_tecnico), 0) + 1 AS next_id FROM Tecnico_Autorizado')
    
    const nextTechId = maxTechIdResult.recordset[0].next_id
    
    // Insertar persona de contacto primero
    await transaction.request()
      .input('id_contacto', sql.Int, nextContactId)
      .input('descripcion', sql.NVarChar(100), contacto_descripcion || null)
      .input('telefono', sql.NVarChar(100), telefono)
      .input('mail', sql.NVarChar(100), mail || null)
      .input('id_tecnico', sql.Int, nextTechId)
      .input('id_proveedor', sql.Int, id_proveedor)
      .query(`
        INSERT INTO Persona_Contacto (id_contacto, descripcion, telefono, mail, id_tecnico, id_proveedor)
        VALUES (@id_contacto, @descripcion, @telefono, @mail, @id_tecnico, @id_proveedor)
      `)
    
    // Insertar técnico
    await transaction.request()
      .input('id_tecnico', sql.Int, nextTechId)
      .input('nombre', sql.NVarChar(100), nombre)
      .input('especialidad', sql.NVarChar(100), especialidad)
      .input('id_contacto', sql.Int, nextContactId)
      .input('id_proveedor', sql.Int, id_proveedor)
      .query(`
        INSERT INTO Tecnico_Autorizado (id_tecnico, nombre, especialidad, id_contacto, id_proveedor)
        VALUES (@id_tecnico, @nombre, @especialidad, @id_contacto, @id_proveedor)
      `)
    
    // Obtener registro completo
    const result = await transaction.request()
      .input('id_tecnico', sql.Int, nextTechId)
      .query(`
        SELECT 
          t.*,
          p.nombre AS proveedor_nombre,
          c.telefono,
          c.mail,
          c.descripcion AS contacto_descripcion
        FROM Tecnico_Autorizado t
        INNER JOIN Proveedor p ON t.id_proveedor = p.id_proveedor
        INNER JOIN Persona_Contacto c ON t.id_contacto = c.id_contacto
        WHERE t.id_tecnico = @id_tecnico
      `)
    
    await transaction.commit()
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    }, { status: 201 })
    
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback:', rollbackError)
    }
    
    console.error('Error en POST /api/technicians:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Actualizar técnico
export async function PUT(request) {
  const transaction = new sql.Transaction(await getConnection())
  
  try {
    const body = await request.json()
    const { id_tecnico, nombre, especialidad, id_proveedor, telefono, mail, contacto_descripcion, id_contacto } = body
    
    await transaction.begin()
    
    // Actualizar persona de contacto
    await transaction.request()
      .input('id_contacto', sql.Int, id_contacto)
      .input('descripcion', sql.NVarChar(100), contacto_descripcion || null)
      .input('telefono', sql.NVarChar(100), telefono)
      .input('mail', sql.NVarChar(100), mail || null)
      .query(`
        UPDATE Persona_Contacto
        SET descripcion = @descripcion,
            telefono = @telefono,
            mail = @mail
        WHERE id_contacto = @id_contacto
      `)
    
    // Actualizar técnico
    const result = await transaction.request()
      .input('id_tecnico', sql.Int, id_tecnico)
      .input('nombre', sql.NVarChar(100), nombre)
      .input('especialidad', sql.NVarChar(100), especialidad)
      .input('id_proveedor', sql.Int, id_proveedor)
      .query(`
        UPDATE Tecnico_Autorizado
        SET nombre = @nombre,
            especialidad = @especialidad,
            id_proveedor = @id_proveedor
        WHERE id_tecnico = @id_tecnico;
        
        SELECT 
          t.*,
          p.nombre AS proveedor_nombre,
          c.telefono,
          c.mail,
          c.descripcion AS contacto_descripcion
        FROM Tecnico_Autorizado t
        INNER JOIN Proveedor p ON t.id_proveedor = p.id_proveedor
        INNER JOIN Persona_Contacto c ON t.id_contacto = c.id_contacto
        WHERE t.id_tecnico = @id_tecnico
      `)
    
    await transaction.commit()
    
    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Técnico no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: result.recordset[0]
    })
    
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback:', rollbackError)
    }
    
    console.error('Error en PUT /api/technicians:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar técnico
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
    
    // Obtener id_contacto antes de eliminar
    const contactResult = await transaction.request()
      .input('id_tecnico', sql.Int, parseInt(id))
      .query(`
        SELECT id_contacto FROM Tecnico_Autorizado WHERE id_tecnico = @id_tecnico
      `)
    
    if (contactResult.recordset.length === 0) {
      await transaction.rollback()
      return NextResponse.json(
        { success: false, error: 'Técnico no encontrado' },
        { status: 404 }
      )
    }
    
    const id_contacto = contactResult.recordset[0].id_contacto
    
    // Eliminar técnico
    await transaction.request()
      .input('id_tecnico', sql.Int, parseInt(id))
      .query(`
        DELETE FROM Tecnico_Autorizado
        WHERE id_tecnico = @id_tecnico
      `)
    
    // Eliminar persona de contacto
    await transaction.request()
      .input('id_contacto', sql.Int, id_contacto)
      .query(`
        DELETE FROM Persona_Contacto
        WHERE id_contacto = @id_contacto
      `)
    
    await transaction.commit()
    
    return NextResponse.json({
      success: true,
      message: 'Técnico eliminado exitosamente'
    })
    
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback:', rollbackError)
    }
    
    console.error('Error en DELETE /api/technicians:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
