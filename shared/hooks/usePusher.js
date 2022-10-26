import React from 'react'
import Pusher from 'pusher-js'
import { useApolloClient } from '@apollo/client'

let socketId = null

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
const pusher = new Pusher(pusherKey, {
  cluster: 'us2',
})

pusher.connection.bind('connected', () => {
  socketId = pusher.connection.socket_id
})

const usePusher = (subscriptions) => {
  const client = useApolloClient()

  React.useEffect(() => {
    const channel =
      pusher.channel('subscription') || pusher.subscribe('subscription')

    subscriptions.forEach(([actionName, callback, deps = []]) => {
      channel.bind(
        actionName,
        function (data) {
          callback({ client, data: data.message })
        },
        [actionName, ...deps],
        socketId
      )
    })

    return () => {
      return channel.unsubscribe('subscription')
    }
  }, [])
}

export default usePusher
