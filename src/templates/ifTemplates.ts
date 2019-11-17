import * as ts from 'typescript'
import * as vsc from 'vscode'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'
import { getIndentCharacters } from '../utils'

abstract class BaseIfElseTemplate extends BaseExpressionTemplate {
  canUse(node: ts.Node) {
    return super.canUse(node)
      && !this.inReturnStatement(node)
      && !this.inFunctionArgument(node)
      && !this.inVariableDeclaration(node)
      && !this.inAssignmentStatement(node)
  }
}

export class IfTemplate extends BaseIfElseTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number) {
    return CompletionItemBuilder
      .create('if', node, indentSize)
      .description(`if (expr)`)
      .replace(`if ({{expr}}) {\n${getIndentCharacters()}\${0}\n}`, true)
      .build()
  }
}

export class ElseTemplate extends BaseIfElseTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number) {
    let replacement = '{{expr}}'
    if (ts.isBinaryExpression(node)) {
      replacement = `(${replacement})`
    }

    return CompletionItemBuilder
      .create('else', node, indentSize)
      .description(`if (!expr)`)
      .replace(`if (!${replacement}) {\n${getIndentCharacters()}\${0}\n}`, true)
      .build()
  }
}

export class IfEqualityTemplate extends BaseIfElseTemplate {
  constructor(private keyword: string, private operator: string, private operand: string, private isUndefinedTemplate?: boolean) {
    super()
  }

  canUse(node: ts.Node) {
    if (this.isUndefinedTemplate) {
      const config = vsc.workspace.getConfiguration('postfix', null)
      const value = config.get<string>('undefinedMode')
      if (value !== 'Equal') {
        return false
      }
    }

    return super.canUse(node)
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    return CompletionItemBuilder
      .create(this.keyword, node, indentSize)
      .description(`if (expr ${this.operator} ${this.operand})`)
      .replace(`if ({{expr}} ${this.operator} ${this.operand}) {\n${getIndentCharacters()}\${0}\n}`, true)
      .build()
  }
}

export class IfTypeofEqualityTemplate extends BaseIfElseTemplate {
  constructor(private keyword: string, private operator: string, private operand: string) {
    super()
  }

  canUse(node: ts.Node) {
    const config = vsc.workspace.getConfiguration('postfix', null)
    const value = config.get<string>('undefinedMode')
    if (value !== 'Typeof') {
      return false
    }

    return super.canUse(node)
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    return CompletionItemBuilder
      .create(this.keyword, node, indentSize)
      .description(`if (typeof expr ${this.operator} "${this.operand}")`)
      .replace(`if (typeof {{expr}} ${this.operator} "${this.operand}") {\n${getIndentCharacters()}\${0}\n}`, true)
      .build()
  }
}

export const build = () => [
  new IfTemplate(),
  new ElseTemplate(),
  new IfEqualityTemplate('null', '===', null),
  new IfEqualityTemplate('notnull', '!==', null),
  new IfEqualityTemplate('undefined', '===', undefined, true),
  new IfEqualityTemplate('notundefined', '!==', undefined, true),
  new IfTypeofEqualityTemplate('undefined', '===', undefined),
  new IfTypeofEqualityTemplate('notundefined', '!==', undefined)
]
