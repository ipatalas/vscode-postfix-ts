import * as ts from "typescript"
import { IndentInfo } from "../template"
import { BaseTemplate } from "./baseTemplates"
import { CompletionItemBuilder } from "../completionItemBuilder"

export class CallTemplate extends BaseTemplate {
  constructor(private keyword: 'call') {
    super(keyword)
  }

  override buildCompletionItem(node: ts.Node, indentInfo?: IndentInfo) {
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
        // Support function expressions and arrow functions (but not method declarations)
        // Note: We can't use isAnyFunction() as it includes method declarations
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node))
  }
}
