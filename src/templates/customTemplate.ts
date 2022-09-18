import * as ts from 'typescript'
import { BaseTemplate } from './baseTemplates'
import { CompletionItemBuilder } from '../completionItemBuilder'

export class CustomTemplate extends BaseTemplate {
  private conditionsMap = new Map<string, (node: ts.Node) => boolean>([
    ['type', node => this.isTypeNode(node)],
    ['identifier', node => this.isIdentifier(node)],
    ['string-literal', node => this.isStringLiteral(node)],
    ['expression', node => this.isExpression(node)],
    ['binary-expression', node => this.isBinaryExpression(node)],
    ['unary-expression', node => this.isUnaryExpression(node.parent)],
    ['new-expression', node => this.isNewExpression(node)],
    ['function-call', node => this.isCallExpression(node)]
  ])

  constructor (name: string, private description: string, private body: string, private when: string[]) {
    super(name)
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    return CompletionItemBuilder
      .create(this.templateName, node, indentSize)
      .description(this.description)
      .replace(this.body)
      .build()
  }

  canUse (node: ts.Node): boolean {
    return node.parent && (this.when.length === 0 || this.when.some(w => this.condition(node, w)))
  }

  condition = (node: ts.Node, when: string) => {
    const callback = this.conditionsMap.get(when)
    return callback && callback(node)
  }
}
