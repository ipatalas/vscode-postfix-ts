import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'
import { getConfigValue, getIndentCharacters } from '../utils'

abstract class BaseIfElseTemplate extends BaseExpressionTemplate {
  override canUse(node: ts.Node) {
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
      .replace(`if ({{expr}}) {\n${getIndentCharacters()}\${0}\n}`)
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
      .replace(`if (!${replacement}) {\n${getIndentCharacters()}\${0}\n}`)
      .build()
  }
}

export class IfEqualityTemplate extends BaseIfElseTemplate {
  constructor(private keyword: string, private operator: string, private operand: string, private isUndefinedTemplate?: boolean) {
    super(keyword)
  }

  override canUse(node: ts.Node) {
    if (this.isUndefinedTemplate) {
      const value = getConfigValue<string>('undefinedMode')
      if (value !== 'Equal') {
        return false
      }
    }

    return super.canUse(node)
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    return CompletionItemBuilder
      .create(this.keyword, node, indentSize)
      .replace(`if ({{expr}} ${this.operator} ${this.operand}) {\n${getIndentCharacters()}\${0}\n}`)
      .build()
  }
}

export class IfTypeofEqualityTemplate extends BaseIfElseTemplate {
  constructor(private keyword: string, private operator: string, private operand: string) {
    super(keyword)
  }

  override canUse(node: ts.Node) {
    const value = getConfigValue<string>('undefinedMode')
    if (value !== 'Typeof') {
      return false
    }

    return super.canUse(node)
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    return CompletionItemBuilder
      .create(this.keyword, node, indentSize)
      .replace(`if (typeof {{expr}} ${this.operator} "${this.operand}") {\n${getIndentCharacters()}\${0}\n}`)
      .build()
  }
}