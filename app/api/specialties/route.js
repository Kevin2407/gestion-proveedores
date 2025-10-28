import { getConnection } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await getConnection()

    const result = await pool
      .request()
      .query(`
        SELECT 
          id_especialidad,
          especialidad
        FROM Especialidad
        ORDER BY especialidad ASC
      `)

    return NextResponse.json({
      success: true,
      data: result.recordset,
    })
  } catch (error) {
    console.error('Error en GET /api/specialties:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
