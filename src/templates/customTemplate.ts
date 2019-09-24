import * as ts from 'typescript'
import { BaseTemplate } from './baseTemplates'
import { CompletionItemBuilder } from '../completionItemBuilder'

export class CustomTemplate extends BaseTemplate {
  private conditionsMap = new Map<string, (node: ts.Node) => boolean>([
    ['identifier', (node: ts.Node) => this.isIdentifier(node)],
    ['expression', (node: ts.Node) => this.isExpression(node)],
    ['binary-expression', (node: ts.Node) => this.isBinaryExpression(node)],
    ['unary-expression', (node: ts.Node) => this.isUnaryExpression(node.parent)],
    ['new-expression', (node: ts.Node) => this.isNewExpression(node)],
    ['function-call', (node: ts.Node) => this.isCallExpression(node)]
  ])

  constructor (private name: string, private description: string, private body: string, private conditions: string[]) {
    super()
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    let currentNode = this.getCurrentNode(node)

    return CompletionItemBuilder
      .create(this.name, currentNode, indentSize)
      .description(this.description)
      .replace(this.body, true)
      .build()
  }

  canUse (node: ts.Node): boolean {
    return node.parent && (this.conditions.length === 0 || this.conditions.some(c => this.condition(node, c)))
  }

  condition = (node: ts.Node, condition: string) => {
    const callback = this.conditionsMap.get(condition)
    return callback && callback(node)
  }
}
