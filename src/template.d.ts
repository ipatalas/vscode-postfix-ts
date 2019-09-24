import * as vsc from 'vscode'
import * as ts from 'typescript'

export interface IPostfixTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number): vsc.CompletionItem

  canUse(node: ts.Node): boolean
}