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

export const getPlaceholderWithOptions = (options: string[], placeholderNumber = 1) => {
  if (options.length > 1) {
    return `\${${placeholderNumber}|${options.join(',')}|}`
  }

  return `\${${placeholderNumber}:${options[0]}}`
}