import { gql } from '@apollo/client'

export const createPageMutation = gql`
  mutation CreatePage($title: String!) {
    createPage(title: $title) {
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
