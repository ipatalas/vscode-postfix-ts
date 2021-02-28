import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseTemplate } from './baseTemplates'
import { NOT_COMMAND } from '../notCommand'
import { invertExpression } from '../utils/invert-expression'

export class NotTemplate extends BaseTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const currentNode = this.getCurrentNode(node)

    const completionBuilder = CompletionItemBuilder
      .create('not', currentNode, indentSize)

    if (this.isBinaryExpression(currentNode)) {
      const expressions = this.getBinaryExpressions(currentNode)
      if (expressions.length > 1) {
        return completionBuilder
          .insertText('')
          .command({
            title: '',
            command: NOT_COMMAND,
            arguments: expressions
          })
          .description('!expr - [multiple options]')
          .build()
      }
    }

    const replacement = invertExpression(currentNode, undefined, indentSize)
    return completionBuilder
      .description(replacement)
      .replace(replacement)
      .build()
  }

  canUse (node: ts.Node) {
    return this.isExpression(node)
        || this.isUnaryExpression(node)
        || this.isUnaryExpression(node.parent)
        || this.isBinaryExpression(node)
        || this.isCallExpression(node)
        || this.isIdentifier(node)
  }

  private getBinaryExpressions = (node: ts.Node) => {
    const possibleExpressions = [node]

    do {
      this.isBinaryExpression(node.parent) && possibleExpressions.push(node.parent)

      node = node.parent
    } while (node.parent)

    return possibleExpressions
  }
}

export const build = () => new NotTemplate()
