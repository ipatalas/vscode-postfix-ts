import * as vsc from 'vscode'

export const getIndentCharacters = () => {
  if (vsc.window.activeTextEditor.options.insertSpaces) {
    return ' '.repeat(vsc.window.activeTextEditor.options.tabSize as number)
  } else {
    return '\t'
  }
}
