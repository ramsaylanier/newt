import React from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../shared/layout'
import { Box, Divider, Text, Flex, IconButton } from '@chakra-ui/core'
import PageTitle from '../shared/pageTitle'
import PageLink from '../shared/pageLink'
import ContentBlock from '../shared/contentBlock'
import usePusher from '../utils/usePusher'
import { EditorState, convertFromRaw } from 'draft-js'
import { decorator } from '../utils/draftUtil'
import { useAuth } from '../utils/auth'

export const query = gql`
  query Page($filter: String!) {
    page(filter: $filter) {
      _id
      _key
      title
      content
      lastEdited
      ownerId
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
  const filter = `page._id == 'Pages/${_key}'`
  const { user } = useAuth()
  const [editorState, setEditorState] = React.useState(
    EditorState.createEmpty(decorator)
  )

  usePusher(
    'contentAddedFromLinker',
    ({ client, data }) => {
      client.writeFragment({
        id: data._id,
        fragment: gql`
          fragment updatedPage on Page {
            _id
            content
          }
        `,
        data: {
          id: data._id,
          content: data.content,
        },
      })

      if (data._key === _key) {
        const content = convertFromRaw(data.content)
        const updatedEditorState = EditorState.push(editorState, content)
        setEditorState(updatedEditorState)
      }
    },
    [_key]
  )

  const { data, loading, error, refetch } = useQuery(query, {
    variables: { filter },
  })

  if (error) throw error

  const page = data?.page || null
  const toLinks = page?.edges?.filter((edge) => edge?.to?._key === _key) || []
  const lastEdited = page?.lastEdited
    ? new Date(page.lastEdited).toLocaleString('en-GB')
    : ''

  const handleRefetch = () => refetch()

  if (loading) return 'Loading...'

  const isOwner = page.ownerId === user?.sub
  return (
    <div className="container">
      <Head>
        <title>Newt - {page?.title || 'loading'}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        {page && (
          <Box p={4}>
            <Box mb="6">
              <Flex
                width="100%"
                alignItems="center"
                justifyContent="space-between"
              >
                <PageTitle title={page.title} isOwner={isOwner} />
                {isOwner && (
                  <IconButton icon="repeat" onClick={handleRefetch} />
                )}
              </Flex>
              <Text fontSize="sm">Last edited: {lastEdited}</Text>
              <ContentBlock
                editorState={editorState}
                setEditorState={setEditorState}
                page={page}
                key={page._id}
              />
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
