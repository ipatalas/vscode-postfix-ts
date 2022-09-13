import * as vsc from 'vscode'

export const getIndentCharacters = () => {
  if (vsc.window.activeTextEditor.options.insertSpaces) {
    return ' '.repeat(vsc.window.activeTextEditor.options.tabSize as number)
  } else {
    return '\t'
  }
}

export const getConfigValue = <Type>(name: string): Type | undefined => {
  return vsc.workspace.getConfiguration('postfix', null).get<Type>(name)
}