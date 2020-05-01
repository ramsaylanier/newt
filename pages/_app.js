import React from "react";
import NextApp from "next/app";
import { ThemeProvider, CSSReset, ColorModeProvider } from "@chakra-ui/core";
import { ApolloProvider } from "@apollo/react-hooks";
import client from "../graphql/client";
import theme from "../theme";

class App extends NextApp {
  render() {
    const { Component } = this.props;
    return (
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <CSSReset />
          <ColorModeProvider>
            <Component />
          </ColorModeProvider>
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}

export default App;
