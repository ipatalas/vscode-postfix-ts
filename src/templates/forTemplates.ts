import * as ts from 'typescript'
import * as vsc from 'vscode'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseExpressionTemplate'
import { getIndentCharacters } from '../utils'

export class ForTemplate extends BaseExpressionTemplate {
	buildCompletionItem (code: string, position: vsc.Position) {
		return CompletionItemBuilder
			.create('for', code)
			.description('for (let i = 0; i < expr.Length; i++)')
			.replace(`for (let \${1:i} = 0; \${1} < \${2:{{expr}}}.length; \${1}++) {\n${getIndentCharacters()}\${0}\n}`, position, true)
			.build()
	}
}

export class ForOfTemplate extends BaseExpressionTemplate {
	buildCompletionItem (code: string, position: vsc.Position) {
		return CompletionItemBuilder
			.create('forof', code)
			.description('for (let item of expr)')
			.replace(`for (let \${1:item} of \${2:{{expr}}}) {\n${getIndentCharacters()}\${0}\n}`, position, true)
			.build()
	}
}

export const build = () => [
	new ForTemplate(),
	new ForOfTemplate()
]
