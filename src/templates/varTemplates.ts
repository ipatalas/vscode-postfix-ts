import * as ts from 'typescript'
import * as vsc from 'vscode'
import { getVariableNameFromCallExpresion } from 'const-name'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'

const getVarName = (node: ts.Node) => {
  const enableInferVariableName = vsc.workspace.getConfiguration('postfix', null).get<boolean>('inferVariableName')
  if (enableInferVariableName) {
    const inferred = getVariableNameFromCallExpresion(node.getText(), {
      allowApi: true,
    })?.replace(/\$/g, '\\$')
    if (inferred) {
      return inferred
    }
  }
  return 'name'
}

export class VarTemplate extends BaseExpressionTemplate {
  constructor(private keyword: 'var' | 'let' | 'const') {
    super(keyword)
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const name = getVarName(node)

    return CompletionItemBuilder
      .create(this.keyword, node, indentSize)
      .replace(`${this.keyword} \${1:${name}} = {{expr}}$0`, true)
      .build()
  }

  canUse(node: ts.Node) {
    return (super.canUse(node) || this.isNewExpression(node) || this.isObjectLiteral(node) || this.isStringLiteral(node))
      && !this.inReturnStatement(node)
      && !this.inFunctionArgument(node)
      && !this.inVariableDeclaration(node)
      && !this.inAssignmentStatement(node)
  }
}
