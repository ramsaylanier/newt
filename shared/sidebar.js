import React from 'react'
import PageList from './pageList'
import { Box, Flex, IconButton } from '@chakra-ui/core'
import CreatePageAction from './createPageAction'
import { useRouter } from 'next/router'

export default function Sidebar() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/graph')
  }

  return (
    <Box
      position="relative"
      height="100%"
      backgroundColor="green.300"
      overflow="auto"
      p="4"
      maxW={250}
    >
      <Flex alignItem="center" justifyContent="space-between">
        <CreatePageAction buttonColor="green" />
        <IconButton icon="graph" onClick={handleClick} />
      </Flex>
      <PageList />
    </Box>
  )
}
