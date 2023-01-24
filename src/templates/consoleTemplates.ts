import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { IndentInfo } from '../template'
import { isStringLiteral } from '../utils/typescript'
import { BaseExpressionTemplate } from './baseTemplates'

export class ConsoleTemplate extends BaseExpressionTemplate {

  constructor(private level: 'log' | 'warn' | 'error') {
    super(level)
  }

  buildCompletionItem(node: ts.Node, indentInfo: IndentInfo) {
    node = this.unwindBinaryExpression(node)

    return CompletionItemBuilder
      .create(this.level, node, indentInfo)
      .replace(`console.${this.level}({{expr}})`)
      .build()
  }

  isConsoleExpression = (node: ts.Node) => ts.isIdentifier(node) && node.text === 'console'

  override canUse(node: ts.Node) {
    return (super.canUse(node) || this.isNewExpression(node) || this.isObjectLiteral(node) || isStringLiteral(node))
      && !this.inReturnStatement(node)
      && !this.isConsoleExpression(node)
      && !this.inFunctionArgument(node)
      && !this.inVariableDeclaration(node)
      && !this.inAssignmentStatement(node)
  }
}
