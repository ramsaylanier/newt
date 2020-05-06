import React from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import RouteLink from 'next/link'
import {
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  Button,
  Link,
  Icon,
} from '@chakra-ui/core'

export const query = gql`
  query AllPages($filters: [FilterInput]) {
    pages(filters: $filters) {
      _id
      _key
      title
    }
  }
`

const addedSubscription = gql`
  subscription onPageAdded {
    pageAdded {
      _id
      _key
      title
    }
  }
`

const deletedSubscription = gql`
  subscription onPageDeleted {
    pageDeleted {
      _id
      _key
      title
    }
  }
`

const deleteMutation = gql`
  mutation DeletePage($id: String!) {
    deletePage(id: $id) {
      _id
      _key
      title
    }
  }
`

export default function PageList() {
  const [value, setValue] = React.useState('')
  const filters = value
    ? [{ filter: `LIKE(page.title, "%${value}%", true)` }]
    : []
  const { data } = useQuery(query, { variables: { filters } })

  useSubscription(addedSubscription, {
    onSubscriptionData: ({ client, subscriptionData: { data } }) => {
      if (data?.pageAdded) {
        const d = client.readQuery({ query })
        d.pages.push(data.pageAdded)
        client.writeQuery({ query, data: d })
      }
    },
  })

  useSubscription(deletedSubscription, {
    onSubscriptionData: ({ client, subscriptionData: { data } }) => {
      if (data?.pageDeleted) {
        const d = client.readQuery({ query })
        d.pages = d.pages.filter((p) => p._id !== data.pageDeleted._id)
        client.writeQuery({ query, data: d })
      }
    },
  })

  const [deletePage] = useMutation(deleteMutation)

  const pages = data?.pages || []

  const handleDelete = (page) => {
    deletePage({ variables: { id: page._id } })
  }

  const handleChange = (e) => {
    setValue(e.target.value)
  }

  return (
    <List>
      <InputGroup mb="2">
        <InputLeftElement>
          <Icon name="search" />
        </InputLeftElement>
        <Input variant="outlined" value={value} onChange={handleChange} />
      </InputGroup>
      {pages.map((page) => {
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
      })}
    </List>
  )
}
