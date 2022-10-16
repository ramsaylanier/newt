import React from 'react'
import { Button } from '@chakra-ui/react'
import { useQuery, useMutation } from '@apollo/client'
import { query as PageQuery } from '../pages/[_key]'
import { EditorState, SelectionState, Modifier, convertToRaw } from 'draft-js'
import { updatePageMutation, createPageMutation } from '../graphql/mutations'
import { useRouter } from 'next/router'

export default function SuggestedPageLink(props) {
  const router = useRouter()
  const { _key } = router.query
  const { entity, blockKey, editorState, setEditorState } = props
  let { start_pos, end_pos } = entity
  const [createPage] = useMutation(createPageMutation)
  const [updatePageContent] = useMutation(updatePageMutation)
  const { data, loading } = useQuery(PageQuery, {
    variables: { filter: `page.title == '${entity.text}'` },
  })
  let page = data?.page || null
  const colorScheme = page ? 'green' : 'blue'

  const handleClick = async () => {
    let contentState = editorState.getCurrentContent()
    let selectionState = editorState.getSelection()
    const block = contentState.getBlockForKey(blockKey)
    const existingEntity = block.getEntityAt(start_pos)
    if (!existingEntity) {
      if (!page) {
        const { data, error } = await createPage({
          variables: { title: entity.text },
        })
        if (error) throw error
        page = data.createPage
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
      const content = convertToRaw(contentState)
      updatePageContent({
        variables: { id: _key, content },
      })
    }
  }

  return (
    <Button
      isLoading={loading}
      variant="solid"
      loadingText={entity.text}
      colorScheme={colorScheme}
      size="sm"
      mr="1"
      onClick={handleClick}
    >
      {entity.text}
    </Button>
  )
}
