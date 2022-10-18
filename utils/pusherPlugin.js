// https://www.the-guild.dev/graphql/envelop/docs/plugins

const pusherMap = {
  CreatePage: ({ pusher, result }) => {
    pusher &&
      pusher.trigger('subscription', 'pageAdded', {
        message: result?.data?.createPage,
      })
  },
  DeletePage: ({ pusher, result }) => {
    pusher &&
      pusher.trigger('subscription', 'pageDeleted', {
        message: result?.data.deletePage,
      })
  },
}

export default {
  onExecute({ args }) {
    const { operationName } = args
    const { pusher } = args.contextValue
    return {
      onExecuteDone({ result }) {
        if (pusherMap[operationName]) {
          pusherMap[operationName]({ pusher, result })
        }
      },
    }
  },
}
