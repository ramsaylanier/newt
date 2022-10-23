import React from 'react'
import { useQuery, gql } from '@apollo/client'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../shared/layout'
import {
  Box,
  Badge,
  Divider,
  Text,
  Flex,
  IconButton,
  Link,
  Spinner,
  Stack,
  useDisclosure,
} from '@chakra-ui/react'
import { SettingsIcon, LockIcon, UnlockIcon } from '@chakra-ui/icons'
import RouterLink from 'next/link'
import PageTitle from '../shared/pageTitle'
import PageLink from '../shared/pageLink'
import PageSettingsModal from '../shared/pageSettingsModal'
import ContentBlock from '../shared/contentBlock'
import { useAuth } from '../utils/authClient'

export const query = gql`
  query Page($filter: String!) {
    page(filter: $filter) {
      _id
      _key
      title
      content
      lastEdited
      private
      owner {
        id
        nickname
      }
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
      }
    }
  }
`

const Page = () => {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const [isLocked, setIsLocked] = React.useState(false)
  const router = useRouter()
  const { _key } = router.query
  const filter = `page._id == 'Pages/${_key}'`
  const { user } = useAuth()

  const { data, loading, error } = useQuery(query, {
    variables: { filter },
  })

  if (error) throw error

  const page = data?.page || null
  const toLinks = page?.edges
  const lastEdited = page?.lastEdited
    ? new Date(page.lastEdited).toLocaleString('en-GB')
    : ''

  const handleLock = () => setIsLocked(!isLocked)

  const isOwner = user && page ? page.owner.id === user.sub : false
  return (
    <div className="container">
      <Head>
        <title>Newt - {page?.title || 'loading'}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        {loading && (
          <Flex
            height="100%"
            width="100%"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner />
          </Flex>
        )}

        {page && (
          <Box p={{ base: 2, md: 4 }}>
            <Box mb="6">
              <Flex
                width="100%"
                alignItems="center"
                justifyContent="space-between"
              >
                <PageTitle title={page.title} isOwner={isOwner} />
                {isOwner && (
                  <Stack isInline spacing={4} align="center">
                    <IconButton icon={<SettingsIcon />} onClick={onOpen} />
                    <IconButton
                      icon={isLocked ? <LockIcon /> : <UnlockIcon />}
                      onClick={handleLock}
                    />
                    <PageSettingsModal
                      isOpen={isOpen}
                      onClose={onClose}
                      page={page}
                    />
                  </Stack>
                )}
              </Flex>
              {isOwner ? (
                <Badge
                  colorScheme={page.private ? 'orange' : 'green'}
                  variant="solid"
                >
                  {page.private ? 'Private' : 'Public'}
                </Badge>
              ) : (
                <RouterLink href="user/[userId]" as={`user/${page.owner.id}`}>
                  <Link>By: {page.owner.nickname}</Link>
                </RouterLink>
              )}
              <Text fontSize="sm">Last edited: {lastEdited}</Text>
              <ContentBlock page={page} key={page._id} isLocked={isLocked} />
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
