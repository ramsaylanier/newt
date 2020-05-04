import React from 'react'
import gql from 'graphql-tag'
import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import { Box } from '@chakra-ui/core'
import {
  Editor,
  EditorState,
  RichUtils,
  KeyBindingUtil,
  CompositeDecorator,
  convertToRaw,
  convertFromRaw,
  getDefaultKeyBinding,
} from 'draft-js'
import ContentBlockControls from './contentBlockControls'
import ContentBlockPageLink from './contentBlockPageLink'
import ContentBlockHttpLink from './contentBlockHttpLink'
import debounce from 'lodash/debounce'

const { hasCommandModifier } = KeyBindingUtil

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

const getHttpLink = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    if (entityKey === null) {
      return false
    }
    const entity = contentState.getEntity(entityKey)
    return entity.type === 'LINK'
  }, callback)
}

const decorator = new CompositeDecorator([
  {
    strategy: getPageLink,
    component: ContentBlockPageLink,
  },
  {
    strategy: getHttpLink,
    component: ContentBlockHttpLink,
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
  const editorRef = React.useRef(null)

  // hydrate editor state from store
  React.useEffect(() => {
    if (page?.content) {
      const content = convertFromRaw(page.content)
      setEditorState(EditorState.createWithContent(content, decorator))
    } else {
      setEditorState(EditorState.createEmpty(decorator))
    }
  }, [])

  const delayedSave = React.useRef(
    debounce((editorState) => {
      const content = convertToRaw(editorState.getCurrentContent())
      updatePageContent({ variables: { id: _key, content } })
    }, 1000)
  ).current

  const handleChange = (state) => {
    setEditorState(state)
    delayedSave(editorState)
  }

  const handleToggle = (blockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType))
  }

  const handleToggleStyles = (inlineStyle) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle))
  }

  const keyBindingFn = (e) => {
    return getDefaultKeyBinding(e)
  }

  const handleKeyCommand = (command) => {
    const updatedEditorState = RichUtils.handleKeyCommand(editorState, command)
    if (updatedEditorState) {
      handleChange(updatedEditorState)
    }
  }

  return (
    <Box fontSize=".9rem">
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
          keyBindingFn={keyBindingFn}
          handleKeyCommand={handleKeyCommand}
          editorState={editorState}
          onChange={handleChange}
          placeholder="Enter some content..."
          spellCheck={true}
        />
      </Box>
      <style global jsx>{`
        html {
          font-size: 90%;
        } /*16px*/

        body {
          background-color: white;
          font-weight: 400;
          line-height: 1.65;
          color: #333;
        }

        p {
          margin-bottom: 1.15rem;
        }

        h1,
        h2,
        h3,
        h4,
        h5 {
          margin: 2.75rem 0 1.05rem;
          font-weight: 400;
          line-height: 1.15;
        }

        h1 {
          margin-top: 0;
          font-size: 2.488em;
        }

        h2 {
          font-size: 2.074em;
        }

        h3 {
          font-size: 1.728em;
        }

        h4 {
          font-size: 1.44em;
        }

        h5 {
          font-size: 1.2em;
        }

        small,
        .text_small {
          font-size: 0.833em;
        }
      `}</style>
    </Box>
  )
}
