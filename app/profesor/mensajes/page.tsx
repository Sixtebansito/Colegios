import { getSession } from '@/lib/auth'

export default async function ProfesorMensajesPage() {
  const session = await getSession()
  return (
    <div>
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">
        Mensajes
      </h2>
      <div className="bg-white p-12 text-center shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <p className="text-gray-500">
          El módulo de mensajería está actualmente en construcción para la nueva plataforma Next.js.
        </p>
      </div>
    </div>
  )
}
