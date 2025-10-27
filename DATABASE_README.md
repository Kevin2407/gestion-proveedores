# Configuración de la Base de Datos SQL Server

Este proyecto utiliza **SQL Server** con consultas T-SQL nativas para la gestión de datos.

## 📋 Requisitos Previos

1. **SQL Server** instalado y en ejecución
2. **Base de datos SGP** creada (usar el script SQL proporcionado)
3. **Node.js** 18+ y **pnpm**

## 🔧 Configuración

### 1. Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_SERVER=localhost
DB_DATABASE=SGP
```

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Crear Base de Datos

Ejecutar el script SQL de creación de tablas en SQL Server Management Studio o Azure Data Studio.

## 🌐 Endpoints de la API

### Proveedores (`/api/providers`)
- **GET** - Obtener todos los proveedores
- **POST** - Crear nuevo proveedor
- **PUT** - Actualizar proveedor
- **DELETE** - Eliminar proveedor

### Contratos (`/api/contracts`)
- **GET** - Obtener todos los contratos
- **POST** - Crear nuevo contrato
- **PUT** - Actualizar contrato
- **DELETE** - Eliminar contrato

### Órdenes de Compra (`/api/orders`)
- **GET** - Obtener todas las órdenes
- **POST** - Crear nueva orden (con items) **[TRANSACCIÓN]**
- **PUT** - Actualizar orden
- **DELETE** - Eliminar orden (con items) **[TRANSACCIÓN]**

### Equipos Adquiridos (`/api/equipment`)
- **GET** - Obtener todos los equipos
- **POST** - Crear nuevo equipo
- **PUT** - Actualizar equipo
- **DELETE** - Eliminar equipo

### Técnicos Autorizados (`/api/technicians`)
- **GET** - Obtener todos los técnicos
- **POST** - Crear técnico (con contacto) **[TRANSACCIÓN]**
- **PUT** - Actualizar técnico (con contacto) **[TRANSACCIÓN]**
- **DELETE** - Eliminar técnico (con contacto) **[TRANSACCIÓN]**

### Calificaciones (`/api/ratings`)
- **GET** - Obtener todas las calificaciones
- **POST** - Crear nueva calificación
- **PUT** - Actualizar calificación
- **DELETE** - Eliminar calificación

### Incidencias (`/api/incidents`)
- **GET** - Obtener todas las incidencias
- **POST** - Crear nueva incidencia
- **PUT** - Actualizar incidencia
- **DELETE** - Eliminar incidencia

### Tipos de Equipo (`/api/equipment-types`)
- **GET** - Obtener todos los tipos
- **POST** - Crear nuevo tipo
- **PUT** - Actualizar tipo
- **DELETE** - Eliminar tipo

### Reportes Ejecutivos (`/api/reports`)
- **GET** - Obtener estadísticas completas del sistema

## 🔐 Ejemplos de Uso

### Crear un Proveedor

```javascript
const response = await fetch('/api/providers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'TechSupply Argentina',
    cuit: '30-71234567-8',
    fecha_alta: '2024-01-15'
  })
})

const { success, data } = await response.json()
```

### Crear Orden con Items (Transacción)

```javascript
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fecha_pedido: '2024-10-27',
    fecha_entrega: null,
    monto_total: 50000,
    estado: 'Pendiente',
    id_proveedor: 1,
    items: [
      {
        descripcion: 'Notebook HP',
        cantidad: 5,
        precio_unitario: 10000,
        subtotal: 50000,
        id_tipoequipo: 1
      }
    ]
  })
})
```

### Actualizar Proveedor

```javascript
const response = await fetch('/api/providers', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id_proveedor: 1,
    nombre: 'TechSupply Argentina SA',
    cuit: '30-71234567-8',
    fecha_alta: '2024-01-15'
  })
})
```

### Eliminar con Query Params

```javascript
const response = await fetch('/api/providers?id=1', {
  method: 'DELETE'
})
```

## 📊 Características Importantes

### Transacciones
- ✅ Órdenes de compra con items
- ✅ Técnicos con personas de contacto
- ✅ Eliminación en cascada

### Seguridad
- ✅ Consultas parametrizadas (previene SQL injection)
- ✅ Validación de tipos de datos
- ✅ Manejo de errores robusto

### Relaciones
- ✅ JOINs automáticos en consultas
- ✅ Datos relacionados en respuestas
- ✅ Integridad referencial

## 🚀 Ejecutar el Proyecto

```bash
# Modo desarrollo
pnpm dev

# Modo producción
pnpm build
pnpm start
```

## 🐛 Troubleshooting

### Error de conexión a SQL Server

1. Verificar que SQL Server esté en ejecución
2. Verificar credenciales en `.env.local`
3. Verificar que el puerto 1433 esté abierto
4. Para desarrollo local, usar `trustServerCertificate: true`

### Error de transacciones

Si una transacción falla, automáticamente hace rollback. Revisar logs en consola.

## 📝 Notas

- Todos los IDs se generan automáticamente usando `MAX(id) + 1`
- Las fechas deben enviarse en formato ISO: `YYYY-MM-DD`
- Los estados tienen valores predefinidos (CHECK constraints)
- Las consultas incluyen JOINs para obtener datos relacionados
