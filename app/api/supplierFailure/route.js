import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

const TABLE_NAME = 'Falla_Proveedor'

const COLUMN_CANDIDATES = {
  id: ['id_falla', 'id_incidencia', 'id_falla_proveedor', 'id'],
  provider: ['id_proveedor'],
  description: ['descripcion', 'detalle', 'observaciones', 'motivo'],
  date: ['fecha_registro', 'fecha_falla', 'fecha_reporte'],
  status: ['estado', 'estatus', 'situacion'],
  severity: ['criticidad', 'nivel_criticidad', 'gravedad', 'impacto'],
  actions: ['acciones', 'acciones_correctivas', 'acciones_tomadas', 'resolucion', 'observaciones', 'observaciones_cierre'],
  resolutionDate: ['fecha_resolucion', 'fecha_cierre', 'fecha_solucion'],
}

let cachedSchema = null

const wrapColumn = (column) => `[${column}]`
const columnRef = (alias, column) => `${alias}.${wrapColumn(column)}`

function findColumn(columns, candidates) {
  return candidates.find((candidate) => columns.includes(candidate)) || null
}

async function resolveSchema(pool) {
  if (cachedSchema) {
    return cachedSchema
  }

  const result = await pool
    .request()
    .query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${TABLE_NAME}'
    `)

  const columns = result.recordset.map((row) => row.COLUMN_NAME)

  if (columns.length === 0) {
    throw new Error(`No se encontraron columnas para la tabla ${TABLE_NAME}`)
  }

  const schema = {
    id: findColumn(columns, COLUMN_CANDIDATES.id),
    provider: findColumn(columns, COLUMN_CANDIDATES.provider),
    description: findColumn(columns, COLUMN_CANDIDATES.description),
    date: findColumn(columns, COLUMN_CANDIDATES.date),
    status: findColumn(columns, COLUMN_CANDIDATES.status),
    severity: findColumn(columns, COLUMN_CANDIDATES.severity),
    actions: findColumn(columns, COLUMN_CANDIDATES.actions),
    resolutionDate: findColumn(columns, COLUMN_CANDIDATES.resolutionDate),
  }

  if (!schema.provider) {
    throw new Error('La tabla Falla_Proveedor debe tener la columna id_proveedor')
  }

  if (!schema.id) {
    throw new Error('La tabla Falla_Proveedor debe tener una columna identificadora (por ejemplo id_falla)')
  }

  cachedSchema = schema
  return schema
}

function mapIncident(row, schema) {
  return {
    id_falla: schema.id ? row[schema.id] : null,
    id_proveedor: schema.provider ? row[schema.provider] : null,
    proveedor_nombre: row.proveedor_nombre || null,
    proveedor_correo: row.proveedor_correo || null,
    proveedor_telefono: row.proveedor_telefono || null,
    descripcion: schema.description ? row[schema.description] : null,
    fecha_registro: schema.date ? row[schema.date] : null,
    estado: schema.status ? row[schema.status] : null,
    criticidad: schema.severity ? row[schema.severity] : null,
    acciones: schema.actions ? row[schema.actions] : null,
    fecha_resolucion: schema.resolutionDate ? row[schema.resolutionDate] : null,
  }
}

async function fetchIncidentById(pool, schema, id) {
  const request = pool.request().input('id', sql.Int, id)

  const query = `
    SELECT 
      f.*,
      per.nombre AS proveedor_nombre,
      per.correo AS proveedor_correo,
      per.telefono AS proveedor_telefono
    FROM ${TABLE_NAME} f
      INNER JOIN Proveedor p ON ${columnRef('f', schema.provider)} = p.id_proveedor
      INNER JOIN Persona per ON p.id_persona = per.id_persona
    WHERE ${columnRef('f', schema.id)} = @id
  `

  const result = await request.query(query)

  if (result.recordset.length === 0) {
    return null
  }

  return mapIncident(result.recordset[0], schema)
}

function normalizeDate(value) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toISOString().slice(0, 10)
}

export async function GET(request) {
  try {
    const pool = await getConnection()
    const schema = await resolveSchema(pool)
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode')
    const id = searchParams.get('id')

    if (mode === 'schema') {
      return NextResponse.json({
        success: true,
        data: {
          hasDescription: Boolean(schema.description),
          hasDate: Boolean(schema.date),
          hasStatus: Boolean(schema.status),
          hasSeverity: Boolean(schema.severity),
          hasActions: Boolean(schema.actions),
          hasResolutionDate: Boolean(schema.resolutionDate),
        },
      })
    }

    if (id) {
      const incident = await fetchIncidentById(pool, schema, Number(id))

      if (!incident) {
        return NextResponse.json(
          { success: false, error: 'Incidencia no encontrada' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: incident })
    }

    const orderPieces = []
    if (schema.date) {
      orderPieces.push(`${columnRef('f', schema.date)} DESC`)
    }
    if (schema.id) {
      orderPieces.push(`${columnRef('f', schema.id)} DESC`)
    }
    const orderBy = orderPieces.length ? `ORDER BY ${orderPieces.join(', ')}` : ''

    const query = `
      SELECT 
        f.*,
        per.nombre AS proveedor_nombre,
        per.correo AS proveedor_correo,
        per.telefono AS proveedor_telefono
      FROM ${TABLE_NAME} f
        INNER JOIN Proveedor p ON ${columnRef('f', schema.provider)} = p.id_proveedor
        INNER JOIN Persona per ON p.id_persona = per.id_persona
      ${orderBy}
    `

    const result = await pool.request().query(query)

    return NextResponse.json({
      success: true,
      data: result.recordset.map((row) => mapIncident(row, schema)),
    })
  } catch (error) {
    console.error('Error en GET /api/supplierFailure:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  const pool = await getConnection()
  const schema = await resolveSchema(pool)
  const transaction = new sql.Transaction(pool)

  try {
    const body = await request.json()
    const id_proveedor = body.id_proveedor ? Number(body.id_proveedor) : null
    const descripcion = body.descripcion?.toString().trim() || null
    const estado = body.estado?.toString().trim() || null
    const criticidad = body.criticidad?.toString().trim() || null
    const acciones = body.acciones?.toString().trim() || null
    const rawFechaRegistro = body.fecha_registro || body.fecha
    const rawFechaResolucion = body.fecha_resolucion || body.fecha_cierre
    const fecha_registro = normalizeDate(rawFechaRegistro)
    const fecha_resolucion = normalizeDate(rawFechaResolucion)

    if (!id_proveedor) {
      return NextResponse.json(
        { success: false, error: 'El proveedor es obligatorio' },
        { status: 400 }
      )
    }

    if (schema.description && !descripcion) {
      return NextResponse.json(
        { success: false, error: 'La descripción de la falla es obligatoria' },
        { status: 400 }
      )
    }

    if (schema.date && !fecha_registro) {
      return NextResponse.json(
        { success: false, error: 'La fecha de registro es obligatoria' },
        { status: 400 }
      )
    }

    await transaction.begin()

    const requestTx = transaction.request()

    const columns = [wrapColumn(schema.provider)]
    const values = ['@id_proveedor']
    requestTx.input('id_proveedor', sql.Int, id_proveedor)

    if (schema.description) {
      columns.push(wrapColumn(schema.description))
      values.push('@descripcion')
      requestTx.input('descripcion', sql.NVarChar(sql.MAX), descripcion)
    }

    if (schema.date) {
      columns.push(wrapColumn(schema.date))
      values.push('@fecha_registro')
      requestTx.input('fecha_registro', sql.Date, fecha_registro)
    }

    if (schema.status) {
      columns.push(wrapColumn(schema.status))
      values.push('@estado')
      requestTx.input('estado', sql.VarChar(50), estado || null)
    }

    if (schema.severity) {
      columns.push(wrapColumn(schema.severity))
      values.push('@criticidad')
      requestTx.input('criticidad', sql.VarChar(50), criticidad || null)
    }

    if (schema.actions) {
      columns.push(wrapColumn(schema.actions))
      values.push('@acciones')
      requestTx.input('acciones', sql.NVarChar(sql.MAX), acciones || null)
    }

    if (schema.resolutionDate) {
      columns.push(wrapColumn(schema.resolutionDate))
      values.push('@fecha_resolucion')
      requestTx.input('fecha_resolucion', sql.Date, fecha_resolucion)
    }

    const insertQuery = `
      INSERT INTO ${TABLE_NAME} (${columns.join(', ')})
      OUTPUT INSERTED.${wrapColumn(schema.id)}
      VALUES (${values.join(', ')})
    `

    const insertResult = await requestTx.query(insertQuery)
    const newId = insertResult.recordset[0][schema.id]

    await transaction.commit()

    const incident = await fetchIncidentById(pool, schema, newId)

    return NextResponse.json(
      { success: true, data: incident },
      { status: 201 }
    )
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback POST /api/supplierFailure:', rollbackError)
    }

    console.error('Error en POST /api/supplierFailure:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  const pool = await getConnection()
  const schema = await resolveSchema(pool)
  const transaction = new sql.Transaction(pool)

  try {
    const body = await request.json()
    const id = body.id_falla || body.id || body.id_incidencia

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'El identificador de la incidencia es obligatorio' },
        { status: 400 }
      )
    }

    const providerProvided = Object.prototype.hasOwnProperty.call(body, 'id_proveedor')
    const descripcionProvided = Object.prototype.hasOwnProperty.call(body, 'descripcion')
    const estadoProvided = Object.prototype.hasOwnProperty.call(body, 'estado')
    const criticidadProvided = Object.prototype.hasOwnProperty.call(body, 'criticidad')
    const accionesProvided = Object.prototype.hasOwnProperty.call(body, 'acciones')
    const fechaRegistroProvided = Object.prototype.hasOwnProperty.call(body, 'fecha_registro') ||
      Object.prototype.hasOwnProperty.call(body, 'fecha')
    const fechaResolucionProvided = Object.prototype.hasOwnProperty.call(body, 'fecha_resolucion') ||
      Object.prototype.hasOwnProperty.call(body, 'fecha_cierre')

    await transaction.begin()

    const requestTx = transaction.request().input('id', sql.Int, Number(id))
    const updates = []

    if (schema.provider && providerProvided) {
      const id_proveedor = body.id_proveedor ? Number(body.id_proveedor) : null
      updates.push(`${wrapColumn(schema.provider)} = @id_proveedor`)
      requestTx.input('id_proveedor', sql.Int, id_proveedor)
    }

    if (schema.description && descripcionProvided) {
      const descripcion = body.descripcion?.toString().trim() || null
      updates.push(`${wrapColumn(schema.description)} = @descripcion`)
      requestTx.input('descripcion', sql.NVarChar(sql.MAX), descripcion)
    }

    if (schema.date && fechaRegistroProvided) {
      const fecha = normalizeDate(body.fecha_registro || body.fecha)
      updates.push(`${wrapColumn(schema.date)} = @fecha_registro`)
      requestTx.input('fecha_registro', sql.Date, fecha)
    }

    if (schema.status && estadoProvided) {
      const estado = body.estado?.toString().trim() || null
      updates.push(`${wrapColumn(schema.status)} = @estado`)
      requestTx.input('estado', sql.VarChar(50), estado)
    }

    if (schema.severity && criticidadProvided) {
      const criticidad = body.criticidad?.toString().trim() || null
      updates.push(`${wrapColumn(schema.severity)} = @criticidad`)
      requestTx.input('criticidad', sql.VarChar(50), criticidad)
    }

    if (schema.actions && accionesProvided) {
      const acciones = body.acciones?.toString().trim() || null
      updates.push(`${wrapColumn(schema.actions)} = @acciones`)
      requestTx.input('acciones', sql.NVarChar(sql.MAX), acciones)
    }

    if (schema.resolutionDate && fechaResolucionProvided) {
      const fecha = normalizeDate(body.fecha_resolucion || body.fecha_cierre)
      updates.push(`${wrapColumn(schema.resolutionDate)} = @fecha_resolucion`)
      requestTx.input('fecha_resolucion', sql.Date, fecha)
    }

    if (updates.length === 0) {
      await transaction.rollback()
      return NextResponse.json(
        { success: false, error: 'No se proporcionaron campos para actualizar' },
        { status: 400 }
      )
    }

    const updateQuery = `
      UPDATE ${TABLE_NAME}
      SET ${updates.join(', ')}
      WHERE ${wrapColumn(schema.id)} = @id
    `

    const updateResult = await requestTx.query(updateQuery)

    if (updateResult.rowsAffected[0] === 0) {
      await transaction.rollback()
      return NextResponse.json(
        { success: false, error: 'Incidencia no encontrada' },
        { status: 404 }
      )
    }

    await transaction.commit()

    const incident = await fetchIncidentById(pool, schema, Number(id))

    if (!incident) {
      return NextResponse.json(
        { success: false, error: 'Incidencia no encontrada después de actualizar' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: incident })
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback PUT /api/supplierFailure:', rollbackError)
    }

    console.error('Error en PUT /api/supplierFailure:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  const pool = await getConnection()
  const schema = await resolveSchema(pool)

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'El identificador es obligatorio' },
        { status: 400 }
      )
    }

    const deleteResult = await pool
      .request()
      .input('id', sql.Int, Number(id))
      .query(`
        DELETE FROM ${TABLE_NAME}
        WHERE ${wrapColumn(schema.id)} = @id
      `)

    if (deleteResult.rowsAffected[0] === 0) {
      return NextResponse.json(
        { success: false, error: 'Incidencia no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/supplierFailure:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
