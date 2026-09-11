import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.roleId !== 1) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const gradoId = parseInt(formData.get('gradoId') as string)
    const materiaId = parseInt(formData.get('materiaId') as string)
    const dia = formData.get('dia') as string
    const horaInicio = formData.get('horaInicio') as string
    const horaFin = formData.get('horaFin') as string
    const profesorId = parseInt(formData.get('profesorId') as string)

    if (!gradoId || !materiaId || !dia || !horaInicio || !horaFin || !profesorId) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Actualizar la materia para asignar el profesor
    await prisma.materias.update({
      where: { MateriaID: materiaId },
      data: { ProfesorID: profesorId }
    })

    await prisma.horarios.create({
      data: {
        GradoID: gradoId,
        MateriaID: materiaId,
        DiaSemana: dia,
        HoraInicio: horaInicio,
        HoraFin: horaFin
      }
    })

    return NextResponse.redirect(new URL(`/admin/horarios?grado=${gradoId}`, request.url), 303)
  } catch (error) {
    console.error('Error creating horario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
