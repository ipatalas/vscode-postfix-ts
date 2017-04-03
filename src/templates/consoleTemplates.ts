import * as ts from 'typescript'
import * as vsc from 'vscode'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseTemplate } from './baseTemplates'

export class ConsoleTemplate extends BaseTemplate {

    constructor(private level: 'log' | 'warn' | 'error') {
        super();
    }

    buildCompletionItem(code: string, position: vsc.Position, node: ts.Node) {
        code = node.parent.getText() + '.'

        let replacement = '{{expr}}'
        if (this.isBinaryExpression(node.parent)) {
            replacement = `(${replacement})`
        }

        return CompletionItemBuilder
            .create(this.level, code)
            .description(`console.${this.level}(expr)`)
            .replace(`console.${this.level}({{expr}})`, position)
            .build()
    }

    canUse(node: ts.Node) {
        return node.parent && (this.isSimpleExpression(node.parent) || this.isBinaryExpression(node.parent) || this.isCallExpression(node.parent))
    }
}

export const build = () => [
    new ConsoleTemplate('log'),
    new ConsoleTemplate('warn'),
    new ConsoleTemplate('error'),
]
