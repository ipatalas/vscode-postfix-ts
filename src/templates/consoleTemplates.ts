import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'

export class ConsoleTemplate extends BaseExpressionTemplate {

  constructor(private level: 'log' | 'warn' | 'error') {
    super()
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    return CompletionItemBuilder
      .create(this.level, node, indentSize)
      .description(`console.${this.level}(expr)`)
      .replace(`console.${this.level}({{expr}})`)
      .build()
  }

  isConsoleExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.Identifier && (node as ts.Identifier).text === 'console'

  canUse(node: ts.Node) {
    return (super.canUse(node) || this.isNewExpression(node))
      && !this.inReturnStatement(node)
      && !this.isConsoleExpression(node)
      && !this.inFunctionArgument(node)
      && !this.inVariableDeclaration(node)
      && !this.inAssignmentStatement(node)
  }
}

export const build = () => [
  new ConsoleTemplate('log'),
  new ConsoleTemplate('warn'),
  new ConsoleTemplate('error')
]
