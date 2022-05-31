import * as ts from 'typescript'
import * as vsc from 'vscode'
import * as _ from 'lodash'
import { getVariableNameFromCallExpresion } from 'const-name'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'
import { clipByLastIndex } from 'const-name/build/util'

export class VarTemplate extends BaseExpressionTemplate {
  constructor(private keyword: 'var' | 'let' | 'const') {
    super(keyword)
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    let varName: string

    const inferVariableName = vsc.workspace.getConfiguration('postfix', null).get<boolean>('inferVariableName')
    const expr = node.getText();
    varName = inferVariableName ?
      expr.startsWith('new') ?
        _.lowerFirst(
          clipByLastIndex(/(.+?)\(/.exec(expr)[1], [' ', '.'])
        )
        : getVariableNameFromCallExpresion(expr, {
          allowApi: true,
          location: { fileName: '', position: node.pos }
        })?.replace(/\$/g, '\\$')
      : undefined;

    if (!varName) {
      varName = 'name'
    }
    return CompletionItemBuilder
      .create(this.keyword, node, indentSize)
      .replace(`${this.keyword} \${1:${varName}} = {{expr}}$0`, true)
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
