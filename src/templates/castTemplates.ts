import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { IndentInfo } from '../template'
import { BaseExpressionTemplate } from './baseTemplates'

export class CastTemplate extends BaseExpressionTemplate {
  constructor(private keyword: 'cast' | 'castas') {
    super(keyword)
  }

  buildCompletionItem(node: ts.Node, indentInfo?: IndentInfo) {
    const completionitembuilder = CompletionItemBuilder.create(this.keyword, node, indentInfo)

    if (this.keyword === 'castas') {
      return completionitembuilder
        .replace('({{expr}} as $1)$0')
        .build()
    }

    return completionitembuilder
      .replace('(<$1>{{expr}})$0')
      .build()
  }

  override canUse(node: ts.Node) {
    return !this.inIfStatement(node) && !this.isTypeNode(node) &&
      (this.isIdentifier(node) ||
        this.isExpression(node) ||
        this.isNewExpression(node) ||
        this.isUnaryExpression(node) ||
        this.isBinaryExpression(node) ||
        this.isCallExpression(node))
  }
}
