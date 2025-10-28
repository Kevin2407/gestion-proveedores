import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

const selectQuery = `
  SELECT 
    t.id_tecnico,
    per.id_persona,
    per.nombre,
    per.documento,
    per.correo,
    per.telefono,
    te.id_especialidad,
    esp.especialidad
  FROM Tecnico t
    INNER JOIN Persona per ON t.id_persona = per.id_persona
    LEFT JOIN Tecnico_Especialidad te ON te.id_tecnico = t.id_tecnico
    LEFT JOIN Especialidad esp ON te.id_especialidad = esp.id_especialidad
`

function mapTechnicians(rows) {
  const techniciansMap = new Map()

  rows.forEach((row) => {
    if (!techniciansMap.has(row.id_tecnico)) {
      techniciansMap.set(row.id_tecnico, {
        id_tecnico: row.id_tecnico,
        id_persona: row.id_persona,
        nombre: row.nombre,
        documento: row.documento,
        correo: row.correo,
        telefono: row.telefono,
        especialidades: [],
      })
    }

    if (row.id_especialidad) {
      techniciansMap.get(row.id_tecnico).especialidades.push({
        id_especialidad: row.id_especialidad,
        nombre: row.especialidad,
      })
    }
  })

  return Array.from(techniciansMap.values())
}

async function fetchTechnicians(pool) {
  const result = await pool
    .request()
    .query(`${selectQuery}\n  ORDER BY per.nombre ASC, esp.especialidad ASC`)

  return mapTechnicians(result.recordset)
}

async function fetchTechnicianById(pool, id) {
  const result = await pool
    .request()
    .input('id_tecnico', sql.Int, id)
    .query(`${selectQuery}\n  WHERE t.id_tecnico = @id_tecnico`)

  const technicians = mapTechnicians(result.recordset)
  return technicians[0]
}

export async function GET() {
  try {
    const pool = await getConnection()
    const technicians = await fetchTechnicians(pool)

    return NextResponse.json({
      success: true,
      data: technicians,
    })
  } catch (error) {
    console.error('Error en GET /api/technicians:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const transaction = new sql.Transaction(await getConnection())

  try {
    const { nombre, documento, correo, telefono, especialidades } = await request.json()

    if (!nombre || !documento) {
      return NextResponse.json(
        { success: false, error: 'Los campos nombre y documento son obligatorios.' },
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
        OUTPUT INSERTED.id_persona AS id_persona
        VALUES (@nombre, @documento, @correo, @telefono)
      `)

    const id_persona = personaResult.recordset[0].id_persona

    const tecnicoResult = await transaction
      .request()
      .input('id_persona', sql.Int, id_persona)
      .query(`
        INSERT INTO Tecnico (id_persona)
        OUTPUT INSERTED.id_tecnico AS id_tecnico
        VALUES (@id_persona)
      `)

    const id_tecnico = tecnicoResult.recordset[0].id_tecnico

    if (Array.isArray(especialidades) && especialidades.length > 0) {
      for (const id_especialidad of especialidades) {
        await transaction
          .request()
          .input('id_tecnico', sql.Int, id_tecnico)
          .input('id_especialidad', sql.Int, id_especialidad)
          .query(`
            INSERT INTO Tecnico_Especialidad (id_tecnico, id_especialidad)
            VALUES (@id_tecnico, @id_especialidad)
          `)
      }
    }

    await transaction.commit()

    const pool = await getConnection()
    const technician = await fetchTechnicianById(pool, id_tecnico)

    return NextResponse.json(
      {
        success: true,
        data: technician,
      },
      { status: 201 }
    )
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback POST /api/technicians:', rollbackError)
    }

    console.error('Error en POST /api/technicians:', error)
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
      id_tecnico,
      id_persona,
      nombre,
      documento,
      correo,
      telefono,
      especialidades,
    } = await request.json()

    if (!id_tecnico || !id_persona) {
      return NextResponse.json(
        { success: false, error: 'Faltan identificadores de técnico o persona.' },
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

    await transaction
      .request()
      .input('id_tecnico', sql.Int, id_tecnico)
      .query(`
        DELETE FROM Tecnico_Especialidad WHERE id_tecnico = @id_tecnico
      `)

    if (Array.isArray(especialidades) && especialidades.length > 0) {
      for (const id_especialidad of especialidades) {
        await transaction
          .request()
          .input('id_tecnico', sql.Int, id_tecnico)
          .input('id_especialidad', sql.Int, id_especialidad)
          .query(`
            INSERT INTO Tecnico_Especialidad (id_tecnico, id_especialidad)
            VALUES (@id_tecnico, @id_especialidad)
          `)
      }
    }

    await transaction.commit()

    const pool = await getConnection()
    const technician = await fetchTechnicianById(pool, id_tecnico)

    if (!technician) {
      return NextResponse.json(
        { success: false, error: 'Técnico no encontrado después de la actualización.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: technician,
    })
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback PUT /api/technicians:', rollbackError)
    }

    console.error('Error en PUT /api/technicians:', error)
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

    const tecnicoResult = await transaction
      .request()
      .input('id_tecnico', sql.Int, parseInt(id, 10))
      .query(`
        SELECT id_persona FROM Tecnico WHERE id_tecnico = @id_tecnico
      `)

    if (tecnicoResult.recordset.length === 0) {
      await transaction.rollback()
      return NextResponse.json(
        { success: false, error: 'Técnico no encontrado' },
        { status: 404 }
      )
    }

    const id_persona = tecnicoResult.recordset[0].id_persona

    await transaction
      .request()
      .input('id_tecnico', sql.Int, parseInt(id, 10))
      .query(`
        DELETE FROM Tecnico_Especialidad WHERE id_tecnico = @id_tecnico
      `)

    await transaction
      .request()
      .input('id_tecnico', sql.Int, parseInt(id, 10))
      .query(`
        DELETE FROM Tecnico WHERE id_tecnico = @id_tecnico
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
      message: 'Técnico eliminado exitosamente',
    })
  } catch (error) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error en rollback DELETE /api/technicians:', rollbackError)
    }

    console.error('Error en DELETE /api/technicians:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
