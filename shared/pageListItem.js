import React from 'react'
import RouteLink from 'next/link'
import { ListItem, Button, Link, Icon } from '@chakra-ui/core'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useDrag } from 'react-dnd'

const deleteMutation = gql`
  mutation DeletePage($id: String!) {
    deletePage(id: $id) {
      _id
      _key
      title
    }
  }
`
export default function PageListItem({ page }) {
  const [, drag] = useDrag({
    item: { page, type: 'Page' },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  })
  const [deletePage] = useMutation(deleteMutation)
  const handleDelete = (page) => {
    deletePage({ variables: { id: page._id } })
  }

  return (
    <ListItem
      key={page._key}
      p="2"
      mb="1"
      mr="0"
      backgroundColor="green.400"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      overflow="hidden"
      whiteSpace="nowrap"
      ref={drag}
    >
      <RouteLink href={'[_key]'} as={page._key}>
        <Link overflow="hidden" textOverflow="ellipsis" flex="1">
          {page.title}
        </Link>
      </RouteLink>
      <Button size="xs" onClick={() => handleDelete(page)}>
        <Icon name="delete" size="12px" />
      </Button>
    </ListItem>
  )
}
