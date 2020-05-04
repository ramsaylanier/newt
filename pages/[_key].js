import React from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../shared/layout'
import { Box, Divider, Text } from '@chakra-ui/core'
import PageTitle from '../shared/pageTitle'
import PageLink from '../shared/pageLink'
import ContentBlock from '../shared/contentBlock'

const query = gql`
  query Page($id: String!) {
    page(id: $id) {
      _id
      _key
      title
      content
      edges {
        _key
        blockKeys
        excerpt
        from {
          _id
          _key
          title
        }
        to {
          _id
          _key
          title
        }
      }
    }
  }
`

const Page = () => {
  const router = useRouter()
  const { _key } = router.query
  const skip = !_key
  const { data } = useQuery(query, {
    variables: { id: `Pages/${_key}` },
    skip,
  })

  const page = data?.page || null
  const toLinks = page?.edges?.filter((edge) => edge?.to?._key === _key) || []

  return (
    <div className="container">
      <Head>
        <title>Create</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        {page && (
          <Box p={4}>
            <Box mb="6">
              <PageTitle title={page.title} />
              <ContentBlock page={page} key={page._id} />
            </Box>

            <Divider color="gray.400" />

            <Box mt="6">
              <Text fontSize="xl">
                {toLinks.length ? 'Mentioned In' : 'Not mentioned anywhere'}
              </Text>
              {toLinks.map((link) => {
                return <PageLink key={link._key} link={link} />
              })}
            </Box>
          </Box>
        )}
      </Layout>
    </div>
  )
}

export default Page
