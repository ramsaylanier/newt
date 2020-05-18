import React from 'react'
import NextApp from 'next/app'
import { Auth0Provider } from '../utils/auth'
import { ThemeProvider, ColorModeProvider } from '@chakra-ui/core'
import { withApollo } from '../graphql/apollo'
import theme from '../theme'
import '../normalize.css'
import '../typeplate.css'
import 'draft-js/dist/Draft.css'
import { DndProvider } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'
import config from '../auth_config.json'

class App extends NextApp {
  render() {
    // A function that routes the user to the right place
    // after login
    const onRedirectCallback = (appState) => {
      this.props.router.push(
        appState && appState.targetUrl
          ? appState.targetUrl
          : window.location.pathname
      )
    }

    const { Component } = this.props
    return (
      <Auth0Provider
        domain={config.domain}
        client_id={config.clientId}
        redirect_uri={config.redirectUri}
        onRedirectCallback={onRedirectCallback}
      >
        <ThemeProvider theme={theme}>
          <ColorModeProvider>
            <DndProvider backend={Backend}>
              <Component />
            </DndProvider>
          </ColorModeProvider>
        </ThemeProvider>
      </Auth0Provider>
    )
  }
}

export default withApollo(App)
