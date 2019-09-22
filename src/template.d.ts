import * as vsc from 'vscode'
import * as ts from 'typescript'

export interface IPostfixTemplate {
  buildCompletionItem(node: ts.Node, position: vsc.Position, suffix: string): vsc.CompletionItem

  canUse(node: ts.Node): boolean
}