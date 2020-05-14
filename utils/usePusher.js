import React from 'react'
import Pusher from 'pusher-js'
import { useApolloClient } from '@apollo/react-hooks'

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
const pusher = new Pusher(pusherKey, {
  cluster: 'us2',
})
const channel = pusher.subscribe('subscription')

const usePusher = (messageType, callback) => {
  const client = useApolloClient()
  React.useEffect(() => {
    channel.bind(
      messageType,
      function ({ message }) {
        callback({ client, data: message })
      },
      [messageType]
    )

    return () => channel.unbind(messageType)
  }, [])
}

export default usePusher
