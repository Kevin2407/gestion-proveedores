import sql from 'mssql'

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, // Formato: IP:Puerto o solo IP (puerto por defecto 1433)
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false, // false para servidores locales/LAN, true para Azure
    trustServerCertificate: true, // true para desarrollo/LAN
    enableArithAbort: true,
    instanceName: '', // Dejar vacío si usas puerto específico
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  connectionTimeout: 30000, // 30 segundos timeout
  requestTimeout: 30000
}

let pool = null

export async function getConnection() {
  try {
    if (pool && pool.connected) {
      return pool
    }
    pool = await sql.connect(config)
    console.log('✅ Conectado a SQL Server exitosamente')
    return pool
  } catch (err) {
    console.error('❌ Error conectando a SQL Server:', err)
    throw err
  }
}

export async function closeConnection() {
  try {
    if (pool) {
      await pool.close()
      pool = null
      console.log('✅ Conexión a SQL Server cerrada')
    }
  } catch (err) {
    console.error('❌ Error cerrando conexión:', err)
    throw err
  }
}

export { sql }
