'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NuevoReportePage() {
  const router = useRouter();
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    EstudianteID: '',
    Motivo: '',
    Gravedad: 'Leve',
    Comentarios: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch students
    fetch('/api/estudiantes/all')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEstudiantes(data);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await fetch('/api/reportes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      router.push('/inspector');
      router.refresh();
    } else {
      alert('Error al enviar reporte');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/inspector" className="text-indigo-600 font-medium hover:underline">&larr; Volver</Link>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Reporte Disciplinario</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 p-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label className="block text-sm font-medium leading-6 text-gray-900">Estudiante Implicado</label>
            <div className="mt-2">
              <select
                required
                value={formData.EstudianteID}
                onChange={e => setFormData({ ...formData, EstudianteID: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              >
                <option value="">Selecciona un estudiante</option>
                {estudiantes.map(est => (
                  <option key={est.EstudianteID} value={est.EstudianteID}>
                    {est.Apellido} {est.Nombre} ({est.grado?.Nombre || 'Sin curso'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-sm font-medium leading-6 text-gray-900">Gravedad</label>
            <div className="mt-2 flex gap-4">
              {['Leve', 'Moderada', 'Grave'].map(grav => (
                <label key={grav} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="gravedad"
                    value={grav}
                    checked={formData.Gravedad === grav}
                    onChange={e => setFormData({ ...formData, Gravedad: e.target.value })}
                    className="text-indigo-600 focus:ring-indigo-600 h-4 w-4"
                  />
                  {grav}
                </label>
              ))}
            </div>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">Motivo de la Falta</label>
            <div className="mt-2">
              <input
                required
                type="text"
                placeholder="Ej: Uso de celular en clase, Falta de respeto, etc."
                value={formData.Motivo}
                onChange={e => setFormData({ ...formData, Motivo: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">Detalles Adicionales</label>
            <div className="mt-2">
              <textarea
                rows={4}
                value={formData.Comentarios}
                onChange={e => setFormData({ ...formData, Comentarios: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-600">Escribe el contexto y las observaciones sobre la incidencia. Este reporte será enviado al Rectorado.</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-6">
          <Link href="/inspector" className="text-sm font-semibold leading-6 text-gray-900">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        </div>
      </form>
    </div>
  )
}
