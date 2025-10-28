# Sistema de Gestión de Proveedores

Aplicación web creada con Next.js para administrar proveedores, órdenes de compra y calificaciones, mostrando reportes asociados a las consignas del trabajo práctico 6 de la materia Implementacion de Bases de datos (consultas con subqueries, ejecución del stored procedure transaccional y auditoría mediante trigger).

## Alumnos
- **Ceballos, Maria Emilia** - 56442
- **Martin, Kevin** - 53315
- **Longhino, Matias Gastón** - 53302
- **Darelli, Damián Agustín** - 52781

## Características principales
- Reportes dedicados a:
  - Proveedor con la última calificación más alta.
  - Proveedores sin fallas registradas.
  - Evidencia de ejecución del `SP_RegistrarOrden`.
  - Auditoría generada por el trigger sobre `Orden_De_Compra`.
- Interfaz que permite lanzar el stored procedure y visualizar el resultado.
- APIs en Next.js conectadas a SQL Server mediante `mssql`.

## Requisitos previos
- Node.js 18+ y pnpm (`npm install -g pnpm`).
- SQL Server disponible en la misma máquina (por ejemplo, Docker con `mcr.microsoft.com/mssql/server:2022-latest`).
- Base de datos, tablas, stored procedure y trigger ya creados.

## Configuración
1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   pnpm install
   ```
3. Crear el archivo `.env.local`:
   ```env
   DB_SERVER=localhost
   DB_PORT=1433
   DB_DATABASE=TuBaseDeDatos
   DB_USER=sa
   DB_PASSWORD=TuPasswordSegura
   DB_ENCRYPT=false
   ```
   Ajustar los valores según la configuración de SQL Server. Si usas Docker, expón el puerto 1433 y verifica que `sa` esté habilitado.

## Conexión a la base de datos
- Verificar que SQL Server esté ejecutándose (`docker ps` o el método que uses).
- Si se requiere probar la conexión manualmente:
  ```bash
  /opt/mssql-tools18/bin/sqlcmd -S localhost,1433 -U sa -P TuPasswordSegura -C
  ```
- La aplicación usará estos datos automáticamente a través del módulo `lib/db.js`.

## Ejecución
```bash
pnpm dev
```
Abrir [http://localhost:3000](http://localhost:3000) y navegar a **Reportes** para ejecutar el stored procedure y revisar las evidencias de las consignas.

