import gql from 'graphql-tag'

export const createPageMutation = gql`
  mutation CreatePage($title: String!) {
    createPage(title: $title) {
      _id
      _key
      title
    }
  }
`

export const updatePageMutation = gql`
  mutation UpdatePageContent($id: String!, $content: GenericScalar) {
    updatePageContent(id: $id, content: $content) {
      _id
      _key
      title
      content
      lastEdited
    }
  }
`
