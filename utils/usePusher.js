import React from 'react'
import Pusher from 'pusher-js'
import { useApolloClient } from '@apollo/react-hooks'
import config from '../config'

var pusher = new Pusher(config.pusher.key, {
  cluster: 'us2',
})
var channel = pusher.subscribe('subscription')

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
