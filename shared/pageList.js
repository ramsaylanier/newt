import React from 'react'
import gql from 'graphql-tag'
import { useQuery, useSubscription } from '@apollo/react-hooks'
import {
  Input,
  InputGroup,
  InputLeftElement,
  List,
  Icon,
} from '@chakra-ui/core'
import PageListItem from './pageListItem'
import { query as PageQuery } from '../pages/[_key]'

export const query = gql`
  query AllPages($filters: [FilterInput], $offset: Int, $count: Int) {
    pages(filters: $filters, offset: $offset, count: $count) {
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

const pageEdgeAddedSubscription = gql`
  subscription onPageEdgeAdded {
    pageEdgeAdded {
      _id
      _key
      from {
        _id
        _key
        title
      }
      to {
        _id
        _key
        title
      }
      blockKeys
      excerpt
    }
  }
`

export default function PageList() {
  const [value, setValue] = React.useState('')
  const filters = value
    ? [{ filter: `LIKE(page.title, "%${value}%", true)` }]
    : []
  const variables = { filters }

  const { data } = useQuery(query, {
    variables,
  })

  useSubscription(addedSubscription, {
    onSubscriptionData: ({ client, subscriptionData: { data } }) => {
      if (data?.pageAdded) {
        const d = client.readQuery({ query, variables })
        d.pages.push(data.pageAdded)
        client.writeQuery({ query, variables: { filters }, data: d })
      }
    },
  })

  useSubscription(deletedSubscription, {
    onSubscriptionData: ({ client, subscriptionData: { data } }) => {
      if (data?.pageDeleted) {
        const d = client.readQuery({ query })
        d.pages = d.pages.filter((p) => p._id !== data.pageDeleted._id)
        client.writeQuery({ query, variables: { filters }, data: d })
      }
    },
  })

  useSubscription(pageEdgeAddedSubscription, {
    onSubscriptionData: ({ client, subscriptionData: { data } }) => {
      const toKey = data?.pageEdgeAdded?.to?._key || null
      if (toKey) {
        const filter = `page._id == 'Pages/${toKey}'`
        try {
          const result = client.readQuery({
            query: PageQuery,
            variables,
          })
          if (result) {
            const newEdge = { ...data.pageEdgeAdded, __typename: 'PageEdge' }
            result.page.edges.push(newEdge)
            client.writeQuery({
              query: PageQuery,
              variables: { ...variables, filter },
              data: result,
            })
          }
        } catch (e) {
          //
        }
      }
    },
  })

  const pages = data?.pages || []

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
        return <PageListItem key={page._key} page={page} />
      })}
    </List>
  )
}
