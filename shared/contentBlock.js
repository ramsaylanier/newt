import React from 'react'
import { useRouter } from 'next/router'

import { Box, IconButton } from '@chakra-ui/core'
import { Editor, EditorState, RichUtils, CompositeDecorator } from 'draft-js'
import ContentBlockStyleControls from './contentBlockStyleControls'
import ContentBlockPageLink from './contentBlockPageLink'

import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'

const mutation = gql`
  mutation DeletePageBlock($pageId: String!, $blockId: String!) {
    deletePageBlock(pageId: $pageId, blockId: $blockId) {
      _id
      blocks {
        id
        content
      }
    }
  }
`

const getPageLink = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    if (entityKey === null) {
      return false
    }
    const entity = contentState.getEntity(entityKey)
    return entity.type === 'PAGELINK'
  }, callback)
}

const decorator = new CompositeDecorator([
  {
    strategy: getPageLink,
    component: ContentBlockPageLink,
  },
])

export default function ContentBlock({ block }) {
  const [editorState, setEditorState] = React.useState(
    EditorState.createEmpty(decorator)
  )

  const editorRef = React.useRef(null)
  const router = useRouter()
  const { _key } = router.query
  const [deletePageBlock] = useMutation(mutation)

  const handleDelete = () => {
    deletePageBlock({
      variables: { pageId: `Pages/${_key}`, blockId: block.id },
    })
  }

  const handleChange = (state) => {
    setEditorState(state)
  }

  const handleToggle = (blockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType))
  }

  const handleToggleStyles = (inlineStyle) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle))
  }

  return (
    <Box p="1" bg="gray.100" mb="4">
      <Box display="flex" justifyContent="space-between" mb="4">
        <ContentBlockStyleControls
          editorState={editorState}
          setEditorState={setEditorState}
          onToggle={handleToggle}
          onToggleStyles={handleToggleStyles}
        />
        <IconButton icon="small-close" onClick={handleDelete} />
      </Box>

      <Box p="2">
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={handleChange}
          placeholder="Enter some content..."
          spellCheck={true}
        />
      </Box>

      <style global jsx>{`
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          text-rendering: optimizeLegibility;
          line-height: 1;
          margin-top: 0;
        }

        h1 {
          font-size: 4em;
          margin-bottom: 2.42424rem;
        }

        h2 {
          font-size: 3.33333em;
          margin-bottom: 2.0202rem;
        }

        h3 {
          font-size: 2.66667em;
          margin-bottom: 1.61616rem;
        }

        h4 {
          font-size: 2em;
          margin-bottom: 1.21212rem;
        }

        h5 {
          font-size: 1.33333em;
          margin-bottom: 0.80808rem;
        }

        p {
          margin: auto auto 1.5rem;
        }

        p + p {
          text-indent: 1.5rem;
          margin-top: -1.5rem;
        }
      `}</style>
    </Box>
  )
}
