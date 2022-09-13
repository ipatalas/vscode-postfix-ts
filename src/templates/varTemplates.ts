import * as ts from 'typescript'
import _ = require('lodash')
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'
import { getConfigValue } from '../utils'

export class VarTemplate extends BaseExpressionTemplate {
  private static MethodCallRegex = /^(get|read|create|retrieve|select|modify|update|use|find)(?<name>[A-Z].+?)(By.*)?$/

  constructor(private keyword: 'var' | 'let' | 'const') {
    super(keyword)
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const inferVarNameEnabled = getConfigValue<boolean>('inferVariableName')
    const suggestedVarName = inferVarNameEnabled ? this.inferVarName(node) : undefined;

    return CompletionItemBuilder
      .create(this.keyword, node, indentSize)
      .replace(`${this.keyword} \${1:${suggestedVarName ?? 'name'}} = {{expr}}$0`, true)
      .build()
  }

  override canUse(node: ts.Node) {
    return (super.canUse(node) || this.isNewExpression(node) || this.isObjectLiteral(node) || this.isStringLiteral(node))
      && !this.inReturnStatement(node)
      && !this.inFunctionArgument(node)
      && !this.inVariableDeclaration(node)
      && !this.inAssignmentStatement(node)
  }

  private inferVarName(node: ts.Node) {
    const buildVarName = (name: string) => name && _.lowerFirst(name)

    if (ts.isNewExpression(node)) {
      return buildVarName(this.inferNewExpressionVar(node))
    } else if (ts.isCallExpression(node)) {
      const methodName = this.getMethodName(node)
      const matches = VarTemplate.MethodCallRegex.exec(methodName)

      return buildVarName(matches?.groups?.name)
    }
  }

  private getMethodName(node: ts.CallExpression) {
    if (ts.isIdentifier(node.expression)) {
      return node.expression.text
    } else if (ts.isPropertyAccessExpression(node.expression)) {
      return node.expression.name.text
    }
  }

  private inferNewExpressionVar(node: ts.NewExpression) {
    if (ts.isIdentifier(node.expression)) {
      return node.expression.text
    } else if (ts.isPropertyAccessExpression(node.expression)) {
      return node.expression.name.text
    }
  }
}