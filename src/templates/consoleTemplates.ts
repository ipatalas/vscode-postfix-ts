import * as ts from 'typescript'
import * as vsc from 'vscode'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'

export class ConsoleTemplate extends BaseExpressionTemplate {

    constructor (private level: 'log' | 'warn' | 'error') {
        super()
    }

    buildCompletionItem (code: string, position: vsc.Position, node: ts.Node) {
        return CompletionItemBuilder
            .create(this.level, code)
            .description(`console.${this.level}(expr)`)
            .replace(`console.${this.level}({{expr}})`, position)
            .build()
    }
}

export const build = () => [
    new ConsoleTemplate('log'),
    new ConsoleTemplate('warn'),
    new ConsoleTemplate('error')
]
