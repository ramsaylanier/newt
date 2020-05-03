import { Modifier, EditorState, SelectionState } from 'draft-js'

export const addPageLink = (editorState, page) => {
  let entityKey, updatedSelectionState, updatedContentState
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()

  // reset selection end of focus
  let updatedEditorState = EditorState.forceSelection(
    editorState,
    new SelectionState({
      anchorKey: selection.anchorKey,
      anchorOffset: selection.focusOffset,
      focusKey: selection.anchorKey,
      focusOffset: selection.focusOffset,
      isBackward: false,
    })
  )

  updatedSelectionState = updatedEditorState.getSelection()
  entityKey = contentState.getLastCreatedEntityKey()

  const contentWithNewText = Modifier.insertText(
    contentState,
    updatedSelectionState,
    ` ${page.title} `
  )

  updatedSelectionState = new SelectionState({
    anchorKey: selection.anchorKey,
    anchorOffset: selection.focusOffset + 1,
    focusKey: selection.anchorKey,
    focusOffset: selection.focusOffset + page.title.length + 1,
    isBackward: false,
  })

  updatedEditorState = EditorState.forceSelection(
    updatedEditorState,
    updatedSelectionState
  )

  updatedContentState = contentWithNewText.createEntity('PAGELINK', 'MUTABLE', {
    pageKey: page._key,
  })

  entityKey = updatedContentState.getLastCreatedEntityKey()

  updatedContentState = Modifier.applyEntity(
    updatedContentState,
    updatedSelectionState,
    entityKey
  )

  updatedEditorState = EditorState.push(updatedEditorState, updatedContentState)

  return { updatedEditorState, entityKey }
}
