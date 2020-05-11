import React from 'react'
import { Button } from '@chakra-ui/core'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { query as PageQuery } from '../pages/[_key]'
import { EditorState, SelectionState, Modifier } from 'draft-js'
import gql from 'graphql-tag'

const addMutation = gql`
  mutation CreatePage($title: String!) {
    createPage(title: $title) {
      _id
      _key
      title
    }
  }
`

export default function SuggestedPageLink(props) {
  const { entity, blockKey, editorState, setEditorState } = props
  let { start_pos, end_pos } = entity
  const [createPage] = useMutation(addMutation)
  const { data, loading } = useQuery(PageQuery, {
    variables: { filter: `page.title == '${entity.text}'` },
  })
  let page = data?.page || null
  const variantColor = page ? 'green' : 'blue'

  const handleClick = async () => {
    let contentState = editorState.getCurrentContent()
    let selectionState = editorState.getSelection()
    const block = contentState.getBlockForKey(blockKey)
    const existingEntity = block.getEntityAt(start_pos)
    if (!existingEntity) {
      if (!page) {
        page = await createPage({ variables: { title: entity.text } })
      }

      let updatedEditorState = EditorState.forceSelection(
        editorState,
        new SelectionState({
          anchorKey: blockKey,
          anchorOffset: start_pos,
          focusKey: blockKey,
          focusOffset: end_pos,
          isBackward: false,
        })
      )
      selectionState = updatedEditorState.getSelection()
      contentState = contentState.createEntity('PAGELINK', 'MUTABLE', {
        pageKey: page._key,
      })
      const entityKey = contentState.getLastCreatedEntityKey()
      contentState = Modifier.applyEntity(
        contentState,
        selectionState,
        entityKey
      )
      updatedEditorState = EditorState.push(updatedEditorState, contentState)
      setEditorState(updatedEditorState, selectionState, entityKey)
    }
  }

  return (
    <Button
      isLoading={loading}
      variant="solid"
      loadingText={entity.text}
      variantColor={variantColor}
      size="sm"
      mr="1"
      onClick={handleClick}
    >
      {entity.text}
    </Button>
  )
}
