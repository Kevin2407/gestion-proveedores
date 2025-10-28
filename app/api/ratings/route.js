import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

const selectQuery = `
  SELECT 
    c.id_calificacion,
    c.fecha_evaluacion,
    c.puntaje,
    c.comentarios,
    c.id_proveedor,
    per.nombre AS proveedor_nombre
  FROM Calificacion c
    INNER JOIN Proveedor p ON c.id_proveedor = p.id_proveedor
    INNER JOIN Persona per ON p.id_persona = per.id_persona
`

async function fetchRatingById(pool, id) {
  const result = await pool
    .request()
    .input('id_calificacion', sql.Int, id)
    .query(`${selectQuery}\n  WHERE c.id_calificacion = @id_calificacion`)

  return result.recordset[0]
}

export async function GET() {
  try {
    const pool = await getConnection()

    const result = await pool
      .request()
      .query(`${selectQuery}\n  ORDER BY c.fecha_evaluacion DESC, c.id_calificacion DESC`)

    return NextResponse.json({
      success: true,
      data: result.recordset,
    })
  } catch (error) {
    console.error('Error en GET /api/ratings:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { fecha_evaluacion, puntaje, comentarios, id_proveedor } = await request.json()

    if (!fecha_evaluacion || !puntaje || !id_proveedor) {
      return NextResponse.json(
        { success: false, error: 'Los campos fecha_evaluacion, puntaje e id_proveedor son obligatorios.' },
        { status: 400 }
      )
    }

    const pool = await getConnection()

    const insertResult = await pool
      .request()
      .input('fecha_evaluacion', sql.Date, fecha_evaluacion)
      .input('puntaje', sql.TinyInt, puntaje)
      .input('comentarios', sql.NVarChar(255), comentarios || null)
      .input('id_proveedor', sql.Int, id_proveedor)
      .query(`
        INSERT INTO Calificacion (fecha_evaluacion, puntaje, comentarios, id_proveedor)
        OUTPUT INSERTED.id_calificacion AS id_calificacion
        VALUES (@fecha_evaluacion, @puntaje, @comentarios, @id_proveedor)
      `)

    const rating = await fetchRatingById(pool, insertResult.recordset[0].id_calificacion)

    return NextResponse.json(
      {
        success: true,
        data: rating,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en POST /api/ratings:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const { id_calificacion, fecha_evaluacion, puntaje, comentarios, id_proveedor } = await request.json()

    if (!id_calificacion) {
      return NextResponse.json(
        { success: false, error: 'id_calificacion es obligatorio.' },
        { status: 400 }
      )
    }

    const pool = await getConnection()

    const updateResult = await pool
      .request()
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
        WHERE id_calificacion = @id_calificacion
      `)

    if (updateResult.rowsAffected[0] === 0) {
      return NextResponse.json(
        { success: false, error: 'Calificación no encontrada' },
        { status: 404 }
      )
    }

    const rating = await fetchRatingById(pool, id_calificacion)

    return NextResponse.json({
      success: true,
      data: rating,
    })
  } catch (error) {
    console.error('Error en PUT /api/ratings:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

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

    const deleteResult = await pool
      .request()
      .input('id_calificacion', sql.Int, parseInt(id, 10))
      .query(`
        DELETE FROM Calificacion WHERE id_calificacion = @id_calificacion
      `)

    if (deleteResult.rowsAffected[0] === 0) {
      return NextResponse.json(
        { success: false, error: 'Calificación no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Calificación eliminada exitosamente',
    })
  } catch (error) {
    console.error('Error en DELETE /api/ratings:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
