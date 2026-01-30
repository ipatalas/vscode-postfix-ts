import * as ts from "typescript"
import { IndentInfo } from "../template"
import { BaseTemplate } from "./baseTemplates"
import { CompletionItemBuilder } from "../completionItemBuilder"

export class CallTemplate extends BaseTemplate {
  constructor(private keyword: 'call') {
    super(keyword)
  }

  override buildCompletionItem(node: ts.Node, indentInfo?: IndentInfo) {
    if (this.isFunctionExpression(node) || this.isArrowFunction(node)) {
      return CompletionItemBuilder.create(this.keyword, node.parent, indentInfo)
        .replace('({{expr}})$0')
        .build()
    }

    return CompletionItemBuilder.create(this.keyword, node, indentInfo)
      .replace('$0({{expr}})')
      .build()
  }

  override canUse(node: ts.Node) {
    return !this.inIfStatement(node) && !this.isTypeNode(node) &&
      (this.isIdentifier(node) ||
        this.isExpression(node) ||
        this.isNewExpression(node) ||
        this.isUnaryExpression(node) ||
        this.isBinaryExpression(node) ||
        this.isCallExpression(node) ||
        this.isFunctionExpression(node) ||
        this.isArrowFunction(node))
  }

  private isFunctionExpression(node: ts.Node) {
    return ts.isBlock(node) && ts.isFunctionDeclaration(node.parent)
  }

  private isArrowFunction(node: ts.Node) {
    return ts.isBlock(node) && ts.isArrowFunction(node.parent)
  }
}
