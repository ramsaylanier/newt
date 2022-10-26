import React from 'react'

import { useAuth } from '../utils/authClient'
import {
  Input,
  InputGroup,
  InputLeftElement,
  List,
  Spinner,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import PageListItem from './pageListItem'
import useSearchFilters from './hooks/useSearchFilters'
import usePusher from './hooks/usePusher'
import { query as PageQuery } from '../pages/[_key]'
import useGetCurrentUser, { query } from './hooks/useGetCurrentUser'

const PageList = () => {
  const [value, setValue] = React.useState('')
  const { user } = useAuth()
  const { filters, setFilters } = useSearchFilters()
  const variables = { filters }
  const { data, error, loading, refetch } = useGetCurrentUser({
    variables,
    skip: !user,
  })

  React.useEffect(() => {
    const filters = value
      ? [{ filter: `LIKE(page.title, "%${value}%", true)` }]
      : []

    setFilters(filters)
  }, [value])

  usePusher([
    [
      'pageAdded',
      ({ client, data }) => {
        console.log('added')
        if (!data.private && data.owner?.id !== user.sub) {
          let { currentUser } = client.readQuery({ query, variables })
          client.writeQuery({
            query,
            variables,
            data: {
              currentUser: {
                ...currentUser,
                pages: [data, ...currentUser.pages],
              },
            },
          })
        }
      },
    ],
    [
      'pageDeleted',
      () => {
        console.log('deleted')
        refetch()
      },
    ],
    [
      'pageEdgeAdded',
      ({ client, data }) => {
        const toKey = data?.to?._key || null
        if (toKey) {
          const filter = `page._id == 'Pages/${toKey}'`
          try {
            const { page } = client.readQuery({
              query: PageQuery,
              variables,
            })

            if (page) {
              client.writeQuery({
                query: PageQuery,
                variables: { ...variables, filter },
                data: {
                  page: {
                    ...page,
                    edges: [data, ...page.edges],
                  },
                },
              })
            }
          } catch (e) {
            console.log(e)
          }
        }
      },
    ],
  ])

  if (error) throw error
  if (loading) return <Spinner />

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
