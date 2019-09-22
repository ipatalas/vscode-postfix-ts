import * as ts from 'typescript'
import * as vsc from 'vscode'
import { IPostfixTemplate } from '../template'

export abstract class BaseTemplate implements IPostfixTemplate {
  abstract buildCompletionItem(node: ts.Node, position: vsc.Position, suffix: string)
  abstract canUse (node: ts.Node): boolean

  protected isSimpleExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.ExpressionStatement
  protected isPropertyAccessExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.PropertyAccessExpression
  protected isElementAccessExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.ElementAccessExpression
  protected isExpression = (node: ts.Node) => this.isSimpleExpression(node) || this.isPropertyAccessExpression(node) || this.isElementAccessExpression(node)
  protected isIdentifier = (node: ts.Node) => node.kind === ts.SyntaxKind.Identifier

  protected isBinaryExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.BinaryExpression
  protected isUnaryExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.PostfixUnaryExpression || node.kind === ts.SyntaxKind.PrefixUnaryExpression
  protected isCallExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.CallExpression
  protected isNewExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.NewExpression
  protected inReturnStatement = (node: ts.Node) => node.kind === ts.SyntaxKind.ReturnStatement || (node.parent && this.inReturnStatement(node.parent))
  protected inIfStatement = (node: ts.Node) => node.kind === ts.SyntaxKind.IfStatement || (node.parent && this.inIfStatement(node.parent))

  protected getCurrentNode = (node: ts.Node) => {
    let currentNode = node

    if (ts.isPrefixUnaryExpression(currentNode.parent) || ts.isPropertyAccessExpression(currentNode.parent)) {
      currentNode = currentNode.parent
    }

    return currentNode
  }
}

export abstract class BaseExpressionTemplate extends BaseTemplate {
  abstract buildCompletionItem(node: ts.Node, position: vsc.Position)

  canUse (node: ts.Node) {
    return !this.inReturnStatement(node) &&
      !this.inIfStatement(node) &&
      (this.isIdentifier(node) ||
        this.isExpression(node) ||
        this.isUnaryExpression(node) ||
        this.isBinaryExpression(node) ||
        this.isCallExpression(node))
  }
}
