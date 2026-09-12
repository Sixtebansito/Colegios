import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'
import { matricularEstudiante } from '@/lib/matriculas'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.roleId !== 1) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { estudianteId, gradoId } = await request.json()

    await prisma.$transaction(async (tx) => {
      await matricularEstudiante(tx, { estudianteId, gradoId })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating matricula:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
