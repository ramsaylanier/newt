import React from 'react'
import gql from 'graphql-tag'
import { Box, List, Text } from '@chakra-ui/core'
import { useMutation } from '@apollo/react-hooks'
import SuggestedPageLink from './suggestedPageLink'

const addMutation = gql`
  mutation CreatePage($title: String!) {
    createPage(title: $title) {
      _id
      _key
      title
    }
  }
`

export default function SuggestedPageLinks(props) {
  const { suggestedPageLinks, editorState, setEditorState } = props
  const [createPage] = useMutation(addMutation)
  // let updatedEditorState = editorState
  // let updatedSelectionState = editorState.getSelection()
  // let updatedContentState = editorState.getCurrentContent()
  // const pagesToCreate = []

  // entities.forEach((entity) => {
  //   console.log(entity)
  //   let contentBlock = null
  //   let charCount = 0
  //   let { end_pos, start_pos } = entity
  //   let entityKey = updatedContentState.getLastCreatedEntityKey()
  //   const blocks = updatedContentState.getBlocksAsArray()

  //   // find the content block for the suggested entity
  //   blocks.forEach((block) => {
  //     charCount = block.characterList.count()
  //     if (start_pos <= charCount && !contentBlock) {
  //       contentBlock = block
  //     } else if (!contentBlock) {
  //       start_pos -= charCount
  //       end_pos -= charCount
  //     }
  //   })

  //   const existingEntity = contentBlock.getEntityAt(start_pos)
  //   if (!existingEntity) {
  //     // select entity
  //     pagesToCreate.push(entity)
  //     updatedEditorState = EditorState.forceSelection(
  //       updatedEditorState,
  //       new SelectionState({
  //         anchorKey: updatedSelectionState.anchorKey,
  //         anchorOffset: start_pos,
  //         focusKey: updatedSelectionState.focusKey,
  //         focusOffset: end_pos,
  //         isBackward: false,
  //       })
  //     )
  //     updatedSelectionState = updatedEditorState.getSelection()
  //     updatedContentState = updatedContentState.createEntity(
  //       'PAGELINK',
  //       'MUTABLE',
  //       {
  //         pageKey: page._key,
  //       }
  //     )
  //     entityKey = updatedContentState.getLastCreatedEntityKey()
  //     updatedContentState = Modifier.applyEntity(
  //       updatedContentState,
  //       updatedSelectionState,
  //       entityKey
  //     )
  //     updatedEditorState = EditorState.push(
  //       updatedEditorState,
  //       updatedContentState
  //     )
  //     setEditorState(updatedEditorState, updatedSelectionState, entityKey)
  //   }
  // })

  // pagesToCreate.forEach((page) => {
  //   console.log(page)
  //   createPage({ variables: { title: page.text } })
  // })

  return (
    <Box py="2">
      {suggestedPageLinks.length > 0 && (
        <React.Fragment>
          <Text mb="1">Suggested Links</Text>
          {suggestedPageLinks.map((entity, index) => {
            const { blockKey, entityData } = entity
            return (
              <SuggestedPageLink
                key={`${entity.text}-${index}`}
                entity={entityData}
                blockKey={blockKey}
                editorState={editorState}
                setEditorState={setEditorState}
              />
            )
          })}
        </React.Fragment>
      )}
    </Box>
  )
}
