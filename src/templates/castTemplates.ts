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
        .description(`(expr as SomeType)`)
        .replace('({{expr}} as $1)$0', true)
        .build()
    }

    return completionitembuilder
      .description(`(<SomeType>expr)`)
      .replace('(<$1>{{expr}})$0', true)
      .build()
  }

  canUse (node: ts.Node) {
    return super.canUse(node) || this.isNewExpression(node)
  }
}

export const build = () => [
  new CastTemplate('cast'),
  new CastTemplate('castas')
]
