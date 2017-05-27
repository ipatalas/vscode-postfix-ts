import * as ts from 'typescript'
import * as vsc from 'vscode'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'

export class ConsoleTemplate extends BaseExpressionTemplate {

  constructor (private level: 'log' | 'warn' | 'error') {
    super()
  }

  buildCompletionItem (code: string, position: vsc.Position, node: ts.Node) {
    return CompletionItemBuilder
      .create(this.level, code)
      .description(`console.${this.level}(expr)`)
      .replace(`console.${this.level}({{expr}})`, position)
      .build()
  }

  isConsoleExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.Identifier && (node as ts.Identifier).text === 'console'

  canUse (node: ts.Node) {
    return super.canUse(node) && !this.isConsoleExpression(node)
  }
}

export const build = () => [
  new ConsoleTemplate('log'),
  new ConsoleTemplate('warn'),
  new ConsoleTemplate('error')
]
