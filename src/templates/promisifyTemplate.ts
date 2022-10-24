import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { IndentInfo } from '../template'
import { BaseTemplate } from './baseTemplates'

export class PromisifyTemplate extends BaseTemplate {
  buildCompletionItem(node: ts.Node, indentInfo?: IndentInfo) {
    return CompletionItemBuilder
      .create('promisify', node, indentInfo)
      .replace('Promise<{{expr}}>')
      .build()
  }

  canUse(node: ts.Node) {
    return node.parent && this.isTypeNode(node)
  }
}
