import React from 'react'
import NextApp from 'next/app'
import { ThemeProvider, ColorModeProvider } from '@chakra-ui/core'
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
      <ThemeProvider theme={theme}>
        <ColorModeProvider>
          <DndProvider backend={Backend}>
            <Component />
          </DndProvider>
        </ColorModeProvider>
      </ThemeProvider>
    )
  }
}

export default withApollo(App)
