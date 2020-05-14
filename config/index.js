let config

config = {
  database: {
    host: process.env.DATABASE_NAME,
    name: process.env.DATABASE_HOST,
  },
  graphql: {
    host: process.env.GRAPHQL_HOST,
  },
  pusher: {
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
  },
}

console.log('CONFIG', config)

module.exports = config
