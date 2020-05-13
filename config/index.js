const databaseName = process.env.DATABASE_NAME || 'newt'
const databaseHost = process.env.DATABASE_HOST || 'http://0.0.0.0:8529'

module.exports = {
  database: {
    host: databaseHost,
    name: databaseName,
  },
}
