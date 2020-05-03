import React from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import RouteLink from 'next/link'
import { List, ListItem, Button, Link, Icon } from '@chakra-ui/core'

const query = gql`
  query AllPages {
    pages {
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

export default function Sidebar() {
  const { data } = useQuery(query)

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

  return (
    <List>
      {pages.map((page) => {
        return (
          <ListItem
            key={page._key}
            p="2"
            mb="1"
            backgroundColor="green.400"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            overflow="hidden"
            whiteSpace="nowrap"
            maxWidth={200}
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
