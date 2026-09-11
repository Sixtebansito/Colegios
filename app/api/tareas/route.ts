import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.roleId !== 2) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const materiaId = parseInt(formData.get('materiaId') as string)
    const periodoId = parseInt(formData.get('periodoId') as string)
    const titulo = formData.get('titulo') as string
    const descripcion = formData.get('descripcion') as string
    const tipo = formData.get('tipo') as string
    const porcentaje = parseFloat(formData.get('porcentaje') as string)
    const fechaVencimiento = formData.get('fechaVencimiento') as string

    if (!materiaId || !periodoId || !titulo || isNaN(porcentaje)) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    await prisma.tareas.create({
      data: {
        MateriaID: materiaId,
        PeriodoID: periodoId,
        Titulo: titulo,
        Descripcion: descripcion || null,
        Tipo: tipo,
        Porcentaje: porcentaje,
        FechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null
      }
    })

    // Redirect back to the tareas list
    return NextResponse.redirect(new URL(`/profesor/tareas?materia=${materiaId}&periodo=${periodoId}`, request.url), 303)
  } catch (error) {
    console.error('Error creating tarea:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
