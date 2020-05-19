import React from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { useAuth } from '../utils/auth'
import {
  Input,
  InputGroup,
  InputLeftElement,
  List,
  Icon,
} from '@chakra-ui/core'
import PageListItem from './pageListItem'
import useSearchFilters from '../utils/useSearchFilters'
import usePusher from '../utils/usePusher'
import { query as PageQuery } from '../pages/[_key]'

export const query = gql`
  query UserPages($filters: [FilterInput], $offset: Int, $count: Int) {
    user {
      id
      pages(filters: $filters, offset: $offset, count: $count) {
        _id
        _key
        title
      }
    }
  }
`

const PageList = () => {
  const [value, setValue] = React.useState('')
  const { user } = useAuth()

  usePusher('pageAdded', ({ client, data }) => {
    let { user } = client.readQuery({ query, variables })
    user.pages = [data, ...user.pages]
    client.writeQuery({ query, variables, data: { user } })
  })

  usePusher('pageDeleted', () => {
    refetch()
  })

  usePusher('pageEdgeAdded', ({ client, data }) => {
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

  const { filters, setFilters } = useSearchFilters()

  React.useEffect(() => {
    const filters = value
      ? [{ filter: `LIKE(page.title, "%${value}%", true)` }]
      : []

    setFilters(filters)
  }, [value])

  const variables = { filters }

  const { data, error, refetch } = useQuery(query, {
    variables,
    skip: !user,
  })

  if (error) throw error

  const pages = data?.user?.pages || []

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
