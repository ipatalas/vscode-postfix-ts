import * as ts from 'typescript'
import { BaseTemplate } from './baseTemplates'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { IndentInfo } from '../template'
import { isStringLiteral } from '../utils/typescript'

export class CustomTemplate extends BaseTemplate {
  private conditionsMap = new Map<string, (node: ts.Node) => boolean>([
    ['type', node => this.isTypeNode(node)],
    ['identifier', node => this.isIdentifier(node)],
    ['string-literal', node => isStringLiteral(node)],
    ['expression', node => this.isExpression(node)],
    ['binary-expression', node => this.isBinaryExpression(node)],
    ['unary-expression', node => this.isUnaryExpression(node.parent)],
    ['new-expression', node => this.isNewExpression(node)],
    ['function-call', node => this.isCallExpression(node)]
  ])

  constructor(name: string, private description: string, private body: string, private when: string[]) {
    super(name)
  }

  buildCompletionItem(node: ts.Node, indentInfo?: IndentInfo) {
    if (this.when.includes('binary-expression')) {
      node = this.unwindBinaryExpression(node)
    }

    return CompletionItemBuilder
      .create(this.templateName, node, indentInfo)
      .description(this.description)
      .replace(this.body)
      .build()
  }

  canUse(node: ts.Node): boolean {
    return node.parent && (this.when.length === 0 || this.when.some(w => this.condition(node, w)))
  }

  condition = (node: ts.Node, when: string) => {
    const callback = this.conditionsMap.get(when)
    return callback && callback(node)
  }
}
