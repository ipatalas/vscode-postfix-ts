import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'
import * as vsc from 'vscode'
import _ = require('lodash')

export class VarTemplate extends BaseExpressionTemplate {
  constructor(private keyword: 'var' | 'let' | 'const') {
    super(keyword)
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const inferVarNameEnabled = vsc.workspace.getConfiguration('postfix', null).get<boolean>('inferVariableName')
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
    if (ts.isNewExpression(node)) {
      const buildVarName = (name: string) => name && _.lowerFirst(name)
      if (ts.isIdentifier(node.expression)) {
        return buildVarName(node.expression.text)
      } else if (ts.isPropertyAccessExpression(node.expression)) {
        return buildVarName(node.expression.name.text)
      }
    }

  }
}