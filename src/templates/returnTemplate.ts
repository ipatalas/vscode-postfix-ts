import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'

export class ReturnTemplate extends BaseExpressionTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number) {
    return CompletionItemBuilder
      .create('return', node, indentSize)
      .replace('return {{expr}}')
      .build()
  }

  override canUse (node: ts.Node) {
    return (super.canUse(node) || this.isNewExpression(node) || this.isObjectLiteral(node) || this.isStringLiteral(node))
      && !this.inReturnStatement(node)
      && !this.inFunctionArgument(node)
      && !this.inVariableDeclaration(node)
      && !this.inAssignmentStatement(node)
  }
}