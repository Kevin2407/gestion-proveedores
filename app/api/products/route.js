import { getConnection, sql } from '@/lib/db'
import { NextResponse } from 'next/server'

const selectQuery = `
  SELECT 
    id_producto,
    nombre_producto,
    descripcion
  FROM Producto
`

async function fetchProductById(pool, id) {
  const result = await pool
    .request()
    .input('id_producto', sql.Int, id)
    .query(`${selectQuery}\n  WHERE id_producto = @id_producto`)

  return result.recordset[0]
}

export async function GET() {
  try {
    const pool = await getConnection()

    const result = await pool
      .request()
      .query(`${selectQuery}\n  ORDER BY nombre_producto ASC`)

    return NextResponse.json({
      success: true,
      data: result.recordset,
    })
  } catch (error) {
    console.error('Error en GET /api/products:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { nombre_producto, descripcion } = await request.json()

    if (!nombre_producto) {
      return NextResponse.json(
        { success: false, error: 'El nombre del producto es obligatorio.' },
        { status: 400 }
      )
    }

    const pool = await getConnection()

    const insertResult = await pool
      .request()
      .input('nombre_producto', sql.VarChar(100), nombre_producto)
      .input('descripcion', sql.VarChar(500), descripcion || null)
      .query(`
        INSERT INTO Producto (nombre_producto, descripcion)
        OUTPUT INSERTED.id_producto AS id_producto
        VALUES (@nombre_producto, @descripcion)
      `)

    const product = await fetchProductById(pool, insertResult.recordset[0].id_producto)

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en POST /api/products:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const { id_producto, nombre_producto, descripcion } = await request.json()

    if (!id_producto) {
      return NextResponse.json(
        { success: false, error: 'id_producto es obligatorio.' },
        { status: 400 }
      )
    }

    const pool = await getConnection()

    const updateResult = await pool
      .request()
      .input('id_producto', sql.Int, id_producto)
      .input('nombre_producto', sql.VarChar(100), nombre_producto || null)
      .input('descripcion', sql.VarChar(500), descripcion || null)
      .query(`
        UPDATE Producto
        SET nombre_producto = @nombre_producto,
            descripcion = @descripcion
        WHERE id_producto = @id_producto
      `)

    if (updateResult.rowsAffected[0] === 0) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    const product = await fetchProductById(pool, id_producto)

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error en PUT /api/products:', error)
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
      .input('id_producto', sql.Int, parseInt(id, 10))
      .query(`
        DELETE FROM Producto WHERE id_producto = @id_producto
      `)

    if (deleteResult.rowsAffected[0] === 0) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado exitosamente',
    })
  } catch (error) {
    console.error('Error en DELETE /api/products:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
