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

export default function PageList() {
  const [value, setValue] = React.useState('')
  const filters = value
    ? [{ filter: `LIKE(page.title, "%${value}%", true)` }]
    : []
  const { data } = useQuery(query, { variables: { filters } })

  useSubscription(addedSubscription, {
    onSubscriptionData: ({ client, subscriptionData: { data } }) => {
      if (data?.pageAdded) {
        const d = client.readQuery({ query, variables: { filters } })
        d.pages.push(data.pageAdded)
        client.writeQuery({ query, variables: { filters }, data: d })
      }
    },
  })

  useSubscription(deletedSubscription, {
    onSubscriptionData: ({ client, subscriptionData: { data } }) => {
      if (data?.pageDeleted) {
        const d = client.readQuery({ query, variables: { filters } })
        d.pages = d.pages.filter((p) => p._id !== data.pageDeleted._id)
        client.writeQuery({ query, variables: { filters }, data: d })
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
        return <PageListItem page={page} />
      })}
    </List>
  )
}
