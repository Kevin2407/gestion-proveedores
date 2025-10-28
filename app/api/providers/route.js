import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

const baseSelectQuery = `
  SELECT 
    prov.id_proveedor,
    prov.fecha_alta,
    per.id_persona,
    per.nombre,
    per.documento,
    per.correo,
    per.telefono,
    dir.id_direccion,
    dir.calle,
    dir.numero,
    dir.departamento,
    dir.codigo_postal,
    stats.promedio_puntaje,
    stats.total_calificaciones,
    ultima.ultima_puntaje,
    ultima.ultima_comentario,
    ultima.ultima_fecha
  FROM Proveedor prov
    INNER JOIN Persona per ON prov.id_persona = per.id_persona
    LEFT JOIN Direccion dir ON dir.id_persona = per.id_persona
    OUTER APPLY (
      SELECT 
        AVG(CAST(c.puntaje AS FLOAT)) AS promedio_puntaje,
        COUNT(*) AS total_calificaciones
      FROM Calificacion c
      WHERE c.id_proveedor = prov.id_proveedor
    ) stats
    OUTER APPLY (
      SELECT TOP 1
        c.puntaje AS ultima_puntaje,
        c.comentarios AS ultima_comentario,
        c.fecha_evaluacion AS ultima_fecha
      FROM Calificacion c
      WHERE c.id_proveedor = prov.id_proveedor
      ORDER BY c.fecha_evaluacion DESC, c.id_calificacion DESC
    ) ultima
`

function mapProvider(row) {
  return {
    id_proveedor: row.id_proveedor,
    id_persona: row.id_persona,
    id_direccion: row.id_direccion,
    nombre: row.nombre,
    documento: row.documento,
    correo: row.correo,
    telefono: row.telefono,
    fecha_alta: row.fecha_alta,
    calle: row.calle,
    numero: row.numero,
    departamento: row.departamento,
    codigo_postal: row.codigo_postal,
    promedio_puntaje: row.promedio_puntaje !== null ? Number(row.promedio_puntaje) : null,
    total_calificaciones: row.total_calificaciones || 0,
    ultima_puntaje: row.ultima_puntaje,
    ultima_comentario: row.ultima_comentario,
    ultima_fecha: row.ultima_fecha,
  }
}

async function fetchProviders(pool) {
  const result = await pool
    .request()
    .query(`${baseSelectQuery}\n  ORDER BY per.nombre ASC`)

  return result.recordset.map(mapProvider)
}

async function fetchProviderById(pool, id) {
  const result = await pool
    .request()
    .input('id_proveedor', sql.Int, id)
    .query(`${baseSelectQuery}\n  WHERE prov.id_proveedor = @id_proveedor`)

  if (result.recordset.length === 0) {
    return null
  }

  return mapProvider(result.recordset[0])
}

export async function GET(request) {
  try {
    const pool = await getConnection()
    const mode = request.nextUrl.searchParams.get('mode')

    if (mode === 'options') {
      const result = await pool.request().query(`
        SELECT 
          prov.id_proveedor,
          per.nombre
        FROM Proveedor prov
          INNER JOIN Persona per ON prov.id_persona = per.id_persona
        ORDER BY per.nombre ASC
      `)

      return NextResponse.json({
        success: true,
        data: result.recordset,
      })
    }

    const providers = await fetchProviders(pool)

    return NextResponse.json({
      success: true,
      data: providers,
    })
  } catch (error) {
    console.error('Error en GET /api/providers:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const transaction = new sql.Transaction(await getConnection())

  try {
    const {
      nombre,
      documento,
      correo,
      telefono,
      fecha_alta,
      calle,
      numero,
      departamento,
      codigo_postal,
    } = await request.json()

    if (!nombre || !documento || !fecha_alta) {
      return NextResponse.json(
        { success: false, error: 'Los campos nombre, documento y fecha_alta son obligatorios.' },
        { status: 400 }
      )
    }

    const numeroInt = numero !== undefined && numero !== null && `${numero}`.trim() !== '' ? parseInt(numero, 10) : null
    const codigoPostalInt =
      codigo_postal !== undefined && codigo_postal !== null && `${codigo_postal}`.trim() !== ''
        ? parseInt(codigo_postal, 10)
        : null

    if (Number.isNaN(numeroInt) || Number.isNaN(codigoPostalInt)) {
      return NextResponse.json(
        { success: false, error: 'Los campos número y código postal deben ser numéricos.' },
        { status: 400 }
      )
    }

    await transaction.begin()

    const personaResult = await transaction
      .request()
      .input('nombre', sql.NVarChar(100), nombre)
      .input('documento', sql.VarChar(15), documento)
      .input('correo', sql.VarChar(100), correo || null)
      .input('telefono', sql.VarChar(20), telefono || null)
      .query(`
        INSERT INTO Persona (nombre, documento, correo, telefono)
        OUTPUT INSERTED.id_persona
        VALUES (@nombre, @documento, @correo, @telefono)
      `)

    const id_persona = personaResult.recordset[0].id_persona

    const proveedorResult = await transaction
      .request()
      .input('id_persona', sql.Int, id_persona)
      .input('fecha_alta', sql.Date, fecha_alta)
      .query(`
        INSERT INTO Proveedor (id_persona, fecha_alta)
        OUTPUT INSERTED.id_proveedor
        VALUES (@id_persona, @fecha_alta)
      `)

    const id_proveedor = proveedorResult.recordset[0].id_proveedor

    if (calle && numeroInt !== null && codigoPostalInt !== null) {
      await transaction
        .request()
        .input('id_persona', sql.Int, id_persona)
        .input('calle', sql.VarChar(100), calle)
        .input('numero', sql.Int, numeroInt)
        .input('departamento', sql.VarChar(50), departamento || null)
        .input('codigo_postal', sql.Int, codigoPostalInt)
        .query(`
          INSERT INTO Direccion (id_persona, calle, numero, departamento, codigo_postal)
          VALUES (@id_persona, @calle, @numero, @departamento, @codigo_postal)
        `)
    }

    await transaction.commit()

    const pool = await getConnection()
    const provider = await fetchProviderById(pool, id_proveedor)

    return NextResponse.json(
      {
        success: true,
        data: provider,
      },
      { status: 201 }
    )
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback POST /api/providers:', rollbackError)
    }

    console.error('Error en POST /api/providers:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  const transaction = new sql.Transaction(await getConnection())

  try {
    const {
      id_proveedor,
      id_persona,
      id_direccion,
      nombre,
      documento,
      correo,
      telefono,
      fecha_alta,
      calle,
      numero,
      departamento,
      codigo_postal,
    } = await request.json()

    if (!id_proveedor || !id_persona) {
      return NextResponse.json(
        { success: false, error: 'Faltan identificadores de proveedor o persona.' },
        { status: 400 }
      )
    }

    const numeroInt = numero !== undefined && numero !== null && `${numero}`.trim() !== '' ? parseInt(numero, 10) : null
    const codigoPostalInt =
      codigo_postal !== undefined && codigo_postal !== null && `${codigo_postal}`.trim() !== ''
        ? parseInt(codigo_postal, 10)
        : null

    if (Number.isNaN(numeroInt) || Number.isNaN(codigoPostalInt)) {
      return NextResponse.json(
        { success: false, error: 'Los campos número y código postal deben ser numéricos.' },
        { status: 400 }
      )
    }

    await transaction.begin()

    await transaction
      .request()
      .input('id_persona', sql.Int, id_persona)
      .input('nombre', sql.NVarChar(100), nombre || null)
      .input('documento', sql.VarChar(15), documento || null)
      .input('correo', sql.VarChar(100), correo || null)
      .input('telefono', sql.VarChar(20), telefono || null)
      .query(`
        UPDATE Persona
        SET nombre = @nombre,
            documento = @documento,
            correo = @correo,
            telefono = @telefono
        WHERE id_persona = @id_persona
      `)

    if (fecha_alta) {
      await transaction
        .request()
        .input('id_proveedor', sql.Int, id_proveedor)
        .input('fecha_alta', sql.Date, fecha_alta)
        .query(`
          UPDATE Proveedor
          SET fecha_alta = @fecha_alta
          WHERE id_proveedor = @id_proveedor
        `)
    }

    const hasAddressData = calle || numeroInt !== null || departamento || codigoPostalInt !== null

    if (hasAddressData) {
      if (id_direccion) {
        await transaction
          .request()
          .input('id_direccion', sql.Int, id_direccion)
          .input('calle', sql.VarChar(100), calle || null)
          .input('numero', sql.Int, numeroInt)
          .input('departamento', sql.VarChar(50), departamento || null)
          .input('codigo_postal', sql.Int, codigoPostalInt)
          .query(`
            UPDATE Direccion
            SET calle = @calle,
                numero = @numero,
                departamento = @departamento,
                codigo_postal = @codigo_postal
            WHERE id_direccion = @id_direccion
          `)
      } else {
        await transaction
          .request()
          .input('id_persona', sql.Int, id_persona)
          .input('calle', sql.VarChar(100), calle || null)
          .input('numero', sql.Int, numeroInt)
          .input('departamento', sql.VarChar(50), departamento || null)
          .input('codigo_postal', sql.Int, codigoPostalInt)
          .query(`
            INSERT INTO Direccion (id_persona, calle, numero, departamento, codigo_postal)
            VALUES (@id_persona, @calle, @numero, @departamento, @codigo_postal)
          `)
      }
    } else if (id_direccion) {
      await transaction
        .request()
        .input('id_direccion', sql.Int, id_direccion)
        .query(`
          DELETE FROM Direccion
          WHERE id_direccion = @id_direccion
        `)
    }

    await transaction.commit()

    const pool = await getConnection()
    const provider = await fetchProviderById(pool, id_proveedor)

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Proveedor no encontrado después de la actualización.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: provider,
    })
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback PUT /api/providers:', rollbackError)
    }

    console.error('Error en PUT /api/providers:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

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

    const providerResult = await transaction
      .request()
      .input('id_proveedor', sql.Int, parseInt(id, 10))
      .query(`
        SELECT id_persona FROM Proveedor WHERE id_proveedor = @id_proveedor
      `)

    if (providerResult.recordset.length === 0) {
      await transaction.rollback()
      return NextResponse.json(
        { success: false, error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }

    const id_persona = providerResult.recordset[0].id_persona

    await transaction
      .request()
      .input('id_proveedor', sql.Int, parseInt(id, 10))
      .query(`
        DELETE FROM Detalle_OC
        WHERE id_orden IN (
          SELECT id_orden FROM Orden_De_Compra WHERE id_proveedor = @id_proveedor
        )
      `)

    await transaction
      .request()
      .input('id_proveedor', sql.Int, parseInt(id, 10))
      .query(`
        DELETE FROM Orden_De_Compra WHERE id_proveedor = @id_proveedor
      `)

    await transaction
      .request()
      .input('id_proveedor', sql.Int, parseInt(id, 10))
      .query(`
        DELETE FROM Calificacion WHERE id_proveedor = @id_proveedor
      `)

    await transaction
      .request()
      .input('id_proveedor', sql.Int, parseInt(id, 10))
      .query(`
        DELETE FROM Falla_Proveedor WHERE id_proveedor = @id_proveedor
      `)

    await transaction
      .request()
      .input('id_persona', sql.Int, id_persona)
      .query(`
        DELETE FROM Direccion WHERE id_persona = @id_persona
      `)

    await transaction
      .request()
      .input('id_proveedor', sql.Int, parseInt(id, 10))
      .query(`
        DELETE FROM Proveedor WHERE id_proveedor = @id_proveedor
      `)

    await transaction
      .request()
      .input('id_persona', sql.Int, id_persona)
      .query(`
        DELETE FROM Persona WHERE id_persona = @id_persona
      `)

    await transaction.commit()

    return NextResponse.json({
      success: true,
      message: 'Proveedor eliminado exitosamente',
    })
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback DELETE /api/providers:', rollbackError)
    }

    console.error('Error en DELETE /api/providers:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
