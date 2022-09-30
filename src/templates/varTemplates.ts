import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'
import { getConfigValue, getPlaceholderWithOptions } from '../utils'
import { inferVarTemplateName } from '../utils/infer-names'
import { IndentInfo } from '../template'

export class VarTemplate extends BaseExpressionTemplate {
  constructor(private keyword: 'var' | 'let' | 'const') {
    super(keyword)
  }

  buildCompletionItem(node: ts.Node, indentInfo?: IndentInfo) {
    node = this.unwindBinaryExpression(node)

    const inferVarNameEnabled = getConfigValue<boolean>('inferVariableName')
    const suggestedVarNames = (inferVarNameEnabled ? inferVarTemplateName(node) : undefined) ?? ['name']

    return CompletionItemBuilder
      .create(this.keyword, node, indentInfo)
      .replace(`${this.keyword} ${getPlaceholderWithOptions(suggestedVarNames)} = {{expr}}$0`)
      .build()
  }

  override canUse(node: ts.Node) {
    return (super.canUse(node) || this.isNewExpression(node) || this.isObjectLiteral(node) || this.isStringLiteral(node))
      && !this.inReturnStatement(node)
      && !this.inFunctionArgument(node)
      && !this.inVariableDeclaration(node)
      && !this.inAssignmentStatement(node)
  }
}
