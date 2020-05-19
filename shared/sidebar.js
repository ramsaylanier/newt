import React from 'react'
import PageList from './pageList'
import { Box, Flex, Text, IconButton, Link, Image } from '@chakra-ui/core'
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
    <Flex
      position="relative"
      height="100%"
      backgroundColor="green.300"
      p="4"
      maxW={250}
      direction="column"
    >
      {user ? (
        <React.Fragment>
          <Flex alignItem="center" justifyContent="space-between">
            <CreatePageAction buttonColor="green" />
            <IconButton icon="graph" onClick={handleClick} />
          </Flex>
          <Box overflow="auto" flex="1">
            <PageList />
          </Box>
          <Box py="2">
            <RouteLink href="/profile" alignSelf="flex-end">
              <Link display="flex" alignItems="center">
                <Image
                  src={user.picture}
                  rounded="full"
                  size="30px"
                  border="0"
                />
                <Text ml="2" mb="0">
                  Profile
                </Text>
              </Link>
            </RouteLink>
          </Box>
        </React.Fragment>
      ) : (
        <Link href={authLink}>{'login'}</Link>
      )}
    </Flex>
  )
}
