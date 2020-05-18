import React from 'react'
import PageList from './pageList'
import { Box, Flex, IconButton, Link } from '@chakra-ui/core'
import CreatePageAction from './createPageAction'
import { useRouter } from 'next/router'
import { useAuth } from '../utils/auth'

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
      overflow="auto"
      p="4"
      maxW={250}
    >
      {user && (
        <Flex alignItem="center" justifyContent="space-between">
          <CreatePageAction buttonColor="green" />
          <IconButton icon="graph" onClick={handleClick} />
        </Flex>
      )}
      <PageList />

      <Link href={authLink}>{user ? 'logout' : 'login'}</Link>
    </Box>
  )
}
