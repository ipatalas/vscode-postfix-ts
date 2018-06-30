import * as vsc from 'vscode'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'

export class CastTemplate extends BaseExpressionTemplate {

  constructor (private keyword: 'cast' | 'castas') {
    super()
  }

  buildCompletionItem (code: string, position: vsc.Position) {
    const completionitembuilder = CompletionItemBuilder.create(this.keyword, code)
    if (this.keyword === 'castas') {
      return completionitembuilder
        .description(`(expr as SomeType)`)
        .replace('({{expr}} as $1)$0', position, true)
        .build()
    }
    return completionitembuilder
      .description(`(<SomeType>expr)`)
      .replace('(<$1>{{expr}})$0', position, true)
      .build()
  }
}

export const build = () => [
  new CastTemplate('cast'),
  new CastTemplate('castas')
]
