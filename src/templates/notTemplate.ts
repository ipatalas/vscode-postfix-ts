import * as ts from 'typescript'
import * as vsc from 'vscode'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseTemplate } from './baseTemplates'
import { NOT_COMMAND } from '../notCommand'

export class NotTemplate extends BaseTemplate {
	buildCompletionItem (code: string, position: vsc.Position, node: ts.Node, suffix: string) {
		code = node.parent.getText() + suffix

		let completionBuilder = CompletionItemBuilder
			.create('not', code)
			.description('!expr')

		let replacement = '{{expr}}'
		if (this.isBinaryExpression(node.parent)) {
			replacement = `(${replacement})`

			let expressions = this.getBinaryExpressions(node.parent)
			if (expressions.length > 1) {
				return completionBuilder
					.insertText('')
					.command({
						title: '',
						command: NOT_COMMAND,
						arguments: [position, suffix, ...expressions]
					})
					.build()
			}
		}

		return completionBuilder
			.replace(`!${replacement}`, position)
			.build()
	}

	canUse (node: ts.Node) {
		return node.parent && (this.isSimpleExpression(node.parent) ||
			this.isPropertyAccessExpression(node.parent) ||
			this.isPostfixUnaryExpression(node.parent) ||
			this.isBinaryExpression(node.parent) ||
			this.isCallExpression(node.parent))
	}

	private getBinaryExpressions = (node: ts.Node) => {
		let possibleExpressions = [node]

		do {
			this.isBinaryExpression(node.parent) && possibleExpressions.push(node.parent)

			node = node.parent
		} while (node.parent)

		return possibleExpressions
	}
}

export const build = () => new NotTemplate()
