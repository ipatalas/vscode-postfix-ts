import * as ts from 'typescript'
import * as vsc from 'vscode'
import { IndentInfo, IPostfixTemplate } from '../template'
import { isAssignmentBinaryExpression, isStringLiteral } from '../utils/typescript'

export abstract class BaseTemplate implements IPostfixTemplate {
  constructor(public readonly templateName: string) {}

  abstract buildCompletionItem(node: ts.Node, indentInfo?: IndentInfo): vsc.CompletionItem
  abstract canUse(node: ts.Node): boolean

  protected isSimpleExpression = (node: ts.Node): boolean => ts.isExpressionStatement(node) && !isStringLiteral(node)
  protected isPropertyAccessExpression = (node: ts.Node): boolean => ts.isPropertyAccessExpression(node)
  protected isElementAccessExpression = (node: ts.Node): boolean => ts.isElementAccessExpression(node)
  protected isExpression = (node: ts.Node): boolean => this.isSimpleExpression(node) || this.isPropertyAccessExpression(node) || this.isElementAccessExpression(node)
  protected isIdentifier = (node: ts.Node): boolean => ts.isIdentifier(node) && !this.inTypeReference(node.parent)

  protected isUnaryExpression = (node: ts.Node): boolean => ts.isPostfixUnaryExpression(node) || ts.isPrefixUnaryExpression(node)
  protected isCallExpression = (node: ts.Node): boolean => ts.isCallExpression(node)
  protected isNewExpression = (node: ts.Node): boolean => ts.isNewExpression(node)
  protected inFunctionArgument = (node: ts.Node): boolean => ts.isCallExpression(node.parent) && node.parent.arguments.includes(node as ts.Expression)

  protected isObjectLiteral = (node: ts.Node): boolean => {
    return ts.isBlock(node) && (node.statements.length === 0 || node.statements.some(x => ts.isLabeledStatement(x)))
  }

  protected isTypeNode = (node: ts.Node): boolean => {
    if (ts.isTypeNode(node)) { // built-in types
      return true
    }

    // Custom types (including namespaces) are encapsulated in TypeReferenceNode
    return node.parent && this.inTypeReference(node.parent)
  }

  protected inAwaitedExpression = (node: ts.Node): boolean => {
    if (this.isAnyFunction(node)) {
      return false
    }
    return node.kind === ts.SyntaxKind.AwaitExpression || (node.parent && this.inAwaitedExpression(node.parent))
  }

  protected inReturnStatement = (node: ts.Node): boolean => {
    if (this.isAnyFunction(node)) {
      return false
    }
    return node.kind === ts.SyntaxKind.ReturnStatement || (node.parent && this.inReturnStatement(node.parent))
  }

  protected inVariableDeclaration = (node: ts.Node): boolean => {
    if (this.isAnyFunction(node)) {
      return false
    }

    return node.kind === ts.SyntaxKind.VariableDeclaration || node.parent && this.inVariableDeclaration(node.parent)
  }

  protected isBinaryExpression = (node: ts.Node): boolean => {
    if (ts.isBinaryExpression(node) && !isAssignmentBinaryExpression(node)) {
      return true
    }

    return ts.isParenthesizedExpression(node) && ts.isBinaryExpression(node.expression)
      || node.parent && this.isBinaryExpression(node.parent)
  }

  protected unwindBinaryExpression = (node: ts.Node, removeParens = true): ts.Node => {
    let binaryExpression = removeParens && ts.isParenthesizedExpression(node) && ts.isBinaryExpression(node.expression)
      ? node.expression
      : ts.findAncestor(node, ts.isBinaryExpression)

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

  protected inAssignmentStatement = (node: ts.Node): boolean => {
    if (this.isAnyFunction(node)) {
      return false
    }

    if (ts.isBinaryExpression(node)) {
      return isAssignmentBinaryExpression(node)
    }

    return node.parent && this.inAssignmentStatement(node.parent)
  }

  protected inIfStatement = (node: ts.Node, expressionNode?: ts.Node): boolean => {
    if (ts.isIfStatement(node)) {
      return !expressionNode || node.expression === expressionNode
    }

    return node.parent && this.inIfStatement(node.parent, node)
  }

  protected inTypeReference = (node: ts.Node): boolean => {
    if (ts.isTypeReferenceNode(node)) {
      return true
    }

    return node.parent && this.inTypeReference(node.parent)
  }
}

export abstract class BaseExpressionTemplate extends BaseTemplate {
  canUse(node: ts.Node): boolean {
    return !this.inIfStatement(node) && !this.isTypeNode(node) && !this.inAssignmentStatement(node) &&
      (this.isIdentifier(node) ||
        this.isExpression(node) ||
        this.isUnaryExpression(node) ||
        this.isBinaryExpression(node) ||
        this.isCallExpression(node))
  }
}
