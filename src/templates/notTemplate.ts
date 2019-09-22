import * as ts from 'typescript'
import * as vsc from 'vscode'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseTemplate } from './baseTemplates'
import { NOT_COMMAND } from '../notCommand'
import { invertExpression } from '../utils'

export class NotTemplate extends BaseTemplate {
  buildCompletionItem (code: string, position: vsc.Position, node: ts.Node, suffix: string) {
    let currentNode = this.getCurrentNode(node)

    code = currentNode.getText() + suffix

    let completionBuilder = CompletionItemBuilder
      .create('not', code)

    if (this.isBinaryExpression(currentNode)) {
      let expressions = this.getBinaryExpressions(currentNode)
      if (expressions.length > 1) {
        return completionBuilder
          .insertText('')
          .command({
            title: '',
            command: NOT_COMMAND,
            arguments: [position, suffix, ...expressions]
          })
          .description('!expr - [multiple options]')
          .build()
      }
    }

    let replacement = invertExpression(currentNode)
    return completionBuilder
      .description(replacement)
      .replace(replacement, position)
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
    let possibleExpressions = [node]

    do {
      this.isBinaryExpression(node.parent) && possibleExpressions.push(node.parent)

      node = node.parent
    } while (node.parent)

    return possibleExpressions
  }
}

export const build = () => new NotTemplate()
