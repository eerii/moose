const pg = require('pg')

const connect = async () => {
  const config = {
    database: process.env.DB_NAME,
    host: process.env.DB,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
  }

  const pool = new pg.Pool(config)

  const client = await pool.connect()
  console.log('Connected to database Successfully')

  return client
}

const connectMail = async () => {
  const config = {
    database: 'mail',
    host: process.env.DB,
    port: process.env.DB_PORT,
    user: process.env.MAILDB_USER,
    password: process.env.MAILDB_PASS,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
  }

  const pool = new pg.Pool(config)

  const client = await pool.connect()
  console.log('Connected to database Successfully')

  return client
}

module.exports = { connect, connectMail }
