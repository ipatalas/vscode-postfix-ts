import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'
import { getIndentCharacters } from '../utils'

export class IfTemplate extends BaseExpressionTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number) {
    return CompletionItemBuilder
      .create('if', node, indentSize)
      .description(`if (expr)`)
      .replace(`if ({{expr}}) {\n${getIndentCharacters()}\${0}\n}`, true)
      .build()
  }
}

export class ElseTemplate extends BaseExpressionTemplate {
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

export class IfEqualityTemplate extends BaseExpressionTemplate {
  constructor (private keyword: string, private operator: string, private operand: string) {
    super()
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    return CompletionItemBuilder
      .create(this.keyword, node, indentSize)
      .description(`if (expr ${this.operator} ${this.operand})`)
      .replace(`if ({{expr}} ${this.operator} ${this.operand}) {\n${getIndentCharacters()}\${0}\n}`, true)
      .build()
  }
}

export const build = () => [
  new IfTemplate(),
  new ElseTemplate(),
  new IfEqualityTemplate('null', '===', null),
  new IfEqualityTemplate('notnull', '!==', null),
  new IfEqualityTemplate('undefined', '===', undefined),
  new IfEqualityTemplate('notundefined', '!==', undefined)
]
