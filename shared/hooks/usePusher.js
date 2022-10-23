import React from 'react'
import Pusher from 'pusher-js'
import { useApolloClient } from '@apollo/client'

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY

const usePusher = (subscriptions) => {
  const client = useApolloClient()

  React.useEffect(() => {
    const pusher = new Pusher(pusherKey, {
      cluster: 'us2',
    })
    const channel =
      pusher.channel('subscription') || pusher.subscribe('subscription')

    subscriptions.forEach(([actionName, callback, deps = []]) => {
      channel.bind(
        actionName,
        function (data) {
          callback({ client, data: data.message })
        },
        [actionName, ...deps]
      )
    })

    return () => {
      return channel.unsubscribe('subscription')
    }
  }, [])
}

export default usePusher
