import { gql, useMutation } from '@apollo/client'
import { useAuth } from '../../utils/authClient'

export const createPageMutation = gql`
  mutation CreatePage($title: String!, $private: Boolean) {
    createPage(title: $title, private: $private) {
      _id
      _key
      title
      lastEdited
      private
      owner {
        id
        nickname
      }
    }
  }
`

export default function useCreatePage() {
  const [mutation, { data }] = useMutation(createPageMutation)
  const { user } = useAuth()

  const createPage = (mutationProps) => {
    return mutation({
      ...mutationProps,
      update: (cache, { data }) => {
        cache.modify({
          id: cache.identify({ __typename: 'User', id: user.sub }),
          fields: {
            pages: (cachedPages) => {
              return [data.createPage, ...cachedPages]
            },
          },
        })
      },
    })
  }

  return { createPage, data }
}
