import React from 'react'
import Head from 'next/head'
import Layout from '../shared/layout'
import { Box, Text } from '@chakra-ui/core'

const Home = () => {
  return (
    <div className="container">
      <Head>
        <title>Newt: Notes Worth Taking</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <Box display="flex" alignItems="center" justifyContent="center">
          <Box p="2" maxWidth="800px">
            <Text as="h3"> Welcome To Newt: Notes Worth Taking</Text>
            <Text as="h5">Newt lets you take connected notes.</Text>
            <Text>
              Start by creating a page! You can add page links by clicking the
              🔗 icon in the toolbar, and selecting a page you'd like to link.
              You can also drag pages from the left into the content block to
              create a page link. You can view a graph of all the connected
              notes by clicking the graph icon next to the Create Page button.
            </Text>
            <Text as="strong">
              Please be aware: this is a free public sandbox running on
              free-tier everything. Thing are likely broken. Also, be nice.
              There is zero tolerance for any of your shit.
            </Text>
          </Box>
        </Box>
      </Layout>
    </div>
  )
}

export default Home
