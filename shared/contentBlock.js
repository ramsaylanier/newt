import React from 'react'
import gql from 'graphql-tag'
import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import { Box, Button } from '@chakra-ui/core'
import {
  Editor,
  EditorState,
  RichUtils,
  CompositeDecorator,
  convertToRaw,
  convertFromRaw,
} from 'draft-js'
import ContentBlockControls from './contentBlockControls'
import ContentBlockPageLink from './contentBlockPageLink'

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

const mutation = gql`
  mutation UpdatePageContent($id: String!, $content: GenericScalar) {
    updatePageContent(id: $id, content: $content) {
      _id
      _key
      title
      content
      edges {
        _key
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

export default function ContentBlock({ page }) {
  const router = useRouter()
  const { _key } = router.query
  const [updatePageContent] = useMutation(mutation)
  const [editorState, setEditorState] = React.useState(
    EditorState.createEmpty(decorator)
  )

  React.useEffect(() => {
    if (page?.content) {
      const content = convertFromRaw(page.content)
      setEditorState(EditorState.createWithContent(content, decorator))
    } else {
      setEditorState(EditorState.createEmpty(decorator))
    }
  }, [page])

  const editorRef = React.useRef(null)

  const handleChange = (state) => {
    setEditorState(state)
  }

  const handleToggle = (blockType) => {
    console.log(blockType)
    setEditorState(RichUtils.toggleBlockType(editorState, blockType))
  }

  const handleToggleStyles = (inlineStyle) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle))
  }

  const handleSave = () => {
    const content = convertToRaw(editorState.getCurrentContent())
    updatePageContent({ variables: { id: _key, content } })
  }

  return (
    <Box fontSize=".8rem">
      <Box bg="gray.100" position="relative" zIndex="2">
        <ContentBlockControls
          editorState={editorState}
          setEditorState={setEditorState}
          onToggle={handleToggle}
          onToggleStyles={handleToggleStyles}
        />
      </Box>

      <Box px="4" py="8" bg="gray.100" position="relative" zIndex="1">
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={handleChange}
          placeholder="Enter some content..."
          spellCheck={true}
        />
      </Box>
      <Button mt="4" variantColor="green" size="lg" onClick={handleSave}>
        Save
      </Button>

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
          font-size: 1.2em;
        }
      `}</style>
    </Box>
  )
}
