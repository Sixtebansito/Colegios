import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.roleId !== 1) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const resolvedParams = await context.params;
    const horarioId = parseInt(resolvedParams.id)
    const formData = await request.formData()
    const gradoId = formData.get('gradoId') as string

    await prisma.horarios.delete({
      where: { HorarioID: horarioId }
    })

    return NextResponse.redirect(new URL(`/admin/horarios?grado=${gradoId}`, request.url), 303)
  } catch (error) {
    console.error('Error deleting horario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
