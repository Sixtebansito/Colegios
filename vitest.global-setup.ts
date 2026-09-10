import { execSync } from 'node:child_process'
import { existsSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'

// Base de datos SQLite descartable para los tests de integración. Nunca toca
// prisma/dev.db (la base de desarrollo/seed, que está commiteada al repo).
const TEST_DB_FILES = ['test.db', 'test.db-journal', 'test.db-shm', 'test.db-wal'].map((f) =>
  resolve(__dirname, 'prisma', f)
)

function cleanup() {
  for (const file of TEST_DB_FILES) {
    if (existsSync(file)) unlinkSync(file)
  }
}

export async function setup() {
  cleanup() // por si quedó un test.db de una corrida anterior interrumpida

  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    cwd: __dirname,
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'inherit',
  })
}

export async function teardown() {
  cleanup()
}
