import React from 'react'
import NextApp from 'next/app'
import { Auth0Provider } from '../utils/authClient'
import { ThemeProvider } from '@chakra-ui/core'
import { withApollo } from '../graphql/apollo'
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
        <ThemeProvider theme={theme}>
          <DndProvider backend={Backend}>
            <Component />
          </DndProvider>
        </ThemeProvider>
      </Auth0Provider>
    )
  }
}

export default withApollo(App)
