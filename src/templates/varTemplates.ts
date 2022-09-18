import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'
import { getConfigValue } from '../utils'
import { inferVarTemplateName } from '../utils/infer-names'

export class VarTemplate extends BaseExpressionTemplate {
  constructor(private keyword: 'var' | 'let' | 'const') {
    super(keyword)
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const inferVarNameEnabled = getConfigValue<boolean>('inferVariableName')
    const suggestedVarNames = (inferVarNameEnabled ? inferVarTemplateName(node) : undefined) ?? ['name']
    const nameSnippet = `\${1|${suggestedVarNames.join(',')}|}`

    return CompletionItemBuilder
      .create(this.keyword, node, indentSize)
      .replace(`${this.keyword} ${nameSnippet} = {{expr}}$0`)
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