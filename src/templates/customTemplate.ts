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
    ['function-call', (node: ts.Node) => this.isCallExpression(node.parent)]
  ])

  private currentNode: ts.Node

  constructor (private name: string, private description: string, private body: string, private conditions: string[]) {
    super()
  }

  buildCompletionItem (code: string, position: Position, node: ts.Node, suffix: string) {
    return CompletionItemBuilder
      .create(this.name, this.currentNode.getText() + '.')
      .description(this.description)
      .replace(this.body, position, true)
      .build()
  }

  canUse (node: ts.Node): boolean {
    this.currentNode = this.isIdentifier(node) ? node : node.parent

    return node.parent && (this.conditions.length === 0 || this.conditions.some(c => this.condition(node, c)))
  }

  condition = (node: ts.Node, condition: string) => {
    const callback = this.conditionsMap.get(condition)
    return callback && callback(node)
  }
}
