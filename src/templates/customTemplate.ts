import * as ts from 'typescript'
import { BaseTemplate } from './baseTemplates'
import { CompletionItemBuilder } from '../completionItemBuilder'

export class CustomTemplate extends BaseTemplate {
  private conditionsMap = new Map<string, (node: ts.Node) => boolean>([
    ['type', (node: ts.Node) => this.isTypeNode(node)],
    ['identifier', (node: ts.Node) => this.isIdentifier(node)],
    ['expression', (node: ts.Node) => this.isExpression(node)],
    ['binary-expression', (node: ts.Node) => this.isBinaryExpression(node)],
    ['unary-expression', (node: ts.Node) => this.isUnaryExpression(node.parent)],
    ['new-expression', (node: ts.Node) => this.isNewExpression(node)],
    ['function-call', (node: ts.Node) => this.isCallExpression(node)]
  ])

  constructor (name: string, private description: string, private body: string, private when: string[]) {
    super(name)
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const currentNode = this.getCurrentNode(node)

    return CompletionItemBuilder
      .create(this.templateName, currentNode, indentSize)
      .description(this.description)
      .replace(this.body, true)
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
