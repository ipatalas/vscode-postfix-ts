import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { IndentInfo } from '../template'
import { BaseTemplate } from './baseTemplates'

export class NewTemplate extends BaseTemplate {
  buildCompletionItem(node: ts.Node, indentInfo?: IndentInfo) {
    return CompletionItemBuilder
      .create('new', node, indentInfo)
      .replace('new {{expr}}($0)')
      .build()
  }

  canUse(node: ts.Node) {
    return (this.isIdentifier(node) || this.isPropertyAccessExpression(node))
      && !this.inAwaitedExpression(node.parent)
      && !this.isTypeNode(node)
      && !this.isBinaryExpression(node)
  }
}
