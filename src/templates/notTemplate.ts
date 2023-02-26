import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseTemplate } from './baseTemplates'
import { NOT_COMMAND } from '../notCommand'
import { invertExpression } from '../utils/invert-expression'
import { IndentInfo } from '../template'

export class NotTemplate extends BaseTemplate {
  buildCompletionItem(node: ts.Node, indentInfo?: IndentInfo) {
    node = this.normalizeBinaryExpression(node)

    const completionBuilder = CompletionItemBuilder
      .create('not', node, indentInfo)

    if (this.isBinaryExpression(node)) {
      const expressions = this.getBinaryExpressions(node)
      if (expressions.length > 1) {
        return completionBuilder
          .insertText('')
          .command({
            title: '',
            command: NOT_COMMAND,
            arguments: expressions
          })
          .description('`!expr` - *[multiple options]*')
          .build()
      }
    }

    const replacement = invertExpression(node, undefined)
    return completionBuilder
      .replace(replacement)
      .build()
  }

  canUse(node: ts.Node) {
    return !this.isTypeNode(node) &&
      (this.isExpression(node)
        || this.isUnaryExpression(node)
        || this.isUnaryExpression(node.parent)
        || this.isBinaryExpression(node)
        || this.isCallExpression(node)
        || this.isIdentifier(node))
  }

  private isStrictEqualityOrInstanceofBinaryEpxression = (node: ts.Node) => {
    return ts.isBinaryExpression(node) && [
      ts.SyntaxKind.EqualsEqualsEqualsToken,
      ts.SyntaxKind.ExclamationEqualsEqualsToken,
      ts.SyntaxKind.InstanceOfKeyword
    ].includes(node.operatorToken.kind)
  }

  private getBinaryExpressions = (node: ts.Node) => {
    const possibleExpressions = [node]

    do {
      this.isBinaryExpression(node.parent) && possibleExpressions.push(node.parent)

      node = node.parent
    } while (node.parent)

    return possibleExpressions
  }

  private normalizeBinaryExpression = (node: ts.Node) => {
    if (ts.isParenthesizedExpression(node.parent) && ts.isBinaryExpression(node.parent.expression)) {
      return node.parent
    }

    if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken) {
      return node
    }

    if (this.isStrictEqualityOrInstanceofBinaryEpxression(node.parent)) {
      return node.parent
    }

    return node
  }
}
