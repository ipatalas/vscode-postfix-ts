import * as ts from 'typescript'
import * as vsc from 'vscode'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'

export class ReturnTemplate extends BaseExpressionTemplate {
	buildCompletionItem (code: string, position: vsc.Position) {
		return CompletionItemBuilder
			.create('return', code)
			.description(`return expr`)
			.replace('return {{expr}}', position)
			.build()
	}
}

export const build = () => new ReturnTemplate()
