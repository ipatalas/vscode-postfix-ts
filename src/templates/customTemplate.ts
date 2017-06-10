import { BaseTemplate } from './baseTemplates'
import { Position } from 'vscode'
import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'

export class CustomTemplate extends BaseTemplate {
  private conditionsMap = new Map<string, (node: ts.Node) => boolean>([
    ['expression', (node: ts.Node) => this.isExpression(node)],
    ['binary-expression', (node: ts.Node) => this.isBinaryExpression(node)],
    ['unary-expression', (node: ts.Node) => this.isUnaryExpression(node)],
    ['function-call', (node: ts.Node) => this.isCallExpression(node)]
  ])

  constructor (private name: string, private description: string, private body: string, private conditions: string[]) {
    super()
  }

  buildCompletionItem (code: string, position: Position, node: ts.Node, suffix: string) {
    return CompletionItemBuilder
      .create(this.name, code)
      .description(this.description)
      .replace(this.body, position, true)
      .build()
  }

  canUse (node: ts.Node): boolean {
    let result = node.parent != null

    return node.parent && (this.conditions.length === 0 || this.conditions.some(c => this.condition(node.parent, c)))
  }

  condition = (node: ts.Node, condition: string) => {
    const callback = this.conditionsMap.get(condition)
    return callback && callback(node)
  }
}
