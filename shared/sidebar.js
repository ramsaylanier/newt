import React from 'react'
import PageList from './pageList'
import { Box, Flex, IconButton, Link } from '@chakra-ui/core'
import CreatePageAction from './createPageAction'
import { useRouter } from 'next/router'
import { useAuth } from '../utils/auth'
import RouteLink from 'next/link'

export default function Sidebar() {
  const router = useRouter()
  const { user } = useAuth()

  const handleClick = () => {
    router.push('/graph')
  }

  const authLink = user ? '/api/auth/logout' : '/api/auth/login'

  return (
    <Box
      position="relative"
      height="100%"
      backgroundColor="green.300"
      p="4"
      maxW={250}
    >
      {user ? (
        <React.Fragment>
          <Flex alignItem="center" justifyContent="space-between">
            <CreatePageAction buttonColor="green" />
            <IconButton icon="graph" onClick={handleClick} />
          </Flex>
          <Box overflow="auto">
            <PageList />
          </Box>

          <RouteLink href="/profile">
            <Link>profile</Link>
          </RouteLink>
        </React.Fragment>
      ) : (
        <Link href={authLink}>{'login'}</Link>
      )}
    </Box>
  )
}
