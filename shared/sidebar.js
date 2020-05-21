import React from 'react'
import PageList from './pageList'
import {
  Box,
  Flex,
  Spinner,
  Text,
  IconButton,
  Link,
  Image,
} from '@chakra-ui/core'
import CreatePageAction from './createPageAction'
import { useRouter } from 'next/router'
import { useAuth } from '../utils/authClient'
import RouteLink from 'next/link'

export default function Sidebar() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const handleClick = () => {
    router.push('/graph')
  }

  const authLink = user ? '/api/auth/logout' : '/api/auth/login'

  return (
    <Flex
      position="relative"
      height={{ base: 'auto', md: '100%' }}
      backgroundColor="green.300"
      p={{ base: '1', md: '4' }}
      width={{ base: '100%', md: '25vw' }}
      maxW={{ base: '100%', md: '250px' }}
      direction={{ base: 'row', md: 'column' }}
      justifyContent="space-between"
      alignItems={{ base: 'center', md: 'inherit' }}
    >
      {user ? (
        <React.Fragment>
          <Flex
            alignItem="center"
            justifyContent="space-between"
            direction="row"
          >
            <CreatePageAction buttonColor="green" />
            <IconButton
              icon="graph"
              onClick={handleClick}
              variantColor="green"
              ml="2"
            />
          </Flex>
          <Box
            overflow="auto"
            flex="1"
            display={{ base: 'none', md: 'block' }}
            mt="2"
          >
            <PageList />
          </Box>
          <Box py="2">
            <RouteLink href="/profile">
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
      ) : loading ? (
        <Spinner color="green" />
      ) : (
        <Link href={authLink}>{'login'}</Link>
      )}
    </Flex>
  )
}
