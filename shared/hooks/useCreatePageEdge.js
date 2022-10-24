import { useMutation, gql } from '@apollo/client'

export const CreatePageEdge = gql`
  mutation createPageEdge($source: String!, $target: String!) {
    addPageLink(source: $source, target: $target) {
      _id
    }
  }
`

export default function useCreatePageLink() {
  const [mutation, { data }] = useMutation(CreatePageEdge)

  const createPageLink = (mutationProps) => {
    return mutation(mutationProps)
  }

  return { createPageLink, data }
}
