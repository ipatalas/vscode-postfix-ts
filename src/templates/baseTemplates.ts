import * as ts from 'typescript'
import * as vsc from 'vscode'
import { IndentInfo, IPostfixTemplate } from '../template'
import { findClosestParent, isAssignmentBinaryExpression, isStringLiteral } from '../utils/typescript'

export abstract class BaseTemplate implements IPostfixTemplate {
  constructor(public readonly templateName: string) {}

  abstract buildCompletionItem(node: ts.Node, indentInfo?: IndentInfo): vsc.CompletionItem
  abstract canUse(node: ts.Node): boolean

  protected isSimpleExpression = (node: ts.Node) => ts.isExpressionStatement(node) && !isStringLiteral(node)
  protected isPropertyAccessExpression = (node: ts.Node) => ts.isPropertyAccessExpression(node)
  protected isElementAccessExpression = (node: ts.Node) => ts.isElementAccessExpression(node)
  protected isExpression = (node: ts.Node) => this.isSimpleExpression(node) || this.isPropertyAccessExpression(node) || this.isElementAccessExpression(node)
  protected isIdentifier = (node: ts.Node) => ts.isIdentifier(node) && !this.inTypeReference(node.parent)

  protected isUnaryExpression = (node: ts.Node) => ts.isPostfixUnaryExpression(node) || ts.isPrefixUnaryExpression(node)
  protected isCallExpression = (node: ts.Node) => ts.isCallExpression(node)
  protected isNewExpression = (node: ts.Node) => ts.isNewExpression(node)
  protected inFunctionArgument = (node: ts.Node) => ts.isCallExpression(node.parent) && node.parent.arguments.includes(node as ts.Expression)

  protected isObjectLiteral = (node: ts.Node) => {
    return ts.isBlock(node) && (node.statements.length === 0 || node.statements.some(x => ts.isLabeledStatement(x)))
  }

  protected isTypeNode = (node: ts.Node) => {
    if (ts.isTypeNode(node)) { // built-in types
      return true
    }

    // Custom types (including namespaces) are encapsulated in TypeReferenceNode
    return node.parent && this.inTypeReference(node.parent)
  }

  protected inAwaitedExpression = (node: ts.Node) => {
    if (this.isAnyFunction(node)) {
      return false
    }
    return node.kind === ts.SyntaxKind.AwaitExpression || (node.parent && this.inAwaitedExpression(node.parent))
  }

  protected inReturnStatement = (node: ts.Node) => {
    if (this.isAnyFunction(node)) {
      return false
    }
    return node.kind === ts.SyntaxKind.ReturnStatement || (node.parent && this.inReturnStatement(node.parent))
  }

  protected inVariableDeclaration = (node: ts.Node) => {
    if (this.isAnyFunction(node)) {
      return false
    }

    return node.kind === ts.SyntaxKind.VariableDeclaration || node.parent && this.inVariableDeclaration(node.parent)
  }

  protected isBinaryExpression = (node: ts.Node) => {
    if (ts.isBinaryExpression(node)) {
      return true
    }

    return ts.isParenthesizedExpression(node) && ts.isBinaryExpression(node.expression)
      || node.parent && this.isBinaryExpression(node.parent)
  }

  protected unwindBinaryExpression = (node: ts.Node, removeParens = true) => {
    let binaryExpression = removeParens && ts.isParenthesizedExpression(node) && ts.isBinaryExpression(node.expression)
      ? node.expression
      : findClosestParent(node, ts.SyntaxKind.BinaryExpression) as ts.BinaryExpression

    while (binaryExpression && ts.isBinaryExpression(binaryExpression.parent)) {
      binaryExpression = binaryExpression.parent
    }

    if (binaryExpression && !isAssignmentBinaryExpression(binaryExpression)) {
      return binaryExpression
    }

    return node
  }

  protected isAnyFunction = (node: ts.Node) => {
    return ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)
  }

  protected inAssignmentStatement = (node: ts.Node) => {
    if (this.isAnyFunction(node)) {
      return false
    }

    if (ts.isBinaryExpression(node)) {
      return isAssignmentBinaryExpression(node)
    }

    return node.parent && this.inAssignmentStatement(node.parent)
  }

  protected inIfStatement = (node: ts.Node, expressionNode?: ts.Node) => {
    if (ts.isIfStatement(node)) {
      return !expressionNode || node.expression === expressionNode
    }

    return node.parent && this.inIfStatement(node.parent, node)
  }

  protected inTypeReference = (node: ts.Node) => {
    if (ts.isTypeReferenceNode(node)) {
      return true
    }

    return node.parent && this.inTypeReference(node.parent)
  }
}

export abstract class BaseExpressionTemplate extends BaseTemplate {
  abstract override buildCompletionItem(node: ts.Node, indentInfo?: IndentInfo)

  canUse(node: ts.Node) {
    return !this.inIfStatement(node) && !this.isTypeNode(node) && !this.inAssignmentStatement(node) &&
      (this.isIdentifier(node) ||
        this.isExpression(node) ||
        this.isUnaryExpression(node) ||
        this.isBinaryExpression(node) ||
        this.isCallExpression(node))
  }
}
