import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseTemplate } from './baseTemplates'

export class PromisifyTemplate extends BaseTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number) {
    return CompletionItemBuilder
      .create('promisify', node, indentSize)
      .replace('Promise<{{expr}}>')
      .build()
  }

  canUse (node: ts.Node) {
    return node.parent && this.isTypeNode(node)
  }
}