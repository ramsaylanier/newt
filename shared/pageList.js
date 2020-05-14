import React from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import {
  Input,
  InputGroup,
  InputLeftElement,
  List,
  Icon,
} from '@chakra-ui/core'
import PageListItem from './pageListItem'
import usePusher from '../utils/usePusher'
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

const PageList = () => {
  const [value, setValue] = React.useState('')

  usePusher('pageAdded', ({ client, data }) => {
    let { pages } = client.readQuery({ query, variables })
    pages = [data, ...pages]
    client.writeQuery({ query, variables, data: { pages } })
  })

  usePusher('pageDeleted', ({ client, data }) => {
    let { pages } = client.readQuery({ query, variables })
    pages = pages.filter((p) => p._id !== data._id)
    client.writeQuery({ query, variables, data: { pages } })
  })

  usePusher('pageEdgeAdded', ({ client, data }) => {
    console.log(data)
    const toKey = data?.to?._key || null
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
  })

  const filters = value
    ? [{ filter: `LIKE(page.title, "%${value}%", true)` }]
    : []
  const variables = { filters }

  const { data, error } = useQuery(query, {
    variables,
  })

  if (error) throw error

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

export default PageList
