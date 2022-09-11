import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'

export class CastTemplate extends BaseExpressionTemplate {
  constructor (private keyword: 'cast' | 'castas') {
    super(keyword)
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const completionitembuilder = CompletionItemBuilder.create(this.keyword, node, indentSize)

    if (this.keyword === 'castas') {
      return completionitembuilder
        .replace('({{expr}} as $1)$0', true)
        .build()
    }

    return completionitembuilder
      .replace('(<$1>{{expr}})$0', true)
      .build()
  }

  override canUse (node: ts.Node) {
    return super.canUse(node) || this.isNewExpression(node)
  }
}