import React from 'react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Link,
} from '@chakra-ui/react'

export default function ContentBlockHttpLink(props) {
  const { entityKey, children, contentState } = props
  const entity = contentState.getEntity(entityKey)
  return (
    <Popover usePortal>
      <PopoverTrigger>
        <Link href={entity.data.url} isExternal textDecoration="underline">
          {children}
        </Link>
      </PopoverTrigger>
      <PopoverContent zIndex={4} bg="white">
        <PopoverArrow />
        <PopoverBody>
          <Link href={entity.data.url} isExternal>
            {entity.data.url}
          </Link>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
