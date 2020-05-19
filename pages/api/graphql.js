import { ApolloServer } from 'apollo-server-micro'
import typeDefs from '../../graphql/typeDefs'
import resolvers from '../../graphql/resolvers'
import makeDb from '../../database'
import Pusher from 'pusher'
import auth0 from '../../utils/auth-server'

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
const pusherSecret = process.env.PUSHER_SECRET

var pusher = new Pusher({
  appId: '1000613',
  key: pusherKey,
  secret: pusherSecret,
  cluster: 'us2',
  encrypted: true,
})

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async (ctx) => {
    try {
      const db = await makeDb()
      const session = await auth0.getSession(ctx.req)
      const user = session ? session.user : null
      return { ...ctx, db, pusher, user }
    } catch (e) {
      console.log(e)
    }
  },
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default apolloServer.createHandler({ path: '/api/graphql' })
