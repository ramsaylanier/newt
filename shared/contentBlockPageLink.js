import React from 'react'
import RouteLink from 'next/link'
import { Link } from '@chakra-ui/react'

export default function ContentBlockPageLink(props) {
  const { entityKey, offsetKey, children } = props
  const entity = props.contentState.getEntity(entityKey)
  return (
    <RouteLink href={'[_key]'} as={entity?.data?.pageKey}>
      <Link
        overflow="hidden"
        textOverflow="ellipsis"
        flex="1"
        data-offset-key={offsetKey}
        bg="green.300"
      >
        {children}
      </Link>
    </RouteLink>
  )
}
