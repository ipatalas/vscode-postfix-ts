import * as ts from 'typescript'
import { IPostfixTemplate } from '../template'

export abstract class BaseTemplate implements IPostfixTemplate {
  abstract buildCompletionItem(node: ts.Node, indentSize?: number)
  abstract canUse(node: ts.Node): boolean

  protected isSimpleExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.ExpressionStatement
  protected isPropertyAccessExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.PropertyAccessExpression
  protected isElementAccessExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.ElementAccessExpression
  protected isExpression = (node: ts.Node) => this.isSimpleExpression(node) || this.isPropertyAccessExpression(node) || this.isElementAccessExpression(node)
  protected isIdentifier = (node: ts.Node) => node.kind === ts.SyntaxKind.Identifier

  protected isUnaryExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.PostfixUnaryExpression || node.kind === ts.SyntaxKind.PrefixUnaryExpression
  protected isCallExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.CallExpression
  protected isNewExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.NewExpression
  protected inAssignmentStatement = (node: ts.Node) => node.parent && ts.isBinaryExpression(node.parent) && node.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
  protected inFunctionArgument = (node: ts.Node) => ts.isCallExpression(node.parent) && node.parent.arguments.includes(node as ts.Expression)

  protected isObjectLiteral = (node: ts.Node) => {
    return ts.isBlock(node) && (node.statements.length === 0 || node.statements.some(x => ts.isLabeledStatement(x)))
  }

  protected inAwaitedExpression = (node: ts.Node) => {
    if (ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
      return false
    }
    return node.kind === ts.SyntaxKind.AwaitExpression || (node.parent && this.inAwaitedExpression(node.parent))
  }

  protected inReturnStatement = (node: ts.Node) => {
    if (ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
      return false
    }
    return node.kind === ts.SyntaxKind.ReturnStatement || (node.parent && this.inReturnStatement(node.parent))
  }

  protected inVariableDeclaration = (node: ts.Node) => {
    if (ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
      return false
    }

    return node.kind === ts.SyntaxKind.VariableDeclaration || node.parent && this.inVariableDeclaration(node.parent)
  }

  protected isBinaryExpression = (node: ts.Node) => {
    if (ts.isBinaryExpression(node)) {
      return true
    }

    return ts.isParenthesizedExpression(node) && ts.isBinaryExpression(node.expression)
  }

  protected inIfStatement = (node: ts.Node, expressionNode?: ts.Node) => {
    if (ts.isIfStatement(node)) {
      return !expressionNode || node.expression === expressionNode
    }

    return node.parent && this.inIfStatement(node.parent, node)
  }

  protected getCurrentNode = (node: ts.Node) => {
    let currentNode = node

    if (ts.isPrefixUnaryExpression(currentNode.parent) || ts.isPropertyAccessExpression(currentNode.parent)) {
      currentNode = currentNode.parent
    }

    return currentNode
  }
}

export abstract class BaseExpressionTemplate extends BaseTemplate {
  abstract buildCompletionItem(node: ts.Node, indentSize?: number)

  canUse(node: ts.Node) {
    return !this.inIfStatement(node) &&
      (this.isIdentifier(node) ||
        this.isExpression(node) ||
        this.isUnaryExpression(node) ||
        this.isBinaryExpression(node) ||
        this.isCallExpression(node))
  }
}
