import React from 'react'
import Head from 'next/head'
import Layout from '../shared/layout'
import { Box, Text } from '@chakra-ui/core'

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Create</title>
        <link rel="icon" href="/favicon.ico" />
        <meta charset="utf-8" />
      </Head>

      <Layout>
        <Box
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="3rem">
            Create A Page or Select One From The Sidebar
          </Text>
        </Box>
      </Layout>
    </div>
  )
}
