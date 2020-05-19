import React from 'react'
import Head from 'next/head'
import Layout from '../shared/layout'
import { Box } from '@chakra-ui/core'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

const query = gql`
  query UserQuery {
    user {
      id
      name
      picture
      updated_at
    }
  }
`

const Home = () => {
  const { data } = useQuery(query)
  const user = data ? data.user : null
  console.log(user)

  if (!user) return null

  return (
    <div className="container">
      <Head>
        <title>Newt: Profile</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <Box display="flex" alignItems="center" justifyContent="center"></Box>
      </Layout>
    </div>
  )
}

export default Home
