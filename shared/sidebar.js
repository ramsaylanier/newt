import React from 'react'
import PageList from './pageList'
import { Box } from '@chakra-ui/core'
import CreatePageAction from './createPageAction'
import { useRouter } from 'next/router'

export default function Sidebar() {
  const router = useRouter()

  const onCreatePage = (createdPage) => {
    router.push('/[_key]', `/${createdPage._key}`)
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
      <CreatePageAction onCreate={onCreatePage} buttonColor="green" />
      <PageList />
    </Box>
  )
}
