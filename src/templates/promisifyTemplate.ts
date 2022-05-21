import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseTemplate } from './baseTemplates'

export class PromisifyTemplate extends BaseTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const currentNode = this.getCurrentNode(node)

    return CompletionItemBuilder
      .create('promisify', currentNode, indentSize)
      .description(`Promise<expr>`)
      .replace('Promise<{{expr}}>')
      .build()
  }

  canUse (node: ts.Node) {
    return node.parent && this.isTypeNode(node)
  }
}