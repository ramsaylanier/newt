let config
const isProd = process.env.NODE_ENV === 'production'

console.log('IS PROD', isProd)

if (isProd) {
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
} else {
  config = require('./dev.json')
}

console.log(config)

module.exports = config
