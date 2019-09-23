import { BaseTemplate } from './baseTemplates'
import { Position } from 'vscode'
import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'

export class CustomTemplate extends BaseTemplate {
  private conditionsMap = new Map<string, (node: ts.Node) => boolean>([
    ['identifier', (node: ts.Node) => this.isIdentifier(node)],
    ['expression', (node: ts.Node) => this.isExpression(node.parent)],
    ['binary-expression', (node: ts.Node) => this.isBinaryExpression(node.parent)],
    ['unary-expression', (node: ts.Node) => this.isUnaryExpression(node.parent)],
    ['new-expression', (node: ts.Node) => this.isNewExpression(node.parent)],
    ['function-call', (node: ts.Node) => this.isCallExpression(node.parent)]
  ])

  constructor (private name: string, private description: string, private body: string, private conditions: string[]) {
    super()
  }

  buildCompletionItem(node: ts.Node, position: Position, _suffix: string) {
    let currentNode = this.getCurrentNode(node)

    return CompletionItemBuilder
      .create(this.name, currentNode)
      .description(this.description)
      .replace(this.body, position, true)
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
