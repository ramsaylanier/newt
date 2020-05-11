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

export const query = gql`
  query Page($filter: String!) {
    page(filter: $filter) {
      _id
      _key
      title
      content
      lastEdited
      edges {
        _id
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
  const { data, error } = useQuery(query, {
    variables: { filter: `page._id == 'Pages/${_key}'` },
    skip,
  })

  if (error) throw error

  const page = data?.page || null
  console.log(page)
  console.log(_key)
  const toLinks = page?.edges?.filter((edge) => edge?.to?._key === _key) || []
  console.log(toLinks)
  const lastEdited = page?.lastEdited
    ? new Date(page.lastEdited).toLocaleString('en-GB')
    : ''

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
              {lastEdited && (
                <Text fontSize="sm">Last edited: {lastEdited}</Text>
              )}
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
