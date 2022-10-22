import { createServer } from '@graphql-yoga/node'
import typeDefs from '../../graphql/typeDefs'
import resolvers from '../../graphql/resolvers'
import { makeDb } from '../../database'
import { getSession } from '@auth0/nextjs-auth0'
import pusherPlugin, { pusher } from '../../utils/pusherPlugin'

const database = await makeDb()
const server = new createServer({
  schema: {
    typeDefs,
    resolvers,
  },
  endpoint: '/api/graphql',
  context: async (ctx) => {
    try {
      const db = database
      const session = await getSession(ctx.req, ctx.res)
      const user = session ? session.user : null
      return { ...ctx, db, pusher, user }
    } catch (e) {
      console.log(e)
    }
  },
  plugins: [pusherPlugin],
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default server
