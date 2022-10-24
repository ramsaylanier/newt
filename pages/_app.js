import React from 'react'
import NextApp from 'next/app'
import { Auth0Provider } from '../utils/authClient'
import { ChakraProvider } from '@chakra-ui/react'
import withApollo from '../graphql/apollo'
import theme from '../theme'
import '../normalize.css'
import '../typeplate.css'
import 'draft-js/dist/Draft.css'
import { DndProvider } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'

class App extends NextApp {
  render() {
    const { Component } = this.props
    return (
      <Auth0Provider>
        <ChakraProvider theme={theme} resetCSS={false}>
          <DndProvider backend={Backend}>
            <Component />
          </DndProvider>
        </ChakraProvider>
      </Auth0Provider>
    )
  }
}

export default withApollo(App)
