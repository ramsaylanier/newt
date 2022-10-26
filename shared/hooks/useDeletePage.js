import { useMutation, gql } from '@apollo/client'
import { useAuth } from '../../utils/authClient'

const deleteMutation = gql`
  mutation DeletePage($id: String!) {
    deletePage(id: $id) {
      _id
      ownerId
    }
  }
`

export default function useDeletePage() {
  const [mutation, { data }] = useMutation(deleteMutation)
  const { user } = useAuth()

  const deletePage = (mutationProps) => {
    return mutation({
      ...mutationProps,
      refetchQueries: ['CurrentUserPages', 'Graph'],
      update: (cache) => {
        cache.modify({
          id: cache.identify({ __typename: 'User', id: user.sub }),
          fields: {
            pages: (cachedPages) => {
              return cachedPages.filter(
                (p) => p._id !== mutationProps.variables.id
              )
            },
          },
        })
      },
    })
  }

  return { deletePage, data }
}
