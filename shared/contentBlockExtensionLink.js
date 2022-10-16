import React from 'react'
import { EditorBlock } from 'draft-js'
import {
  Flex,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from '@chakra-ui/react'

export default function ContentBlockExtensionLink(props) {
  const { block } = props
  const label = block.getData().get('source')
  return (
    <Flex>
      <EditorBlock {...props} />
      <Popover usePortal placement="top">
        <PopoverTrigger>
          <Link href={label} ml="4" isExternal textDecoration="underline">
            source
          </Link>
        </PopoverTrigger>
        <PopoverContent zIndex={4} bg="white">
          <PopoverArrow />
          <PopoverBody>
            <Link href={label} isExternal>
              {label}
            </Link>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  )
}
