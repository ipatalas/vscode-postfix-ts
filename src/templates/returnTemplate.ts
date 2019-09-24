import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'

export class ReturnTemplate extends BaseExpressionTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number) {
    return CompletionItemBuilder
      .create('return', node, indentSize)
      .description(`return expr`)
      .replace('return {{expr}}')
      .build()
  }

  canUse (node: ts.Node) {
    return super.canUse(node) || this.isNewExpression(node)
  }
}

export const build = () => new ReturnTemplate()
