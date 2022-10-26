import { useQuery, gql } from '@apollo/client'

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

export default function useGetCurrentUser(queryProps) {
  const { data, error, loading, refetch } = useQuery(query, queryProps)

  return { data, error, loading, refetch }
}
