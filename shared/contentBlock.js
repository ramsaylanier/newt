import React from 'react'
import { useRouter } from 'next/router'
import { gql } from '@apollo/client'

import { Box } from '@chakra-ui/react'
import SuggestedPageLinks from './suggestedPageLinks'
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  getDefaultKeyBinding,
} from 'draft-js'
import ContentBlockControls from './contentBlockControls'

import { useAuth } from '../utils/authClient'
import { useDrop } from 'react-dnd'
import usePusher from '../shared/hooks/usePusher'
import useUpdatePageContent from './hooks/useUpdatePageContent'
import debounce from 'lodash/debounce'
import { getEntitiesFromText } from '../utils/adaptApi'
import { addPageLink, decorator, blockRendererFn } from '../utils/draftUtil'

const enableAdaptApi = process.env.NEXT_LOCAL_ENABLE_ADAPT_API

export default function ContentBlock({ page, isLocked }) {
  const router = useRouter()
  const { user } = useAuth()
  const { _key } = router.query
  const [editorState, setEditorState] = React.useState(null)
  const { updatePageContent } = useUpdatePageContent()
  const [suggestedPageLinks, setSuggestedPageLinks] = React.useState([])
  const editorRef = React.useRef(null)
  const previousContent = React.useRef(null)
  const isOwner = user && page ? user.sub === page.owner.id : false

  const [{ dropResult }, drop] = useDrop({
    accept: 'Page',
    drop: (item) => {
      return item
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      dropResult: monitor.getDropResult(),
    }),
  })

  React.useEffect(() => {
    if (dropResult) {
      const { page } = dropResult
      const { updatedEditorState, entityKey } = addPageLink(editorState, page)
      const selection = updatedEditorState.getSelection()
      setEditorState(updatedEditorState, selection, entityKey)
    }
  }, [dropResult])

  // hydrate editor state from store
  React.useEffect(() => {
    if (page?.content) {
      const content = convertFromRaw(page.content)
      setEditorState(EditorState.createWithContent(content, decorator))

      if (enableAdaptApi) {
        getPageLinkSuggestions(content)
      }
    } else {
      setEditorState(EditorState.createEmpty(decorator))
    }
  }, [])

  React.useEffect(() => {
    if (previousContent.current) {
      delayedSave(editorState)
    }
    if (editorState) {
      previousContent.current = editorState.getCurrentContent()
    }
  }, [editorState])

  usePusher([
    [
      'contentAddedFromLinker',
      ({ client, data }) => {
        client.writeFragment({
          id: data._id,
          fragment: gql`
            fragment updatedPage on Page {
              _id
              content
            }
          `,
          data: {
            id: data._id,
            content: data.content,
          },
        })

        if (data._key === _key) {
          const content = convertFromRaw(data.content)
          const updatedEditorState = EditorState.push(editorState, content)
          setEditorState(updatedEditorState)
        }
      },
      [_key],
    ],
  ])

  const delayedSave = React.useRef(
    debounce(async (editorState) => {
      let updatedContentState = editorState.getCurrentContent()
      let rawContent = convertToRaw(updatedContentState)

      updatePageContent({
        variables: { id: _key, content: rawContent },
      })

      if (enableAdaptApi) {
        getPageLinkSuggestions(updatedContentState)
      }
    }, 1000)
  ).current

  const getPageLinkSuggestions = async (contentState) => {
    const blocks = contentState.getBlockMap()
    let entities = []
    let promises = []

    blocks.forEach((block) => {
      const text = block.getText()
      const response = getEntitiesFromText(text, block.getKey())
      promises.push(response)
    })

    const results = await Promise.all(promises)
    results.forEach((result) => {
      const { blockKey, data } = result
      if (data && data[0]) {
        data[0].entities.forEach((e) => {
          entities.push({ blockKey, entityData: e })
        })
      }
    })
    setSuggestedPageLinks(entities)
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

  const keyBindingFn = (e) => {
    return getDefaultKeyBinding(e)
  }

  const handleKeyCommand = (command, editorState) => {
    const updatedEditorState = RichUtils.handleKeyCommand(editorState, command)
    if (updatedEditorState) {
      handleChange(updatedEditorState)
    }
  }

  if (!editorState) return null

  if (isOwner) {
    return (
      <Box fontSize=".9rem" ref={drop}>
        {!isLocked && (
          <Box bg="gray.100" position="relative" zIndex="2">
            <ContentBlockControls
              editorState={editorState}
              setEditorState={setEditorState}
              onToggle={handleToggle}
              onToggleStyles={handleToggleStyles}
            />
          </Box>
        )}

        <Box
          px={{ base: 2, md: 4 }}
          py={{ base: 4 }}
          bg="gray.100"
          position="relative"
          zIndex="1"
        >
          <Editor
            ref={editorRef}
            keyBindingFn={keyBindingFn}
            handleKeyCommand={handleKeyCommand}
            blockRendererFn={blockRendererFn}
            editorState={editorState}
            onChange={handleChange}
            placeholder="Enter some content..."
            spellCheck={true}
            readOnly={isLocked}
          />
        </Box>

        <SuggestedPageLinks
          suggestedPageLinks={suggestedPageLinks}
          editorState={editorState}
          setEditorState={setEditorState}
        />
      </Box>
    )
  } else {
    return (
      <Box fontSize=".9rem" ref={drop}>
        <Box px="4" py="8" bg="gray.100" position="relative" zIndex="1">
          <Editor
            ref={editorRef}
            keyBindingFn={keyBindingFn}
            handleKeyCommand={handleKeyCommand}
            blockRendererFn={blockRendererFn}
            editorState={editorState}
            spellCheck={true}
            readOnly={true}
          />
        </Box>
      </Box>
    )
  }
}
