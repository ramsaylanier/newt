import { useMutation, gql } from '@apollo/client'

const updatePageMutation = gql`
  mutation UpdatePageContent($id: String!, $content: GenericScalar) {
    updatePageContent(id: $id, content: $content) {
      _id
      _key
      title
      content
      lastEdited
      private
      owner {
        id
        nickname
      }
      edges {
        _id
        _key
        blockKeys
        excerpt
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
      }
    }
  }
`

export default function useUpdatePageContent() {
  const [updatePageContent] = useMutation(updatePageMutation)
  return { updatePageContent }
}
