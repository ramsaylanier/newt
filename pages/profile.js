import React from 'react'
import Head from 'next/head'
import Layout from '../shared/layout'
import { Box, Link, Image } from '@chakra-ui/core'
import { useQuery } from '@apollo/react-hooks'
import PageTitle from '../shared/pageTitle'
import PageList from '../shared/pageList'
import gql from 'graphql-tag'

const query = gql`
  query UserQuery {
    currentUser {
      id
      name
      picture
      updated_at
    }
  }
`

const Home = () => {
  const { data } = useQuery(query)
  const user = data ? data.currentUser : null

  return (
    <div className="container">
      <Head>
        <title>Newt: Profile</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <Box display="flex" alignItems="center" p="4">
          {user && (
            <Image
              src={user?.picture}
              rounded="full"
              size="40px"
              border="0"
              mr="2"
            />
          )}
          <PageTitle title="Profile" />
          <Link href="/api/auth/logout">Logout</Link>
        </Box>

        <Box p="4">
          <PageList />
        </Box>
      </Layout>
    </div>
  )
}

export default Home
