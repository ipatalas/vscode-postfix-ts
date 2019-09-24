import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'

export class VarTemplate extends BaseExpressionTemplate {
  constructor(private keyword: 'var' | 'let' | 'const') {
    super()
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    return CompletionItemBuilder
      .create(this.keyword, node, indentSize)
      .description(`${this.keyword} name = expr`)
      .replace(this.keyword + ' ${1:name} = {{expr}}$0', true)
      .build()
  }

  canUse(node: ts.Node) {
    return (super.canUse(node) || this.isNewExpression(node)) && !this.inFunctionArgument(node)
  }
}

export const build = () => [
  new VarTemplate('var'),
  new VarTemplate('let'),
  new VarTemplate('const')
]
