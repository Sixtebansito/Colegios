# Sistema de Gestión Escolar "Colegios"

Un sistema integral para la gestión académica y administrativa de instituciones educativas, desarrollado con tecnologías web modernas.

## 🚀 Tecnologías

*   **Framework:** [Next.js](https://nextjs.org/) (React)
*   **Base de Datos:** SQL Server
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Autenticación:** JWT (`jose`), `bcryptjs`

## 📦 Características Principales

*   **Gestión de Usuarios y Roles:** Autenticación y autorización para diferentes roles (Administrativos, Profesores, Padres, etc.).
*   **Gestión Académica:** Control de grados, paralelos, materias y estudiantes.
*   **Registro de Calificaciones:** Ingreso y consulta de notas por periodo lectivo.
*   **Solicitudes de Recalificación:** Flujo para que los padres puedan solicitar revisión de notas.
*   **Auditoría:** Registro de cambios en la base de datos para mayor seguridad.
*   **[NUEVO] Sistema de Comunicación (Chat):** (En planificación) Salas de chat integradas para la comunicación en tiempo real entre docentes, alumnos, padres y departamentos administrativos (TI, Contabilidad, Enfermería, etc.).

## ⚙️ Requisitos Previos

*   Node.js (v18 o superior)
*   SQL Server
*   NPM, Yarn o PNPM

## 🛠️ Instalación y Ejecución

1.  **Clonar el repositorio y entrar al directorio:**
    ```bash
    git clone <repositorio>
    cd Colegios
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto y configura tu cadena de conexión a SQL Server:
    ```env
    DATABASE_URL="sqlserver://<HOST>:<PORT>;database=<DB_NAME>;user=<USER>;password=<PASSWORD>;encrypt=true"
    ```

4.  **Sincronizar la base de datos:**
    ```bash
    npx prisma db push
    ```

5.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

6.  Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 🗄️ Estructura de la Base de Datos (Prisma)

El esquema principal incluye:
*   `Usuarios`, `Roles`, `Catalogos` (Gestión de acceso y estados)
*   `Profesores`, `Padres`, `Estudiantes` (Actores del sistema)
*   `Grados`, `Materias`, `Periodos`, `Matriculas` (Estructura académica)
*   `Notas`, `SolicitudesRecalificacion` (Evaluación)
*   `Auditoria` (Logs del sistema)

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, asegúrate de seguir las convenciones de código y documentar los cambios importantes.
