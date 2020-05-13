const databaseName = process.env.DATABASE_NAME || 'newt'
const databaseHost = process.env.DATABASE_HOST || 'http://54.175.88.74:8529'

module.exports = {
  database: {
    host: databaseHost,
    name: databaseName,
  },
}
