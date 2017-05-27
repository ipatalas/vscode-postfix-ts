import * as vsc from 'vscode'
import * as ts from 'typescript'

export interface IPostfixTemplate {
  buildCompletionItem(code: string, position: vsc.Position, node: ts.Node, suffix: string): vsc.CompletionItem

  canUse(node: ts.Node): boolean
}