import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseTemplate } from './baseTemplates'

export class NewTemplate extends BaseTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number) {
    return CompletionItemBuilder
      .create('new', node, indentSize)
      .description(`new expr()`)
      .replace('new {{expr}}($0)', true)
      .build()
  }

  canUse(node: ts.Node) {
    return (this.isIdentifier(node) || this.isPropertyAccessExpression(node))
      && !this.inAwaitedExpression(node.parent)
      && !this.isTypeNode(node)
  }
}

export const build = () => new NewTemplate()
