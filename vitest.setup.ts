import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Vitest ejecuta cada archivo de test en su propio worker, y globalSetup corre
// en un proceso aparte, así que el DATABASE_URL de test se vuelve a cargar acá
// para asegurar que @/lib/db (que crea el PrismaClient al importarse) apunte
// siempre a prisma/test.db y nunca a prisma/dev.db.
const envTestPath = resolve(__dirname, '.env.test')

if (existsSync(envTestPath)) {
  const contents = readFileSync(envTestPath, 'utf-8')
  for (const line of contents.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^"(.*)"$/, '$1')
    process.env[key] = value
  }
}
