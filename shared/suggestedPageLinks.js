import React from 'react'
import { Box, Text } from '@chakra-ui/core'
import SuggestedPageLink from './suggestedPageLink'

export default function SuggestedPageLinks(props) {
  const { suggestedPageLinks, editorState, setEditorState } = props

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
