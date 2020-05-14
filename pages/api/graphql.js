import { ApolloServer } from 'apollo-server-micro'
import typeDefs from '../../graphql/typeDefs'
import resolvers from '../../graphql/resolvers'
import makeDb from '../../database'
import Pusher from 'pusher'
import cfg from '../../config'

var pusher = new Pusher({
  appId: '1000613',
  key: cfg.pusher.key,
  secret: cfg.pusher.secret,
  cluster: 'us2',
  encrypted: true,
})

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async (ctx) => {
    const db = await makeDb()
    return { ...ctx, db, pusher }
  },
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default apolloServer.createHandler({ path: '/api/graphql' })
