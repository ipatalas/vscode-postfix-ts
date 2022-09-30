import * as vsc from 'vscode'
import * as ts from 'typescript'

export interface IPostfixTemplate {
  readonly templateName: string

  buildCompletionItem(node: ts.Node, indentInfo?: IndentInfo): vsc.CompletionItem

  canUse(node: ts.Node): boolean
}

export interface IndentInfo {
  indentSize?: number
  /** Leading whitespace characters of the first line of replacing node */
  leadingWhitespace?: string
}
