'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Estudiante = {
  EstudianteID: number;
  Nombre: string;
  Apellido: string;
  GradoID: number | null;
  usuario: { Cedula: string } | null;
};

type Grado = {
  GradoID: number;
  Nombre: string;
  Paralelo: string | null;
};

export default function MatriculacionManager({
  grados,
  estudiantes,
}: {
  grados: Grado[];
  estudiantes: Estudiante[];
}) {
  const [selectedGradoId, setSelectedGradoId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (estudianteId: number, newGradoId: number | null) => {
    setLoading(true);
    await fetch('/api/admin/matriculacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estudianteId, gradoId: newGradoId }),
    });
    router.refresh();
    setLoading(false);
  };

  const currentStudents = estudiantes.filter(e => e.GradoID === selectedGradoId);
  const unassignedStudents = estudiantes.filter(e => e.GradoID === null);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Matriculación</h2>
        <p className="mt-2 text-sm text-gray-500">Asigna estudiantes a cursos o desasígnalos.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-gray-900/5 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Curso</label>
        <select
          value={selectedGradoId}
          onChange={(e) => setSelectedGradoId(e.target.value === '' ? '' : parseInt(e.target.value))}
          className="block w-full max-w-sm rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300"
        >
          <option value="">-- Seleccione --</option>
          {grados.map(g => (
            <option key={g.GradoID} value={g.GradoID}>{g.Nombre} {g.Paralelo}</option>
          ))}
        </select>
      </div>

      {selectedGradoId !== '' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Estudiantes Matriculados */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
              Estudiantes en el Curso ({currentStudents.length})
            </h3>
            {currentStudents.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay estudiantes en este curso.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {currentStudents.map(est => (
                  <li key={est.EstudianteID} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{est.Apellido}, {est.Nombre}</p>
                      <p className="text-xs text-gray-500">C.I: {est.usuario?.Cedula}</p>
                    </div>
                    <button
                      onClick={() => handleUpdate(est.EstudianteID, null)}
                      disabled={loading}
                      className="text-xs px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 font-medium transition-colors"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Estudiantes Sin Asignar */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
              Estudiantes Sin Asignar ({unassignedStudents.length})
            </h3>
            {unassignedStudents.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay estudiantes pendientes por asignar.</p>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {unassignedStudents.map(est => (
                  <li key={est.EstudianteID} className="py-3 flex justify-between items-center pr-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{est.Apellido}, {est.Nombre}</p>
                      <p className="text-xs text-gray-500">C.I: {est.usuario?.Cedula}</p>
                    </div>
                    <button
                      onClick={() => handleUpdate(est.EstudianteID, selectedGradoId as number)}
                      disabled={loading}
                      className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 font-medium transition-colors"
                    >
                      Añadir
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
