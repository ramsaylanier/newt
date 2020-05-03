import React from 'react'
import { useRouter } from 'next/router'

import RouteLink from 'next/link'
import { Box, Text, Link } from '@chakra-ui/core'

export default function PageLink({ link }) {
  const router = useRouter()
  const { _key } = router.query

  const isToLink = link.to._key === _key
  const linkNode = isToLink ? link.from : link.to

  return (
    <Box p="2" my="4" bg="gray.100">
      <RouteLink href={'[_key]'} as={linkNode._key}>
        <Link fontSize="sm" bg="green.300" px="2" py="1">
          {linkNode.title}
        </Link>
      </RouteLink>
      {link.excerpt.map((e, i) => {
        return (
          <Text key={i} fontSize="md" mt="2">
            {e}
          </Text>
        )
      })}
    </Box>
  )
}
