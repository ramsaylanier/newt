const databaseName = process.env.DATABASE_NAME || 'nkg'
const databaseHost = process.env.DATABASE_HOST || 'http://localhost:8529'

module.exports = {
  database: {
    host: databaseHost,
    name: databaseName,
  },
}
