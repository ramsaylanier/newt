// https://www.the-guild.dev/graphql/envelop/docs/plugins

const pusherAppId = process.env.NEXT_PUBLIC_PUSHER_APP_ID
const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
const pusherSecret = process.env.NEXT_PRIVATE_PUSHER_SECRET
import Pusher from 'pusher'

export const pusher = new Pusher({
  appId: pusherAppId,
  key: pusherKey,
  secret: pusherSecret,
  cluster: 'us2',
  useTLS: true,
})

const pusherMap = {
  CreatePage: ({ result }) => {
    pusher.trigger('subscription', 'pageAdded', {
      message: result?.data?.createPage,
    })
  },
  DeletePage: ({ result }) => {
    pusher.trigger('subscription', 'pageDeleted', {
      message: result?.data.deletePage,
    })
  },
}

export default {
  onExecute({ args }) {
    const { operationName } = args

    return {
      onExecuteDone({ result }) {
        if (pusherMap[operationName]) {
          pusherMap[operationName]({ result })
        }
      },
    }
  },
}
