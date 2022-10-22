import React from 'react'
import Pusher from 'pusher-js'
import { useApolloClient } from '@apollo/client'

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY

const usePusher = (messageType, callback, deps = []) => {
  const client = useApolloClient()
  React.useEffect(() => {
    const pusher = new Pusher(pusherKey, {
      cluster: 'us2',
    })
    const channel = pusher.subscribe('subscription')
    channel.bind(
      messageType,
      function (data) {
        callback({ client, data: data.message })
      },
      [messageType]
    )

    return () => {
      return channel.unsubscribe('subscription')
    }
  }, deps)
}

export default usePusher
