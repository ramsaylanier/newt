import React from 'react'
import { useQuery, gql } from '@apollo/client'
import { useAuth } from '../utils/authClient'
import { Input, InputGroup, InputLeftElement, List } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import PageListItem from './pageListItem'
import useSearchFilters from '../utils/useSearchFilters'
import usePusher from '../utils/usePusher'
import { query as PageQuery } from '../pages/[_key]'

export const query = gql`
  query CurrentUserPages($filters: [FilterInput], $offset: Int, $count: Int) {
    currentUser {
      id
      pages(filters: $filters, offset: $offset, count: $count) {
        _id
        _key
        title
        private
        owner {
          id
        }
      }
    }
  }
`

const PageList = () => {
  const [value, setValue] = React.useState('')
  const { user } = useAuth()

  usePusher('pageAdded', ({ client, data }) => {
    let { currentUser } = client.readQuery({ query, variables })
    currentUser.pages = [data, ...currentUser.pages]
    client.writeQuery({ query, variables, data: { currentUser } })
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

  const pages = data?.currentUser?.pages || []

  const handleChange = (e) => {
    setValue(e.target.value)
  }

  return (
    <List>
      <InputGroup mb="2">
        <InputLeftElement>
          <SearchIcon />
        </InputLeftElement>
        <Input variant="filled" value={value} onChange={handleChange} />
      </InputGroup>
      {pages.map((page) => {
        return <PageListItem key={page._key} page={page} />
      })}
    </List>
  )
}

export default PageList
