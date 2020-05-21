import React from 'react'
import Head from 'next/head'
import Layout from '../../shared/layout'
import { Box, Flex, Text, Spinner } from '@chakra-ui/core'
import PageListItem from '../../shared/pageListItem'
import { useQuery } from '@apollo/react-hooks'
import PageTitle from '../../shared/pageTitle'
import { useRouter } from 'next/router'
import gql from 'graphql-tag'

const query = gql`
  query UserQuery($userId: String!) {
    user(userId: $userId) {
      id
      name
      nickname
      pages {
        _id
        _key
        title
        owner {
          id
        }
      }
    }
  }
`

const UserProfile = () => {
  const router = useRouter()
  const { userId } = router.query
  const { data, loading } = useQuery(query, {
    variables: { userId },
    skip: !userId,
  })
  const user = data ? data.user : null
  const nickname = user?.nickname
  const pages = user?.pages || []

  return (
    <div className="container">
      <Head>
        <title>{`Newt: ${nickname || 'loading'} - Profile`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <Flex justifyContent="center">
          <Flex flexDirection="column" p="4" maxWidth="600px" width="100%">
            <PageTitle title={nickname} />

            <Box my="4">
              {loading ? (
                <Flex width="100%" alignItems="center" justifyContent="center">
                  <Spinner color="green" />
                </Flex>
              ) : (
                <React.Fragment>
                  <Text>Pages</Text>
                  {pages?.map((page) => {
                    return <PageListItem key={page.id} page={page} />
                  })}
                </React.Fragment>
              )}
            </Box>
          </Flex>
        </Flex>
      </Layout>
    </div>
  )
}

export default UserProfile
