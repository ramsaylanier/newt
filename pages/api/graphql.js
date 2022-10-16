import { createServer } from '@graphql-yoga/node'
import typeDefs from '../../graphql/typeDefs'
import resolvers from '../../graphql/resolvers'
import makeDb from '../../database'
import Pusher from 'pusher'
import { getSession } from '@auth0/nextjs-auth0'

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
const pusherSecret = process.env.PUSHER_SECRET

var pusher = new Pusher({
  appId: '1000613',
  key: pusherKey,
  secret: pusherSecret,
  cluster: 'us2',
  encrypted: true,
})

const server = new createServer({
  schema: {
    typeDefs,
    resolvers,
  },
  endpoint: '/api/graphql',
  context: async (ctx) => {
    try {
      const db = await makeDb()
      const session = await getSession(ctx.req, ctx.res)
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

export default server
