import { useMutation, gql } from '@apollo/client'

const deleteMutation = gql`
  mutation DeletePage($id: String!) {
    deletePage(id: $id) {
      _id
      ownerId
    }
  }
`

export default function useDeletePage() {
  const [deletePage, data] = useMutation(deleteMutation)

  const mutation = ({ page }) => {
    return deletePage({
      variables: { id: page._id },
      refetchQueries: ['CurrentUserPages', 'Graph'],
      optimisticResponse: {
        deletePage: {
          _id: page._id,
          __typename: 'Page',
          ownerId: page.owner?.id || page.ownerId,
        },
      },
    })
  }

  return { mutation, data }
}
