import { useMutation, gql } from '@apollo/client'

const updatePageSettingsMutation = gql`
  mutation UpdatePageSettings($id: String!, $update: GenericScalar) {
    updatePageSettings(id: $id, update: $update) {
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

export default function useUpdatePageSettings() {
  const [updatePageSettings] = useMutation(updatePageSettingsMutation)
  return { updatePageSettings }
}
