import * as vsc from 'vscode'
import * as ts from 'typescript'
import { IndentInfo } from './template'
import { AllSpaces, AllTabs } from './utils/multiline-expressions'

export const overrideTsxEnabled = { value: false }

export const getIndentCharacters = () => {
  if (vsc.window.activeTextEditor?.options.insertSpaces) {
    return ' '.repeat(vsc.window.activeTextEditor.options.tabSize as number)
  } else {
    return '\t'
  }
}

export const getConfigValue = <Type>(name: string): Type | undefined => {
  return vsc.workspace.getConfiguration('postfix', null).get<Type>(name)
}

export const getPlaceholderWithOptions = (options: string[] | undefined, placeholderNumber = 1) => {
  if (!options || options.length === 0) {
    return `\${${placeholderNumber}}`
  }

  if (options.length > 1) {
    return `\${${placeholderNumber}|${options.join(',')}|}`
  }

  return `\${${placeholderNumber}:${options[0]}}`
}

export function getNodeForReplacement(node: ts.Node) {
  if (ts.isTemplateSpan(node)) {
    return node.parent
  }

  if (ts.isPrefixUnaryExpression(node.parent) || ts.isPropertyAccessExpression(node.parent)) {
    return node.parent
  }

  if (ts.isQualifiedName(node.parent)) {
    const typeRef = ts.findAncestor(node, ts.isTypeReferenceNode)

    if (typeRef && ts.isQualifiedName(typeRef.typeName)) {
      return typeRef.typeName.left
    }

    return typeRef ?? node
  }

  return node
}

export function convertToScriptKind(document: vsc.TextDocument) {
  if (overrideTsxEnabled.value) {
    return ts.ScriptKind.TSX
  }
  switch (document.languageId) {
    case 'javascript':
      return ts.ScriptKind.JS
    case 'typescript':
      return ts.ScriptKind.TS
    case 'javascriptreact':
      return ts.ScriptKind.JSX
    case 'typescriptreact':
      return ts.ScriptKind.TSX
    default:
      return ts.ScriptKind.Unknown
  }
}

export function getIndentInfo(document: vsc.TextDocument, node: ts.Node): IndentInfo {
  const source = node.getSourceFile()
  const position = ts.getLineAndCharacterOfPosition(source, node.getStart(source))

  const line = document.lineAt(position.line)
  const whitespaces = line.text.substring(0, line.firstNonWhitespaceCharacterIndex)
  let indentSize = 0

  if (AllTabs.test(whitespaces)) {
    indentSize = whitespaces.length
  } else if (AllSpaces.test(whitespaces)) {
    indentSize = whitespaces.length / (vsc.window.activeTextEditor?.options.tabSize as number || 2)
  }

  return {
    indentSize,
    leadingWhitespace: whitespaces
  }
}
