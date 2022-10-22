import React from 'react'
// import { useRouter } from 'next/router'

import RouteLink from 'next/link'
import { Box, Text, Link } from '@chakra-ui/react'

export default function PageLink({ link }) {
  return (
    <Box p="2" my="4" bg="gray.100">
      <RouteLink href={'[_key]'} as={link.from?._key}>
        <Link fontSize="sm" bg="green.300" px="2" py="1">
          {link.from?.title}
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
